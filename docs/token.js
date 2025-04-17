const Token = {
  template: `
    <div>
      <v-container fluid class="pa-1">
        <v-toolbar density="compact" class="mt-1">
          <h4 class="ml-2">Token</h4>
          <render-address v-if="address" :address="address"></render-address>
          <p class="ml-5 text-caption text--disabled">
            {{ type && type.replace(/erc/, "ERC-") || "" }} {{ symbol }} {{ name && ("'" + name + "'") || "" }} {{ decimals }}
          </p>
          <v-spacer></v-spacer>
          <v-btn @click="syncToken();" color="primary" icon v-tooltip="'Sync Token Info'">
            <v-icon>mdi-refresh</v-icon>
          </v-btn>
          <v-btn @click="syncTokenEvents();" color="primary" icon v-tooltip="'Sync Token Events'">
            <v-icon>mdi-download-multiple</v-icon>
          </v-btn>
          <v-spacer></v-spacer>
          <v-tabs v-model="settings.tab" @update:modelValue="saveSettings();" right color="deep-purple-accent-4">
            <v-tab prepend-icon="mdi-cash-multiple" text="Info" value="info" class="lowercase-btn"></v-tab>
            <v-tab prepend-icon="mdi-text-long" text="Transfers" value="transfers" class="lowercase-btn"></v-tab>
          </v-tabs>
        </v-toolbar density="compact" class="mt-1">
        <v-tabs-window v-model="settings.tab">
          <v-tabs-window-item value="info">
            <v-card>
              <v-card-text>
                <v-row no-gutters dense>
                  <v-col cols="2" align="right">
                    <p class="my-2">Address:</p>
                  </v-col>
                  <v-col cols="6" align="left">
                    <render-address v-if="address" :address="address"></render-address>
                  </v-col>
                </v-row>
                <v-row no-gutters dense>
                  <v-col cols="2" align="right">
                    <p class="my-2">Type:</p>
                  </v-col>
                  <v-col cols="6" align="left">
                    <v-btn v-if="type" variant="text" class="lowercase-btn ma-0 px-2" style="min-width: 0px;">
                      {{ type && type.replace(/erc/, "ERC-") || "" }}
                    </v-btn>
                  </v-col>
                </v-row>
                <v-row v-if="type == 'erc20'" no-gutters dense>
                  <v-col cols="2" align="right">
                    <p class="my-2">Symbol:</p>
                  </v-col>
                  <v-col cols="6" align="left">
                    <v-btn v-if="symbol" variant="text" class="lowercase-btn ma-0 px-2" style="min-width: 0px;">
                      {{ symbol }}
                    </v-btn>
                  </v-col>
                </v-row>
                <v-row no-gutters dense>
                  <v-col cols="2" align="right">
                    <p class="my-2">Name:</p>
                  </v-col>
                  <v-col cols="6" align="left">
                    <v-btn v-if="name" variant="text" class="lowercase-btn ma-0 px-2" style="min-width: 0px;">
                      {{ name }}
                    </v-btn>
                  </v-col>
                </v-row>
                <v-row v-if="type == 'erc20'" no-gutters dense>
                  <v-col cols="2" align="right">
                    <p class="my-2">Decimals:</p>
                  </v-col>
                  <v-col cols="6" align="left">
                    <v-btn v-if="decimals" variant="text" class="lowercase-btn ma-0 px-2" style="min-width: 0px;">
                      {{ decimals }}
                    </v-btn>
                  </v-col>
                </v-row>
                <v-row v-if="type == 'erc20'" no-gutters dense>
                  <v-col cols="2" align="right">
                    <p class="my-2">Total Supply:</p>
                  </v-col>
                  <v-col cols="6" align="left">
                    <v-btn v-if="totalSupply" variant="text" class="lowercase-btn ma-0 px-2" style="min-width: 0px;">
                      {{ totalSupply && formatUnits(totalSupply) || "" }}
                    </v-btn>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-tabs-window-item>
          <v-tabs-window-item value="transfers">
            Transfers
          </v-tabs-window-item>
        </v-tabs-window>
      </v-container fluid class="pa-1">

      <!-- <v-card v-if="!inputAddress">
        <v-card-text>
          Enter address in the search field above
        </v-card-text>
      </v-card> -->
      <!-- <v-container fluid class="pa-1">
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
          <v-btn @click="syncToken();" color="primary" icon>
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
      </v-container> -->
    </div>
  `,
  props: ['inputAddress'],
  data: function () {
    return {
      initialised: false,
      settings: {
        tab: null,
        version: 0,
      },
    };
  },
  computed: {
    address() {
      return store.getters['token/address'];
    },
    type() {
      return store.getters['token/info'].type || null;
    },
    name() {
      return store.getters['token/info'].name || null;
    },
    symbol() {
      return store.getters['token/info'].symbol || null;
    },
    decimals() {
      return store.getters['token/info'].decimals || null;
    },
    totalSupply() {
      return store.getters['token/info'].totalSupply || null;
    },
    version() {
      return store.getters['token/info'].version || null;
    },
    implementation() {
      return store.getters['token/info'].implementation || null;
    },
    explorer() {
      return store.getters['explorer'];
    },
  },
  methods: {
    syncToken() {
      console.log(now() + " Token - methods.syncToken");
      const address = store.getters["token/address"];
      console.log(now() + " Token - methods.syncToken - address: " + address);
      store.dispatch('token/loadToken', { inputAddress: address, forceUpdate: true });
    },
    syncTokenEvents() {
      console.log(now() + " Token - methods.syncTokenEvents");
      const address = store.getters["token/address"];
      console.log(now() + " Token - methods.syncTokenEvents - address: " + address);
      store.dispatch('token/syncTokenEvents', { inputAddress: address, forceUpdate: true });
    },
    formatUnits(e, decimals) {
      if (e) {
        return ethers.utils.formatUnits(e, decimals).replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
      }
      return null;
    },
    saveSettings() {
      // console.log(now() + " Token - methods.saveSettings - settings: " + JSON.stringify(this.settings, null, 2));
      if (this.initialised) {
        localStorage.explorerTokenSettings = JSON.stringify(this.settings);
      }
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

    if ('explorerTokenSettings' in localStorage) {
      const tempSettings = JSON.parse(localStorage.explorerTokenSettings);
      console.log(now() + " Token - mounted - tempSettings: " + JSON.stringify(tempSettings));
      if ('version' in tempSettings && tempSettings.version == this.settings.version) {
        this.settings = tempSettings;
      }
    }
    this.initialised = true;
    console.log(now() + " Block - mounted - this.settings: " + JSON.stringify(this.settings));

    const t = this;
    setTimeout(function() {
      store.dispatch('token/loadToken', { inputAddress: t.inputAddress, forceUpdate: false });
    }, 1000);
	},
  unmounted() {
    console.log(now() + " Token - unmounted");
	},
  destroyed() {
    console.log(now() + " Token - destroyed");
	},
};
