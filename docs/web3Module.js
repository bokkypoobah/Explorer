// ----------------------------------------------------------------------------
// Web3 connection, including coinbase and coinbase balance
// ----------------------------------------------------------------------------
const Web3 = {
  template: `
    <div>
      <v-btn :disabled="!coinbase" :href="explorer + 'address/' + coinbase" target="_blank" size="x-small" color="primary" variant="text" icon class="ma-0 pa-0" v-tooltip="coinbase">
        <v-img :class="connected ? 'mdi mdi-network' : 'mdi mdi-network-outline'"></v-img>
      </v-btn>
      <v-btn v-if="chainId" :href="explorer" target="_blank" color="primary" variant="text" class="lowercase-btn text-caption ma-0 px-0" v-tooltip="'Chain Id: ' + chainId">
        {{ networkName }}
      </v-btn>
      <v-btn v-if="blockNumber" @click="navigateToBlock(blockNumber)" color="primary" variant="text" class="lowercase-btn text-caption ma-0 px-2">
        {{ commify0(blockNumber) }}
      </v-btn>
      <v-tooltip v-if="timestamp" :text="formatTimestamp(timestamp)">
        <template v-slot:activator="{ props }">
          <span v-bind="props" class="text-caption text--disabled">{{ formatTimeDiff(timestamp) }}</span>
        </template>
      </v-tooltip>
      <v-btn :disabled="!gasPrice" href="https://etherscan.io/gastracker" target="_blank" size="small" color="primary" variant="text" text class="lowercase-btn ma-0 px-2" v-tooltip="'gasPrice ' + formatGas(gasPrice) + ', lastBaseFeePerGas ' + formatGas(lastBaseFeePerGas) + ', maxPriorityFeePerGas ' + formatGas(maxPriorityFeePerGas) + ', maxFeePerGas ' + formatGas(maxFeePerGas) + ' gwei'">
        {{ formatGas(gasPrice) + 'g'}}
      </v-btn>
    </div>
  `,
  data: function () {
    return {
      count: 0,
    }
  },
  computed: {
    // data() {
    //   return store.getters['web3/data'];
    // },
    connected() {
      return store.getters['web3/connected'];
    },
    chainId() {
      return store.getters['web3/chainId'];
    },
    coinbase() {
      return store.getters['web3/coinbase'];
    },
    blockNumber() {
      return store.getters['web3/blockNumber'];
    },
    timestamp() {
      return store.getters['web3/timestamp'];
    },
    lastBaseFeePerGas() {
      return store.getters['web3/lastBaseFeePerGas'];
    },
    maxFeePerGas() {
      return store.getters['web3/maxFeePerGas'];
    },
    maxPriorityFeePerGas() {
      return store.getters['web3/maxPriorityFeePerGas'];
    },
    gasPrice() {
      return store.getters['web3/gasPrice'];
    },
    supportedNetwork() {
      return store.getters['web3/supportedNetwork'];
    },
    networkName() {
      return store.getters['web3/networkName'];
    },
    explorer() {
      return store.getters['web3/explorer'];
    },
  },
  methods: {
    navigateToBlock(blockNumber) {
      console.log(now() + " Web3 - methods.navigateToBlock - blockNumber: " + blockNumber);
      this.$router.push({ name: 'Block', params: { inputBlockNumber: blockNumber } });
      store.dispatch('block/loadBlock', blockNumber);
    },
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
    console.error(now() + " Web3 - mounted");
    store.dispatch('web3/restore');
  },
  destroyed() {
    console.log(now() + " Web3 - destroyed");
  },
};


