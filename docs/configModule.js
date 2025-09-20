const configModule = {
  namespaced: true,
  state: {
    config: {
      etherscanAPIKey: null,
      // portfolios: {},
      chains: {},
      version: 4,
    },
  },
  getters: {
    config: state => state.config,
    // portfolios: state => state.config.portfolios,
    chains(state) {
      // console.log(now() + " configModule - getters.chains");
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
    // addPortfolio(state, { name, originalName, accounts }) {
    //   console.log(now() + " configModule - mutations.addPortfolio - name: " + name + ", originalName: " + originalName + ", accounts: " + JSON.stringify(accounts));
    //   if (originalName != null && name != originalName) {
    //     delete state.config.portfolios[originalName];
    //   }
    //   const accountsMap = {};
    //   for (const account of accounts) {
    //     accountsMap[account.account] = { active: account.active };
    //   }
    //   state.config.portfolios[name] = accountsMap;
    //   console.log(now() + " configModule - mutations.addPortfolio - state.config.portfolios[name]: " + JSON.stringify(state.config.portfolios[name]));
    // },
    // deletePortfolio(state, name) {
    //   console.log(now() + " configModule - mutations.deletePortfolio - name: " + name);
    //   delete state.config.portfolios[name];
    // },
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
          // console.log(now() + " configModule - actions.loadConfig - tempConfig: " + JSON.stringify(tempConfig).substring(0, 200));
          context.commit('setConfig', tempConfig);
        }
      }
      store.subscribe((mutation, state) => {
        if (mutation.type == "config/setEtherscanAPIKey" || mutation.type == "config/addChain" || mutation.type == "config/addPortfolio" || mutation.type == "config/deletePortfolio") {
          console.log(now() + " configModule - actions.loadConfig - subscribe - mutation.type: " + mutation.type);
          localStorage.explorerConfig = JSON.stringify(context.state.config);
        }
      });
    },
    setEtherscanAPIKey(context, etherscanAPIKey) {
      context.commit('setEtherscanAPIKey', etherscanAPIKey);
    },
    // addPortfolio(context, { name, originalName, accounts }) {
    //   console.log(now() + " configModule - actions.addPortfolio - name: " + name + ", originalName: " + originalName + ", accounts: " + JSON.stringify(accounts));
    //   context.commit('addPortfolio', { name, originalName, accounts });
    // },
    // deletePortfolio(context, name) {
    //   console.log(now() + " configModule - actions.deletePortfolio - name: " + name);
    //   context.commit('deletePortfolio', name);
    // },
    // TODO:
    // addChain(context, chain) {
    //   if (!(chain.chainId in state.config.chains)) {
    //     state.config.chains[chain.chainId] = {
    //       name: chain.name,
    //       explorer: chain.explorer,
    //       api: chain.api,
    //       reservoir: chain.reservoir,
    //     };
    //   }
    // },
  },
};
