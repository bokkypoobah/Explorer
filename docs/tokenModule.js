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
          // console.log(now() + " tokenModule - actions.loadToken - info: " + JSON.stringify(info));
          await dbSaveCacheData(db, validatedAddress + "_" + chainId + "_address", info);
        }
        const addressInfo = store.getters["addresses/getAddressInfo"](validatedAddress);
        // console.log(now() + " tokenModule - actions.loadToken - addressInfo: " + JSON.stringify(addressInfo));
        if (!addressInfo.type) {
          store.dispatch("addresses/addAddress", { address: validatedAddress, type: info.type, version: info.version, ensName: info.ensName });
        }
      }
      context.commit('setInfo', info);
      db.close();
    },
    setSyncHalt(context) {
      console.log(moment().format("HH:mm:ss") + " tokenModule - actions.setSyncHalt");
      context.commit('setSyncHalt', true);
    },
    async syncTokenEvents(context, { inputAddress, forceUpdate }) {

      async function processLogs(fromBlock, toBlock, logs) {
        console.log(moment().format("HH:mm:ss") + " tokenModule - actions.syncTokenEvents.processLogs - fromBlock: " + fromBlock + ", toBlock: " + toBlock + ", logs.length: " + logs.length);
        const records = logs.map(e => ({ chainId, ...e }));
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

          // ERC-20 Transfer (index_topic_1 address from, index_topic_2 address to, uint256 tokens)
          // ERC-721 Transfer (index_topic_1 address from, index_topic_2 address to, index_topic_3 uint256 id)
          // [ '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef', accountAs32Bytes, null ],
          // [ '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef', null, accountAs32Bytes ],

          // ERC-1155 TransferSingle (index_topic_1 address operator, index_topic_2 address from, index_topic_3 address to, uint256 id, uint256 value)
          // [ '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62', null, accountAs32Bytes, null ],
          // [ '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62', null, null, accountAs32Bytes ],

          // ERC-1155 TransferBatch (index_topic_1 address operator, index_topic_2 address from, index_topic_3 address to, uint256[] ids, uint256[] values)
          // [ '0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb', null, accountAs32Bytes, null ],
          // [ '0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb', null, null, accountAs32Bytes ],

          // WETH Deposit (index_topic_1 address dst, uint256 wad)
          // 0xe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c
          // WETH Withdrawal (index_topic_1 address src, uint256 wad)
          // 0x7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b65

          // ERC-20 Approval (index_topic_1 address owner, index_topic_2 address spender, uint256 value)
          // 0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925
          // ERC-721 Approval (index_topic_1 address owner, index_topic_2 address approved, index_topic_3 uint256 tokenId)
          // 0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925
          // ERC-721 ApprovalForAll (index_topic_1 address owner, index_topic_2 address operator, bool approved)
          // 0x17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31
          // ERC-1155 ApprovalForAll (index_topic_1 address account, index_topic_2 address operator, bool approved)
          // 0x17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31

          const logs = await provider.getLogs({
            address: validatedAddress,
            fromBlock,
            toBlock,
            topics: null,
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

      const validatedAddress = validateAddress(inputAddress);
      let info = {};
      if (validatedAddress) {
        const block = await provider.getBlock();
        const latestBlockNumber = block && block.number || null;
        context.commit('setSyncTotal', latestBlockNumber);
        context.commit('setSyncCompleted', 0);
        context.commit('setSyncInfo', "Syncing token events");
        const latest = await db.tokenEvents.where('[chainId+address+blockNumber+logIndex]').between([chainId, validatedAddress, Dexie.minKey, Dexie.minKey],[chainId, validatedAddress, Dexie.maxKey, Dexie.maxKey]).last();
        console.log(now() + " tokenModule - actions.syncTokenEvents - latest: " + JSON.stringify(latest, null, 2));
        const startBlock = latest ? parseInt(latest.blockNumber) + 1: 0;
        console.log(now() + " tokenModule - actions.syncTokenEvents - startBlock: " + startBlock + ", latestBlockNumber: " + latestBlockNumber);
        await getTokenLogsFromRange(validatedAddress, startBlock, latestBlockNumber);
      }
      db.close();
      context.commit('setSyncInfo', null);
      context.commit('setSyncHalt', false);
    },
  },
};
