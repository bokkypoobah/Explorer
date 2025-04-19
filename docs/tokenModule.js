const tokenModule = {
  namespaced: true,
  state: {
    info: {},
    sync: {
      info: null,
      completed: null,
      total: null,
      halt: false,
    },
  },
  getters: {
    address: state => state.info.address || null,
    info: state => state.info,
    sync: state => state.sync,
    functions(state) {
      console.log(now() + " tokenModule - computed.functions");
      const addressInfo = store.getters["addresses/getAddressInfo"](state.info.address);
      // console.log(now() + " tokenModule - computed.functions - addressInfo: " + JSON.stringify(addressInfo));
      const results = {};
      if (addressInfo.abi) {
        try {
          const interface = new ethers.utils.Interface(addressInfo.abi);
          for (const fullName of interface.format(ethers.utils.FormatTypes.full)) {
            if (fullName.substring(0, 8) == "function") {
              const fragment = interface.getFunction(fullName.substring(9,));
              const methodId = interface.getSighash(fragment);
              results[methodId] = { fullName, ...fragment };
            }
          }
        } catch (e) {
          console.error(now() + " tokenModule - computed.functions - ERROR: " + e.message);
        }
      }
      return results;
    },
    events(state) {
      console.log(now() + " tokenModule - computed.events");
      const addressInfo = store.getters["addresses/getAddressInfo"](state.info.address);
      // console.log(now() + " tokenModule - computed.functions - addressInfo: " + JSON.stringify(addressInfo));
      const results = {};
      if (addressInfo.abi) {
        try {
          const interface = new ethers.utils.Interface(addressInfo.abi);
          for (const fullName of interface.format(ethers.utils.FormatTypes.full)) {
            if (fullName.substring(0, 5) == "event") {
              const fragment = interface.getEvent(fullName.substring(6,));
              const topicCount = fragment.inputs.filter(e => e.indexed).length + 1;
              const signature = interface.getEventTopic(fragment);
              // const parameters = fragment.inputs.map(e => ({ name: e.name, type: e.type, indexed: e.indexed }));
              results[signature] = { fullName, topicCount, ...fragment };
            }
          }
        } catch (e) {
          console.error(now() + " tokenModule - computed.events - ERROR: " + e.message);
        }
      }
      return results;
    },
  },
  mutations: {
    setInfo(state, info) {
      // console.log(now() + " tokenModule - mutations.setInfo - info: " + JSON.stringify(info));
      state.info = info;
    },
    setNumberOfEvents(state, numberOfEvents) {
      console.log(now() + " tokenModule - mutations.setNumberOfEvents - numberOfEvents: " + JSON.stringify(numberOfEvents));
      state.info.numberOfEvents = numberOfEvents;
    },
    setSyncInfo(state, info) {
      // console.log(now() + " tokenModule - mutations.setSyncInfo - info: " + info);
      state.sync.info = info;
    },
    setSyncCompleted(state, completed) {
      // console.log(now() + " tokenModule - mutations.setSyncCompleted - completed: " + completed);
      state.sync.completed = completed;
    },
    setSyncTotal(state, total) {
      // console.log(now() + " tokenModule - mutations.setSyncTotal - total: " + total);
      state.sync.total = total;
    },
    setSyncHalt(state, halt) {
      // console.log(now() + " tokenModule - mutations.setSyncHalt - halt: " + halt);
      state.sync.halt = halt;
    },
  },
  actions: {
    async loadToken(context, { inputAddress, forceUpdate }) {
      console.log(now() + " tokenModule - actions.loadToken - inputAddress: " + inputAddress + ", forceUpdate: " + forceUpdate);
      // TODO - handle offline
      // if (!store.getters['web3'].connected || !window.ethereum) {
      //   error = "Not connected";
      // }
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const chainId = store.getters["chainId"];
      const dbInfo = store.getters["db"];
      const db = new Dexie(dbInfo.name);
      db.version(dbInfo.version).stores(dbInfo.schemaDefinition);

      const validatedAddress = validateAddress(inputAddress);
      let info = {};
      if (validatedAddress) {
        info = await dbGetCachedData(db, validatedAddress + "_" + chainId + "_address", {});
        // console.log(now() + " tokenModule - actions.loadToken - info: " + JSON.stringify(info));
        if (Object.keys(info).length == 0 || forceUpdate) {
          info = await getAddressInfo(validatedAddress, provider);
          info.numberOfEvents = null;
          console.log(now() + " tokenModule - actions.loadToken - info: " + JSON.stringify(info));
          await dbSaveCacheData(db, validatedAddress + "_" + chainId + "_address", info);
        }
        const addressInfo = store.getters["addresses/getAddressInfo"](validatedAddress);
        // console.log(now() + " tokenModule - actions.loadToken - addressInfo: " + JSON.stringify(addressInfo));
        if (!addressInfo.type) {
          store.dispatch("addresses/addAddress", { address: validatedAddress, type: info.type, version: info.version, ensName: info.ensName });
        }
      }
      context.commit('setInfo', info);
      context.dispatch("collateEventData", inputAddress);
      db.close();
    },
    setSyncHalt(context) {
      console.log(moment().format("HH:mm:ss") + " tokenModule - actions.setSyncHalt");
      context.commit('setSyncHalt', true);
    },
    async syncTokenEvents(context, { inputAddress, forceUpdate }) {

      async function processLogs(fromBlock, toBlock, logs) {
        console.log(moment().format("HH:mm:ss") + " tokenModule - actions.syncTokenEvents.processLogs - fromBlock: " + fromBlock + ", toBlock: " + toBlock + ", logs.length: " + logs.length + ", type: " + context.state.info.type);
        const records = [];
        for (const log of logs) {
          if (!log.removed) {
            let info = null;
            // ERC-20 Transfer (index_topic_1 address from, index_topic_2 address to, uint256 tokens)
            // ERC-721 Transfer (index_topic_1 address from, index_topic_2 address to, index_topic_3 uint256 id)
            if (log.topics[0] == "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef") {
              if (log.topics.length == 3 && context.state.info.type == "erc20") {
                const from = ethers.utils.getAddress('0x' + log.topics[1].substring(26));
                const to = ethers.utils.getAddress('0x' + log.topics[2].substring(26));
                const tokens = ethers.BigNumber.from(log.data).toString();
                info = { event: "Transfer", from, to, tokens };

              } else if (log.topics.length == 4 && context.state.info.type == "erc721") {
                const from = ethers.utils.getAddress('0x' + log.topics[1].substring(26));
                const to = ethers.utils.getAddress('0x' + log.topics[2].substring(26));
                const tokenId = ethers.BigNumber.from(log.topics[3]).toString();
                info = { event: "Transfer", from, to, tokenId };
              }

            // ERC-1155 TransferSingle (index_topic_1 address operator, index_topic_2 address from, index_topic_3 address to, uint256 id, uint256 value)
            } else if (log.topics[0] == "0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62") {
              const logData = erc1155Interface.parseLog(log);
              const [ operator, from, to, tokenId, value ] = logData.args;
              info = { event: "TransferSingle", operator, from, to, tokenId: ethers.BigNumber.from(tokenId).toString(), value: ethers.BigNumber.from(value).toString() };

            // ERC-1155 TransferBatch (index_topic_1 address operator, index_topic_2 address from, index_topic_3 address to, uint256[] ids, uint256[] values)
            } else if (log.topics[0] == "0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb") {
              const logData = erc1155Interface.parseLog(log);
              const [ operator, from, to, tokenIds, values ] = logData.args;
              info = { event: "TransferBatch", operator, from, to, tokenIds: tokenIds.map(e => ethers.BigNumber.from(e).toString()), values: values.map(e => ethers.BigNumber.from(e).toString()) };

            // WETH Deposit (index_topic_1 address dst, uint256 wad)
            } else if (log.topics[0] == "0xe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c") {
              const from = ADDRESS0;
              const to = ethers.utils.getAddress('0x' + log.topics[1].substring(26));
              const tokens = ethers.BigNumber.from(log.data).toString();
              info = { event: "Transfer", from, to, tokens };

            // WETH Withdrawal (index_topic_1 address src, uint256 wad)
            } else if (log.topics[0] == "0x7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b65") {
              info = { event: "Withdrawal" };
              const from = ethers.utils.getAddress('0x' + log.topics[1].substring(26));
              const to = ADDRESS0;
              const tokens = ethers.BigNumber.from(log.data).toString();
              info = { event: "Transfer", from, to, tokens };

            // ERC-20 Approval (index_topic_1 address owner, index_topic_2 address spender, uint256 value)
            // ERC-721 Approval (index_topic_1 address owner, index_topic_2 address approved, index_topic_3 uint256 tokenId)
            } else if (log.topics[0] == "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925") {
              if (log.topics.length == 3 && context.state.info.type == "erc20") {
                const from = ethers.utils.getAddress('0x' + log.topics[1].substring(26));
                const to = ethers.utils.getAddress('0x' + log.topics[2].substring(26));
                const tokens = ethers.BigNumber.from(log.data).toString();
                info = { event: "Approval", from, to, tokens };

              } else if (log.topics.length == 4 && context.state.info.type == "erc721") {
                const from = ethers.utils.getAddress('0x' + log.topics[1].substring(26));
                const to = ethers.utils.getAddress('0x' + log.topics[2].substring(26));
                const tokenId = ethers.BigNumber.from(log.topics[3]).toString();
                info = { event: "Approval", from, to, tokenId };
              }

            // ERC-721 ApprovalForAll (index_topic_1 address owner, index_topic_2 address operator, bool approved)
            // ERC-1155 ApprovalForAll (index_topic_1 address account, index_topic_2 address operator, bool approved)
            } else if (log.topics[0] == "0x17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31") {
              info = { event: "ApprovalForAll" };
              const owner = ethers.utils.getAddress('0x' + log.topics[1].substring(26));
              const operator = ethers.utils.getAddress('0x' + log.topics[2].substring(26));
              approved = ethers.BigNumber.from(log.data).eq(1);
              info = { event: "ApprovalForAll", owner, operator, approved };

            }
            if (info) {
              records.push({
                chainId,
                address: log.address,
                blockNumber: log.blockNumber,
                logIndex: log.logIndex,
                transactionIndex: log.transactionIndex,
                transactionHash: log.transactionHash,
                info,
              });
            }
          }
        }
        // console.log(moment().format("HH:mm:ss") + " tokenModule - actions.syncTokenEvents.processLogs - fromBlock: " + fromBlock + ", toBlock: " + toBlock + ", records: " + JSON.stringify(records, null, 2));
        if (records.length > 0) {
          await db.tokenEvents.bulkAdd(records).then(function(lastKey) {
            console.log(moment().format("HH:mm:ss") + " tokenModule - actions.syncTokenEvents.processLogs - bulkAdd lastKey: " + JSON.stringify(lastKey));
            }).catch(Dexie.BulkError, function(e) {
              console.log(moment().format("HH:mm:ss") + " tokenModule - actions.syncTokenEvents.processLogs - bulkAdd e: " + JSON.stringify(e.failures, null, 2));
            });
        }
      }

      async function getTokenLogsFromRange(validatedAddress, fromBlock, toBlock) {
        console.log(moment().format("HH:mm:ss") + " tokenModule - actions.syncTokenEvents.getTokenLogsFromRange - fromBlock: " + fromBlock + ", toBlock: " + toBlock);
        if (context.state.sync.halt) {
          return;
        }
        try {
          topics = [[
              // ERC-20 Transfer (index_topic_1 address from, index_topic_2 address to, uint256 tokens)
              // ERC-721 Transfer (index_topic_1 address from, index_topic_2 address to, index_topic_3 uint256 id)
              '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
              // ERC-1155 TransferSingle (index_topic_1 address operator, index_topic_2 address from, index_topic_3 address to, uint256 id, uint256 value)
              '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62',
              // ERC-1155 TransferBatch (index_topic_1 address operator, index_topic_2 address from, index_topic_3 address to, uint256[] ids, uint256[] values)
              '0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb',
              // WETH Deposit (index_topic_1 address dst, uint256 wad)
              '0xe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c',
              // WETH Withdrawal (index_topic_1 address src, uint256 wad)
              '0x7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b65',
              // ERC-20 Approval (index_topic_1 address owner, index_topic_2 address spender, uint256 value)
              // ERC-721 Approval (index_topic_1 address owner, index_topic_2 address approved, index_topic_3 uint256 tokenId)
              '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
              // ERC-721 ApprovalForAll (index_topic_1 address owner, index_topic_2 address operator, bool approved)
              // ERC-1155 ApprovalForAll (index_topic_1 address account, index_topic_2 address operator, bool approved)
              '0x17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31',
            ],
          ];
          const logs = await provider.getLogs({
            address: validatedAddress,
            fromBlock,
            toBlock,
            topics,
          });
          // console.log(moment().format("HH:mm:ss") + " tokenModule - actions.syncTokenEvents.getTokenLogsFromRange - logs: " + JSON.stringify(logs, null, 2));
          await processLogs(fromBlock, toBlock, logs);
          context.commit('setSyncCompleted', toBlock);
        } catch (e) {
          console.error(moment().format("HH:mm:ss") + " tokenModule - actions.syncTokenEvents.getTokenLogsFromRange - Error: " + e.message);
          const mid = parseInt((fromBlock + toBlock) / 2);
          await getTokenLogsFromRange(validatedAddress, fromBlock, mid);
          await getTokenLogsFromRange(validatedAddress, parseInt(mid) + 1, toBlock);
        }
      }

      console.log(now() + " tokenModule - actions.syncTokenEvents - inputAddress: " + inputAddress + ", forceUpdate: " + forceUpdate);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const chainId = store.getters["chainId"];
      const dbInfo = store.getters["db"];
      const db = new Dexie(dbInfo.name);
      db.version(dbInfo.version).stores(dbInfo.schemaDefinition);
      const erc1155Interface = new ethers.utils.Interface(ERC1155ABI);

      const validatedAddress = validateAddress(inputAddress);
      let info = {};
      if (validatedAddress) {
        const block = await provider.getBlock();
        const latestBlockNumber = block && block.number || null;
        context.commit('setSyncTotal', latestBlockNumber);
        context.commit('setSyncCompleted', 0);
        context.commit('setSyncInfo', "Syncing token events");
        const latest = await db.tokenEvents.where('[chainId+address+blockNumber+logIndex]').between([chainId, validatedAddress, Dexie.minKey, Dexie.minKey],[chainId, validatedAddress, Dexie.maxKey, Dexie.maxKey]).last();
        // console.log(now() + " tokenModule - actions.syncTokenEvents - latest: " + JSON.stringify(latest, null, 2));
        const startBlock = latest ? parseInt(latest.blockNumber) + 1: 0;
        // TODO: Testing
        // const startBlock = latestBlockNumber - 10000;
        console.log(now() + " tokenModule - actions.syncTokenEvents - startBlock: " + startBlock + ", latestBlockNumber: " + latestBlockNumber);
        await getTokenLogsFromRange(validatedAddress, startBlock, latestBlockNumber);
      }
      db.close();
      context.dispatch("collateEventData", inputAddress);
      context.commit('setSyncInfo', null);
      context.commit('setSyncHalt', false);
    },

    async collateEventData(context, address) {
      console.log(moment().format("HH:mm:ss") + " tokenModule - actions.collateEventData - address: " + address);

      const chainId = store.getters["chainId"];
      const dbInfo = store.getters["db"];
      const db = new Dexie(dbInfo.name);
      db.version(dbInfo.version).stores(dbInfo.schemaDefinition);

      // const latest = await db.tokenEvents.where('[chainId+address+blockNumber+logIndex]').between([chainId, address, Dexie.minKey, Dexie.minKey],[chainId, address, Dexie.maxKey, Dexie.maxKey]).last();
      // console.log(now() + " tokenModule - actions.collateEventData - latest: " + JSON.stringify(latest, null, 2));

      const BATCH_SIZE = 10000;
      let rows = 0;
      let done = false;
      do {
        const data = await db.tokenEvents.where('[chainId+address+blockNumber+logIndex]').between([chainId, address, Dexie.minKey, Dexie.minKey],[chainId, address, Dexie.maxKey, Dexie.maxKey]).offset(rows).limit(BATCH_SIZE).toArray();
        if (data.length > 0) {
          // console.log(now() + " tokenModule - actions.collateEventData - data[0]: " + JSON.stringify(data[0], null, 2));
        }
        rows = parseInt(rows) + data.length;
        done = data.length < BATCH_SIZE;
      } while (!done);
      console.log(now() + " tokenModule - actions.collateEventData - rows: " + rows);
      context.commit('setNumberOfEvents', rows);
      db.close();
    },
  },
};
