const Config = {
  template: `
    <div class="m-0 p-0">
      <b-card no-body no-header class="border-0" header-class="p-1">
        <b-card no-body no-header bg-variant="light" class="m-1 p-1">
          <b-form-group label-cols-lg="1" label="API" label-size="md" label-class="font-weight-bold pt-0" class="mt-3 mb-0">
            <b-form-group label="Etherscan API Key:" label-for="etherscan-apikey" label-size="sm" label-cols-sm="2" label-align-sm="right" description="This key is stored in your local browser storage and is sent with Etherscan API requests. Will be used to import transactions without events (EOA to EOA) and internal transactions" class="mx-0 my-1 p-0">
              <b-form-input type="text" size="sm" id="etherscan-apikey" v-model="etherscanAPIKey" placeholder="See https://docs.etherscan.io/ to obtain an API key" class="w-50"></b-form-input>
            </b-form-group>
          </b-form-group>
          <b-form-group label-cols-lg="1" label="Chains" label-size="md" label-class="font-weight-bold pt-0" class="mt-3 mb-0">
            <b-form-group label="Chains:" label-for="config-chains" label-size="sm" label-cols-sm="2" label-align-sm="right"class="mx-0 my-1 p-0">
              <div class="d-flex flex-wrap m-0 mx-0 p-1 px-1 bg-white">
                <div class="mt-0 pr-1">
                  <b-form-input type="text" size="sm" v-model.trim="chainsTable.filter" debounce="600" v-b-popover.hover.top="'Regex filter by chainId or name'" placeholder="🔍 chainId or name"></b-form-input>
                </div>
                <div class="mt-0 flex-grow-1">
                </div>
                <div class="mt-0 pr-1">
                  <b-button size="sm" @click="importChainlistFromEtherscan();" variant="link" v-b-popover.hover.top="'Import from https://api.etherscan.io/v2/chainlist'"><b-icon-cloud-download shift-v="+1" font-scale="1.2"></b-icon-cloud-download></b-button>
                </div>
                <div class="mt-0 flex-grow-1">
                </div>
                <div class="mt-0 pl-1">
                  <font size="-2" v-b-popover.hover.bottom="'# Chains'">{{ chains.length }}</font>
                </div>
                <div class="mt-0 pl-1" style="max-width: 8.0rem;">
                  <b-form-select size="sm" v-model="chainsTable.sortOption" :options="sortOptions" v-b-popover.hover.top="'Yeah. Sort'"></b-form-select>
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
      sortOptions: [
        { value: 'chainidasc', text: '▲ Chain Id' },
        { value: 'chainiddsc', text: '▼ Chain Id' },
        { value: 'nameasc', text: '▲ Name, ▲ Chain Id' },
        { value: 'namedsc', text: '▼ Name, ▲ Chain Id' },
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
      const results = [];
      let regex = null;
      if (this.chainsTable.filter != null && this.chainsTable.filter.length > 0) {
        try {
          regex = new RegExp(this.chainsTable.filter, 'i');
        } catch (e) {
          console.log(now() + " Config - filteredSortedChains - regex error: " + e.message);
          regex = new RegExp(/thequickbrowndogjumpsoverthelazyfox/, 'i');
        }
      }
      for (const item of this.chains) {
        let include = true;
        if (regex) {
          if (!(regex.test(item.chainId)) && !(regex.test(item.name))) {
            include = false;
          }
        }
        if (include) {
          results.push(item);
        }
      }
      if (this.chainsTable.sortOption == 'chainidasc') {
        results.sort((a, b) => {
          return a.chainId - b.chainId;
        });
      } else if (this.chainsTable.sortOption == 'chainiddsc') {
        results.sort((a, b) => {
          return b.chainId - a.chainId;
        });
      } else if (this.chainsTable.sortOption == 'nameasc') {
        results.sort((a, b) => {
          if (('' + a.name).localeCompare(b.name) == 0) {
            return a.chainId - b.chainId;
          } else {
            return ('' + a.name).localeCompare(b.name);
          }
        });
      } else if (this.chainsTable.sortOption == 'namedsc') {
        results.sort((a, b) => {
          if (('' + a.name).localeCompare(b.name) == 0) {
            return a.chainId - b.chainId;
          } else {
            return ('' + b.name).localeCompare(a.name);
          }
        });
      }
      return results;
    },
    pagedFilteredSortedChains() {
      return this.filteredSortedChains.slice((this.chainsTable.currentPage - 1) * this.chainsTable.pageSize, this.chainsTable.currentPage * this.chainsTable.pageSize);
    },
  },
  methods: {
    async importChainlistFromEtherscan() {
      console.log(now() + " Config - methods.importChainlistFromEtherscan()");
      const url = "https://api.etherscan.io/v2/chainlist";
      const data = await fetch(url).then(response => response.json());
      if (data && data.result) {
        for (const item of data.result) {
          if (!(item.chainid in store.getters['settings'].chains)) {
            store.dispatch('addChain', {
              chainId: item.chainid,
              name: item.chainname,
              explorer: item.blockexplorer,
              api: item.apiurl,
            });
          }
        }
      }
    },
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
