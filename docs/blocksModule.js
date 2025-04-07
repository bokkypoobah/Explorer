const blocksModule = {
  namespaced: true,
  state: {
    latestCount: 3,
    blocks: {},
  },
  getters: {
    blocks: state => state.blocks,
  },
  mutations: {
    addBlock(state, block) {
      console.log(now() + " blocksModule - mutations.addBlock - block.number: " + block.number);
      for (const blockNumber of Object.keys(state.blocks)) {
        if (blockNumber <= block.number - state.latestCount) {
          console.log(now() + " blocksModule - mutations.addBlock - DELETING blockNumber: " + blockNumber);
          delete state.blocks[blockNumber];
        }
      }
      state.blocks[block.number] = block;
      console.log(now() + " blocksModule - mutations.addBlock - blocks: " + JSON.stringify(Object.keys(state.blocks)));
    },
  },
  actions: {
    async startup(context) {
      console.log(now() + " blocksModule - actions.startup - blockQueueSize: " + context.state.latestCount);
    },
    async addBlock(context, block) {
      console.log(now() + " blocksModule - actions.addBlock - block.number: " + block.number);
      context.commit('addBlock', block);
    },
  },
};
