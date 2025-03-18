// ----------------------------------------------------------------------------
// Web3 connection, including coinbase and coinbase balance
// ----------------------------------------------------------------------------
const Connection = {
  template: `
    <div>
      <font size="-1">
        {{ connected ? "Connected" : "Disconnected" }}
        <b-link v-if="info.chainId" :href="'https://etherscan.io/'" v-b-popover.hover.bottom="'Network'" target="_blank">
          {{ info.chainId == '1' ? 'Ethereum Mainnet' : 'Unsupported Network' }}
        </b-link>
        <b-link v-if="info.chainId == 1 && info.blockNumber" :href="'https://etherscan.io/block/' + info.blockNumber" v-b-popover.hover.bottom="'Latest block'" target="_blank">
          {{ '#' + commify0(info.blockNumber) }}
        </b-link>
        <span v-if="info.chainId == 1 && info.timestamp" v-b-popover.hover.bottom="formatTimestamp(info.timestamp)">
          {{ formatTimeDiff(info.timestamp) }}
        </span>
      </font>
    </div>
  `,
  data: function () {
    return {
      count: 0,
    }
  },
  computed: {
    connected() {
      // return store.getters['connection/connected'];
      return store.getters['web3Connection'].connected;
    },
    info() {
      // return store.getters['connection/info'];
      return store.getters['web3Connection'];
    },
  },
  methods: {
    commify0(n) {
      if (n != null) {
        return Number(n).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
      }
      return null;
    },
    formatTimestamp(ts) {
      if (ts != null) {
        // if (this.settings.reportingDateTime == 1) {
        //   return moment.unix(ts).utc().format("YYYY-MM-DD HH:mm:ss");
        // } else {
          return moment.unix(ts).format("YYYY-MM-DD HH:mm:ss");
        // }
      }
      return null;
    },
    formatTimeDiff(unixtime) {
      if (unixtime) {
        return moment.unix(unixtime).fromNow();
      }
      return null;
    },

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
    provider: null,
  },
  getters: {
  },
  mutations: {
    setProvider(state, provider) {
      console.log(now() + " connectionModule - mutations.setProvider");
      state.provider = provider;
    },
  },
  actions: {
    async connect(context) {
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
            alert('Web3 network changed. This page will reload 5 seconds after you click OK.')
            setTimeout(function() {
                window.location.reload();
              }, 5000);
          }
          if (!window.ethereum._events.chainChanged) {
            window.ethereum.on('chainChanged', handleChainChanged);
          }
        }

        if (connected) {
          async function handleAccountsChanged(accounts) {
            const signer = provider.getSigner();
            const coinbase = await signer.getAddress();
            store.dispatch('setWeb3Coinbase', coinbase);
          }
          if (!window.ethereum._events.accountsChanged) {
            window.ethereum.on('accountsChanged', handleAccountsChanged);
          }
        }

        if (connected) {
          // TODO: ethers.js fires duplicated new block events sometimes
          async function handleNewBlock(blockNumber) {
            const lastBlockNumber = store.getters['web3Connection'].blockNumber;
            if (!lastBlockNumber || blockNumber > lastBlockNumber) {
              const block = await provider.getBlock("latest");
              if (block.number > lastBlockNumber) {
                store.dispatch('setWeb3BlockInfo', { blockNumber: block.number, timestamp: block.timestamp });
                console.log(now() + " connectionModule - actions.connect.handleNewBlock - blockNumber: " + block.number);
              }
            }
          }
          if (provider._events.length == 0) {
            provider.on("block", handleNewBlock);
          }
        }

      } else {
        error = "This app requires a web3 enabled browser";
      }
      store.dispatch('setWeb3Connection', { connected, error, chainId, blockNumber, timestamp, coinbase });
      context.commit('setProvider', provider);
    },
    restore(context) {
      if (store.getters['web3Connection'].connected) {
        context.dispatch('connect');
      }
    },
    disconnect(context) {
      if (store.getters['web3Connection'].connected) {
        if (context.state.provider) {
          context.state.provider.removeAllListeners();
          window.ethereum.removeAllListeners();
        }
        store.dispatch('setWeb3Connected', false);
      }
    },
  },
};
