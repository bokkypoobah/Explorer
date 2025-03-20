const Config = {
  template: `
    <div class="m-0 p-0">
      <b-card no-body no-header class="border-0" header-class="p-1">
        <b-card no-body no-header bg-variant="light" class="m-1 p-1">
          <b-form-group label-cols-lg="2" label="API" label-size="md" label-class="font-weight-bold pt-0" class="mt-3 mb-0">
            <b-form-group label="Etherscan API Key:" label-for="etherscan-apikey" label-size="sm" label-cols-sm="2" label-align-sm="right" description="This key is stored in your local browser storage and is sent with Etherscan API requests. Will be used to import transactions without events (EOA to EOA) and internal transactions" class="mx-0 my-1 p-0">
              <b-form-input type="text" size="sm" id="etherscan-apikey" v-model="etherscanAPIKey" placeholder="See https://docs.etherscan.io/ to obtain an API key" class="w-50"></b-form-input>
            </b-form-group>
          </b-form-group>
          <b-form-group label-cols-lg="2" label="Chains" label-size="md" label-class="font-weight-bold pt-0" class="mt-3 mb-0">
            <b-form-group label="Chains:" label-for="config-chains" label-size="sm" label-cols-sm="2" label-align-sm="right"class="mx-0 my-1 p-0">
              <div class="d-flex flex-wrap m-0 mx-0 p-1 px-1 bg-white">
                <div class="mt-0 flex-grow-1">
                </div>
                <div class="mt-0 pl-1">
                  <font size="-2" v-b-popover.hover.bottom="'# Chains'">{{ chains.length }}</font>
                </div>
                <div class="mt-0 pl-1">
                  <b-pagination size="sm" v-model="chainsTable.currentPage" :total-rows="chains.length" :per-page="chainsTable.pageSize" style="height: 0;"></b-pagination>
                </div>
                <div class="mt-0 pl-1">
                  <b-form-select size="sm" v-model="chainsTable.pageSize" :options="pageSizes" v-b-popover.hover.bottom="'Yeah. Page size'"></b-form-select>
                </div>
              </div>
              <b-table small fixed striped responsive hover :fields="chainsFields" :items="pagedFilteredSortedChains" show-empty empty-html="zzz" head-variant="light" class="mx-0 my-0 p-0">
                <template #cell(index)="data">
                  <font size="-1" class="text-muted">{{ parseInt(data.index) + ((chainsTable.currentPage - 1) * chainsTable.pageSize) + 1 }}</font>
                </template>
              </b-table>
            </b-form-group>
          </b-form-group>
        </b-card>
      </b-card>
    </div>
  `,
  data: function () {
    return {
      chainsTable: {
        filter: null,
        currentPage: 1,
        pageSize: 10,
        sortOption: "chainidasc",
      },
      pageSizes: [
        { value: 10, text: '10' },
        { value: 20, text: '20' },
      ],
      chainsFields: [
        { key: 'index', label: '#', sortable: false, thStyle: 'width: 5%;', tdClass: 'text-truncate' },
        { key: 'chainId', label: 'Chain Id', sortable: false, thStyle: 'width: 10%;', tdClass: 'text-truncate' },
        { key: 'name', label: 'Name', sortable: false, thStyle: 'width: 15%;', tdClass: 'text-truncate' },
        { key: 'explorer', label: 'Explorer', sortable: false, thStyle: 'width: 20%;', tdClass: 'text-truncate' },
        { key: 'api', label: 'API', sortable: false, thStyle: 'width: 40%;', tdClass: 'text-truncate' },
      ],
    }
  },
  computed: {
    etherscanAPIKey: {
      get: function() {
        return store.getters['settings'].etherscanAPIKey;
      },
      set: function(etherscanAPIKey) {
        store.dispatch('setEtherscanAPIKey', etherscanAPIKey);
      },
    },
    chains() {
      const results = [];
      for (const [chainId, chainData] of Object.entries(store.getters['settings'].chains)) {
        results.push({ chainId, ...chainData });
      }
      return results;
    },
    filteredSortedChains() {
      // TODO: filter & sort
      return this.chains;
    },
    pagedFilteredSortedChains() {
      return this.filteredSortedChains.slice((this.chainsTable.currentPage - 1) * this.chainsTable.pageSize, this.chainsTable.currentPage * this.chainsTable.pageSize);
    },
  },
  methods: {
  },
  beforeDestroy() {
    console.log(now() + " Config - beforeDestroy()");
  },
  mounted() {
    console.log(now() + " Config - mounted() $route: " + JSON.stringify(this.$route.params));
  },
  destroyed() {
    this.reschedule = false;
  },
};

const configModule = {
  namespaced: true,
  state: {
  },
  getters: {
  },
  mutations: {
  },
  actions: {
  },
};
