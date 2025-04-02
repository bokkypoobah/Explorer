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
                    <v-text-field readonly v-model="name" label="ENS Name:" density="compact" hide-details></v-text-field>
                  </v-col>
                </v-row>
                <v-row dense>
                  <v-col cols="11">
                    <v-text-field
                      readonly
                      v-model="resolvedAddress"
                      label="Resolved Address:"
                      append-inner-icon="mdi-arrow-right-bold-outline"
                      @click:append-inner="navigateToAddress(resolvedAddress)"
                      density="compact"
                      hide-details
                    >
                    </v-text-field>
                  </v-col>
                </v-row>
              </v-col>
              <v-col cols="6">
                <v-img :src="avatar" width="400"></v-img>
              </v-col>
            </v-row>
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
    resolvedAddress() {
      return store.getters['name/info'].resolvedAddress || null;
    },
    avatar() {
      return store.getters['name/info'].avatar || null;
    },
    timestamp() {
      return store.getters['name/timestamp'];
    },
    timestampString: {
      get: function() {
        return this.timestamp && this.formatTimestamp(this.timestamp) || null;
      },
    },

  },
  methods: {
    navigateToAddress(link) {
      console.log(now() + " Name - methods.navigateToAddress - link: " + link);
      this.$router.push({ name: 'AddressAddress', params: { inputAddress: link } });
      store.dispatch('address/loadAddress', { inputAddress: link, forceUpdate: false });
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
