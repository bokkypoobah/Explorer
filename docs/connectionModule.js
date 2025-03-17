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
  },
  actions: {
    setConnected(context, connected) {
      // logDebug("connectionModule", "actions.setConnected(" + connected + ")");
      // context.commit('setConnected', connected);
    },
  },
};
