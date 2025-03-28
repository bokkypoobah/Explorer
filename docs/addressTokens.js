const AddressTokens = {
  template: `
    <div>
      <h3 class="ms-2 mt-2">Address Tokens</h3>
      <p>TODO</p>
      <p>{{ inputAddress }}</p>
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
      store.dispatch('address/loadAddress', t.inputAddress);
    }, 1000);
	},
  unmounted() {
    console.log(now() + " AddressTokens - unmounted");
	},
  destroyed() {
    console.log(now() + " AddressTokens - destroyed");
	},
};
