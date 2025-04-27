const Config = {
  template: `
    <div>
      <v-card>
        <v-card-text>
          <v-form ref="formConfig">
            <v-card-title>API Keys</v-card-title>
            <v-row>
              <v-col cols="4">
                <v-text-field
                  :type="showAPIKey ? 'text' : 'password'"
                  autocomplete
                  v-model="etherscanAPIKey"
                  label="Etherscan API Key:"
                  placeholder="See https://etherscan.io/apis"
                  hint="For API calls to retrieve contract ABI and source, and internal and normal transaction listings by account"
                  :append-inner-icon="showAPIKey ? 'mdi-eye' : 'mdi-eye-off'"
                  @click:append-inner="showAPIKey = !showAPIKey"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-card-title>Chains</v-card-title>
            <v-data-table :items="chains" density="compact" style="position: relative;">
              <template v-slot:footer.prepend>
                <!-- <v-btn @click="importChainlistFromEtherscan();" text>Import from Etherscan</v-btn> -->
                <v-spacer></v-spacer>
              </template>
            </v-data-table>
          </v-form>
        </v-card-text>
        <!-- <v-card-actions>
          <v-btn>Action 1</v-btn>
          <v-btn>Action 2</v-btn>
        </v-card-actions> -->
      </v-card>

      <!-- <v-form ref="formConfig">
        <v-subheader>Personal Information</v-subheader>
        <v-layout>
          <v-text-field v-model="etherscanAPIKey" label="Etherscan API Key:"></v-text-field>
        </v-layout>
        <v-layout>
          <v-data-table :items="chains" density="compact" style="position: relative;">
            <template v-slot:footer.prepend>
              <v-btn @click="importChainlistFromEtherscan();" text>Import from Etherscan</v-btn>
              <v-spacer></v-spacer>
            </template>
          </v-data-table>
        </v-layout>
      </v-form> -->
    </div>
  `,
  data: function () {
    return {
      showAPIKey: false,
    };
  },
  computed: {
    etherscanAPIKey: {
      get: function() {
        return store.getters['config1/config'].etherscanAPIKey;
      },
      set: function(etherscanAPIKey) {
        store.dispatch('config1/setEtherscanAPIKey', etherscanAPIKey);
      },
    },
    chains() {
      const results = [];
      for (const [chainId, chainData] of Object.entries(store.getters['config1/chains'])) {
        results.push({ chainId, ...chainData });
      }
      return results;
    },
  },
  methods: {
    async importChainlistFromEtherscan() {
      console.log(now() + " Config - methods.importChainlistFromEtherscan()");
      const url = "https://api.etherscan.io/v2/chainlist";
      const data = await fetch(url).then(response => response.json());
      // console.log(JSON.stringify(data));
      if (data && data.result) {
        for (const item of data.result) {
          if (!(item.chainid in store.getters['config'].chains)) {
            store.dispatch('addChain', {
              chainId: item.chainid,
              name: item.chainname,
              explorer: item.blockexplorer + (item.blockexplorer.substr(-1) != "/" ? "/" : ""),
              api: item.apiurl,
            });
          }
        }
      }
    },
  },
  beforeCreate() {
    console.log(now() + " Config - beforeCreate");
	},
  mounted() {
    console.log(now() + " Config - mounted");
	},
  unmounted() {
    console.log(now() + " Config - unmounted");
	},
  destroyed() {
    console.log(now() + " Config - destroyed");
	},
};
