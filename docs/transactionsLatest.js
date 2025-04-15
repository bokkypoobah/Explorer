const TransactionsLatest = {
  template: `
    <div>
      <v-container fluid class="pa-1">
        <v-data-table :items="transactionsList" :headers="transactionsHeaders" @click:row="handleTransactionsClick" density="comfortable" style="max-width: 100%;">
          <template v-slot:item.blockNumber="{ item }">
            <v-menu location="bottom">
              <template v-slot:activator="{ props }">
                <v-btn color="primary" dark v-bind="props" variant="text" class="ma-0 pa-0 lowercase-btn">
                  {{ commify0(item.blockNumber) }}
                </v-btn>
              </template>
              <v-list>
                <v-list-subheader>{{ commify0(item.blockNumber) }}</v-list-subheader>
                <v-list-item :href="'#/block/' + item.blockNumber">
                  <template v-slot:prepend>
                    <v-icon>mdi-arrow-right-bold-outline</v-icon>
                  </template>
                  <v-list-item-title>View</v-list-item-title>
                </v-list-item>
                <v-list-item @click="copyToClipboard(item.blockNumber);">
                  <template v-slot:prepend>
                    <v-icon>mdi-content-copy</v-icon>
                  </template>
                  <v-list-item-title>Copy block number to clipboard</v-list-item-title>
                </v-list-item>
                <v-list-item :href="explorer + 'block/' + item.blockNumber" target="_blank">
                  <template v-slot:prepend>
                    <v-icon>mdi-link-variant</v-icon>
                  </template>
                  <v-list-item-title>View in explorer</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </template>
          <template v-slot:item.hash="{ item }">
            <v-menu location="bottom">
              <template v-slot:activator="{ props }">
                <v-btn color="primary" dark v-bind="props" variant="text" class="ma-0 pa-0 lowercase-btn">
                  {{ item.hash.substring(0, 20) + "..." }}
                </v-btn>
              </template>
              <v-list>
                <v-list-subheader>{{ item.hash }}</v-list-subheader>
                <v-list-item :href="'#/transaction/' + item.hash">
                  <template v-slot:prepend>
                    <v-icon>mdi-arrow-right-bold-outline</v-icon>
                  </template>
                  <v-list-item-title>View</v-list-item-title>
                </v-list-item>
                <v-list-item @click="copyToClipboard(item.hash);">
                  <template v-slot:prepend>
                    <v-icon>mdi-content-copy</v-icon>
                  </template>
                  <v-list-item-title>Copy transaction hash to clipboard</v-list-item-title>
                </v-list-item>
                <v-list-item :href="explorer + 'tx/' + item.hash" target="_blank">
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
