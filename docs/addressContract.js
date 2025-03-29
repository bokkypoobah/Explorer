const AddressContract = {
  template: `
    <div>
      <v-card>
        <v-card-text>
          <div v-if="!info || info.type == 'eoa'">
            Externally Owned Accounts don't have contract functions
          </div>
          <div v-if="info && info.type != 'eoa'">
            <v-row>
              <v-col cols="2">
              <v-tabs v-model="settings.tab" @update:modelValue="saveSettings();" color="primary" direction="vertical">
                <v-tab prepend-icon="mdi-function" text="Call" value="call"></v-tab>
                <v-tab prepend-icon="mdi-send" text="Execute" value="execute"></v-tab>
              </v-tabs>
              </v-col>
              <v-col cols="10">
                <h3 class="ms-2 mt-2">Address {{ inputAddress }} Contract</h3>
                <p>TODO</p>
                <p>{{ inputAddress }}</p>
              </v-col>
            </v-row>
          </div>
        </v-card-text>
      </v-card>
    </div>
  `,
  props: ['inputAddress'],
  data: function () {
    return {
      initialised: false,
      settings: {
        tab: null,
        version: 0,
      },
    };
  },
  computed: {
    address() {
      return store.getters['address/address'];
    },
    info() {
      return store.getters['address/info'];
    },
  },
  methods: {
    saveSettings() {
      console.log(now() + " AddressContract - saveSettings - settings: " + JSON.stringify(this.settings, null, 2));
      if (this.initialised) {
        localStorage.explorerAddressContractSettings = JSON.stringify(this.settings);
      }
    },
  },
  beforeCreate() {
    console.log(now() + " AddressContract - beforeCreate");
	},
  mounted() {
    console.log(now() + " AddressContract - mounted");
    if ('explorerAddressContractSettings' in localStorage) {
      const tempSettings = JSON.parse(localStorage.explorerAddressContractSettings);
      console.log(now() + " AddressContract - mounted - tempSettings: " + JSON.stringify(tempSettings));
      if ('version' in tempSettings && tempSettings.version == this.settings.version) {
        this.settings = tempSettings;
      }
    }
    this.initialised = true;
    const t = this;
    setTimeout(function() {
      store.dispatch('address/loadAddress', t.inputAddress);
    }, 1000);
	},
  unmounted() {
    console.log(now() + " AddressContract - unmounted");
	},
  destroyed() {
    console.log(now() + " AddressContract - destroyed");
	},
};
