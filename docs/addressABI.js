const AddressABI = {
  template: `
    <div>
      <v-card>
        <v-card-text>
          <h3 class="ms-2 mt-2">ABI</h3>
          <v-textarea v-model="abi" :rules="jsonRules" label="ABI" rows="10">
          </v-textarea>
          <h3 class="ms-2 mt-2">Functions</h3>
          <v-data-table :items="functionsList" :headers="functionsHeaders" @click:row="handleFunctionsClick" density="compact">
          </v-data-table>
          <h3 class="ms-2 mt-2">Events</h3>
          <v-data-table :items="eventsList" :headers="eventsHeaders" @click:row="handleEventsClick" density="compact">
          </v-data-table>
        </v-card-text>
      </v-card>
    </div>
  `,
  props: ['inputAddress'],
  data: function () {
    return {
      // address: null, // TODO: Delete
      // abi: null,
      jsonRules: [
        (v) => (v || '').length > 0 || 'ABI is required',
        (v) => {
          try {
            new ethers.utils.Interface(v);
            return true;
          } catch (e) {
            return 'Invalid ABI';
          }
        },
      ],
      _timerId: null,
      functionsHeaders: [
        { title: 'Method Id', value: 'methodId', align: 'end', sortable: true },
        { title: 'Function', value: 'fullName', sortable: true },
      ],
      eventsHeaders: [
        { title: 'Signature', value: 'signature', align: 'end', sortable: true },
        { title: 'Event', value: 'fullName', sortable: true },
      ],
    };
  },
  computed: {
    address() {
      return store.getters['address/address'];
    },
    info() {
      return store.getters['address/info'];
    },
    abi: {
      get: function() {
        return store.getters['address/info'].abi;
      },
      set: function(abi) {
        console.log(now() + " AddressABI - computed.abi.set - abi: " + abi);
        clearTimeout(this._timerId);
        const t = this;
        this._timerId = setTimeout(() => {
          console.log(now() + " AddressABI - computed.abi.set - DEBOUNCED abi: " + abi);
          store.dispatch('address/updateABI', { address: t.address, abi });
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
        results.push({ methodId, ...functionData });
      }
      return results;
    },
    eventsList() {
      const results = [];
      for (const [signature, eventData] of Object.entries(this.events)) {
        results.push({ signature, ...eventData });
      }
      return results;
    },
  },
  methods: {
    handleFunctionsClick(event, row) {
      console.log(now() + " AddressABI - handleFunctionsClick - event: " + JSON.stringify(event, null, 2) + ", row: " + JSON.stringify(row, null, 2));
    },
    handleEventsClick(event, row) {
      console.log(now() + " AddressABI - handleEventsClick - event: " + JSON.stringify(event, null, 2) + ", row: " + JSON.stringify(row, null, 2));
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
