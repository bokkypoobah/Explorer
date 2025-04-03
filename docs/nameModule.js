const nameModule = {
  namespaced: true,
  state: {
    info: {},
  },
  getters: {
    name: state => state.info.name || null,
    info: state => state.info,
    eventsList(state) {
      console.log(now() + " nameModule - computed.eventsList");
      const results = [];
      for (const [blockNumber, blockData] of Object.entries(state.info.events || {})) {
        for (const [txIndex, txIndexData] of Object.entries(blockData)) {
          for (const [logIndex, logIndexData] of Object.entries(txIndexData.events)) {
            // console.log(blockNumber + "/" + txIndex + "/" + logIndex + " => " + JSON.stringify(logIndexData));
            results.push({
              blockNumber,
              txIndex,
              txHash: txIndexData.txHash,
              logIndex,
              ...logIndexData,
            });
          }
        }
      }
      results.sort((a, b) => {
        if (a.blockNumber == b.blockNumber) {
          return b.logIndex - a.logIndex;
        } else {
          return b.blockNumber - a.blockNumber;
        }
      });
      console.log(now() + " nameModule - computed.eventsList - results: " + JSON.stringify(results, null, 2));
      return results;
    },
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
        console.log(now() + " nameModule - actions.loadName - Without ENS events info: " + JSON.stringify(info));
        context.commit('setInfo', structuredClone(info));
        await getNameEvents(inputName, info, provider);
        // console.log(now() + " nameModule - actions.loadName - info: " + JSON.stringify(info));
      }
      context.commit('setInfo', structuredClone(info));
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
