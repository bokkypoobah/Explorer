const punksModule = {
  namespaced: true,
  state: {
    attributes: {},
  },
  getters: {
    attributes: state => state.attributes,
  },
  mutations: {
    setAttributes(state, attributes) {
      console.log(now() + " punksModule - mutations.setAttributes - attributes: " + JSON.stringify(attributes));
      state.attributes = attributes;
    },
  },
  actions: {
    async startup(context) {
      console.log(now() + " punksModule - actions.startup");
      const chainId = store.getters["chainId"];
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const dbInfo = store.getters["db"];
      const db = new Dexie(dbInfo.name);
      db.version(dbInfo.version).stores(dbInfo.schemaDefinition);
      let attributes = await dbGetCachedData(db, CRYPTOPUNKSMARKET_V2_ADDRESS + "_" + chainId + "_punks_attributes", {});
      context.commit('setAttributes', attributes);
      db.close();
    },
    async syncPunks(context) {
      console.log(now() + " punksModule - actions.syncPunks");
      const chainId = store.getters["chainId"];
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const dbInfo = store.getters["db"];
      const db = new Dexie(dbInfo.name);
      db.version(dbInfo.version).stores(dbInfo.schemaDefinition);
      let attributes = await dbGetCachedData(db, CRYPTOPUNKSMARKET_V2_ADDRESS + "_" + chainId + "_punks_attributes", {});
      if (Object.keys(attributes).length == 0) {
        const contract = new ethers.Contract(CRYPTOPUNKS_HELPER_ADDRESS, CRYPTOPUNKS_HELPER_ABI, provider);
        const rawAttributes = await contract.getAttributes(0, 10000);
        const traitsLookup = {};
        for (const [trait, traitData] of Object.entries(CRYPTOPUNKS_TRAITS)) {
          for (const item of traitData) {
            traitsLookup[item] = trait;
          }
        }
        for (const [index, attribute] of rawAttributes.entries()) {
          const attributeList = attribute.split(", ");
          const list = [];
          for (const option of attributeList) {
            const trait = traitsLookup[option] || null;
            if (!trait) {
              console.error("Punk " + index + " " + option);
            } else {
              list.push([ trait, option ]);
            }
          }
          attributes[index] = [ attributeList.length - 1, list ];
        }
        console.log("attributes: " + JSON.stringify(attributes, null, 2));
        await dbSaveCacheData(db, CRYPTOPUNKSMARKET_V2_ADDRESS + "_" + chainId + "_punks_attributes", attributes);

        // const images = await contract.getImages(0, 400);
        // console.log(now() + " punksModule - images: " + JSON.stringify(images, null, 2));
        // const imageSvgs = await contract.getImageSvgs(0, 25);
        // console.log(now() + " punksModule - imageSvgs: " + JSON.stringify(imageSvgs, null, 2));

      }
      context.commit('setAttributes', attributes);
      db.close();
    },
  },
};
