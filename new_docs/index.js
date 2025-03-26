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

const app = Vue.createApp({
  data() {
    return {
      testData: 'Hellooo',
      name: "Testing"
    }
  },
  methods: {
    testClick() {
      console.log('this is a test click from component', this.$store.state.test);
      this.$store.dispatch('pretendUpdate');
    },
    submitClick() {
      console.log('Name in store', this.$store.state.name);
    }
  }
});

app.use(store);
app.mount('#app');
