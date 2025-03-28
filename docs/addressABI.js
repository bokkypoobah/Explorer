const AddressABI = {
  template: `
    <div>
      <v-card>
        <h3 class="ms-2 mt-2">Address {{ inputAddress }} ABI</h3>
        <v-card-text>
          <v-textarea v-model="abi" label="ABI" rows="5">
          </v-textarea>
          <!-- <v-data-table :items="functionsList" :headers="headers" @click:row="handleClick" density="compact"> -->
          <v-data-table :items="functionsList" :headers="headers">
          </v-data-table>
        </v-card-text>
      </v-card>
    </div>
  `,
  props: ['inputAddress'],
  data: function () {
    return {
      address: null, // TODO: Delete
      _timerId: null,
      headers: [
        { title: 'Method Id', value: 'methodId', align: 'end', sortable: true },
        { title: 'Full Function Name', value: 'fullName', sortable: true },
      ],
    };
  },
  computed: {
    info() {
      return store.getters['address/info'];
    },
    abi: {
      get: function() {
        return JSON.stringify(store.getters['address/info'].abi);
      },
      set: function(abiString) {
        console.log(now() + " AddressABI - computed.abi.set - abiString: " + abiString);
        clearTimeout(this._timerId)
        this._timerId = setTimeout(() => {
          // store.dispatch('setABI', abiString);
          console.log(now() + " AddressABI - computed.abi.set - DEBOUNCED abiString: " + abiString);
        }, 1000)
      },
    },
    functions() {
      return store.getters['address/functions'];
    },
    events() {
      return store.getters['address/events'];
    },
    functionsList() {
      const results = [];
      for (const [methodId, functionData] of Object.entries(this.functions)) {
        // results.push({ methodId, fullName: functionData.fullName });
        results.push({ methodId, fullName: functionData.fullName, ...functionData });
      }
      return results;
    },

  },
  methods: {
    handleClick(event, row) {
      console.log(now() + " AddressABI - handleClick - event: " + JSON.stringify(event, null, 2) + ", row: " + JSON.stringify(row, null, 2));
    },
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
