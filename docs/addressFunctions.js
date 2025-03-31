const AddressFunctions = {
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
                  <v-tab prepend-icon="mdi-function" text="Call" value="call" class="lowercase-btn"></v-tab>
                  <v-tab prepend-icon="mdi-send" text="Execute" value="execute" class="lowercase-btn"></v-tab>
                </v-tabs>
              </v-col>
              <v-col cols="10">
                <div v-if="info && info.type == 'safe'" class="mb-3">
                  NOTE: The functions below are based on the ABI from the Safe v{{ info.version }} implementation at {{ info.implementation }}, used by this Gnosis Safe wallet at {{ info.address }}.
                </div>
                <v-select v-model="selectedMethodId" :items="functionList" label="Function">
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
                            <!-- {{ item }} -->
                            <v-text-field :model-value="getInput(inputIndex)" :rules="[getRulesRulesRules(item), getRuleFunction(item)]" @update:modelValue="setInput(inputIndex, $event)" :label="item.name || '(unnamed)'" :placeholder="item.type" :hint="item.type" density="compact"></v-text-field>
                          </div>
                          <div v-else>
                            <v-row v-for="(arrayItem, arrayIndex) of getInput(inputIndex)" no-gutters dense>
                              <v-col>
                                {{ arrayIndex + 1}}
                              </v-col>
                              <v-col cols="9">
                                <v-text-field :model-value="getInput(inputIndex)[arrayIndex]" :rules="[getRulesRulesRules(item.arrayChildren), getRuleFunction(item.arrayChildren)]" @update:modelValue="setInputArrayElement(inputIndex, arrayIndex, $event)" :label="(item.name || '(unnamed)') + '[' + arrayIndex + ']'" :placeholder="item.arrayChildren.type" :hint="item.arrayChildren.type" density="compact"></v-text-field>
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
                <v-btn v-if="settings.tab == 'call'" @click="callFunction();" class="ms-2 mt-2 mb-2 lowercase-btn" text>Call</v-btn>
                <v-btn v-if="settings.tab == 'execute'" disabled @click="callFunction();" class="ms-2 mt-2 mb-2 lowercase-btn" text>Execute</v-btn>
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
                          <v-text-field readonly :model-value="getOutput(outputIndex)" :label="item.name || '(unnamed)'" :placeholder="item.type" :hint="item.type" density="compact"></v-text-field>
                        </div>
                        <div v-else>
                          <!-- {{ getOutput(outputIndex) }} -->
                          <v-row v-for="(arrayItem, arrayIndex) of getOutput(outputIndex)">
                            <v-col>
                              {{ arrayIndex + 1 }}
                            </v-col>
                            <v-col cols="11">
                              <v-text-field readonly :model-value="getOutput(outputIndex)[arrayIndex]" :label="(item.name || '(unnamed)') + '[' + arrayIndex + ']'" :placeholder="item.arrayChildren.type" :hint="item.arrayChildren.type" density="compact"></v-text-field>
                              <!-- {{ arrayItem }} -->
                            </v-col>
                          </v-row>
                        </div>
                        <!-- {{ item }} -->
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
          // console.log(now() + " AddressFunctions - computed.selectedMethodId.set - this.settings: " + JSON.stringify(this.settings));
        }
        this.saveSettings();
      },
    },
    selectedFunction() {
      // console.log(now() + " AddressFunctions - computed.selectedFunction");
      return this.selectedMethodId && this.functions[this.selectedMethodId] || {};
    },
    selectedFunctionInputs() {
      return this.selectedFunction.inputs || [];
    },
    selectedFunctionOutputs() {
      return this.selectedFunction.outputs || [];
    },
    functionList() {
      // console.log(now() + " AddressFunctions - computed.functionList - this.functions: " + JSON.stringify(this.functions));
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
    getRulesRulesRules(inputParameter) {
      return rulesRulesRules(inputParameter);
    },
    getRuleFunction(inputParameter) {
      // bool: true or false
      // int/uint: 8 to 256 bits
      // address
      // bytesX: X = 1 to 32
      // string
      // enums
      // user defined types
      // arrays
      // structs
      const max = 10;
      if (inputParameter.baseType == "address") {
        // console.log(now() + " AddressFunctions - methods.getRuleFunction - ADDRESS inputParameter: " + JSON.stringify(inputParameter));
        return function(value) {
          console.log(now() + " AddressFunctions - methods.getRuleFunction.function - ADDRESS inputParameter: " + JSON.stringify(inputParameter));
          if (!value || value.length == 0) {
            return "Address is required";
          } else {
            try {
              ethers.utils.getAddress(value);
              return true;
            } catch (e) {
              return "Invalid address";
            }
          }
        }
      } else if (inputParameter.baseType.substring(0, 4) == "uint") {
        // console.log(now() + " AddressFunctions - methods.getRuleFunction - UINT inputParameter: " + JSON.stringify(inputParameter));
        const bits = parseInt(inputParameter.baseType.substring(4,));
        return function(value) {
          console.log(now() + " AddressFunctions - methods.getRuleFunction.function - UINT inputParameter: " + JSON.stringify(inputParameter) + ", bits: " + bits);
          if (!value || value.length == 0) {
            return "Number is required";
          } else {
            try {
              const v = ethers.BigNumber.from(value);
              const maxNumber = ethers.BigNumber.from(2).pow(bits);
              if (v.gt(maxNumber)) {
                return "Number exceed limit " + maxNumber.toString();
              } else if (v.isNegative()) {
                return "Number cannot be negative";
              }
              return true;
            } catch (e) {
              return "Invalid number";
            }
          }
        }
      } else if (inputParameter.baseType.substring(0, 3) == "int") {
        // console.log(now() + " AddressFunctions - methods.getRuleFunction - INT inputParameter: " + JSON.stringify(inputParameter));
        const bits = parseInt(inputParameter.baseType.substring(3,));
        return function(value) {
          console.log(now() + " AddressFunctions - methods.getRuleFunction.function - INT inputParameter: " + JSON.stringify(inputParameter) + ", bits: " + bits);
          if (!value || value.length == 0) {
            return "Number is required";
          } else {
            try {
              const v = ethers.BigNumber.from(value);
              const minNumber = ethers.BigNumber.from(0).sub(ethers.BigNumber.from(2).pow(bits - 1));
              const maxNumber = ethers.BigNumber.from(2).pow(bits - 1).sub(1);
              if (v.lt(minNumber)) {
                return "Number below minimum " + minNumber.toString();
              } else if (v.gt(maxNumber)) {
                return "Number above maximum " + maxNumber.toString();
              }
              return true;
            } catch (e) {
              return "Invalid number";
            }
          }
        }
      } else {
        // console.log(now() + " AddressFunctions - methods.getRuleFunction - OTHER inputParameter: " + JSON.stringify(inputParameter));
      }
      // return function(value) {
      //   return value && value.length <= max || `Max length exceeded (max ${max})`;
      // }
      // return "Not handled";
      return true;
    },
    getInput(index) {
      // console.log(now() + " AddressFunctions - methods.getInput - selectedFunctionInputs[" + index + "]: " + JSON.stringify(this.selectedFunctionInputs[index]));
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
    //   console.log(now() + " AddressFunctions - setInput - index: " + index + ", value: " + JSON.stringify(value));
    //   clearTimeout(this._timerIds[index] || null);
    //   const t = this;
    //   this._timerIds[index] = setTimeout(() => {
    //     console.log(now() + " AddressABI - setInput - DEBOUNCED");
    //     t.setInputDEBOUNCED(index, value);
    //   }, 1000)
    // },
    addNewInputArrayItem(index) {
      // console.log(now() + " AddressFunctions - methods.addNewInputArrayItem - index: " + index);
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
      // console.log(now() + " AddressFunctions - methods.setInputArrayElement - inputIndex: " + inputIndex + ", arrayIndex: " + arrayIndex + ", elementValue: " + elementValue);
      if (this.address && this.settings.inputs[this.address] && this.settings.inputs[this.address][this.selectedMethodId]) {
        if (!(inputIndex in this.settings.inputs[this.address][this.selectedMethodId])) {
          this.settings.inputs[this.address][this.selectedMethodId][inputIndex] = new Array(this.selectedFunctionInputs[inputIndex].arrayLength).fill(null);
        }
        this.settings.inputs[this.address][this.selectedMethodId][inputIndex][arrayIndex] = elementValue;
      }
      this.saveSettings();
    },
    removeInputArrayElement(inputIndex, arrayIndex) {
      // console.log(now() + " AddressFunctions - methods.removeInputArrayElement - inputIndex: " + inputIndex + ", arrayIndex: " + arrayIndex);
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
      // console.log(now() + " AddressFunctions - methods.setInput - index: " + index + ", value: " + JSON.stringify(value));
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
      // console.log(now() + " AddressFunctions - methods.getOutput - selectedFunctionOutputs[" + index + "]: " + JSON.stringify(this.selectedFunctionOutputs[index]));
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
      console.log(now() + " AddressFunctions - methods.setOutputs - outputs: " + JSON.stringify(outputs));
      if (!(this.address in this.settings.outputs)) {
        this.settings.outputs[this.address] = {};
      }
      this.settings.outputs[this.address][this.selectedMethodId] = outputs;
      this.saveSettings();
    },
    async callFunction() {
      const validationStatus = await this.$refs.form.validate();
      console.log(now() + " AddressFunctions - methods.callFunction - validationStatus: " + JSON.stringify(validationStatus, null, 2));
      if (!validationStatus.valid) {
        this.error = "One or more fields failed the validation check";
      } else {
        this.error = null;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      // console.log(now() + " AddressFunctions - callFunction - selectedFunction: " + JSON.stringify(this.selectedFunction, null, 2));
      const addressInfo = store.getters["addresses/getAddressInfo"](this.address);
      // console.log(now() + " AddressFunctions - callFunction - addressInfo: " + JSON.stringify(addressInfo, null, 2));
      const parameters = [];
      for (const [index, input] of this.selectedFunctionInputs.entries()) {
        console.log(now() + " AddressFunctions - callFunction - input[" + index + "]: " + " => " + JSON.stringify(input));
        const value = this.getInput(index);
        parameters.push(value);
      }
      console.log(now() + " AddressFunctions - callFunction - parameters: " + JSON.stringify(parameters, null, 2));
      const contract = new ethers.Contract(this.address, addressInfo.abi, provider);
      try {
        const results = await contract[this.selectedFunction.name](...parameters);
        console.log(now() + " AddressFunctions - methods.callFunction - results: " + JSON.stringify(results));
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
        console.log(now() + " AddressFunctions - methods.callFunction - outputs: " + JSON.stringify(outputs));
        this.setOutputs(outputs);
      } catch (e) {
        console.error(now() + " AddressFunctions - methods.callFunction - ERROR: " + e.message);
      }
    },
    saveSettings() {
      // console.log(now() + " AddressFunctions - methods.saveSettings - settings: " + JSON.stringify(this.settings, null, 2));
      if (this.initialised) {
        localStorage.explorerAddressFunctionsSettings = JSON.stringify(this.settings);
      }
    },
  },
  beforeCreate() {
    console.log(now() + " AddressFunctions - beforeCreate");
	},
  mounted() {
    console.log(now() + " AddressFunctions - mounted");
    if ('explorerAddressFunctionsSettings' in localStorage) {
      const tempSettings = JSON.parse(localStorage.explorerAddressFunctionsSettings);
      // console.log(now() + " AddressFunctions - mounted - tempSettings: " + JSON.stringify(tempSettings));
      if ('version' in tempSettings && tempSettings.version == this.settings.version) {
        this.settings = tempSettings;
      }
    }
    this.initialised = true;
    const t = this;
    setTimeout(function() {
      store.dispatch('address/loadAddress', { inputAddress: t.inputAddress, forceUpdate: false });
    }, 1000);
	},
  unmounted() {
    console.log(now() + " AddressFunctions - unmounted");
	},
  destroyed() {
    console.log(now() + " AddressFunctions - destroyed");
	},
};
