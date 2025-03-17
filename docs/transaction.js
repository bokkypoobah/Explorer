const Transaction = {
  template: `
    <div class="m-0 p-0">

      <b-card no-body no-header class="border-0" header-class="p-1">
        <b-card no-body class="border-0 m-0 mt-0">

          <div class="d-flex flex-wrap m-0 p-0 px-1 bg-white">
            <div class="ml-1 mt-1 p-0" style="width: 36.0rem;">
              <b-form-input type="text" size="sm" :value="txHash" @change="updateTxHash($event);" debounce="600" v-b-popover.hover.bottom="'Transaction hash'" placeholder="🔍 tx hash, e.g., 0x1234...abcd"></b-form-input>
            </div>
          </div>

          <b-card-body class="p-0">
            <b-card class="mb-2 border-0">

              <b-card-text>
                <h5>Transaction</h5>
                tx: {{ tx }}
                txReceipt: {{ txReceipt }}
              </b-card-text>

            </b-card>
          </b-card-body>
        </b-card>
      </b-card>
    </div>
  `,
  props: ['txHash'],
  data: function () {
    return {
      count: 0,
      reschedule: true,
    }
  },
  computed: {
    tx() {
      return store.getters['transaction/tx'];
    },
    txReceipt () {
      return store.getters['transaction/txReceipt'];
    },
    // coinbase() {
    //   return store.getters['connection/coinbase'];
    // },
    // chainId() {
    //   return store.getters['connection/chainId'];
    // },
  },
  methods: {
    updateTxHash(txHash) {
      console.log(now() + " Transaction - updateTxHash - txHash: " + txHash);
      this.$router.push({ name: 'Transaction', params: { txHash } })
    },
    // async syncIt(info) {
    //   store.dispatch('data/syncIt', info);
    // },
    // async timeoutCallback() {
    //   console.log(now() + " Transaction - timeoutCallback() count: " + this.count);
    //
    //   this.count++;
    //   var t = this;
    //   if (this.reschedule) {
    //     setTimeout(function() {
    //       t.timeoutCallback();
    //     }, 15000);
    //   }
    // },
  },
  beforeDestroy() {
    console.log(now() + " Transaction - beforeDestroy()");
  },
  mounted() {
    console.log(now() + " Transaction - mounted() $route: " + JSON.stringify(this.$route.params));
    console.log(now() + " Transaction - mounted() this.txHash: " + this.txHash);
    store.dispatch('config/restoreState');
    const t = this;
    setTimeout(function() {
      store.dispatch('transaction/loadTransaction', t.txHash);
    }, 1000);
  },
  destroyed() {
    this.reschedule = false;
  },
};

const transactionModule = {
  namespaced: true,
  state: {
    tx: null,
    txReceipt: null,
  },
  getters: {
    tx: state => state.tx,
    txReceipt: state => state.txReceipt,
  },
  mutations: {
    setData(state, data) {
      console.log(now() + " transactionModule - mutations.setData - data: " + JSON.stringify(data));
      state.tx = data.tx;
      state.txReceipt = data.txReceipt;
      console.log(now() + " transactionModule - mutations.setData - state.tx: " + JSON.stringify(state.tx));
      console.log(now() + " transactionModule - mutations.setData - state.txReceipt: " + JSON.stringify(state.txReceipt));
    },
  },
  actions: {
    async loadTransaction(context, txHash) {
      console.log(now() + " transactionModule - actions.loadTransaction - txHash: " + txHash);
      if (store.getters['connection/connected'] && window.ethereum) {
        console.log(now() + " transactionModule - actions.loadTransaction - connected");
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const tx = await provider.getTransaction(txHash);
        console.log(now() + " transactionModule - actions.loadTransaction - tx: " + JSON.stringify(tx));
        const txReceipt = await provider.getTransactionReceipt(txHash);
        console.log(now() + " transactionModule - actions.loadTransaction - txReceipt: " + JSON.stringify(txReceipt));
        context.commit('setData', { tx, txReceipt });
      } else {
        console.error(now() + " transactionModule - actions.loadTransaction - not connected");
      }
    }
  },
};
