const Address = {
  template: `
    <div class="m-0 p-0">

      <b-card no-body no-header class="border-0" header-class="p-1">
        <b-card no-body class="border-0 m-0 mt-0">

          <div class="d-flex flex-wrap m-0 p-0 px-1 bg-white">
            <div class="m-0 mt-1 p-0" style="width: 24.0rem;">
              <!-- <b-form-input type="text" size="sm" :value="nameOrAddress" @change="loadAddress($event);" debounce="600" v-b-popover.hover.bottom="'Address'" placeholder="🔍 ENS name or address, e.g., 0x1234...abcd"></b-form-input> -->
              <b-form-input type="text" size="sm" :value="nameOrAddress" @change="loadAddress($event);" debounce="600" v-b-popover.hover.bottom="'Address'" placeholder="🔍 address, e.g., 0x1234...abcd"></b-form-input>
            </div>
            <!-- <div class="mt-1 pr-1">
              <b-dropdown size="sm" right text="" variant="link" class="m-0 p-0">
                <b-dropdown-text>Sample Blocks</b-dropdown-text>
                <b-dropdown-divider></b-dropdown-divider>
                <b-dropdown-item @click="loadAddress('0x00cf367c9ee21dc9538355d1da4ebac9b83645b790b07dd2c9d15ae7f9aed6d2');">0x00cf367c - EF: DeFi Multisig Safe v1.4.1 transaction</b-dropdown-item>
              </b-dropdown>
            </div> -->
            <!-- <div class="mt-0 flex-grow-1">
            </div> -->
          </div>

          <b-card no-body no-header bg-variant="light" class="m-1 p-1 w-75">

            <b-form-group label-cols-lg="2" label="Address" label-size="md" label-class="font-weight-bold pt-0" class="mt-3 mb-0">
              <b-form-group v-if="error" label="Error:" label-for="address-error" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
                <b-form-input type="text" plaintext size="sm" id="address-error" :value="error"></b-form-input>
              </b-form-group>

              <b-form-group v-if="!error" label="Address:" label-for="address-address" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
                <b-input-group>
                  <b-form-input type="text" plaintext size="sm" :value="address"></b-form-input>
                  <!-- <b-button v-if="address" :href="'#/address/' + address" variant="link" class="m-0 p-0 pt-1">
                    {{ address }}
                  </b-button> -->
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
  props: ['nameOrAddress'],
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
    loadAddress(nameOrAddress) {
      console.log(now() + " Address - methods.loadAddress - nameOrAddress: " + nameOrAddress);
      this.$router.push({ name: 'Address', params: { nameOrAddress } })
      store.dispatch('address/loadAddress', nameOrAddress);
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
  //   console.log(now() + " Address - beforeRouteUpdate");
  //   console.table(to);
  //   console.table(from);
  // },
  beforeDestroy() {
    console.log(now() + " Address - beforeDestroy()");
  },
  mounted() {
    console.log(now() + " Address - mounted() $route.params: " + JSON.stringify(this.$route.params));
    const t = this;
    setTimeout(function() {
      store.dispatch('address/loadAddress', t.nameOrAddress);
    }, 1000);
  },
  destroyed() {
    this.reschedule = false;
  },
};

const addressModule = {
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
      console.log(now() + " addressModule - mutations.setData - data: " + JSON.stringify(data));
      state.error = data.error;
      state.address = data.address;
      state.transactionCount = data.transactionCount;
      state.balance = data.balance;
      // state.ensName = data.ensName;
      // state.transactions = data.transactions;
    },
  },
  actions: {
    async loadAddress(context, nameOrAddress) {
      console.log(now() + " addressModule - actions.loadAddress - nameOrAddress: " + nameOrAddress);
      let [error, address, transactionCount, balance, ensName, transactions, block] = [null, null, null, null, null, null, null];
      if (nameOrAddress) {
        if (!store.getters['web3Connection'].connected || !window.ethereum) {
          error = "Not connected";
        }
        if (!error && !(/^0x([A-Fa-f0-9]{40})$/.test(nameOrAddress))) {
          error = "Invalid address (ENS names will be supported later)";
        }
        if (!error) {
          try {
            address = ethers.utils.getAddress(nameOrAddress);
          } catch (e) {
            error = "Invalid address: " + nameOrAddress;
          }
        }
        if (!error) {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          transactionCount = await provider.getTransactionCount(address);
          console.log(now() + " addressModule - actions.loadAddress - transactionCount: " + transactionCount);
          balance = await provider.getBalance(address);
          console.log(now() + " addressModule - actions.loadAddress - balance: " + balance);
        }
      }
      console.log("error: " + error);
      context.commit('setData', { error, address, transactionCount, balance });
    }
  },
};
