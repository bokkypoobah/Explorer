const Address = {
  template: `
    <div>
      <v-card>
        <h3 class="ms-2 mt-2">Address {{ inputAddress }} Summary</h3>

        <v-card-text>
          info: {{ info }}
          <br />
          address: {{ address }}
          <br />
          transactionCount: {{ transactionCount }}
          <br />
          balance: {{ balance }}
        </v-card-text>
        <!-- <v-card-actions>
          <v-btn>Action 1</v-btn>
          <v-btn>Action 2</v-btn>
        </v-card-actions> -->
      </v-card>
    </div>
  `,
  props: ['inputAddress', 'tab'],
  data: function () {
    return {
      // tab: null,
      // address: null,
    };
  },
  computed: {
    address() {
      return store.getters['address/address'];
    },
    transactionCount() {
      return store.getters['address/transactionCount'];
    },
    balance() {
      return store.getters['address/balance'];
    },
    info() {
      return store.getters['address/info'];
    },
  },
  methods: {

  },
  beforeCreate() {
    console.log(now() + " Address - beforeCreate");
	},
  mounted() {
    console.log(now() + " Address - mounted - inputAddress: " + this.inputAddress);
    const t = this;
    setTimeout(function() {
      store.dispatch('address/loadAddress', t.inputAddress);
    }, 1000);
	},
  unmounted() {
    console.log(now() + " Address - unmounted");
	},
  destroyed() {
    console.log(now() + " Address - destroyed");
	},
};
