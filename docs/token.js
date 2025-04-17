const Token = {
  template: `
    <div>
      Token WIP
      <v-card v-if="!inputAddress">
        <v-card-text>
          Enter address in the search field above
        </v-card-text>
      </v-card>
      <v-container fluid class="pa-1">
        <v-toolbar v-if="inputAddress && address" density="compact" class="mt-1">
          <v-menu location="bottom">
            <template v-slot:activator="{ props }">
              <v-btn color="primary" dark v-bind="props" variant="text" class="lowercase-btn">
                {{ address }}
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="copyToClipboard(address);">
                <template v-slot:prepend>
                  <v-icon>mdi-content-copy</v-icon>
                </template>
                <v-list-item-title>Copy address to clipboard</v-list-item-title>
              </v-list-item>
              <v-list-item :href="explorer + 'address/' + address" target="_blank">
                <template v-slot:prepend>
                  <v-icon>mdi-link-variant</v-icon>
                </template>
                <v-list-item-title>View in explorer</v-list-item-title>
              </v-list-item>
              <v-list-item :href="'https://remix.ethereum.org/address/' + address" target="_blank">
                <template v-slot:prepend>
                  <v-icon>mdi-link-variant</v-icon>
                </template>
                <v-list-item-title>View in remix.ethereum.org</v-list-item-title>
              </v-list-item>
              <v-list-item :href="'https://opensea.io/' + address" target="_blank">
                <template v-slot:prepend>
                  <v-icon>mdi-link-variant</v-icon>
                </template>
                <v-list-item-title>View in opensea.io</v-list-item-title>
              </v-list-item>
              <v-list-item :href="'https://app.ens.domains/' + address" target="_blank">
                <template v-slot:prepend>
                  <v-icon>mdi-link-variant</v-icon>
                </template>
                <v-list-item-title>View in app.ens.domains</v-list-item-title>
              </v-list-item>
              <div v-if="type == 'safe'">
                <v-divider inset></v-divider>
                <v-list-subheader inset>Gnosis Safe v{{ version }}</v-list-subheader>
                <v-list-item :href="'https://app.safe.global/home?safe=eth:' + address" target="_blank">
                  <template v-slot:prepend>
                    <v-icon>mdi-link-variant</v-icon>
                  </template>
                  <v-list-item-title>View in app.safe.global</v-list-item-title>
                </v-list-item>
                <v-list-item :href="explorer + 'address/' + implementation" target="_blank">
                  <template v-slot:prepend>
                    <v-icon>mdi-link-variant</v-icon>
                  </template>
                  <v-list-item-title>View implementation in explorer</v-list-item-title>
                </v-list-item>
                <v-list-item :href="'https://remix.ethereum.org/address/' + implementation" target="_blank">
                  <template v-slot:prepend>
                    <v-icon>mdi-link-variant</v-icon>
                  </template>
                  <v-list-item-title>View implementation in remix.ethereum.org</v-list-item-title>
                </v-list-item>
              </div>
            </v-list>
          </v-menu>
          <v-spacer></v-spacer>
          <v-btn @click="syncAddress();" color="primary" icon>
            <v-icon>mdi-refresh</v-icon>
          </v-btn>
          <v-spacer></v-spacer>
          <v-tabs right color="deep-purple-accent-4">
            <v-tab :disabled="!address" :to="'/address/' + address" class="lowercase-btn">Address</v-tab>
            <v-tab :disabled="!address" :to="'/address/' + address + '/contract'" class="lowercase-btn">Contract</v-tab>
            <v-tab :disabled="!address" :to="'/address/' + address + '/functions'" class="lowercase-btn">Functions</v-tab>
            <v-tab :disabled="!address" :to="'/address/' + address + '/tokens'" class="lowercase-btn">Tokens</v-tab>
            <v-tab :disabled="!address" :to="'/address/' + address + '/transactions'" class="lowercase-btn">Transactions</v-tab>
            <v-tab :disabled="!address" :to="'/address/' + address + '/events'" class="lowercase-btn">Events</v-tab>
          </v-tabs>
        </v-toolbar>
        <router-view v-if="inputAddress && address" />
      </v-container>
    </div>
  `,
  props: ['inputAddress'],
  data: function () {
    return {
    };
  },
  computed: {
    address() {
      return store.getters['address/address'];
    },
    type() {
      return store.getters['address/info'].type || null;
    },
    version() {
      return store.getters['address/info'].version || null;
    },
    implementation() {
      return store.getters['address/info'].implementation || null;
    },
    explorer() {
      return store.getters['explorer'];
    },
  },
  methods: {
    syncAddress() {
      console.log(now() + " Token - methods.syncAddress");
      const address = store.getters["address/address"];
      console.log(now() + " Token - methods.syncAddress - address: " + address);
      store.dispatch('address/loadAddress', { inputAddress: address, forceUpdate: true });
    },
    copyToClipboard(str) {
      navigator.clipboard.writeText(str);
    },
  },
  beforeCreate() {
    console.log(now() + " Token - beforeCreate");
	},
  mounted() {
    console.log(now() + " Token - mounted - inputAddress: " + this.inputAddress);
    const t = this;
    setTimeout(function() {
      store.dispatch('address/loadAddress', { inputAddress: t.inputAddress, forceUpdate: false });
    }, 1000);
	},
  unmounted() {
    console.log(now() + " Token - unmounted");
	},
  destroyed() {
    console.log(now() + " Token - destroyed");
	},
};
