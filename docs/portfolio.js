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
                  <template v-slot:item.name="{ item }">
                    {{ item.name }}
                  </template>
                  <template v-slot:item.accounts="{ item }">
                    <span v-for="(active, account) of item.accounts">
                      <render-address v-if="active" :address="account" noXPadding></render-address>
                    </span>
                  </template>
                  <template v-slot:item.actions="{ item }">
                    <v-btn @click="portfolioDialogView(item.name);" prepend-icon="mdi-pencil" variant="text" class="lowercase-btn">Edit</v-btn>
                  </template>
                  <template v-slot:body.append>
                    <tr class="bg-grey-lighten-4">
                      <td></td>
                      <td></td>
                      <td>
                        <v-btn @click="portfolioDialogView(null);" prepend-icon="mdi-pencil-plus" variant="text" class="lowercase-btn">Add</v-btn>
                      </td>
                    </tr>
                  </template>
                </v-data-table>
                <v-dialog :model-value="portfolioDialog.mode != null" persistent max-width="800px">
                  <v-card>
                    <v-card-item :prepend-icon="portfolioDialog.mode == 'add' ? 'mdi-pencil-plus' : 'mdi-pencil'" :title="portfolioDialog.mode == 'add' ? 'Portfolio - Add' : 'Portfolio - Edit'" class="bg-grey-lighten-4"></v-card-item>
                    <v-card-text class="ma-2 pa-2">
                      <v-text-field v-model="portfolioDialog.name" label="Name" density="compact" style="width: 360px;"></v-text-field>
                      <v-data-table :headers="accountsHeaders" :items="portfolioDialog.accounts" density="compact" style="position: relative;">
                        <template v-slot:item.account="{ item }">
                          {{ item.account }}
                        </template>
                        <template v-slot:item.active="{ item }">
                          <v-checkbox v-model="item.active" hide-details></v-checkbox>
                        </template>
                        <template v-slot:item.actions="{ item, index }">
                          <v-btn @click="portfolioDialog.accounts.splice(index, 1);" prepend-icon="mdi-delete" variant="text" class="lowercase-btn">Delete</v-btn>
                        </template>
                        <template v-slot:body.append>
                          <tr class="bg-grey-lighten-4">
                            <td class="ma-0 pa-0">
                              <!-- <v-text-field v-model="portfolioDialog.account" :rules="addressRules" variant="solo" flat density="compact" hide-details single-line class="ma-0 mx-2 pa-0" placeholder="new account" ></v-text-field> -->
                              <v-text-field v-model="portfolioDialog.account" :rules="addressRules" variant="solo" flat density="compact" single-line class="ma-2 pa-0" placeholder="new account" ></v-text-field>
                            </td>
                            <td>
                              <v-checkbox v-model="portfolioDialog.active" hide-details></v-checkbox>
                            </td>
                            <td>
                              <v-btn @click="portfolioDialog.accounts.push({ account: portfolioDialog.account, active: portfolioDialog.active });" prepend-icon="mdi-pencil-plus" variant="text" class="lowercase-btn">Add</v-btn>
                            </td>
                          </tr>
                        </template>
                      </v-data-table>
                    </v-card-text>
                    <v-card-actions>
                      <v-btn v-if="portfolioDialog.mode == 'add'" :disabled="!portfolioDialog.name || !!portfolios[portfolioDialog.name]" @click="portfolioDialogAddOrSave();" prepend-icon="mdi-check" variant="text" class="lowercase-btn">Add</v-btn>
                      <v-btn v-if="portfolioDialog.mode == 'edit'" @click="portfolioDialogAddOrSave();" prepend-icon="mdi-check" variant="text" class="lowercase-btn">Save</v-btn>
                      <v-btn v-if="portfolioDialog.mode == 'edit'" :disabled="portfolioDialog.name != portfolioDialog.originalName" @click="portfolioDialogDelete();" prepend-icon="mdi-delete" variant="text" class="lowercase-btn">Delete</v-btn>
                      <v-btn @click="portfolioDialog.mode = null;" prepend-icon="mdi-window-close" variant="text" class="lowercase-btn">Cancel</v-btn>
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

        version: 0,
      },
      addressRules: [
        (v) => (v || "").length > 0 || "Address is required",
        (v) => {
          try {
            ethers.utils.getAddress(v);
            return true;
          } catch (e) {
            return "Invalid Address";
          }
        },
      ],

      portfolioDialog: {
        mode: null,
        name: null,
        originalName: null,
        accounts: [],
        account: null,
        active: true,
      },

      portfoliosHeaders: [
        { title: 'Name', value: 'name', width: '20%', sortable: true },
        { title: 'Accounts', value: 'accounts', width: '65%', sortable: false },
        { title: '', value: 'actions', width: '15%', sortable: false },
      ],
      accountsHeaders: [
        { title: 'Account', value: 'account', width: '70%', sortable: false }, // TODO: Sortable: true after deleting from index worked out
        { title: 'Active', value: 'active', width: '15%', sortable: false },
        { title: '', value: 'actions', width: '15%', sortable: false },
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
      results.sort((a, b) => {
        return a.name.localeCompare(b.name);
      });
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
    syncPortfolio() {
      console.log(now() + " Portfolio - methods.syncPortfolio");
      store.dispatch('portfolio/syncPortfolio', { forceUpdate: true });
    },

    portfolioDialogView(name) {
      console.log(now() + " Portfolio - methods.portfolioDialogView - name: " + name);
      this.portfolioDialog.mode = name == null ? "add" : "edit";
      this.portfolioDialog.name = name;
      this.portfolioDialog.originalName = name;
      const accounts = [];
      for (const [ account, accountData ] of Object.entries(this.portfolios[this.portfolioDialog.name] || {})) {
        accounts.push({ account, ...accountData });
      }
      console.log(now() + " Portfolio - methods.portfolioDialogView - accounts: " + JSON.stringify(accounts));
      this.portfolioDialog.accounts = accounts;
    },
    async portfolioDialogAddOrSave() {
      console.log(now() + " Portfolio - methods.portfolioDialogAddOrSave - portfolioDialog.mode: " + this.portfolioDialog.mode);
      store.dispatch('portfolio/addPortfolio', { name: this.portfolioDialog.name, originalName: this.portfolioDialog.originalName, accounts: this.portfolioDialog.accounts });
      this.portfolioDialog.mode = null;
    },
    portfolioDialogDelete() {
      console.log(now() + " Portfolio - methods.portfolioDialogDelete");
      store.dispatch('portfolio/deletePortfolio', this.portfolioDialog.originalName);
      this.portfolioDialog.mode = null;
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
