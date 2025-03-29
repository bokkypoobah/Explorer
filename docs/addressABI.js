const AddressABI = {
  template: `
    <div>
      <v-card>
        <v-card-text>

          <!-- <div class="d-flex flex-row"> -->
          <v-row>
            <v-col cols="2">
            <v-tabs v-model="tab" color="primary" direction="vertical">
              <v-tab prepend-icon="mdi-code-json" text="ABI" value="abi"></v-tab>
              <v-tab prepend-icon="mdi-function" text="Functions" value="functions"></v-tab>
              <v-tab prepend-icon="mdi-math-log" text="Events" value="events"></v-tab>
            </v-tabs>
            </v-col>
            <v-col cols="10">
            <v-tabs-window v-model="tab">
              <v-tabs-window-item value="abi">
                <v-textarea v-model="abi" :rules="jsonRules" label="ABI" rows="10">
                </v-textarea>
                <v-btn @click="importABIFromEtherscan();" class="ms-2 mt-0 mb-2" text>Import ABI From Etherscan
                </v-btn>
              </v-tabs-window-item>
              <v-tabs-window-item value="functions">
                <v-data-table :items="functionsList" :headers="functionsHeaders" @click:row="handleFunctionsClick" density="compact">
                </v-data-table>
              </v-tabs-window-item>
              <v-tabs-window-item value="events">
                <v-data-table :items="eventsList" :headers="eventsHeaders" @click:row="handleEventsClick" density="compact">
                </v-data-table>
              </v-tabs-window-item>
            </v-tabs-window>
            </v=col>
          </v-row>
          <!-- </div> -->
          <!-- <h3 class="ms-2 mt-2">ABI</h3>
          <h3 class="ms-2 mt-5">Functions</h3>
          <h3 class="ms-2 mt-5">Events</h3> -->
        </v-card-text>
      </v-card>
    </div>
  `,
  props: ['inputAddress'],
  data: function () {
    return {
      // address: null, // TODO: Delete
      // abi: null,
      tab: null,
      jsonRules: [
        (v) => (v || '').length > 0 || 'ABI is required',
        (v) => {
          try {
            new ethers.utils.Interface(v);
            return true;
          } catch (e) {
            return 'Invalid ABI';
          }
        },
      ],
      _timerId: null,
      functionsHeaders: [
        { title: 'Method Id', value: 'methodId', align: 'end', sortable: true },
        { title: 'Function', value: 'fullName', sortable: true },
      ],
      eventsHeaders: [
        { title: 'Signature', value: 'signature', align: 'end', sortable: true },
        { title: 'Event', value: 'fullName', sortable: true },
      ],
    };
  },
  computed: {
    address() {
      return store.getters['address/address'];
    },
    info() {
      return store.getters['address/info'];
    },
    abi: {
      get: function() {
        // return store.getters['address/info'].abi;
        const addressInfo = store.getters["addresses/getAddressInfo"](this.address);
        return addressInfo.abi;
      },
      set: function(abi) {
        console.log(now() + " AddressABI - computed.abi.set - abi: " + abi);
        clearTimeout(this._timerId);
        const t = this;
        this._timerId = setTimeout(() => {
          console.log(now() + " AddressABI - computed.abi.set - DEBOUNCED abi: " + abi);
          store.dispatch('addresses/updateABI', { address: t.address, abi });
        }, 1000)
      },
    },
    functions() {
      return store.getters['address/functions'];
    },
    events() {
      return store.getters['address/events'];
    },
    functionsList() {
      const results = [];
      for (const [methodId, functionData] of Object.entries(this.functions)) {
        results.push({ methodId, ...functionData });
      }
      return results;
    },
    eventsList() {
      const results = [];
      for (const [signature, eventData] of Object.entries(this.events)) {
        results.push({ signature, ...eventData });
      }
      return results;
    },
  },
  methods: {
    handleFunctionsClick(event, row) {
      console.log(now() + " AddressABI - handleFunctionsClick - event: " + JSON.stringify(event, null, 2) + ", row: " + JSON.stringify(row, null, 2));
    },
    handleEventsClick(event, row) {
      console.log(now() + " AddressABI - handleEventsClick - event: " + JSON.stringify(event, null, 2) + ", row: " + JSON.stringify(row, null, 2));
    },
    async importABIFromEtherscan() {
      console.log(now() + " AddressABI - methods.importABIFromEtherscan");
      const chainId = store.getters["chainId"];
      // const db = new Dexie(this.dbInfo.name);
      // db.version(this.dbInfo.version).stores(this.dbInfo.schemaDefinition);
      const url = "https://api.etherscan.io/v2/api?chainid=" + chainId + "&module=contract&action=getabi&address=" + (this.info.implementation ? this.info.implementation : this.info.address) + "&apikey=" + store.getters['config'].etherscanAPIKey;
      console.log(now() + " AddressABI - url: " + url);
      const data = await fetch(url).then(response => response.json());
      console.log(now() + " AddressABI - data: " + JSON.stringify(data, null, 2));
      if (data && data.status == 1 && data.message == "OK") {
        const abi = JSON.parse(data.result);
        console.log(now() + " AddressABI - abi: " + JSON.stringify(abi, null, 2).substring(0, 1000) + "...");
        store.dispatch('addresses/updateABI', { address: this.info.address, abi: JSON.stringify(abi) });
      //   console.log(now() + " AddressABI - methods.importABIFromEtherscan - this.info: " + JSON.stringify(this.info).substring(0, 1000) + "...");
      //   // Vue.set(this.info, 'abi', abi);
      //   // await dbSaveCacheData(db, this.info.address + "_" + this.chainId + "_contract", this.info);
      }
      // db.close();
    },
  },
  beforeCreate() {
    console.log(now() + " AddressABI - beforeCreate");
	},
  mounted() {
    console.log(now() + " AddressABI - mounted");
    const t = this;
    setTimeout(function() {
      store.dispatch('address/loadAddress', t.inputAddress);
    }, 1000);
	},
  unmounted() {
    console.log(now() + " AddressABI - unmounted");
	},
  destroyed() {
    console.log(now() + " AddressABI - destroyed");
	},
};
