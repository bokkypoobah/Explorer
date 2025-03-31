const AddressContract = {
  template: `
    <div>
      <v-card>
        <v-card-text>
          <div v-if="!info || info.type == 'eoa'">
            Externally Owned Accounts don't have ABIs
          </div>
          <div v-if="info && info.type != 'eoa'">
            <v-row>
              <v-col cols="2">
                <v-tabs v-model="settings.tab" @update:modelValue="saveSettings();" color="primary" direction="vertical">
                  <v-tab prepend-icon="mdi-code-json" text="ABI" value="abi" class="lowercase-btn"></v-tab>
                  <v-tab prepend-icon="mdi-function" text="Functions" value="functions" class="lowercase-btn"></v-tab>
                  <v-tab prepend-icon="mdi-math-log" text="Events" value="events" class="lowercase-btn"></v-tab>
                  <v-tab prepend-icon="mdi-text-box" text="Source Code" value="sourcecode" class="lowercase-btn"></v-tab>
                </v-tabs>
              </v-col>
              <v-col cols="10">
                <div v-if="info && info.type == 'safe'" class="mb-3">
                  NOTE: The ABI and source code below is from the Safe v{{ info.version }} implementation at {{ info.implementation }}, used by this Gnosis Safe wallet at {{ info.address }}.
                </div>
                <v-tabs-window v-model="settings.tab">
                  <v-tabs-window-item value="abi">
                    <v-textarea v-model="abi" :rules="jsonRules" label="ABI" rows="10">
                    </v-textarea>
                    <v-btn @click="importABIFromEtherscan();" class="ms-2 mt-0 mb-2" style="text-transform: none !important;" text>Import ABI From Etherscan
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
                  <v-tabs-window-item value="sourcecode">
                    <div v-for="(item, itemIndex) of sourceCode">
                      <!-- {{ item }} -->
                      <v-textarea v-model="item.sourceCode" :label="item.name" rows="10">
                      </v-textarea>
                    </div>
                    <v-btn @click="importSourceCodeFromEtherscan();" class="ms-2 mt-0 mb-2" style="text-transform: none !important;" text>Import Source Code From Etherscan</v-btn>
                    <v-btn @click="importSourceCodeFromSourcify();" class="ms-2 mt-0 mb-2" style="text-transform: none !important;" text>Import Source Code From Sourcify</v-btn>
                  </v-tabs-window-item>
                </v-tabs-window>
              </v-col>
            </v-row>
          </div>
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
      initialised: false,
      settings: {
        tab: null,
        version: 0,
      },
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
        console.log(now() + " AddressContract - computed.abi.set - abi: " + abi);
        clearTimeout(this._timerId);
        const t = this;
        this._timerId = setTimeout(() => {
          console.log(now() + " AddressContract - computed.abi.set - DEBOUNCED abi: " + abi);
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
    sourceCode() {
      console.log(now() + " AddressContract - sourceCode");
      const results = store.getters["addresses/getSourceCode"](this.address);
      // console.log(now() + " AddressContract - sourceCode - results: " + JSON.stringify(results));
      return results;
    },
  },
  methods: {
    handleFunctionsClick(event, row) {
      console.log(now() + " AddressContract - methods.handleFunctionsClick - event: " + JSON.stringify(event, null, 2) + ", row: " + JSON.stringify(row, null, 2));
    },
    handleEventsClick(event, row) {
      console.log(now() + " AddressContract - methods.handleEventsClick - event: " + JSON.stringify(event, null, 2) + ", row: " + JSON.stringify(row, null, 2));
    },
    async importABIFromEtherscan() {
      console.log(now() + " AddressContract - methods.importABIFromEtherscan");
      const chainId = store.getters["chainId"];
      const url = "https://api.etherscan.io/v2/api?chainid=" + chainId + "&module=contract&action=getabi&address=" + (this.info.implementation ? this.info.implementation : this.info.address) + "&apikey=" + store.getters['config'].etherscanAPIKey;
      console.log(now() + " AddressContract - methods.importABIFromEtherscan - url: " + url);
      const data = await fetch(url).then(response => response.json());
      // console.log(now() + " AddressContract - data: " + JSON.stringify(data, null, 2));
      if (data && data.status == 1 && data.message == "OK") {
        const abi = JSON.parse(data.result);
        console.log(now() + " AddressContract - methods.importABIFromEtherscan - abi: " + JSON.stringify(abi, null, 2).substring(0, 1000) + "...");
        store.dispatch('addresses/updateABI', { address: this.info.address, abi: JSON.stringify(abi) });
      }
    },
    async importSourceCodeFromEtherscan() {
      console.log(now() + " AddressContract - methods.importSourceCodeFromEtherscan");
      const chainId = store.getters["chainId"];
      const url = "https://api.etherscan.io/v2/api?chainid=" + chainId + "&module=contract&action=getsourcecode&address=" + (this.info.implementation ? this.info.implementation : this.info.address) + "&apikey=" + store.getters['config'].etherscanAPIKey;
      console.log(now() + " AddressContract - methods.importSourceCodeFromEtherscan - url: " + url);
      const data = await fetch(url).then(response => response.json());
      // console.log(now() + " AddressContract - methods.importSourceCodeFromEtherscan - data: " + JSON.stringify(data, null, 2));
      if (data && data.status == 1 && data.message == "OK") {
        console.log(now() + " AddressContract - methods.importSourceCodeFromEtherscan - data.result: " + JSON.stringify(data.result, null, 2));
        store.dispatch('addresses/updateSourceCode', { address: this.info.address, sourceCode: data.result[0] });
      }
    },
    async importSourceCodeFromSourcify() {
      console.log(now() + " AddressContract - methods.importSourceCodeFromSourcify");
      const chainId = store.getters["chainId"];
      // const url = "https://sourcify.dev/server/v2/contract/" + chainId + "/" + (this.info.implementation ? this.info.implementation : this.info.address) + "?fields=all";
      const url = "https://sourcify.dev/server/v2/contract/" + chainId + "/" + (this.info.implementation ? this.info.implementation : this.info.address) + "?omit=creationBytecode,runtimeBytecode,abi,metadata,sources";
      console.log(now() + " AddressContract - methods.importSourceCodeFromSourcify - url: " + url);
      const data = await fetch(url).then(response => response.json());
      console.log(now() + " AddressContrac - methods.importSourceCodeFromSourcify - data: " + JSON.stringify(data, null, 2));
      if (data && data.matchId && (data.runtimeMatch == "match" || data.runtimeMatch == "exact_match")) {
        // console.log(now() + " AddressContract - methods.importSourceCodeFromSourcify - data.result: " + JSON.stringify(data.result, null, 2));
        store.dispatch('addresses/updateSourceCode', { address: this.info.address, sourceCode: data });
      }
    },
    saveSettings() {
      // console.log(now() + " AddressContract - methods.saveSettings - settings: " + JSON.stringify(this.settings, null, 2));
      if (this.initialised) {
        localStorage.explorerAddressContractSettings = JSON.stringify(this.settings);
      }
    },
  },
  beforeCreate() {
    console.log(now() + " AddressContract - beforeCreate");
	},
  mounted() {
    console.log(now() + " AddressContract - mounted");
    if ('explorerAddressContractSettings' in localStorage) {
      const tempSettings = JSON.parse(localStorage.explorerAddressContractSettings);
      console.log(now() + " AddressContract - mounted - tempSettings: " + JSON.stringify(tempSettings));
      if ('version' in tempSettings && tempSettings.version == this.settings.version) {
        this.settings = tempSettings;
      }
    }
    this.initialised = true;
    console.log(now() + " AddressContract - mounted - this.settings: " + JSON.stringify(this.settings));
    const t = this;
    setTimeout(function() {
      store.dispatch('address/loadAddress', { inputAddress: t.inputAddress, forceUpdate: false });
    }, 1000);
	},
  unmounted() {
    console.log(now() + " AddressContract - unmounted");
	},
  destroyed() {
    console.log(now() + " AddressContract - destroyed");
	},
};
