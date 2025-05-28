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
          <!-- <v-spacer></v-spacer> -->
          <v-select
            v-model="settings.selectedPortfolio"
            :items="portfoliosOptions"
            variant="plain"
            density="compact"
            class="mt-3 ml-5"
            style="max-width: 200px;"
            @update:modelValue="saveSettings();"
          ></v-select>
          <v-spacer></v-spacer>
          <v-btn v-if="sync.info == null" @click="syncPortfolio();" color="primary" icon v-tooltip="'Sync Portfolio'">
            <v-icon>mdi-refresh</v-icon>
          </v-btn>
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
            <!-- <v-tab prepend-icon="mdi-cog" text="Config" value="config" class="lowercase-btn"></v-tab> -->
          </v-tabs>
        </v-toolbar>

        <v-alert
          v-if="portfoliosOptions.length <= 1"
          closable
          title="Configuration"
          text="Set up your portfolio(s) of addresses in Other -> Config -> Portfolios"
          type="info"
          color="info"
          class="mx-0 my-1"
        >
        </v-alert>
        <!-- icon="mdi-alert-circle-outline" -->

        <v-toolbar flat color="transparent" density="compact">
          <v-btn icon @click="settings.showFilter = !settings.showFilter; saveSettings();" color="primary" class="lowercase-btn" v-tooltip="'Filters'">
            <v-icon :icon="settings.showFilter ? 'mdi-filter' : 'mdi-filter-outline'"></v-icon>
          </v-btn>
        </v-toolbar>

        <v-row dense>
          <v-col v-if="settings.showFilter" cols="2">
            <v-card>
              <v-expansion-panels v-model="settings.assetTypeFilter.visible" @update:modelValue="saveSettings();" multiple flat>
                <v-expansion-panel class="ma-0 pa-0">
                  <v-expansion-panel-title>
                    Asset Type
                  </v-expansion-panel-title>
                  <v-expansion-panel-text class="ma-0 pa-0">
                    <v-list-item append-icon="mdi-ethereum" density="compact" class="ma-0 pa-1">
                      <v-checkbox-btn v-model="settings.assetTypeFilter.eth" @update:modelValue="saveSettings();" label="ETH" class="ma-0 pa-0"></v-checkbox-btn>
                    </v-list-item>
                    <v-list-item append-icon="mdi-cash-multiple" density="compact" class="ma-0 pa-1">
                      <v-checkbox-btn v-model="settings.assetTypeFilter.fungibles" @update:modelValue="saveSettings();" label="Fungibles" class="ma-0 pa-0" v-tooltip="'ERC-20'"></v-checkbox-btn>
                    </v-list-item>
                    <v-list-item append-icon="mdi-cards-playing-heart-multiple-outline" density="compact" class="ma-0 pa-1">
                      <v-checkbox-btn v-model="settings.assetTypeFilter.nonFungibles" @update:modelValue="saveSettings();" label="Non-Fungibles" class="ma-0 pa-0" v-tooltip="'ERC-721 & ERC-1155 excluding ENS Names'"></v-checkbox-btn>
                    </v-list-item>
                    <v-list-item append-icon="mdi-alphabetical" density="compact" class="ma-0 pa-1">
                      <v-checkbox-btn v-model="settings.assetTypeFilter.names" @update:modelValue="saveSettings();" label="Names" class="ma-0 pa-0" v-tooltip="'ERC-721 & ERC-1155 ENS Names'"></v-checkbox-btn>
                    </v-list-item>
                    <!-- <v-list-item class="ma-0 pa-1">
                      <v-checkbox-btn label="ETH" class="ma-0 pa-0"></v-checkbox-btn>
                      <v-checkbox-btn label="ERC-20" class="ma-0 pa-0"></v-checkbox-btn>
                      <v-checkbox-btn label="ERC-721/1155" class="ma-0 pa-0"></v-checkbox-btn>
                      <v-checkbox-btn label="ENS (ERC-721/1155)" class="ma-0 pa-0"></v-checkbox-btn>
                    </v-list-item> -->
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-card>
          </v-col>
          <v-col :cols="settings.showFilter ? 10 : 12" align="left">
            <v-card>
              <v-card-text class="ma-0 pa-2">
                <v-tabs-window v-model="settings.tab">
                  <v-tabs-window-item value="summary">
                    <pre>
assetsList: {{ assetsList }}
                      <br />
