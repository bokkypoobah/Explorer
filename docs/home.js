const Home = {
  template: `
    <div>
      <v-card>
        <v-card-text>
          <v-row>
            <v-col cols="6">
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
            </v-col>
            <v-col cols="6">
              <h4>Transactions From Latest {{ latestCount }} Blocks</h4>
            </v-col>
          </v-row>
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
    };
  },
  computed: {
    latestCount() {
      return store.getters['blocks/latestCount'];
    },
    blocksList() {
      return store.getters['blocks/blocksList'];
    },
  },
  methods: {
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
