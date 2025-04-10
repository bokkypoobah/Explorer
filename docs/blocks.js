const Blocks = {
  template: `
    <div>
      <!-- <v-card v-if="!inputAddress">
        <v-card-text>
          Enter address in the search field above
        </v-card-text>
      </v-card> -->
      <v-container fluid class="pa-1">
        <v-toolbar density="compact" class="mt-1">
          <h4 class="ml-2">Blocks</h4>
          <v-spacer></v-spacer>
          <v-btn @click="syncAddress();" color="primary" icon>
            <v-icon>mdi-refresh</v-icon>
          </v-btn>
          <v-spacer></v-spacer>
          <v-tabs right color="deep-purple-accent-4">
            <v-tab :to="'/blocks/latest'" class="lowercase-btn">Latest</v-tab>
            <v-tab :to="'/blocks/browse'" class="lowercase-btn">Browse</v-tab>
          </v-tabs>
        </v-toolbar>
        <router-view />
      </v-container>
    </div>
  `,
  props: ['inputAddress'],
  data: function () {
    return {
    };
  },
  computed: {
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
    // syncAddress() {
    //   console.log(now() + " Blocks - methods.syncAddress");
    //   const address = store.getters["address/address"];
    //   console.log(now() + " Blocks - methods.syncAddress - address: " + address);
    //   store.dispatch('address/loadAddress', { inputAddress: address, forceUpdate: true });
    // },
    // copyToClipboard(str) {
    //   navigator.clipboard.writeText(str);
    // },
  },
  beforeCreate() {
    console.log(now() + " Blocks - beforeCreate");
	},
  mounted() {
    console.log(now() + " Blocks - mounted - inputAddress: " + this.inputAddress);
    const t = this;
    setTimeout(function() {
      store.dispatch('address/loadAddress', { inputAddress: t.inputAddress, forceUpdate: false });
    }, 1000);
	},
  unmounted() {
    console.log(now() + " Blocks - unmounted");
	},
  destroyed() {
    console.log(now() + " Blocks - destroyed");
	},
};
