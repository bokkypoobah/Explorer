const configModule = {
  namespaced: true,
  state: {
    config: {
      etherscanAPIKey: null,
      chains: {
        // 1: {
        //   name: "Ethereum Mainnet",
        //   explorer: "https://etherscan.io/",
        //   api: "https://api.etherscan.io/v2/api?chainid=1",
        // },
        // 11155111: {
        //   name: "Sepolia Testnet",
        //   explorer: "https://sepolia.etherscan.io/",
        //   api: "https://api.etherscan.io/v2/api?chainid=11155111",
        // },
      },
      version: 2,
    },
  },
  getters: {
    // name: state => state.info.name || null,
    config: state => state.config,
    chains(state) {
      console.log(now() + " configModule - getters.chains");
      return { ...CHAINS, ...state.config.chains };
    },
  },
  mutations: {
    setConfig(state, config) {
      // console.log(now() + " configModule - mutations.setConfig - config: " + JSON.stringify(config).substring(0, 200));
      state.config = config;
    },
    setEtherscanAPIKey(state, etherscanAPIKey) {
      // console.log(now() + " configModule - mutations.setEtherscanAPIKey - etherscanAPIKey: " + etherscanAPIKey);
      state.config.etherscanAPIKey = etherscanAPIKey;
    },
  },
  // watch: {
  //   config(newVal, oldVal) {
  //     console.log(now() + " configModule - watch.config - newVal: " + JSON.stringify(newVal).substring(0, 200));
  //     // console.log(`Old value: ${oldVal}, New value: ${newVal}`);
  //   }
  // },
  actions: {
    async loadConfig(context) {
      console.log(now() + " configModule - actions.loadConfig");
      if (localStorage.explorerConfig) {
        const tempConfig = JSON.parse(localStorage.explorerConfig);
        if ('version' in tempConfig && tempConfig.version == context.state.config.version) {
          console.log(now() + " configModule - actions.loadConfig - tempConfig: " + JSON.stringify(tempConfig).substring(0, 200));
          context.commit('setConfig', tempConfig);
        }
      }
      store.subscribe((mutation, state) => {
        if (mutation.type == "config1/setEtherscanAPIKey" || mutation.type == "config1/addChain") {
          console.log(now() + " configModule - actions.loadConfig - subscribe - mutation.type: " + mutation.type);
          localStorage.explorerConfig = JSON.stringify(context.state.config);
        }
      });
    },
    setEtherscanAPIKey(context, etherscanAPIKey) {
      context.commit('setEtherscanAPIKey', etherscanAPIKey);
    },
  },
};
