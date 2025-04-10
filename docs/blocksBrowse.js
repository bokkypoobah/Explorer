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
          :items-per-page-options="itemsPerPageOptions"
          :headers="blocksHeaders"
          :items="blocks"
          :items-length="blockNumber + 1"
          :loading="loading"
          :search="live && blockNumber.toString() || null"
          item-value="name"
          @update:options="loadItems"
          v-model:page="currentPage"
          density="comfortable"
        >
          <template v-slot:footer.prepend>
            <tr class="d-flex flex-grow-1">
              <!-- <td>
                Search
              </td> -->
              <td class="ml-2">
                <v-btn v-if="live" @click="live = false;" text color="primary" density="compact">
                  <v-icon>mdi-lightning-bolt</v-icon>Live
                </v-btn>
                <v-btn v-else text @click="live = true;"  color="secondary" density="compact">
                  <v-icon>mdi-lightning-bolt-outline</v-icon>Paused
                </v-btn>
              </td>
            </tr>
          </template>
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
      </v-container>
    </div>
  `,
  props: ['inputAddress'],
  data: function () {
    return {
      live: true,
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
      itemsPerPageOptions: [
        { value: 10, title: "10" },
        { value: 20, title: "20" },
        { value: 30, title: "30" },
        { value: 40, title: "40" },
        { value: 50, title: "50" },
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
      const blockNumber = parseInt(store.getters['web3'].blockNumber);
      console.log(now() + " BlocksBrowse - methods.loadItems - page: " + page + ", itemsPerPage: " + itemsPerPage + ", sortBy: " + JSON.stringify(sortBy) + ", blockNumber: " + blockNumber);
      const cachedBlocks = store.getters['blocks/blocks'];
      console.log(now() + " BlocksBrowse - methods.loadItems - cachedBlocks: " + JSON.stringify(cachedBlocks));
      this.loading = true;
      this.sortBy = !sortBy || sortBy.length == 0 || (sortBy[0].key == "number" && sortBy[0].order == "desc") ? "desc" : "asc";
      console.log(now() + " BlocksBrowse - methods.loadItems - this.sortBy: " + this.sortBy);
      let startBlock, endBlock;
      if (this.sortBy == "desc") {
        startBlock =  parseInt(blockNumber) - ((page - 1) * itemsPerPage);
        endBlock = startBlock - (itemsPerPage -1 );
        if (endBlock < 0) {
          endBlock = 0;
        }
      } else {
        startBlock = (page - 1) * itemsPerPage;
        endBlock = page * itemsPerPage - 1;
        if (endBlock > blockNumber) {
          endBlock = blockNumber;
        }
      }
      console.log(now() + " BlocksBrowse - methods.loadItems - startBlock: " + startBlock + ", endBlock: " + endBlock);
      const blocks = [];
      const t0 = performance.now();
      if (this.sortBy == "desc") {
        for (let blockNumber = startBlock; blockNumber >= endBlock; blockNumber--) {
          const block = cachedBlocks[blockNumber] || (await this.provider.getBlockWithTransactions(blockNumber));
          blocks.push({
            ...block,
            txCount: block.transactions.length,
            gasUsed: ethers.BigNumber.from(block.gasUsed).toString(),
            gasLimit: ethers.BigNumber.from(block.gasLimit).toString(),
            percent: ethers.BigNumber.from(block.gasUsed).mul(100).div(ethers.BigNumber.from(block.gasLimit)).toString(),
          });
        }
      } else {
        for (let blockNumber = startBlock; blockNumber <= endBlock; blockNumber++) {
          const block = cachedBlocks[blockNumber] || await this.provider.getBlockWithTransactions(blockNumber);
          blocks.push({
            ...block,
            txCount: block.transactions.length,
            gasUsed: ethers.BigNumber.from(block.gasUsed).toString(),
            gasLimit: ethers.BigNumber.from(block.gasLimit).toString(),
            percent: ethers.BigNumber.from(block.gasUsed).mul(100).div(ethers.BigNumber.from(block.gasLimit)).toString(),
          });
        }
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
