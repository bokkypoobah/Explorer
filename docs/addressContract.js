const AddressContract = {
  template: `
    <div>
      <v-card>
        <v-card-text>
          <div v-if="!info || info.type == 'eoa'">
            Externally Owned Accounts don't have contract functions
          </div>
          <div v-if="info && info.type != 'eoa'">
            <!-- isValid: {{ isValid }} -->
            <v-row>
              <v-col cols="2">
              <v-tabs v-model="settings.tab" @update:modelValue="saveSettings();" color="primary" direction="vertical">
                <v-tab prepend-icon="mdi-function" text="Call" value="call"></v-tab>
                <v-tab prepend-icon="mdi-send" text="Execute" value="execute"></v-tab>
              </v-tabs>
              </v-col>
              <v-col cols="10">
                <v-select v-model="selectedMethodId" :items="functionList" label="Select a function">
                </v-select>
                <v-card title="Inputs">
                  <v-card-text>
                    <v-form ref="form">
                      <div v-if="selectedFunctionInputs.length == 0">
                        No inputs
                      </div>
                      <v-row v-for="(item, inputIndex) of selectedFunctionInputs" no-gutters dense>
                        <v-col>
                          {{ inputIndex + 1}}
                        </v-col>
                        <v-col cols="11">
                          <div v-if="item.arrayLength == null">
                            {{ item }}
                            <div v-if="item.type == 'address'">
                              <v-text-field :model-value="getInput(inputIndex)" :rules="addressRules" @update:modelValue="setInput(inputIndex, $event)" :label="item.name || '(unnamed)'" :placeholder="item.type" :hint="item.type" density="compact"></v-text-field>
                            </div>
                            <div v-else>
                              <v-text-field :model-value="getInput(inputIndex)" @update:modelValue="setInput(inputIndex, $event)" :label="item.name || '(unnamed)'" :placeholder="item.type" :hint="item.type" density="compact"></v-text-field>
                            </div>
                          </div>
                          <div v-else>
                            <v-row v-for="(arrayItem, arrayIndex) of getInput(inputIndex)" no-gutters dense>
                              <v-col>
                                {{ arrayIndex + 1}}
                              </v-col>
                              <v-col cols="9">
                                <v-text-field :model-value="getInput(inputIndex)[arrayIndex]" @update:modelValue="setInputArrayElement(inputIndex, arrayIndex, $event)" :label="(item.name || '(unnamed)') + '[' + arrayIndex + ']'" :placeholder="item.arrayChildren.type" :hint="item.arrayChildren.type" density="compact"></v-text-field>
                                <!-- {{ arrayItem }} -->
                              </v-col>
                              <v-col cols="2">
                                <v-btn v-if="item.arrayLength == -1" @click="removeInputArrayElement(inputIndex, arrayIndex);" text class="ms-2">Delete Row</v-btn>
                              </v-col>
                            </v-row>
                            <v-row no-gutters dense>
                              <v-col cols="10">
                              </v-col>
                              <v-col cols="2">
                                <v-btn v-if="item.arrayLength == -1" @click="addNewInputArrayItem(inputIndex);" text class="ms-2 mb-2">Add New Row</v-btn>
                              </v-col>
                            </v-row>
                            <!-- <pre>
  array: {{ getInput(inputIndex) }}
                            </pre> -->
                          </div>
                          <!-- {{ item }} -->
                        </v-col>
                      </v-row>
                    </v-form>
                  </v-card-text>
                </v-card>
                <v-btn @click="callFunction();" class="ms-2 mt-2 mb-2" text>Call</v-btn>
                <p v-if="error" class="text-error ms-2">{{ error }}</p>
                <v-card title="Outputs" class="mt-1">
                  <v-card-text>
                    <div v-if="selectedFunctionOutputs.length == 0">
                      No outputs
                    </div>
                    <v-row v-for="(item, outputIndex) of selectedFunctionOutputs">
                      <v-col>
                        {{ outputIndex + 1 }}
                      </v-col>
                      <v-col cols="11">
                        <div v-if="item.arrayLength == null">
                          <v-text-field :model-value="getOutput(outputIndex)" :label="item.name || '(unnamed)'" :placeholder="item.type" :hint="item.type" density="compact"></v-text-field>
                        </div>
                        <div v-else>
                          <v-row v-for="(arrayItem, arrayIndex) of getOutput(outputIndex)">
                            <v-col>
                              {{ arrayIndex + 1 }}
                            </v-col>
                            <v-col cols="11">
                              <v-text-field :model-value="getOutput(outputIndex)[arrayIndex]" :label="(item.name || '(unnamed)') + '[' + arrayIndex + ']'" :placeholder="item.arrayChildren.type" :hint="item.arrayChildren.type" density="compact"></v-text-field>
                              {{ arrayItem }}
                            </v-col>
                          </v-row>
                        </div>
                        {{ item }}
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
                <!-- <br />
                selectedFunction: {{ selectedFunction }}
                <br />
                selectedMethodId: {{ selectedMethodId }} -->
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
        inputs: {},
        outputs: {},
        version: 1,
      },
      addressRules: [
        (v) => (v || '').length > 0 || 'Address is required',
        (v) => {
          try {
            ethers.utils.getAddress(v);
            return true;
          } catch (e) {
            return 'Invalid Address';
          }
        },
      ],
      error: null,
      _timerIds: {}, // TODO: Delete
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
      // console.log(now() + " AddressContract - computed.selectedFunction");
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
    // isValid() {
    //   // return this.$refs.form.validate();
    //   const status = this.$refs.form && this.$refs.form.validate();
    //   return status;
    // },
  },
  methods: {
    getInput(index) {
      // console.log(now() + " AddressContract - getInput - selectedFunctionInputs[" + index + "]: " + JSON.stringify(this.selectedFunctionInputs[index]));
      if (this.address && this.settings.inputs[this.address] && this.settings.inputs[this.address][this.selectedMethodId] && (index in this.settings.inputs[this.address][this.selectedMethodId])) {
        return this.settings.inputs[this.address][this.selectedMethodId][index];
      }
      if (this.selectedFunctionInputs[index].arrayLength == -1) {
        return [];
      } else if (this.selectedFunctionInputs[index].arrayLength > 0) {
        return new Array(this.selectedFunctionInputs[index].arrayLength).fill(null);
      }
      return null;
    },
    // setInput(index, value) {
    //   console.log(now() + " AddressContract - setInput - index: " + index + ", value: " + JSON.stringify(value));
    //   clearTimeout(this._timerIds[index] || null);
    //   const t = this;
    //   this._timerIds[index] = setTimeout(() => {
    //     console.log(now() + " AddressABI - setInput - DEBOUNCED");
    //     t.setInputDEBOUNCED(index, value);
    //   }, 1000)
    // },
    addNewInputArrayItem(index) {
      // console.log(now() + " AddressContract - addNewInputArrayItem - index: " + index);
      if (!(this.address in this.settings.inputs)) {
        this.settings.inputs[this.address] = {};
      }
      if (!(this.selectedMethodId in this.settings.inputs[this.address])) {
        this.settings.inputs[this.address][this.selectedMethodId] = {};
      }
      if (!(index in this.settings.inputs[this.address][this.selectedMethodId])) {
        this.settings.inputs[this.address][this.selectedMethodId][index] = [];
      }
      this.settings.inputs[this.address][this.selectedMethodId][index].push(null);
      this.saveSettings();
    },
    setInputArrayElement(inputIndex, arrayIndex, elementValue) {
      // console.log(now() + " AddressContract - setInputArrayElement - inputIndex: " + inputIndex + ", arrayIndex: " + arrayIndex + ", elementValue: " + elementValue);
      if (this.address && this.settings.inputs[this.address] && this.settings.inputs[this.address][this.selectedMethodId]) {
        if (!(inputIndex in this.settings.inputs[this.address][this.selectedMethodId])) {
          this.settings.inputs[this.address][this.selectedMethodId][inputIndex] = new Array(this.selectedFunctionInputs[inputIndex].arrayLength).fill(null);
        }
        this.settings.inputs[this.address][this.selectedMethodId][inputIndex][arrayIndex] = elementValue;
      }
      this.saveSettings();
    },
    removeInputArrayElement(inputIndex, arrayIndex) {
      // console.log(now() + " AddressContract - removeInputArrayElement - inputIndex: " + inputIndex + ", arrayIndex: " + arrayIndex);
      if (this.address && this.settings.inputs[this.address] && this.settings.inputs[this.address][this.selectedMethodId]) {
        if (inputIndex in this.settings.inputs[this.address][this.selectedMethodId]) {
          const array = this.settings.inputs[this.address][this.selectedMethodId][inputIndex];
          array.splice(arrayIndex, 1);
          this.settings.inputs[this.address][this.selectedMethodId][inputIndex] = array;
        }
      }
      this.saveSettings();
    },
    setInput(index, value) {
      // console.log(now() + " AddressContract - setInput - index: " + index + ", value: " + JSON.stringify(value));
      if (!(this.address in this.settings.inputs)) {
        this.settings.inputs[this.address] = {};
      }
      if (!(this.selectedMethodId in this.settings.inputs[this.address])) {
        this.settings.inputs[this.address][this.selectedMethodId] = {};
      }
      this.settings.inputs[this.address][this.selectedMethodId][index] = value;
      this.saveSettings();
    },
    getOutput(index) {
      console.log(now() + " AddressContract - getOutput - selectedFunctionOutputs[" + index + "]: " + JSON.stringify(this.selectedFunctionOutputs[index]));
      if (this.address && this.settings.outputs[this.address] && this.settings.outputs[this.address][this.selectedMethodId] && (index in this.settings.outputs[this.address][this.selectedMethodId])) {
        return this.settings.outputs[this.address][this.selectedMethodId][index];
      }
      if (this.selectedFunctionOutputs[index].arrayLength == -1) {
        return [];
      } else if (this.selectedFunctionOutputs[index].arrayLength > 0) {
        return new Array(this.selectedFunctionOutputs[index].arrayLength).fill(null);
      }
      return null;
    },
    setOutputs(outputs) {
      console.log(now() + " AddressContract - setOutputs - outputs: " + JSON.stringify(outputs));
      if (!(this.address in this.settings.outputs)) {
        this.settings.outputs[this.address] = {};
      }
      this.settings.outputs[this.address][this.selectedMethodId] = outputs;
      this.saveSettings();
    },
    async callFunction() {
      const validationStatus = await this.$refs.form.validate();
      console.log(now() + " AddressContract - callFunction - validationStatus: " + JSON.stringify(validationStatus, null, 2));
      if (!validationStatus.valid) {
        this.error = "One or more fields failed the validation check";
      } else {
        this.error = null;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      // console.log(now() + " AddressContract - callFunction - selectedFunction: " + JSON.stringify(this.selectedFunction, null, 2));
      const addressInfo = store.getters["addresses/getAddressInfo"](this.address);
      // console.log(now() + " AddressContract - callFunction - addressInfo: " + JSON.stringify(addressInfo, null, 2));
      const parameters = [];
      for (const [index, input] of this.selectedFunctionInputs.entries()) {
        console.log(index + " => " + JSON.stringify(input));
        const value = this.getInput(index);
        parameters.push(value);
      }
      // TODO
      const contract = new ethers.Contract(this.address, addressInfo.abi, provider);
      try {
        const results = await contract[this.selectedFunction.name](...parameters);
        console.log(now() + " AddressContract - callFunction - results: " + JSON.stringify(results));
        const outputs = [];
        for (const [index, output] of this.selectedFunction.outputs.entries()) {
          // console.log(index + " => " + typeof output + " " + JSON.stringify(output));
          let value;
          if (Array.isArray(results)) {
            value = results[index];
          } else {
            value = results;
          }
          if (output.type == "uint256") {
            outputs.push(ethers.BigNumber.from(value).toString());
          } else {
            outputs.push(value);
          }
        }
        console.log(now() + " AddressContract - callFunction - outputs: " + JSON.stringify(outputs));
        this.setOutputs(outputs);
      } catch (e) {
        console.error(now() + " AddressContract - callFunction - ERROR: " + e.message);
      }
    },
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
