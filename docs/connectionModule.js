// ----------------------------------------------------------------------------
// Web3 connection, including coinbase and coinbase balance
// ----------------------------------------------------------------------------
const Connection = {
  template: `
    <div>
      <span class="text-caption text--disabled">
        <span v-if="coinbase">
          <v-tooltip :text="coinbase">
            <template v-slot:activator="{ props }">
              <a v-bind="props" :href="explorer + 'address/' + coinbase" target="_blank" >
                <span v-if="connected" class="mdi mdi-network"></span>
                <span v-if="!connected" class="mdi mdi-network-outline"></span>
              </a>
            </template>
          </v-tooltip>
        </span>
        <span v-else>
          <span v-if="connected" class="mdi mdi-network"></span>
          <span v-if="!connected" class="mdi mdi-network-outline"></span>
        </span>
        <a v-if="info.chainId" :href="explorer" target="_blank" class="ml-1">
          {{ networkName }}
        </a>
        <a v-if="info.blockNumber" :href="explorer + 'block/' + info.blockNumber" target="_blank" class="ml-1">
          {{ '#' + commify0(info.blockNumber) }}
        </a>
        <span v-if="info.timestamp" class="ml-1">
          <v-tooltip :text="formatTimestamp(info.timestamp)">
            <template v-slot:activator="{ props }">
              <span v-bind="props">{{ formatTimeDiff(info.timestamp) }}</span>
            </template>
          </v-tooltip>
        </span>
        <span v-if="info.gasPrice" class="ml-1">
          <v-tooltip :text="'gasPrice ' + formatGas(info.gasPrice) + ', lastBaseFeePerGas ' + formatGas(info.lastBaseFeePerGas) + ', maxPriorityFeePerGas ' + formatGas(info.maxPriorityFeePerGas) + ', maxFeePerGas ' + formatGas(info.maxFeePerGas) + ' gwei'">
            <template v-slot:activator="{ props }">
              <a href="https://etherscan.io/gastracker" target="_blank" class="ml-1">
                <span v-bind="props">{{ formatGas(info.gasPrice) + 'g'}}</span>
              </a>
            </template>
          </v-tooltip>
        </span>
      </span>
    </div>
  `,
  data: function () {
    return {
      count: 0,
    }
  },
  computed: {
    connected() {
      return store.getters['web3'].connected;
    },
    coinbase() {
      return store.getters['web3'].coinbase;
    },
    info() {
      return store.getters['web3'];
    },
    supportedNetwork() {
      return store.getters['supportedNetwork'];
    },
    networkName() {
      return store.getters['networkName'];
    },
    explorer() {
      return store.getters['explorer'];
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
    formatGas(e) {
      if (e) {
        return parseFloat(ethers.utils.formatUnits(e, "gwei")).toFixed(4); // .replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
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
      state.provider = provider;
    },
  },
  actions: {
    async connect(context) {
      let [provider, connected, error, chainId, blockNumber, timestamp, coinbase, feeData] = [null, false, null, null, null, null, null, null];
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
          feeData = await provider.getFeeData();
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
            const lastBlockNumber = store.getters['web3'].blockNumber;
            if (!lastBlockNumber || blockNumber > lastBlockNumber) {
              const block = await provider.getBlock("latest");
              const feeData = await provider.getFeeData();
              // console.log(now() + " connectionModule - actions.connect.handleNewBlock - feeData: " + JSON.stringify(feeData));
              if (block.number > lastBlockNumber) {
                store.dispatch('setWeb3BlockInfo', {
                  blockNumber: block.number,
                  timestamp: block.timestamp,
                  lastBaseFeePerGas: ethers.BigNumber.from(feeData.lastBaseFeePerGas).toString(),
                  maxFeePerGas: ethers.BigNumber.from(feeData.maxFeePerGas).toString(),
                  maxPriorityFeePerGas: ethers.BigNumber.from(feeData.maxPriorityFeePerGas).toString(),
                  gasPrice: ethers.BigNumber.from(feeData.gasPrice).toString(),
                });
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
      store.dispatch('setWeb3Info', {
        connected,
        error,
        chainId,
        blockNumber,
        timestamp,
        coinbase,
        lastBaseFeePerGas: ethers.BigNumber.from(feeData.lastBaseFeePerGas).toString(),
        maxFeePerGas: ethers.BigNumber.from(feeData.maxFeePerGas).toString(),
        maxPriorityFeePerGas: ethers.BigNumber.from(feeData.maxPriorityFeePerGas).toString(),
        gasPrice: ethers.BigNumber.from(feeData.gasPrice).toString(),
      });
      context.commit('setProvider', provider);
    },
    restore(context) {
      if (store.getters['web3'].connected) {
        context.dispatch('connect');
      }
    },
    disconnect(context) {
      if (store.getters['web3'].connected) {
        if (context.state.provider) {
          context.state.provider.removeAllListeners();
          window.ethereum.removeAllListeners();
        }
        store.dispatch('setWeb3Connected', false);
      }
    },
  },
};
