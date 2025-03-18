const Transaction = {
  template: `
    <div class="m-0 p-0">

      <b-card no-body no-header class="border-0" header-class="p-1">
        <b-card no-body class="border-0 m-0 mt-0">

          <div class="d-flex flex-wrap m-0 p-0 px-1 bg-white">
            <div class="m-0 mt-1 p-0" style="width: 36.0rem;">
              <b-form-input type="text" size="sm" :value="txHash" @change="loadTransaction($event);" debounce="600" v-b-popover.hover.bottom="'Transaction hash'" placeholder="🔍 tx hash, e.g., 0x1234...abcd"></b-form-input>
            </div>
            <div class="mt-1 pr-1">
              <b-dropdown size="sm" right text="" variant="link" class="m-0 p-0">
                <b-dropdown-text>Sample Transactions</b-dropdown-text>
                <b-dropdown-divider></b-dropdown-divider>
                <b-dropdown-item @click="loadTransaction('0x00cf367c9ee21dc9538355d1da4ebac9b83645b790b07dd2c9d15ae7f9aed6d2');">0x00cf367c - EF: DeFi Multisig Safe v1.4.1 transaction</b-dropdown-item>
                <b-dropdown-item @click="loadTransaction('0x7c74738e01721782e92f277afad75245bcb637f7e49bbf61bd67a46b7e568f3c');">0x7c74738e - EF: DeFi Multisig Safe v1.4.1 deployment by proxy</b-dropdown-item>
                <b-dropdown-item @click="loadTransaction('0xa3f23edc79ae0aa3052a0b5a5fb81f9e13729adb338592d970ffe4a8f5ee3766');">0xa3f23edc - TURBO deployment</b-dropdown-item>
                <b-dropdown-item @click="loadTransaction('0xe6030c80c06283197ec49ef8fa6f22ee57e07fab776136310801415db5ccc389');">0xe6030c80 - Random EOA to EOA ETH transfer</b-dropdown-item>
                <b-dropdown-item @click="loadTransaction('0xce56f56bd3712611e360b4ebd8071aa3246f2eff3042eef81c3f24dedab77915');">0xce56f56b - Random failed transaction</b-dropdown-item>
                <b-dropdown-item @click="loadTransaction('0x6afbe0f0ea3613edd6b84b71260836c03bddce81604f05c81a070cd671d3d765');">0x6afbe0f0 - Random older transaction</b-dropdown-item>
              </b-dropdown>
            </div>
            <!-- <div class="mt-0 flex-grow-1">
            </div> -->
          </div>

          <b-card no-body no-header bg-variant="light" class="m-1 p-1 w-75">
            <b-form-group label-cols-lg="2" label="Transaction" label-size="md" label-class="font-weight-bold pt-0" class="mt-3 mb-0">
              <b-form-group label="Hash:" label-for="transaction-hash" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
                <b-input-group>
                  <b-button v-if="tx && tx.hash" :href="'https://etherscan.io/tx/' + tx.hash" variant="link" target="_blank" class="m-0 p-0 pt-1">
                    {{ tx.hash }}
                  </b-button>
                  <b-input-group-append>
                    <b-button v-if="tx && tx.hash" size="sm" @click="copyToClipboard(tx.hash);" variant="link">
                      <b-icon-clipboard shift-v="-1" font-scale="1.1"></b-icon-clipboard>
                    </b-button>
                  </b-input-group-append>
                </b-input-group>
              </b-form-group>

              <b-form-group v-if="txReceipt && txReceipt.status != null" label="Status:" label-for="transaction-status" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0" :description="txReceipt && txReceipt.byzantium && ('Byzantium: ' + txReceipt.byzantium)">
                <b-form-input type="text" plaintext size="sm" id="transaction-status" :value="txReceipt.status == 1 ? 'SUCCESS' : 'FAIL'"></b-form-input>
              </b-form-group>

              <b-form-group label="Block:" label-for="transaction-block" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0" :description="timestamp && formatTimestamp(timestamp) || ''">
                <b-input-group>
                  <!-- <b-button v-if="tx && tx.blockNumber" :href="'https://etherscan.io/block/' + tx.blockNumber" variant="link" target="_blank" class="m-0 p-0 pt-1"> -->
                  <!-- <b-button v-if="tx && tx.blockNumber" to="{ path: '/block', params: { blockNumber: tx.blockNumber } }" variant="link" class="m-0 p-0 pt-1"> -->
                  <!-- <b-button v-if="tx && tx.blockNumber" @click="$router.push({ path: '/block/', params: { blockNumber: tx.blockNumber } })" variant="link" class="m-0 p-0 pt-1"> -->
                  <b-button v-if="tx && tx.blockNumber" :href="'#/block/' + tx.blockNumber" variant="link" class="m-0 p-0 pt-1">
                    {{ tx && tx.blockNumber && commify0(tx.blockNumber) || '' }}
                  </b-button>
                  <b-input-group-append>
                    <b-button v-if="tx && tx.blockNumber" size="sm" @click="copyToClipboard(tx.blockNumber);" variant="link">
                      <b-icon-clipboard shift-v="-1" font-scale="1.1"></b-icon-clipboard>
                    </b-button>
                  </b-input-group-append>
                </b-input-group>
              </b-form-group>

              <b-form-group label="From:" label-for="transaction-from" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0" :description="tx && tx.nonce && ('Nonce: ' + tx.nonce) || ''">
                <b-input-group>
                  <b-button v-if="tx && tx.from" :href="'https://etherscan.io/address/' + tx.from" variant="link" target="_blank" class="m-0 p-0 pt-1">
                    {{ tx.from }}
                  </b-button>
                  <b-input-group-append>
                    <b-button v-if="tx && tx.from" size="sm" @click="copyToClipboard(tx.from);" variant="link">
                      <b-icon-clipboard shift-v="-1" font-scale="1.1"></b-icon-clipboard>
                    </b-button>
                  </b-input-group-append>
                </b-input-group>
              </b-form-group>

              <!-- <b-form-group v-if="!(txReceipt && txReceipt.contractAddress)" label="To:" label-for="transaction-to" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0"> -->
              <b-form-group label="To:" label-for="transaction-to" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
                <b-input-group>
                  <b-button v-if="tx && tx.to" :href="'https://etherscan.io/address/' + tx.to" variant="link" target="_blank" class="m-0 p-0 pt-1">
                    {{ tx.to }}
                  </b-button>
                  <b-input-group-append>
                    <b-button v-if="tx && tx.to" size="sm" @click="copyToClipboard(tx.to);" variant="link">
                      <b-icon-clipboard shift-v="-1" font-scale="1.1"></b-icon-clipboard>
                    </b-button>
                  </b-input-group-append>
                </b-input-group>
              </b-form-group>

              <b-form-group v-if="txReceipt && txReceipt.contractAddress" label="Deployed contract:" label-for="transaction-contractaddress" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
                <b-input-group>
                  <b-button v-if="txReceipt && txReceipt.contractAddress" :href="'https://etherscan.io/address/' + txReceipt.contractAddress" variant="link" target="_blank" class="m-0 p-0 pt-1">
                    {{ txReceipt.contractAddress }}
                  </b-button>
                  <b-input-group-append>
                    <b-button v-if="txReceipt && txReceipt.contractAddress" size="sm" @click="copyToClipboard(txReceipt.contractAddress);" variant="link">
                      <b-icon-clipboard shift-v="-1" font-scale="1.1"></b-icon-clipboard>
                    </b-button>
                  </b-input-group-append>
                </b-input-group>
              </b-form-group>

              <b-form-group label="Value:" label-for="transaction-value" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
                <b-form-input type="text" plaintext size="sm" id="transaction-value" :value="tx && tx.value && (formatETH(tx.value) + ' ETH')"></b-form-input>
              </b-form-group>

              <b-form-group label="Fee:" label-for="transaction-fee" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
                <b-form-input type="text" plaintext size="sm" id="transaction-fee" :value="fee && (formatETH(fee) + ' ETH')"></b-form-input>
              </b-form-group>

              <b-form-group label="Data:" label-for="transaction-data" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
                <b-input-group class="align-items-start">
                  <b-form-textarea plaintext size="sm" id="transaction-data" :value="tx && tx.data && tx.data != '0x' && tx.data || ''" rows="3" max-rows="10"></b-form-textarea>
                  <b-input-group-append>
                    <b-button v-if="tx && tx.data" :disabled="tx.data == '0x'" size="sm" @click="copyToClipboard(tx.data);" variant="link">
                      <b-icon-clipboard shift-v="-1" font-scale="1.1"></b-icon-clipboard>
                    </b-button>
                  </b-input-group-append>
                </b-input-group>
              </b-form-group>

              <b-form-group label="Gas Limit:" label-for="transaction-gaslimit" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
                <b-form-input type="text" plaintext size="sm" id="transaction-gaslimit" :value="tx && tx.gasLimit && commify0(tx.gasLimit) || ''"></b-form-input>
              </b-form-group>
              <b-form-group label="Gas Used:" label-for="transaction-gasused" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
                <b-form-input type="text" plaintext size="sm" id="transaction-gasused" :value="txReceipt && txReceipt.gasUsed && commify0(txReceipt.gasUsed) || ''"></b-form-input>
              </b-form-group>
              <b-form-group label="Gas Price:" label-for="transaction-gasprice" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
                <b-form-input type="text" plaintext size="sm" id="transaction-gasprice" :value="tx && tx.gasPrice && (formatGas(tx.gasPrice) + ' gwei') || ''"></b-form-input>
              </b-form-group>
              <b-form-group label="Max Fee Per Gas:" label-for="transaction-maxfeepergas" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
                <b-form-input type="text" plaintext size="sm" id="transaction-maxfeepergas" :value="tx && tx.maxFeePerGas && (formatGas(tx.maxFeePerGas) + ' gwei') || ''"></b-form-input>
              </b-form-group>
              <b-form-group label="Max Priority Fee Per Gas:" label-for="transaction-maxpriorityfeepergas" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
                <b-form-input type="text" plaintext size="sm" id="transaction-maxpriorityfeepergas" :value="tx && tx.maxPriorityFeePerGas && (formatGas(tx.maxPriorityFeePerGas) + ' gwei') || ''"></b-form-input>
              </b-form-group>
              <b-form-group label="Effective Gas Price:" label-for="transaction-effectivegasprice" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
                <b-form-input type="text" plaintext size="sm" id="transaction-effectivegasprice" :value="txReceipt && txReceipt.effectiveGasPrice && (formatGas(txReceipt.effectiveGasPrice) + ' gwei') || ''"></b-form-input>
              </b-form-group>

              <b-form-group label="Logs (temp):" label-for="transaction-logs" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
                <b-form-textarea plaintext size="sm" id="transaction-logs" :value="txReceipt && txReceipt.logs && JSON.stringify(txReceipt.logs) || ''" rows="3" max-rows="10"></b-form-textarea>
              </b-form-group>

            </b-form-group>
          </b-card>
          <!-- <b-card-body class="p-0">
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
          </b-card-body> -->
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
    fee() {
      if (this.tx && this.txReceipt && this.txReceipt.gasUsed && this.txReceipt.effectiveGasPrice) {
        return ethers.BigNumber.from(this.txReceipt.gasUsed).mul(this.txReceipt.effectiveGasPrice);
      }
      return null;
    },
  },
  methods: {
    loadTransaction(txHash) {
      console.log(now() + " Transaction - loadTransaction - txHash: " + txHash);
      this.$router.push({ name: 'Transaction', params: { txHash } })
      store.dispatch('transaction/loadTransaction', txHash);
    },
    copyToClipboard(str) {
      navigator.clipboard.writeText(str);
    },
    commify0(n) {
      if (n != null) {
        return Number(n).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
      }
      return null;
    },
    formatETH(e) {
      if (e) {
        return ethers.utils.formatEther(e).replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
      }
      return null;
    },
    formatGas(e) {
      if (e) {
        return ethers.utils.formatUnits(e, "gwei").replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
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
