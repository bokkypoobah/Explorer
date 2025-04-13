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
          <template v-slot:item.extraData="{ item }">
            {{ item.extraData.substring(0, 32) + (item.extraData.length > 32 ? "..." : "") }}
          </template>
        </v-data-table-server>
        <!-- currentPage: {{ currentPage }} -->
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
        { title: 'Extra Data', value: 'extraData', sortable: false },
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
      const dbInfo = store.getters["db"];
      const db = new Dexie(dbInfo.name);
      db.version(dbInfo.version).stores(dbInfo.schemaDefinition);
      const chainId = store.getters["chainId"];

      const blockNumber = parseInt(store.getters['web3'].blockNumber);
      console.log(now() + " BlocksBrowse - methods.loadItems - page: " + page + ", itemsPerPage: " + itemsPerPage + ", sortBy: " + JSON.stringify(sortBy) + ", blockNumber: " + blockNumber);
      const cachedBlocks = store.getters['blocks/blocks'];
      // console.log(now() + " BlocksBrowse - methods.loadItems - cachedBlocks: " + JSON.stringify(cachedBlocks));
      this.loading = true;
      this.sortBy = !sortBy || sortBy.length == 0 || (sortBy[0].key == "number" && sortBy[0].order == "desc") ? "desc" : "asc";
      // console.log(now() + " BlocksBrowse - methods.loadItems - this.sortBy: " + this.sortBy);
      let startBlock, endBlock;
      if (this.sortBy == "desc") {
        endBlock =  parseInt(blockNumber) - ((page - 1) * itemsPerPage);
        startBlock = endBlock - (itemsPerPage -1 );
        if (startBlock < 0) {
          startBlock = 0;
        }
      } else {
        startBlock = (page - 1) * itemsPerPage;
        endBlock = page * itemsPerPage - 1;
        if (endBlock > blockNumber) {
          endBlock = blockNumber;
        }
      }
      console.log(now() + " BlocksBrowse - methods.loadItems - startBlock: " + startBlock + ", endBlock: " + endBlock + ", this.sortBy: " + this.sortBy);

      // const blocks = [];
      const t0 = performance.now();
      // if (this.sortBy == "desc") {
      //   for (let blockNumber = startBlock; blockNumber >= endBlock; blockNumber--) {
      //     const block = cachedBlocks[blockNumber] || (await this.provider.getBlockWithTransactions(blockNumber));
      //   //   blocks.push({
      //   //     ...block,
      //   //     txCount: block.transactions.length,
      //   //     gasUsed: ethers.BigNumber.from(block.gasUsed).toString(),
      //   //     gasLimit: ethers.BigNumber.from(block.gasLimit).toString(),
      //   //     percent: ethers.BigNumber.from(block.gasUsed).mul(100).div(ethers.BigNumber.from(block.gasLimit)).toString(),
      //   //   });
      //   }
      // } else {
      //   for (let blockNumber = startBlock; blockNumber <= endBlock; blockNumber++) {
      //     const block = cachedBlocks[blockNumber] || await this.provider.getBlockWithTransactions(blockNumber);
      //   //   blocks.push({
      //   //     ...block,
      //   //     txCount: block.transactions.length,
      //   //     gasUsed: ethers.BigNumber.from(block.gasUsed).toString(),
      //   //     gasLimit: ethers.BigNumber.from(block.gasLimit).toString(),
      //   //     percent: ethers.BigNumber.from(block.gasUsed).mul(100).div(ethers.BigNumber.from(block.gasLimit)).toString(),
      //   //   });
      //   }
      // }
      const t1 = performance.now();
      console.log(now() + " BlocksBrowse - methods.loadItem - provider.getBlockWithTransactions([" + startBlock + "..." + endBlock + "]) took " + (t1 - t0) + " ms");

      const blocks = await db.blocks.where('[chainId+number]').between([chainId, startBlock],[chainId, endBlock], true, true).toArray();
      // console.log(now() + " BlocksBrowse - methods.loadItems - blocks: " + JSON.stringify(blocks.map(e => e.number), null, 2));
      let blockNumbers = new Set(blocks.map(e => e.number));
      console.log(now() + " BlocksBrowse - methods.loadItems - blockNumbers: " + JSON.stringify([...blockNumbers]));
      for (let blockNumber = startBlock; blockNumber <= endBlock; blockNumber++) {
        if (!blockNumbers.has(blockNumber)) {
          console.log(now() + " BlocksBrowse - methods.loadItems - RETRIEVING blockNumber: " + blockNumber);
          const block = await this.provider.getBlockWithTransactions(blockNumber);
          const blockData = JSON.parse(JSON.stringify(block));
          blocks.push({ chainId, ...blockData });
          await db.blocks.put({ chainId, ...blockData }).then (function() {
            }).catch(function(e) {
              console.error(now() + " BlocksBrowse - methods.loadItems - ERROR blocks.put: " + e.message);
            });

        } else {
          // console.log(now() + " BlocksBrowse - methods.loadItems - HAS blockNumber: " + blockNumber);
        }
      }
      const t2 = performance.now();
      console.log(now() + " BlocksBrowse - methods.loadItem - db.blocks.where([" + startBlock + "..." + endBlock + "]) took " + (t2 - t1) + " ms");

      if (this.sortBy == "desc") {
        blocks.sort((a, b) => {
          return b.number - a.number;
        });
      } else {
        blocks.sort((a, b) => {
          return a.number - b.number;
        });
      }
      const results = [];
      for (const block of blocks) {
        let extraData = block.extraData;
        try {
          extraData = ethers.utils.toUtf8String(block.extraData);
        } catch (e) {
        }
        results.push({
          ...block,
          extraData,
          txCount: block.transactions.length,
          gasUsed: ethers.BigNumber.from(block.gasUsed).toString(),
          gasLimit: ethers.BigNumber.from(block.gasLimit).toString(),
          percent: ethers.BigNumber.from(block.gasUsed).mul(100).div(ethers.BigNumber.from(block.gasLimit)).toString(),
        });
      }
      this.blocks = results;
      this.loading = null;
      db.close();
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
