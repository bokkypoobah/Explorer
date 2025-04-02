const Name = {
  template: `
    <div>
      <v-card v-if="!inputName">
        <v-card-text>
          Enter ENS name in the search field above
        </v-card-text>
      </v-card>
      <v-container v-if="inputName && name" fluid class="pa-1">
        <v-card>
          <v-card-text>
            name: {{ name }}
            <br />
            resolvedAddress: <a :href="'#/address/' + resolvedAddress">{{ resolvedAddress }}</a>
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
      return store.getters['name/info'].resolvedAddress;
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
