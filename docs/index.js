const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes,
});

const store = new Vuex.Store({
  state: {
    config: {
      etherscanAPIKey: null,
      chains: {
        1: {
          name: "Ethereum Mainnet",
          explorer: "https://etherscan.io/",
          api: "https://api.etherscan.io/v2/api?chainid=1",
        },
        11155111: {
          name: "Sepolia Testnet",
          explorer: "https://sepolia.etherscan.io/",
          api: "https://api.etherscan.io/v2/api?chainid=11155111",
        },
      },
      version: 1,
    },
    web3: {
      connected: false,
      error: false,
      chainId: null,
      coinbase: null,
      blockNumber: null,
      timestamp: null,
      lastBaseFeePerGas: null,
      maxFeePerGas: null,
      maxPriorityFeePerGas: null,
      gasPrice: null,
      version: 1,
    },
    db: {
      name: "explorer088c",
      version: 1,
      schemaDefinition: {
        blocks: '[chainId+number]',
        cache: '&objectName',
      },
    },
    // testData: 'Hellooo',
    // name: 'Test'
  },
  getters: {
    config: state => state.config,
    web3: state => state.web3,
    db: state => state.db,
    chainId: state => state.web3.chainId,
    supportedNetwork(state) {
      const chain = state.web3.chainId && state.config.chains[state.web3.chainId] || null;
      return !!chain;
    },
    networkName(state) {
      const chain = state.web3.chainId && state.config.chains[state.web3.chainId] || null;
      return chain && chain.name || "Unknown chainId: " + state.web3.chainId;
    },
    explorer(state) {
      const chain = state.web3.chainId && state.config.chains[state.web3.chainId] || null;
      return chain && chain.explorer || null;
    },
  },
  mutations: {
    setConfig(state, config) {
      state.config = config;
    },
    setEtherscanAPIKey(state, apiKey) {
      state.config.etherscanAPIKey = apiKey;
    },
    addChain(state, chain) {
      if (!(chain.chainId in state.config.chains)) {
        state.config.chains[chain.chainId] = {
          name: chain.name,
          explorer: chain.explorer,
          api: chain.api,
        };
      }
    },
    setWeb3Info(state, info) {
      state.web3.connected = info.connected;
      state.web3.error = info.error;
      state.web3.chainId = info.chainId;
      state.web3.blockNumber = info.blockNumber;
      state.web3.timestamp = info.timestamp;
      state.web3.coinbase = info.coinbase;
      state.web3.lastBaseFeePerGas = info.lastBaseFeePerGas;
      state.web3.maxFeePerGas = info.maxFeePerGas;
      state.web3.maxPriorityFeePerGas = info.maxPriorityFeePerGas;
      state.web3.gasPrice = info.gasPrice;
    },
    setWeb3Connected(state, connected) {
      state.web3.connected = connected;
    },
    setWeb3Coinbase(state, coinbase) {
      state.web3.coinbase = coinbase;
    },
    setWeb3BlockInfo(state, blockInfo) {
      state.web3.blockNumber = blockInfo.blockNumber;
      state.web3.timestamp = blockInfo.timestamp;
      state.web3.lastBaseFeePerGas = blockInfo.lastBaseFeePerGas;
      state.web3.maxFeePerGas = blockInfo.maxFeePerGas;
      state.web3.maxPriorityFeePerGas = blockInfo.maxPriorityFeePerGas;
      state.web3.gasPrice = blockInfo.gasPrice;
    },
  },
  actions: {
    // pretendUpdate({ commit }) {
    //   commit('setName', 'Updated Name');
    // }
    setConfig(context, config) {
      context.commit('setConfig', config);
    },
    setEtherscanAPIKey(context, apiKey) {
      context.commit('setEtherscanAPIKey', apiKey);
    },
    addChain(context, chain) {
      context.commit('addChain', chain);
    },
    setWeb3Info(context, info) {
      context.commit('setWeb3Info', info);
    },
    setWeb3Connected(context, connected) {
      context.commit('setWeb3Connected', connected);
    },
    setWeb3Coinbase(context, coinbase) {
      context.commit('setWeb3Coinbase', coinbase);
    },
    setWeb3BlockInfo(context, blockInfo) {
      context.commit('setWeb3BlockInfo', blockInfo);
    },
  },
  modules: {
    connection: connectionModule,
    block: blockModule,
    blocks: blocksModule,
    transaction: transactionModule,
    address: addressModule,
    addresses: addressesModule,
    name: nameModule,
  },
  plugins: [
    function persistSettings(store) {
      store.subscribe((mutation, state) => {
        if (mutation.type == "setEtherscanAPIKey" || mutation.type == "addChain") {
          localStorage.explorerConfig = JSON.stringify(state.config);
        } else if (mutation.type.substring(0, 7) == "setWeb3") {
          localStorage.explorerWeb3 = JSON.stringify(state.web3);
        }
      });

      if (localStorage.explorerConfig) {
        const tempConfig = JSON.parse(localStorage.explorerConfig);
        if ('version' in tempConfig && tempConfig.version == store.getters["config"].version) {
          store.dispatch('setConfig', tempConfig);
        }
      }
      if (localStorage.explorerWeb3) {
        const tempWeb3Info = JSON.parse(localStorage.explorerWeb3);
        if ('version' in tempWeb3Info && tempWeb3Info.version == store.getters["web3"].version) {
          store.dispatch('setWeb3Info', tempWeb3Info);
        }
      }
    },
  ],
});

