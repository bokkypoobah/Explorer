const punksModule = {
  namespaced: true,
  state: {
    attributes: [],
  },
  getters: {
    attributes: state => state.attributes,
  },
  mutations: {
    setAttributes(state, attributes) {
      // console.log(now() + " punksModule - mutations.setAttributes - attributes: " + JSON.stringify(attributes));
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
    async syncPunks(context, forceUpdate) {
      console.log(now() + " punksModule - actions.syncPunks");
      const chainId = store.getters["chainId"];
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(CRYPTOPUNKS_HELPER_ADDRESS, CRYPTOPUNKS_HELPER_ABI, provider);
      const dbInfo = store.getters["db"];
      const db = new Dexie(dbInfo.name);
      db.version(dbInfo.version).stores(dbInfo.schemaDefinition);
      let attributes = await dbGetCachedData(db, CRYPTOPUNKSMARKET_V2_ADDRESS + "_" + chainId + "_punks_attributes", []);
      if (Object.keys(attributes).length == 0 || forceUpdate) {
        attributes = [];
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
          attributes[index] = list;
        }
        console.log("attributes: " + JSON.stringify(attributes, null, 2));
        await dbSaveCacheData(db, CRYPTOPUNKSMARKET_V2_ADDRESS + "_" + chainId + "_punks_attributes", attributes);
      }


      // // Load the image
      // var img = new Image();
      // img.src = 'https://github.com/larvalabs/cryptopunks/blob/master/punks.png';
      //
      // img.onload = function() {
      //     console.log("onload");
      //     var canvas = document.createElement('canvas');
      //     canvas.width = img.width;
      //     canvas.height = img.height;
      //     var ctx = canvas.getContext('2d');
      //     ctx.drawImage(img, 0, 0);
      //
      //     // // Create four smaller canvases
      //     // var parts = [];
      //     // for (var i = 0; i < 4; i++) {
      //     //     var partCanvas = document.createElement('canvas');
      //     //     partCanvas.width = img.width / 2;
      //     //     partCanvas.height = img.height / 2;
      //     //     var partCtx = partCanvas.getContext('2d');
      //     //
      //     //     // Draw the appropriate section of the original image onto the smaller canvas
      //     //     partCtx.drawImage(canvas, (i % 2) * (img.width / 2), Math.floor(i / 2) * (img.height / 2), img.width / 2, img.height / 2, 0, 0, img.width / 2, img.height / 2);
      //     //
      //     //     // Convert the smaller canvas to a data URL
      //     //     parts.push(partCanvas.toDataURL('image/png'));
      //     // }
      //     //
      //     // console.log(parts); // Array of base64 strings for each part
      // };

      // const BATCH_SIZE = 20;
      // for (let i = 0; i < 10000; i += BATCH_SIZE) {
      //   console.log("i: " + i + ", BATCH_SIZE: " + BATCH_SIZE);
      //   const imageSvgs = await contract.getImageSvgs(i, BATCH_SIZE);
      //   console.log(now() + " punksModule - imageSvgs: " + JSON.stringify(imageSvgs, null, 2));
      // }

      // const canvas = document.createElement('canvas');
      // const ctx = canvas.getContext('2d');
      // canvas.width = 24;
      // canvas.height = 24;
      //
      // // const images = await contract.getImages(0, 1);
      // // console.log(now() + " punksModule - images[0]: " + JSON.stringify(images[0], null, 2));
      //
      // const data = "0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000fff68efffff68efffff68efffff68efffff68efffff68eff00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000fff68efffff68efffff68efffff68efffff68efffff68efffff68efffff68efffff68eff000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000fff68efffff68efffff68efffff68efffff68efffff68efffff68efffff68efffff68efffff68eff00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000fff68efffff68efffff68efffff68efffff68efffff68efffff68efffff68effae8b61fffff68efffff68efffff68eff000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000fff68efffff68effae8b61fffff68efffff68efffff68efffff68effae8b61ffae8b61ffae8b61fffff68efffff68eff000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000fff68efffff68effae8b61ffae8b61ffae8b61fffff68effae8b61ffae8b61ffae8b61ffae8b61fffff68efffff68eff0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000fff68efffff68efffff68effae8b61ffae8b61ffae8b61ffae8b61ffae8b61ffae8b61ffae8b61ffae8b61fffff68efffff68eff0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000fff68efffff68effae8b61ffae8b61ff507c33ff507c33ffae8b61ffae8b61ffae8b61ff507c33ff507c33fffff68efffff68eff0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000fff68efffff68effae8b61ffae8b61ff000000ff5d8b43ffae8b61ffae8b61ffae8b61ff000000ff5d8b43fffff68efffff68eff0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000fff68efffff68efffff68effae8b61ffae8b61ffae8b61ffae8b61ffae8b61ffae8b61ffae8b61ffae8b61fffff68efffff68eff0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000fff68efffff68efffff68effae8b61ffae8b61ffae8b61ffae8b61ffae8b61ffae8b61ffae8b61ffae8b61fffff68efffff68efffff68eff00000000000000000000000000000000000000000000000000000000000000000000000000000000fff68efffff68efffff68effae8b61ffae8b61ffae8b61ffae8b61ff000000ffae8b61ffae8b61ffae8b61fffff68efffff68efffff68eff000000000000000000000000000000000000000000000000000000000000000000000000fff68efffff68efffff68efffff68efffff68effae8b61ffae8b61ffae8b61ffae8b61ffae8b61ffae8b61ffae8b61fffff68efffff68efffff68efffff68eff00000000000000000000000000000000000000000000000000000000000000000000000000000000fff68efffff68efffff68efffff68effae8b61ff5f1d09ff5f1d09ff5f1d09ffae8b61fffff68efffff68eff000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000ffae8b61ffae8b61ffae8b61ffae8b61ffae8b61ffae8b61ff000000ff00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000ffae8b61ff000000ffae8b61ffae8b61ffae8b61ff000000ff0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000ffae8b61ffae8b61ff000000ff000000ff000000ff000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000ffae8b61ffae8b61ffae8b61ff000000ff00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000ffae8b61ffae8b61ffae8b61ff000000ff0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
      // console.log("data: " + data);
      // console.log("data.length: " + data.length);
      //
      // // 24 x 24 x 4 = 2,304
      // // 24 x 24 x 4 x 2 = 4,608
      // if (data.length == 4610) {
      //   const rgbaData = new Uint8Array(24 * 24 * 4); // 24x24 pixels, 4 bytes per pixel
      //   let rgbaDataIndex = 0;
      //   for (let i = 2; i < data.length; i += 8) {
      //       const byte0 = parseInt(data.slice(i, i + 2), 16);
      //       const byte1 = parseInt(data.slice(i + 2, i + 4), 16);
      //       const byte2 = parseInt(data.slice(i + 4, i + 6), 16);
      //       const byte3 = parseInt(data.slice(i + 6, i + 8), 16);
      //       rgbaData[rgbaDataIndex * 4] = byte0;
      //       rgbaData[rgbaDataIndex * 4 + 1] = byte1;
      //       rgbaData[rgbaDataIndex * 4 + 2] = byte2;
      //       rgbaData[rgbaDataIndex * 4 + 3] = byte3;
      //       console.log("rgbaDataIndex: " + rgbaDataIndex + ", i: " + i + " - " + byte0 + " " + byte1 + " " + byte2 + " " + byte3);
      //       rgbaDataIndex++;
      //   }
      //   console.log("rgbaData: " + JSON.stringify(rgbaData));
      //   function rgbaArrayToBase64(uint8Array) {
      //       const blob = new Blob([uint8Array], { type: 'image/png' });
      //       return new Promise((resolve, reject) => {
      //           const reader = new FileReader();
      //           reader.onloadend = () => resolve(reader.result);
      //           reader.onerror = reject;
      //           reader.readAsDataURL(blob);
      //       });
      //   }
      //   const info = await rgbaArrayToBase64(rgbaData);
      //   console.log("info: " + JSON.stringify(info));
      // }



      // let byteArray = [];
      // for (let i = 2; i < data.length; i += 2) {
      //     byteArray.push(parseInt(data.substr(i, 2), 16));
      // }
      // console.log("byteArray: " + JSON.stringify(byteArray));
      // // Create a Uint8ClampedArray from the byte array
      // const uint8ClampedArray = new Uint8ClampedArray(byteArray);
      // console.log("uint8ClampedArray: " + JSON.stringify(uint8ClampedArray));


      // const bytesBuffer = new TextEncoder().encode(data.slice(2)); // Convert string to Uint8Array
      // console.log("bytesBuffer: " + JSON.stringify(bytesBuffer));
      // const bytesArrayBuffer = bytesBuffer.buffer; // Get the ArrayBuffer from Uint8Array
      // console.table(bytesArrayBuffer);
      // console.log("bytesArrayBuffer: " + JSON.stringify(bytesArrayBuffer));
      // const uint8c = new Uint8ClampedArray(bytesArrayBuffer); // Create Uint8ClampedArray from ArrayBuffer
      // console.log("uint8c: " + JSON.stringify(uint8c));

      // for (let i = 0; i < data.length - 2; i += 8) {
      //   const section = data.slice(i + 2, i + 8 + 2);
      //   console.log(section);
      // }
      // const rgbaData = new Uint8ClampedArray([r, g, b, a]); // Replace r, g, b, a with your RGBA values
      // const imageData = new ImageData(uint8ClampedArray, 1, 1); // For a single pixel

      // const BATCH_SIZE = 400;
      // for (let i = 0; i < 10000; i += BATCH_SIZE) {
      //   console.log("i: " + i + ", BATCH_SIZE: " + BATCH_SIZE);
      //   const images = await contract.getImages(0, BATCH_SIZE);
      //   console.log(now() + " punksModule - images: " + JSON.stringify(images, null, 2));
      // }

      context.commit('setAttributes', attributes);
      db.close();
    },
  },
};
