const AddressTokens = {
  template: `
    <div>
      <v-card>
        <h3 class="ms-2 mt-2">Address {{ inputAddress }} Tokens</h3>
        <v-card-text>
          <p>TODO</p>
          <p>{{ inputAddress }}</p>
        </v-card-text>
      </v-card>
    </div>
  `,
  props: ['inputAddress'],
  data: function () {
    return {
      address: null,
    };
  },
  computed: {

  },
  methods: {

  },
  beforeCreate() {
    console.log(now() + " AddressTokens - beforeCreate");
	},
  mounted() {
    console.log(now() + " AddressTokens - mounted");
    const t = this;
    setTimeout(function() {
      store.dispatch('address/loadAddress', { inputAddress: t.inputAddress, forceUpdate: false });
    }, 1000);
	},
  unmounted() {
    console.log(now() + " AddressTokens - unmounted");
	},
  destroyed() {
    console.log(now() + " AddressTokens - destroyed");
	},
};
