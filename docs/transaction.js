const Transaction = {
  template: `
    <div>
      <v-container fluid class="pa-1">
        <v-toolbar density="compact" class="mt-1">
          <h4 class="ml-2">Transaction</h4>
          <render-tx-hash v-if="tx && tx.hash" :txHash="tx.hash" shortTxHash suppressView></render-tx-hash>
          <p v-if="tx && tx.blockNumber" class="ml-5 text-caption text--disabled">
            {{ commify0(tx.blockNumber) }} @ {{ timestampString }}, {{ timestamp && formatTimeDiff(timestamp) }}
          </p>
          <v-spacer></v-spacer>
          <v-tabs v-model="settings.tab" @update:modelValue="saveSettings();" right color="deep-purple-accent-4">
            <v-tab prepend-icon="mdi-text-long" text="Info" value="info" class="lowercase-btn"></v-tab>
            <v-tab prepend-icon="mdi-math-log" text="Events" value="events" class="lowercase-btn"></v-tab>
            <v-tab prepend-icon="mdi-code-json" text="Raw" value="raw" class="lowercase-btn"></v-tab>
          </v-tabs>
        </v-toolbar>
        <v-tabs-window v-model="settings.tab">
          <v-tabs-window-item value="info">
            <v-card>
              <v-card-text>
                <v-row no-gutters dense>
                  <v-col cols="2" align="right">
                    <p class="my-2">Transaction Hash:</p>
                  </v-col>
                  <v-col cols="6" align="left">
                    <render-tx-hash v-if="tx && tx.hash" :txHash="tx.hash" suppressView></render-tx-hash>
                  </v-col>
                </v-row>
                <v-row no-gutters dense>
                  <v-col cols="2" align="right">
                    <p class="my-2">Type:</p>
                  </v-col>
                  <v-col cols="10" align="left">
                    <v-btn v-if="tx" variant="text" class="lowercase-btn ma-0 px-2" style="min-width: 0px;">
                      {{ tx.type }}
                    </v-btn>
                  </v-col>
                </v-row>
                <v-row no-gutters dense>
                  <v-col cols="2" align="right">
                    <p class="my-2">Status:</p>
                  </v-col>
                  <v-col cols="10" align="left">
                    <v-btn v-if="txReceipt && txReceipt.status" variant="text" class="lowercase-btn ma-0 px-2">
                      {{ txReceipt.status == "1" ? "SUCCESS" : "FAILURE" }}
                    </v-btn>
                  </v-col>
                </v-row>
                <v-row no-gutters dense>
                  <v-col cols="2" align="right">
                    <p class="my-2">Block:</p>
                  </v-col>
                  <v-col cols="10" align="left">
                    <render-block-number v-if="tx && tx.blockNumber" :block="tx.blockNumber" suppressView></render-block-number>
                  </v-col>
                </v-row>
                <v-row no-gutters dense>
                  <v-col cols="2" align="right">
                    <p class="my-2">Timestamp:</p>
                  </v-col>
                  <v-col cols="10" align="left">
                    <v-btn v-if="timestamp" variant="text" class="lowercase-btn ma-0 px-2">
                      {{ formatTimestamp(timestamp) + ", " + formatTimeDiff(timestamp) }}
                    </v-btn>
                  </v-col>
                </v-row>
                <v-row no-gutters dense>
                  <v-col cols="2" align="right">
                    <p class="my-2">From:</p>
                  </v-col>
                  <v-col cols="10" align="left">
                    <render-address v-if="tx && tx.from" :address="tx.from"></render-address>
                  </v-col>
                </v-row>
                <v-row no-gutters dense>
                  <v-col cols="2" align="right">
                    <p class="my-2">Nonce:</p>
                  </v-col>
                  <v-col cols="10" align="left">
                    <v-btn v-if="tx" variant="text" class="lowercase-btn ma-0 px-2" style="min-width: 0px;">
                      {{ tx.nonce }}
                    </v-btn>
                  </v-col>
                </v-row>
                <v-row no-gutters dense>
                  <v-col cols="2" align="right">
                    <p class="my-2">To:</p>
                  </v-col>
                  <v-col cols="10" align="left">
                    <render-address v-if="tx && tx.to" :address="tx.to"></render-address>
                  </v-col>
                </v-row>
                <v-row no-gutters dense>
                  <v-col cols="2" align="right">
                    <p class="my-2">Value (Ξ):</p>
                  </v-col>
                  <v-col cols="10" align="left">
                    <v-btn v-if="tx && tx.value" variant="text" class="lowercase-btn ma-0 px-2" style="min-width: 0px;">
                      {{ formatETH(tx.value) }}
                    </v-btn>
                  </v-col>
                </v-row>
                <v-row no-gutters dense>
                  <v-col cols="2" align="right">
                    <p class="my-2">Fee (Ξ):</p>
                  </v-col>
                  <v-col cols="10" align="left">
                    <v-btn v-if="fee" variant="text" class="lowercase-btn ma-0 px-2" style="min-width: 0px;">
                      {{ formatETH(fee) }}
                    </v-btn>
                  </v-col>
                </v-row>
                <v-row no-gutters dense>
                  <v-col cols="2" align="right">
                    <p class="my-2">Gas Used / Limit, %:</p>
                  </v-col>
                  <v-col cols="10" align="left">
                    <v-btn v-if="tx && txReceipt" variant="text" class="lowercase-btn ma-0 px-2">
                      {{ commify0(txReceipt.gasUsed) + " / " + commify0(tx.gasLimit) + ", " + gasPercentage + "%" }}
                    </v-btn>
                  </v-col>
                </v-row>
                <v-row no-gutters dense>
                  <v-col cols="2" align="right">
                    <p class="my-2">Data:</p>
                  </v-col>
                  <v-col cols="10" align="left">
                    <v-textarea v-if="tx && tx.data" :model-value="tx.data" rows="5" max-rows="10" class="ma-2">
                    </v-textarea>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-tabs-window-item>
          <v-tabs-window-item value="events">
            Events
          </v-tabs-window-item>
          <v-tabs-window-item value="raw">
            <v-textarea v-if="tx" :model-value="JSON.stringify(tx, null, 2)" label="Tx" rows="10" class="ma-2">
            </v-textarea>
            <v-textarea v-if="txReceipt" :model-value="JSON.stringify(txReceipt, null, 2)" label="Tx Receipt" rows="10" class="ma-2">
            </v-textarea>
          </v-tabs-window-item>
        </v-tabs-window>
      </v-container>
    </div>
  `,
  props: ['inputTxHash'],
  data: function () {
    return {
      initialised: false,
      settings: {
        tab: null,
        // txHash: null,
        version: 0,
      },
    };
  },
  computed: {
    explorer() {
      return store.getters['explorer'];
    },
    tx() {
      return store.getters['transaction/tx'];
    },
    txReceipt() {
      return store.getters['transaction/txReceipt'];
    },
    timestamp() {
      return store.getters['transaction/timestamp'];
    },
    timestampString: {
      get: function() {
        return this.timestamp && this.formatTimestamp(this.timestamp) || null;
      },
    },
    gasPercentage() {
      if (this.tx && this.txReceipt) {
        return ethers.BigNumber.from(this.txReceipt.gasUsed).mul(100).div(this.tx.gasLimit);
      }
      return null;
    },
    fee() {
      if (this.txReceipt) {
        return ethers.BigNumber.from(this.txReceipt.gasUsed).mul(this.txReceipt.effectiveGasPrice);
      }
      return null;
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
    formatTimeDiff(unixtime) {
      if (unixtime) {
        return moment.unix(unixtime).fromNow();
      }
      return null;
    },
    commify0(n) {
      if (n != null) {
        return Number(n).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
      }
      return null;
    },
    copyToClipboard(str) {
      navigator.clipboard.writeText(str);
    },
    saveSettings() {
      console.log(now() + " Transaction - methods.saveSettings - settings: " + JSON.stringify(this.settings, null, 2));
      if (this.initialised) {
        localStorage.explorerTransactionSettings = JSON.stringify(this.settings);
      }
    },
  },
  beforeCreate() {
    console.log(now() + " Transaction - beforeCreate");
	},
  mounted() {
    console.log(now() + " Transaction - mounted - inputTxHash: " + this.inputTxHash);

    if ('explorerTransactionSettings' in localStorage) {
      const tempSettings = JSON.parse(localStorage.explorerTransactionSettings);
      console.log(now() + " Transaction - mounted - tempSettings: " + JSON.stringify(tempSettings));
      if ('version' in tempSettings && tempSettings.version == this.settings.version) {
        this.settings = tempSettings;
      }
    }
    this.initialised = true;
    console.log(now() + " Block - mounted - this.settings: " + JSON.stringify(this.settings));

    const t = this;
    setTimeout(function() {
      store.dispatch('transaction/loadTransaction', t.inputTxHash);
    }, 1000);
	},
  unmounted() {
    console.log(now() + " Transaction - unmounted");
	},
  destroyed() {
    console.log(now() + " Transaction - destroyed");
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
