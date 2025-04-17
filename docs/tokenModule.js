const tokenModule = {
  namespaced: true,
  state: {
    info: {},
  },
  getters: {
    address: state => state.info.address || null,
    info: state => state.info,
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
    async syncTokenEvents(context, { inputAddress, forceUpdate }) {

      async function processLogs(fromBlock, toBlock, logs) {
        console.log(moment().format("HH:mm:ss") + " tokenModule - actions.syncTokenEvents.processLogs - fromBlock: " + fromBlock + ", toBlock: " + toBlock + ", logs.length: " + logs.length);
        const records = logs.map(e => ({ chainId, ...e }));
        console.log(moment().format("HH:mm:ss") + " tokenModule - actions.syncTokenEvents.processLogs - fromBlock: " + fromBlock + ", toBlock: " + toBlock + ", records: " + JSON.stringify(records, null, 2));
        await db.tokenEvents.bulkAdd(records).then(function(lastKey) {
          console.log(moment().format("HH:mm:ss") + " tokenModule - actions.syncTokenEvents.processLogs - bulkAdd lastKey: " + JSON.stringify(lastKey));
          }).catch(Dexie.BulkError, function(e) {
            console.log(moment().format("HH:mm:ss") + " tokenModule - actions.syncTokenEvents.processLogs - bulkAdd e: " + JSON.stringify(e.failures, null, 2));
          });
      }

      async function getTokenLogsFromRange(validatedAddress, fromBlock, toBlock) {
        console.log(moment().format("HH:mm:ss") + " tokenModule - actions.syncTokenEvents.getTokenLogsFromRange - fromBlock: " + fromBlock + ", toBlock: " + toBlock);
        try {
          const logs = await provider.getLogs({
            address: validatedAddress,
            fromBlock,
            toBlock,
            topics: null,
          });
          // console.log(moment().format("HH:mm:ss") + " tokenModule - actions.syncTokenEvents.getTokenLogsFromRange - logs: " + JSON.stringify(logs, null, 2));
          await processLogs(fromBlock, toBlock, logs);
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
        await getTokenLogsFromRange(validatedAddress, 0, latestBlockNumber);
      }
      db.close();
    },
  },
};
