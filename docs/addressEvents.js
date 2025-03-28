const AddressEvents = {
  template: `
    <div>
      <h3 class="ms-2 mt-2">Address Events</h3>
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
    console.log(now() + " AddressEvents - beforeCreate");
	},
  mounted() {
    console.log(now() + " AddressEvents - mounted");
    const t = this;
    setTimeout(function() {
      store.dispatch('address/loadAddress', t.inputAddress);
    }, 1000);
	},
  unmounted() {
    console.log(now() + " AddressEvents - unmounted");
	},
  destroyed() {
    console.log(now() + " AddressEvents - destroyed");
	},
};
