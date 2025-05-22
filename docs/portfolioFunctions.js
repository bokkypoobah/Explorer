async function syncPortfolioAddress(validatedAddress, data, provider) {
  console.log(now() + " portfolioFunctions.js:syncPortfolioAddress - validatedAddress: " + validatedAddress + ", data.keys: " + Object.keys(data));

  const DEV = true;

  if (DEV || !('type' in data)) {
    // data.address = validatedAddress;
    try {
      const code = await provider.getCode(validatedAddress);
      data.type = code == "0x" ? "eoa" : "contract";
      // console.log(now() + " portfolioFunctions.js:syncPortfolioAddress - type: " + data.type);
    } catch (e) {
      console.error(now() + " portfolioFunctions.js:syncPortfolioAddress - provider.getCode: " + e.message);
    }
    try {
      data.ensName = await provider.lookupAddress(validatedAddress);
      // console.log(now() + " portfolioFunctions.js:syncPortfolioAddress - ensName: " + data.ensName);
    } catch (e) {
      console.error(now() + " portfolioFunctions.js:syncPortfolioAddress - provider.lookupAddress: " + e.message);
    }
  }

  data.previous = {
    balance: data.balance || null,
    transactionCount: data.transactionCount || null,
    blockNumber: data.blockNumber || null,
    timestamp: data.timestamp || null,
  };

  const block = await provider.getBlock("latest");
  data.blockNumber = block.number;
  data.timestamp = block.timestamp;

  try {
    data.balance = ethers.BigNumber.from(await provider.getBalance(validatedAddress)).toString();
    // console.log(now() + " portfolioFunctions.js:syncPortfolioAddress - balance: " + data.balance);
  } catch (e) {
    console.error(now() + " portfolioFunctions.js:syncPortfolioAddress - provider.getBalance: " + e.message);
  }

  try {
    data.transactionCount = await provider.getTransactionCount(validatedAddress);
    // console.log(now() + " portfolioFunctions.js:syncPortfolioAddress - transactionCount: " + data.transactionCount);
  } catch (e) {
    console.error(now() + " portfolioFunctions.js:syncPortfolioAddress - provider.getTransactionCount: " + e.message);
  }

  if ((data.balance != data.previous.balance) || (data.transactionCount != data.previous.transactionCount)) {
    // TODO: Scrape transactions and internal transactions from Etherscan API
  }
  // TODO: Scrape ERC-20, ERC-721 and ERC-1155 events
  // TODO: Scrape ENS events

  console.log(now() + " portfolioFunctions.js:syncPortfolioAddress - data: " + JSON.stringify(data, null, 2));
}

async function syncPortfolioAddressEvents(validatedAddress, data, provider, db, chainId) {

  async function processLogs(section, fromBlock, toBlock, logs) {
    console.log(moment().format("HH:mm:ss") + " portfolioFunctions.js:syncPortfolioAddressEvents.processLogs - section: " + section + ", fromBlock: " + fromBlock + ", toBlock: " + toBlock + ", logs.length: " + logs.length);
    const records = [];
    for (const log of logs) {
      if (!log.removed) {
        records.push({ chainId, ...log });
      }
    }
    console.log(moment().format("HH:mm:ss") + " portfolioFunctions.js:syncPortfolioAddressEvents.processLogs - records: " + JSON.stringify(records));
    console.log(moment().format("HH:mm:ss") + " portfolioFunctions.js:syncPortfolioAddressEvents.processLogs - records.length: " + records.length);
    if (records.length > 0) {
      await db.addressEvents.bulkAdd(records).then(function(lastKey) {
        console.log(moment().format("HH:mm:ss") + " portfolioFunctions.js:syncPortfolioAddressEvents.processLogs - bulkAdd lastKey: " + JSON.stringify(lastKey));
        }).catch(Dexie.BulkError, function(e) {
          console.log(moment().format("HH:mm:ss") + " portfolioFunctions.js:syncPortfolioAddressEvents.processLogs - bulkAdd e: " + JSON.stringify(e.failures, null, 2));
        });
    }
  }

  async function getLogsFromRange(section, fromBlock, toBlock) {
    console.log(moment().format("HH:mm:ss") + " portfolioFunctions.js:syncPortfolioAddressEvents.getLogsFromRange - section: " + section + ", fromBlock: " + fromBlock + ", toBlock: " + toBlock);
    // if (context.state.sync.halt) {
    //   return;
    // }
    try {
      const accountAs32Bytes = '0x000000000000000000000000' + validatedAddress.substring(2, 42).toLowerCase();
      console.log(moment().format("HH:mm:ss") + " portfolioFunctions.js:syncPortfolioAddressEvents.getLogsFromRange - accountAs32Bytes: " + accountAs32Bytes);
      const topics = [ null, null, null, null ];
      topics[parseInt(section) + 1] = accountAs32Bytes;
      // Transfer (index_topic_1 address from, index_topic_2 address to, index_topic_3 uint256 id)
      // [ '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef', accountAs32Bytes, null ],
      // [ '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef', accountAs32Bytes ],
      // [ '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef', null, accountAs32Bytes ],
      // ERC-1155 TransferSingle (index_topic_1 address _operator, index_topic_2 address _from, index_topic_3 address _to, uint256 _id, uint256 _value)
      // [ '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62', null, accountAs32Bytes, null ],
      // [ '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62', null, null, accountAs32Bytes ],
      // // ERC-1155 TransferBatch (index_topic_1 address operator, index_topic_2 address from, index_topic_3 address to, uint256[] ids, uint256[] values)
      // [ '0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb', null, accountAs32Bytes, null ],
      // [ '0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb', null, null, accountAs32Bytes ],

      const parameters = { address: null, fromBlock, toBlock, topics };
      console.log(moment().format("HH:mm:ss") + " portfolioFunctions.js:syncPortfolioAddressEvents.getLogsFromRange - parameters: " + JSON.stringify(parameters, null, 2));
      const logs = await provider.getLogs(parameters);
      // console.log(moment().format("HH:mm:ss") + " portfolioFunctions.js:syncPortfolioAddressEvents.getLogsFromRange - logs: " + JSON.stringify(logs, null, 2));
      await processLogs(section, fromBlock, toBlock, logs);
      // context.commit('setSyncCompleted', toBlock);
    } catch (e) {
      console.error(moment().format("HH:mm:ss") + " portfolioFunctions.js:syncPortfolioAddressEvents.getLogsFromRange - Error: " + e.message);
      const mid = parseInt((fromBlock + toBlock) / 2);
      await getLogsFromRange(section, fromBlock, mid);
      await getLogsFromRange(section, parseInt(mid) + 1, toBlock);
    }
  }

  console.log(now() + " portfolioFunctions.js:syncPortfolioAddressEvents - validatedAddress: " + validatedAddress + ", data.keys: " + Object.keys(data));
  const startBlock = 0;
  const endBlock = data.blockNumber;
  for (let section = 0; section < 3; section++) {
    await getLogsFromRange(section, startBlock, endBlock);
  }

  // console.log(now() + " portfolioFunctions.js:syncPortfolioAddressEvents - logs: " + JSON.stringify(logs, null, 2));
}

async function collatePortfolioAddress(validatedAddress, data, provider) {
  console.error(now() + " portfolioFunctions.js:collatePortfolioAddress - validatedAddress: " + validatedAddress + ", data keys: " + Object.keys(data));
}

async function collatePortfolioAddresses(validatedAddress, data, provider) {
  console.error(now() + " portfolioFunctions.js:collatePortfolioAddresses - validatedAddress: " + validatedAddress + ", data keys: " + Object.keys(data));
}
