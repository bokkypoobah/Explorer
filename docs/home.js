const Home = {
  template: `
    <div>
      <v-container fluid class="pa-1">
        <v-toolbar density="compact" class="mt-1">
          <v-spacer></v-spacer>
          <v-tabs v-model="settings.tab" @update:modelValue="saveSettings();" right color="primary">
            <v-tab prepend-icon="mdi-cube-outline" text="Latest Blocks" value="blocks" class="lowercase-btn"></v-tab>
            <v-tab prepend-icon="mdi-format-list-bulleted" text="Latest Transactions" value="transactions" class="lowercase-btn"></v-tab>
          </v-tabs>
        </v-toolbar>



        <v-card>
          <v-card-text>
            <v-tabs-window v-model="settings.tab">
              <v-tabs-window-item value="blocks">
                <h4>Latest {{ latestCount }} Blocks</h4>
                <v-data-table :items="blocksList" :headers="blocksHeaders" @click:row="handleBlocksClick" density="compact">
                  <template v-slot:item.timestamp="{ item }">
                    {{ formatTimestamp(item.timestamp) }}
                  </template>
                  <template v-slot:item.number="{ item }">
                    <v-btn :href="'#/block/' + item.number" color="primary" variant="text" class="pa-0">{{ commify0(item.number) }}</v-btn>
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
                </v-data-table>
              </v-tabs-window-item>
              <v-tabs-window-item value="transactions">
                <h4>Transactions From Latest {{ latestCount }} Blocks</h4>
                <v-data-table :items="transactionsList" :headers="transactionsHeaders" @click:row="handleTransactionsClick" density="compact" style="max-width: 100%;">
                  <template v-slot:item.blockNumber="{ item }">
                    <v-btn :href="'#/block/' + item.blockNumber" color="primary" variant="text" class="pa-0">{{ commify0(item.blockNumber) }}</v-btn>
                  </template>
                  <template v-slot:item.hash="{ item }">
                    <v-btn :href="'#/transaction/' + item.hash" color="primary" variant="text" class="lowercase-btn pa-0">{{ item.hash.substring(0, 20) + "..." }}</v-btn>
                    <!-- <span class="text-blue-grey-lighten-4">My Address</span> -->
                  </template>
                  <template v-slot:item.from="{ item }">
                    <v-btn :href="'#/address/' + item.from" color="primary" variant="text" class="lowercase-btn pa-0">{{ item.from.substring(0, 10) + '...' + item.from.slice(-8) }}</v-btn>
                  </template>
                  <template v-slot:item.to="{ item }">
                    <v-btn v-if="item.to" :href="'#/address/' + item.to" color="primary" variant="text" class="lowercase-btn pa-0">{{ item.to.substring(0, 10) + '...' + item.to.slice(-8) }}</v-btn>
                  </template>
                  <template v-slot:item.value="{ item }">
                    {{ formatETH(item.value) }}
                  </template>
                </v-data-table>
              </v-tabs-window-item>
            </v-tabs-window>
          </v-card-text>
        </v-card>
      </v-container>
    </div>
  `,
  data: function () {
    return {
      initialised: false,
      settings: {
        tab: null,
        version: 0,
      },
      blocksHeaders: [
        { title: 'Block', value: 'number', align: 'end', sortable: true },
        { title: 'Timestamp', value: 'timestamp', sortable: true },
        { title: 'Miner', value: 'miner', sortable: true },
        { title: 'Txs', value: 'txCount', sortable: true },
        { title: 'Gas Used', value: 'gasUsed', sortable: true },
        { title: 'Gas Limit', value: 'gasLimit', sortable: true },
        { title: '%', value: 'percent', sortable: true },
      ],
      transactionsHeaders: [
        { title: 'Block', value: 'blockNumber', align: 'end', sortable: true, width: "10%" },
        { title: 'Tx Index', value: 'transactionIndex', align: 'end', sortable: true, width: "10%" },
        { title: 'Hash', value: 'hash', sortable: true, width: "30%" },
        { title: 'From', value: 'from', sortable: true, width: "20%" },
        { title: 'To', value: 'to', sortable: true, width: "20%" },
        { title: 'Value', value: 'value', sortable: true, width: "15%" },
      ],
    };
  },
  computed: {
    latestCount() {
      return store.getters['blocks/latestCount'];
    },
    blocksList() {
      return store.getters['blocks/blocksList'];
    },
    transactionsList() {
      return store.getters['blocks/transactionsList'];
    },
  },
  methods: {
    handleBlocksClick(block, row) {
      console.log(now() + " Home - methods.handleBlocksClick - block: " + JSON.stringify(block, null, 2) + ", row: " + JSON.stringify(row, null, 2));
      this.$router.push({ name: 'Block', params: { inputBlockNumber: row.item.number } });
    },
    handleTransactionsClick(tx, row) {
      console.log(now() + " Home - methods.handleTransactionsClick - tx: " + JSON.stringify(tx, null, 2) + ", row: " + JSON.stringify(row, null, 2));
      this.$router.push({ name: 'Transaction', params: { inputTxHash: row.item.hash } });
      store.dispatch('transaction/loadTransaction', row.item.hash);
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
        // return moment.unix(ts).format("HH:mm:ss");
      }
      return null;
    },
    saveSettings() {
      // console.log(now() + " Home - methods.saveSettings - settings: " + JSON.stringify(this.settings, null, 2));
      if (this.initialised) {
        localStorage.explorerHomeSettings = JSON.stringify(this.settings);
      }
    },
  },
  beforeCreate() {
    console.log(now() + " Home - beforeCreate");
	},
  mounted() {
    console.log(now() + " Home - mounted");
    if ('explorerHomeSettings' in localStorage) {
      const tempSettings = JSON.parse(localStorage.explorerHomeSettings);
      console.log(now() + " Home - mounted - tempSettings: " + JSON.stringify(tempSettings));
      if ('version' in tempSettings && tempSettings.version == this.settings.version) {
        this.settings = tempSettings;
      }
    }
    this.initialised = true;
	},
  destroyed() {
    console.log(now() + " Home - destroyed");
	},
};
