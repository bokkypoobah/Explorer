const Block = {
  template: `
    <div>
      <v-card>
        <v-card-text>
          <!-- <h1>Block</h1>
          <p>TODO</p>
          <p>{{ inputBlockNumber }}</p> -->
          <p>{{ block }}</p>
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
    };
  },
  computed: {
    block() {
      return store.getters['block/block'];
    },
  },
  methods: {
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
    console.log(now() + " Block - app:unmounted");
	},
  destroyed() {
    console.log(now() + " Block - app:destroyed");
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
