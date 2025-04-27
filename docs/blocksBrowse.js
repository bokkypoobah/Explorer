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
          :search="!searchString && live && blockNumber.toString() || null"
          item-value="name"
          @update:options="loadItems"
          v-model:page="currentPage"
          density="comfortable"
        >
          <template v-slot:top>
            <v-toolbar flat color="transparent" density="compact">
              <!-- <v-toolbar-title style="font-size: 0.9rem !important;">Custom Pagination</v-toolbar-title> -->
              <v-text-field v-model="searchString" @input="search();" hide-details label="🔍" density="compact" variant="plain" class="ml-3 shrink" style="width: 100px" placeholder="block number, or yyyy-mm-dd [hh:mm:ss]">
              </v-text-field>
              <v-spacer></v-spacer>
              <v-btn text :disabled="!!searchString" @click="live = !live;" :color="live ? 'primary' : 'secondary'" class="lowercase-btn">
                <v-icon :icon="(!searchString && live) ? 'mdi-lightning-bolt' : 'mdi-lightning-bolt-outline'"></v-icon>{{ searchString ? "Search" : (live ? "Live" : "Paused") }}
              </v-btn>
              <v-spacer></v-spacer>
              <v-pagination
                v-model="currentPage"
                :length="Math.ceil((parseInt(blockNumber) + 1) / itemsPerPage)"
                total-visible="0"
                density="comfortable"
                show-first-last-page
                class="mr-1"
              >
              </v-pagination>
            </v-toolbar>
          </template>
          <!-- <template v-slot:footer.prepend>
            <tr class="d-flex flex-grow-1">
              <td class="ml-2">
                <v-btn v-if="live" @click="live = false;" text color="primary" density="compact">
                  <v-icon>mdi-lightning-bolt</v-icon>Live
                </v-btn>
                <v-btn v-else text @click="live = true;"  color="secondary" density="compact">
                  <v-icon>mdi-lightning-bolt-outline</v-icon>Paused
                </v-btn>
              </td>
            </tr>
          </template> -->
          <template v-slot:item.number="{ item }">
            <render-block-number v-if="item && item.number != null" :block="item.number" noXPadding></render-block-number>
          </template>
          <template v-slot:item.timestamp="{ item }">
            {{ formatTimestamp(item.timestamp) }}
          </template>
          <template v-slot:item.miner="{ item }">
            <render-address :address="item.miner" noXPadding></render-address>
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
      searchString: null,
      _timerId: null,
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
        { value: 5, title: "5" },
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
    explorer() {
      return store.getters['explorer'];
    },
  },
  methods: {

    async search() {
      // console.log(now() + " BlocksBrowse - methods.search - this.searchString: " + JSON.stringify(this.searchString));
      clearTimeout(this._timerId);
      this._timerId = setTimeout(async () => {
        await this.searchDebounced();
      }, 500);
    },
    async searchDebounced() {
      const blockRegex = /^\d+$/;
      if (blockRegex.test(this.searchString)) {
        const blockNumber = this.searchString <= this.blockNumber ? this.searchString : this.blockNumber;
        if (this.sortBy == "desc") {
          console.log(now() + " BlocksBrowse - methods.searchDebounced - BLOCKNUMBER DESC blockNumber: " + JSON.stringify(blockNumber));
          this.currentPage = Math.ceil((parseInt(this.blockNumber) - parseInt(blockNumber)) / this.itemsPerPage);
        } else {
          console.log(now() + " BlocksBrowse - methods.searchDebounced - BLOCKNUMBER ASC blockNumber: " + JSON.stringify(blockNumber));
          this.currentPage = Math.ceil((parseInt(blockNumber) + 1) / this.itemsPerPage);
        }
      } else {
        console.log(now() + " BlocksBrowse - methods.searchDebounced - OTHER this.searchString: " + JSON.stringify(this.searchString));
        let datetime = null;
        try {
          datetime = moment(this.searchString).unix();
          console.log(now() + " BlocksBrowse - methods.searchDebounced - OTHER datetime: " + datetime + " " + moment.unix(datetime).format("YYYY-MM-DD HH:mm:ss"));
        } catch (e) {
          console.log(now() + " BlocksBrowse - methods.searchDebounced - Date/Time error: " + e.message);
        }
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        if (datetime) {
          this.loading = true;
          let startBlock = 1;
          let startTimestamp = (await this.provider.getBlock(startBlock)).timestamp;
          console.log(now() + " BlocksBrowse - methods.searchDebounced - START timestamp[" + startBlock + "]: " + startTimestamp + " " + this.formatTimestamp(startTimestamp));
          const blockLatest = await this.provider.getBlock("latest");
          let endBlock = blockLatest.number;
          let endTimestamp = blockLatest.timestamp;
          console.log(now() + " BlocksBrowse - methods.searchDebounced - END timestamp[" + endBlock + "]: " + endTimestamp + " " + this.formatTimestamp(endTimestamp));
          let blockNumber = null;
          if (datetime <= startTimestamp) {
            blockNumber = startBlock;
          } else if (datetime >= endTimestamp) {
            blockNumber = endBlock;
          } else {
            while (startTimestamp < endTimestamp) {
              let middleBlock = Math.floor((startBlock + endBlock) / 2);
              let middleTimestamp = (await this.provider.getBlock(middleBlock)).timestamp;
              blockNumber = middleBlock;
              console.log(now() + " BlocksBrowse - methods.searchDebounced - MIDDLE timestamp[" + middleBlock + "]: " + middleTimestamp + " " + this.formatTimestamp(middleTimestamp));
              if (middleTimestamp < datetime) {
                startBlock = middleBlock + 1;
                startTimestamp = (await this.provider.getBlock(startBlock)).timestamp;
                console.log(now() + " BlocksBrowse - methods.searchDebounced - START timestamp[" + startBlock + "]: " + startTimestamp + " " + this.formatTimestamp(startTimestamp));
              } else if (middleTimestamp > datetime) {
                endBlock = middleBlock - 1;
                endTimestamp = (await this.provider.getBlock(endBlock)).timestamp;
                console.log(now() + " BlocksBrowse - methods.searchDebounced - END timestamp[" + endBlock + "]: " + endTimestamp + " " + this.formatTimestamp(endTimestamp));
              } else {
                break;
              }
            }
            console.log(now() + " BlocksBrowse - methods.searchDebounced - FOUND blockNumber: " + blockNumber);
          }
          if (blockNumber) {
            if (this.sortBy == "desc") {
              console.log(now() + " BlocksBrowse - methods.searchDebounced - TIMESTAMP DESC blockNumber: " + JSON.stringify(blockNumber));
              this.currentPage = Math.ceil((parseInt(this.blockNumber) - parseInt(blockNumber)) / this.itemsPerPage);
            } else {
              console.log(now() + " BlocksBrowse - methods.searchDebounced - TIMESTAMP ASC blockNumber: " + JSON.stringify(blockNumber));
              this.currentPage = Math.ceil((parseInt(blockNumber) + 1) / this.itemsPerPage);
            }
          }
        }
      }
    },

    async loadItems ({ page, itemsPerPage, sortBy }) {
      if (!this.provider) {
        this.provider = new ethers.providers.Web3Provider(window.ethereum);
      }
      const dbInfo = store.getters["db"];
      const db = new Dexie(dbInfo.name);
      db.version(dbInfo.version).stores(dbInfo.schemaDefinition);
      const chainId = store.getters["chainId"];

      const blockNumber = parseInt(store.getters['web3'].blockNumber);
      this.loading = true;
      this.sortBy = !sortBy || sortBy.length == 0 || (sortBy[0].key == "number" && sortBy[0].order == "desc") ? "desc" : "asc";
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
      console.log(now() + " BlocksBrowse - methods.loadItems - blockNumber: " + blockNumber + ", this.sortBy: " + this.sortBy + ", page: " + page + ", itemsPerPage: " + itemsPerPage + ", startBlock: " + startBlock + ", endBlock: " + endBlock);

      const t0 = performance.now();
      const blocks = await db.blocks.where('[chainId+number]').between([chainId, startBlock],[chainId, endBlock], true, true).toArray();
      let blockNumbers = new Set(blocks.map(e => e.number));
      for (let blockNumber = startBlock; blockNumber <= endBlock; blockNumber++) {
        if (!blockNumbers.has(blockNumber)) {
          console.log(now() + " BlocksBrowse - methods.loadItems - RETRIEVING blockNumber: " + blockNumber);
          try {
            const block = await this.provider.getBlockWithTransactions(blockNumber);
            if (block) {
              const blockData = JSON.parse(JSON.stringify(block));
              blocks.push({ chainId, ...blockData });
              await db.blocks.put({ chainId, ...blockData }).then (function() {
                }).catch(function(e) {
                  console.error(now() + " BlocksBrowse - methods.loadItems - ERROR blocks.put: " + e.message);
                });
            }
          } catch (e) {
            console.error(now() + " BlocksBrowse - methods.loadItems - ERROR provider.getBlockWithTransactions: " + e.message);
          }
        }
      }
      const t1 = performance.now();
      console.log(now() + " BlocksBrowse - methods.loadItem - db.blocks.where([" + startBlock + "..." + endBlock + "]) & getBlockWithTransactions(...) took " + (t1 - t0) + " ms");

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
    copyToClipboard(str) {
      navigator.clipboard.writeText(str);
    },
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
