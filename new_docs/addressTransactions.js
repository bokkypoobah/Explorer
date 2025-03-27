const AddressTransactions = {
  template: `
    <div>
      <h3 class="ms-2 mt-2">Address Transactions</h3>
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
    console.log(now() + " AddressTransactions - beforeCreate");
	},
  mounted() {
    console.log(now() + " AddressTransactions - mounted");
	},
  unmounted() {
    console.log(now() + " AddressTransactions - unmounted");
	},
  destroyed() {
    console.log(now() + " AddressTransactions - destroyed");
	},
};
