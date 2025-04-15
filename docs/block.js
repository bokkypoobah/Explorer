const Block = {
  template: `
    <div>
      <v-container fluid class="pa-1">
        <v-toolbar density="compact" class="mt-1">
          <h4 class="ml-2">Block</h4>
          <v-btn v-if="block" :disabled="block.number == 0" @click="navigateToBlock(0);" icon="mdi-page-first" density="compact" color="primary" dark class="ma-0 ml-5">
          </v-btn>
          <v-btn v-if="block" :disabled="block.number == 0" @click="navigateToBlock(block.number - 1);" icon="mdi-chevron-left" density="compact" color="primary" dark class="ma-0">
          </v-btn>
          <v-menu location="bottom">
            <template v-slot:activator="{ props }">
              <v-btn v-if="block" color="primary" dark v-bind="props" class="ma-0 lowercase-btn">
                {{ commify0(block.number) }}
              </v-btn>
            </template>
            <v-list>
              <v-list-subheader>{{ commify0(block.number) }}</v-list-subheader>
              <v-list-item @click="copyToClipboard(block.number);">
                <template v-slot:prepend>
                  <v-icon>mdi-content-copy</v-icon>
                </template>
                <v-list-item-title>Copy block number to clipboard</v-list-item-title>
              </v-list-item>
              <v-list-item :href="explorer + 'block/' + block.number" target="_blank">
                <template v-slot:prepend>
                  <v-icon>mdi-link-variant</v-icon>
                </template>
                <v-list-item-title>View in explorer</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
          <v-btn v-if="block" :disabled="block.number == latestBlockNumber" @click="navigateToBlock(block.number + 1);" icon="mdi-chevron-right" density="compact" color="primary" dark class="ma-0">
          </v-btn>
          <v-btn v-if="block" :disabled="block.number == latestBlockNumber" @click="navigateToBlock(latestBlockNumber);" icon="mdi-page-last" density="compact" color="primary" dark class="ma-0">
          </v-btn>

          <!-- <v-text-field v-model="settings.blockNumber" @input="saveSettings();" hide-details single-line density="compact" variant="plain" style="width: 50px;" class="ma-0 pa-0" placeholder="block #">
          </v-text-field> -->
          <!-- <v-btn @click="syncAddress();" color="primary" icon>
            <v-icon>mdi-refresh</v-icon>
          </v-btn> -->
          <!-- <v-spacer></v-spacer> -->
          <p class="ml-5 text-caption text--disabled">
            {{ timestampString }}, {{ block && block.timestamp && formatTimeDiff(block.timestamp) }}
          </p>
          <v-spacer></v-spacer>
          <v-tabs v-model="settings.tab" @update:modelValue="saveSettings();" right color="deep-purple-accent-4">
            <v-tab prepend-icon="mdi-cube-outline" text="Info" value="info" class="lowercase-btn"></v-tab>
            <v-tab prepend-icon="mdi-text-long" text="Transactions" value="transactions" class="lowercase-btn"></v-tab>
          </v-tabs>
        </v-toolbar>
        <v-tabs-window v-model="settings.tab">
          <v-tabs-window-item value="info">
            <div v-if="block" class="mt-1">
              <v-row dense>
                <v-col cols="2">
                  <v-text-field v-if="block" readonly v-model="block.number" label="Number:"></v-text-field>
                </v-col>
                <v-col cols="3">
                  <v-text-field v-if="block" readonly v-model="timestampString" label="Timestamp:"></v-text-field>
                </v-col>
                <v-col>
                </v-col>
                <v-col cols="6">
                  <v-text-field v-if="block" readonly v-model="block.hash" label="Block Hash:"></v-text-field>
                </v-col>
              </v-row>
              <v-row dense>
                <v-col cols="5">
                  <v-text-field
                    v-if="block"
                    readonly
                    v-model="block.miner"
                    label="Miner:"
                    append-inner-icon="mdi-arrow-right-bold-outline"
                    @click:append-inner="navigateToAddress(block.miner)"
                  ></v-text-field>
                </v-col>
                <v-col cols="1">
                </v-col>
                <v-col cols="6">
                  <v-text-field v-if="block" readonly v-model="block.parentHash" label="Parent Block Hash:"></v-text-field>
                </v-col>
              </v-row>
              <v-row dense>
                <v-col cols="2">
                  <v-text-field v-if="block" readonly v-model="gasLimit" label="Gas Limit:"></v-text-field>
                </v-col>
                <v-col cols="2">
                  <v-text-field v-if="block" readonly v-model="gasUsed" label="Gas Used:"></v-text-field>
                </v-col>
                <v-col cols="2">
                </v-col>
                <v-col cols="4">
                  <v-text-field v-if="block" readonly v-model="extraData" label="Extra Data:"></v-text-field>
                </v-col>
              </v-row>
            </div>
          </v-tabs-window-item>
          <v-tabs-window-item value="transactions">
            <v-data-table v-if="block" :items="transactions" @click:row="handleClick" density="comfortable">
              <template v-slot:item.txHash="{ item }">
                <v-menu location="bottom">
                  <template v-slot:activator="{ props }">
                    <v-btn color="primary" dark v-bind="props" variant="text" class="ma-0 pa-0 lowercase-btn">
                      {{ item.txHash.substring(0, 20) + "..." }}
                    </v-btn>
                  </template>
                  <v-list>
                    <v-list-subheader>{{ item.txHash }}</v-list-subheader>
                    <v-list-item :href="'#/transaction/' + item.txHash">
                      <template v-slot:prepend>
                        <v-icon>mdi-arrow-right-bold-outline</v-icon>
                      </template>
                      <v-list-item-title>View</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="copyToClipboard(item.txHash);">
                      <template v-slot:prepend>
                        <v-icon>mdi-content-copy</v-icon>
                      </template>
                      <v-list-item-title>Copy transaction hash to clipboard</v-list-item-title>
                    </v-list-item>
                    <v-list-item :href="explorer + 'tx/' + item.txHash" target="_blank">
                      <template v-slot:prepend>
                        <v-icon>mdi-link-variant</v-icon>
                      </template>
                      <v-list-item-title>View in explorer</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </template>
              <template v-slot:item.from="{ item }">
                <v-menu location="bottom">
                  <template v-slot:activator="{ props }">
                    <v-btn color="primary" dark v-bind="props" variant="text" class="ma-0 pa-0 lowercase-btn">
                      {{ item.from.substring(0, 10) + '...' + item.from.slice(-8) }}
                    </v-btn>
                  </template>
                  <v-list>
                    <v-list-subheader>{{ item.from }}</v-list-subheader>
                    <v-list-item :href="'#/address/' + item.from">
                      <template v-slot:prepend>
                        <v-icon>mdi-arrow-right-bold-outline</v-icon>
                      </template>
                      <v-list-item-title>View</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="copyToClipboard(item.from);">
                      <template v-slot:prepend>
                        <v-icon>mdi-content-copy</v-icon>
                      </template>
                      <v-list-item-title>Copy address to clipboard</v-list-item-title>
                    </v-list-item>
                    <v-list-item :href="explorer + 'address/' + item.from" target="_blank">
                      <template v-slot:prepend>
                        <v-icon>mdi-link-variant</v-icon>
                      </template>
                      <v-list-item-title>View in explorer</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </template>
              <template v-slot:item.to="{ item }">
                <v-menu location="bottom">
                  <template v-slot:activator="{ props }">
                    <v-btn v-if="item.to" color="primary" dark v-bind="props" variant="text" class="ma-0 pa-0 lowercase-btn">
                      {{ item.to.substring(0, 10) + '...' + item.to.slice(-8) }}
                    </v-btn>
                  </template>
                  <v-list>
                    <v-list-subheader>{{ item.to }}</v-list-subheader>
                    <v-list-item :href="'#/address/' + item.to">
                      <template v-slot:prepend>
                        <v-icon>mdi-arrow-right-bold-outline</v-icon>
                      </template>
                      <v-list-item-title>View</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="copyToClipboard(item.to);">
                      <template v-slot:prepend>
                        <v-icon>mdi-content-copy</v-icon>
                      </template>
                      <v-list-item-title>Copy address to clipboard</v-list-item-title>
                    </v-list-item>
                    <v-list-item :href="explorer + 'address/' + item.to" target="_blank">
                      <template v-slot:prepend>
                        <v-icon>mdi-link-variant</v-icon>
                      </template>
                      <v-list-item-title>View in explorer</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </template>
            </v-data-table>
          </v-tabs-window-item>
        </v-tabs-window>
      </v-container>
    </div>
  `,
  props: ['inputBlockNumber'],
  data: function () {
    return {
      initialised: false,
      settings: {
        tab: null,
        blockNumber: null,
        version: 0,
      },
    };
  },
  computed: {
    block() {
      return store.getters['block/block'];
    },
    latestBlockNumber() {
      return store.getters['web3'].blockNumber;
    },
    explorer() {
      return store.getters['explorer'];
    },
    timestampString: {
      get: function() {
        return this.block && this.formatTimestamp(this.block.timestamp) || null;
      },
      // set: function(timestamp) {
      //   store.dispatch('setTimestamp', timestamp);
      // },
    },
    gasLimit: {
      get: function() {
        return this.block && parseInt(this.block.gasLimit) || null;
      },
    },
    gasUsed: {
      get: function() {
        return this.block && parseInt(this.block.gasUsed) || null;
      },
    },
    extraData: {
      get: function() {
        try {
          return this.block && ethers.utils.toUtf8String(this.block.extraData) || null;
        } catch (e) {
        }
        return this.block.extraData;
      },
    },
    transactions() {
      const results = [];
      for (const tx of (this.block && this.block.transactions || [])) {
        results.push({
          txIndex: tx.transactionIndex,
          txHash: tx.hash,
          from: tx.from,
          to: tx.to,
          value: this.formatETH(tx.value),
        });
      }
      console.log(now() + " Block - computed.transactions - results: " + JSON.stringify(results, null, 2));
      return results;
    },
  },
  methods: {
    navigateToBlock(blockNumber) {
      console.log(now() + " Block - methods.navigateToBlock - blockNumber: " + blockNumber);
      this.$router.push({ name: 'Block', params: { inputBlockNumber: blockNumber } });
      store.dispatch('block/loadBlock', blockNumber);
    },
    navigateToAddress(link) {
      console.log(now() + " Block - methods.navigateToAddress - link: " + link);
      this.$router.push({ name: 'AddressAddress', params: { inputAddress: link } });
      store.dispatch('address/loadAddress', { inputAddress: link, forceUpdate: false });
    },
    handleClick(event, row) {
      console.log(now() + " Block - methods.handleClick - event: " + JSON.stringify(event, null, 2) + ", row: " + JSON.stringify(row, null, 2));
    },
    formatETH(e) {
      if (e) {
        return ethers.utils.formatEther(e).replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
      }
      return null;
    },
    formatTimestamp(ts) {
      if (ts != null) {
        return moment.unix(ts).format("YYYY-MM-DD HH:mm:ss");
      }
      return null;
    },
    formatTimeDiff(unixtime) {
      if (unixtime) {
        return moment.unix(unixtime).fromNow();
      }
      return null;
    },
    commify0(n) {
      if (n != null) {
        return Number(n).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
      }
      return null;
    },
    copyToClipboard(str) {
      navigator.clipboard.writeText(str);
    },
    saveSettings() {
      // console.log(now() + " Block - methods.saveSettings - settings: " + JSON.stringify(this.settings, null, 2));
      if (this.initialised) {
        localStorage.explorerBlockSettings = JSON.stringify(this.settings);
      }
    },
  },
  beforeCreate() {
    console.log(now() + " Block - beforeCreate");
	},
  mounted() {
    console.log(now() + " Block - mounted - inputBlockNumber: " + this.inputBlockNumber);

    if ('explorerBlockSettings' in localStorage) {
      const tempSettings = JSON.parse(localStorage.explorerBlockSettings);
      console.log(now() + " Block - mounted - tempSettings: " + JSON.stringify(tempSettings));
      if ('version' in tempSettings && tempSettings.version == this.settings.version) {
        this.settings = tempSettings;
      }
    }
    this.initialised = true;
    console.log(now() + " Block - mounted - this.settings: " + JSON.stringify(this.settings));

    const t = this;
    setTimeout(function() {
      store.dispatch('block/loadBlock', t.inputBlockNumber);
    }, 1000);
	},
  unmounted() {
    console.log(now() + " Block - unmounted");
	},
  destroyed() {
    console.log(now() + " Block - destroyed");
	},
};

