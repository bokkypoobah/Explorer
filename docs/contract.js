const Contract = {
  template: `
    <div class="m-0 p-0">

      <b-card no-body no-header class="border-0">
        <b-card no-body class="border-0 m-0 mt-0 px-1">
          <b-tabs v-model="settings.tabIndex" @input="saveSettings" align="right" class="text-right mt-1" content-class="m-1 mb-0 p-0">
            <template #tabs-start>
              <div class="d-flex flex-grow-1">
                <div class="m-0 mt-1 p-0" style="width: 24.0rem;">
                  <b-form-input type="text" size="sm" :value="inputAddress" @change="loadAddress($event);" debounce="600" v-b-popover.hover.bottom="'Address'" placeholder="🔍 address, e.g., 0x1234...abcd"></b-form-input>
                </div>
                <div class="mt-1 pr-1">
                  <b-dropdown size="sm" right text="" variant="link" class="m-0 p-0">
                    <b-dropdown-text>Sample Contracts</b-dropdown-text>
                    <b-dropdown-divider></b-dropdown-divider>
                    <b-dropdown-item @click="loadAddress('0x9fC3dc011b461664c835F2527fffb1169b3C213e');">0x9fC3dc01 - EF: DeFi Multisig - Safe v1.4.1</b-dropdown-item>
                    <b-dropdown-item @click="loadAddress('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2');">0xC02aaA39 - ERC-20: WETH</b-dropdown-item>
                    <b-dropdown-item @click="loadAddress('0x42069abfe407c60cf4ae4112bedead391dba1cdb');">0x42069abf - ERC-721: CryptoDickButts</b-dropdown-item>
                    <b-dropdown-item @click="loadAddress('0x8fa600364b93c53e0c71c7a33d2ade21f4351da3');">0x8fa60036 - ERC-721: Larva Chads</b-dropdown-item>
                    <b-dropdown-item @click="loadAddress('0xB32979486938AA9694BFC898f35DBED459F44424');">0xB3297948 - ERC-1155: Nyan Cat</b-dropdown-item>
                    <b-dropdown-item @click="loadAddress('0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB');">0xb47e3cd8 - CryptoPunksMarket</b-dropdown-item>
                    <b-dropdown-item @click="loadAddress('0x16F5A35647D6F03D5D3da7b35409D65ba03aF3B2');">0x16F5A356 - CryptopunksData</b-dropdown-item>
                  </b-dropdown>
                </div>
                <div class="mt-0 flex-grow-1">
                </div>
                <div class="mt-0 pr-1">
                  <b-button :disabled="!inputAddress" size="sm" @click="loadData(inputAddress, true);" variant="link" v-b-popover.hover.top="'Load info'"><b-icon-cloud-download shift-v="-3" font-scale="1.2"></b-icon-cloud-download></b-button>
                </div>
                <!-- <div class="mt-0 pr-1">
                  <b-button :disabled="!etherscanAPIKey || !inputAddress" size="sm" @click="importABIFromEtherscan();" variant="link" v-b-popover.hover.top="'Import ABI from https://api.etherscan.io/. You will need to enter your Etherscan API key in the Config page'"><b-icon-cloud-download shift-v="-3" font-scale="1.2"></b-icon-cloud-download></b-button>
                </div> -->
                <!-- <div class="mt-0 pr-1">
                  <b-button :disabled="!inputAddress" size="sm" @click="testIt();" variant="link" v-b-popover.hover.top="'Test'"><b-icon-bullseye shift-v="-3" font-scale="1.2"></b-icon-bullseye></b-button>
                </div> -->
              </div>
              <div class="mt-0 flex-grow-1">
              </div>
              <div class="mt-0 flex-grow-1">
              </div>
              <div class="mt-0 flex-grow-1">
              </div>
            </template>
            <b-tab title="Info" no-body></b-tab>
            <b-tab title="ABI" no-body></b-tab>
            <b-tab title="Source Code" no-body></b-tab>
          </b-tabs>

          <b-card no-body no-header bg-variant="light" class="m-0 p-1">

            <div v-if="settings.tabIndex == 0">
              <b-form-group label-cols-lg="2" label="Contract" label-size="md" label-class="font-weight-bold pt-0" class="mt-3 mb-0">
                <!-- <b-form-group v-if="error" label="Error:" label-for="address-error" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
                  <b-form-input type="text" plaintext size="sm" id="address-error" :value="error"></b-form-input>
                </b-form-group> -->
                <!-- <b-form-group v-if="!error" label="Address:" label-for="address-address" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
                  <b-input-group class="w-75">
                    <b-form-input type="text" plaintext size="sm" :value="address"></b-form-input>
                    <b-input-group-append>
                      <b-button v-if="address" :href="'https://etherscan.io/address/' + address" variant="link" target="_blank" class="m-0 ml-2 p-0 pt-1">
                        <b-icon-link-45deg shift-v="-1" font-scale="1.1"></b-icon-link-45deg>
                      </b-button>
                      <b-button v-if="address" size="sm" @click="copyToClipboard(address);" variant="link">
                        <b-icon-clipboard shift-v="-1" font-scale="1.1"></b-icon-clipboard>
                      </b-button>
                    </b-input-group-append>
                  </b-input-group>
                </b-form-group> -->
                <!-- <b-form-group v-if="!error" label="Transaction Count:" label-for="address-transactioncount" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
                  <b-form-input type="text" plaintext size="sm" id="address-transactioncount" :value="commify0(transactionCount) || ''"></b-form-input>
                </b-form-group> -->
                <!-- <b-form-group label="Balance:" label-for="address-balance" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
                  <b-form-input type="text" plaintext size="sm" id="address-balance" :value="balance && (formatETH(balance) + ' ETH')"></b-form-input>
                </b-form-group> -->
                <b-form-group label="Info:" label-for="address-info" label-size="sm" label-cols-sm="2" label-align-sm="right" class="mx-0 my-1 p-0">
                  <font size="-1">
                    <pre class="mt-2">
info: {{ info }}
                    </pre>
                  </font>
                </b-form-group>
              </b-form-group>
            </div>
            <div v-if="settings.tabIndex == 1">
              <b-form-group label="ABI:" label-for="contractabi-abi" label-size="sm" label-cols-sm="2" label-align-sm="right" class="mx-0 my-1 p-0">
                <b-input-group class="align-items-start">
                  <b-form-textarea size="sm" id="contractabi-abi" :value="info.abi && JSON.stringify(info.abi) || null" @change="updateABI(inputAddress, $event)" rows="5" max-rows="10"></b-form-textarea>
                  <b-input-group-append>
                    <b-button :disabled="!etherscanAPIKey || !info.address" size="sm" @click="importABIFromEtherscan();" variant="link" v-b-popover.hover.top="'Import ABI from https://api.etherscan.io/. You will need to enter your Etherscan API key in the Config page'">
                      <b-icon-cloud-download shift-v="-3" font-scale="1.2"></b-icon-cloud-download>
                    </b-button>
                    <b-button :disabled="!info || !info.abi" size="sm" @click="copyToClipboard(info.abi && JSON.stringify(info.abi) || null);" variant="link">
                      <b-icon-clipboard shift-v="-1" font-scale="1.1"></b-icon-clipboard>
                    </b-button>
                  </b-input-group-append>
                </b-input-group>
              </b-form-group>
              <b-form-group label="Functions:" label-for="contractabi-functions" label-size="sm" label-cols-sm="2" label-align-sm="right" class="mx-0 my-1 p-0">
                <b-table small fixed striped responsive hover :fields="functionFields" :items="functionList" show-empty empty-html="zzz" head-variant="light" class="mx-0 my-0 p-1">
                  <template #cell(index)="data">
                    <font size="-1" class="text-muted">
                      {{ data.index + 1 }}
                    </font>
                  </template>
                  <template #cell(function)="data">
                    {{ data.item.name }}
                  </template>
                  <template #cell(inputs)="data">
                    <div v-for="(item, parameterIndex) of data.item.inputs" v-bind:key="parameterIndex">
                      <font size="-1" class="text-muted">
                        {{ parameterIndex + 1 }}
                      </font>
                      <span class="text-muted">
                        {{ item.type }}
                      </span>
                     {{ item.name || "(unnamed)" }}
                    </div>
                  </template>
                  <template #cell(outputs)="data">
                    <div v-for="(item, parameterIndex) of data.item.outputs" v-bind:key="parameterIndex">
                      <font size="-1" class="text-muted">
                        {{ parameterIndex + 1 }}
                      </font>
                      <span class="text-muted">
                        {{ item.type }}
                      </span>
                     {{ item.name || "(unnamed)" }}
                    </div>
                  </template>
                </b-table>
              </b-form-group>
              <b-form-group label="Events:" label-for="contractabi-events" label-size="sm" label-cols-sm="2" label-align-sm="right" class="mx-0 my-1 p-0">
                <b-table small fixed striped responsive hover :fields="eventFields" :items="eventList" show-empty empty-html="zzz" head-variant="light" class="mx-0 my-0 p-1">
                  <template #cell(index)="data">
                    <font size="-1" class="text-muted">
                      {{ data.index + 1 }}
                    </font>
                  </template>
                  <template #cell(event)="data">
                    {{ data.item.name }}
                  </template>
                  <template #cell(parameters)="data">
                    <div v-for="(item, parameterIndex) of data.item.parameters" v-bind:key="parameterIndex">
                      <font size="-1" class="text-muted">
                        {{ parameterIndex + 1 }}
                      </font>
                      <span class="text-muted">
                        {{ item.type }}
                      </span>
                      <span v-if="item.indexed" class="text-muted">
                        indexed
                      </span>
                     {{ item.name || "(unnamed)" }}
                    </div>
                  </template>
                </b-table>
              </b-form-group>
            </div>
            <div v-if="settings.tabIndex == 2">
              <b-form-group label="Source code:" label-for="contractabi-sourcecode" label-size="sm" label-cols-sm="2" label-align-sm="right" class="mx-0 my-1 p-0">
                <b-input-group class="align-items-start">
                  <b-form-textarea plaintext size="sm" id="contractabi-sourcecode" :value="info.sourceCode && JSON.stringify(info.sourceCode) || null" rows="5" max-rows="10"></b-form-textarea>
                  <b-input-group-append>
                    <b-button :disabled="!etherscanAPIKey || !inputAddress" size="sm" @click="importSourceCodeFromEtherscan();" variant="link" v-b-popover.hover.top="'Import ABI from https://api.etherscan.io/. You will need to enter your Etherscan API key in the Config page'">
                      <b-icon-cloud-download shift-v="-3" font-scale="1.2"></b-icon-cloud-download>
                    </b-button>
                    <b-button :disabled="!info || !info.sourceCode" size="sm" @click="copyToClipboard(info.sourceCode && JSON.stringify(info.sourceCode) || null);" variant="link">
                      <b-icon-clipboard shift-v="-1" font-scale="1.1"></b-icon-clipboard>
                    </b-button>
                  </b-input-group-append>
                </b-input-group>
              </b-form-group>
            </div>
          </b-card>
          <!-- <b-card-text>
            <h5>Address</h5>
            error: {{ error }}
            <br />
            address: {{ address }}
          </b-card-text> -->
        </b-card>
      </b-card>
    </div>
  `,
  props: ['inputAddress'],
  data: function () {
    return {
      settings: {
        tabIndex: 0,
        version: 0,
      },
      info: {},
      // TODO: 'function' sortable does not work
      functionFields: [
        { key: 'index', label: '#', sortable: false, thStyle: 'width: 5%;', tdClass: 'text-truncate' },
        { key: 'methodId', label: 'Method Id', sortable: true, thStyle: 'width: 15%;', tdClass: 'text-truncate' },
        { key: 'stateMutability', label: 'State Mutability', sortable: true, thStyle: 'width: 20%;', tdClass: 'text-truncate' },
        { key: 'function', label: 'Function', sortable: true, thStyle: 'width: 20%;', tdClass: 'text-left' },
        { key: 'inputs', label: 'Inputs', sortable: false, thStyle: 'width: 25%;', tdClass: 'text-left' },
        { key: 'outputs', label: 'Outputs', sortable: false, thStyle: 'width: 25%;', tdClass: 'text-left' },
      ],
      // TODO: 'event' sortable does not work
      eventFields: [
        { key: 'index', label: '#', sortable: false, thStyle: 'width: 5%;', tdClass: 'text-truncate' },
        { key: 'eventSig', label: 'Event Sig', sortable: true, thStyle: 'width: 20%;', tdClass: 'text-truncate' },
        { key: 'event', label: 'Event', sortable: true, thStyle: 'width: 25%;', tdClass: 'text-truncate' },
        { key: 'parameters', label: 'Parameters', sortable: false, thStyle: 'width: 50%;', tdClass: 'text-left' },
      ],
    }
  },
  computed: {
    etherscanAPIKey() {
      return store.getters['settings'].etherscanAPIKey;
    },
    chainId() {
      return store.getters['chainId'];
    },
    dbInfo() {
      return store.getters['db'];
    },
    functions() {
      const results = {};
      if (this.info.abi) {
        try {
          const interface = new ethers.utils.Interface(this.info.abi);
          for (const f of interface.format(ethers.utils.FormatTypes.full)) {
            if (f.substring(0, 8) == "function") {
              const functionInfo = interface.getFunction(f.substring(9,));
              const methodId = interface.getSighash(functionInfo);
              results[methodId] = { name: functionInfo.name, stateMutability: functionInfo.stateMutability, inputs: functionInfo.inputs, outputs: functionInfo.outputs };
            }
          }
        } catch (e) {
          console.error(now() + " Contract - computed.functions - ERROR info.abi: " + e.message);
        }
      }
      console.log(now() + " Contract - computed.functions - results: " + JSON.stringify(results, null, 2));
      return results;
    },
    events() {
      const results = {};
      if (this.info.abi) {
        try {
          const interface = new ethers.utils.Interface(this.info.abi);
          for (const f of interface.format(ethers.utils.FormatTypes.full)) {
            if (f.substring(0, 5) == "event") {
              const eventInfo = interface.getEvent(f.substring(6,));
              const topicCount = eventInfo.inputs.filter(e => e.indexed).length + 1;
              const eventSig = interface.getEventTopic(eventInfo);
              const parameters = eventInfo.inputs.map(e => ({ name: e.name, type: e.type, indexed: e.indexed }));
              results[eventSig] = { name: eventInfo.name, parameters, topicCount };
            }
          }
        } catch (e) {
          console.error(now() + " Contract - computed.events - ERROR: " + e.message);
        }
      }
      return results;
    },
    functionList() {
      const results = [];
      for (const [methodId, functionData] of Object.entries(this.functions)) {
        results.push({ methodId, ...functionData });
      }
      return results;
    },
    eventList() {
      const results = [];
      for (const [eventSig, eventData] of Object.entries(this.events)) {
        results.push({ eventSig, ...eventData });
      }
      return results;
    },
  },
  methods: {
    async loadAddress(inputAddress) {
      console.log(now() + " Contract - methods.loadAddress - inputAddress: " + inputAddress);
      this.$router.push({ name: 'Contract', params: { inputAddress } })
      await this.loadData(inputAddress);
    },
    async loadData(inputAddress, forceUpdate = false) {
      console.log(now() + " Contract - methods.loadData - inputAddress: " + inputAddress + ", forceUpdate: " + forceUpdate);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const db = new Dexie(this.dbInfo.name);
      db.version(this.dbInfo.version).stores(this.dbInfo.schemaDefinition);
      const validatedAddress = validateAddress(inputAddress);
      let info = {};
      if (validatedAddress) {
        info = await dbGetCachedData(db, validatedAddress + "_" + this.chainId + "_contract", {});
        console.log(now() + " Contract - methods.loadData - info: " + JSON.stringify(info).substring(0, 1000) + "...");
        if (Object.keys(info).length == 0 || forceUpdate) {
          info = await getAddressInfo(validatedAddress, provider);
          console.log(now() + " Contract - methods.loadData - info: " + JSON.stringify(info).substring(0, 1000) + "...");
          await dbSaveCacheData(db, validatedAddress + "_" + this.chainId + "_contract", info);
        }
      }
      Vue.set(this, 'info', info);
      db.close();
    },
    async updateABI(address, abi) {
      console.log(now() + " Contract - methods.updateABI - address: " + address + ", abi: " + abi);
      const db = new Dexie(this.dbInfo.name);
      db.version(this.dbInfo.version).stores(this.dbInfo.schemaDefinition);
      const validatedAddress = validateAddress(address);
      if (validatedAddress && validatedAddress == this.info.address) {
        console.log(now() + " Contract - methods.updateABI - this.info: " + JSON.stringify(this.info).substring(0, 1000) + "...");
        Vue.set(this.info, 'abi', abi);
        await dbSaveCacheData(db, this.info.address + "_" + this.chainId + "_contract", this.info);
      }
      db.close();
    },
    async testIt() {
      // console.log(now() + " Contract - methods.testIt - inputAddress: " + this.inputAddress);
      // const provider = new ethers.providers.Web3Provider(window.ethereum);
      // console.log(now() + " Contract - methods.testIt - dbInfo: " + JSON.stringify(this.dbInfo, null, 2));
      // const db = new Dexie(this.dbInfo.name);
      // db.version(this.dbInfo.version).stores(this.dbInfo.schemaDefinition);
      // const name = "BLah";
      // await dbSaveCacheData(db, name, { blah: "Blah" });
      // const retrievedData = await dbGetCachedData(db, name, {});
      // console.log("retrievedData: " + JSON.stringify(retrievedData, null, 2));
      // db.close();
    },
    async importABIFromEtherscan() {
      console.log(now() + " Contract - methods.importABIFromEtherscan");
      const db = new Dexie(this.dbInfo.name);
      db.version(this.dbInfo.version).stores(this.dbInfo.schemaDefinition);
      const url = "https://api.etherscan.io/v2/api?chainid=1&module=contract&action=getabi&address=" + (this.info.implementation ? this.info.implementation : this.info.address) + "&apikey=" + store.getters['settings'].etherscanAPIKey;
      console.log(now() + " Contract - url: " + url);
      const data = await fetch(url).then(response => response.json());
      console.log(now() + " Contract - data: " + JSON.stringify(data, null, 2));
      if (data && data.status == 1 && data.message == "OK") {
        const abi = JSON.parse(data.result);
        console.log(now() + " Contract - abi: " + JSON.stringify(abi, null, 2).substring(0, 1000) + "...");
        console.log(now() + " Contract - methods.importABIFromEtherscan - this.info: " + JSON.stringify(this.info).substring(0, 1000) + "...");
        Vue.set(this.info, 'abi', abi);
        await dbSaveCacheData(db, this.info.address + "_" + this.chainId + "_contract", this.info);
      }
      db.close();
    },
    async importSourceCodeFromEtherscan() {
      console.log(now() + " Contract - methods.importSourceCodeFromEtherscan");
      const db = new Dexie(this.dbInfo.name);
      db.version(this.dbInfo.version).stores(this.dbInfo.schemaDefinition);
      const url = "https://api.etherscan.io/v2/api?chainid=1&module=contract&action=getsourcecode&address=" + (this.info.implementation ? this.info.implementation : this.info.address) + "&apikey=" + store.getters['settings'].etherscanAPIKey;
      console.log(now() + " Contract - url: " + url);
      const data = await fetch(url).then(response => response.json());
      console.log(now() + " Contract - data: " + JSON.stringify(data, null, 2));
      if (data && data.status == 1 && data.message == "OK") {
        console.log(now() + " Contract - data.result: " + JSON.stringify(data.result, null, 2));
        // Vue.set(this.info, 'sourceCode', JSON.stringify(data.result).replace(/\/\//, "/"));
        // Vue.set(this.info, 'sourceCode', data.result[0].SourceCode.replace(/\/r\/n/, ""));
        Vue.set(this.info, 'sourceCode', data.result[0].SourceCode);
        await dbSaveCacheData(db, this.info.address + "_" + this.chainId + "_contract", this.info);
      }
      db.close();
    },
    saveSettings() {
      console.log(now() + " Contract - saveSettings");
      localStorage.explorerContractSettings = JSON.stringify(this.settings);
    },
    copyToClipboard(str) {
      navigator.clipboard.writeText(str);
    },
    commify0(n) {
      if (n != null) {
        return Number(n).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
      }
      return null;
    },
    formatETH(e) {
      if (e) {
        return ethers.utils.formatEther(e).replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
      }
      return null;
    },
    formatGas(e) {
      if (e) {
        return ethers.utils.formatUnits(e, "gwei").replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
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
  // beforeRouteUpdate(to, from) {
  //   console.log(now() + " Contract - beforeRouteUpdate");
  //   console.table(to);
  //   console.table(from);
  // },
  beforeDestroy() {
    console.log(now() + " Contract - beforeDestroy()");
  },
  mounted() {
    console.log(now() + " Contract - mounted() $route.params: " + JSON.stringify(this.$route.params));
    if ('explorerContractSettings' in localStorage) {
      const tempSettings = JSON.parse(localStorage.explorerContractSettings);
      if ('version' in tempSettings && tempSettings.version == this.settings.version) {
        Vue.set(this, 'settings', tempSettings);
        // this.settings.xTable.currentPage = 1;
      }
    }
    const t = this;
    setTimeout(function() {
      (async() => {
        await t.loadData(t.inputAddress);
      })();
    }, 1000);
  },
  destroyed() {
    this.reschedule = false;
  },
};

const contractModule = {
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
