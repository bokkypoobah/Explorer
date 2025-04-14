// ----------------------------------------------------------------------------
// Web3 connection, including coinbase and coinbase balance
// ----------------------------------------------------------------------------
const Connection = {
  template: `
    <div>
      <v-btn :disabled="!coinbase" :href="explorer + 'address/' + coinbase" target="_blank" size="x-small" color="primary" variant="text" icon class="ma-0 pa-0" v-tooltip="coinbase">
        <v-img :class="connected ? 'mdi mdi-network' : 'mdi mdi-network-outline'"></v-img>
      </v-btn>
      <v-btn v-if="info.chainId" :href="explorer" target="_blank" color="primary" variant="text" class="lowercase-btn text-caption ma-0 px-2">
        {{ networkName }}
      </v-btn>
      <v-btn v-if="info.blockNumber" :href="explorer + 'block/' + info.blockNumber" target="_blank" color="primary" variant="text" class="lowercase-btn text-caption ma-0 px-2">
        {{ '#' + commify0(info.blockNumber) }}
      </v-btn>
      <v-tooltip v-if="info.timestamp" :text="formatTimestamp(info.timestamp)">
        <template v-slot:activator="{ props }">
          <span v-bind="props" class="text-caption text--disabled">{{ formatTimeDiff(info.timestamp) }}</span>
        </template>
      </v-tooltip>
      <v-btn :disabled="!info.gasPrice" href="https://etherscan.io/gastracker" target="_blank" size="small" color="primary" variant="text" text class="lowercase-btn ma-0 px-2" v-tooltip="'gasPrice ' + formatGas(info.gasPrice) + ', lastBaseFeePerGas ' + formatGas(info.lastBaseFeePerGas) + ', maxPriorityFeePerGas ' + formatGas(info.maxPriorityFeePerGas) + ', maxFeePerGas ' + formatGas(info.maxFeePerGas) + ' gwei'">
        {{ formatGas(info.gasPrice) + 'g'}}
      </v-btn>
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
    lastBlockNumber: 0,
  },
  getters: {
  },
  mutations: {
    setProvider(state, provider) {
      state.provider = provider;
    },
    setLastBlockNumber(state, lastBlockNumber) {
      state.lastBlockNumber = lastBlockNumber;
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
          // console.log("OLD POLLING INTERVAL: " + provider.pollingInterval);
          // provider.pollingInterval = 1000;
          // console.log("NEW POLLING INTERVAL: " + provider.pollingInterval);
          const network = await provider.getNetwork();
          chainId = parseInt(network.chainId);
          const t0 = performance.now();
          const block = await provider.getBlockWithTransactions("latest");
          const t1 = performance.now();
          blockNumber = block.number;
          console.log(now() + " connectionModule - actions.connect.handleNewBlock - getBlockWithTransactions('latest') blockNumber: " + blockNumber + " took " + (t1 - t0) + " ms");
          timestamp = block.timestamp;
          const signer = provider.getSigner();
          coinbase = await signer.getAddress();
          feeData = await provider.getFeeData();
          store.dispatch('blocks/addBlock', block);
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
          let timerId = null;
          // let period = parseInt(Math.random() * 2000) + 100;
          const period = 200;
          async function handleNewBlock(blockNumber) {
            console.log(now() + " connectionModule - actions.connect.handleNewBlock - blockNumber: " + blockNumber);
            clearTimeout(timerId);
            timerId = setTimeout(async () => {
              await handleNewBlockDebounced(blockNumber);
            }, period);
          }
          async function handleNewBlockDebounced(blockNumber) {
            if (parseInt(blockNumber) > context.state.lastBlockNumber) {
              context.commit('setLastBlockNumber', parseInt(blockNumber));
              const performance = window.performance;
              const t0 = performance.now();
              const block = await provider.getBlockWithTransactions("latest");
              context.commit('setLastBlockNumber', parseInt(block.number));

              const t1 = performance.now();
              console.log(now() + " connectionModule - actions.connect.handleNewBlockDebounced - getBlockWithTransactions('latest') blockNumber: " + blockNumber + " took " + (t1 - t0) + " ms");
              const feeData = await provider.getFeeData();
              const t2 = performance.now();
              console.log(now() + " connectionModule - actions.connect.handleNewBlockDebounced - getFeeData() took " + (t2 - t1) + " ms");

              const dbInfo = store.getters["db"];
              const db = new Dexie(dbInfo.name);
              db.version(dbInfo.version).stores(dbInfo.schemaDefinition);
              const blockData = JSON.parse(JSON.stringify(block));
              await db.blocks.put({ chainId, ...blockData }).then (function() {
                }).catch(function(e) {
                  console.error(now() + " connectionModule - actions.connect.handleNewBlockDebounced - ERROR blocks.put: " + e.message);
                });
              db.close();

              store.dispatch('setWeb3BlockInfo', {
                blockNumber: block.number,
                timestamp: block.timestamp,
                lastBaseFeePerGas: ethers.BigNumber.from(feeData.lastBaseFeePerGas).toString(),
                maxFeePerGas: ethers.BigNumber.from(feeData.maxFeePerGas).toString(),
                maxPriorityFeePerGas: ethers.BigNumber.from(feeData.maxPriorityFeePerGas).toString(),
                gasPrice: ethers.BigNumber.from(feeData.gasPrice).toString(),
              });
              store.dispatch('blocks/addBlock', block);
            }
          }
          if (provider._events.length == 0) {
            provider.on("block", handleNewBlock);
            // TODO: Not working
            // function handleNewPendingTx(tx) {
            //   console.log(now() + " connectionModule - actions.connect.handleNewPendingTx - tx: " + JSON.stringify(tx));
            // }
            // provider.on("pending", handleNewPendingTx);
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
