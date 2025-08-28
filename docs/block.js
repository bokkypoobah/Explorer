const Block = {
  template: `
    <div>
      <v-container fluid class="pa-1">
        <v-toolbar density="compact" class="mt-1">
          <v-card-item prepend-icon="mdi-cube-outline" title="Block"></v-card-item>
          <v-btn v-if="block" :disabled="block.number == 0" @click="navigateToBlock(0);" icon="mdi-page-first" density="compact" color="primary" dark class="ma-0 ml-5">
          </v-btn>
          <v-btn v-if="block" :disabled="block.number == 0" @click="navigateToBlock(block.number - 1);" icon="mdi-chevron-left" density="compact" color="primary" dark class="ma-0">
          </v-btn>
          <render-block-number v-if="block && block.number != null" :block="block.number" suppressView></render-block-number>
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
            <v-tab prepend-icon="mdi-text-long" :text="(block && transactions.length || '0') + ' Transactions'" value="transactions" class="lowercase-btn"></v-tab>
          </v-tabs>
        </v-toolbar>
        <v-tabs-window v-model="settings.tab">
          <v-tabs-window-item value="info">
            <v-card>
              <v-card-text>
                <v-row no-gutters dense>
                  <v-col cols="2" align="right">
                    <p class="my-2">Block:</p>
                  </v-col>
                  <v-col cols="6" align="left">
                    <render-block-number v-if="block && block.number != null" :block="block.number" suppressView></render-block-number>
                  </v-col>
                </v-row>
                <v-row no-gutters dense>
                  <v-col cols="2" align="right">
                    <p class="my-2">Timestamp:</p>
                  </v-col>
                  <v-col cols="10" align="left">
                    <v-btn v-if="block" variant="text" class="lowercase-btn ma-0 px-2">
                      {{ timestampString }}, {{ block && block.timestamp && formatTimeDiff(block.timestamp) }}
                    </v-btn>
                  </v-col>
                </v-row>
                <v-row no-gutters dense>
                  <v-col cols="2" align="right">
                    <p class="my-2">Block Hash:</p>
                  </v-col>
                  <v-col cols="6" align="left">
                    <v-btn v-if="block" @click="copyToClipboard(block.hash);" variant="text" class="lowercase-btn ma-0 px-2">
                      {{ block.hash }}
                    </v-btn>
                  </v-col>
                </v-row>
                <v-row no-gutters dense>
                  <v-col cols="2" align="right">
                    <p class="my-2">Parent Block Hash:</p>
                  </v-col>
                  <v-col cols="6" align="left">
                    <v-btn v-if="block" @click="copyToClipboard(block.parentHash);" variant="text" class="lowercase-btn ma-0 px-2">
                      {{ block.parentHash }}
                    </v-btn>
                  </v-col>
                </v-row>
                <v-row no-gutters dense>
                  <v-col cols="2" align="right">
                    <p class="my-2">Miner:</p>
                  </v-col>
                  <v-col cols="10" align="left">
                    <render-address v-if="block" :address="block.miner"></render-address>
                  </v-col>
                </v-row>
                <v-row no-gutters dense>
                  <v-col cols="2" align="right">
                    <p class="my-2">Gas Used:</p>
                  </v-col>
                  <v-col cols="6" align="left">
                    <v-btn v-if="gasUsed != null" variant="text" class="lowercase-btn ma-0 px-2" style="min-width: 0px;">
                      {{ commify0(gasUsed) }}
                    </v-btn>
                  </v-col>
                </v-row>
                <v-row no-gutters dense>
                  <v-col cols="2" align="right">
                    <p class="my-2">Gas Limit:</p>
                  </v-col>
                  <v-col cols="6" align="left">
                    <v-btn v-if="gasLimit" variant="text" class="lowercase-btn ma-0 px-2">
                      {{ commify0(gasLimit) }}
                    </v-btn>
                  </v-col>
                </v-row>
                <v-row no-gutters dense>
                  <v-col cols="2" align="right">
                    <p class="my-2">Gas Used / Limit:</p>
                  </v-col>
                  <v-col cols="6" align="left">
                    <v-btn v-if="gasPercentage" variant="text" class="lowercase-btn ma-0 px-2" style="min-width: 0px;">
                      {{ gasPercentage + "%" }}
                    </v-btn>
                  </v-col>
                </v-row>
                <v-row no-gutters dense>
                  <v-col cols="2" align="right">
                    <p class="my-2">Extra Data:</p>
                  </v-col>
                  <v-col cols="6" align="left">
                    <v-btn v-if="extraData" variant="text" class="lowercase-btn ma-0 px-2">
                      {{ extraData }}
                    </v-btn>
                  </v-col>
                </v-row>
                <v-row no-gutters dense>
                  <v-col cols="2" align="right">
                    <p class="my-2">Transactions:</p>
                  </v-col>
                  <v-col cols="6" align="left">
                    <v-btn v-if="block" variant="text" class="lowercase-btn ma-0 px-2" style="min-width: 0px;">
                      {{ transactions.length }}
                    </v-btn>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-tabs-window-item>
          <v-tabs-window-item value="transactions">
            <v-data-table :items="transactions" @click:row="handleClick" density="comfortable">
              <template v-slot:item.txHash="{ item }">
                <render-tx-hash v-if="item && item.txHash" :txHash="item.txHash" shortTxHash noXPadding></render-tx-hash>
              </template>
              <template v-slot:item.from="{ item }">
                <render-address v-if="item && item.from" :address="item.from" shortAddress noXPadding></render-address>
              </template>
              <template v-slot:item.to="{ item }">
                <render-address v-if="item && item.to" :address="item.to" shortAddress noXPadding></render-address>
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
      return store.getters['web3/blockNumber'];
    },
    explorer() {
      return store.getters['web3/explorer'];
    },
    timestampString() {
      return this.block && this.formatTimestamp(this.block.timestamp) || null;
    },
    gasLimit() {
      return this.block && ethers.BigNumber.from(this.block.gasLimit).toString() || null;
    },
    gasUsed() {
      return this.block && this.block.gasUsed != null && ethers.BigNumber.from(this.block.gasUsed).toString() || null;
    },
    gasPercentage() {
      return this.block && this.block.gasUsed != null && ethers.BigNumber.from(this.block.gasUsed).mul(100).div(this.block.gasLimit) || null;
    },
    extraData() {
      try {
        return this.block && ethers.utils.toUtf8String(this.block.extraData) || null;
      } catch (e) {
      }
      return this.block.extraData;
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
      // console.log(now() + " Block - computed.transactions - results: " + JSON.stringify(results, null, 2));
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
        if (!store.getters['web3/connected'] || !window.ethereum) {
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
