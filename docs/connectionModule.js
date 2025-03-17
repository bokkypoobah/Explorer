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
    store.dispatch('connection/restore');
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
    setCoinbase(state, coinbase) {
      state.info.coinbase = coinbase;
      console.log(now() + " connectionModule - mutations.setCoinbase - state.info: " + JSON.stringify(state.info));
    },
    setBlockInfo(state, info) {
      state.info.blockNumber = info.blockNumber;
      state.info.timestamp = info.timestamp;
      console.log(now() + " connectionModule - mutations.setBlockInfo - state.info: " + JSON.stringify(state.info));
    },
    setConnected(state, connected) {
      state.info.connected = connected;
      console.log(now() + " connectionModule - mutations.setConnected - state.info: " + JSON.stringify(state.info));
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

        if (connected) {
          function handleChainChanged(_chainId) {
            console.log(now() + " connectionModule - actions.connect.handleChainChanged - _chainId: " + parseInt(_chainId));
            alert('Web3 network changed. This page will reload 5 seconds after you click OK.')
            setTimeout(function() {
                window.location.reload();
              }, 5000);
          }
          window.ethereum.on('chainChanged', handleChainChanged);
        }

        if (connected) {
          async function handleAccountsChanged(accounts) {
            console.log(now() + " connectionModule - actions.connect.handleAccountsChanged - accounts: " + JSON.stringify(accounts));
            const signer = provider.getSigner();
            const coinbase = await signer.getAddress();
            console.log(now() + " connectionModule - actions.connect.handleAccountsChanged - coinbase: " + coinbase);
            // localStorage.gnosisSafeExplorerWeb3 = JSON.stringify(this.web3);
            context.commit('setCoinbase', coinbase);
            localStorage.explorerConnectionInfo = JSON.stringify(context.state.info);
          }
          window.ethereum.on('accountsChanged', handleAccountsChanged);
        }

        if (connected) {
          async function handleNewBlock(blockNumber) {
            console.log(now() + " connectionModule - actions.connect.handleNewBlock - blockNumber: " + JSON.stringify(blockNumber));
            if (!context.state.info.blockNumber || blockNumber > context.state.info.blockNumber) {
              const block = await provider.getBlock("latest");
              const blockNumber = block.number;
              const timestamp = block.timestamp;
              if (blockNumber >= context.state.info.blockNumber) {
                context.commit('setBlockInfo', { blockNumber, timestamp });
                localStorage.explorerConnectionInfo = JSON.stringify(context.state.info);
              }
            }
          }
          provider.on("block", handleNewBlock);
        }

      } else {
        error = "This app requires a web3 enabled browser";
      }
      context.commit('setInfo', { connected, error, chainId, blockNumber, timestamp, coinbase, provider });
      localStorage.explorerConnectionInfo = JSON.stringify(context.state.info);
    },
    restore(context) {
      console.log(now() + " connectionModule - actions.restore");
      if (localStorage.explorerConnectionInfo) {
        const info = JSON.parse(localStorage.explorerConnectionInfo);
        console.log(now() + " connectionModule - actions.restore - info: " + JSON.stringify(info));
      }
      context.dispatch('connect');
    },
    disconnect(context) {
      console.log(now() + " connectionModule - actions.disconnect");
      if (context.state.info.connected) {
        if (context.state.info.provider) {
          context.state.info.provider.removeAllListeners();
        }
        context.commit('setConnected', false);
        localStorage.explorerConnectionInfo = JSON.stringify(context.state.info);
      }
    },
  },
};
