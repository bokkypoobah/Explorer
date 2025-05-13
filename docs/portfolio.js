const Portfolio = {
  template: `
    <div>
      <v-container fluid class="pa-1">
        <v-toolbar density="compact" class="mt-1">
          <h4 class="ml-2">Portfolio</h4>
          <render-address v-if="address" :address="address"></render-address>
          <!-- <p class="ml-5 text-caption text--disabled">
            {{ type && type.substring(0, 3) == "erc" && type.replace(/erc/, "ERC-") || "Not a token contract" }} {{ symbol }} {{ name && ("'" + name + "'") || "" }} {{ decimals }}
          </p> -->
          <v-spacer></v-spacer>
          <!-- <v-btn v-if="sync.info == null" @click="syncToken();" color="primary" icon v-tooltip="'Sync Portfolio Info'">
            <v-icon>mdi-refresh</v-icon>
          </v-btn> -->
          <!-- <v-btn v-if="sync.info == null" @click="syncTokenEvents();" color="primary" icon v-tooltip="'Sync Portfolio Events'">
            <v-icon>mdi-download</v-icon>
          </v-btn> -->
          <!-- <v-btn v-if="sync.info == null" @click="syncTokenEvents();" color="primary" icon v-tooltip="'Retrieve Timestamps'">
            <v-icon>mdi-clock-outline</v-icon>
          </v-btn> -->
          <!-- <v-btn v-if="sync.info == null" :disabled="!reservoir" @click="syncTokenMetadata();" color="primary" icon v-tooltip="'Sync Portfolio Metadata'">
            <v-icon>mdi-image-outline</v-icon>
          </v-btn> -->
          <v-btn v-if="sync.info != null" @click="setSyncHalt();" color="primary" icon v-tooltip="'Halt syncing'">
            <v-icon>mdi-stop</v-icon>
          </v-btn>
          <v-progress-circular v-if="sync.info != null" color="primary" :model-value="sync.total ? (parseInt(sync.completed * 100 / sync.total)) : 0" :size="30" :width="6" v-tooltip="sync.info + ': Block #' + commify0(sync.completed) + ' of ' + commify0(sync.total)"></v-progress-circular>
          <v-spacer></v-spacer>
          <v-tabs v-model="settings.tab" @update:modelValue="saveSettings();" right color="deep-purple-accent-4">
            <v-tab prepend-icon="mdi-text-long" text="Summary" value="summary" class="lowercase-btn"></v-tab>
            <v-tab prepend-icon="mdi-cash-multiple" text="Fungibles" value="fungibles" class="lowercase-btn"></v-tab>
            <v-tab prepend-icon="mdi-cards-playing-heart-multiple-outline" text="Non-Fungibles" value="nonfungibles" class="lowercase-btn"></v-tab>
            <v-tab prepend-icon="mdi-alphabetical" text="Names" value="names" class="lowercase-btn"></v-tab>
            <v-tab prepend-icon="mdi-check-outline" text="Approvals" value="approvals" class="lowercase-btn"></v-tab>
            <v-tab prepend-icon="mdi-math-log" text="Activity" value="activity" class="lowercase-btn"></v-tab>
            <v-tab prepend-icon="mdi-cog" text="Config" value="config" class="lowercase-btn"></v-tab>
          </v-tabs>
        </v-toolbar>

        <v-tabs-window v-model="settings.tab">
          <v-tabs-window-item value="summary">
            TODO: Summary
          </v-tabs-window-item>
          <v-tabs-window-item value="fungibles">
            TODO: ERC-20 Fungibles
          </v-tabs-window-item>
          <v-tabs-window-item value="nonfungibles">
            TODO: ERC-721 and ERC-1155 Non-Fungibles
          </v-tabs-window-item>
          <v-tabs-window-item value="names">
            TODO: ENS Names, with expiry information
          </v-tabs-window-item>
          <v-tabs-window-item value="approvals">
            TODO: ERC-20, ERC-721 and ERC-1155 Approvals
          </v-tabs-window-item>
          <v-tabs-window-item value="activity">
            TODO: Activity
          </v-tabs-window-item>
          <v-tabs-window-item value="config">
            TODO: Setup portfolios of accounts
          </v-tabs-window-item>
        </v-tabs-window>
      </v-container>
    </div>
  `,
  props: ['inputPortfolio'],
  data: function () {
    return {
      initialised: false,
      settings: {
        tab: null,
        erc20Owners: {
          sortBy: [{ key: "balances", order: "desc" }],
          itemsPerPage: 10,
          currentPage: 1,
          top: 20,
        },
        version: 0,
      },
    };
  },
  computed: {
    chainId() {
      return store.getters['chainId'];
    },
    address() {
      return store.getters['token/address'];
    },
    version() {
      return store.getters['token/info'].version || null;
    },
    implementation() {
      return store.getters['token/info'].implementation || null;
    },
    type() {
      return store.getters['token/info'].type || null;
    },
    name() {
      return store.getters['token/info'].name || null;
    },
    symbol() {
      return store.getters['token/info'].symbol || null;
    },
    decimals() {
      return store.getters['token/info'].decimals || null;
    },
    totalSupply() {
      return store.getters['token/info'].totalSupply || null;
    },
    addresses() {
      return store.getters['token/addresses'];
    },
    txHashes() {
      return store.getters['token/txHashes'];
    },
    numberOfEvents() {
      return store.getters['token/numberOfEvents'];
    },
    balances() {
      return store.getters['token/balances'];
    },
    tokens() {
      return store.getters['token/tokens'];
    },
    approvals() {
      return store.getters['token/approvals'];
    },
    approvalForAlls() {
      return store.getters['token/approvalForAlls'];
    },
    metadata() {
      return store.getters['token/metadata'];
    },
    sync() {
      return store.getters['token/sync'];
    },
    explorer() {
      return store.getters['explorer'];
    },
    reservoir() {
      return store.getters['reservoir'];
    },
    getEventsHeaders() {
      if (this.type == "erc20") {
        return [
          { title: 'When', value: 'when', sortable: false },
          { title: 'Block #', value: 'blockNumber', sortable: true },
          { title: 'Tx Hash', value: 'txHash', sortable: false },
          { title: 'Event', value: 'event', sortable: false },
          { title: 'From / Owner', value: 'address1', sortable: false },
          { title: 'To / Spender', value: 'address2', sortable: false },
          { title: 'Tokens', value: 'value1', align: 'end', sortable: false },
        ];
      } else if (this.type == "erc721") {
        return [
          { title: 'When', value: 'when', sortable: false },
          { title: 'Block #', value: 'blockNumber', sortable: true },
          { title: 'Tx Hash', value: 'txHash', sortable: false },
          { title: 'Event', value: 'event', sortable: false },
          { title: 'From / Owner / Account', value: 'address1', sortable: false },
          { title: 'To / Approved / Operator', value: 'address2', sortable: false },
          { title: 'Token Id / Token Id / Approved', value: 'value1', align: 'end', sortable: false },
        ];
      } else {
        return [
          { title: 'When', value: 'when', sortable: false },
          { title: 'Block #', value: 'blockNumber', sortable: true },
          { title: 'Tx Hash', value: 'txHash', sortable: false },
          { title: 'Event', value: 'event', sortable: false },
          { title: 'From / Owner', value: 'address1', sortable: false },
          { title: 'To / Operator', value: 'address2', sortable: false },
          { title: 'Token Id / Approved', value: 'value1', align: 'end', sortable: false },
          { title: 'Tokens', value: 'value2', align: 'end', sortable: false },
        ];
      }
    },
    getApprovalsHeaders() {
      if (this.type == "erc20") {
        return [
          { title: '#', value: 'rowNumber', align: 'end', sortable: false },
          // { title: 'When', value: 'when', sortable: false },
          { title: 'Block #', value: 'blockNumber', sortable: true },
          { title: 'Tx Hash', value: 'txHash', sortable: false },
          { title: 'Event', value: 'event', sortable: false },
          { title: 'Owner', value: 'address1', sortable: false },
          { title: 'Spender', value: 'address2', sortable: false },
          { title: 'Tokens', value: 'value1', align: 'end', sortable: false },
        ];
      } else if (this.type == "erc721") {
        return [
          { title: '#', value: 'rowNumber', align: 'end', sortable: false },
          // { title: 'When', value: 'when', sortable: false },
          { title: 'Block #', value: 'blockNumber', sortable: true },
          { title: 'Tx Hash', value: 'txHash', sortable: false },
          { title: 'Event', value: 'event', sortable: false },
          { title: 'Owner', value: 'address1', sortable: false },
          { title: 'Token Id / Operator', value: 'address2', sortable: false },
          { title: 'Approved', value: 'value1', sortable: false },
        ];
      } else {
        return [
          { title: '#', value: 'rowNumber', align: 'end', sortable: false },
          // { title: 'When', value: 'when', sortable: false },
          { title: 'Block #', value: 'blockNumber', sortable: true },
          { title: 'Tx Hash', value: 'txHash', sortable: false },
          { title: 'Event', value: 'event', sortable: false },
          { title: 'Owner', value: 'address1', sortable: false },
          { title: 'Operator', value: 'address2', sortable: false },
          { title: 'Approved', value: 'value1', sortable: false },
        ];
      }
    },
    // erc20OwnersList() {
    //   const results = [];
    //   for (const [address, balance] of Object.entries(this.balances)) {
    //     const percent = ethers.BigNumber.from(balance).mul(1000000).div(this.totalSupply) / 10000.0;
    //     results.push({ address, balance, percent });
    //   }
    //   results.sort((a, b) => {
    //     return ethers.BigNumber.from(b.balance).sub(a.balance);
    //   });
    //   return results;
    // },
    // nftTotalSupply() {
    //   let result = 0;
    //   if (this.type == "erc721") {
    //     result = Object.keys(this.tokens).length;
    //   } else if (this.type == "erc1155") {
    //     for (const [tokenId, ownerData] of Object.entries(this.tokens)) {
    //       for (const [owner, count] of Object.entries(ownerData)) {
    //         result += parseInt(count);
    //       }
    //     }
    //   }
    //   return result;
    // },
    // nftAttributes() {
    //   const results = {};
    //   if (this.type == "erc721" || this.type == "erc1155") {
    //     for (const [tokenId, tokenData] of Object.entries(this.metadata.tokens || {})) {
    //       for (const attribute of tokenData.attributes) {
    //         if (!(attribute.key in results)) {
    //           results[attribute.key] = {};
    //         }
    //         if (!(attribute.value in results[attribute.key])) {
    //           results[attribute.key][attribute.value] = [];
    //         }
    //         results[attribute.key][attribute.value].push(parseInt(tokenId));
    //       }
    //     }
    //   }
    //   return results;
    // },
    // nftAttributesList() {
    //   const results = [];
    //   for (const [attribute, attributeInfo] of Object.entries(this.nftAttributes)) {
    //     const array = [];
    //     for (const [value, info] of Object.entries(attributeInfo)) {
    //       array.push({ value, count: info.length });
    //     }
    //     array.sort((a, b) => {
    //       return a.count - b.count;
    //     });
    //     results.push({ attribute, options: array });
    //   }
    //   results.sort((a, b) => {
    //     return a.attribute.localeCompare(b.attribute);
    //   });
    //   return results;
    // },
    // nftFilteredTokens() {
    //   const results = [];
    //   if (this.type == "erc721" || this.type == "erc1155") {
    //     if (this.settings.attributes[this.address]) {
    //       let tokenIds = null;
    //       for (const [attribute, attributeData] of Object.entries(this.settings.attributes[this.address])) {
    //         let attributeTokenIds = null;
    //         for (const [option, optionData] of Object.entries(attributeData)) {
    //           if (!attributeTokenIds) {
    //             attributeTokenIds = new Set(this.nftAttributes[attribute][option]);
    //           } else {
    //             attributeTokenIds = new Set([...attributeTokenIds, ...this.nftAttributes[attribute][option]]);
    //           }
    //         }
    //         if (!tokenIds) {
    //           tokenIds = attributeTokenIds;
    //         } else {
    //           const newTokenIds = new Set();
    //           for (const tokenId of tokenIds) {
    //             if ((attributeTokenIds.has(tokenId))) {
    //               newTokenIds.add(tokenId);
    //             }
    //           }
    //           tokenIds = newTokenIds;
    //         }
    //       }
    //       for (const tokenId of tokenIds) {
    //         if (this.type == "erc721") {
    //           results.push({ tokenId, ...this.metadata.tokens[tokenId], owner: this.tokens[tokenId] || null });
    //         } else {
    //           results.push({ tokenId, ...this.metadata.tokens[tokenId], owners: this.tokens[tokenId] || null, owner: undefined });
    //         }
    //       }
    //     } else {
    //       for (const [tokenId, tokenData] of Object.entries(this.metadata.tokens || {})) {
    //         if (this.type == "erc721") {
    //           results.push({ tokenId, ...this.metadata.tokens[tokenId], owner: this.tokens[tokenId] || null });
    //         } else {
    //           results.push({ tokenId, ...this.metadata.tokens[tokenId], owners: this.tokens[tokenId] || null, owner: undefined });
    //         }
    //       }
    //     }
    //   }
    //   if (this.settings.tokens.sortOption == "tokenidasc") {
    //     results.sort((a, b) => {
    //       return a.tokenId - b.tokenId;
    //     });
    //   } else if (this.settings.tokens.sortOption == "tokeniddsc") {
    //     results.sort((a, b) => {
    //       return b.tokenId - a.tokenId;
    //     });
    //   }
    //   return results;
    // },
    // nftFilteredTokensPaged() {
    //   const results = this.nftFilteredTokens.slice((this.settings.tokens.currentPage - 1) * this.settings.tokens.itemsPerPage, this.settings.tokens.currentPage * this.settings.tokens.itemsPerPage);
    //   console.log(now() + " Portfolio - computed.nftFilteredTokensPaged - results: " + JSON.stringify(results, null, 2));
    //   return results;
    // },
    // nftOwnersList() {
    //   const results = [];
    //   // console.log(now() + " Portfolio - computed.nftOwnersList - this.tokens: " + JSON.stringify(this.tokens, null, 2));
    //   if (this.type == "erc721") {
    //     const totalSupply = this.nftTotalSupply;
    //     const owners = {};
    //     for (const [tokenId, owner] of Object.entries(this.tokens)) {
    //       if (!(owner in owners)) {
    //         owners[owner] = [];
    //       }
    //       owners[owner].push(tokenId);
    //     }
    //     // console.log(now() + " Portfolio - computed.nftOwnersList - owners: " + JSON.stringify(owners, null, 2));
    //     for (const [address, tokens] of Object.entries(owners)) {
    //       const percent = tokens.length * 100.0 / totalSupply ;
    //       results.push({ address, count: tokens.length, percent: parseFloat(percent.toFixed(4)), tokens });
    //     }
    //   } else if (this.type == "erc1155") {
    //     const totalSupply = this.nftTotalSupply;
    //     const owners = {};
    //     for (const [tokenId, ownerData] of Object.entries(this.tokens)) {
    //       for (const [owner, count] of Object.entries(ownerData)) {
    //         if (!(owner in owners)) {
    //           owners[owner] = [];
    //         }
    //         owners[owner].push({ tokenId, count });
    //       }
    //     }
    //     // console.log(now() + " Portfolio - computed.nftOwnersList - owners: " + JSON.stringify(owners, null, 2));
    //     for (const [address, tokenInfo] of Object.entries(owners)) {
    //       let count = 0;
    //       for (const item of tokenInfo) {
    //         // console.log("  " + JSON.stringify(item));
    //         count += parseInt(item.count);
    //       }
    //       // console.log(address + " => " + count + " " + JSON.stringify(tokenInfo));
    //       const percent = count * 100.0 / totalSupply ;
    //       results.push({ address, count, percent: percent.toFixed(4), tokens: tokenInfo });
    //     }
    //
    //   }
    //   results.sort((a, b) => {
    //     return b.count - a.count;
    //   });
    //   // console.log(now() + " Portfolio - computed.nftOwnersList - results: " + JSON.stringify(results, null, 2));
    //   return results;
    // },
    // approvalsList() {
    //   const results = [];
    //   // console.log(now() + " Portfolio - computed.approvalsList - this.approvals: " + JSON.stringify(this.approvals, null, 2));
    //   // console.log(now() + " Portfolio - computed.approvalsList - this.approvalForAlls: " + JSON.stringify(this.approvalForAlls, null, 2));
    //   if (this.type == "erc20") {
    //     for (const [owner, ownerData] of Object.entries(this.approvals)) {
    //       for (const [spender, data] of Object.entries(ownerData)) {
    //         results.push({ event: "Approval", owner, spender, ...data });
    //       }
    //     }
    //   } else if (this.type == "erc721") {
    //     for (const [owner, ownerData] of Object.entries(this.approvals)) {
    //       for (const [tokenId, data] of Object.entries(ownerData)) {
    //         results.push({ event: "Approval", owner, tokenId, ...data });
    //       }
    //     }
    //     for (const [owner, ownerData] of Object.entries(this.approvalForAlls)) {
    //       for (const [operator, data] of Object.entries(ownerData)) {
    //         results.push({ event: "ApprovalForAll", owner, operator, ...data });
    //       }
    //     }
    //   } else if (this.type == "erc1155") {
    //     for (const [owner, ownerData] of Object.entries(this.approvalForAlls)) {
    //       for (const [operator, data] of Object.entries(ownerData)) {
    //         results.push({ event: "ApprovalForAll", owner, operator, ...data });
    //       }
    //     }
    //   }
    //   results.sort((a, b) => {
    //     return b.blockNumber - a.blockNumber;
    //   });
    //   // console.log(now() + " Portfolio - computed.approvalsList - results: " + JSON.stringify(results, null, 2));
    //   return results;
    // },
    // erc20OwnersChartSeries() {
    //   const series = [];
    //   let other = 0;
    //   for (const [index, row] of this.erc20OwnersList.entries()) {
    //     const value = parseFloat(ethers.utils.formatUnits(row.balance, this.decimals));
    //     if (index < this.settings.erc20Owners.top) {
    //       series.push(value);
    //     } else {
    //       other += value;
    //     }
    //   }
    //   if (other > 0) {
    //     series.push(other);
    //   }
    //   // console.log(now() + " Portfolio - computed.erc20OwnersChartSeries - series: " + JSON.stringify(series));
    //   return series;
    // },
    // erc20OwnersChartOptions() {
    //   const labels = [];
    //   let other = 0;
    //   let otherPercent = 0;
    //   for (const [index, row] of this.erc20OwnersList.entries()) {
    //     const value = parseFloat(ethers.utils.formatUnits(row.balance, this.decimals));
    //     if (index < this.settings.erc20Owners.top) {
    //       labels.push(this.addresses[row.address].substring(0, 10) + " " + row.percent.toFixed(4) + "%");
    //     } else {
    //       other += value;
    //       otherPercent += row.percent;
    //     }
    //   }
    //   if (other > 0) {
    //     labels.push("Other " + otherPercent.toFixed(4) + "%");
    //   }
    //   // console.log(now() + " Portfolio - computed.erc20OwnersChartOptions - labels: " + JSON.stringify(labels));
    //   return {
    //     chart: {
    //       width: 540,
    //       type: 'pie',
    //     },
    //     labels,
    //     // responsive: [{
    //     //   breakpoint: 480,
    //     //   options: {
    //     //     chart: {
    //     //       width: 200
    //     //     },
    //     //     legend: {
    //     //       position: 'bottom'
    //     //     }
    //     //   }
    //     // }],
    //   }
    // },
  },
  methods: {
    syncToken() {
      console.log(now() + " Portfolio - methods.syncToken - address: " + this.address);
      store.dispatch('token/loadToken', { inputAddress: this.address, forceUpdate: true });
    },
    // syncTokenEvents() {
    //   console.log(now() + " Portfolio - methods.syncTokenEvents - address: " + this.address);
    //   store.dispatch('token/syncTokenEvents', { inputAddress: this.address, forceUpdate: true });
    // },
    // syncTokenMetadata() {
    //   console.log(now() + " Portfolio - methods.syncTokenMetadata - address: " + this.address);
    //   store.dispatch('token/syncTokenMetadata', this.address);
    // },
    setSyncHalt() {
      console.log(now() + " Portfolio - methods.setSyncHalt");
      store.dispatch('token/setSyncHalt');
    },

    // async loadEvents({ page, itemsPerPage, sortBy }) {
    //   const sort = !sortBy || sortBy.length == 0 || (sortBy[0].key == "blockNumber" && sortBy[0].order == "desc") ? "desc" : "asc";
    //   console.log(now() + " Portfolio - methods.loadEvents - page: " + page + ", itemsPerPage: " + itemsPerPage + ", sortBy: " + JSON.stringify(sortBy) + ", sort: " + sort);
    //   const dbInfo = store.getters["db"];
    //   const db = new Dexie(dbInfo.name);
    //   db.version(dbInfo.version).stores(dbInfo.schemaDefinition);
    //   const address = store.getters["token/address"];
    //   console.log(now() + " Portfolio - methods.loadEvents - address: " + address);
    //   if (address) {
    //     const chainId = store.getters["chainId"];
    //     const row = (page - 1) * itemsPerPage;
    //     let data;
    //     if (sort == "asc") {
    //       data = await db.tokenEvents.where('[chainId+address+blockNumber+logIndex]').between([chainId, address, Dexie.minKey, Dexie.minKey],[chainId, address, Dexie.maxKey, Dexie.maxKey]).offset(row).limit(itemsPerPage).toArray();
    //     } else {
    //       data = await db.tokenEvents.where('[chainId+address+blockNumber+logIndex]').between([chainId, address, Dexie.minKey, Dexie.minKey],[chainId, address, Dexie.maxKey, Dexie.maxKey]).reverse().offset(row).limit(itemsPerPage).toArray();
    //     }
    //     this.eventItems = data;
    //   }
    //   db.close();
    // },

    // updateAttributes(event) {
    //   console.log(now() + " Portfolio - methods.updateAttributes - event: " + JSON.stringify(event));
    //   if (event.value) {
    //     if (!(event.address in this.settings.attributes)) {
    //       this.settings.attributes[event.address] = {};
    //     }
    //     if (!(event.attribute in this.settings.attributes[event.address])) {
    //       this.settings.attributes[event.address][event.attribute] = {};
    //     }
    //     if (!(event.option in this.settings.attributes[event.address][event.attribute])) {
    //       this.settings.attributes[event.address][event.attribute][event.option] = event.value;
    //     }
    //   } else {
    //     if (this.settings.attributes[event.address][event.attribute][event.option]) {
    //       delete this.settings.attributes[event.address][event.attribute][event.option];
    //     }
    //     if (Object.keys(this.settings.attributes[event.address][event.attribute]).length == 0) {
    //       delete this.settings.attributes[event.address][event.attribute];
    //     }
    //     if (Object.keys(this.settings.attributes[event.address]).length == 0) {
    //       delete this.settings.attributes[event.address];
    //     }
    //   }
    //   this.saveSettings();
    // },

    formatUnits(e, decimals) {
      if (e) {
        return ethers.utils.formatUnits(e, decimals).replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
      }
      return null;
    },
    formatTimestamp(ts) {
      if (ts != null) {
        return moment.unix(ts).format("YYYY-MM-DD HH:mm:ss");
      }
      return null;
    },
    commify0(n) {
      if (n != null) {
        return Number(n).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
      }
      return null;
    },
    commify2(n) {
      if (n != null) {
        return Number(n).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
      }
      return null;
    },
    saveSettings() {
      // console.log(now() + " Portfolio - methods.saveSettings - settings: " + JSON.stringify(this.settings, null, 2));
      // TODO
      // if (this.initialised) {
      //   localStorage.explorerPortfolioSettings = JSON.stringify(this.settings);
      // }
    },
    copyToClipboard(str) {
      navigator.clipboard.writeText(str);
    },
  },
  beforeCreate() {
    console.log(now() + " Portfolio - beforeCreate");
	},
  mounted() {
    console.log(now() + " Portfolio - mounted - inputPortfolio: " + this.inputPortfolio);

    // if ('explorerPortfolioSettings' in localStorage) {
    //   const tempSettings = JSON.parse(localStorage.explorerPortfolioSettings);
    //   // console.log(now() + " Portfolio - mounted - tempSettings: " + JSON.stringify(tempSettings));
    //   if ('version' in tempSettings && tempSettings.version == this.settings.version) {
    //     this.settings = tempSettings;
    //   }
    // }
    // this.initialised = true;
    // console.log(now() + " Portfolio - mounted - this.settings: " + JSON.stringify(this.settings));
    //
    const t = this;
    setTimeout(function() {
      store.dispatch('portfolio/loadPortfolio', { inputPortfolio: t.inputPortfolio, forceUpdate: false });
    }, 100);
	},
  unmounted() {
    console.log(now() + " Portfolio - unmounted");
	},
  destroyed() {
    console.log(now() + " Portfolio - destroyed");
	},
};
