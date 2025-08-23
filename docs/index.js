const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes,
});

const store = new Vuex.Store({
  state: {
    db: {
      name: "explorer088j",
      version: 1,
      schemaDefinition: {
        blocks: '[chainId+number]',
        tokenEvents: '[chainId+address+blockNumber+logIndex]',
        punkEvents: '[chainId+address+blockNumber+logIndex],punkId,type',
        addressEvents: '[address+chainId+blockNumber+logIndex]',
        cache: '&objectName',
      },
    },
  },
  getters: {
    db: state => state.db,
  },
  mutations: {
  },
  actions: {
  },
  modules: {
    address: addressModule,
    addressBook: addressBookModule,
    addresses: addressesModule,
    block: blockModule,
    blocks: blocksModule,
    config: configModule,
    name: nameModule,
    portfolio: portfolioModule,
    punks: punksModule,
    search: searchModule,
    token: tokenModule,
    transaction: transactionModule,
    web3: web3Module,
  },
  plugins: [
  ],
});

const vuetify = Vuetify.createVuetify({
  // components,
  // directives,
});

Vuetify.useHotkey('cmd+k', () => {
  console.log(now() + " index.js - Vuetify.useHotkey cmd+k => search");
  store.dispatch('search/setShow', true);
});
Vuetify.useHotkey('cmd+b', () => {
  console.log(now() + " index.js - Vuetify.useHotkey cmd+b => addressBook");
  store.dispatch('addressBook/setShow', true);
});

