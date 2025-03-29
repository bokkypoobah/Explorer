const AddressContract = {
  template: `
    <div>
      <v-card>
        <v-card-text>
          <div v-if="!info || info.type == 'eoa'">
            Externally Owned Accounts don't have contract functions
          </div>
          <div v-if="info && info.type != 'eoa'">
            <h3 class="ms-2 mt-2">Address {{ inputAddress }} Contract</h3>
            <p>TODO</p>
            <p>{{ inputAddress }}</p>
          </div>
        </v-card-text>
      </v-card>
    </div>
  `,
  props: ['inputAddress'],
  data: function () {
    return {
      settings: {
        tab: null,
        version: 0,
      },
    };
  },
  computed: {
    address() {
      return store.getters['address/address'];
    },
    info() {
      return store.getters['address/info'];
    },
  },
  methods: {
    saveSettings() {
      console.log(now() + " AddressContract - saveSettings - settings: " + JSON.stringify(this.settings, null, 2));
      localStorage.explorerAddressContractSettings = JSON.stringify(this.settings);
    },
  },
  beforeCreate() {
    console.log(now() + " AddressContract - beforeCreate");
	},
  mounted() {
    console.log(now() + " AddressContract - mounted");
    const t = this;
    setTimeout(function() {
      store.dispatch('address/loadAddress', t.inputAddress);
    }, 1000);
	},
  unmounted() {
    console.log(now() + " AddressContract - unmounted");
	},
  destroyed() {
    console.log(now() + " AddressContract - destroyed");
	},
};
