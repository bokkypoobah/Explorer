const TransactionsLatest = {
  template: `
    <div>
      <v-container fluid class="pa-1">
        <v-data-table :items="transactionsList" :headers="transactionsHeaders" @click:row="handleTransactionsClick" density="comfortable" style="max-width: 100%;">
          <template v-slot:item.blockNumber="{ item }">
            <render-block-number v-if="item && item.blockNumber" :block="item.blockNumber" noXPadding></render-block-number>
          </template>
          <template v-slot:item.hash="{ item }">
            <render-tx-hash v-if="item && item.hash" :txHash="item.hash" shortTxHash noXPadding></render-tx-hash>
          </template>
          <template v-slot:item.from="{ item }">
            <render-address v-if="item && item.from" :address="item.from" shortAddress noXPadding></render-address>
          </template>
          <template v-slot:item.to="{ item }">
            <render-address v-if="item && item.to" :address="item.to" shortAddress noXPadding></render-address>
          </template>
          <template v-slot:item.value="{ item }">
            {{ formatETH(item.value) }}
          </template>
        </v-data-table>
        <!-- Transactions Latest -->
        <!-- <v-data-table :items="blocksList" :headers="blocksHeaders" @click:row="handleBlocksClick" density="compact">
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
        </v-data-table> -->
      </v-container>
    </div>
  `,
  props: ['inputAddress'],
  data: function () {
    return {
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
    explorer() {
      return store.getters['explorer'];
    },
    transactionsList() {
      return store.getters['blocks/transactionsList'];
    },
  },
  methods: {
    handleTransactionsClick(tx, row) {
      console.log(now() + " TransactionsLatest - methods.handleTransactionsClick - tx: " + JSON.stringify(tx, null, 2) + ", row: " + JSON.stringify(row, null, 2));
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
      }
      return null;
    },
    copyToClipboard(str) {
      navigator.clipboard.writeText(str);
    },
  },
  beforeCreate() {
    console.log(now() + " TransactionsLatest - beforeCreate");
	},
  mounted() {
    console.log(now() + " TransactionsLatest - mounted");
    // const t = this;
    // setTimeout(function() {
    //   store.dispatch('address/loadAddress', { inputAddress: t.inputAddress, forceUpdate: false });
    // }, 1000);
	},
  unmounted() {
    console.log(now() + " TransactionsLatest - unmounted");
	},
  destroyed() {
    console.log(now() + " TransactionsLatest - destroyed");
	},
};
