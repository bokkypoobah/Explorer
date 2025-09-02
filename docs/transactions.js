const Transactions_ = {
  template: `
    <div>
      <v-container fluid class="pa-1">
        <v-toolbar density="compact" class="mt-1">
          <v-card-item prepend-icon="mdi-format-list-numbered" title="Transactions"></v-card-item>
          <v-spacer></v-spacer>
          <!-- <v-btn @click="syncAddress();" color="primary" icon>
            <v-icon>mdi-refresh</v-icon>
          </v-btn> -->
          <v-spacer></v-spacer>
          <v-tabs right color="deep-purple-accent-4">
            <v-tab :to="'/transactions/latest'" class="lowercase-btn">Transactions In Latest {{ latestCount }} Blocks</v-tab>
            <v-tab disabled :to="'/transactions/search'" class="lowercase-btn">Search</v-tab>
          </v-tabs>
        </v-toolbar>
        <router-view />
      </v-container>
    </div>
  `,
  // props: ['inputAddress'],
  data: function () {
    return {
    };
  },
  computed: {
    latestCount() {
      return store.getters['blocks/latestCount'];
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
    //   return store.getters['web3/explorer'];
    // },
  },
  methods: {
    // syncAddress() {
    //   console.log(now() + " Transactions_ - methods.syncAddress");
    //   const address = store.getters["address/address"];
    //   console.log(now() + " Transactions_ - methods.syncAddress - address: " + address);
    //   store.dispatch('address/loadAddress', { inputAddress: address, forceUpdate: true });
    // },
    // copyToClipboard(str) {
    //   navigator.clipboard.writeText(str);
    // },
  },
  beforeCreate() {
    console.log(now() + " Transactions_ - beforeCreate");
	},
  mounted() {
    console.log(now() + " Transactions_ - mounted");
    // const t = this;
    // setTimeout(function() {
    //   store.dispatch('address/loadAddress', { inputAddress: t.inputAddress, forceUpdate: false });
    // }, 1000);
	},
  unmounted() {
    console.log(now() + " Transactions_ - unmounted");
	},
  destroyed() {
    console.log(now() + " Transactions_ - destroyed");
	},
};
