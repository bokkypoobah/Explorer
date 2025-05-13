const Portfolio = {
  template: `
    <div>
      <v-container fluid class="pa-1">
        <v-toolbar density="compact" class="mt-1">
          <h4 class="ml-2">Portfolio</h4>
          <!-- <render-address v-if="address" :address="address"></render-address> -->
          <!-- <p class="ml-5 text-caption text--disabled">
            {{ type && type.substring(0, 3) == "erc" && type.replace(/erc/, "ERC-") || "Not a token contract" }} {{ symbol }} {{ name && ("'" + name + "'") || "" }} {{ decimals }}
          </p> -->
          <v-spacer></v-spacer>
          <!-- <v-btn v-if="sync.info == null" @click="syncToken();" color="primary" icon v-tooltip="'Sync Portfolio Info'">
            <v-icon>mdi-refresh</v-icon>
          </v-btn> -->
          <!-- <v-btn v-if="sync.info == null" @click="syncTokenEvents();" color="primary" icon v-tooltip="'Sync Portfolio Events'">
            <v-icon>mdi-download</v-icon>
          </v-btn> -->
          <!-- <v-btn v-if="sync.info == null" @click="syncTokenEvents();" color="primary" icon v-tooltip="'Retrieve Timestamps'">
            <v-icon>mdi-clock-outline</v-icon>
          </v-btn> -->
          <!-- <v-btn v-if="sync.info == null" :disabled="!reservoir" @click="syncTokenMetadata();" color="primary" icon v-tooltip="'Sync Portfolio Metadata'">
            <v-icon>mdi-image-outline</v-icon>
          </v-btn> -->
          <v-btn v-if="sync.info != null" @click="setSyncHalt();" color="primary" icon v-tooltip="'Halt syncing'">
            <v-icon>mdi-stop</v-icon>
          </v-btn>
          <v-progress-circular v-if="sync.info != null" color="primary" :model-value="sync.total ? (parseInt(sync.completed * 100 / sync.total)) : 0" :size="30" :width="6" v-tooltip="sync.info + ': Block #' + commify0(sync.completed) + ' of ' + commify0(sync.total)"></v-progress-circular>
          <v-spacer></v-spacer>
          <v-tabs v-model="settings.tab" @update:modelValue="saveSettings();" right color="deep-purple-accent-4">
            <v-tab prepend-icon="mdi-text-long" text="Summary" value="summary" class="lowercase-btn"></v-tab>
            <v-tab prepend-icon="mdi-cash-multiple" text="Fungibles" value="fungibles" class="lowercase-btn"></v-tab>
            <v-tab prepend-icon="mdi-cards-playing-heart-multiple-outline" text="Non-Fungibles" value="nonfungibles" class="lowercase-btn"></v-tab>
            <v-tab prepend-icon="mdi-alphabetical" text="Names" value="names" class="lowercase-btn"></v-tab>
            <v-tab prepend-icon="mdi-check-outline" text="Approvals" value="approvals" class="lowercase-btn"></v-tab>
            <v-tab prepend-icon="mdi-math-log" text="Activity" value="activity" class="lowercase-btn"></v-tab>
            <v-tab prepend-icon="mdi-cog" text="Config" value="config" class="lowercase-btn"></v-tab>
          </v-tabs>
        </v-toolbar>

        <v-tabs-window v-model="settings.tab">
          <v-tabs-window-item value="summary">
            TODO: Summary
          </v-tabs-window-item>
          <v-tabs-window-item value="fungibles">
            TODO: ERC-20 Fungibles
          </v-tabs-window-item>
          <v-tabs-window-item value="nonfungibles">
            TODO: ERC-721 and ERC-1155 Non-Fungibles
          </v-tabs-window-item>
          <v-tabs-window-item value="names">
            TODO: ENS Names, with expiry information
          </v-tabs-window-item>
          <v-tabs-window-item value="approvals">
            TODO: ERC-20, ERC-721 and ERC-1155 Approvals
          </v-tabs-window-item>
          <v-tabs-window-item value="activity">
            TODO: Activity
          </v-tabs-window-item>
          <v-tabs-window-item value="config">
            <v-card>
              <v-card-text>
                <v-card-title>Portfolios</v-card-title>
                <v-data-table :headers="portfoliosHeaders" :items="portfoliosList" density="compact" style="position: relative;">
                  <template v-slot:item.actions="{ item }">
                    <v-btn @click="settings.portfolioDialog = 'edit'" prepend-icon="mdi-bank" variant="text" class="lowercase-btn">Edit</v-btn>
                  </template>
                  <template v-slot:body.append>
                    <tr>
                      <td></td>
                      <td></td>
                      <td>
                        <v-btn @click="settings.portfolioDialog = 'add';" prepend-icon="mdi-bank-plus" variant="text" class="lowercase-btn">Add</v-btn>
                      </td>
                    </tr>
                  </template>
                </v-data-table>
                <v-dialog :model-value="settings.portfolioDialog != null" max-width="500px">
                  <v-card>
                    <v-card-item :prepend-icon="settings.portfolioDialog == 'add' ? 'mdi-bank-plus' : 'mdi-bank'" :title="settings.portfolioDialog == 'add' ? 'Portfolio - Add' : 'Portfolio - Edit'"></v-card-item>
                    <v-card-text>
                      <!-- <v-text-field v-model="dialogData.title" label="Title"></v-text-field> -->
                    </v-card-text>
                    <v-card-actions>
                      <v-btn v-if="settings.portfolioDialog == 'add'" @click="addOrSavePortfolio" prepend-icon="mdi-check" variant="text" class="lowercase-btn">Add</v-btn>
                      <v-btn v-if="settings.portfolioDialog == 'edit'" @click="addOrSavePortfolio" prepend-icon="mdi-check" variant="text" class="lowercase-btn">Save</v-btn>
                      <v-btn @click="settings.portfolioDialog = null;" prepend-icon="mdi-window-close" variant="text" class="lowercase-btn">Cancel</v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </v-card-text>
            </v-card>
          </v-tabs-window-item>
        </v-tabs-window>
      </v-container>
    </div>
  `,
  props: ['inputPortfolio'],
  data: function () {
    return {
      initialised: false,
      settings: {
        tab: "config", // TODO: null,
        owners: {
          sortBy: [{ key: "balances", order: "desc" }],
          itemsPerPage: 10,
          currentPage: 1,
          top: 20,
        },

        portfolioDialog: "add", // TODO: null,

        version: 0,
      },

      portfoliosHeaders: [
        { title: 'Name', value: 'name', sortable: false },
        { title: 'Accounts', value: 'accounts', sortable: false },
        { text: 'Actions', value: 'actions', sortable: false }
      ],

    };
  },
  computed: {
    chainId() {
      return store.getters['chainId'];
    },
    portfolios() {
      return store.getters['portfolio/portfolios'];
    },
    portfoliosList() {
      const results = [];
      for (const [ name, accounts ] of Object.entries(this.portfolios)) {
        results.push({ name, accounts });
      }
      return results;
    },
    // address() {
    //   return store.getters['token/address'];
    // },
    // version() {
    //   return store.getters['token/info'].version || null;
    // },
    // implementation() {
    //   return store.getters['token/info'].implementation || null;
    // },
    // type() {
    //   return store.getters['token/info'].type || null;
    // },
    // name() {
    //   return store.getters['token/info'].name || null;
    // },
    // symbol() {
    //   return store.getters['token/info'].symbol || null;
    // },
    // decimals() {
    //   return store.getters['token/info'].decimals || null;
    // },
    // totalSupply() {
    //   return store.getters['token/info'].totalSupply || null;
    // },
    // addresses() {
    //   return store.getters['token/addresses'];
    // },
    // txHashes() {
    //   return store.getters['token/txHashes'];
    // },
    // numberOfEvents() {
    //   return store.getters['token/numberOfEvents'];
    // },
    // balances() {
    //   return store.getters['token/balances'];
    // },
    // tokens() {
    //   return store.getters['token/tokens'];
    // },
    // approvals() {
    //   return store.getters['token/approvals'];
    // },
    // approvalForAlls() {
    //   return store.getters['token/approvalForAlls'];
    // },
    metadata() {
      return store.getters['token/metadata'];
    },
    sync() {
      return store.getters['portfolio/sync'];
    },
    explorer() {
      return store.getters['explorer'];
    },
    reservoir() {
      return store.getters['reservoir'];
    },
  },
  methods: {
    syncToken() {
      console.log(now() + " Portfolio - methods.syncToken - address: " + this.address);
      store.dispatch('token/loadToken', { inputAddress: this.address, forceUpdate: true });
    },

    async addOrSavePortfolio() {
      console.log(now() + " Portfolio - methods.addOrSavePortfolio - settings.portfolioDialog: " + this.settings.portfolioDialog);
      this.settings.portfolioDialog = null;
    },

    // syncTokenEvents() {
    //   console.log(now() + " Portfolio - methods.syncTokenEvents - address: " + this.address);
    //   store.dispatch('token/syncTokenEvents', { inputAddress: this.address, forceUpdate: true });
    // },
    // syncTokenMetadata() {
    //   console.log(now() + " Portfolio - methods.syncTokenMetadata - address: " + this.address);
    //   store.dispatch('token/syncTokenMetadata', this.address);
    // },
    setSyncHalt() {
      console.log(now() + " Portfolio - methods.setSyncHalt");
      store.dispatch('token/setSyncHalt');
    },

    // async loadEvents({ page, itemsPerPage, sortBy }) {
    //   const sort = !sortBy || sortBy.length == 0 || (sortBy[0].key == "blockNumber" && sortBy[0].order == "desc") ? "desc" : "asc";
    //   console.log(now() + " Portfolio - methods.loadEvents - page: " + page + ", itemsPerPage: " + itemsPerPage + ", sortBy: " + JSON.stringify(sortBy) + ", sort: " + sort);
    //   const dbInfo = store.getters["db"];
    //   const db = new Dexie(dbInfo.name);
    //   db.version(dbInfo.version).stores(dbInfo.schemaDefinition);
    //   const address = store.getters["token/address"];
    //   console.log(now() + " Portfolio - methods.loadEvents - address: " + address);
    //   if (address) {
    //     const chainId = store.getters["chainId"];
    //     const row = (page - 1) * itemsPerPage;
    //     let data;
    //     if (sort == "asc") {
    //       data = await db.tokenEvents.where('[chainId+address+blockNumber+logIndex]').between([chainId, address, Dexie.minKey, Dexie.minKey],[chainId, address, Dexie.maxKey, Dexie.maxKey]).offset(row).limit(itemsPerPage).toArray();
    //     } else {
    //       data = await db.tokenEvents.where('[chainId+address+blockNumber+logIndex]').between([chainId, address, Dexie.minKey, Dexie.minKey],[chainId, address, Dexie.maxKey, Dexie.maxKey]).reverse().offset(row).limit(itemsPerPage).toArray();
    //     }
    //     this.eventItems = data;
    //   }
    //   db.close();
    // },

    // updateAttributes(event) {
    //   console.log(now() + " Portfolio - methods.updateAttributes - event: " + JSON.stringify(event));
    //   if (event.value) {
    //     if (!(event.address in this.settings.attributes)) {
    //       this.settings.attributes[event.address] = {};
    //     }
    //     if (!(event.attribute in this.settings.attributes[event.address])) {
    //       this.settings.attributes[event.address][event.attribute] = {};
    //     }
    //     if (!(event.option in this.settings.attributes[event.address][event.attribute])) {
    //       this.settings.attributes[event.address][event.attribute][event.option] = event.value;
    //     }
    //   } else {
    //     if (this.settings.attributes[event.address][event.attribute][event.option]) {
    //       delete this.settings.attributes[event.address][event.attribute][event.option];
    //     }
    //     if (Object.keys(this.settings.attributes[event.address][event.attribute]).length == 0) {
    //       delete this.settings.attributes[event.address][event.attribute];
    //     }
    //     if (Object.keys(this.settings.attributes[event.address]).length == 0) {
    //       delete this.settings.attributes[event.address];
    //     }
    //   }
    //   this.saveSettings();
    // },

    formatUnits(e, decimals) {
      if (e) {
        return ethers.utils.formatUnits(e, decimals).replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
      }
      return null;
    },
    formatTimestamp(ts) {
      if (ts != null) {
        return moment.unix(ts).format("YYYY-MM-DD HH:mm:ss");
      }
      return null;
    },
    commify0(n) {
      if (n != null) {
        return Number(n).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
      }
      return null;
    },
    commify2(n) {
      if (n != null) {
        return Number(n).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
      }
      return null;
    },
    saveSettings() {
      // console.log(now() + " Portfolio - methods.saveSettings - settings: " + JSON.stringify(this.settings, null, 2));
      // TODO
      // if (this.initialised) {
      //   localStorage.explorerPortfolioSettings = JSON.stringify(this.settings);
      // }
    },
    copyToClipboard(str) {
      navigator.clipboard.writeText(str);
    },
  },
  beforeCreate() {
    console.log(now() + " Portfolio - beforeCreate");
	},
  mounted() {
    console.log(now() + " Portfolio - mounted - inputPortfolio: " + this.inputPortfolio);

    // if ('explorerPortfolioSettings' in localStorage) {
    //   const tempSettings = JSON.parse(localStorage.explorerPortfolioSettings);
    //   // console.log(now() + " Portfolio - mounted - tempSettings: " + JSON.stringify(tempSettings));
    //   if ('version' in tempSettings && tempSettings.version == this.settings.version) {
    //     this.settings = tempSettings;
    //   }
    // }
    // this.initialised = true;
    // console.log(now() + " Portfolio - mounted - this.settings: " + JSON.stringify(this.settings));
    //
    const t = this;
    setTimeout(function() {
      store.dispatch('portfolio/loadPortfolio', { inputPortfolio: t.inputPortfolio, forceUpdate: false });
    }, 100);
	},
  unmounted() {
    console.log(now() + " Portfolio - unmounted");
	},
  destroyed() {
    console.log(now() + " Portfolio - destroyed");
	},
};
