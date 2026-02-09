const configModule = {
  namespaced: true,
  state: {
    config: {
      etherscanAPIKey: null,
      openseaAPIKey: null,
      alchemyAPIKey: null,
      chains: {},
      version: 6,
    },
  },
  getters: {
    config: state => state.config,
    chains(state) {
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
    setOpenseaAPIKey(state, openseaAPIKey) {
      console.log(now() + " configModule - mutations.setOpenseaAPIKey - openseaAPIKey: " + openseaAPIKey);
      state.config.openseaAPIKey = openseaAPIKey;
    },
    setAlchemyAPIKey(state, alchemyAPIKey) {
      console.log(now() + " configModule - mutations.setAlchemyAPIKey - alchemyAPIKey: " + alchemyAPIKey);
      state.config.alchemyAPIKey = alchemyAPIKey;
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
          context.commit('setConfig', tempConfig);
        }
      }
      store.subscribe((mutation, state) => {
        if (mutation.type == "config/setEtherscanAPIKey" || mutation.type == "config/setOpenseaAPIKey" || mutation.type == "config/setAlchemyAPIKey" || mutation.type == "config/addChain" || mutation.type == "config/addPortfolio" || mutation.type == "config/deletePortfolio") {
          console.log(now() + " configModule - actions.loadConfig - subscribe - mutation.type: " + mutation.type);
          localStorage.explorerConfig = JSON.stringify(context.state.config);
        }
      });
    },
    setEtherscanAPIKey(context, etherscanAPIKey) {
      context.commit('setEtherscanAPIKey', etherscanAPIKey);
    },
    setOpenseaAPIKey(context, openseaAPIKey) {
      context.commit('setOpenseaAPIKey', openseaAPIKey);
    },
    setAlchemyAPIKey(context, alchemyAPIKey) {
      context.commit('setAlchemyAPIKey', alchemyAPIKey);
    },
  },
};
