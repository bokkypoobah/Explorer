const Block = {
  template: `
    <div>
      <v-card>
        <v-card-text>
          <v-row dense>
            <v-col cols="2">
              <v-text-field v-if="block" readonly v-model="block.number" label="Number:"></v-text-field>
            </v-col>
            <v-col cols="3">
              <v-text-field v-if="block" readonly v-model="timestamp" label="Timestamp:"></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field v-if="block" readonly v-model="block.hash" label="Block Hash:"></v-text-field>
            </v-col>
          </v-row>
          <v-row dense>
            <v-col cols="4">
              <v-text-field v-if="block" readonly v-model="block.miner" label="Miner:"></v-text-field>
            </v-col>
            <v-col cols="1">
            </v-col>
            <v-col cols="6">
              <v-text-field v-if="block" readonly v-model="block.parentHash" label="Parent Block Hash:"></v-text-field>
            </v-col>
          </v-row>
          <v-row dense>
            <v-col cols="2">
              <v-text-field v-if="block" readonly v-model="gasLimit" label="Gas Limit:"></v-text-field>
            </v-col>
            <v-col cols="2">
              <v-text-field v-if="block" readonly v-model="gasUsed" label="Gas Used:"></v-text-field>
            </v-col>
            <v-col cols="1">
            </v-col>
            <v-col cols="4">
              <v-text-field v-if="block" readonly v-model="extraData" label="Extra Data:"></v-text-field>
            </v-col>
          </v-row>
          <v-data-table v-if="block" :items="transactions" @click:row="handleClick" density="compact">
            <template v-slot:item.txHash="{ item }">
              <a :href="'#/transaction/' + item.txHash">{{ item.txHash.substring(0, 20) + "..." + item.txHash.slice(-18) }}</a>
            </template>
            <template v-slot:item.from="{ item }">
              <a :href="'#/address/' + item.from">{{ item.from.substring(0, 10) + "..." + item.from.slice(-8) }}</a>
            </template>
            <template v-slot:item.to="{ item }">
              <a :href="'#/address/' + item.to">{{ item.to.substring(0, 10) + "..." + item.to.slice(-8) }}</a>
            </template>
          </v-data-table>
          <!-- <p>{{ block }}</p> -->
        </v-card-text>
        <!-- <v-card-actions>
          <v-btn>Action 1</v-btn>
          <v-btn>Action 2</v-btn>
        </v-card-actions> -->
      </v-card>
    </div>
  `,
  props: ['inputBlockNumber'],
  data: function () {
    return {
      blockNumber: null,
      // v-data-table :headers="headers" not working
      // headers: [
      //   { text: 'Tx Index', value: 'txIndex' },
      //   { text: 'Tx Hash', value: 'txHash' },
      //   { text: 'From', value: 'from' },
      //   { text: 'To', value: 'to' },
      //   { text: 'Value', value: 'value' },
      // ],
    };
  },
  computed: {
    block() {
      return store.getters['block/block'];
    },
    timestamp: {
      get: function() {
        return this.block && this.formatTimestamp(this.block.timestamp) || null;
      },
      // set: function(timestamp) {
      //   store.dispatch('setTimestamp', timestamp);
      // },
    },
    gasLimit: {
      get: function() {
        return this.block && parseInt(this.block.gasLimit) || null;
      },
    },
    gasUsed: {
      get: function() {
        return this.block && parseInt(this.block.gasUsed) || null;
      },
    },
    extraData: {
      get: function() {
        return this.block && ethers.utils.toUtf8String(this.block.extraData) || null;
      },
    },
    transactions() {
      const results = [];
      for (const tx of (this.block && this.block.transactions || [])) {
        results.push({
          txIndex: tx.transactionIndex,
          txHash: tx.hash,
          from: tx.from,
          to: tx.to,
          value: this.formatETH(tx.value),
        });
      }
      console.log(now() + " Block - computed.transactions - results: " + JSON.stringify(results, null, 2));
      return results;
    },
  },
  methods: {
    handleClick(event, row) {
      console.log(now() + " Block - handleClick - event: " + JSON.stringify(event, null, 2) + ", row: " + JSON.stringify(row, null, 2));
    },
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
    console.log(now() + " Block - beforeCreate");
	},
  mounted() {
    console.log(now() + " Block - mounted - inputBlockNumber: " + this.inputBlockNumber);
    const t = this;
    setTimeout(function() {
      store.dispatch('block/loadBlock', t.inputBlockNumber);
    }, 1000);
	},
  unmounted() {
    console.log(now() + " Block - unmounted");
	},
  destroyed() {
    console.log(now() + " Block - destroyed");
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
        if (!store.getters['web3'].connected || !window.ethereum) {
          error = "Not connected";
        }
        if (!error && !(/^\d+$/.test(blockNumber))) {
          error = "Invalid block number";
        }
        if (!error) {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          block = await provider.getBlockWithTransactions(parseInt(blockNumber)) || null;
          // block = await provider.getBlock(parseInt(blockNumber)) || null;
          console.log("block: " + JSON.stringify(block, null, 2));
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
