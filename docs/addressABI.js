const AddressABI = {
  template: `
    <div>
      <v-card>
        <v-card-text>
          <h3 class="ms-2 mt-2">ABI</h3>
          <v-textarea v-model="abi" label="ABI" rows="10">
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
      address: null, // TODO: Delete
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
          // TODO:
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
