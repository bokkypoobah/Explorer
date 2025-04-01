const Address = {
  template: `
    <div>
      <v-card>
        <v-card-text>
          <div v-if="!inputAddress">
            Enter address in the search field above
          </div>
          <!-- Address
          <h3 class="ms-2 mt-2">Address {{ inputAddress }}</h3> -->

          <div v-if="inputAddress">
            <v-toolbar density="compact" class="mt-2">
              <!-- <v-menu offset-y>
                <template v-slot:activator="{ props }">
                  <v-btn color="primary" dark v-bind="props" class="lowercase-btn">
                    {{ addressPathInputAddress }}
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item @click="copyToClipboard(addressPathInputAddress);">
                    <template v-slot:prepend>
                      <v-icon>mdi-content-copy</v-icon>
                    </template>
                    <v-list-item-title>Copy address to clipboard</v-list-item-title>
                  </v-list-item>
                  <v-list-item :href="explorer + 'address/' + addressPathInputAddress" target="_blank">
                    <template v-slot:prepend>
                      <v-icon>mdi-link</v-icon>
                    </template>
                    <v-list-item-title>View in explorer</v-list-item-title>
                  </v-list-item>
                  <v-list-item :href="'https://remix.ethereum.org/address/' + addressPathInputAddress" target="_blank">
                    <template v-slot:prepend>
                      <v-icon>mdi-link</v-icon>
                    </template>
                    <v-list-item-title>View in remix.ethereum.org</v-list-item-title>
                  </v-list-item>
                  <v-list-item :href="'https://opensea.io/' + addressPathInputAddress" target="_blank">
                    <template v-slot:prepend>
                      <v-icon>mdi-link</v-icon>
                    </template>
                    <v-list-item-title>View in opensea.io</v-list-item-title>
                  </v-list-item>
                  <v-list-item :href="'https://app.ens.domains/' + addressPathInputAddress" target="_blank">
                    <template v-slot:prepend>
                      <v-icon>mdi-link</v-icon>
                    </template>
                    <v-list-item-title>View in app.ens.domains</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu> -->
              <v-spacer></v-spacer>
              <!-- <v-btn @click="syncAddress();" color="primary" icon>
                <v-icon>mdi-sync</v-icon>
              </v-btn> -->
              <v-spacer></v-spacer>
              <v-tabs right color="deep-purple-accent-4">
                <v-tab :disabled="!inputAddress" :to="'/address/' + inputAddress + '/summary'" class="lowercase-btn">Summary</v-tab>
                <v-tab :disabled="!inputAddress" :to="'/address/' + inputAddress + '/contract'" class="lowercase-btn">Contract</v-tab>
                <v-tab :disabled="!inputAddress" :to="'/address/' + inputAddress + '/functions'" class="lowercase-btn">Functions</v-tab>
                <v-tab :disabled="!inputAddress" :to="'/address/' + inputAddress + '/tokens'" class="lowercase-btn">Tokens</v-tab>
                <v-tab :disabled="!inputAddress" :to="'/address/' + inputAddress + '/transactions'" class="lowercase-btn">Transactions</v-tab>
                <v-tab :disabled="!inputAddress" :to="'/address/' + inputAddress + '/events'" class="lowercase-btn">Events</v-tab>
              </v-tabs>
            </v-toolbar>

            <router-view />
          </div>
        </v-card-text>
        
        <!-- <router-view v-slot="{ Component }">
          <component :is="Component" />
        </router-view> -->

        <!-- <v-card-text>
          <v-textarea :model-value="JSON.stringify(info, null, 2)" label="Info" rows="20">
          </v-textarea>
        </v-card-text> -->
      </v-card>
    </div>
  `,
  props: ['inputAddress', 'tab'],
  data: function () {
    return {
      // tab: null,
      // address: null,
    };
  },
  computed: {
  },
  methods: {
  },
  beforeCreate() {
    console.log(now() + " Address - beforeCreate");
	},
  mounted() {
    console.log(now() + " Address - mounted - inputAddress: " + this.inputAddress);
    const t = this;
    // setTimeout(function() {
    //   store.dispatch('address/loadAddress', { inputAddress: t.inputAddress, forceUpdate: false });
    // }, 1000);
	},
  unmounted() {
    console.log(now() + " Address - unmounted");
	},
  destroyed() {
    console.log(now() + " Address - destroyed");
	},
};
