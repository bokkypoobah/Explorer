// Create the router
const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes,
});

const store = new Vuex.Store({
  state: {
    testData: 'Hellooo',
    name: 'Test'
  },
  mutations: {
    setName(state, newName) {
      state.name = newName;
    }
  },
  actions: {
    pretendUpdate({ commit }) {
      commit('setName', 'Updated Name');
    }
  }
});

// console.table(Vuetify);
const vuetify = Vuetify.createVuetify({
  // components,
  // directives,
});

const app = Vue.createApp({
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
    router() {
      return this.$router;
    },
  },
  // methods: {
  //   testClick() {
  //     console.log('this is a test click from component', this.$store.state.test);
  //     this.$store.dispatch('pretendUpdate');
  //   },
  //   submitClick() {
  //     console.log('Name in store', this.$store.state.name);
  //   }
  // },
  beforeCreate() {
    console.log("now()" + " index.js - app:beforeCreate");
	},
  // mounted() {
  //   console.log("now()" + " index.js - app.mounted");
  // },
  // destroyed() {
  //   console.log("now()" + " index.js - app.destroyed");
  // },
});

// router.beforeEach((to, from) => {
//   console.log("router.beforeEach - to: " + JSON.stringify(to) + ", from: " + JSON.stringify(from));
// })

app.use(router);
app.use(store);
app.use(vuetify);
// app.component("home", Home);
app.mount('#app');