// console.table(Vuetify);
const vuetify = Vuetify.createVuetify({
  // components,
  // directives,
});

const app = Vue.createApp({
  // icons: {
  //   iconfont: 'mdiSvg', // 'mdi' || 'mdiSvg' || 'md' || 'fa' || 'fa4' || 'faSvg'
  // },
  // router,
  // store,
  // vuetify,
  data() {
    return {
      searchString: null,
      _timerId: null,
  //     testData: 'Hellooo',
  //     name: "Testing"
    }
  },
  computed: {
    connected() {
      return store.getters['web3'].connected;
    },
    chainId() {
      return store.getters['web3'].chainId;
    },
    coinbase() {
      return store.getters['web3'].coinbase;
    },
    explorer() {
      return store.getters['explorer'];
    },
    router() {
      return this.$router && this.$router.currentRoute; // && ("(" + JSON.stringify(this.$router.currentRoute) + ")") || null;
    },
    mainPath() {
      // console.log(now() + " index.js - computed.addressPathInputAddress - mainPath - this.$route.path: " + this.$route.path);
      if (this.$route.path == "/") {
        return "/";
      }
      const parts = this.$route.path.split("/");
      return parts.length >= 2 && ("/" + parts[1]) || null;
    },
    samples() {
      const results = [];
      console.log(now() + " index.js - computed.samples");
      for (const sample of (SAMPLES[this.chainId] || [])) {
        results.push({ value: sample.address, title: sample.address, subtitle: sample.info });
      }
      return results;
    },
  },
  methods: {
    connect(connected) {
      store.dispatch('connection/connect');
    },
    disconnect(connected) {
      store.dispatch('connection/disconnect');
    },
    search() {
      console.log(now() + " index.js - methods.search - this.searchString: " + JSON.stringify(this.searchString));
      clearTimeout(this._timerId)
      this._timerId = setTimeout(() => {
        this.searchDebounced()
      }, 500)
    },
    searchDebounced() {
      const blockRegex = /^\d+$/;
      const txRegex = /^0x[a-fA-F0-9]{64}$/;
      const addressRegex = /^0x[a-fA-F0-9]{40}$/;
      // const ensNameRegex = /^([a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*)(\.eth)?$/;
      // console.log(now() + " index.js - methods.searchDebounced - this.searchString: " + JSON.stringify(this.searchString));
      if (this.searchString) {
        const searchString = this.searchString.value || this.searchString;
        // console.log(now() + " index.js - methods.searchDebounced - searchString: " + JSON.stringify(searchString));
        if (blockRegex.test(searchString)) {
          console.log(now() + " index.js - methods.searchDebounced - BLOCK searchString: " + JSON.stringify(searchString));
          this.$router.push({ name: 'Block', params: { inputBlockNumber: searchString } });
          store.dispatch('block/loadBlock', searchString);
        } else if (txRegex.test(searchString)) {
          console.log(now() + " index.js - methods.searchDebounced - TX searchString: " + JSON.stringify(searchString));
          this.$router.push({ name: 'Transaction', params: { inputTxHash: searchString } });
          store.dispatch('transaction/loadTransaction', searchString);
        } else if (addressRegex.test(searchString)) {
          console.log(now() + " index.js - methods.searchDebounced - ADDRESS searchString: " + JSON.stringify(searchString));
          // this.$router.push({ name: 'Address', params: { inputAddress: searchString } });
          this.$router.push({ name: 'AddressAddress', params: { inputAddress: searchString } });
          store.dispatch('address/loadAddress', { inputAddress: searchString, forceUpdate: false });
        } else {
          console.log(now() + " index.js - methods.searchDebounced - NAME searchString: " + JSON.stringify(searchString));
          const inputName = /\.eth$/i.test(searchString) ? searchString.toLowerCase() : (searchString.toLowerCase() + ".eth");
          if (ethers.utils.isValidName(inputName)) {
            this.$router.push({ name: 'Name', params: { inputName } });
            store.dispatch('name/loadName', { inputName, forceUpdate: false });
          }
        }
      }
    },
  },
  beforeCreate() {
    console.log(now() + " index.js - app:beforeCreate");
	},
  mounted() {
    console.log(now() + " index.js - app.mounted");
    store.dispatch('addresses/loadAddresses');
    store.dispatch('blocks/startup');
  },
  destroyed() {
    console.log(now() + " index.js - app.destroyed");
  },
});

// router.beforeEach((to, from) => {
//   console.log("router.beforeEach - to: " + JSON.stringify(to) + ", from: " + JSON.stringify(from));
// })

app.use(router);
app.use(store);
app.use(vuetify);
app.component("connection", Connection);
app.component("renderAddress", RenderAddress);
app.mount('#app');
