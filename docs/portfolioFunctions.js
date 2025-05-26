async function syncPortfolioAddress(validatedAddress, data, provider, chainId) {
  console.log(now() + " portfolioFunctions.js:syncPortfolioAddress - validatedAddress: " + validatedAddress + ", data.keys: " + Object.keys(data));

  const DEV = true;
  // if (DEV) {
  //   data = {};
  // }
  // if (DEV || !('type' in data)) {
  //   // data.address = validatedAddress;
  //   try {
  //     const code = await provider.getCode(validatedAddress);
  //     data.type = code == "0x" ? "eoa" : "contract";
  //     // console.log(now() + " portfolioFunctions.js:syncPortfolioAddress - type: " + data.type);
  //   } catch (e) {
  //     console.error(now() + " portfolioFunctions.js:syncPortfolioAddress - provider.getCode: " + e.message);
  //   }
  // }
  if (chainId == 1) {
    try {
      data.ensName = await provider.lookupAddress(validatedAddress);
      // console.log(now() + " portfolioFunctions.js:syncPortfolioAddress - ensName: " + data.ensName);
    } catch (e) {
      console.error(now() + " portfolioFunctions.js:syncPortfolioAddress - provider.lookupAddress: " + e.message);
    }
  }
  if (!("chains" in data)) {
    data.chains = {};
  }
  if (!(chainId in data.chains)) {
    data.chains[chainId] = {};
  }
  data.chains[chainId].previous = {
    blockNumber: data.chains[chainId] && data.chains[chainId].blockNumber || null,
    timestamp: data.chains[chainId] && data.chains[chainId].timestamp || null,
    balance: data.chains[chainId] && data.chains[chainId].balance || null,
    transactionCount: data.chains[chainId] && data.chains[chainId].transactionCount || null,
    retrievedEventsBlockNumber: data.chains[chainId] && data.chains[chainId].retrievedEventsBlockNumber || null,
  };

  const block = await provider.getBlock("latest");
  data.chains[chainId].blockNumber = block.number;
  data.chains[chainId].timestamp = block.timestamp;
  try {
    data.chains[chainId].balance = ethers.BigNumber.from(await provider.getBalance(validatedAddress)).toString();
    // console.log(now() + " portfolioFunctions.js:syncPortfolioAddress - balance: " + data.balance);
  } catch (e) {
    console.error(now() + " portfolioFunctions.js:syncPortfolioAddress - provider.getBalance: " + e.message);
  }
  try {
    data.chains[chainId].transactionCount = await provider.getTransactionCount(validatedAddress);
    // console.log(now() + " portfolioFunctions.js:syncPortfolioAddress - transactionCount: " + data.transactionCount);
  } catch (e) {
    console.error(now() + " portfolioFunctions.js:syncPortfolioAddress - provider.getTransactionCount: " + e.message);
  }

  // if ((data.balance != data.previous.balance) || (data.transactionCount != data.previous.transactionCount)) {
  //   // TODO: Scrape transactions and internal transactions from Etherscan API
  // }
  // TODO: Scrape ENS events

  console.log(now() + " portfolioFunctions.js:syncPortfolioAddress - data: " + JSON.stringify(data, null, 2));
}

