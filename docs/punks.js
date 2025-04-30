const Punks = {
  template: `
    <div>
      <v-container fluid class="pa-1">
        <v-toolbar density="compact" class="mt-1">
          <h4 class="ml-2">Punks</h4>
          <v-spacer></v-spacer>
          <!-- <v-btn @click="syncAddress();" color="primary" icon>
            <v-icon>mdi-refresh</v-icon>
          </v-btn> -->
          <v-spacer></v-spacer>
          <!-- <v-tabs right color="deep-purple-accent-4">
            <v-tab :to="'/blocks/browse'" prepend-icon="mdi-format-list-numbered" class="lowercase-btn">Browse</v-tab>
          </v-tabs> -->
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
    //   return store.getters['explorer'];
    // },
  },
  methods: {
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
    console.log(now() + " Punks - mounted");
    // const t = this;
    // setTimeout(function() {
    //   store.dispatch('address/loadAddress', { inputAddress: t.inputAddress, forceUpdate: false });
    // }, 1000);
	},
  unmounted() {
    console.log(now() + " Punks - unmounted");
	},
  destroyed() {
    console.log(now() + " Punks - destroyed");
	},
};
