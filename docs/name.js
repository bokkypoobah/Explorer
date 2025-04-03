const Name = {
  template: `
    <div>
      <!-- <v-sheet :height="200" :width="200">
        Blah
      </v-sheet> -->
      <v-card v-if="!inputName">
        <v-card-text>
          Enter ENS name in the search field above
        </v-card-text>
      </v-card>
      <v-container v-if="inputName && name" fluid class="pa-1">
        <v-card>
          <v-card-text>
            <v-row>
              <v-col cols="2">
                <v-tabs v-model="settings.tab" @update:modelValue="saveSettings();" color="primary" direction="vertical">
                  <v-tab prepend-icon="mdi-card-account-details-outline" text="Name" value="name" class="lowercase-btn"></v-tab>
                  <v-tab prepend-icon="mdi-calendar" text="History" value="history" class="lowercase-btn"></v-tab>
                </v-tabs>
              </v-col>
              <v-col cols="10">

                <v-tabs-window v-model="settings.tab">
                  <v-tabs-window-item value="name">
                    <v-row dense>
                      <v-col cols="8">
                        <v-row dense>
                          <v-col cols="11">
                            <!-- append-inner-icon="mdi-content-copy"
                            @click:append-inner="copyToClipboard(name)" -->
                            <v-text-field
                              readonly
                              v-model="name"
                              label="ENS Name:"
                              append-icon="mdi-link"
                              @click:append="navigateToURL('https://app.ens.domains/' + name)"
                              density="compact"
                              hide-details
                            >
                            </v-text-field>
                          </v-col>
                        </v-row>
                        <v-row dense>
                          <v-col cols="11">
                            <!-- append-inner-icon="mdi-content-copy"
                            @click:append-inner="copyToClipboard(resolvedAddress)" -->
                            <v-text-field
                              readonly
                              v-model="resolvedAddress"
                              label="Resolved Address:"
                              append-icon="mdi-arrow-right-bold-outline"
                              @click:append="navigateToAddress(resolvedAddress)"
                              density="compact"
                              hide-details
                            >
                            </v-text-field>
                          </v-col>
                        </v-row>
                        <v-row dense>
                          <v-col cols="11">
                            <!-- append-inner-icon="mdi-content-copy"
                            @click:append-inner="copyToClipboard(ethAddress)" -->
                            <v-text-field
                              readonly
                              v-model="ethAddress"
                              label="ETH Address:"
                              append-icon="mdi-arrow-right-bold-outline"
                              @click:append="navigateToAddress(ethAddress)"
                              density="compact"
                              hide-details
                            >
                            </v-text-field>
                          </v-col>
                        </v-row>
                        <v-row dense>
                          <v-col cols="11">
                            <!-- append-inner-icon="mdi-content-copy"
                            @click:append-inner="copyToClipboard(avatar)" -->
                            <v-text-field
                              readonly
                              v-model="avatar"
                              label="Avatar:"
                              append-icon="mdi-link"
                              @click:append="navigateToURL(avatar)"
                              density="compact"
                              hide-details
                            >
                            </v-text-field>
                          </v-col>
                        </v-row>
                      </v-col>
                      <v-col cols="4">
                        <v-img :src="avatar" width="200"></v-img>
                      </v-col>
                    </v-row>
                  </v-tabs-window-item>
                  <v-tabs-window-item value="history">
                    <v-data-table :items="eventsList" :headers="eventsHeaders" density="compact">
                      <template v-slot:item.when="{ item }">
                        {{ item.blockNumber }}
                        <!-- <a :href="'#/transaction/' + item.txHash">{{ item.txHash.substring(0, 20) + "..." + item.txHash.slice(-18) }}</a> -->
                      </template>
                      <template v-slot:item.what="{ item }">
                        {{ item }}
                        <!-- <a :href="'#/address/' + item.from">{{ item.from.substring(0, 10) + "..." + item.from.slice(-8) }}</a> -->
                      </template>
                    </v-data-table>
                    <!-- eventsList: {{ eventsList }}
                    <br />
                    info: {{ info }} -->
                  </v-tabs-window-item>
                </v-tabs-window>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-container>
    </div>
  `,
  props: ['inputName'],
  data: function () {
    return {
      settings: {
        tab: null,
        version: 0,
      },
      eventsHeaders: [
        { title: 'When', value: 'when', sortable: false, width: "15%" },
        { title: 'Contract', value: 'contract', sortable: false, width: "15%" },
        { title: 'What', value: 'what', sortable: false, width: "70%" },
      ],
    };
  },
  computed: {
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
      localStorage.explorerNameSettings = JSON.stringify(this.settings);
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
