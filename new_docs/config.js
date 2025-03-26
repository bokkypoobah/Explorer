const Config = {
  template: `
    <div>
      <v-form ref="formConfig">
        <!-- <h2>Config</h2> -->
        <br />
        <v-text-field v-model="etherscanAPIKey" label="Etherscan API Key:"></v-text-field>
        <br />
        <v-data-table :items="chains"></v-data-table>
        <v-btn @click="importChainlistFromEtherscan();" text>Import from Etherscan</v-btn>
      </v-form>
    </div>
  `,
  data: function () {
    return {
    };
  },
  computed: {
    etherscanAPIKey: {
      get: function() {
        return store.getters['config'].etherscanAPIKey;
      },
      set: function(etherscanAPIKey) {
        store.dispatch('setEtherscanAPIKey', etherscanAPIKey);
      },
    },
    chains() {
      const results = [];
      for (const [chainId, chainData] of Object.entries(store.getters['config'].chains)) {
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
      console.log(JSON.stringify(data));
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
    console.log(now() + " Config - app:beforeCreate");
	},
  mounted() {
    console.log(now() + " Config - app:mounted");
	},
  unmounted() {
    console.log(now() + " Config - app:unmounted");
	},
  destroyed() {
    console.log(now() + " Config - app:destroyed");
	},
};
