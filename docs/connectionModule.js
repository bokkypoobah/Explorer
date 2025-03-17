// ----------------------------------------------------------------------------
// Web3 connection, including coinbase and coinbase balance
// ----------------------------------------------------------------------------
const Connection = {
  template: `
    <div>
      Connection Module:
      <ul>
        <li>connected: {{ connected }}</li>
        <li>info: {{ info }}</li>
      </ul>
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
    info() {
      return store.getters['connection/info'];
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
    info: {
      connected: false,
      error: false,
      chainId: null,
      blockNumber: null,
      timestamp: null,
      coinbase: null,
    },
    provider: null,
  },
  getters: {
    connected: state => state.info.connected,
    chainId: state => state.info.chainId,
    info: state => state.info,
  },
  mutations: {
    setConnected(state, connected) {
      state.info.connected = connected;
      console.log(now() + " connectionModule - mutations.setConnected - state.info: " + JSON.stringify(state.info));
    },
    setInfo(state, info) {
      state.info.connected = info.connected;
      state.info.error = info.error;
      state.info.chainId = info.chainId;
      state.info.blockNumber = info.blockNumber;
      state.info.timestamp = info.timestamp;
      state.info.coinbase = info.coinbase;
      state.provider = info.provider;
      console.log(now() + " connectionModule - mutations.setInfo - state.info: " + JSON.stringify(state.info));
    },
  },
  actions: {
    async connect(context) {
      console.log(now() + " connectionModule - actions.connect");
      let [provider, connected, error, chainId, blockNumber, timestamp, coinbase] = [null, false, null, null, null, null, null];
      if (window.ethereum) {
        if (!window.ethereum.isConnected() || !window.ethereum['isUnlocked']) {
          try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            connected = window.ethereum.isConnected();
          } catch (e) {
            error = "Unable to access the browser's web3 accounts";
          }
        } else {
          connected = true;
        }
        console.log(now() + " connectionModule - actions.connect - connected: " + connected);
        if (connected) {
          provider = new ethers.providers.Web3Provider(window.ethereum);
          const network = await provider.getNetwork();
          chainId = parseInt(network.chainId);
          const block = await provider.getBlock("latest");
          blockNumber = block.number;
          timestamp = block.timestamp;
          const signer = provider.getSigner();
          coinbase = await signer.getAddress();
        }
        // TODO: Listeners
        // window.ethereum.on('chainChanged', this.web3HandleChainChanged);
        // window.ethereum.on('accountsChanged', this.web3HandleAccountsChanged);
        // this.provider.on("block", this.web3HandleNewBlock);
      } else {
        error = "This app requires a web3 enabled browser";
      }
      context.commit('setInfo', { connected, error, chainId, blockNumber, timestamp, coinbase, provider });
    },
    disconnect(context) {
      console.log(now() + " connectionModule - actions.disconnect");
      if (context.state.info.connected) {
        // TODO: Remove listeners
        context.commit('setConnected', false);
      // } else {
      //   console.log(now() + " connectionModule - actions.disconnect - not connected");
      }
    },
  },
};
