const Config = {
  template: `
    <div class="m-0 p-0">

      <b-card no-body no-header class="border-0" header-class="p-1">
        <h5 class="mt-3">Config</h5>
        <b-card no-body no-header bg-variant="light" class="m-1 mt-3 p-1 w-75">
          <b-form-group label="Etherscan API Key:" label-for="etherscan-apikey" label-size="sm" label-cols-sm="2" label-align-sm="right" description="This key is stored in your local browser storage and is sent with Etherscan API requests. If not supplied, imports from Etherscan will be rate limited to 1 request every 5 seconds" class="mx-0 my-1 p-0">
            <b-form-input type="text" size="sm" id="etherscan-apikey" v-model="etherscanAPIKey" placeholder="See https://docs.etherscan.io/ to obtain an API key" class="w-75"></b-form-input>
          </b-form-group>
        </b-card>

        <!-- <b-card no-body class="border-0 m-0 mt-2">
          <b-card-body class="p-0">
            <b-card class="mb-2 border-0">
              <b-card-text>
                <h5>Config</h5>
              </b-card-text>
            </b-card>
          </b-card-body>
        </b-card> -->

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
    etherscanAPIKey: {
      get: function () {
        return store.getters['config/settings'].etherscanAPIKey;
      },
      set: function (etherscanAPIKey) {
        store.dispatch('config/setEtherscanAPIKey', etherscanAPIKey);
      },
    },
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
    store.dispatch('config/restoreState');
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
    settings: {
      etherscanAPIKey: null,
      version: 0,
    },
  },
  getters: {
    settings: state => state.settings,
  },
  mutations: {
    restoreState(state, settings) {
      console.log(now() + " configModule - mutations.restoreState - settings: " + JSON.stringify(settings));
      state.settings = settings;
    },
    setEtherscanAPIKey(state, apiKey) {
      console.log(now() + " configModule - mutations.setEtherscanAPIKey - apiKey: " + apiKey);
      state.settings.etherscanAPIKey = apiKey;
    },
  },
  actions: {
    restoreState(context) {
      console.log(now() + " configModule - actions.restoreState");
      if (localStorage.explorerConfigSettings) {
        const tempSettings = JSON.parse(localStorage.explorerConfigSettings);
        if ('version' in tempSettings && tempSettings.version == context.state.settings.version) {
          console.log(now() + " configModule - actions.restoreState - tempSettings: " + JSON.stringify(tempSettings));
          context.commit("restoreState", tempSettings);
        }
      }
    },
    setEtherscanAPIKey(context, apiKey) {
      console.log(now() + " configModule - actions.setEtherscanAPIKey - apiKey: " + apiKey);
      context.commit('setEtherscanAPIKey', apiKey);
      localStorage.explorerConfigSettings = JSON.stringify(context.state.settings);
    },
  },
};
