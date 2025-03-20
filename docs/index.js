Vue.use(Vuex);

Vue.component('connection', Connection);

const router = new VueRouter({
  // mode: 'history', // https://stackoverflow.com/questions/45201014/how-to-handle-anchors-bookmarks-with-vue-router
  routes: routes,
});

const storeVersion = 1;
const store = new Vuex.Store({
  strict: false, // TODO Set to true to test, false to disable _showDetails & vuex mutations
  state: {
    settings: {
      etherscanAPIKey: null,
      chains: {
        1: {
          name: "Ethereum Mainnet",
          explorer: "https://etherscan.io",
          api: "https://api.etherscan.io/v2/api?chainid=1",
        },
        11155111: {
          name: "Sepolia Testnet",
          explorer: "https://sepolia.etherscan.io",
          api: "https://api.etherscan.io/v2/api?chainid=11155111",
        },
      },
      version: 1,
    },
    web3Connection: {
      connected: false,
      error: false,
      chainId: null,
      blockNumber: null,
      timestamp: null,
      coinbase: null,
      version: 0,
    },
  },
  getters: {
    settings: state => state.settings,
    web3Connection: state => state.web3Connection,
  },
  mutations: {
    setSettings(state, settings) {
      state.settings = settings;
    },
    addChain(state, chain) {
      if (!(chain.chainId in state.settings.chains)) {
        Vue.set(state.settings.chains, chain.chainId, {
          name: chain.name,
          explorer: chain.explorer,
          api: chain.api,
        });
        // state.settings.chains[chain.chainId] = {
        //   name: chain.name,
        //   explorer: chain.explorer,
        //   api: chain.api,
        // };
      }
    },
    setWeb3Connection(state, web3Connection) {
      state.web3Connection.connected = web3Connection.connected;
      state.web3Connection.error = web3Connection.error;
      state.web3Connection.chainId = web3Connection.chainId;
      state.web3Connection.blockNumber = web3Connection.blockNumber;
      state.web3Connection.timestamp = web3Connection.timestamp;
      state.web3Connection.coinbase = web3Connection.coinbase;
    },
    setWeb3Connected(state, connected) {
      state.web3Connection.connected = connected;
    },
    setWeb3Coinbase(state, coinbase) {
      state.web3Connection.coinbase = coinbase;
    },
    setWeb3BlockInfo(state, blockInfo) {
      state.web3Connection.blockNumber = blockInfo.blockNumber;
      state.web3Connection.timestamp = blockInfo.timestamp;
    },
    setEtherscanAPIKey(state, apiKey) {
      state.settings.etherscanAPIKey = apiKey;
    },
  },
  actions: {
    setSettings(context, settings) {
      context.commit('setSettings', settings);
    },
    addChain(context, chain) {
      context.commit('addChain', chain);
    },
    setWeb3Connection(context, web3Connection) {
      context.commit('setWeb3Connection', web3Connection);
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
    setEtherscanAPIKey(context, apiKey) {
      context.commit('setEtherscanAPIKey', apiKey);
    },
  },
  modules: {
    connection: connectionModule,
    config: configModule,
    block: blockModule,
    transaction: transactionModule,
    address: addressModule,
  },
  plugins: [
    function persistSettings(store) {
      store.subscribe((mutation, state) => {
        if (mutation.type == "setEtherscanAPIKey" || mutation.type == "addChain") {
          localStorage.explorerSettings = JSON.stringify(state.settings);
        } else if (mutation.type.substring(0, 7) == "setWeb3") {
          localStorage.explorerWeb3Connection = JSON.stringify(state.web3Connection);
        }
      });

      if (localStorage.explorerSettings) {
        const tempSettings = JSON.parse(localStorage.explorerSettings);
        if ('version' in tempSettings && tempSettings.version == store.getters["settings"].version) {
          store.dispatch('setSettings', tempSettings);
        }
      }
      if (localStorage.explorerWeb3Connection) {
        const tempWeb3Connection = JSON.parse(localStorage.explorerWeb3Connection);
        if ('version' in tempWeb3Connection && tempWeb3Connection.version == store.getters["web3Connection"].version) {
          store.dispatch('setWeb3Connection', tempWeb3Connection);
        }
      }
    },
  ],
});

// Subscribe to store updates
// store.subscribe((mutation, state) => {
//   // console.log(now() + " store.subscribe-handler - mutation: " + JSON.stringify(mutation) + ", state: " + JSON.stringify(state));
//   // let store = {
// 	// 	version: storeVersion,
// 	// 	state: state,
// 	// };
//   // console.log(now() + " store.subscribe-handler - mutation.type: " + mutation.type);
//   // console.log(now() + " store.subscribe-handler - mutation.payload: " + JSON.stringify(mutation.payload).substring(0, 200));
//   // console.table(mutation);
//   // console.table(state);
//   // logDebug("store.updated", JSON.stringify(store, null, 4));
// 	// TODO: Save to IndexedDB here? localStorage.setItem('store', JSON.stringify(store));
// });

// sync store and router by using `vuex-router-sync`
sync(store, router);

const app = new Vue({
  router,
  store,
  beforeCreate() {
    console.log(now() + " index.js - app:beforeCreate");
	},
  data() {
    return {
      count: 0,
      name: 'BootstrapVue',
      show: true,
    };
  },
  computed: {
    connected() {
      return store.getters['web3Connection'].connected;
    },
    chainId() {
      return store.getters['connection/chainId'];
    },
    info() {
      return store.getters['web3Connection'];
    },
    moduleName () {
      return this.$route.name;
    },
  },
  methods: {
    connect(connected) {
      store.dispatch('connection/connect');
    },
    disconnect(connected) {
      store.dispatch('connection/disconnect');
    },
  },
  components: {
  },
  mounted() {
    console.log(now() + " index.js - app.mounted");
  },
  destroyed() {
    console.log(now() + " index.js - app.destroyed");
  },
}).$mount('#app');
