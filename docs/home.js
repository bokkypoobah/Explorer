const Home = {
  template: `
    <div>
      <v-card>
        <v-card-text>
          <h4>Latest {{ latestCount }} Blocks</h4>
          <!-- <v-data-table :items="blocksList" :headers="blocksHeaders" @click:row="handleBlocksClick" density="compact"> -->
          <v-data-table :items="blocksList" :headers="blocksHeaders" density="compact">
            <template v-slot:item.timestamp="{ item }">
              {{ formatTimestamp(item.timestamp) }}
            </template>
            <template v-slot:item.number="{ item }">
              <a :href="'#/block/' + item.number">{{ item.number }}</a>
            </template>
            <template v-slot:item.miner="{ item }">
              <a :href="'#/address/' + item.miner">{{ item.miner }}</a>
            </template>
            <template v-slot:item.txs="{ item }">
              {{ item.transactions.length }}
            </template>
          </v-data-table>
          <h4>Transactions From Latest {{ latestCount }} Blocks</h4>
          <v-data-table :items="transactionsList" :headers="transactionsHeaders" density="compact" style="max-width: 100%;">
            <template v-slot:item.hash="{ item }">
              <a :href="'#/transaction/' + item.hash" class="truncate">{{ item.hash.substring(0, 20) + '...' }}</a>
            </template>
            <template v-slot:item.from="{ item }">
              <a :href="'#/address/' + item.from" class="truncate">{{ item.from.substring(0, 10) + '...' + item.from.slice(-8) }}</a>
            </template>
            <template v-slot:item.to="{ item }">
              <a :href="'#/address/' + item.to" class="truncate">{{ item.to.substring(0, 10) + '...' + item.to.slice(-8) }}</a>
            </template>
            <template v-slot:item.value="{ item }">
              {{ formatETH(item.value) }}
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </div>
  `,
  data: function () {
    return {
      blocksHeaders: [
        { title: 'Block', value: 'number', align: 'end', sortable: true },
        { title: 'Timestamp', value: 'timestamp', sortable: true },
        { title: 'Miner', value: 'miner', sortable: true },
        { title: 'Txs', value: 'txs', sortable: true },
      ],
      transactionsHeaders: [
        { title: 'Block#', value: 'blockNumber', align: 'end', sortable: true, width: "15%" },
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
    formatETH(e) {
      if (e) {
        return ethers.utils.formatEther(e).replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
      }
      return null;
    },
    formatTimestamp(ts) {
      if (ts != null) {
        // return moment.unix(ts).format("YYYY-MM-DD HH:mm:ss");
        return moment.unix(ts).format("HH:mm:ss");
      }
      return null;
    },
  },
  beforeCreate() {
    console.log(now() + " Home - beforeCreate");
	},
  mounted() {
    console.log(now() + " Home - mounted");
	},
  destroyed() {
    console.log(now() + " Home - destroyed");
	},
};
