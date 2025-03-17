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
      version: 0,
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
      // console.log(now() + " store - mutations.setSettings - settings: " + JSON.stringify(settings));
      state.settings = settings;
    },
    setWeb3Connection(state, web3Connection) {
      console.log(now() + " store - mutations.setWeb3Connection - web3Connection: " + JSON.stringify(web3Connection));
      state.web3Connection.connected = web3Connection.connected;
      state.web3Connection.error = web3Connection.error;
      state.web3Connection.chainId = web3Connection.chainId;
      state.web3Connection.blockNumber = web3Connection.blockNumber;
      state.web3Connection.timestamp = web3Connection.timestamp;
      state.web3Connection.coinbase = web3Connection.coinbase;
    },
    setWeb3Connected(state, connected) {
      console.log(now() + " store - mutations.setWeb3Connected - connected: " + connected);
      state.web3Connection.connected = connected;
    },
    setWeb3BlockInfo(state, blockInfo) {
      console.log(now() + " store - mutations.setWeb3BlockInfo - blockInfo: " + JSON.stringify(blockInfo));
      state.web3Connection.blockNumber = blockInfo.blockNumber;
      state.web3Connection.timestamp = blockInfo.timestamp;
    },
    setEtherscanAPIKey(state, apiKey) {
      console.log(now() + " store - mutations.setEtherscanAPIKey - apiKey: " + apiKey);
      state.settings.etherscanAPIKey = apiKey;
    },
  },
  actions: {
    setSettings(context, settings) {
      // console.log(now() + " store - actions.setSettings - settings: " + JSON.stringify(settings));
      context.commit('setSettings', settings);
    },
    setWeb3Connection(context, web3Connection) {
      console.log(now() + " store - actions.setWeb3Connection - web3Connection: " + JSON.stringify(web3Connection));
      context.commit('setWeb3Connection', web3Connection);
    },
    setWeb3Connected(context, connected) {
      console.log(now() + " store - actions.setWeb3Connected - connected: " + JSON.stringify(connected));
      context.commit('setWeb3Connected', connected);
    },
    setWeb3BlockInfo(context, blockInfo) {
      console.log(now() + " store - actions.setWeb3BlockInfo - blockInfo: " + JSON.stringify(blockInfo));
      context.commit('setWeb3BlockInfo', blockInfo);
    },
    setEtherscanAPIKey(context, apiKey) {
      console.log(now() + " store - actions.setEtherscanAPIKey - apiKey: " + apiKey);
      context.commit('setEtherscanAPIKey', apiKey);
    },
  },
  modules: {
    connection: connectionModule,
    config: configModule,
    transaction: transactionModule,
  },
  plugins: [
    function persistSettings(store) {
      store.subscribe((mutation, state) => {
        // console.log(now() + " plugins.persistSettings - mutation.type: " + mutation.type);
        if (mutation.type == "setEtherscanAPIKey") {
          console.log(now() + " plugins.persistSettings - Persisting settings - mutation.type: " + mutation.type);
          localStorage.explorerSettings = JSON.stringify(state.settings);
        } else if (mutation.type.substring(0, 7) == "setWeb3") {
          console.log(now() + " plugins.persistSettings - Persisting connection - mutation.type: " + mutation.type);
          localStorage.explorerWeb3Connection = JSON.stringify(state.web3Connection);
        }
      });

      // console.log(now() + " plugins.persistSettings INIT");
      if (localStorage.explorerSettings) {
        const tempSettings = JSON.parse(localStorage.explorerSettings);
        // console.log(now() + " plugins.persistSettings - tempSettings: " + JSON.stringify(tempSettings));
        if ('version' in tempSettings && tempSettings.version == store.getters["settings"].version) {
          console.log(now() + " plugins.persistSettings - LOADING tempSettings: " + JSON.stringify(tempSettings));
          store.dispatch('setSettings', tempSettings);
        }
      }
      if (localStorage.explorerWeb3Connection) {
        const tempWeb3Connection = JSON.parse(localStorage.explorerWeb3Connection);
        // console.log(now() + " plugins.persistSettings - tempWeb3Connection: " + JSON.stringify(tempWeb3Connection));
        if ('version' in tempWeb3Connection && tempWeb3Connection.version == store.getters["web3Connection"].version) {
          console.log(now() + " plugins.persistSettings - LOADING tempWeb3Connection: " + JSON.stringify(tempWeb3Connection));
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
      return store.getters['connection/connected'];
    },
    chainId() {
      return store.getters['connection/chainId'];
    },
    info() {
      return store.getters['connection/info'];
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
