const Address = {
  template: `
    <div>
      <v-card>
        <h3 class="ms-2 mt-2">Address {{ inputAddress }} Summary</h3>

        <!-- <v-tabs
          v-model="tab"
          align-tabs="end"
          color="deep-purple-accent-4"
        >
          <v-tab value="one">Item One</v-tab>
          <v-tab value="two">Item Two</v-tab>
          <v-tab value="three">Item Three</v-tab>
        </v-tabs>

        <v-card-text>
          <v-tabs-window v-model="tab">
            <v-tabs-window-item value="one">
              One
            </v-tabs-window-item>

            <v-tabs-window-item value="two">
              Two
            </v-tabs-window-item>

            <v-tabs-window-item value="three">
              Three
            </v-tabs-window-item>
          </v-tabs-window>
        </v-card-text> -->


        <v-card-text>
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
  },
  methods: {

  },
  beforeCreate() {
    console.log(now() + " Address - beforeCreate");
	},
  mounted() {
    console.log(now() + " Address - mounted - inputAddress: " + this.inputAddress + ", tab: " + this.tab);
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
