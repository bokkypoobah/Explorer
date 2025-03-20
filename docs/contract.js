const Contract = {
  template: `
    <div class="m-0 p-0">

      <b-card no-body no-header class="border-0" header-class="p-1">
        <b-card no-body class="border-0 m-0 mt-0">

          <div class="d-flex flex-wrap m-0 p-0 px-1 bg-white">
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
              <b-button :disabled="!etherscanAPIKey || !inputAddress" size="sm" @click="importABIFromEtherscan();" variant="link" v-b-popover.hover.top="'Import ABI from https://api.etherscan.io/. You will need to enter your Etherscan API key in the Config page'"><b-icon-cloud-download shift-v="-3" font-scale="1.2"></b-icon-cloud-download></b-button>
            </div>
            <div class="mt-0 pr-1">
              <b-button :disabled="!inputAddress" size="sm" @click="testIt();" variant="link" v-b-popover.hover.top="'Test'"><b-icon-bullseye shift-v="-3" font-scale="1.2"></b-icon-bullseye></b-button>
            </div>
            <div class="mt-0 flex-grow-1">
            </div>
            <div class="mt-0 flex-grow-1">
            </div>
            <div class="mt-0 flex-grow-1">
            </div>
          </div>

          <b-card no-body no-header bg-variant="light" class="m-1 p-1 w-75">

            <b-form-group label-cols-lg="2" label="Contract" label-size="md" label-class="font-weight-bold pt-0" class="mt-3 mb-0">
              <b-form-group v-if="error" label="Error:" label-for="address-error" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
                <b-form-input type="text" plaintext size="sm" id="address-error" :value="error"></b-form-input>
              </b-form-group>

              <b-form-group v-if="!error" label="Address:" label-for="address-address" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
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
              </b-form-group>

              <b-form-group v-if="!error" label="Transaction Count:" label-for="address-transactioncount" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
                <b-form-input type="text" plaintext size="sm" id="address-transactioncount" :value="commify0(transactionCount) || ''"></b-form-input>
              </b-form-group>

              <b-form-group label="Balance:" label-for="address-balance" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
                <b-form-input type="text" plaintext size="sm" id="address-balance" :value="balance && (formatETH(balance) + ' ETH')"></b-form-input>
              </b-form-group>

            </b-form-group>

            <font size="-1">
              <pre>
{{ info }}
              </pre>
            </font>
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
      info: {},
      count: 0,
      reschedule: true,
    }
  },
  computed: {
    etherscanAPIKey() {
      return store.getters['settings'].etherscanAPIKey;
    },
    error() {
      return store.getters['contract/error'];
    },
    address() {
      return store.getters['contract/address'];
    },
    transactionCount() {
      return store.getters['contract/transactionCount'];
    },
    balance() {
      return store.getters['contract/balance'];
    },
    transactions() {
      const results = [];
      results.push({ blah: "Blah" });
      return results;
    }
  },
  methods: {
    loadAddress(inputAddress) {
      console.log(now() + " Contract - methods.loadAddress - inputAddress: " + inputAddress);
      this.$router.push({ name: 'Contract', params: { inputAddress } })
      store.dispatch('address/loadAddress', inputAddress);
    },
    async testIt() {
      console.log(now() + " Contract - methods.testIt - inputAddress: " + this.inputAddress);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      this.info = await getAddressInfo(this.inputAddress, provider);
      console.log(now() + " Contract - methods.testIt - this.info: " + JSON.stringify(this.info));
    },
    async importABIFromEtherscan() {
      console.log(now() + " Contract - methods.importABIFromEtherscan");
      const etherscanAPIKey = store.getters['settings'].etherscanAPIKey;
      console.log(now() + " Contract - methods.importABIFromEtherscan - etherscanAPIKey: " + etherscanAPIKey);
      const url = "https://api.etherscan.io/v2/api?chainid=1&module=contract&action=getabi&address=" + this.inputAddress + "&apikey=" + etherscanAPIKey;
      // const url = "https://api.etherscan.io/v2/api?chainid=1&module=contract&action=getsourcecode&address=" + this.inputAddress + "&apikey=" + etherscanAPIKey;
      console.log(now() + " Contract - url: " + url);
      const data = await fetch(url).then(response => response.json());
      console.log(now() + " Contract - data: " + JSON.stringify(data, null, 2));
      if (data && data.status == 1 && data.message == "OK") {
        const abi = JSON.parse(data.result);
        console.log(now() + " Contract - abi: " + JSON.stringify(abi, null, 2));
      //   for (const item of data.result) {
      //     if (!(item.chainid in store.getters['settings'].chains)) {
      //       store.dispatch('addChain', {
      //         chainId: item.chainid,
      //         name: item.chainname,
      //         explorer: item.blockexplorer + (item.blockexplorer.substr(-1) != "/" ? "/" : ""),
      //         api: item.apiurl,
      //       });
      //     }
      //   }
      }
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
    const t = this;
    setTimeout(function() {
      store.dispatch('contract/loadAddress', t.inputAddress);
    }, 1000);
  },
  destroyed() {
    this.reschedule = false;
  },
};

const contractModule = {
  namespaced: true,
  state: {
    error: null,
    address: null,
    transactionCount: null,
    balance: null,
    // ensName: null,
    // transactions: [],
  },
  getters: {
    error: state => state.error,
    address: state => state.address,
    transactionCount: state => state.transactionCount,
    balance: state => state.balance,
    // ensName: state => state.ensName,
    // transactions: state => state.transactions,
  },
  mutations: {
    setData(state, data) {
      // console.log(now() + " contractModule - mutations.setData - data: " + JSON.stringify(data));
      state.error = data.error;
      state.address = data.address;
      state.transactionCount = data.transactionCount;
      state.balance = data.balance;
      // state.ensName = data.ensName;
      // state.transactions = data.transactions;
    },
  },
  actions: {
    async loadAddress(context, inputAddress) {
      console.log(now() + " contractModule - actions.loadAddress - inputAddress: " + inputAddress);
      let [error, address, transactionCount, balance, ensName, transactions, block] = [null, null, null, null, null, null, null];
      if (inputAddress) {
        if (!store.getters['web3Connection'].connected || !window.ethereum) {
          error = "Not connected";
        }
        if (!error && !(/^0x([A-Fa-f0-9]{40})$/.test(inputAddress))) {
          error = "Invalid address (ENS names will be supported later)";
        }
        if (!error) {
          try {
            address = ethers.utils.getAddress(inputAddress);
          } catch (e) {
            error = "Invalid address: " + inputAddress;
          }
        }
        if (!error) {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          transactionCount = await provider.getTransactionCount(address);
          console.log(now() + " contractModule - actions.loadAddress - transactionCount: " + transactionCount);
          balance = await provider.getBalance(address);
          console.log(now() + " contractModule - actions.loadAddress - balance: " + balance);
        }
      }
      console.log("error: " + error);
      context.commit('setData', { error, address, transactionCount, balance });
    }
  },
};
