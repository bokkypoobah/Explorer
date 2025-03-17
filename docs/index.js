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
  },
  getters: {
    settings: state => state.settings,
  },
  mutations: {
    restoreState(state, settings) {
      console.log(now() + " store - mutations.restoreState - settings: " + JSON.stringify(settings));
      state.settings = settings;
    },
    setEtherscanAPIKey(state, apiKey) {
      console.log(now() + " store - mutations.setEtherscanAPIKey - apiKey: " + apiKey);
      state.settings.etherscanAPIKey = apiKey;
    },
  },
  actions: {
    restoreState(context, settings) {
      console.log(now() + " store - actions.restoreState - settings: " + JSON.stringify(settings));
      context.commit('restoreState', settings);
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
        console.log(now() + " plugins.persistSettings - mutation.type: " + mutation.type);
        if (mutation.type == "setEtherscanAPIKey") {
          console.log(now() + " plugins.persistSettings - Persisting settings");
          localStorage.explorerSettings = JSON.stringify(state.settings);
        }
      });

      console.log(now() + " plugins.persistSettings INIT");
      if (localStorage.explorerSettings) {
        const tempSettings = JSON.parse(localStorage.explorerSettings);
        console.log(now() + " plugins.persistSettings - tempSettings: " + JSON.stringify(tempSettings));
        if ('version' in tempSettings && tempSettings.version == store.getters["settings"].version) {
          console.log(now() + " plugins.persistSettings - LOADING tempSettings: " + JSON.stringify(tempSettings));
          store.dispatch('restoreState', tempSettings);
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
