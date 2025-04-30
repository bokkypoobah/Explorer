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
      store.dispatch('punks/syncPunks');
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
