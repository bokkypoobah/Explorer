const RenderAddress = {
  template: `
    <div>
      <v-menu location="bottom">
        <template v-slot:activator="{ props }">
          <v-btn v-if="address" color="primary" dark v-bind="props" variant="text" class="ma-0 px-2 lowercase-btn">
            {{ address }}
          </v-btn>
        </template>
        <v-list>
          <v-list-subheader>{{ address }}</v-list-subheader>
          <v-list-item :href="'#/address/' + address">
            <template v-slot:prepend>
              <v-icon>mdi-arrow-right-bold-outline</v-icon>
            </template>
            <v-list-item-title>View</v-list-item-title>
          </v-list-item>
          <v-list-item @click="copyToClipboard(address);">
            <template v-slot:prepend>
              <v-icon>mdi-content-copy</v-icon>
            </template>
            <v-list-item-title>Copy address to clipboard</v-list-item-title>
          </v-list-item>
          <v-list-item :href="explorer + 'address/' + address" target="_blank">
            <template v-slot:prepend>
              <v-icon>mdi-link-variant</v-icon>
            </template>
            <v-list-item-title>View in explorer</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

    </div>
  `,
  props: ['address'],
  data: function () {
    return {
    };
  },
  computed: {
    explorer() {
      return store.getters['explorer'];
    },
  },
  methods: {
    // async loadItems ({ page, itemsPerPage, sortBy }) {
    //   if (!this.provider) {
    //     this.provider = new ethers.providers.Web3Provider(window.ethereum);
    //   }
    //   const dbInfo = store.getters["db"];
    //   const db = new Dexie(dbInfo.name);
    //   db.version(dbInfo.version).stores(dbInfo.schemaDefinition);
    //   const chainId = store.getters["chainId"];
    //
    //   const blockNumber = parseInt(store.getters['web3'].blockNumber);
    //   this.loading = true;
    //   this.sortBy = !sortBy || sortBy.length == 0 || (sortBy[0].key == "number" && sortBy[0].order == "desc") ? "desc" : "asc";
    //   let startBlock, endBlock;
    //   if (this.sortBy == "desc") {
    //     endBlock =  parseInt(blockNumber) - ((page - 1) * itemsPerPage);
    //     startBlock = endBlock - (itemsPerPage -1 );
    //     if (startBlock < 0) {
    //       startBlock = 0;
    //     }
    //   } else {
    //     startBlock = (page - 1) * itemsPerPage;
    //     endBlock = page * itemsPerPage - 1;
    //     if (endBlock > blockNumber) {
    //       endBlock = blockNumber;
    //     }
    //   }
    //   console.log(now() + " RenderAddress - methods.loadItems - blockNumber: " + blockNumber + ", this.sortBy: " + this.sortBy + ", page: " + page + ", itemsPerPage: " + itemsPerPage + ", startBlock: " + startBlock + ", endBlock: " + endBlock);
    //
    //   const t0 = performance.now();
    //   const blocks = await db.blocks.where('[chainId+number]').between([chainId, startBlock],[chainId, endBlock], true, true).toArray();
    //   let blockNumbers = new Set(blocks.map(e => e.number));
    //   for (let blockNumber = startBlock; blockNumber <= endBlock; blockNumber++) {
    //     if (!blockNumbers.has(blockNumber)) {
    //       console.log(now() + " RenderAddress - methods.loadItems - RETRIEVING blockNumber: " + blockNumber);
    //       const block = await this.provider.getBlockWithTransactions(blockNumber);
    //       const blockData = JSON.parse(JSON.stringify(block));
    //       blocks.push({ chainId, ...blockData });
    //       await db.blocks.put({ chainId, ...blockData }).then (function() {
    //         }).catch(function(e) {
    //           console.error(now() + " RenderAddress - methods.loadItems - ERROR blocks.put: " + e.message);
    //         });
    //     }
    //   }
    //   const t1 = performance.now();
    //   console.log(now() + " RenderAddress - methods.loadItem - db.blocks.where([" + startBlock + "..." + endBlock + "]) & getBlockWithTransactions(...) took " + (t1 - t0) + " ms");
    //
    //   if (this.sortBy == "desc") {
    //     blocks.sort((a, b) => {
    //       return b.number - a.number;
    //     });
    //   } else {
    //     blocks.sort((a, b) => {
    //       return a.number - b.number;
    //     });
    //   }
    //   const results = [];
    //   for (const block of blocks) {
    //     let extraData = block.extraData;
    //     try {
    //       extraData = ethers.utils.toUtf8String(block.extraData);
    //     } catch (e) {
    //     }
    //     results.push({
    //       ...block,
    //       extraData,
    //       txCount: block.transactions.length,
    //       gasUsed: ethers.BigNumber.from(block.gasUsed).toString(),
    //       gasLimit: ethers.BigNumber.from(block.gasLimit).toString(),
    //       percent: ethers.BigNumber.from(block.gasUsed).mul(100).div(ethers.BigNumber.from(block.gasLimit)).toString(),
    //     });
    //   }
    //   this.blocks = results;
    //   this.loading = null;
    //   db.close();
    // },
    // formatETH(e) {
    //   if (e) {
    //     return ethers.utils.formatEther(e).replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
    //   }
    //   return null;
    // },
    // commify0(n) {
    //   if (n != null) {
    //     return Number(n).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    //   }
    //   return null;
    // },
    // formatTimestamp(ts) {
    //   if (ts != null) {
    //     return moment.unix(ts).format("YYYY-MM-DD HH:mm:ss");
    //   }
    //   return null;
    // },

    // syncAddress() {
    //   console.log(now() + " RenderAddress - methods.syncAddress");
    //   const address = store.getters["address/address"];
    //   console.log(now() + " RenderAddress - methods.syncAddress - address: " + address);
    //   store.dispatch('address/loadAddress', { inputAddress: address, forceUpdate: true });
    // },
    copyToClipboard(str) {
      navigator.clipboard.writeText(str);
    },
  },
  beforeCreate() {
    console.log(now() + " RenderAddress - beforeCreate");
	},
  mounted() {
    console.log(now() + " RenderAddress - mounted");
    // const t = this;
    // setTimeout(function() {
    //   store.dispatch('address/loadAddress', { inputAddress: t.inputAddress, forceUpdate: false });
    // }, 1000);
	},
  unmounted() {
    console.log(now() + " RenderAddress - unmounted");
	},
  destroyed() {
    console.log(now() + " RenderAddress - destroyed");
	},
};
