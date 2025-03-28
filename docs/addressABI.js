const AddressABI = {
  template: `
    <div>
      <v-card>
        <h3 class="ms-2 mt-2">Address {{ inputAddress }} ABI</h3>
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
    console.log(now() + " AddressABI - beforeCreate");
	},
  mounted() {
    console.log(now() + " AddressABI - mounted");
    const t = this;
    setTimeout(function() {
      store.dispatch('address/loadAddress', t.inputAddress);
    }, 1000);
	},
  unmounted() {
    console.log(now() + " AddressABI - unmounted");
	},
  destroyed() {
    console.log(now() + " AddressABI - destroyed");
	},
};
