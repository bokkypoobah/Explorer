const addressModule = {
  namespaced: true,
  state: {
    error: null,
    address: null,
    transactionCount: null,
    balance: null,
    // ensName: null,
    // transactions: [],
  },
  getters: {
    error: state => state.error,
    address: state => state.address,
    transactionCount: state => state.transactionCount,
    balance: state => state.balance,
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
      // state.ensName = data.ensName;
      // state.transactions = data.transactions;
    },
  },
  actions: {
    async loadAddress(context, inputAddress) {
      console.log(now() + " addressModule - actions.loadAddress - inputAddress: " + inputAddress);

      const chainId = store.getters["chainId"];
      console.log(now() + " addressModule - actions.loadAddress - chainId: " + JSON.stringify(chainId));
      const dbInfo = store.getters["db"];
      console.log(now() + " addressModule - actions.loadAddress - dbInfo: " + JSON.stringify(dbInfo));
      const db = new Dexie(dbInfo.name);
      db.version(dbInfo.version).stores(dbInfo.schemaDefinition);

      const validatedAddress = validateAddress(inputAddress);
      if (validatedAddress) {
        const info = await dbGetCachedData(db, validatedAddress + "_" + this.chainId + "_contract", {});
        console.log(now() + " addressModule - actions.loadAddress - info: " + JSON.stringify(info));
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
      context.commit('setData', { error, address, transactionCount, balance });
      db.close();
    }
  },
};
