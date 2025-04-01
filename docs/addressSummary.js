const AddressSummary = {
  template: `
    <div>
      <v-card>
        <h3 class="ms-2 mt-2">AddressSummary {{ inputAddress }} Summary</h3>
        <v-card-text>
          <!-- <v-textarea :model-value="JSON.stringify(functions, null, 2)" label="Functions" rows="10">
          </v-textarea>
          <v-textarea :model-value="JSON.stringify(events, null, 2)" label="Events" rows="10">
          </v-textarea> -->
          <v-textarea :model-value="JSON.stringify(info, null, 2)" label="Info" rows="20">
          </v-textarea>
          <!-- info: {{ info }}
          <br />
          address: {{ address }}
          <br />
          transactionCount: {{ transactionCount }}
          <br />
          balance: {{ balance }} -->
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
    functions() {
      return store.getters['address/functions'];
    },
    events() {
      return store.getters['address/events'];
    },
  },
  methods: {

  },
  beforeCreate() {
    console.log(now() + " AddressSummary - beforeCreate");
	},
  mounted() {
    console.log(now() + " AddressSummary - mounted - inputAddress: " + this.inputAddress);
    const t = this;
    setTimeout(function() {
      store.dispatch('address/loadAddress', { inputAddress: t.inputAddress, forceUpdate: false });
    }, 1000);
	},
  unmounted() {
    console.log(now() + " AddressSummary - unmounted");
	},
  destroyed() {
    console.log(now() + " AddressSummary - destroyed");
	},
};
