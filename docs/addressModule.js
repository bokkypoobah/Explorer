const addressModule = {
  namespaced: true,
  state: {
    info: {},
  },
  getters: {
    address: state => state.info.address || null,
    info: state => state.info,
    functions(state) {
      console.log(now() + " addressModule - computed.functions");
      const addressInfo = store.getters["addresses/getAddressInfo"](state.info.address);
      // console.log(now() + " addressModule - computed.functions - addressInfo: " + JSON.stringify(addressInfo));
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
          console.error(now() + " addressModule - computed.functions - ERROR: " + e.message);
        }
      }
      return results;
    },
    events(state) {
      console.log(now() + " addressModule - computed.events");
      const addressInfo = store.getters["addresses/getAddressInfo"](state.info.address);
      // console.log(now() + " addressModule - computed.functions - addressInfo: " + JSON.stringify(addressInfo));
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
          console.error(now() + " addressModule - computed.events - ERROR: " + e.message);
        }
      }
      return results;
    },
  },
  mutations: {
    setInfo(state, info) {
      console.log(now() + " addressModule - mutations.setData - info: " + JSON.stringify(info));
      state.info = info;
    },
  },
  actions: {
    async loadAddress(context, { inputAddress, forceUpdate }) {
      console.log(now() + " addressModule - actions.loadAddress - inputAddress: " + inputAddress + ", forceUpdate: " + forceUpdate);
      // TODO - handle offline
      // if (!store.getters['web3'].connected || !window.ethereum) {
      //   error = "Not connected";
      // }
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const chainId = store.getters["chainId"];
      const dbInfo = store.getters["db"];
      // console.log(now() + " addressModule - actions.loadAddress - dbInfo: " + JSON.stringify(dbInfo));
      const db = new Dexie(dbInfo.name);
      db.version(dbInfo.version).stores(dbInfo.schemaDefinition);

      const validatedAddress = validateAddress(inputAddress);
      let info = {};
      if (validatedAddress) {
        info = await dbGetCachedData(db, validatedAddress + "_" + chainId + "_address", {});
        // console.log(now() + " addressModule - actions.loadAddress - info: " + JSON.stringify(info));
        if (Object.keys(info).length == 0 || forceUpdate) {
          info = await getAddressInfo(validatedAddress, provider);
          // console.log(now() + " addressModule - actions.loadAddress - info: " + JSON.stringify(info));
          await dbSaveCacheData(db, validatedAddress + "_" + chainId + "_address", info);
        }
        const addressInfo = store.getters["addresses/getAddressInfo"](validatedAddress);
        // console.log(now() + " addressModule - actions.loadAddress - addressInfo: " + JSON.stringify(addressInfo));
        if (!addressInfo.type) {
          store.dispatch("addresses/addAddress", { address: validatedAddress, type: info.type, version: info.version, ensName: info.ensName });
        }
      }

      context.commit('setInfo', info);
      db.close();
    },
  },
};