const web3Module = {
  namespaced: true,
  state: {
    provider: null,

    data: {
      connected: false,
      error: false,
      chainId: null,
      coinbase: null,
      blockNumber: null,
      timestamp: null,
      lastBaseFeePerGas: null,
      maxFeePerGas: null,
      maxPriorityFeePerGas: null,
      gasPrice: null,
      version: 0,
    },

    lastBlockNumber: 0, // TODO: Delete
  },
  getters: {
    data: state => state.data,
    connected: state => state.data.connected,
    error: state => state.data.error,
    chainId: state => state.data.chainId,
    coinbase: state => state.data.coinbase,
    blockNumber: state => state.data.blockNumber,
    timestamp: state => state.data.timestamp,
    lastBaseFeePerGas: state => state.data.lastBaseFeePerGas,
    maxFeePerGas: state => state.data.maxFeePerGas,
    maxPriorityFeePerGas: state => state.data.maxPriorityFeePerGas,
    gasPrice: state => state.data.gasPrice,
    networkName(state) {
      const chain = state.data.chainId && store.getters['config/chains'][state.data.chainId] || null;
      return chain && chain.name || "Unknown chainId: " + state.data.chainId;
    },
    explorer(state) {
      const chain = state.data.chainId && store.getters['config/chains'][state.data.chainId] || null;
      return chain && chain.explorer || null;
    },
    api(state) {
      const chain = state.data.chainId && store.getters['config/chains'][state.data.chainId] || null;
      return chain && chain.api || null;
    },
    reservoir(state) {
      const chain = state.data.chainId && store.getters['config/chains'][state.data.chainId] || null;
      return chain && chain.reservoir || null;
    },
  },
  mutations: {
    setProvider(state, provider) {
      state.provider = provider;
    },

    setWeb3Info(state, info) {
      console.log(now() + " web3Module - mutations.setWeb3Info: " + JSON.stringify(info));
      state.data.connected = info.connected;
      state.data.error = info.error;
      state.data.chainId = info.chainId;
      state.data.blockNumber = info.blockNumber;
      state.data.timestamp = info.timestamp;
      state.data.coinbase = info.coinbase;
      console.log(now() + " web3Module - mutations.setWeb3Info - state.data: " + JSON.stringify(state.data));
    },
    setWeb3Connected(state, connected) {
      console.log(now() + " web3Module - mutations.setWeb3Connected: " + connected);
      state.data.connected = connected;
      console.log(now() + " web3Module - mutations.setWeb3Connected - state.data: " + JSON.stringify(state.data));
    },
    setWeb3Coinbase(state, coinbase) {
      console.log(now() + " web3Module - mutations.setWeb3Coinbase: " + coinbase);
      state.data.coinbase = coinbase;
      console.log(now() + " web3Module - mutations.setWeb3Coinbase - state.data: " + JSON.stringify(state.data));
    },
    setWeb3BlockInfo(state, info) {
      console.log(now() + " web3Module - mutations.setWeb3BlockInfo: " + JSON.stringify(info));
      state.data.blockNumber = info.blockNumber;
      state.data.timestamp = info.timestamp;
      state.data.lastBaseFeePerGas = info.lastBaseFeePerGas;
      state.data.maxFeePerGas = info.maxFeePerGas;
      state.data.maxPriorityFeePerGas = info.maxPriorityFeePerGas;
      state.data.gasPrice = info.gasPrice;
      console.log(now() + " web3Module - mutations.setWeb3BlockInfo - state.data: " + JSON.stringify(state.data));
    },

    // TODO: Delete
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
          console.log(now() + " web3Module - actions.connect - getBlockWithTransactions('latest') => blockNumber: " + blockNumber + " took " + (t1 - t0) + " ms");
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

            context.commit('setWeb3Coinbase', coinbase);
            context.dispatch("saveWeb3Info");

            // TODO: Delete
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
            // console.log(now() + " web3Module - actions.connect.handleNewBlock - blockNumber: " + blockNumber);
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
              console.log(now() + " web3Module - actions.connect.handleNewBlockDebounced - getBlockWithTransactions('latest') => blockNumber: " + blockNumber + " took " + (t1 - t0) + " ms");
              const feeData = await provider.getFeeData();
              const t2 = performance.now();
              console.log(now() + " web3Module - actions.connect.handleNewBlockDebounced - getFeeData() took " + (t2 - t1) + " ms");

              const dbInfo = store.getters["db"];
              const db = new Dexie(dbInfo.name);
              db.version(dbInfo.version).stores(dbInfo.schemaDefinition);
              const blockData = JSON.parse(JSON.stringify(block));
              await db.blocks.put({ chainId, ...blockData }).then (function() {
                }).catch(function(e) {
                  console.error(now() + " web3Module - actions.connect.handleNewBlockDebounced - ERROR blocks.put: " + e.message);
                });
              db.close();

              context.commit('setWeb3BlockInfo', {
                blockNumber: block.number,
                timestamp: block.timestamp,
                lastBaseFeePerGas: ethers.BigNumber.from(feeData.lastBaseFeePerGas).toString(),
                maxFeePerGas: ethers.BigNumber.from(feeData.maxFeePerGas).toString(),
                maxPriorityFeePerGas: ethers.BigNumber.from(feeData.maxPriorityFeePerGas).toString(),
                gasPrice: ethers.BigNumber.from(feeData.gasPrice).toString(),
              });
              context.dispatch("saveWeb3Info");

              // TODO: Delete
              // store.dispatch('setWeb3BlockInfo', {
              //   blockNumber: block.number,
              //   timestamp: block.timestamp,
              //   lastBaseFeePerGas: ethers.BigNumber.from(feeData.lastBaseFeePerGas).toString(),
              //   maxFeePerGas: ethers.BigNumber.from(feeData.maxFeePerGas).toString(),
              //   maxPriorityFeePerGas: ethers.BigNumber.from(feeData.maxPriorityFeePerGas).toString(),
              //   gasPrice: ethers.BigNumber.from(feeData.gasPrice).toString(),
              // });
              store.dispatch('blocks/addBlock', block);
            }
          }
          if (provider._events.length == 0) {
            provider.on("block", handleNewBlock);
            // TODO: Not working
            // function handleNewPendingTx(tx) {
            //   console.log(now() + " web3Module - actions.connect.handleNewPendingTx - tx: " + JSON.stringify(tx));
            // }
            // provider.on("pending", handleNewPendingTx);
          }
        }

      } else {
        error = "This app requires a web3 enabled browser";
      }

      context.commit('setWeb3Info', {
        connected,
        error,
        chainId,
        blockNumber,
        timestamp,
        coinbase,
      });
      context.dispatch("saveWeb3Info");

      // TODO: Delete
      // store.dispatch('setWeb3Info', {
      //   connected,
      //   error,
      //   chainId,
      //   blockNumber,
      //   timestamp,
      //   coinbase,
      //   lastBaseFeePerGas: ethers.BigNumber.from(feeData.lastBaseFeePerGas).toString(),
      //   maxFeePerGas: ethers.BigNumber.from(feeData.maxFeePerGas).toString(),
      //   maxPriorityFeePerGas: ethers.BigNumber.from(feeData.maxPriorityFeePerGas).toString(),
      //   gasPrice: ethers.BigNumber.from(feeData.gasPrice).toString(),
      // });
      context.commit('setProvider', provider);
    },
    restore(context) {
      console.error(now() + " web3Module - actions.restore");

      if ('explorerWeb3' in localStorage) {
        const tempSettings = JSON.parse(localStorage.explorerWeb3);
        console.error(now() + " web3Module - actions.restore - tempSettings: " + JSON.stringify(tempSettings));
        if ('version' in tempSettings && tempSettings.version == context.state.data.version) {
          // this.settings = tempSettings;
          context.commit('setWeb3Info', tempSettings);
        }
      }

      if (context.state.data.connected) {
        context.dispatch('connect');
      }
      // TODO: Delete
      // if (store.getters['web3'].connected) {
      //   context.dispatch('connect');
      // }
    },
    disconnect(context) {
      if (store.getters['web3/connected']) {
        if (context.state.provider) {
          context.state.provider.removeAllListeners();
          window.ethereum.removeAllListeners();
        }

        context.commit('setWeb3Connected', false);
        context.dispatch("saveWeb3Info");

        // TODO: Delete
        // store.dispatch('setWeb3Connected', false);
      }
    },
    saveWeb3Info(context) {
      console.error(now() + " web3Module - actions.saveWeb3Info - context.state.data: " + JSON.stringify(context.state.data));
      localStorage.explorerWeb3 = JSON.stringify(context.state.data);
    },
  },
};
