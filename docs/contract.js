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
                <b-dropdown-text>Sample Addresses</b-dropdown-text>
                <b-dropdown-divider></b-dropdown-divider>
                <b-dropdown-item @click="loadAddress('0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe');">0xde0B2956 - EthDev: Ethereum Foundation</b-dropdown-item>
                <b-dropdown-item @click="loadAddress('0x9fC3dc011b461664c835F2527fffb1169b3C213e');">0x9fC3dc01 - EF: DeFi Multisig - Safe v1.4.1</b-dropdown-item>
                <!-- https://intel.arkm.com/explorer/address/0x13e003a57432062e4EdA204F687bE80139AD622f -->
                <b-dropdown-item @click="loadAddress('0x13e003a57432062e4EdA204F687bE80139AD622f');">0x13e003a5 - Blackrock: BUIDL Fund</b-dropdown-item>
                <!-- https://finance.yahoo.com/news/singapores-largest-bank-dbs-ether-094134637.html -->
                <b-dropdown-item @click="loadAddress('0x9e927c02C9eadAE63f5EFb0Dd818943c7262Fb8e');">0x9e927c02 - DBS, largest bank in Singapore</b-dropdown-item>
                <b-dropdown-item @click="loadAddress('0xae2Fc483527B8EF99EB5D9B44875F005ba1FaE13');">0xae2Fc483 - jaredfromsubway.eth</b-dropdown-item>
              </b-dropdown>
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
      count: 0,
      reschedule: true,
    }
  },
  computed: {
    error() {
      return store.getters['address/error'];
    },
    address() {
      return store.getters['address/address'];
    },
    transactionCount() {
      return store.getters['address/transactionCount'];
    },
    balance() {
      return store.getters['address/balance'];
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
      store.dispatch('address/loadAddress', t.inputAddress);
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
      console.log(now() + " contractModule - mutations.setData - data: " + JSON.stringify(data));
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