const blockModule = {
  namespaced: true,
  state: {
    error: null,
    block: null,
  },
  getters: {
    error: state => state.error,
    block: state => state.block,
  },
  mutations: {
    setData(state, data) {
      // console.log(now() + " blockModule - mutations.setData - data: " + JSON.stringify(data));
      state.error = data.error;
      state.block = data.block;
    },
  },
  actions: {
    async loadBlock(context, blockNumber) {
      console.log(now() + " blockModule - actions.loadBlock - blockNumber: " + blockNumber);
      let [error, block] = [null, null];
      if (blockNumber != null) {
        if (!store.getters['web3'].connected || !window.ethereum) {
          error = "Not connected";
        }
        if (!error && !(/^\d+$/.test(blockNumber))) {
          error = "Invalid block number";
        }
        if (!error) {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          block = await provider.getBlockWithTransactions(parseInt(blockNumber)) || null;
          // block = await provider.getBlock(parseInt(blockNumber)) || null;
          console.log("block: " + JSON.stringify(block, null, 2));
          // console.log("blockNumber: " + blockNumber + ", blockHash: " + block.hash);
          // const blockByBlockHash = await provider.send('eth_getBlockByHash', [block.hash, true]);
          // console.log("blockByBlockHash.number: " + parseInt(blockByBlockHash.number) + ", blockByBlockHash.hash: " + blockByBlockHash.hash);
          // console.log("blockByBlockHash: " + JSON.stringify(blockByBlockHash, null, 2));
        }
      }
      context.commit('setData', { error, block });
    }
  },
};
