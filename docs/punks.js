const Punks = {
  template: `
    <div>
      <v-container fluid class="pa-1">
        <v-toolbar density="compact" class="mt-1">
          <h4 class="ml-2">Punks</h4>
          <v-spacer></v-spacer>
          <v-btn :disabled="chainId != 1" @click="syncPunks();" color="primary" icon>
            <v-icon>mdi-refresh</v-icon>
          </v-btn>
          <v-spacer></v-spacer>
        </v-toolbar>
        attributesList: {{ attributesList }}
        <br />
        <!-- attributesMap: {{ attributesMap }}
        <br /> -->
        Punk #0
        <v-img :src="'data:image/png;base64,' + images[0]" width="400" style="image-rendering: pixelated;">
        </v-img>
        {{ attributes[0] }}
        <!-- <pre>
images: {{ JSON.stringify(images, null, 2).substring(0, 20000) }}
attributes: {{ JSON.stringify(attributes, null, 2).substring(0, 20000) }}
        </pre> -->
      </v-container>
    </div>
  `,
  props: ['inputPunkId'],
  data: function () {
    return {
    };
  },
  computed: {
    chainId() {
      return store.getters['chainId'];
    },
    attributes() {
      return store.getters['punks/attributes'];
    },
    images() {
      return PUNK_IMAGES;
    },
    attributesMap() {
      const results = {};
      for (const [punkId, attributes] of this.attributes.entries()) {
        // console.log(punkId + " => " + JSON.stringify(attributes));
        for (const attribute of attributes) {
          const [trait, option] = attribute;
          // console.log(punkId + " => " + trait + " " + option);
          if (!(trait in results)) {
            results[trait] = {};
          }
          if (!(option in results[trait])) {
            results[trait][option] = [];
          }
          results[trait][option].push(parseInt(punkId));
        }
      }
      // console.log("results: " + JSON.stringify(results, null, 2));
      return results;
    },
    attributesList() {
      const results = [];
      for (const [trait, traitInfo] of Object.entries(this.attributesMap)) {
        // console.log(trait + " => " + JSON.stringify(traitInfo));
        const array = [];
        for (const [option, punkIds] of Object.entries(traitInfo)) {
          // console.log(trait + "/" + option + " => " + JSON.stringify(punkIds));
          array.push({ option, count: punkIds.length });
        }
        array.sort((a, b) => {
          return a.count - b.count;
        });
        results.push({ trait, options: array });
      }
      console.log("results: " + JSON.stringify(results, null, 2));
      return results;
    },
    // address() {
    //   return store.getters['address/address'];
    // },
    // type() {
    //   return store.getters['address/info'].type || null;
    // },
    // version() {
    //   return store.getters['address/info'].version || null;
    // },
    // implementation() {
    //   return store.getters['address/info'].implementation || null;
    // },
    // explorer() {
    //   return store.getters['explorer'];
    // },
  },
  methods: {
    syncPunks() {
      console.log(now() + " Token - methods.syncPunks - this.inputPunkId: " + this.inputPunkId);
      store.dispatch('punks/syncPunks', true);
    },
    // syncAddress() {
    //   console.log(now() + " Punks - methods.syncAddress");
    //   const address = store.getters["address/address"];
    //   console.log(now() + " Punks - methods.syncAddress - address: " + address);
    //   store.dispatch('address/loadAddress', { inputAddress: address, forceUpdate: true });
    // },
    // copyToClipboard(str) {
    //   navigator.clipboard.writeText(str);
    // },
  },
  beforeCreate() {
    console.log(now() + " Punks - beforeCreate");
	},
  mounted() {
    console.log(now() + " Punks - mounted - this.inputPunkId: " + this.inputPunkId);
    const t = this;
    setTimeout(function() {
      store.dispatch('punks/startup');
    }, 100);
	},
  unmounted() {
    console.log(now() + " Punks - unmounted");
	},
  destroyed() {
    console.log(now() + " Punks - destroyed");
	},
};
