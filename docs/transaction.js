const Transaction = {
  template: `
    <div class="m-0 p-0">

      <b-card no-body no-header class="border-0" header-class="p-1">
        <b-card no-body class="border-0 m-0 mt-0">

          <div class="d-flex flex-wrap m-0 p-0 px-1 bg-white">
            <div class="ml-1 mt-1 p-0" style="width: 36.0rem;">
              <b-form-input type="text" size="sm" :value="txHash" @change="loadTransaction($event);" debounce="600" v-b-popover.hover.bottom="'Transaction hash'" placeholder="🔍 tx hash, e.g., 0x1234...abcd"></b-form-input>
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
  },
  methods: {
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
    console.log(now() + " Transaction - mounted() $route.params: " + JSON.stringify(this.$route.params));
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
      state.error = data.error;
      state.tx = data.tx;
      state.txReceipt = data.txReceipt;
      state.timestamp = data.timestamp;
    },
  },
  actions: {
    async loadTransaction(context, txHash) {
      console.log(now() + " transactionModule - actions.loadTransaction - txHash: " + txHash);
      let [error, tx, txReceipt, timestamp] = [null, null, null, null];
      if (txHash) {
        if (!store.getters['web3Connection'].connected || !window.ethereum) {
          error = "Not connected";
        }
        if (!error && !(/^0x([A-Fa-f0-9]{64})$/.test(txHash))) {
          error = "Invalid transaction hash";
        }
        if (!error) {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const tx_ = await provider.getTransaction(txHash);
          // console.log("tx_: " + JSON.stringify(tx_, null, 2));
          tx = {
            hash: tx_.hash,
            chainId: parseInt(tx_.chainId),
            blockNumber: parseInt(tx_.blockNumber),
            transactionIndex: tx_.transactionIndex,
            type: tx_.type || null,
            from: tx_.from,
            to: tx_.to,
            nonce: parseInt(tx_.nonce),
            value: ethers.BigNumber.from(tx_.value).toString(),
            data: tx_.data,
            gasLimit: parseInt(tx_.gasLimit),
            gasPrice: ethers.BigNumber.from(tx_.gasPrice).toString(),
            maxFeePerGas: ethers.BigNumber.from(tx_.maxFeePerGas).toString(),
            maxPriorityFeePerGas: ethers.BigNumber.from(tx_.maxPriorityFeePerGas).toString(),
            // accessList: tx_.accessList,
            // blockHash: tx_.blockHash,
            // r: tx_.r,
            // s: tx_.s,
            // v: tx_.v,
            // creates: tx_.creates,
          };
          const txReceipt_ = await provider.getTransactionReceipt(txHash);
          console.log("txReceipt_: " + JSON.stringify(txReceipt_, null, 2));
          txReceipt = {
            status: txReceipt_.status,
            type: txReceipt_.type,
            byzantium: txReceipt_.byzantium,
            contractAddress: txReceipt_.contractAddress,
            gasUsed: parseInt(txReceipt_.gasUsed),
            cumulativeGasUsed: parseInt(txReceipt_.cumulativeGasUsed),
            effectiveGasPrice: ethers.BigNumber.from(txReceipt_.effectiveGasPrice).toString(),
            logs: txReceipt_.logs,
            // to: txReceipt_.to,
            // from: txReceipt_.from,
            // blockNumber: parseInt(txReceipt_.blockNumber),
            // logsBloom: txReceipt_.logsBloom,
            // blockHash: txReceipt_.blockHash,
          };
          const block = tx && await provider.getBlock(tx.blockNumber) || null;
          timestamp = block && block.timestamp || null;
          if (!tx || !txReceipt) {
            error = "Transaction with specified hash cannot be found"
          }
        }
      }
      context.commit('setData', { error, tx, txReceipt, timestamp });
    }
  },
};
