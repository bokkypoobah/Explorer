const addressModule = {
  namespaced: true,
  state: {
    error: null,
    address: null,
    transactionCount: null,
    balance: null,
    info: {},
    // ensName: null,
    // transactions: [],
  },
  getters: {
    error: state => state.error,
    address: state => state.address,
    transactionCount: state => state.transactionCount,
    balance: state => state.balance,
    info: state => state.info,
    functions(state) {
      console.log(now() + " addressModule - computed.functions");
      const results = {};
      if (state.info.abi) {
        try {
          const interface = new ethers.utils.Interface(state.info.abi);
          for (const fullName of interface.format(ethers.utils.FormatTypes.full)) {
            if (fullName.substring(0, 8) == "function") {
              const fragment = interface.getFunction(fullName.substring(9,));
              const methodId = interface.getSighash(fragment);
              results[methodId] = { fullName, ...fragment };
            }
          }
          // for (const [fullName, fragment] of Object.entries(interface.functions)) {
          //   const sighash = interface.getSighash(fragment);
          //   results[sighash] = { fullName, ...fragment };
          // }
        } catch (e) {
          console.error(now() + " addressModule - computed.functions - ERROR info.abi: " + e.message);
        }
      }
      return results;
    },
    events(state) {
      console.log(now() + " addressModule - computed.events");
      const results = {};
      if (state.info.abi) {
        try {
          const interface = new ethers.utils.Interface(state.info.abi);
          for (const fullName of interface.format(ethers.utils.FormatTypes.full)) {
            if (fullName.substring(0, 5) == "event") {
              const fragment = interface.getEvent(fullName.substring(6,));
              const topicCount = fragment.inputs.filter(e => e.indexed).length + 1;
              const signature = interface.getEventTopic(fragment);
              // const parameters = fragment.inputs.map(e => ({ name: e.name, type: e.type, indexed: e.indexed }));
              results[signature] = { fullName, topicCount, ...fragment };
            }
          }
          // const interface = new ethers.utils.Interface(state.info.abi);
          // for (const [fullName, fragment] of Object.entries(interface.events)) {
          //   const eventTopic = interface.getEventTopic(fragment);
          //   results[eventTopic] = { fullName, ...fragment };
          // }
        } catch (e) {
          console.error(now() + " addressModule - computed.events - ERROR info.abi: " + e.message);
        }
      }
      return results;
    },
    // ensName: state => state.ensName,
    // transactions: state => state.transactions,
  },
  mutations: {
    setData(state, data) {
      console.log(now() + " addressModule - mutations.setData - data: " + JSON.stringify(data));
      state.error = data.error;
      state.address = data.address;
      state.transactionCount = data.transactionCount;
      state.balance = data.balance;
      state.info = data.info;
      // state.ensName = data.ensName;
      // state.transactions = data.transactions;
    },
  },
  actions: {
    async loadAddress(context, inputAddress) {
      console.log(now() + " addressModule - actions.loadAddress - inputAddress: " + inputAddress);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const chainId = store.getters["chainId"];
      const dbInfo = store.getters["db"];
      console.log(now() + " addressModule - actions.loadAddress - dbInfo: " + JSON.stringify(dbInfo));
      const db = new Dexie(dbInfo.name);
      db.version(dbInfo.version).stores(dbInfo.schemaDefinition);

      const forceUpdate = true;
      const validatedAddress = validateAddress(inputAddress);
      let info = {};
      if (validatedAddress) {
        info = await dbGetCachedData(db, validatedAddress + "_" + chainId + "_address", {});
        console.log(now() + " addressModule - actions.loadAddress - info: " + JSON.stringify(info));
        if (Object.keys(info).length == 0 || forceUpdate) {
          info = await getAddressInfo(validatedAddress, provider);
          console.log(now() + " addressModule - actions.loadAddress - info: " + JSON.stringify(info));
          await dbSaveCacheData(db, validatedAddress + "_" + chainId + "_address", info);
        }
      }

      let [error, address, transactionCount, balance, ensName, transactions, block] = [null, null, null, null, null, null, null];
      if (inputAddress) {
        if (!store.getters['web3'].connected || !window.ethereum) {
          error = "Not connected";
        }
        if (!error && !(/^0x([A-Fa-f0-9]{40})$/.test(inputAddress))) {
          error = "Invalid address (ENS names will be supported later)";
        }
        if (!error) {
          try {
            address = ethers.utils.getAddress(inputAddress);
          } catch (e) {
            error = "Invalid address: " + inputAddress;
          }
        }
        if (!error) {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          transactionCount = await provider.getTransactionCount(address);
          console.log(now() + " addressModule - actions.loadAddress - transactionCount: " + transactionCount);
          balance = await provider.getBalance(address);
          console.log(now() + " addressModule - actions.loadAddress - balance: " + balance);
        }
      }
      console.log("error: " + error);
      context.commit('setData', { error, address, transactionCount, balance, info });
      db.close();
    }
  },
};
