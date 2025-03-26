// Vue.component('connection', Connection);

// Create the router
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
      blockNumber: null,
      timestamp: null,
      coinbase: null,
      version: 0,
    },
    db: {
      name: "new_explorer088a",
      version: 1,
      schemaDefinition: {
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
    chainId(state) {
      return state.web3.chainId;
    },
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
  },
  plugins: [
    function persistSettings(store) {
      store.subscribe((mutation, state) => {
        if (mutation.type == "setEtherscanAPIKey" || mutation.type == "addChain") {
          localStorage.new_explorerConfig = JSON.stringify(state.config);
        } else if (mutation.type.substring(0, 7) == "setWeb3") {
          localStorage.new_explorerWeb3 = JSON.stringify(state.web3);
        }
      });

      if (localStorage.new_explorerConfig) {
        const tempConfig = JSON.parse(localStorage.new_explorerConfig);
        if ('version' in tempConfig && tempConfig.version == store.getters["config"].version) {
          store.dispatch('setConfig', tempConfig);
        }
      }
      if (localStorage.new_explorerWeb3) {
        const tempWeb3Info = JSON.parse(localStorage.new_explorerWeb3);
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
  // data() {
  //   return {
  //     testData: 'Hellooo',
  //     name: "Testing"
  //   }
  // },
  computed: {
    connected() {
      return store.getters['web3'].connected;
    },
    // router() {
    //   return this.$router;
    // },
  },
  methods: {
    connect(connected) {
      store.dispatch('connection/connect');
    },
    disconnect(connected) {
      store.dispatch('connection/disconnect');
    },
  //   testClick() {
  //     console.log('this is a test click from component', this.$store.state.test);
  //     this.$store.dispatch('pretendUpdate');
  //   },
  //   submitClick() {
  //     console.log('Name in store', this.$store.state.name);
  //   }
  },
  beforeCreate() {
    console.log(now() + " index.js - app:beforeCreate");
	},
  mounted() {
    console.log(now() + " index.js - app.mounted");
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
app.mount('#app');
