const punksModule = {
  namespaced: true,
  state: {
  },
  getters: {
  },
  mutations: {
  },
  actions: {
    async startup(context) {
      console.log(now() + " punksModule - actions.startup");
    },
    async addBlock(context, block) {
      // console.log(now() + " punksModule - actions.addBlock - block.number: " + block.number);
      context.commit('addBlock', block);
    },
  },
};
