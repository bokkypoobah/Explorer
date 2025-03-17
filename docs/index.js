Vue.use(Vuex);

const router = new VueRouter({
  // mode: 'history', // https://stackoverflow.com/questions/45201014/how-to-handle-anchors-bookmarks-with-vue-router
  routes: routes,
});

const storeVersion = 1;
const store = new Vuex.Store({
  strict: false, // TODO Set to true to test, false to disable _showDetails & vuex mutations
  // state: {
  //   username: 'Jack',
  //   phrases: ['Welcome back', 'Have a nice day'],
  // },
  // getters: {
  //   getMessage(state) {
  //     return state.route.name === 'top' ?
  //       `${state.phrases[0]}, ${state.username}` :
  //       `${state.phrases[1]}, ${state.username}`;
  //   },
  // },
  mutations: {
    initialiseStore(state) {
      // TODO: Restore to IndexedDB here?
      // // Check if the store exists
    	// if (localStorage.getItem('store')) {
    	// 	let store = JSON.parse(localStorage.getItem('store'));
      //
    	// 	// Check the version stored against current. If different, don't
    	// 	// load the cached version
    	// 	if(store.version == storeVersion) {
      //     // logDebug("store.initialiseStore BEFORE", JSON.stringify(state, null, 4));
    	// 		this.replaceState(
    	// 			Object.assign(state, store.state)
    	// 		);
      //     // logDebug("store.initialiseStore AFTER", JSON.stringify(state, null, 4));
    	// 	} else {
    	// 		state.version = storeVersion;
    	// 	}
    	// }
    }
  },
  modules: {
    // connection: connectionModule,
    // welcome: welcomeModule,
    // names: namesModule,
    // search: searchModule,
    // newAddress: newAddressModule,
    // syncOptions: syncOptionsModule,
    // viewAddress: viewAddressModule,
    // viewName: viewNameModule,
    // config: configModule,
    // data: dataModule,
    // addresses: addressesModule,
  }
});

// Subscribe to store updates
store.subscribe((mutation, state) => {
  let store = {
		version: storeVersion,
		state: state,
	};
  // console.log("store.subscribe - mutation.type: " + mutation.type);
  // console.log("store.subscribe - mutation.payload: " + mutation.payload);
  // logDebug("store.updated", JSON.stringify(store, null, 4));
	// TODO: Save to IndexedDB here? localStorage.setItem('store', JSON.stringify(store));
});

// sync store and router by using `vuex-router-sync`
sync(store, router);

const app = new Vue({
  router,
  store,
  beforeCreate() {
    // setLogLevel(1); // 0 = NONE, 1 = INFO (default), 2 = DEBUG
    console.log(now() + " index.js - app:beforeCreate");
		// this.$store.commit('initialiseStore');
	},
  data() {
    return {
      count: 0,
      name: 'BootstrapVue',
      show: true,
    };
  },
  computed: {
    moduleName () {
      return this.$route.name;
    },
  },
  mounted() {
    console.log(now() + " index.js - app.mounted");
  },
  destroyed() {
    console.log(now() + " index.js - app.destroyed");
    // this.reschedule = false;
  },
  methods: {
  },
  components: {
  },
}).$mount('#app');
