const BlocksBrowse = {
  template: `
    <div>
      <!-- <v-card v-if="!inputAddress">
        <v-card-text>
          Enter address in the search field above
        </v-card-text>
      </v-card> -->
      <v-container fluid class="pa-1">
        <v-data-table-server
          v-model:items-per-page="itemsPerPage"
          :headers="blocksHeaders"
          :items="blocks"
          :items-length="blockNumber"
          :loading="loading"
          item-value="name"
          @update:options="loadItems"
        >
        </v-data-table-server>

        <!-- <h4 class="ml-2">Blocks Browse TODO</h4> -->
        <!-- <v-toolbar density="compact" class="mt-1">
          <h4 class="ml-2">Blocks Browse</h4>
          <v-spacer></v-spacer>
          <v-btn @click="syncAddress();" color="primary" icon>
            <v-icon>mdi-refresh</v-icon>
          </v-btn>
          <v-spacer></v-spacer>
          <v-tabs right color="deep-purple-accent-4">
            <v-tab :to="'/blocks/latest'" class="lowercase-btn">Latest</v-tab>
            <v-tab :to="'/blocks/browse'" class="lowercase-btn">Browse</v-tab>
          </v-tabs>
        </v-toolbar>
        <router-view /> -->
      </v-container>
    </div>
  `,
  props: ['inputAddress'],
  data: function () {
    return {
      itemsPerPage: 10,
      blocks: [],
      totalItems: 100,
      loading: null,
      blocksHeaders: [
        { title: 'Block', value: 'number', align: 'end', sortable: true },
        { title: 'Timestamp', value: 'timestamp', sortable: true },
        { title: 'Miner', value: 'miner', sortable: true },
        { title: 'Txs', value: 'txCount', align: 'end', sortable: true },
        { title: 'Gas Used', value: 'gasUsed', align: 'end', sortable: true },
        { title: 'Gas Limit', value: 'gasLimit', align: 'end', sortable: true },
        { title: '%', value: 'percent', sortable: true },
      ],
    };
  },
  computed: {
    blockNumber() {
      return store.getters['web3'].blockNumber;
    },
    // address() {
    //   return store.getters['address/address'];
    // },
    // type() {
    //   return store.getters['address/info'].type || null;
    // },
    // version() {
    //   return store.getters['address/info'].version || null;
    // },
    // implementation() {
    //   return store.getters['address/info'].implementation || null;
    // },
    // explorer() {
    //   return store.getters['explorer'];
    // },
  },
  methods: {
    async loadItems ({ page, itemsPerPage, sortBy }) {
      if (!this.provider) {
        this.provider = new ethers.providers.Web3Provider(window.ethereum);
      }
      console.log(now() + " BlocksBrowse - methods.loadItems - page: " + page + ", itemsPerPage: " + itemsPerPage + ", sortBy: " + sortBy);
      this.loading = true;
      const startBlock = (page - 1) * itemsPerPage;
      let endBlock = page * itemsPerPage - 1;
      if (endBlock > this.blockNumber) {
        endBlock = this.blockNumber;
      }
      // console.log(now() + " BlocksBrowse - methods.loadItems - startBlock: " + startBlock + ", endBlock: " + endBlock);
      const blocks = [];
      const t0 = performance.now();
      for (let blockNumber = startBlock; blockNumber <= endBlock; blockNumber++) {
        const block = await this.provider.getBlockWithTransactions(blockNumber);
        blocks.push(block);
      }
      const t1 = performance.now();
      console.log(now() + " BlocksBrowse - methods.loadItem - provider.getBlockWithTransactions([" + startBlock + "..." + endBlock + "]) took " + (t1 - t0) + " ms");
      this.blocks = blocks;
      this.loading = null;
    },

    // syncAddress() {
    //   console.log(now() + " BlocksBrowse - methods.syncAddress");
    //   const address = store.getters["address/address"];
    //   console.log(now() + " BlocksBrowse - methods.syncAddress - address: " + address);
    //   store.dispatch('address/loadAddress', { inputAddress: address, forceUpdate: true });
    // },
    // copyToClipboard(str) {
    //   navigator.clipboard.writeText(str);
    // },
  },
  beforeCreate() {
    console.log(now() + " BlocksBrowse - beforeCreate");
	},
  mounted() {
    console.log(now() + " BlocksBrowse - mounted");
    // const t = this;
    // setTimeout(function() {
    //   store.dispatch('address/loadAddress', { inputAddress: t.inputAddress, forceUpdate: false });
    // }, 1000);
	},
  unmounted() {
    console.log(now() + " BlocksBrowse - unmounted");
	},
  destroyed() {
    console.log(now() + " BlocksBrowse - destroyed");
	},
};