async function syncPortfolioAddressEvents(validatedAddress, data, provider, db, chainId) {

  async function processLogs(section, fromBlock, toBlock, logs) {
    console.log(moment().format("HH:mm:ss") + " portfolioFunctions.js:syncPortfolioAddressEvents.processLogs - section: " + section + ", fromBlock: " + fromBlock + ", toBlock: " + toBlock + ", logs.length: " + logs.length);
    const records = [];
    for (const log of logs) {
      if (!log.removed) {
        records.push({ chainId, ...log, address: validatedAddress, contract: log.address });
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
      // console.log(moment().format("HH:mm:ss") + " portfolioFunctions.js:syncPortfolioAddressEvents.getLogsFromRange - accountAs32Bytes: " + accountAs32Bytes);
      // const topic0s = [ '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef' ];
      // const topics = [ topic0s, null, null, null ];
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

      const logs = await provider.getLogs({ address: null, fromBlock, toBlock, topics });
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

  const REFRESH_LATEST_BLOCKS = 100;
  console.log(now() + " portfolioFunctions.js:syncPortfolioAddressEvents - validatedAddress: " + validatedAddress + ", data.keys: " + Object.keys(data));
  const startBlock = data.chains[chainId] && data.chains[chainId].retrievedEventsBlockNumber && (data.chains[chainId].retrievedEventsBlockNumber - REFRESH_LATEST_BLOCKS) || 0;
  const endBlock = data.chains[chainId] && data.chains[chainId].blockNumber || 0;
  console.log(now() + " portfolioFunctions.js:syncPortfolioAddressEvents - startBlock: " + startBlock + ", endBlock: " + endBlock);

  if (startBlock > 0) {
    const toDelete = await db.addressEvents.where('[address+chainId+blockNumber+logIndex]').between([validatedAddress, chainId, startBlock, Dexie.minKey],[validatedAddress, chainId, Dexie.maxKey, Dexie.maxKey]).toArray();
    console.log(now() + " portfolioFunctions.js:syncPortfolioAddressEvents - toDelete: " + JSON.stringify(toDelete, null, 2));
    const rowsDeleted = await db.addressEvents.where('[address+chainId+blockNumber+logIndex]').between([validatedAddress, chainId, startBlock, Dexie.minKey],[validatedAddress, chainId, Dexie.maxKey, Dexie.maxKey]).delete()
    console.log(now() + " portfolioFunctions.js:syncPortfolioAddressEvents - rowsDeleted: " + rowsDeleted);
  }


  for (let section = 0; section < 3; section++) {
    await getLogsFromRange(section, startBlock, endBlock);
  }
  if (!(chainId in data.chains)) {
    data.chains[chainId] = {};
  }
  data.chains[chainId].retrievedEventsBlockNumber = data.chains[chainId].blockNumber;
  // console.log(now() + " portfolioFunctions.js:syncPortfolioAddressEvents - logs: " + JSON.stringify(logs, null, 2));
}

// ERC-20 Transfer (index_topic_1 address from, index_topic_2 address to, uint256 tokens)
// ERC-721 Transfer (index_topic_1 address from, index_topic_2 address to, index_topic_3 uint256 id)
// '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
// ERC-1155 TransferSingle (index_topic_1 address operator, index_topic_2 address from, index_topic_3 address to, uint256 id, uint256 value)
// '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62',
// ERC-1155 TransferBatch (index_topic_1 address operator, index_topic_2 address from, index_topic_3 address to, uint256[] ids, uint256[] values)
// '0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb',
// WETH Deposit (index_topic_1 address dst, uint256 wad)
// '0xe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c',
// WETH Withdrawal (index_topic_1 address src, uint256 wad)
// '0x7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b65',
// ERC-20 Approval (index_topic_1 address owner, index_topic_2 address spender, uint256 value)
// ERC-721 Approval (index_topic_1 address owner, index_topic_2 address approved, index_topic_3 uint256 tokenId)
// '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
// ERC-721 ApprovalForAll (index_topic_1 address owner, index_topic_2 address operator, bool approved)
// ERC-1155 ApprovalForAll (index_topic_1 address account, index_topic_2 address operator, bool approved)
// '0x17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31',

let _interface20 = null;
let _interface721 = null;
let _interface1155 = null;

function parseEvent(log) {
  if (!_interface20) {
    _interface20 = new ethers.utils.Interface(ERC20ABI);
    _interface721 = new ethers.utils.Interface(ERC721ABI);
    _interface1155 = new ethers.utils.Interface(ERC1155ABI);
  }
  const result = {};
  let info = null;
  // console.log(now() + " portfolioFunctions.js:parseEvent - log: " + JSON.stringify(log, null, 2));
  if (log.topics[0] == "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef") {
    // ERC-20 Transfer (index_topic_1 address from, index_topic_2 address to, uint256 tokens)
    // ERC-721 Transfer (index_topic_1 address from, index_topic_2 address to, index_topic_3 uint256 id)
    if (log.topics.length == 3) {
      const from = ethers.utils.getAddress('0x' + log.topics[1].substring(26));
      const to = ethers.utils.getAddress('0x' + log.topics[2].substring(26));
      const tokens = ethers.BigNumber.from(log.data).toString();
      info = { type: "Transfer", contractType: "erc20", from, to, tokens };
    } else if (log.topics.length == 4) {
      const from = ethers.utils.getAddress('0x' + log.topics[1].substring(26));
      const to = ethers.utils.getAddress('0x' + log.topics[2].substring(26));
      const tokenId = ethers.BigNumber.from(log.topics[3]).toString();
      info = { type: "Transfer", contractType: "erc721", from, to, tokenId };
    }
  } else if (log.topics[0] == "0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62") {
    // ERC-1155 TransferSingle (index_topic_1 address operator, index_topic_2 address from, index_topic_3 address to, uint256 id, uint256 value)
    const logData = _interface1155.parseLog(log);
    const [ operator, from, to, tokenId, value ] = logData.args;
    info = { type: "TransferSingle", contractType: "erc1155", operator, from, to, tokenId: ethers.BigNumber.from(tokenId).toString(), value: ethers.BigNumber.from(value).toString() };
  } else if (log.topics[0] == "0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb") {
    // ERC-1155 TransferBatch (index_topic_1 address operator, index_topic_2 address from, index_topic_3 address to, uint256[] ids, uint256[] values)
    const logData = _interface1155.parseLog(log);
    const [ operator, from, to, tokenIds, values ] = logData.args;
    info = { type: "TransferBatch", contractType: "erc1155", operator, from, to, tokenIds: tokenIds.map(e => ethers.BigNumber.from(e).toString()), values: values.map(e => ethers.BigNumber.from(e).toString()) };
  } else if (log.topics[0] == "0xe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c") {
    // WETH Deposit (index_topic_1 address dst, uint256 wad)
    const to = ethers.utils.getAddress('0x' + log.topics[1].substring(26));
    const tokens = ethers.BigNumber.from(log.data).toString();
    info = { type: "Transfer", contractType: "erc20", from: ADDRESS0, to, tokens };
  } else if (log.topics[0] == "0x7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b65") {
    // WETH Withdrawal (index_topic_1 address src, uint256 wad)
    const from = ethers.utils.getAddress('0x' + log.topics[1].substring(26));
    const tokens = ethers.BigNumber.from(log.data).toString();
    info = { type: "Transfer", contractType: "erc20", from, to: ADDRESS0, tokens };
  } else if (log.topics[0] == "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925") {
    // ERC-20 Approval (index_topic_1 address owner, index_topic_2 address spender, uint256 value)
    // ERC-721 Approval (index_topic_1 address owner, index_topic_2 address approved, index_topic_3 uint256 tokenId)
    if (log.topics.length == 3) {
      const owner = ethers.utils.getAddress('0x' + log.topics[1].substring(26));
      const spender = ethers.utils.getAddress('0x' + log.topics[2].substring(26));
      const tokens = ethers.BigNumber.from(log.data).toString();
      info = { type: "Approval", contractType: "erc20", owner, spender, tokens };
    } else if (log.topics.length == 4) {
      const owner = ethers.utils.getAddress('0x' + log.topics[1].substring(26));
      const approved = ethers.utils.getAddress('0x' + log.topics[2].substring(26));
      const tokenId = ethers.BigNumber.from(log.topics[3]).toString();
      info = { type: "Approval", contractType: "erc721", owner, approved, tokenId };
    }
  } else if (log.topics[0] == "0x17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31") {
    // ERC-721 ApprovalForAll (index_topic_1 address owner, index_topic_2 address operator, bool approved)
    // ERC-1155 ApprovalForAll (index_topic_1 address account, index_topic_2 address operator, bool approved)
    const owner = ethers.utils.getAddress('0x' + log.topics[1].substring(26));
    const operator = ethers.utils.getAddress('0x' + log.topics[2].substring(26));
    const approved = ethers.BigNumber.from(log.data).eq(1);
    info = { type: "ApprovalForAll", contractType: "erc721Or1155", owner, operator, approved };
  }

  if (info) {
    result.info = info;
    result.chainId = log.chainId;
    result.blockNumber = log.blockNumber;
    result.transactionIndex = log.transactionIndex;
    result.address = log.address;
    result.transactionHash = log.transactionHash;
    result.logIndex = log.logIndex;
    result.contract = log.contract;
    // console.log(now() + " portfolioFunctions.js:parseEvent - result: " + JSON.stringify(result, null, 2));
  } else {
    result.chainId = log.chainId;
    result.blockNumber = log.blockNumber;
    result.transactionIndex = log.transactionIndex;
    result.address = log.address;
    result.data = log.data;
    result.topics = log.topics;
    result.transactionHash = log.transactionHash;
    result.logIndex = log.logIndex;
    result.contract = log.contract;
    // console.log(now() + " portfolioFunctions.js:parseEvent - UNPARSED result: " + JSON.stringify(result, null, 2));
  }
  return result;
}

async function collatePortfolioAddress(validatedAddress, data, db, chainId) {
  console.log(now() + " portfolioFunctions.js:collatePortfolioAddress - validatedAddress: " + validatedAddress + ", data keys: " + Object.keys(data));

  const DEBUG_TOKENID = "xyz";

  const tokenBalances = {};
  const tokens = {};
  const BATCH_SIZE = 10000; // TODO: 100000;
  let rows = 0;
  let done = false;
  do {
    const logs = await db.addressEvents.where('[address+chainId+blockNumber+logIndex]').between([validatedAddress, Dexie.minKey, Dexie.minKey, Dexie.minKey],[validatedAddress, Dexie.maxKey, Dexie.maxKey, Dexie.maxKey]).offset(rows).limit(BATCH_SIZE).toArray();
    if (logs.length > 0) {
      // console.log(now() + " portfolioFunctions.js:collatePortfolioAddress - logs: " + JSON.stringify(logs, null, 2));
      for (const log of logs) {
        // if (log.chainId != chainId) {
        //   console.log(now() + " portfolioFunctions.js:collatePortfolioAddress - log: " + JSON.stringify(log, null, 2));
        // }
        const item = parseEvent(log);
        const info = item.info;
        if (info) {
          if (info.type == "Transfer" && info.contractType == "erc20") {
            // if (log.chainId != chainId) {
            //   console.error(now() + " portfolioFunctions.js:collatePortfolioAddress - log: " + JSON.stringify(log, null, 2));
            // }
            if (!(log.chainId in tokenBalances)) {
              tokenBalances[log.chainId] = {};
            }
            if (info.from == validatedAddress) {
              tokenBalances[log.chainId][item.contract] = ethers.BigNumber.from(tokenBalances[log.chainId][item.contract] || "0").sub(info.tokens).toString();
            }
            if (info.to == validatedAddress) {
              tokenBalances[log.chainId][item.contract] = ethers.BigNumber.from(tokenBalances[log.chainId][item.contract] || "0").add(info.tokens).toString();
            }
          } else if (info.type == "Transfer" && info.contractType == "erc721") {
            // console.log(now() + " portfolioFunctions.js:collatePortfolioAddress - info: " + JSON.stringify(info, null, 2));
            if (!(log.chainId in tokens)) {
              tokens[log.chainId] = {};
            }
            if (info.from == validatedAddress) {
              if (tokens[log.chainId][item.contract] && tokens[log.chainId][item.contract][info.tokenId]) {
                // console.log(now() + " portfolioFunctions.js:collatePortfolioAddress - DELETING info: " + JSON.stringify(info, null, 2));
                delete tokens[log.chainId][item.contract][info.tokenId];
              }
              if (tokens[log.chainId][item.contract]) {
                if (Object.keys(tokens[log.chainId][item.contract]).length == 0) {
                  delete tokens[log.chainId][item.contract];
                }
              }
            }
            if (info.to == validatedAddress) {
              if (!(item.contract in tokens[log.chainId])) {
                tokens[log.chainId][item.contract] = {};
              }
              tokens[log.chainId][item.contract][info.tokenId] = true;
            }
          } else if (info.type == "TransferSingle" && info.contractType == "erc1155") {
            // TODO: Fix "-1" values
            if (info.tokenId == DEBUG_TOKENID) {
              console.error(now() + " portfolioFunctions.js:collatePortfolioAddress - item: " + JSON.stringify(item, null, 2));
            }
            if (!(log.chainId in tokens)) {
              tokens[log.chainId] = {};
            }
            if (info.from == validatedAddress) {
              if (!(item.contract in tokens[log.chainId])) {
                tokens[log.chainId][item.contract] = {};
              }
              tokens[log.chainId][item.contract][info.tokenId] = ethers.BigNumber.from(tokens[log.chainId][item.contract][info.tokenId] || "0").sub(info.value).toString();
              // if (tokens[log.chainId][item.contract] && tokens[log.chainId][item.contract][info.tokenId]) {
                if (tokens[log.chainId][item.contract][info.tokenId] == 0) {
                    delete tokens[log.chainId][item.contract][info.tokenId];
                }
              // }
              if (tokens[log.chainId][item.contract]) {
                if (Object.keys(tokens[log.chainId][item.contract]).length == 0) {
                  delete tokens[log.chainId][item.contract];
                }
              }
            }
            if (info.to == validatedAddress) {
              if (!(item.contract in tokens[log.chainId])) {
                tokens[log.chainId][item.contract] = {};
              }
              tokens[log.chainId][item.contract][info.tokenId] = ethers.BigNumber.from(tokens[log.chainId][item.contract][info.tokenId] || "0").add(info.value).toString();
            }
          } else if (info.type == "TransferBatch" && info.contractType == "erc1155") {
            // TODO: Fix "-1" values
            if (!(log.chainId in tokens)) {
              tokens[log.chainId] = {};
            }
            if (info.from == validatedAddress) {
              // console.log(now() + " portfolioFunctions.js:collatePortfolioAddress - item: " + JSON.stringify(item, null, 2));
              if (!(item.contract in tokens[log.chainId])) {
                tokens[log.chainId][item.contract] = {};
              }
              for (const [index, tokenId] of info.tokenIds.entries()) {
                if (tokenId == DEBUG_TOKENID) {
                  console.error(now() + " portfolioFunctions.js:collatePortfolioAddress - DELETING item: " + JSON.stringify(item, null, 2));
                }
                // console.log("Deleting " + tokenId + " x " + info.values[index]);
                tokens[log.chainId][item.contract][tokenId] = ethers.BigNumber.from(tokens[log.chainId][item.contract][tokenId] || "0").sub(info.values[index]).toString();
                if (tokens[log.chainId][item.contract][tokenId] == 0) {
                    delete tokens[log.chainId][item.contract][tokenId];
                }
              }
              if (tokens[log.chainId][item.contract]) {
                if (Object.keys(tokens[log.chainId][item.contract]).length == 0) {
                  delete tokens[log.chainId][item.contract];
                }
              }
            }
            if (info.to == validatedAddress) {
              if (!(item.contract in tokens[log.chainId])) {
                tokens[log.chainId][item.contract] = {};
              }
              for (const [index, tokenId] of info.tokenIds.entries()) {
                if (tokenId == DEBUG_TOKENID) {
                  console.error(now() + " portfolioFunctions.js:collatePortfolioAddress - ADDING item: " + JSON.stringify(item, null, 2));
                }
                // console.log("Adding " + tokenId + " x " + info.values[index]);
                tokens[log.chainId][item.contract][tokenId] = ethers.BigNumber.from(tokens[log.chainId][item.contract][tokenId] || "0").add(info.values[index]).toString();
              }
            }
          }
        }
      }
    }
    rows = parseInt(rows) + logs.length;
    console.log(now() + " portfolioFunctions.js:collatePortfolioAddress - rows: " + rows);
    done = logs.length < BATCH_SIZE;
  } while (!done);
  console.log(now() + " portfolioFunctions.js:collatePortfolioAddress - rows: " + rows);
  if (!("tokenBalances" in data)) {
    data.tokenBalances = {};
  }
  data.tokenBalances[validatedAddress] = tokenBalances;
  if (!("tokens" in data)) {
    data.tokens = {};
  }
  data.tokens[validatedAddress] = tokens;
}

async function collatePortfolioAddresses(validatedAddress, data, provider) {
  console.error(now() + " portfolioFunctions.js:collatePortfolioAddresses - validatedAddress: " + validatedAddress + ", data keys: " + Object.keys(data));
}
