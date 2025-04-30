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
    async syncPunks(context) {
      console.log(now() + " punksModule - actions.syncPunks");
      // context.commit('syncPunks', block);
    },
  },
};
