const Name = {
  template: `
    <div>
      <v-container fluid class="pa-1">
        <v-toolbar density="compact" class="mt-1">
          <h4 class="ml-2">ENS Name</h4>
          <v-menu location="bottom">
            <template v-slot:activator="{ props }">
              <v-btn v-if="name" color="primary" dark v-bind="props" variant="text" class="ma-0 lowercase-btn">
                {{ name.length <= 64 ? name : name.substring(0, 54) + "..." + name.slice(-10) }}
              </v-btn>
            </template>
            <v-list>
              <v-list-subheader>{{ name }}</v-list-subheader>
              <v-list-item @click="copyToClipboard(name);">
                <template v-slot:prepend>
                  <v-icon>mdi-content-copy</v-icon>
                </template>
                <v-list-item-title>Copy name to clipboard</v-list-item-title>
              </v-list-item>
              <v-list-item :href="'https://app.ens.domains/' + name" target="_blank">
                <template v-slot:prepend>
                  <v-icon>mdi-link-variant</v-icon>
                </template>
                <v-list-item-title>View in app.ens.domains</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
          <!-- <p class="ml-5 text-caption text--disabled">
            {{ timestampString }}, {{ block && block.timestamp && formatTimeDiff(block.timestamp) }}
          </p> -->
          <v-spacer></v-spacer>
          <v-tabs v-model="settings.tab" @update:modelValue="saveSettings();" right color="deep-purple-accent-4">
            <v-tab prepend-icon="mdi-card-account-details-outline" text="Name" value="name" class="lowercase-btn"></v-tab>
            <v-tab prepend-icon="mdi-calendar" text="History" value="history" class="lowercase-btn"></v-tab>
          </v-tabs>
        </v-toolbar>
      </v-container>
      <v-tabs-window v-model="settings.tab">
        <v-tabs-window-item value="name">
          <v-card>
            <v-card-text>
              <v-row no-gutters dense>
                <v-col cols="7">
                  <v-row no-gutters dense>
                    <v-col cols="2" align="right">
                      <p class="my-2">Name:</p>
                    </v-col>
                    <v-col cols="10" align="left">
                      <v-btn v-if="name" variant="text" class="lowercase-btn ma-0 px-2">
                        {{ name.length <= 64 ? name : name.substring(0, 54) + "..." + name.slice(-10) }}
                      </v-btn>
                    </v-col>
                  </v-row>
                  <v-row no-gutters dense>
                    <v-col cols="2" align="right">
                      <p class="my-2">Resolved Address:</p>
                    </v-col>
                    <v-col cols="10" align="left">
                      <v-menu location="bottom">
                        <template v-slot:activator="{ props }">
                          <v-btn v-if="resolvedAddress" color="primary" dark v-bind="props" variant="text" class="ma-0 px-2 lowercase-btn">
                            {{ resolvedAddress }}
                          </v-btn>
                        </template>
                        <v-list>
                          <v-list-subheader>{{ resolvedAddress }}</v-list-subheader>
                          <v-list-item :href="'#/address/' + resolvedAddress">
                            <template v-slot:prepend>
                              <v-icon>mdi-arrow-right-bold-outline</v-icon>
                            </template>
                            <v-list-item-title>View</v-list-item-title>
                          </v-list-item>
                          <v-list-item @click="copyToClipboard(resolvedAddress);">
                            <template v-slot:prepend>
                              <v-icon>mdi-content-copy</v-icon>
                            </template>
                            <v-list-item-title>Copy address to clipboard</v-list-item-title>
                          </v-list-item>
                          <v-list-item :href="explorer + 'address/' + resolvedAddress" target="_blank">
                            <template v-slot:prepend>
                              <v-icon>mdi-link-variant</v-icon>
                            </template>
                            <v-list-item-title>View in explorer</v-list-item-title>
                          </v-list-item>
                        </v-list>
                      </v-menu>
                    </v-col>
                  </v-row>
                  <v-row no-gutters dense>
                    <v-col cols="2" align="right">
                      <p class="my-2">ETH Address:</p>
                    </v-col>
                    <v-col cols="10" align="left">
                      <v-menu location="bottom">
                        <template v-slot:activator="{ props }">
                          <v-btn v-if="ethAddress" color="primary" dark v-bind="props" variant="text" class="ma-0 px-2 lowercase-btn">
                            {{ ethAddress }}
                          </v-btn>
                        </template>
                        <v-list>
                          <v-list-subheader>{{ ethAddress }}</v-list-subheader>
                          <v-list-item :href="'#/address/' + ethAddress">
                            <template v-slot:prepend>
                              <v-icon>mdi-arrow-right-bold-outline</v-icon>
                            </template>
                            <v-list-item-title>View</v-list-item-title>
                          </v-list-item>
                          <v-list-item @click="copyToClipboard(ethAddress);">
                            <template v-slot:prepend>
                              <v-icon>mdi-content-copy</v-icon>
                            </template>
                            <v-list-item-title>Copy address to clipboard</v-list-item-title>
                          </v-list-item>
                          <v-list-item :href="explorer + 'address/' + ethAddress" target="_blank">
                            <template v-slot:prepend>
                              <v-icon>mdi-link-variant</v-icon>
                            </template>
                            <v-list-item-title>View in explorer</v-list-item-title>
                          </v-list-item>
                        </v-list>
                      </v-menu>
                    </v-col>
                  </v-row>
                  <v-row no-gutters dense>
                    <v-col cols="2" align="right">
                      <p class="my-2">Avatar:</p>
                    </v-col>
                    <v-col cols="10" align="left">
                      <v-menu location="bottom">
                        <template v-slot:activator="{ props }">
                          <v-btn v-if="avatar" color="primary" dark v-bind="props" variant="text" class="ma-0 px-2 lowercase-btn">
                            {{ avatar.substring(0, 64) + (avatar.length > 64 ? "..." : "") }}
                          </v-btn>
                        </template>
                        <v-list>
                          <v-list-subheader>{{ avatar }}</v-list-subheader>
                          <v-list-item @click="copyToClipboard(avatar);">
                            <template v-slot:prepend>
                              <v-icon>mdi-content-copy</v-icon>
                            </template>
                            <v-list-item-title>Copy address to clipboard</v-list-item-title>
                          </v-list-item>
                          <v-list-item :href="avatar" target="_blank">
                            <template v-slot:prepend>
                              <v-icon>mdi-link-variant</v-icon>
                            </template>
                            <v-list-item-title>View in browser</v-list-item-title>
                          </v-list-item>
                        </v-list>
                      </v-menu>
                    </v-col>
                  </v-row>
                </v-col>
                <v-col cols="5">
                  <v-img :src="avatar" width="400" class="mx-2" style="border: 1px solid currentColor; border-radius: 8px; height: 400px; width: 400px;"></v-img>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-tabs-window-item>
        <v-tabs-window-item value="history">
          <v-data-table :items="eventsList" :headers="eventsHeaders" @click:row="handleEventsClick" density="comfortable">
            <template v-slot:item.when="{ item }">
              <span v-if="item.timestamp">
                {{ formatTimestamp(item.timestamp) }}
              </span>
              <span v-else>
                {{ '#' + item.blockNumber }}
              </span>
              <!-- <a :href="'#/transaction/' + item.txHash">{{ item.txHash.substring(0, 20) + "..." + item.txHash.slice(-18) }}</a> -->
            </template>
            <template v-slot:item.what="{ item }">
              <span v-if="item.type == 'AddrChanged'">
                <!-- node: {{ item.node }} -->
                a: {{ item.a }}
              </span>
              <span v-else-if="item.type == 'AddressChanged'">
                <!-- node: {{ item.node }} -->
                coinType: {{ item.coinType }}
                newAddress: {{ item.newAddress }}
              </span>
              <span v-else-if="item.type == 'ContenthashChanged'">
                <!-- node: {{ item.node }} -->
                hash: {{ item.hash }}
              </span>
              <span v-else-if="item.type == 'NameRegistered'">
                <span v-if="item.label">label: {{ item.label }}</span>
                labelhash: {{ item.labelhash }}
                owner: {{ item.owner }}
                cost: {{ formatETH(item.cost) }}
                expires: {{ formatTimestamp(item.expires) }}
              </span>
              <span v-else-if="item.type == 'NameRenewed'">
                label: {{ item.label }}
                cost: {{ formatETH(item.cost) }}
                expiry: {{ formatTimestamp(item.expiry) }}
              </span>
              <span v-else-if="item.type == 'NameWrapped'">
                label: {{ item.label }}
                owner: {{ item.owner }}
                fuses: {{ item.fuses }}
                expiry: {{ formatTimestamp(item.expiry) }}
              </span>
              <span v-else-if="item.type == 'NewResolver'">
                <!-- node: {{ item.node }} -->
                resolver: {{ item.resolver }}
              </span>
              <span v-else-if="item.type == 'TextChanged'">
                {{ item.key }} => {{ item.value }}
              </span>
              <span v-else>
                {{ item }}
              </span>
              <!-- <a :href="'#/address/' + item.from">{{ item.from.substring(0, 10) + "..." + item.from.slice(-8) }}</a> -->
            </template>
          </v-data-table>
        </v-tabs-window-item>
      </v-tabs-window>
      <!-- <v-card v-if="!inputName">
        <v-card-text>
          Enter ENS name in the search field above
        </v-card-text>
      </v-card> -->
    </div>
  `,
  props: ['inputName'],
  data: function () {
    return {
      initialised: false,
      settings: {
        tab: null,
        version: 0,
      },
      eventsHeaders: [
        { title: 'When', value: 'when', sortable: false, width: "15%" },
        { title: 'Contract', value: 'contract', sortable: false, width: "20%" },
        { title: 'Type', value: 'type', sortable: false, width: "15%" },
        { title: 'What', value: 'what', sortable: false, width: "50%" },
      ],
    };
  },
  computed: {
    explorer() {
      return store.getters['explorer'];
    },
    name() {
      return store.getters['name/name'];
    },
    info() {
      return store.getters['name/info'];
    },
    resolvedAddress() {
      return store.getters['name/info'].resolvedAddress || null;
    },
    ethAddress() {
      return store.getters['name/info'].ethAddress || null;
    },
    avatar() {
      return store.getters['name/info'].avatar || null;
    },
    eventsList() {
      return store.getters['name/eventsList'];
    },
    // timestamp() {
    //   return store.getters['name/timestamp'];
    // },
    // timestampString: {
    //   get: function() {
    //     return this.timestamp && this.formatTimestamp(this.timestamp) || null;
    //   },
    // },

  },
  methods: {
    handleEventsClick(event, row) {
      console.log(now() + " Name - methods.handleEventsClick - event: " + JSON.stringify(event, null, 2) + ", row: " + JSON.stringify(row, null, 2));
      this.$router.push({ name: 'Transaction', params: { inputTxHash: row.item.txHash } });
      store.dispatch('transaction/loadTransaction', row.item.txHash);
    },
    navigateToAddress(link) {
      console.log(now() + " Name - methods.navigateToAddress - link: " + link);
      this.$router.push({ name: 'AddressAddress', params: { inputAddress: link } });
      store.dispatch('address/loadAddress', { inputAddress: link, forceUpdate: false });
    },
    navigateToURL(link) {
      console.log(now() + " Name - methods.navigateToURL - link: " + link);
      window.open(link, "_blank");
    },
    saveSettings() {
      console.log(now() + " Name - methods.saveSettings - settings: " + JSON.stringify(this.settings, null, 2));
      if (this.initialised) {
        localStorage.explorerNameSettings = JSON.stringify(this.settings);
      }
    },
    copyToClipboard(str) {
      navigator.clipboard.writeText(str);
    },
    formatETH(e) {
      if (e) {
        return ethers.utils.formatEther(e).replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
      }
      return null;
    },
    formatTimestamp(ts) {
      if (ts != null) {
        return moment.unix(ts).format("YYYY-MM-DD HH:mm:ss");
      }
      return null;
    },
  },
  beforeCreate() {
    console.log(now() + " Name - beforeCreate");
	},
  mounted() {
    console.log(now() + " Name - mounted - inputName: " + this.inputName);
    if ('explorerNameSettings' in localStorage) {
      const tempSettings = JSON.parse(localStorage.explorerNameSettings);
      console.log(now() + " Name - mounted - tempSettings: " + JSON.stringify(tempSettings));
      if ('version' in tempSettings && tempSettings.version == this.settings.version) {
        this.settings = tempSettings;
      }
    }
    this.initialised = true;
    const t = this;
    setTimeout(function() {
      store.dispatch('name/loadName', { inputName: t.inputName, forceUpdate: false });
    }, 1000);
	},
  unmounted() {
    console.log(now() + " Name - unmounted");
	},
  destroyed() {
    console.log(now() + " Name - destroyed");
	},
};
