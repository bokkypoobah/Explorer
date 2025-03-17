const Transaction = {
  template: `
    <div class="m-0 p-0">

      <b-card no-body no-header class="border-0" header-class="p-1">
        <b-card no-body class="border-0 m-0 mt-0">

          <div class="d-flex flex-wrap m-0 p-0 px-1 bg-white">
            <div class="ml-1 mt-1 p-0" style="width: 36.0rem;">
              <b-form-input type="text" size="sm" :value="txHash" @change="updateTxHash($event);" debounce="600" v-b-popover.hover.bottom="'Transaction hash'" placeholder="🔍 tx hash, e.g., 0x1234...abcd"></b-form-input>
            </div>
            <div class="mt-1 pr-1">
              <b-dropdown size="sm" right text="" variant="link" class="m-0 p-0">
                <b-dropdown-text>Sample Transactions</b-dropdown-text>
                <b-dropdown-divider></b-dropdown-divider>
                <b-dropdown-item @click="loadTransaction('0x00cf367c9ee21dc9538355d1da4ebac9b83645b790b07dd2c9d15ae7f9aed6d2');">EF: DeFi Multisig - Safe v1.4.1 - Transaction</b-dropdown-item>
                <b-dropdown-item @click="loadTransaction('0xe6030c80c06283197ec49ef8fa6f22ee57e07fab776136310801415db5ccc389');">Random EOA to EOA ETH transfer</b-dropdown-item>
              </b-dropdown>
            </div>
            <!-- <div class="mt-0 flex-grow-1">
            </div> -->
          </div>

          <b-card-body class="p-0">
            <b-card class="mb-2 border-0">

              <b-card-text>
                <h5>Transaction</h5>
                error: {{ error }}
                <br />
                tx: {{ tx }}
                <br />
                txReceipt: {{ txReceipt }}
                <br />
                timestamp: {{ timestamp }}
              </b-card-text>

            </b-card>
          </b-card-body>
        </b-card>
      </b-card>
    </div>
  `,
  props: ['txHash'],
  data: function () {
    return {
      count: 0,
      reschedule: true,
    }
  },
  computed: {
    error() {
      return store.getters['transaction/error'];
    },
    tx() {
      return store.getters['transaction/tx'];
    },
    txReceipt () {
      return store.getters['transaction/txReceipt'];
    },
    timestamp () {
      return store.getters['transaction/timestamp'];
    },
    // coinbase() {
    //   return store.getters['connection/coinbase'];
    // },
    // chainId() {
    //   return store.getters['connection/chainId'];
    // },
  },
  methods: {
    updateTxHash(txHash) {
      console.log(now() + " Transaction - updateTxHash - txHash: " + txHash);
      this.$router.push({ name: 'Transaction', params: { txHash } })
      store.dispatch('transaction/loadTransaction', txHash);
    },
    // TODO: May be duplicate of above
    loadTransaction(txHash) {
      console.log(now() + " Transaction - loadTransaction - txHash: " + txHash);
      this.$router.push({ name: 'Transaction', params: { txHash } })
      store.dispatch('transaction/loadTransaction', txHash);
    },
  },
  // beforeRouteUpdate(to, from) {
  //   console.log(now() + " Transaction - beforeRouteUpdate");
  //   console.table(to);
  //   console.table(from);
  // },
  beforeDestroy() {
    console.log(now() + " Transaction - beforeDestroy()");
  },
  mounted() {
    console.log(now() + " Transaction - mounted() $route: " + JSON.stringify(this.$route.params));
    console.log(now() + " Transaction - mounted() this.txHash: " + this.txHash);
    store.dispatch('config/restoreState');
    const t = this;
    setTimeout(function() {
      store.dispatch('transaction/loadTransaction', t.txHash);
    }, 1000);
  },
  destroyed() {
    this.reschedule = false;
  },
};

const transactionModule = {
  namespaced: true,
  state: {
    error: null,
    tx: null,
    txReceipt: null,
    timestamp: null,
  },
  getters: {
    error: state => state.error,
    tx: state => state.tx,
    txReceipt: state => state.txReceipt,
    timestamp: state => state.timestamp,
  },
  mutations: {
    setData(state, data) {
      // console.log(now() + " transactionModule - mutations.setData - data: " + JSON.stringify(data));
      state.error = data.error;
      state.tx = data.tx;
      state.txReceipt = data.txReceipt;
      state.timestamp = data.timestamp;
      // console.log(now() + " transactionModule - mutations.setData - state.tx: " + JSON.stringify(state.tx));
      // console.log(now() + " transactionModule - mutations.setData - state.txReceipt: " + JSON.stringify(state.txReceipt));
    },
  },
  actions: {
    async loadTransaction(context, txHash) {
      console.log(now() + " transactionModule - actions.loadTransaction - txHash: " + txHash);
      let [error, tx, txReceipt, timestamp] = [null, null, null, null];
      if (/^0x([A-Fa-f0-9]{64})$/.test(txHash)) {
        if (store.getters['connection/connected'] && window.ethereum) {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          tx = await provider.getTransaction(txHash);
          txReceipt = await provider.getTransactionReceipt(txHash);
          const block = tx && await provider.getBlock(tx.blockNumber) || null;
          timestamp = block && block.timestamp || null;
          if (!tx || !txReceipt) {
            error = "Transaction with specified hash cannot be found"
          }
        } else {
          error = "Not connected";
        }
      } else {
        error = "Invalid transaction hash";
      }
      context.commit('setData', { error, tx, txReceipt, timestamp });
    }
  },
};
