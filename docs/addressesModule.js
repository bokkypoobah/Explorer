const addressesModule = {
  namespaced: true,
  state: {
    addresses: {},
  },
  getters: {
    addresses: state => state.addresses,
    getAddressInfo: (state) => (address) => {
      // console.log(now() + " addressesModule - getters.getAddressInfo(" + address + ")");
      let results = {};
      if (address in state.addresses) {
        results = state.addresses[address];
        if (!results.abi) {
          results.defaultABIUsed = true;
          if (results.type == "erc20") {
            results.abi = JSON.stringify(ERC20ABI);
          } else if (results.type == "erc721") {
            results.abi = JSON.stringify(ERC721ABI);
          } else if (results.type == "erc1155") {
            results.abi = JSON.stringify(ERC1155ABI);
          } else if (results.type == "safe") {
            results.abi = JSON.stringify(SAFE_ABIS["safe_" + addressData.version]);
          }
        } else {
          results.defaultABIUsed = false;
        }
        // console.log(now() + " addressesModule - getters.getAddressInfo(" + address + ") - results: " + JSON.stringify(results));
      }
      return results;
    },
    getSourceCode: (state) => (address) => {
      console.log(now() + " addressesModule - getters.getSourceCode(" + address + ")");
      let results = [];
      if (address in state.addresses) {
        const data = state.addresses[address].sourceCode || [];
        for (const item of (state.addresses[address].sourceCode || [])) {
          // console.log(now() + " addressesModule - getters.getSourceCode(" + address + ") - item: " + JSON.stringify(item));
          let [sourceCode, metadata] = [null, []];
          for (const [key, value] of Object.entries(item)) {
            // console.log(now() + " addressesModule - getters.getSourceCode(" + address + ") - " + key + " => " + JSON.stringify(value));
            if (key == "SourceCode") {
              sourceCode = value;
              // console.log(now() + " addressesModule - getters.getSourceCode(" + address + ") - SOURCE CODE: " + JSON.stringify(value));
              if (value.substring(0, 2) == "{{" && value.slice(-2) == "}}") {
                const jsonString = value.substring(1, value.length - 1);
                // console.log(now() + " addressesModule - getters.getSourceCode(" + address + ") - SOURCE CODE - jsonString: " + jsonString);
                const json = JSON.parse(jsonString);
                console.log(now() + " addressesModule - getters.getSourceCode(" + address + ") - SOURCE CODE - json: " + JSON.stringify(json, null, 2));
              }
            } else {
              metadata.push({ key, value });
            }
          }
          results.push({ sourceCode, metadata });
        }
      }
      return results;
    },
    // // TODO: Unused
    // addresssesWithDefaultABIs(state) {
    //   const results = {};
    //   console.log(now() + " addressesModule - getters.addresssesWithDefaultABIs");
    //   for (const [address, addressData] of Object.entries(state.addresses)) {
    //     console.log(address + " => " + JSON.stringify(addressData));
    //     let abi = addressData.abi;
    //     if (!abi) {
    //       if (addressData.type == "erc20") {
    //         abi = JSON.stringify(ERC20ABI);
    //       } else if (addressData.type == "erc721") {
    //         abi = JSON.stringify(ERC721ABI);
    //       } else if (addressData.type == "erc1155") {
    //         abi = JSON.stringify(ERC1155ABI);
    //       } else if (addressData.type == "safe") {
    //         abi = JSON.stringify(SAFE_ABIS["safe_" + addressData.version]);
    //       }
    //     }
    //     results[address] = {
    //       type: addressData.type,
    //       version: addressData.version,
    //       name: addressData.name,
    //       ensName: addressData.ensName,
    //       abi,
    //     };
    //   }
    //   console.log(now() + " addressesModule - getters.addresssesWithDefaultABIs - results: " + JSON.stringify(results, null, 2));
    //   return results;
    // },
  },
  mutations: {
    setAddresses(state, addresses) {
      // console.log(now() + " addressesModule - mutations.setAddresses - addresses: " + JSON.stringify(addresses));
      state.addresses = addresses;
    },
    addAddress(state, info) {
      // console.log(now() + " addressesModule - mutations.addAddress - info: " + JSON.stringify(info));
      if (!(info.address in state.addresses)) {
        state.addresses[info.address] = {
          type: info.type || null,
          version: info.version || null,
          abi: info.abi || null,
          sourceCode: info.sourceCode || null,
          name: info.name || null,
          ensName: info.ensName || null,
        };
      }
      console.log(now() + " addressesModule - mutations.addAddress - state.addresses: " + JSON.stringify(state.addresses));
    },
    updateABI(state, info) {
      console.log(now() + " addressesModule - mutations.updateABI - info: " + JSON.stringify(info));
      if (!(info.address in state.addresses)) {
        state.addresses[info.address] = {
          type: null,
          version: null,
          abi: info.abi || null,
          sourceCode: null,
          name: null,
          ensName: null,
        };
      } else {
        state.addresses[info.address].abi = info.abi;
      }
      console.log(now() + " addressesModule - mutations.updateABI - state.addresses: " + JSON.stringify(state.addresses));
    },
    updateSourceCode(state, info) {
      console.log(now() + " addressesModule - mutations.updateSourceCode - info: " + JSON.stringify(info));
      if (!(info.address in state.addresses)) {
        state.addresses[info.address] = {
          type: null,
          version: null,
          abi: null,
          sourceCode: info.sourceCode || null,
          name: null,
          ensName: null,
        };
      } else {
        state.addresses[info.address].sourceCode = info.sourceCode;
      }
      console.log(now() + " addressesModule - mutations.updateSourceCode - state.addresses: " + JSON.stringify(state.addresses));
    },
  },
  actions: {
    async loadAddresses(context) {
      console.log(now() + " addressesModule - actions.loadAddresses");
      const dbInfo = store.getters["db"];
      const db = new Dexie(dbInfo.name);
      db.version(dbInfo.version).stores(dbInfo.schemaDefinition);
      const addresses = await dbGetCachedData(db, "addresses", {});
      // console.log(now() + " addressesModule - actions.loadAddresses - addresses: " + JSON.stringify(addresses));
      context.commit('setAddresses', addresses);
      db.close();
    },
    async addAddress(context, info) {
      console.log(now() + " addressesModule - actions.addAddress - info: " + JSON.stringify(info));
      const dbInfo = store.getters["db"];
      const db = new Dexie(dbInfo.name);
      db.version(dbInfo.version).stores(dbInfo.schemaDefinition);
      const validatedAddress = validateAddress(info.address);
      if (validatedAddress) {
        context.commit('addAddress', info);
        const addresses = JSON.parse(JSON.stringify(context.state.addresses));
        // const addresses = context.state.addresses;
        console.log(now() + " addressesModule - actions.addAddress - UPDATING addresses: " + JSON.stringify(addresses, null, 2));
        await dbSaveCacheData(db, "addresses", addresses);
      }
      db.close();
    },
    async updateABI(context, info) {
      console.log(now() + " addressesModule - actions.updateABI - info: " + JSON.stringify(info));
      const dbInfo = store.getters["db"];
      const db = new Dexie(dbInfo.name);
      db.version(dbInfo.version).stores(dbInfo.schemaDefinition);
      const validatedAddress = validateAddress(info.address);
      if (validatedAddress) {
        context.commit('updateABI', info);
        const addresses = JSON.parse(JSON.stringify(context.state.addresses));
        console.log(now() + " addressesModule - actions.updateABI - UPDATING addresses: " + JSON.stringify(addresses, null, 2));
        await dbSaveCacheData(db, "addresses", addresses);
      }
      db.close();
    },
    async updateSourceCode(context, info) {
      console.log(now() + " addressesModule - actions.updateSourceCode - info: " + JSON.stringify(info));
      const dbInfo = store.getters["db"];
      const db = new Dexie(dbInfo.name);
      db.version(dbInfo.version).stores(dbInfo.schemaDefinition);
      const validatedAddress = validateAddress(info.address);
      if (validatedAddress) {
        context.commit('updateSourceCode', info);
        const addresses = JSON.parse(JSON.stringify(context.state.addresses));
        console.log(now() + " addressesModule - actions.updateSourceCode - UPDATING addresses: " + JSON.stringify(addresses, null, 2));
        await dbSaveCacheData(db, "addresses", addresses);
      }
      db.close();
    },
  },
};
