const Block = {
  template: `
    <div class="m-0 p-0">

      <b-card no-body no-header class="border-0">
        <b-card no-body class="border-0 m-0 mt-0">

          <div class="d-flex flex-wrap m-0 p-0 px-1 bg-white">
            <div class="m-0 mt-1 p-0" style="width: 12.0rem;">
              <b-form-input type="text" size="sm" :value="blockNumber" @change="loadBlock($event);" debounce="600" v-b-popover.hover.bottom="'Block'" placeholder="🔍 block, e.g., 20000000"></b-form-input>
            </div>
            <div class="mt-1 pr-1">
              <b-dropdown size="sm" right text="" variant="link" class="m-0 p-0">
                <b-dropdown-text>Sample Blocks</b-dropdown-text>
                <b-dropdown-divider></b-dropdown-divider>
                <b-dropdown-item @click="loadBlock('20000000');">20,000,000</b-dropdown-item>
              </b-dropdown>
            </div>
          </div>

          <b-card no-body no-header bg-variant="light" class="m-1 p-1 w-75">
            <!-- TODO: block or blockHash -->
            <b-form-group label-cols-lg="2" label="Block" label-size="md" label-class="font-weight-bold pt-0" class="mt-3 mb-0">

              <b-form-group v-if="error" label="Error:" label-for="address-error" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
                <b-form-input type="text" plaintext size="sm" id="address-error" :value="error"></b-form-input>
              </b-form-group>

              <b-form-group v-if="!error" label="Block:" label-for="block-blocknumber" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
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

              <b-form-group v-if="!error" label="Timestamp:" label-for="block-timestamp" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
                <b-form-input type="text" plaintext size="sm" id="block-timestamp" :value="block && block.timestamp && formatTimestamp(block.timestamp) || ''" v-b-popover.hover="block && block.timestamp && formatTimeDiff(block.timestamp) || ''" style="width: 10.0rem;"></b-form-input>
              </b-form-group>

              <b-form-group v-if="!error" label="Miner:" label-for="block-miner" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
                <b-input-group>
                  <b-button v-if="block && block.miner" :href="'#/address/' + block.miner" variant="link" class="m-0 p-0 pt-1">
                    {{ block.miner }}
                  </b-button>
                  <b-input-group-append>
                    <b-button v-if="block && block.miner" :href="'https://etherscan.io/address/' + block.miner" variant="link" target="_blank" class="m-0 ml-2 p-0 pt-1">
                      <b-icon-link-45deg shift-v="-1" font-scale="1.1"></b-icon-link-45deg>
                    </b-button>
                    <b-button v-if="block && block.miner" size="sm" @click="copyToClipboard(block.miner);" variant="link">
                      <b-icon-clipboard shift-v="-1" font-scale="1.1"></b-icon-clipboard>
                    </b-button>
                  </b-input-group-append>
                </b-input-group>
              </b-form-group>

              <b-form-group v-if="!error" label="Block Hash:" label-for="block-hash" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
                <b-form-input type="text" plaintext size="sm" id="block-hash" :value="block && block.hash || ''"></b-form-input>
              </b-form-group>

              <!-- TODO: Link -->
              <b-form-group v-if="!error" label="Parent Block Hash:" label-for="block-parentblockhash" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
                <b-form-input type="text" plaintext size="sm" id="block-parentblockhash" :value="block && block.parentHash || ''"></b-form-input>
              </b-form-group>

              <b-form-group v-if="!error" label="Nonce:" label-for="block-nonce" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
                <b-form-input type="text" plaintext size="sm" id="block-nonce" :value="block && block.nonce || ''"></b-form-input>
              </b-form-group>

              <b-form-group v-if="!error && block && block.difficulty" label="Difficulty:" label-for="block-difficulty" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
                <b-form-input type="text" plaintext size="sm" id="block-difficulty" :value="block && block.difficulty && commify0(block.difficulty) || ''"></b-form-input>
              </b-form-group>

              <b-form-group v-if="!error" label="Gas Limit:" label-for="block-gaslimit" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
                <b-form-input type="text" plaintext size="sm" id="block-gaslimit" :value="block && block.gasLimit && commify0(block.gasLimit) || ''"></b-form-input>
              </b-form-group>

              <b-form-group v-if="!error" label="Gas Used:" label-for="block-gasused" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
                <b-form-input type="text" plaintext size="sm" id="block-gasused" :value="block && block.gasUsed && commify0(block.gasUsed) || ''"></b-form-input>
              </b-form-group>

              <b-form-group v-if="!error" label="Extra Data:" label-for="block-extradata" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0" :description="extraDataAsString">
                <b-form-input type="text" plaintext size="sm" id="block-extradata" :value="block && block.extraData && block.extraData || ''"></b-form-input>
              </b-form-group>

            </b-form-group>
          </b-card>

          <div class="d-flex flex-wrap m-0 mt-1 p-0 px-1 bg-white">
            <div class="mt-0 flex-grow-1">
            </div>
            <div class="mt-0 pl-1">
              <!-- <font size="-2" v-b-popover.hover.bottom="'# Filtered / Transactions'">{{ filteredSortedTransactions.length + ' / ' + transactions.length }}</font> -->
              <font size="-2" v-b-popover.hover.bottom="'# Transactions'">{{ transactions.length }}</font>
            </div>
            <div class="mt-0 pl-1">
              <b-pagination size="sm" v-model="settings.txsTable.currentPage" :total-rows="transactions.length" :per-page="settings.txsTable.pageSize" style="height: 0;"></b-pagination>
            </div>
            <div class="mt-0 pl-1">
              <b-form-select size="sm" v-model="settings.txsTable.pageSize" :options="pageSizes" v-b-popover.hover.bottom="'Yeah. Page size'"></b-form-select>
            </div>
          </div>

          <b-table small fixed striped responsive hover :fields="transactionsFields" :items="pagedFilteredSortedTransactions" show-empty empty-html="zzz" head-variant="light" class="mx-0 my-0 p-1">
            <template #cell(txIndex)="data">
              <font size="-1" class="text-muted">
                {{ data.item.transactionIndex }}
              </font>
            </template>
            <template #cell(hash)="data">
              <b-button v-if="data.item.hash" :href="'#/tx/' + data.item.hash" variant="link" class="m-0 p-0 pt-1">
                {{ data.item.hash.substring(0, 10) + '...' + data.item.hash.slice(-8) }}
              </b-button>
            </template>
            <template #cell(from)="data">
              <b-button v-if="data.item.from" :href="'#/address/' + data.item.from" variant="link" class="m-0 p-0 pt-1">
                {{ data.item.from.substring(0, 6) + '...' + data.item.from.slice(-4) }}
              </b-button>
            </template>
            <template #cell(to)="data">
              <b-button v-if="data.item.to" :href="'#/address/' + data.item.to" variant="link" class="m-0 p-0 pt-1">
                {{ data.item.to.substring(0, 6) + '...' + data.item.to.slice(-4) }}
              </b-button>
            </template>
            <template #cell(value)="data">
              <font size="-1" class="text-muted">
                {{ formatETH(data.item.value) }}
              </font>
            </template>
          </b-table>
          <!-- <b-card-text>
            <h5>Block</h5>
            error: {{ error }}
            <br />
            pagedFilteredSortedTransactions: {{ pagedFilteredSortedTransactions }}
            <br />
            block: {{ block }}
          </b-card-text> -->
        </b-card>
      </b-card>
    </div>
  `,
  props: ['blockNumber'],
  data: function () {
    return {
      settings: {
        txsTable: {
          filter: null,
          currentPage: 1,
          pageSize: 15,
          sortOption: 'txindexasc',
        },
      },
      pageSizes: [
        { value: 10, text: '10' },
        { value: 15, text: '15' },
        { value: 25, text: '25' },
        { value: 50, text: '50' },
        { value: 100, text: '100' },
        { value: 250, text: '250' },
        { value: 500, text: '500' },
        { value: 1000, text: '1,000' },
      ],
      transactionsFields: [
        { key: 'txIndex', label: 'Tx Index', sortable: false, thStyle: 'width: 7%;', tdClass: 'text-truncate' },
        { key: 'hash', label: 'Hash', sortable: false, thStyle: 'width: 23%;', tdClass: 'text-truncate' },
        { key: 'from', label: 'From', sortable: false, thStyle: 'width: 20%;', tdClass: 'text-left' },
        { key: 'to', label: 'To', sortable: false, thStyle: 'width: 20%;', tdClass: 'text-left' },
        { key: 'value', label: 'Value', sortable: false, thStyle: 'width: 15%;', tdClass: 'text-left' },
        // { key: 'fee', label: 'Fee', sortable: false, thStyle: 'width: 15%;', tdClass: 'text-left' },
      ],

      // count: 0,
      // reschedule: true,
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
    transactions() {
      const results = [];
      for (const tx of (this.block && this.block.transactions || [])) {
        results.push(tx);
      }
      return results;
    },
    filteredSortedTransactions() {
      // TODO: filter & sort
      return this.transactions;
    },
    pagedFilteredSortedTransactions() {
      console.log(now() + " Block - computed.pagedFilteredSortedTransactions() - this.settings: " + JSON.stringify(this.settings));

      const results = this.filteredSortedTransactions.slice((this.settings.txsTable.currentPage - 1) * this.settings.txsTable.pageSize, this.settings.txsTable.currentPage * this.settings.txsTable.pageSize);

      // return this.filteredSortedTransactions;
      return results;
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
    formatTimeDiff(unixtime) {
      if (unixtime) {
        return moment.unix(unixtime).fromNow();
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
      // console.log(now() + " blockModule - mutations.setData - data: " + JSON.stringify(data));
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
          block = await provider.getBlockWithTransactions(parseInt(blockNumber)) || null;
          // console.log("blockNumber: " + blockNumber + ", blockHash: " + block.hash);
          // const blockByBlockHash = await provider.send('eth_getBlockByHash', [block.hash, true]);
          // console.log("blockByBlockHash.number: " + parseInt(blockByBlockHash.number) + ", blockByBlockHash.hash: " + blockByBlockHash.hash);
          // console.log("blockByBlockHash: " + JSON.stringify(blockByBlockHash, null, 2));
        }
      }
      context.commit('setData', { error, block });
    }
  },
};
