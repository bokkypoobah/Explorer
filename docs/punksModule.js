const punksModule = {
  namespaced: true,
  state: {
  },
  getters: {
  },
  mutations: {
  },
  actions: {
    async startup(context) {
      console.log(now() + " punksModule - actions.startup");
    },
    async syncPunks(context) {
      console.log(now() + " punksModule - actions.syncPunks");
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      // const dbInfo = store.getters["db"];
      // const db = new Dexie(dbInfo.name);
      // db.version(dbInfo.version).stores(dbInfo.schemaDefinition);

      const contract = new ethers.Contract(CRYPTOPUNKS_HELPER_ADDRESS, CRYPTOPUNKS_HELPER_ABI, provider);
      // const images = await contract.getImages(0, 400);
      // console.log(now() + " punksModule - images: " + JSON.stringify(images, null, 2));
      // const imageSvgs = await contract.getImageSvgs(0, 25);
      // console.log(now() + " punksModule - imageSvgs: " + JSON.stringify(imageSvgs, null, 2));
      const attributes = await contract.getAttributes(0, 100);
      console.log(now() + " punksModule - attributes: " + JSON.stringify(attributes, null, 2));

      const traitsLookup = {};
      for (const [trait, traitData] of Object.entries(CRYPTOPUNKS_TRAITS)) {
        for (const item of traitData) {
          traitsLookup[item] = trait;
        }
      }
      console.log("traitsLookup: " + JSON.stringify(traitsLookup, null, 2));

      for (const [index, attribute] of attributes.entries()) {
        // console.log("Punk " + index + " " + attribute);
        const attributeList = attribute.split(", ");
      //   const body = attributeList[0];
        for (const item of attributeList) {
          // console.log(index + " " + attribute);
          const trait = traitsLookup[item] || null;
          if (!trait) {
            console.error("Punk " + index + " " + item);
          } else {
            console.log("Punk " + index + " " + trait + ": " + item);
          }
        }
      //   console.log();
      }

      // context.commit('syncPunks', block);
      // db.close();
    },
  },
};
