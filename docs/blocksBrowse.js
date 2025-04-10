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
          :items-length="blockNumber + 1"
          :loading="loading"
          item-value="name"
          @update:options="loadItems"
          v-model:page="currentPage"
        >
          <template v-slot:item.number="{ item }">
            <v-btn :href="'#/block/' + item.number" color="primary" variant="text" class="pa-0">{{ commify0(item.number) }}</v-btn>
          </template>
          <template v-slot:item.timestamp="{ item }">
            {{ formatTimestamp(item.timestamp) }}
          </template>
          <template v-slot:item.miner="{ item }">
            <v-btn :href="'#/address/' + item.miner" color="primary" variant="text" class="lowercase-btn pa-0">{{ item.miner }}</v-btn>
          </template>
          <template v-slot:item.txCount="{ item }">
            {{ item.txCount }}
          </template>
          <template v-slot:item.gasUsed="{ item }">
            {{ commify0(item.gasUsed) }}
          </template>
          <template v-slot:item.gasLimit="{ item }">
            {{ commify0(item.gasLimit) }}
          </template>
        </v-data-table-server>
        currentPage: {{ currentPage }}
        <br />
        sortBy: {{ sortBy }}
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
      currentPage: 1,
      sortBy: "desc",
      loading: null,
      blocksHeaders: [
        { title: 'Block', value: 'number', align: 'end', sortable: true },
        { title: 'Timestamp', value: 'timestamp', sortable: false },
        { title: 'Miner', value: 'miner', sortable: false },
        { title: 'Txs', value: 'txCount', align: 'end', sortable: false },
        { title: 'Gas Used', value: 'gasUsed', align: 'end', sortable: false },
        { title: 'Gas Limit', value: 'gasLimit', align: 'end', sortable: false },
        { title: '%', value: 'percent', sortable: false },
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
      console.log(now() + " BlocksBrowse - methods.loadItems - page: " + page + ", itemsPerPage: " + itemsPerPage + ", sortBy: " + JSON.stringify(sortBy));
      this.loading = true;
      this.sortBy = !sortBy || sortBy.length == 0 || (sortBy[0].key == "number" && sortBy[0].order == "desc") ? "desc" : "asc";
      console.log(now() + " BlocksBrowse - methods.loadItems - this.sortBy: " + this.sortBy);
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
        blocks.push({
          ...block,
          txCount: block.transactions.length,
          gasUsed: ethers.BigNumber.from(block.gasUsed).toString(),
          gasLimit: ethers.BigNumber.from(block.gasLimit).toString(),
          percent: ethers.BigNumber.from(block.gasUsed).mul(100).div(ethers.BigNumber.from(block.gasLimit)).toString(),
        });
      }
      const t1 = performance.now();
      console.log(now() + " BlocksBrowse - methods.loadItem - provider.getBlockWithTransactions([" + startBlock + "..." + endBlock + "]) took " + (t1 - t0) + " ms");
      this.blocks = blocks;
      this.loading = null;
    },
    formatETH(e) {
      if (e) {
        return ethers.utils.formatEther(e).replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
      }
      return null;
    },
    commify0(n) {
      if (n != null) {
        return Number(n).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
      }
      return null;
    },
    formatTimestamp(ts) {
      if (ts != null) {
        return moment.unix(ts).format("YYYY-MM-DD HH:mm:ss");
      }
      return null;
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
