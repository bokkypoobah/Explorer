// TODO: Unused - to delete
const BlocksLatest = {
  template: `
    <div>
      <v-container fluid class="pa-1">
        <v-data-table :items="blocksList" :headers="blocksHeaders" @click:row="handleBlocksClick" density="comfortable">
          <template v-slot:item.number="{ item }">
            <v-btn :href="'#/block/' + item.number" color="primary" variant="text" class="pa-0">{{ commify0(item.number) }}</v-btn>
          </template>
          <template v-slot:item.timestamp="{ item }">
            {{ formatTimestamp(item.timestamp) }}
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
      </v-container>
    </div>
  `,
  props: ['inputAddress'],
  data: function () {
    return {
      blocksHeaders: [
        { title: 'Block', value: 'number', align: 'end', sortable: true },
        { title: 'Timestamp', value: 'timestamp', sortable: true },
        { title: 'Miner', value: 'miner', sortable: true },
        { title: 'Txs', value: 'txCount', align: 'end', sortable: true },
        { title: 'Gas Used', value: 'gasUsed', align: 'end', sortable: true },
        { title: 'Gas Limit', value: 'gasLimit', align: 'end', sortable: true },
        { title: '%', value: 'percent', sortable: true },
      ],
    };
  },
  computed: {
    blocksList() {
      return store.getters['blocks/blocksList'];
    },
  },
  methods: {
    handleBlocksClick(block, row) {
      console.log(now() + " BlocksLatest - methods.handleBlocksClick - block: " + JSON.stringify(block, null, 2) + ", row: " + JSON.stringify(row, null, 2));
      this.$router.push({ name: 'Block', params: { inputBlockNumber: row.item.number } });
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
  },
  beforeCreate() {
    console.log(now() + " BlocksLatest - beforeCreate");
	},
  mounted() {
    console.log(now() + " BlocksLatest - mounted");
    // const t = this;
    // setTimeout(function() {
    //   store.dispatch('address/loadAddress', { inputAddress: t.inputAddress, forceUpdate: false });
    // }, 1000);
	},
  unmounted() {
    console.log(now() + " BlocksLatest - unmounted");
	},
  destroyed() {
    console.log(now() + " BlocksLatest - destroyed");
	},
};
