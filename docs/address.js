const Address = {
  template: `
    <div>
      <v-card>
        <h3 class="ms-2 mt-2">Address {{ inputAddress }} Summary</h3>

        <!-- <v-tabs
          v-model="tab"
          align-tabs="end"
          color="deep-purple-accent-4"
        >
          <v-tab value="one">Item One</v-tab>
          <v-tab value="two">Item Two</v-tab>
          <v-tab value="three">Item Three</v-tab>
        </v-tabs>

        <v-card-text>
          <v-tabs-window v-model="tab">
            <v-tabs-window-item value="one">
              One
            </v-tabs-window-item>

            <v-tabs-window-item value="two">
              Two
            </v-tabs-window-item>

            <v-tabs-window-item value="three">
              Three
            </v-tabs-window-item>
          </v-tabs-window>
        </v-card-text> -->


        <v-card-text>
          address: {{ address }}
          <br />
          transactionCount: {{ transactionCount }}
          <br />
          balance: {{ balance }}
        </v-card-text>
        <!-- <v-card-actions>
          <v-btn>Action 1</v-btn>
          <v-btn>Action 2</v-btn>
        </v-card-actions> -->
      </v-card>
    </div>
  `,
  props: ['inputAddress', 'tab'],
  data: function () {
    return {
      // tab: null,
      // address: null,
    };
  },
  computed: {
    address() {
      return store.getters['address/address'];
    },
    transactionCount() {
      return store.getters['address/transactionCount'];
    },
    balance() {
      return store.getters['address/balance'];
    },
  },
  methods: {

  },
  beforeCreate() {
    console.log(now() + " Address - beforeCreate");
	},
  mounted() {
    console.log(now() + " Address - mounted - inputAddress: " + this.inputAddress + ", tab: " + this.tab);
    const t = this;
    setTimeout(function() {
      store.dispatch('address/loadAddress', t.inputAddress);
    }, 1000);
	},
  unmounted() {
    console.log(now() + " Address - unmounted");
	},
  destroyed() {
    console.log(now() + " Address - destroyed");
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
    async loadAddress(context, inputAddress) {
      console.log(now() + " addressModule - actions.loadAddress - inputAddress: " + inputAddress);
      let [error, address, transactionCount, balance, ensName, transactions, block] = [null, null, null, null, null, null, null];
      if (inputAddress) {
        if (!store.getters['web3'].connected || !window.ethereum) {
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
