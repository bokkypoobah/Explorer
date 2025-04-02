const Name = {
  template: `
    <div>
      <!-- <v-sheet :height="200" :width="200">
        Blah
      </v-sheet> -->
      <v-card v-if="!inputName">
        <v-card-text>
          Enter ENS name in the search field above
        </v-card-text>
      </v-card>
      <v-container v-if="inputName && name" fluid class="pa-1">
        <v-card>
          <v-card-text>
            <v-row dense>
              <v-col cols="6">
                <v-row dense>
                  <v-col cols="11">
                    <!-- append-inner-icon="mdi-content-copy"
                    @click:append-inner="copyToClipboard(name)" -->
                    <v-text-field
                      readonly
                      v-model="name"
                      label="ENS Name:"
                      append-icon="mdi-link"
                      @click:append="navigateToURL('https://app.ens.domains/' + name)"
                      density="compact"
                      hide-details
                    >
                    </v-text-field>
                  </v-col>
                </v-row>
                <v-row dense>
                  <v-col cols="11">
                    <!-- append-inner-icon="mdi-content-copy"
                    @click:append-inner="copyToClipboard(resolvedAddress)" -->
                    <v-text-field
                      readonly
                      v-model="resolvedAddress"
                      label="Resolved Address:"
                      append-icon="mdi-arrow-right-bold-outline"
                      @click:append="navigateToAddress(resolvedAddress)"
                      density="compact"
                      hide-details
                    >
                    </v-text-field>
                  </v-col>
                </v-row>
                <v-row dense>
                  <v-col cols="11">
                    <!-- append-inner-icon="mdi-content-copy"
                    @click:append-inner="copyToClipboard(ethAddress)" -->
                    <v-text-field
                      readonly
                      v-model="ethAddress"
                      label="ETH Address:"
                      append-icon="mdi-arrow-right-bold-outline"
                      @click:append="navigateToAddress(ethAddress)"
                      density="compact"
                      hide-details
                    >
                    </v-text-field>
                  </v-col>
                </v-row>
                <v-row dense>
                  <v-col cols="11">
                    <!-- append-inner-icon="mdi-content-copy"
                    @click:append-inner="copyToClipboard(avatar)" -->
                    <v-text-field
                      readonly
                      v-model="avatar"
                      label="Avatar:"
                      append-icon="mdi-link"
                      @click:append="navigateToURL(avatar)"
                      density="compact"
                      hide-details
                    >
                    </v-text-field>
                  </v-col>
                </v-row>
              </v-col>
              <v-col cols="6">
                <v-img :src="avatar" width="200"></v-img>
              </v-col>
            </v-row>
            eventsList: {{ eventsList }}
            <br />
            info: {{ info }}
          </v-card-text>
        </v-card>
      </v-container>
    </div>
  `,
  props: ['inputName'],
  data: function () {
    return {
      txHash: null,
    };
  },
  computed: {
    name() {
      return store.getters['name/name'];
    },
    info() {
      return store.getters['name/info'];
    },
    resolvedAddress() {
      return store.getters['name/info'].resolvedAddress || null;
    },
    ethAddress() {
      return store.getters['name/info'].ethAddress || null;
    },
    avatar() {
      return store.getters['name/info'].avatar || null;
    },
    eventsList() {
      return store.getters['name/eventsList'];
    },
    // timestamp() {
    //   return store.getters['name/timestamp'];
    // },
    // timestampString: {
    //   get: function() {
    //     return this.timestamp && this.formatTimestamp(this.timestamp) || null;
    //   },
    // },

  },
  methods: {
    navigateToAddress(link) {
      console.log(now() + " Name - methods.navigateToAddress - link: " + link);
      this.$router.push({ name: 'AddressAddress', params: { inputAddress: link } });
      store.dispatch('address/loadAddress', { inputAddress: link, forceUpdate: false });
    },
    navigateToURL(link) {
      console.log(now() + " Name - methods.navigateToURL - link: " + link);
      window.open(link, "_blank");
    },
    copyToClipboard(str) {
      navigator.clipboard.writeText(str);
    },
    formatETH(e) {
      if (e) {
        return ethers.utils.formatEther(e).replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
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
  beforeCreate() {
    console.log(now() + " Name - beforeCreate");
	},
  mounted() {
    console.log(now() + " Name - mounted - inputName: " + this.inputName);
    const t = this;
    setTimeout(function() {
      store.dispatch('name/loadName', { inputName: t.inputName, forceUpdate: false });
    }, 1000);
	},
  unmounted() {
    console.log(now() + " Name - unmounted");
	},
  destroyed() {
    console.log(now() + " Name - destroyed");
	},
};
