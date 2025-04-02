const nameModule = {
  namespaced: true,
  state: {
    info: {},
  },
  getters: {
    name: state => state.info.name || null,
    info: state => state.info,
    // functions(state) {
    //   console.log(now() + " nameModule - computed.functions");
    //   const addressInfo = store.getters["addresses/getAddressInfo"](state.info.address);
    //   // console.log(now() + " nameModule - computed.functions - addressInfo: " + JSON.stringify(addressInfo));
    //   const results = {};
    //   if (addressInfo.abi) {
    //     try {
    //       const interface = new ethers.utils.Interface(addressInfo.abi);
    //       for (const fullName of interface.format(ethers.utils.FormatTypes.full)) {
    //         if (fullName.substring(0, 8) == "function") {
    //           const fragment = interface.getFunction(fullName.substring(9,));
    //           const methodId = interface.getSighash(fragment);
    //           results[methodId] = { fullName, ...fragment };
    //         }
    //       }
    //     } catch (e) {
    //       console.error(now() + " nameModule - computed.functions - ERROR: " + e.message);
    //     }
    //   }
    //   return results;
    // },
    // events(state) {
    //   console.log(now() + " nameModule - computed.events");
    //   const addressInfo = store.getters["addresses/getAddressInfo"](state.info.address);
    //   // console.log(now() + " nameModule - computed.functions - addressInfo: " + JSON.stringify(addressInfo));
    //   const results = {};
    //   if (addressInfo.abi) {
    //     try {
    //       const interface = new ethers.utils.Interface(addressInfo.abi);
    //       for (const fullName of interface.format(ethers.utils.FormatTypes.full)) {
    //         if (fullName.substring(0, 5) == "event") {
    //           const fragment = interface.getEvent(fullName.substring(6,));
    //           const topicCount = fragment.inputs.filter(e => e.indexed).length + 1;
    //           const signature = interface.getEventTopic(fragment);
    //           // const parameters = fragment.inputs.map(e => ({ name: e.name, type: e.type, indexed: e.indexed }));
    //           results[signature] = { fullName, topicCount, ...fragment };
    //         }
    //       }
    //     } catch (e) {
    //       console.error(now() + " nameModule - computed.events - ERROR: " + e.message);
    //     }
    //   }
    //   return results;
    // },
  },
  mutations: {
    setInfo(state, info) {
      // console.log(now() + " nameModule - mutations.setData - info: " + JSON.stringify(info));
      state.info = info;
    },
  },
  actions: {
    async loadName(context, { inputName, forceUpdate }) {
      console.log(now() + " nameModule - actions.loadName - inputName: " + inputName + ", forceUpdate: " + forceUpdate);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const chainId = store.getters["chainId"];
      const dbInfo = store.getters["db"];
      let info = {};
      if (ethers.utils.isValidName(inputName)) {
        info = await getNameInfo(inputName, provider);
        console.log(now() + " nameModule - actions.loadName - info: " + JSON.stringify(info));
        context.commit('setInfo', info);
        info.events = await getNameEvents(inputName, provider);
        console.log(now() + " nameModule - actions.loadName - With Events info: " + JSON.stringify(info));
      }
      context.commit('setInfo', info);
      // db.close();
    },
    // async loadAddress(context, { inputAddress, forceUpdate }) {
    //   console.log(now() + " nameModule - actions.loadAddress - inputAddress: " + inputAddress + ", forceUpdate: " + forceUpdate);
    //   // TODO
    //   // if (!store.getters['web3'].connected || !window.ethereum) {
    //   //   error = "Not connected";
    //   // }
    //   const provider = new ethers.providers.Web3Provider(window.ethereum);
    //   const chainId = store.getters["chainId"];
    //   const dbInfo = store.getters["db"];
    //   // console.log(now() + " nameModule - actions.loadAddress - dbInfo: " + JSON.stringify(dbInfo));
    //   const db = new Dexie(dbInfo.name);
    //   db.version(dbInfo.version).stores(dbInfo.schemaDefinition);
    //
    //   const validatedAddress = validateAddress(inputAddress);
    //   let info = {};
    //   if (validatedAddress) {
    //     info = await dbGetCachedData(db, validatedAddress + "_" + chainId + "_address", {});
    //     // console.log(now() + " nameModule - actions.loadAddress - info: " + JSON.stringify(info));
    //     if (Object.keys(info).length == 0 || forceUpdate) {
    //       info = await getAddressInfo(validatedAddress, provider);
    //       // console.log(now() + " nameModule - actions.loadAddress - info: " + JSON.stringify(info));
    //       await dbSaveCacheData(db, validatedAddress + "_" + chainId + "_address", info);
    //     }
    //     const addressInfo = store.getters["addresses/getAddressInfo"](validatedAddress);
    //     // console.log(now() + " nameModule - actions.loadAddress - addressInfo: " + JSON.stringify(addressInfo));
    //     if (!addressInfo.type) {
    //       store.dispatch("addresses/addAddress", { address: validatedAddress, type: info.type, version: info.version });
    //     }
    //   }
    //
    //   context.commit('setInfo', info);
    //   db.close();
    // },
  },
};
