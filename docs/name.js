const Name = {
  template: `
    <div>
      <v-card>
        <v-card-text>
          <div v-if="!inputName">
            Enter ENS name in the search field above
          </div>
          <div v-else>
            {{ inputName }}
          </div>
          <div v-if="timestampString">
            timestampString: {{ timestampString }}
          </div>
          <v-textarea v-if="tx" :model-value="JSON.stringify(tx, null, 2)" label="Tx" rows="10">
          </v-textarea>
          <v-textarea v-if="txReceipt" :model-value="JSON.stringify(txReceipt, null, 2)" label="Tx Receipt" rows="10">
          </v-textarea>
        </v-card-text>
        <!-- <v-card-actions>
          <v-btn>Action 1</v-btn>
          <v-btn>Action 2</v-btn>
        </v-card-actions> -->
      </v-card>
    </div>
  `,
  props: ['inputName'],
  data: function () {
    return {
      txHash: null,
    };
  },
  computed: {
    tx() {
      return store.getters['name/tx'];
    },
    txReceipt() {
      return store.getters['name/txReceipt'];
    },
    timestamp() {
      return store.getters['name/timestamp'];
    },
    timestampString: {
      get: function() {
        return this.timestamp && this.formatTimestamp(this.timestamp) || null;
      },
    },

  },
  methods: {
    formatETH(e) {
      if (e) {
        return ethers.utils.formatEther(e).replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
      }
      return null;
    },
    formatTimestamp(ts) {
      if (ts != null) {
        return moment.unix(ts).format("YYYY-MM-DD HH:mm:ss");
      }
      return null;
    },
  },
  beforeCreate() {
    console.log(now() + " Name - beforeCreate");
	},
  mounted() {
    console.log(now() + " Name - mounted - inputName: " + this.inputName);
    const t = this;
    setTimeout(function() {
      store.dispatch('name/loadName', t.inputName);
    }, 1000);
	},
  unmounted() {
    console.log(now() + " Name - unmounted");
	},
  destroyed() {
    console.log(now() + " Name - destroyed");
	},
};

const nameModule = {
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
    async loadName(context, inputName) {
      console.log(now() + " nameModule - actions.loadName - inputName: " + inputName);
      let [error, tx, txReceipt, timestamp] = [null, null, null, null];
      const txHash = false;
      if (txHash) {
        if (!store.getters['web3'].connected || !window.ethereum) {
          error = "Not connected";
        }
        if (!error && !(/^0x([A-Fa-f0-9]{64})$/.test(txHash))) {
          error = "Invalid transaction hash";
        }
        if (!error) {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const tx_ = await provider.getTransaction(txHash);
          console.log("tx_: " + JSON.stringify(tx_, null, 2));
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
            maxFeePerGas: tx_.maxFeePerGas && ethers.BigNumber.from(tx_.maxFeePerGas).toString() || null,
            maxPriorityFeePerGas: tx_.maxPriorityFeePerGas && ethers.BigNumber.from(tx_.maxPriorityFeePerGas).toString() || null,
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
            byzantium: txReceipt_.byzantium || null,
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
