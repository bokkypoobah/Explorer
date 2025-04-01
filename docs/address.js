const Address = {
  template: `
    <div>
      <v-card v-if="!inputAddress">
        <v-card-text>
          Enter address in the search field above
        </v-card-text>
      </v-card>
      <v-container fluid class="pa-1">
        <v-toolbar v-if="inputAddress && address" density="compact" class="mt-1">
          <v-menu offset-y>
            <template v-slot:activator="{ props }">
              <v-btn color="primary" dark v-bind="props" class="lowercase-btn">
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
                  <v-icon>mdi-link</v-icon>
                </template>
                <v-list-item-title>View in explorer</v-list-item-title>
              </v-list-item>
              <v-list-item :href="'https://remix.ethereum.org/address/' + address" target="_blank">
                <template v-slot:prepend>
                  <v-icon>mdi-link</v-icon>
                </template>
                <v-list-item-title>View in remix.ethereum.org</v-list-item-title>
              </v-list-item>
              <v-list-item :href="'https://opensea.io/' + address" target="_blank">
                <template v-slot:prepend>
                  <v-icon>mdi-link</v-icon>
                </template>
                <v-list-item-title>View in opensea.io</v-list-item-title>
              </v-list-item>
              <v-list-item :href="'https://app.ens.domains/' + address" target="_blank">
                <template v-slot:prepend>
                  <v-icon>mdi-link</v-icon>
                </template>
                <v-list-item-title>View in app.ens.domains</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
          <v-spacer></v-spacer>
          <!-- <v-btn @click="syncAddress();" color="primary" icon>
            <v-icon>mdi-sync</v-icon>
          </v-btn> -->
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
    explorer() {
      return store.getters['explorer'];
    },
  },
  methods: {
    copyToClipboard(str) {
      navigator.clipboard.writeText(str);
    },
  },
  beforeCreate() {
    console.log(now() + " Address - beforeCreate");
	},
  mounted() {
    console.log(now() + " Address - mounted - inputAddress: " + this.inputAddress);
    const t = this;
    setTimeout(function() {
      store.dispatch('address/loadAddress', { inputAddress: t.inputAddress, forceUpdate: false });
    }, 1000);
	},
  unmounted() {
    console.log(now() + " Address - unmounted");
	},
  destroyed() {
    console.log(now() + " Address - destroyed");
	},
};