data: {{ data }}
                    </pre>
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
                </v-tabs-window>
              </v-card-text>
              <v-toolbar flat color="transparent" density="compact">
              </v-toolbar>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </div>
  `,
  props: ['inputPortfolio'],
  data: function () {
    return {
      initialised: false,
      settings: {
        selectedPortfolio: null,
        tab: "summary",
        showFilter: false,
        assetTypeFilter: {
          visible: false,
          eth: true,
          fungibles: true,
          nonFungibles: true,
          names: true,
        },
        assets: {
          sortOption: "typenameasc",
          itemsPerPage: 10,
          currentPage: 1,
        },
        version: 2,
      },
      // addressRules: [
      //   (v) => (v || "").length > 0 || "Address is required",
      //   (v) => {
      //     try {
      //       ethers.utils.getAddress(v);
      //       return true;
      //     } catch (e) {
      //       return "Invalid Address";
      //     }
      //   },
      // ],
      // portfolioDialog: {
      //   mode: null,
      //   name: null,
      //   originalName: null,
      //   accounts: [],
      //   account: null,
      //   active: true,
      // },
      // portfoliosHeaders: [
      //   { title: 'Name', value: 'name', width: '20%', sortable: true },
      //   { title: 'Accounts', value: 'accounts', width: '65%', sortable: false },
      //   { title: '', value: 'actions', width: '15%', sortable: false },
      // ],
      // accountsHeaders: [
      //   { title: 'Account', value: 'account', width: '70%', sortable: false }, // TODO: Sortable: true after deleting from index worked out
      //   { title: 'Active', value: 'active', width: '15%', sortable: false },
      //   { title: '', value: 'actions', width: '15%', sortable: false },
      // ],
    };
  },
  computed: {
    chainId() {
      return store.getters['chainId'];
    },
    portfolios() {
      return store.getters['config/portfolios'];
    },
    portfoliosOptions() {
      const results = [];
      results.push({ value: null, title: "(All)" });
      for (const [portfolio, portfolioData] of Object.entries(store.getters['config/portfolios'])) {
        // console.error(portfolio + " => " + JSON.stringify(portfolioData));
        results.push({ value: portfolio, title: portfolio });
      }
      return results;
    },
    data() {
      return store.getters['portfolio/data'];
    },
    assetsList() {
      const results = [];
      console.log(now() + " Portfolio - computed.assetsList - data: " + JSON.stringify(this.data, null, 2));
      for (const [address, addressData] of Object.entries(this.data)) {
        for (const [chain, chainData] of Object.entries(addressData)) {
          // console.error(address + "/" + chain + " => " + JSON.stringify(chainData));
          if (this.settings.assetTypeFilter.eth) {
            results.push({ address, chain, contract: null, contractType: null, name: "ETH", balance: chainData.balance, decimals: 18, transactionCount: chainData.transactionCount });
          }
          if (this.settings.assetTypeFilter.fungibles) {
            for (const [token, balance] of Object.entries(chainData.tokenBalances || {})) {
              // console.error(address + "/" + chain + "/" + token + " => " + balance);
              results.push({ address, chain, contract: token, contractType: "erc20", name: "{ERC-20 name}", balance, decimals: 18 });
            }
          }
          // console.error(address + "/" + chain + " => " + JSON.stringify(chainData.tokens));
          for (const [token, tokenData] of Object.entries(chainData.tokens || {})) {
            let include;
            if (token == ENS_BASEREGISTRARIMPLEMENTATION_ADDRESS || token == ENS_NAMEWRAPPER_ADDRESS) {
              include = this.settings.assetTypeFilter.names;
            } else {
              include = this.settings.assetTypeFilter.nonFungibles;
            }
            if (include) {
              // console.log(address + "/" + chain + "/" + token + " => " + JSON.stringify(tokenData, null, 2));
              results.push({ address, chain, contract: token, contractType: "erc721/1155", name: "{ERC-721/1155 name}", tokenData });
            }
          }
        }
      }
      return results;
    },
    // portfoliosList() {
    //   const results = [];
    //   for (const [ name, accounts ] of Object.entries(this.portfolios)) {
    //     results.push({ name, accounts });
    //   }
    //   results.sort((a, b) => {
    //     return a.name.localeCompare(b.name);
    //   });
    //   return results;
    // },

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
    syncPortfolio() {
      console.log(now() + " Portfolio - methods.syncPortfolio");
      store.dispatch('portfolio/syncPortfolio', { selectedPortfolio: this.settings.selectedPortfolio, forceUpdate: true });
    },

    // portfolioDialogView(name) {
    //   console.log(now() + " Portfolio - methods.portfolioDialogView - name: " + name);
    //   this.portfolioDialog.mode = name == null ? "add" : "edit";
    //   this.portfolioDialog.name = name;
    //   this.portfolioDialog.originalName = name;
    //   const accounts = [];
    //   for (const [ account, accountData ] of Object.entries(this.portfolios[this.portfolioDialog.name] || {})) {
    //     accounts.push({ account, ...accountData });
    //   }
    //   console.log(now() + " Portfolio - methods.portfolioDialogView - accounts: " + JSON.stringify(accounts));
    //   this.portfolioDialog.accounts = accounts;
    // },
    // async portfolioDialogAddOrSave() {
    //   console.log(now() + " Portfolio - methods.portfolioDialogAddOrSave - portfolioDialog.mode: " + this.portfolioDialog.mode);
    //   store.dispatch('config/addPortfolio', { name: this.portfolioDialog.name, originalName: this.portfolioDialog.originalName, accounts: this.portfolioDialog.accounts });
    //   this.portfolioDialog.mode = null;
    // },
    // portfolioDialogDelete() {
    //   console.log(now() + " Portfolio - methods.portfolioDialogDelete");
    //   store.dispatch('config/deletePortfolio', this.portfolioDialog.originalName);
    //   this.portfolioDialog.mode = null;
    // },

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
      console.log(now() + " Portfolio - methods.saveSettings - settings: " + JSON.stringify(this.settings, null, 2));
      if (this.initialised) {
        localStorage.explorerPortfolioSettings = JSON.stringify(this.settings);
      }
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

    if ('explorerPortfolioSettings' in localStorage) {
      const tempSettings = JSON.parse(localStorage.explorerPortfolioSettings);
      // console.log(now() + " Portfolio - mounted - tempSettings: " + JSON.stringify(tempSettings));
      if ('version' in tempSettings && tempSettings.version == this.settings.version) {
        this.settings = tempSettings;
      }
    }
    this.initialised = true;
    console.log(now() + " Portfolio - mounted - this.settings: " + JSON.stringify(this.settings));

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
