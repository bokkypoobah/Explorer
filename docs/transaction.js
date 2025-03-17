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
                <!-- to <i>Explorer</i>. Status: <b>WIP</b> -->

                {{ txHash }}
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
    // powerOn() {
    //   return store.getters['connection/powerOn'];
    // },
    // explorer () {
    //   return store.getters['connection/explorer'];
    // },
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
    store.dispatch('config/restoreState');
    // this.reschedule = true;
    // console.log(now() + " Transaction - Calling timeoutCallback()");
    // this.timeoutCallback();
    // this.loadNFTs();
  },
  destroyed() {
    this.reschedule = false;
  },
};

const transactionModule = {
  namespaced: true,
  state: {
    // params: null,
    // executing: false,
    // executionQueue: [],
  },
  getters: {
    // params: state => state.params,
    // executionQueue: state => state.executionQueue,
  },
  mutations: {
    // deQueue(state) {
    //   logDebug("transactionModule", "deQueue(" + JSON.stringify(state.executionQueue) + ")");
    //   state.executionQueue.shift();
    // },
    // updateParams(state, params) {
    //   state.params = params;
    //   logDebug("transactionModule", "updateParams('" + params + "')")
    // },
    // updateExecuting(state, executing) {
    //   state.executing = executing;
    //   logDebug("transactionModule", "updateExecuting(" + executing + ")")
    // },
  },
  actions: {
  },
};
