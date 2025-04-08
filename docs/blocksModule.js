const blocksModule = {
  namespaced: true,
  state: {
    latestCount: 20,
    blocks: {},
  },
  getters: {
    latestCount: state => state.latestCount,
    blocks: state => state.blocks,
    blocksList(state) {
      const results = [];
      for (const [blockNumber, block] of Object.entries(state.blocks)) {
        results.push(block);
      }
      results.sort((a, b) => {
        return b.number - a.number;
      });
      // console.log(now() + " blocksModule - getters.blocksList - results: " + JSON.stringify(results, null, 2));
      return results;
    },
    transactionsList(state) {
      const results = [];
      for (const [blockNumber, block] of Object.entries(state.blocks)) {
        for (const tx of block.transactions) {
          results.push(tx);
        }
      }
      results.sort((a, b) => {
        if (a.blockNumber == b.blockNumber) {
          return a.transactionIndex - b.transactionIndex;
        } else {
          return b.blockNumber - a.blockNumber;
        }
      });
      // console.log(now() + " blocksModule - getters.transactionsList - results: " + JSON.stringify(results, null, 2));
      return results;
    },
  },
  mutations: {
    addBlock(state, block) {
      // console.log(now() + " blocksModule - mutations.addBlock - block.number: " + block.number);
      for (const blockNumber of Object.keys(state.blocks)) {
        if (blockNumber <= block.number - state.latestCount) {
          // console.log(now() + " blocksModule - mutations.addBlock - DELETING blockNumber: " + blockNumber);
          delete state.blocks[blockNumber];
        }
      }
      state.blocks[block.number] = JSON.parse(JSON.stringify(block));
      // console.log(now() + " blocksModule - mutations.addBlock - blocks: " + JSON.stringify(Object.keys(state.blocks)));
    },
  },
  actions: {
    async startup(context) {
      // console.log(now() + " blocksModule - actions.startup - blockQueueSize: " + context.state.latestCount);
    },
    async addBlock(context, block) {
      // console.log(now() + " blocksModule - actions.addBlock - block.number: " + block.number);
      context.commit('addBlock', block);
    },
  },
};