const app = Vue.createApp({
  // icons: {
  //   iconfont: 'mdiSvg', // 'mdi' || 'mdiSvg' || 'md' || 'fa' || 'fa4' || 'faSvg'
  // },
  // router,
  // store,
  // vuetify,
  data() {
    return {
      searchString: null,
      _timerId: null,
      searchAddress: {
        type: null,
        name: null,
        decimals: null,
        displayDialog: false,
      }
    }
  },
  computed: {
    connected() {
      return store.getters['web3/connected'];
    },
    chainId() {
      return store.getters['web3/chainId'];
    },
    coinbase() {
      return store.getters['web3/coinbase'];
    },
    explorer() {
      return store.getters['web3/explorer'];
    },
    router() {
      return this.$router && this.$router.currentRoute; // && ("(" + JSON.stringify(this.$router.currentRoute) + ")") || null;
    },
    mainPath() {
      // console.log(now() + " index.js - computed.addressPathInputAddress - mainPath - this.$route.path: " + this.$route.path);
      if (this.$route.path == "/") {
        return "/";
      }
      const parts = this.$route.path.split("/");
      return parts.length >= 2 && ("/" + parts[1]) || null;
    },
    samples() {
      const results = [];
      console.log(now() + " index.js - computed.samples");
      for (const sample of (SAMPLES[this.chainId] || [])) {
        results.push({ value: sample.address, title: sample.address, subtitle: sample.info });
      }
      return results;
    },
  },
  methods: {
    connect(connected) {
      store.dispatch('web3/connect');
    },
    disconnect(connected) {
      store.dispatch('web3/disconnect');
    },
    showSearch(connected) {
      store.dispatch('search/setShow', true);
    },
    async search() {
      console.log(now() + " index.js - methods.search - this.searchString: " + JSON.stringify(this.searchString));
      clearTimeout(this._timerId);
      this._timerId = setTimeout(async () => {
        await this.searchDebounced();
      }, 500);
    },
    async searchDebounced() {
      const blockRegex = /^\d+$/;
      const txRegex = /^0x[a-fA-F0-9]{64}$/;
      const addressRegex = /^0x[a-fA-F0-9]{40}$/;
      // const ensNameRegex = /^([a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*)(\.eth)?$/;
      // console.log(now() + " index.js - methods.searchDebounced - this.searchString: " + JSON.stringify(this.searchString));
      if (this.searchString) {
        const searchString = this.searchString.value || this.searchString;
        // console.log(now() + " index.js - methods.searchDebounced - searchString: " + JSON.stringify(searchString));
        if (blockRegex.test(searchString)) {
          console.log(now() + " index.js - methods.searchDebounced - BLOCK searchString: " + JSON.stringify(searchString));
          this.$router.push({ name: 'Block', params: { inputBlockNumber: searchString } });
          store.dispatch('block/loadBlock', searchString);
        } else if (txRegex.test(searchString)) {
          console.log(now() + " index.js - methods.searchDebounced - TX searchString: " + JSON.stringify(searchString));
          this.$router.push({ name: 'Transaction', params: { inputTxHash: searchString } });
          store.dispatch('transaction/loadTransaction', searchString);
        } else if (addressRegex.test(searchString)) {
          console.log(now() + " index.js - methods.searchDebounced - ADDRESS searchString: " + JSON.stringify(searchString));
          this.searchAddress.type = null;
          this.searchAddress.name = null;
          this.searchAddress.decimals = null;
          const validatedAddress = validateAddress(searchString);
          if (validatedAddress && window.ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            try {
              const code = await provider.getCode(validatedAddress);
              if (code == "0x") {
                this.searchAddress.type = "eoa";
              }
            } catch (e) {
              console.error(now() + " index.js:searchDebounced - provider.getCode: " + e.message);
            }
            if (!this.searchAddress.type) {
              const tokenContract = new ethers.Contract(validatedAddress, TOKEN_ABI, provider);
              try {
                this.searchAddress.name = await tokenContract.name();
                console.log(now() + " index.js:searchDebounced - this.searchAddress.name: " + this.searchAddress.name);
              } catch (e) {
                console.error(now() + " index.js:searchDebounced - ERROR tokenContract.name(): " + e.message);
              }
              try {
                this.searchAddress.decimals = parseInt(await tokenContract.decimals());
                console.log(now() + " index.js:searchDebounced - this.searchAddress.decimals: " + this.searchAddress.decimals);
              } catch (e) {
                console.error(now() + " index.js:searchDebounced - ERROR tokenContract.decimals(): " + e.message);
              }
              if (this.searchAddress.name && this.searchAddress.decimals) {
                this.searchAddress.type = "erc20";
              }
              if (!this.searchAddress.type) {
                try {
                  if (await tokenContract.supportsInterface(ERC721_INTERFACE)) {
                    this.searchAddress.type = "erc721";
                  }
                } catch (e) {
                  console.error(now() + " index.js:searchDebounced - ERROR tokenContract.supportsInterface(ERC721_INTERFACE): " + e.message);
                }
              }
              if (!this.searchAddress.type) {
                try {
                  if (await tokenContract.supportsInterface(ERC1155_INTERFACE)) {
                    this.searchAddress.type = "erc1155";
                  }
                } catch (e) {
                  console.error(now() + " index.js:searchDebounced - ERROR tokenContract.supportsInterface(ERC721_INTERFACE): " + e.message);
                }
              }
              try {
                this.searchAddress.name = await tokenContract.name();
              } catch (e) {
                console.error(now() + " index.js:searchDebounced - ERROR tokenContract.name(): " + e.message);
              }
              if (!this.searchAddress.type) {
                this.searchAddress.type = "contract";
              }
            }
            console.log(now() + " index.js:searchDebounced - this.searchAddress.type: " + this.searchAddress.type);
            console.log(now() + " index.js:searchDebounced - this.searchAddress.name: " + this.searchAddress.name);
            console.log(now() + " index.js:searchDebounced - this.searchAddress.decimals: " + this.searchAddress.decimals);
          }
          if (["erc20", "erc721", "erc1155"].includes(this.searchAddress.type)) {
            this.searchAddress.displayDialog = true;
          } else {
            this.$router.push({ name: 'AddressAddress', params: { inputAddress: validatedAddress } });
            store.dispatch('address/loadAddress', { inputAddress: validatedAddress, forceUpdate: false });
          }
        } else {
          console.log(now() + " index.js - methods.searchDebounced - NAME searchString: " + JSON.stringify(searchString));
          const inputName = /\.eth$/i.test(searchString) ? searchString.toLowerCase() : (searchString.toLowerCase() + ".eth");
          if (ethers.utils.isValidName(inputName)) {
            this.$router.push({ name: 'Name', params: { inputName } });
            store.dispatch('name/loadName', { inputName, forceUpdate: false });
          }
        }
      }
    },
    navigateToAddress(inputAddress) {
      console.log(now() + " index.js - methods.navigateToAddress - inputAddress: " + inputAddress);
      this.$router.push({ name: 'AddressAddress', params: { inputAddress } });
      store.dispatch('address/loadAddress', { inputAddress, forceUpdate: false });
    },
    navigateToToken(inputAddress) {
      console.log(now() + " index.js - methods.navigateToToken - inputAddress: " + inputAddress);
      this.$router.push({ name: 'Token', params: { inputAddress } });
      store.dispatch('token/loadToken', { inputAddress, forceUpdate: false });
    },
  },
  beforeCreate() {
    console.log(now() + " index.js - app:beforeCreate");
	},
  mounted() {
    console.log(now() + " index.js - app.mounted");
    store.dispatch('config/loadConfig');
    store.dispatch('addresses/loadAddresses');
    store.dispatch('blocks/startup');
  },
  destroyed() {
    console.log(now() + " index.js - app.destroyed");
  },
});

// router.beforeEach((to, from) => {
//   console.log("router.beforeEach - to: " + JSON.stringify(to) + ", from: " + JSON.stringify(from));
// })

app.use(router);
app.use(store);
app.use(vuetify);
app.component("web3", Web3);
app.component("renderAddress", RenderAddress);
app.component("renderBlockNumber", RenderBlockNumber);
app.component("renderTokenId", RenderTokenId);
app.component("renderTxHash", RenderTxHash);
app.component("addressBook", AddressBook);
app.component("search", Search);
app.component("apexchart", VueApexCharts);
app.mount('#app');
