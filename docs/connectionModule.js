// ----------------------------------------------------------------------------
// Web3 connection, including coinbase and coinbase balance
// ----------------------------------------------------------------------------
const Connection = {
  template: `
    <div>
      Connection Module
    </div>
  `,
  data: function () {
    return {
      count: 0,
    }
  },
  computed: {
    connected() {
      return store.getters['connection/connected'];
    },
  },
  methods: {
  },
  mounted() {
    console.log(now() + " Connection - mounted");
  },
  destroyed() {
    console.log(now() + " Connection - destroyed");
  },
};


const connectionModule = {
  namespaced: true,
  state: {
    connected: false,
  },
  getters: {
    connected: state => state.connected,
  },
  mutations: {
    setConnected(state, connected) {
      console.log(now() + " connectionModule - mutations.setConnected: " + connected);
      state.connected = connected;
      // Vue.set(state.txs, tx, tx);
    },
  },
  actions: {
    connect(context, blah) {
      console.log(now() + " connectionModule - actions.connect(" + blah + ")");
      context.commit('setConnected', true);
    },
    disconnect(context, blah) {
      console.log(now() + " connectionModule - actions.disconnect(" + blah + ")");
      context.commit('setConnected', false);
    },
  },
};
