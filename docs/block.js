const Block = {
  template: `
    <div class="m-0 p-0">

      <b-card no-body no-header class="border-0" header-class="p-1">
        <b-card no-body class="border-0 m-0 mt-0">

          <div class="d-flex flex-wrap m-0 p-0 px-1 bg-white">
            <div class="m-0 mt-1 p-0" style="width: 36.0rem;">
              <b-form-input type="text" size="sm" :value="blockNumber" @change="loadBlock($event);" debounce="600" v-b-popover.hover.bottom="'Block'" placeholder="🔍 block, e.g., 4000000"></b-form-input>
            </div>
            <!-- <div class="mt-1 pr-1">
              <b-dropdown size="sm" right text="" variant="link" class="m-0 p-0">
                <b-dropdown-text>Sample Blocks</b-dropdown-text>
                <b-dropdown-divider></b-dropdown-divider>
                <b-dropdown-item @click="loadBlock('0x00cf367c9ee21dc9538355d1da4ebac9b83645b790b07dd2c9d15ae7f9aed6d2');">0x00cf367c - EF: DeFi Multisig Safe v1.4.1 transaction</b-dropdown-item>
                <b-dropdown-item @click="loadBlock('0x7c74738e01721782e92f277afad75245bcb637f7e49bbf61bd67a46b7e568f3c');">0x7c74738e - EF: DeFi Multisig Safe v1.4.1 deployment by proxy</b-dropdown-item>
                <b-dropdown-item @click="loadBlock('0xa3f23edc79ae0aa3052a0b5a5fb81f9e13729adb338592d970ffe4a8f5ee3766');">0xa3f23edc - TURBO deployment</b-dropdown-item>
                <b-dropdown-item @click="loadBlock('0xe6030c80c06283197ec49ef8fa6f22ee57e07fab776136310801415db5ccc389');">0xe6030c80 - Random EOA to EOA ETH transfer</b-dropdown-item>
                <b-dropdown-item @click="loadBlock('0xce56f56bd3712611e360b4ebd8071aa3246f2eff3042eef81c3f24dedab77915');">0xce56f56b - Random failed transaction</b-dropdown-item>
                <b-dropdown-item @click="loadBlock('0x6afbe0f0ea3613edd6b84b71260836c03bddce81604f05c81a070cd671d3d765');">0x6afbe0f0 - Random older transaction</b-dropdown-item>
              </b-dropdown>
            </div> -->
            <!-- <div class="mt-0 flex-grow-1">
            </div> -->
          </div>

          <b-card no-body no-header bg-variant="light" class="m-1 p-1 w-75">
            <b-form-group label-cols-lg="2" label="Block" label-size="md" label-class="font-weight-bold pt-0" class="mt-3 mb-0">
              <b-form-group label="Block:" label-for="block-blocknumber" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
                <b-input-group>
                  <b-input-group-prepend>
                    <b-button v-if="block && block.number != null" size="sm" @click="loadBlock(parseInt(blockNumber) - 1);" variant="link">
                      <b-icon-chevron-left shift-v="-1" font-scale="1.1"></b-icon-chevron-left>
                    </b-button>
                  </b-input-group-prepend>
                  <b-button v-if="block && block.number != null" :href="'https://etherscan.io/block/' + block.number" variant="link" target="_blank" class="m-0 p-0 pt-1">
                    {{ commify0(block.number) }}
                  </b-button>
                  <b-input-group-append>
                    <b-button v-if="block && block.number != null" size="sm" @click="loadBlock(parseInt(blockNumber) + 1);" variant="link">
                      <b-icon-chevron-right shift-v="-1" font-scale="1.1"></b-icon-chevron-right>
                    </b-button>
                    <b-button v-if="block && block.number != null" size="sm" @click="copyToClipboard(block.number);" variant="link">
                      <b-icon-clipboard shift-v="-1" font-scale="1.1"></b-icon-clipboard>
                    </b-button>
                  </b-input-group-append>
                </b-input-group>
              </b-form-group>

              <b-form-group label="Timestamp:" label-for="block-timestamp" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
                <b-form-input type="text" plaintext size="sm" id="block-timestamp" :value="block && block.timestamp && formatTimestamp(block.timestamp) || ''"></b-form-input>
              </b-form-group>

              <b-form-group label="Miner:" label-for="block-miner" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
                <b-input-group>
                  <b-button v-if="block && block.miner" :href="'https://etherscan.io/address/' + block.miner" variant="link" target="_blank" class="m-0 p-0 pt-1">
                    {{ block.miner }}
                  </b-button>
                  <b-input-group-append>
                    <b-button v-if="block && block.miner" size="sm" @click="copyToClipboard(block.miner);" variant="link">
                      <b-icon-clipboard shift-v="-1" font-scale="1.1"></b-icon-clipboard>
                    </b-button>
                  </b-input-group-append>
                </b-input-group>
              </b-form-group>

              <b-form-group label="Block Hash:" label-for="block-hash" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
                <b-form-input type="text" plaintext size="sm" id="block-hash" :value="block && block.hash || ''"></b-form-input>
              </b-form-group>

              <!-- TODO: Link -->
              <b-form-group label="Parent Block Hash:" label-for="block-parentblockhash" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
                <b-form-input type="text" plaintext size="sm" id="block-parentblockhash" :value="block && block.parentHash || ''"></b-form-input>
              </b-form-group>

              <b-form-group label="Nonce:" label-for="block-nonce" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
                <b-form-input type="text" plaintext size="sm" id="block-nonce" :value="block && block.nonce || ''"></b-form-input>
              </b-form-group>

              <b-form-group label="Difficulty:" label-for="block-difficulty" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
                <b-form-input type="text" plaintext size="sm" id="block-difficulty" :value="block && block.difficulty && commify0(block.difficulty) || ''"></b-form-input>
              </b-form-group>

              <b-form-group label="Gas Limit:" label-for="block-gaslimit" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
                <b-form-input type="text" plaintext size="sm" id="block-gaslimit" :value="block && block.gasLimit && commify0(block.gasLimit) || ''"></b-form-input>
              </b-form-group>

              <b-form-group label="Gas Used:" label-for="block-gasused" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
                <b-form-input type="text" plaintext size="sm" id="block-gasused" :value="block && block.gasUsed && commify0(block.gasUsed) || ''"></b-form-input>
              </b-form-group>

              <b-form-group label="Extra Data:" label-for="block-extradata" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0" :description="extraDataAsString">
                <b-form-input type="text" plaintext size="sm" id="block-extradata" :value="block && block.extraData && block.extraData || ''"></b-form-input>
              </b-form-group>

              <!-- <b-form-group v-if="txReceipt && txReceipt.status != null" label="Status:" label-for="block-status" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0" :description="txReceipt && txReceipt.byzantium && ('Byzantium: ' + txReceipt.byzantium)">
                <b-form-input type="text" plaintext size="sm" id="block-status" :value="txReceipt.status == 1 ? 'SUCCESS' : 'FAIL'"></b-form-input>
              </b-form-group> -->

              <!-- <b-form-group label="Block:" label-for="block-block" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0" :description="timestamp && formatTimestamp(timestamp) || ''">
                <b-input-group>
                  <b-button v-if="tx && tx.blockNumber" :href="'https://etherscan.io/block/' + tx.blockNumber" variant="link" target="_blank" class="m-0 p-0 pt-1">
                    {{ tx && tx.blockNumber && commify0(tx.blockNumber) || '' }}
                  </b-button>
                  <b-input-group-append>
                    <b-button v-if="tx && tx.blockNumber" size="sm" @click="copyToClipboard(tx.blockNumber);" variant="link">
                      <b-icon-clipboard shift-v="-1" font-scale="1.1"></b-icon-clipboard>
                    </b-button>
                  </b-input-group-append>
                </b-input-group>
              </b-form-group> -->

              <!-- <b-form-group label="From:" label-for="block-from" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0" :description="tx && tx.nonce && ('Nonce: ' + tx.nonce) || ''">
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
              </b-form-group> -->

              <!-- <b-form-group label="To:" label-for="block-to" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
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
              </b-form-group> -->

              <!-- <b-form-group v-if="txReceipt && txReceipt.contractAddress" label="Deployed contract:" label-for="block-contractaddress" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
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
              </b-form-group> -->

              <!-- <b-form-group label="Value:" label-for="block-value" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
                <b-form-input type="text" plaintext size="sm" id="block-value" :value="tx && tx.value && (formatETH(tx.value) + ' ETH')"></b-form-input>
              </b-form-group> -->

              <!-- <b-form-group label="Fee:" label-for="block-fee" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
                <b-form-input type="text" plaintext size="sm" id="block-fee" :value="fee && (formatETH(fee) + ' ETH')"></b-form-input>
              </b-form-group> -->

              <!-- <b-form-group label="Data:" label-for="block-data" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
                <b-input-group class="align-items-start">
                  <b-form-textarea plaintext size="sm" id="block-data" :value="tx && tx.data && tx.data != '0x' && tx.data || ''" rows="3" max-rows="10"></b-form-textarea>
                  <b-input-group-append>
                    <b-button v-if="tx && tx.data" :disabled="tx.data == '0x'" size="sm" @click="copyToClipboard(tx.data);" variant="link">
                      <b-icon-clipboard shift-v="-1" font-scale="1.1"></b-icon-clipboard>
                    </b-button>
                  </b-input-group-append>
                </b-input-group>
              </b-form-group> -->

              <!-- <b-form-group label="Gas Limit:" label-for="block-gaslimit" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
                <b-form-input type="text" plaintext size="sm" id="block-gaslimit" :value="tx && tx.gasLimit && commify0(tx.gasLimit) || ''"></b-form-input>
              </b-form-group>
              <b-form-group label="Gas Used:" label-for="block-gasused" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
                <b-form-input type="text" plaintext size="sm" id="block-gasused" :value="txReceipt && txReceipt.gasUsed && commify0(txReceipt.gasUsed) || ''"></b-form-input>
              </b-form-group>
              <b-form-group label="Gas Price:" label-for="block-gasprice" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
                <b-form-input type="text" plaintext size="sm" id="block-gasprice" :value="tx && tx.gasPrice && (formatGas(tx.gasPrice) + ' gwei') || ''"></b-form-input>
              </b-form-group>
              <b-form-group label="Max Fee Per Gas:" label-for="block-maxfeepergas" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
                <b-form-input type="text" plaintext size="sm" id="block-maxfeepergas" :value="tx && tx.maxFeePerGas && (formatGas(tx.maxFeePerGas) + ' gwei') || ''"></b-form-input>
              </b-form-group>
              <b-form-group label="Max Priority Fee Per Gas:" label-for="block-maxpriorityfeepergas" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
                <b-form-input type="text" plaintext size="sm" id="block-maxpriorityfeepergas" :value="tx && tx.maxPriorityFeePerGas && (formatGas(tx.maxPriorityFeePerGas) + ' gwei') || ''"></b-form-input>
              </b-form-group>
              <b-form-group label="Effective Gas Price:" label-for="block-effectivegasprice" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
                <b-form-input type="text" plaintext size="sm" id="block-effectivegasprice" :value="txReceipt && txReceipt.effectiveGasPrice && (formatGas(txReceipt.effectiveGasPrice) + ' gwei') || ''"></b-form-input>
              </b-form-group> -->

              <!-- <b-form-group label="Logs (temp):" label-for="block-logs" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
                <b-form-textarea plaintext size="sm" id="block-logs" :value="txReceipt && txReceipt.logs && JSON.stringify(txReceipt.logs) || ''" rows="3" max-rows="10"></b-form-textarea>
              </b-form-group> -->

            </b-form-group>
          </b-card>
          <b-card-text>
            <h5>Block</h5>
            error: {{ error }}
            <br />
            block: {{ block }}
          </b-card-text>
        </b-card>
      </b-card>
    </div>
  `,
  props: ['blockNumber'],
  data: function () {
    return {
      count: 0,
      reschedule: true,
    }
  },
  computed: {
    error() {
      return store.getters['block/error'];
    },
    block() {
      return store.getters['block/block'];
    },
    extraDataAsString() {
      try {
        const extraData = store.getters['block/block'] && store.getters['block/block'].extraData || null;
        return extraData && ethers.utils.toUtf8String(extraData) || null;
      } catch (e) {
      }
      return null;
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
    loadBlock(blockNumber) {
      console.log(now() + " Block - loadBlock - blockNumber: " + blockNumber);
      this.$router.push({ name: 'Block', params: { blockNumber } })
      store.dispatch('block/loadBlock', blockNumber);
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
  //   console.log(now() + " Block - beforeRouteUpdate");
  //   console.table(to);
  //   console.table(from);
  // },
  beforeDestroy() {
    console.log(now() + " Block - beforeDestroy()");
  },
  mounted() {
    console.log(now() + " Block - mounted() $route.params: " + JSON.stringify(this.$route.params));
    const t = this;
    setTimeout(function() {
      store.dispatch('block/loadBlock', t.blockNumber);
    }, 1000);
  },
  destroyed() {
    this.reschedule = false;
  },
};

const blockModule = {
  namespaced: true,
  state: {
    error: null,
    block: null,
  },
  getters: {
    error: state => state.error,
    block: state => state.block,
  },
  mutations: {
    setData(state, data) {
      console.log(now() + " blockModule - mutations.setData - data: " + JSON.stringify(data));
      state.error = data.error;
      state.block = data.block;
    },
  },
  actions: {
    async loadBlock(context, blockNumber) {
      console.log(now() + " blockModule - actions.loadBlock - blockNumber: " + blockNumber);
      let [error, block] = [null, null];
      if (blockNumber) {
        if (!store.getters['web3Connection'].connected || !window.ethereum) {
          error = "Not connected";
        }
        if (!error && !(/^[0-9]+$/.test(blockNumber))) {
          error = "Invalid block number";
        }
        if (!error) {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          // const tx_ = await provider.getTransaction(txHash);
          // console.log("tx_: " + JSON.stringify(tx_, null, 2));
          // tx = {
          //   hash: tx_.hash,
          //   chainId: parseInt(tx_.chainId),
          //   blockNumber: parseInt(tx_.blockNumber),
          //   transactionIndex: tx_.transactionIndex,
          //   type: tx_.type || null,
          //   from: tx_.from,
          //   to: tx_.to,
          //   nonce: parseInt(tx_.nonce),
          //   value: ethers.BigNumber.from(tx_.value).toString(),
          //   data: tx_.data,
          //   gasLimit: parseInt(tx_.gasLimit),
          //   gasPrice: ethers.BigNumber.from(tx_.gasPrice).toString(),
          //   maxFeePerGas: tx_.maxFeePerGas && ethers.BigNumber.from(tx_.maxFeePerGas).toString() || null,
          //   maxPriorityFeePerGas: tx_.maxPriorityFeePerGas && ethers.BigNumber.from(tx_.maxPriorityFeePerGas).toString() || null,
          //   // accessList: tx_.accessList,
          //   // blockHash: tx_.blockHash,
          //   // r: tx_.r,
          //   // s: tx_.s,
          //   // v: tx_.v,
          //   // creates: tx_.creates,
          // };
          // const txReceipt_ = await provider.getTransactionReceipt(txHash);
          // console.log("txReceipt_: " + JSON.stringify(txReceipt_, null, 2));
          // txReceipt = {
          //   status: txReceipt_.status,
          //   type: txReceipt_.type,
          //   byzantium: txReceipt_.byzantium || null,
          //   contractAddress: txReceipt_.contractAddress,
          //   gasUsed: parseInt(txReceipt_.gasUsed),
          //   cumulativeGasUsed: parseInt(txReceipt_.cumulativeGasUsed),
          //   effectiveGasPrice: ethers.BigNumber.from(txReceipt_.effectiveGasPrice).toString(),
          //   logs: txReceipt_.logs,
          //   // to: txReceipt_.to,
          //   // from: txReceipt_.from,
          //   // blockNumber: parseInt(txReceipt_.blockNumber),
          //   // logsBloom: txReceipt_.logsBloom,
          //   // blockHash: txReceipt_.blockHash,
          // };
          block = await provider.getBlockWithTransactions(parseInt(blockNumber)) || null;
          // console.log("DEBUG 4 - block: " + JSON.stringify(block));
          // timestamp = block && block.timestamp || null;
          // if (!tx || !txReceipt) {
          //   error = "Block with specified number cannot be found"
          // }
        }
      }
      // console.log("error: " + error);
      // console.log("block: " + JSON.string(block, null, 2));
      // console.table(block);
      context.commit('setData', { error, block });
    }
  },
};
