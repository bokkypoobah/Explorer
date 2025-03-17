const Config = {
  template: `
    <div class="m-0 p-0">

      <b-card no-body no-header class="border-0" header-class="p-1">
        <b-card no-body class="border-0 m-0 mt-2">

          <b-card-body class="p-0">
            <b-card class="mb-2 border-0">

              <b-card-text>
                <h5>Config</h5>
                <!-- to <i>Explorer</i>. Status: <b>WIP</b> -->
              </b-card-text>

            </b-card>
          </b-card-body>
        </b-card>
      </b-card>
    </div>
  `,
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
    // async syncIt(info) {
    //   store.dispatch('data/syncIt', info);
    // },
    // async timeoutCallback() {
    //   console.log(now() + " Config - timeoutCallback() count: " + this.count);
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
    console.log(now() + " Config - beforeDestroy()");
  },
  mounted() {
    console.log(now() + " Config - mounted() $route: " + JSON.stringify(this.$route.params));
    // this.reschedule = true;
    // console.log(now() + " Config - Calling timeoutCallback()");
    // this.timeoutCallback();
    // this.loadNFTs();
  },
  destroyed() {
    this.reschedule = false;
  },
};

const configModule = {
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
    //   logDebug("configModule", "deQueue(" + JSON.stringify(state.executionQueue) + ")");
    //   state.executionQueue.shift();
    // },
    // updateParams(state, params) {
    //   state.params = params;
    //   logDebug("configModule", "updateParams('" + params + "')")
    // },
    // updateExecuting(state, executing) {
    //   state.executing = executing;
    //   logDebug("configModule", "updateExecuting(" + executing + ")")
    // },
  },
  actions: {
  },
};
