const Config = {
  template: `
    <div>
      <v-container fluid class="pa-1">
        <v-toolbar density="compact" class="mt-1">
          <v-card-item prepend-icon="mdi-cog" title="Config"></v-card-item>
          <v-spacer></v-spacer>
          <v-tabs v-model="settings.tab" @update:modelValue="saveSettings();" right color="deep-purple-accent-4">
            <v-tab prepend-icon="mdi-key-variant" text="API Keys" value="apikey" class="lowercase-btn"></v-tab>
            <!-- TODO: Delete <v-tab prepend-icon="mdi-bank" text="Portfolios" value="portfolios" class="lowercase-btn"></v-tab> -->
            <v-tab prepend-icon="mdi-link-variant" text="Chains" value="chains" class="lowercase-btn"></v-tab>
          </v-tabs>
        </v-toolbar>
        <v-card>
          <v-card-text class="ma-0 pa-2 pt-5">
            <v-tabs-window v-model="settings.tab">
              <v-tabs-window-item value="apikey">
                <v-form ref="formConfig">
                  <v-row>
                    <v-col cols="4">
                      <v-text-field
                        :type="showEtherscanAPIKey ? 'text' : 'password'"
                        autocomplete
                        v-model="etherscanAPIKey"
                        label="Etherscan API Key:"
                        placeholder="See https://etherscan.io/apis"
                        hint="For API calls to retrieve contract ABI and source, and internal and normal transaction listings by account"
                        :append-inner-icon="showEtherscanAPIKey ? 'mdi-eye' : 'mdi-eye-off'"
                        @click:append-inner="showEtherscanAPIKey = !showEtherscanAPIKey"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="4">
                      <v-text-field
                        :type="showOpenseaAPIKey ? 'text' : 'password'"
                        autocomplete
                        v-model="openseaAPIKey"
                        label="Opensea API Key:"
                        placeholder="See https://opensea.io/settings/developer"
                        hint="For API calls to retrieve token metadata and prices"
                        :append-inner-icon="showOpenseaAPIKey ? 'mdi-eye' : 'mdi-eye-off'"
                        @click:append-inner="showOpenseaAPIKey = !showOpenseaAPIKey"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-form>
              </v-tabs-window-item>
              <!-- TODO: Delete -->
              <v-tabs-window-item value="portfolios">
                <v-data-table :headers="portfoliosHeaders" :items="portfoliosList" density="compact" style="position: relative;">
                  <template v-slot:item.name="{ item }">
                    {{ item.name }}
                  </template>
                  <template v-slot:item.accounts="{ item }">
                    <div v-for="(active, account) of item.accounts">
                      <render-address v-if="active" :address="account" noXPadding></render-address>
                    </div>
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
              </v-tabs-window-item>
              <v-tabs-window-item value="chains">
                <v-data-table :items="chains" density="compact" style="position: relative;">
                  <template v-slot:footer.prepend>
                    <!-- <v-btn @click="importChainlistFromEtherscan();" text>Import from Etherscan</v-btn> -->
                    <v-spacer></v-spacer>
                  </template>
                </v-data-table>
              </v-tabs-window-item>
            </v-tabs-window>
          </v-card-text>
        </v-card>
      </v-container>
    </div>
  `,
  data: function () {
    return {
      initialised: false,
      settings: {
        tab: "apikey",
        version: 0,
      },
      showEtherscanAPIKey: false,
      showOpenseaAPIKey: false,
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
    };
  },
  computed: {
    etherscanAPIKey: {
      get: function() {
        return store.getters['config/config'].etherscanAPIKey;
      },
      set: function(etherscanAPIKey) {
        store.dispatch('config/setEtherscanAPIKey', etherscanAPIKey);
      },
    },
    openseaAPIKey: {
      get: function() {
        return store.getters['config/config'].openseaAPIKey;
      },
      set: function(openseaAPIKey) {
        store.dispatch('config/setOpenseaAPIKey', openseaAPIKey);
      },
    },
    portfolios() {
      return store.getters['config/portfolios'];
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
    chains() {
      const results = [];
      for (const [chainId, chainData] of Object.entries(store.getters['config/chains'])) {
        results.push({ chainId, ...chainData });
      }
      return results;
    },
  },
  methods: {
    portfolioDialogView(name) {
      console.log(now() + " Config - methods.portfolioDialogView - name: " + name);
      this.portfolioDialog.mode = name == null ? "add" : "edit";
      this.portfolioDialog.name = name;
      this.portfolioDialog.originalName = name;
      const accounts = [];
      for (const [ account, accountData ] of Object.entries(this.portfolios[this.portfolioDialog.name] || {})) {
        accounts.push({ account, ...accountData });
      }
      console.log(now() + " Config - methods.portfolioDialogView - accounts: " + JSON.stringify(accounts));
      this.portfolioDialog.accounts = accounts;
    },
    async portfolioDialogAddOrSave() {
      console.log(now() + " Config - methods.portfolioDialogAddOrSave - portfolioDialog.mode: " + this.portfolioDialog.mode);
      store.dispatch('config/addPortfolio', { name: this.portfolioDialog.name, originalName: this.portfolioDialog.originalName, accounts: this.portfolioDialog.accounts });
      this.portfolioDialog.mode = null;
    },
    portfolioDialogDelete() {
      console.log(now() + " Config - methods.portfolioDialogDelete");
      store.dispatch('config/deletePortfolio', this.portfolioDialog.originalName);
      this.portfolioDialog.mode = null;
    },

    // async importChainlistFromEtherscan() {
    //   console.log(now() + " Config - methods.importChainlistFromEtherscan()");
    //   const url = "https://api.etherscan.io/v2/chainlist";
    //   const data = await fetch(url).then(response => response.json());
    //   // console.log(JSON.stringify(data));
    //   if (data && data.result) {
    //     for (const item of data.result) {
    //       if (!(item.chainid in store.getters['config'].chains)) {
    //         store.dispatch('addChain', {
    //           chainId: item.chainid,
    //           name: item.chainname,
    //           explorer: item.blockexplorer + (item.blockexplorer.substr(-1) != "/" ? "/" : ""),
    //           api: item.apiurl,
    //         });
    //       }
    //     }
    //   }
    // },
    saveSettings() {
      // console.log(now() + " Config - methods.saveSettings - settings: " + JSON.stringify(this.settings, null, 2));
      if (this.initialised) {
        localStorage.explorerConfigSettings = JSON.stringify(this.settings);
      }
    },
  },
  beforeCreate() {
    console.log(now() + " Config - beforeCreate");
	},
  mounted() {
    console.log(now() + " Config - mounted");
    if ('explorerConfigSettings' in localStorage) {
      const tempSettings = JSON.parse(localStorage.explorerConfigSettings);
      // console.log(now() + " Config - mounted - tempSettings: " + JSON.stringify(tempSettings));
      if ('version' in tempSettings && tempSettings.version == this.settings.version) {
        this.settings = tempSettings;
      }
    }
    this.initialised = true;
    // console.log(now() + " Config - mounted - this.settings: " + JSON.stringify(this.settings));
	},
  unmounted() {
    console.log(now() + " Config - unmounted");
	},
  destroyed() {
    console.log(now() + " Config - destroyed");
	},
};
