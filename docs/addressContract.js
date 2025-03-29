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
                <!-- <v-select v-model="selected" :items="functionList" item-title="fullName" item-value="methodId" label="Select an item"> -->
                <!-- <v-select v-model="selected" :items="functionList" @update:modelValue="saveSettings();" label="Select a function"> -->
                <v-select v-model="selectedMethodId" :items="functionList" label="Select a function">
                  <!-- <template v-slot:item="{ item, props }">
                    <v-list-item v-bind="props">
                      <v-list-item-content>
                        <v-list-item-title>
                          <span>{{ item.raw.fullName }}</span>
                        </v-list-item-title>
                      </v-list-item-content>
                    </v-list-item>
                  </template> -->
                  <!-- <template v-slot:selection="{ item }">
                    <span>{{ item.raw.fullName }}</span>
                  </template> -->
                </v-select>
                selectedFunctionInputs: {{ selectedFunctionInputs }}
                <br />
                selectedFunctionOutputs: {{ selectedFunctionOutputs }}
                <br />
                selectedFunction: {{ selectedFunction }}
                <br />
                selectedMethodId: {{ selectedMethodId }}
                <!-- <h3 class="ms-2 mt-2">Address {{ inputAddress }} Contract</h3>
                <p>TODO</p>
                <p>{{ inputAddress }}</p> -->
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
        selectedMethodIds: {},
        version: 0,
      },
      selected: null,
    };
  },
  computed: {
    address() {
      return store.getters['address/address'];
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
    selectedMethodId: {
      get: function() {
        return this.address && this.settings.selectedMethodIds[this.address] && this.settings.selectedMethodIds[this.address][this.settings.tab] || null;
      },
      set: function(methodId) {
        if (this.address) {
          if (!(this.address in this.settings.selectedMethodIds)) {
            this.settings.selectedMethodIds[this.address] = {};
          }
          this.settings.selectedMethodIds[this.address][this.settings.tab] = methodId;
          console.log(now() + " AddressContract - computed.selectedMethodId.set - this.settings: " + JSON.stringify(this.settings));
        }
        this.saveSettings();
      },
    },
    selectedFunction() {
      console.log(now() + " AddressContract - computed.selectedFunction");
      return this.selectedMethodId && this.functions[this.selectedMethodId] || {};
    },
    selectedFunctionInputs() {
      return this.selectedFunction.inputs || [];
    },
    selectedFunctionOutputs() {
      return this.selectedFunction.outputs || [];
    },
    functionList() {
      // console.log(now() + " AddressContract - computed.functionList - this.functions: " + JSON.stringify(this.functions));
      // const addressInfo = store.getters["addresses/getAddressInfo"](this.address);
      const results = [];
      for (const [methodId, functionData] of Object.entries(this.functions)) {
        if (this.settings.tab == "call") {
          if (functionData.constant) {
            results.push({ value: methodId, title: functionData.fullName });
          }
        } else if (this.settings.tab == "execute") {
          if (!functionData.constant) {
            results.push({ value: methodId, title: functionData.fullName });
          }
        }
      }
      results.sort((a, b) => {
        return ('' + a.fullName).localeCompare(b.fullName);
      });
      return results;
    },
  },
  methods: {
    saveSettings() {
      // console.log(now() + " AddressContract - saveSettings - settings: " + JSON.stringify(this.settings, null, 2));
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
      // console.log(now() + " AddressContract - mounted - tempSettings: " + JSON.stringify(tempSettings));
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
