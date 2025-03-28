const Contract = {
  template: `
    <div class="m-0 p-0">

      <b-card no-body no-header class="border-0">
        <b-card no-body class="border-0 m-0 mt-0 px-1">
          <b-tabs v-model="settings.tabIndex" @input="saveSettings" align="right" class="text-right mt-1" content-class="m-1 mb-0 p-0">
            <template #tabs-start>
              <div class="d-flex flex-grow-1">
                <div class="m-0 mt-1 p-0" style="width: 24.0rem;">
                  <b-form-input type="text" size="sm" :value="inputAddress" @change="loadAddress($event);" debounce="600" v-b-popover.hover.bottom="'Address'" placeholder="🔍 address, e.g., 0x1234...abcd"></b-form-input>
                </div>
                <div class="mt-1 pr-1">
                  <b-dropdown size="sm" right text="" variant="link" class="m-0 p-0">
                    <b-dropdown-text>Sample Contracts</b-dropdown-text>
                    <b-dropdown-divider></b-dropdown-divider>
                    <span v-for="(sample, sampleIndex) of (chainId && SAMPLES[chainId] || [])" v-bind:key="sampleIndex">
                      <b-dropdown-item v-if="sample.type == 'contract'" @click="loadAddress(sample.address);">{{ sample.address.substring(0, 10) + ' - ' + sample.info }}</b-dropdown-item>
                    </span>
                  </b-dropdown>
                </div>
                <div class="mt-0 flex-grow-1">
                </div>
                <div class="mt-0 pr-1">
                  <b-button :disabled="!inputAddress" size="sm" @click="loadData(inputAddress, true);" variant="link" v-b-popover.hover.top="'Load info'"><b-icon-cloud-download shift-v="-3" font-scale="1.2"></b-icon-cloud-download></b-button>
                </div>
                <!-- <div class="mt-0 pr-1">
                  <b-button :disabled="!etherscanAPIKey || !inputAddress" size="sm" @click="importABIFromEtherscan();" variant="link" v-b-popover.hover.top="'Import ABI from https://api.etherscan.io/. You will need to enter your Etherscan API key in the Config page'"><b-icon-cloud-download shift-v="-3" font-scale="1.2"></b-icon-cloud-download></b-button>
                </div> -->
                <!-- <div class="mt-0 pr-1">
                  <b-button :disabled="!inputAddress" size="sm" @click="testIt();" variant="link" v-b-popover.hover.top="'Test'"><b-icon-bullseye shift-v="-3" font-scale="1.2"></b-icon-bullseye></b-button>
                </div> -->
              </div>
              <div class="mt-0 flex-grow-1">
              </div>
              <div class="mt-0 flex-grow-1">
              </div>
              <div class="mt-0 flex-grow-1">
              </div>
            </template>
            <b-tab title="Info" no-body></b-tab>
            <b-tab title="ABI" no-body></b-tab>
            <b-tab title="Functions" no-body></b-tab>
            <b-tab title="Source Code" no-body></b-tab>
          </b-tabs>

          <b-card no-body no-header bg-variant="light" class="m-0 p-1">

            <div v-if="settings.tabIndex == 0">
              <b-form-group label-cols-lg="2" label="Contract" label-size="md" label-class="font-weight-bold pt-0" class="mt-3 mb-0">
                <!-- <b-form-group v-if="error" label="Error:" label-for="address-error" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
                  <b-form-input type="text" plaintext size="sm" id="address-error" :value="error"></b-form-input>
                </b-form-group> -->
                <!-- <b-form-group v-if="!error" label="Address:" label-for="address-address" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
                  <b-input-group class="w-75">
                    <b-form-input type="text" plaintext size="sm" :value="address"></b-form-input>
                    <b-input-group-append>
                      <b-button v-if="address" :href="'https://etherscan.io/address/' + address" variant="link" target="_blank" class="m-0 ml-2 p-0 pt-1">
                        <b-icon-link-45deg shift-v="-1" font-scale="1.1"></b-icon-link-45deg>
                      </b-button>
                      <b-button v-if="address" size="sm" @click="copyToClipboard(address);" variant="link">
                        <b-icon-clipboard shift-v="-1" font-scale="1.1"></b-icon-clipboard>
                      </b-button>
                    </b-input-group-append>
                  </b-input-group>
                </b-form-group> -->
                <!-- <b-form-group v-if="!error" label="Transaction Count:" label-for="address-transactioncount" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
                  <b-form-input type="text" plaintext size="sm" id="address-transactioncount" :value="commify0(transactionCount) || ''"></b-form-input>
                </b-form-group> -->
                <!-- <b-form-group label="Balance:" label-for="address-balance" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
                  <b-form-input type="text" plaintext size="sm" id="address-balance" :value="balance && (formatETH(balance) + ' ETH')"></b-form-input>
                </b-form-group> -->
                <b-form-group label="Info:" label-for="address-info" label-size="sm" label-cols-sm="2" label-align-sm="right" class="mx-0 my-1 p-0">
                  <font size="-1">
                    <pre class="mt-2">
info: {{ info }}
                    </pre>
                  </font>
                </b-form-group>
              </b-form-group>
            </div>
            <div v-if="settings.tabIndex == 1">
              <b-form-group label="ABI:" label-for="contractabi-abi" label-size="sm" label-cols-sm="2" label-align-sm="right" class="mx-0 my-1 p-0">
                <b-input-group class="align-items-start">
                  <b-form-textarea size="sm" id="contractabi-abi" :value="info.abi && JSON.stringify(info.abi) || null" @change="updateABI(inputAddress, $event)" rows="4" max-rows="7"></b-form-textarea>
                  <b-input-group-append>
                    <b-button :disabled="!etherscanAPIKey || !info.address" size="sm" @click="importABIFromEtherscan();" variant="link" v-b-popover.hover.top="'Import ABI from https://api.etherscan.io/. You will need to enter your Etherscan API key in the Config page'">
                      <b-icon-cloud-download shift-v="-3" font-scale="1.2"></b-icon-cloud-download>
                    </b-button>
                    <b-button :disabled="!info || !info.abi" size="sm" @click="copyToClipboard(info.abi && JSON.stringify(info.abi) || null);" variant="link">
                      <b-icon-clipboard shift-v="-1" font-scale="1.1"></b-icon-clipboard>
                    </b-button>
                  </b-input-group-append>
                </b-input-group>
              </b-form-group>
              <b-form-group label="Functions:" label-for="contractabi-functions" label-size="sm" label-cols-sm="2" label-align-sm="right" class="mx-0 my-1 p-0">
                <div class="d-flex flex-wrap m-0 p-1 bg-white">
                  <div class="mt-0 pr-1">
                    <b-form-input type="text" size="sm" v-model.trim="settings.functionsTable.filter" @change="saveSettings" debounce="600" v-b-popover.hover.top="'Regex filter by method id or function'" placeholder="🔍 method id or function"></b-form-input>
                  </div>
                  <div class="mt-0 flex-grow-1">
                  </div>
                  <div class="mt-0 pl-1">
                    <font size="-2" v-b-popover.hover.bottom="'# Filtered / Functions'">{{ filteredSortedFunctions.length + "/" + functionsList.length }}</font>
                  </div>
                  <div class="mt-0 pl-1">
                    <b-form-select size="sm" v-model="settings.functionsTable.sortOption" @change="saveSettings" :options="functionsSortOptions" v-b-popover.hover.top="'Yeah. Sort'"></b-form-select>
                  </div>
                  <div class="mt-0 pl-1">
                    <b-pagination size="sm" v-model="settings.functionsTable.currentPage" :total-rows="functionsList.length" :per-page="settings.functionsTable.pageSize" style="height: 0;"></b-pagination>
                  </div>
                  <div class="mt-0 pl-1">
                    <b-form-select size="sm" v-model="settings.functionsTable.pageSize" @change="saveSettings" :options="pageSizes" v-b-popover.hover.bottom="'Yeah. Page size'"></b-form-select>
                  </div>
                </div>
                <b-table small fixed striped responsive hover :fields="functionFields" :items="pagedFilteredSortedFunctions" show-empty empty-html="zzz" head-variant="light" class="m-0 p-0">
                  <template #cell(index)="data">
                    <font size="-1" class="text-muted">
                      {{ parseInt(data.index) + ((settings.functionsTable.currentPage - 1) * settings.functionsTable.pageSize) + 1 }}
                    </font>
                  </template>
                  <template #cell(methodId)="data">
                    <b-button @click="setSelectedMethodId(data.item.methodId); settings.tabIndex = 2; saveSettings()" variant="link" class="m-0 p-0 pt-1">
                      {{ data.item.methodId }}
                    </b-button>
                  </template>
                  <template #cell(fullName)="data">
                    {{ data.item.fullName }}
                  </template>
                  <!-- <template #cell(inputs)="data">
                    <div v-for="(item, parameterIndex) of data.item.inputs" v-bind:key="parameterIndex">
                      <font size="-1" class="text-muted">
                        {{ parameterIndex + 1 }}
                      </font>
                      <span class="text-muted">
                        {{ item.type }}
                      </span>
                     {{ item.name || "(unnamed)" }}
                    </div>
                  </template> -->
                  <!-- <template #cell(outputs)="data">
                    <div v-for="(item, parameterIndex) of data.item.outputs" v-bind:key="parameterIndex">
                      <font size="-1" class="text-muted">
                        {{ parameterIndex + 1 }}
                      </font>
                      <span class="text-muted">
                        {{ item.type }}
                      </span>
                     {{ item.name || "(unnamed)" }}
                    </div>
                  </template> -->
                </b-table>
              </b-form-group>
              <b-form-group label="Events:" label-for="contractabi-events" label-size="sm" label-cols-sm="2" label-align-sm="right" class="mx-0 my-1 p-0">
                <div class="d-flex flex-wrap m-0 p-1 bg-white">
                  <div class="mt-0 pr-1">
                    <b-form-input type="text" size="sm" v-model.trim="settings.eventsTable.filter" @change="saveSettings" debounce="600" v-b-popover.hover.top="'Regex filter by signature or event'" placeholder="🔍 signature or event"></b-form-input>
                  </div>
                  <div class="mt-0 flex-grow-1">
                  </div>
                  <div class="mt-0 pl-1">
                    <font size="-2" v-b-popover.hover.bottom="'# Filtered / Events'">{{ filteredSortedEvents.length + "/" + eventsList.length }}</font>
                  </div>
                  <div class="mt-0 pl-1">
                    <b-form-select size="sm" v-model="settings.eventsTable.sortOption" @change="saveSettings" :options="eventsSortOptions" v-b-popover.hover.top="'Yeah. Sort'"></b-form-select>
                  </div>
                  <div class="mt-0 pl-1">
                    <b-pagination size="sm" v-model="settings.eventsTable.currentPage" :total-rows="eventsList.length" :per-page="settings.eventsTable.pageSize" style="height: 0;"></b-pagination>
                  </div>
                  <div class="mt-0 pl-1">
                    <b-form-select size="sm" v-model="settings.eventsTable.pageSize" @change="saveSettings" :options="pageSizes" v-b-popover.hover.bottom="'Yeah. Page size'"></b-form-select>
                  </div>
                </div>
                <b-table small fixed striped responsive hover :fields="eventFields" :items="pagedFilteredSortedEvents" show-empty empty-html="zzz" head-variant="light" class="m-0 p-0">
                  <template #cell(index)="data">
                    <font size="-1" class="text-muted">
                      {{ parseInt(data.index) + ((settings.eventsTable.currentPage - 1) * settings.eventsTable.pageSize) + 1 }}
                    </font>
                  </template>
                  <template #cell(fullName)="data">
                    {{ data.item.fullName }}
                  </template>
                  <template #cell(parameters)="data">
                    <div v-for="(item, parameterIndex) of data.item.parameters" v-bind:key="parameterIndex">
                      <font size="-1" class="text-muted">
                        {{ parameterIndex + 1 }}
                      </font>
                      <span class="text-muted">
                        {{ item.type }}
                      </span>
                      <span v-if="item.indexed" class="text-muted">
                        indexed
                      </span>
                     {{ item.name || "(unnamed)" }}
                    </div>
                  </template>
                </b-table>
              </b-form-group>
            </div>
            <div v-if="settings.tabIndex == 2">
              <b-form-group label="Function:" label-for="function-function" label-size="sm" label-cols-sm="1" label-align-sm="right" class="mx-0 my-1 p-0">
                <b-form-select size="sm" :value="getSelectedMethodId" @change="setSelectedMethodId($event)" :options="functionsOptions"></b-form-select>
              </b-form-group>
              <b-form-group v-if="getSelectedMethodId" label="Inputs:" label-for="function-inputs" label-size="sm" label-cols-sm="1" label-align-sm="right" class="mx-0 my-1 p-0">
                <b-table small :fields="inputFields" :items="selectedFunctionInputs" borderless>
                  <template #cell(index)="data">
                    <font size="-1" class="text-muted">{{ parseInt(data.index) + 1 }}</font>
                  </template>
                  <template #cell(name)="data">
                    <font v-if="!data.item.name" size="-1" class="text-muted">(Unnamed)</font>
                    {{ data.item.name }}
                  </template>
                  <template #cell(type)="data">
                    <font size="-1" class="text-muted">{{ data.item.type }}</font>
                  </template>
                  <template #cell(input)="data">
                    <div v-for="(item, itemIndex) of [getInput(data.index)]" v-bind:key="itemIndex">
                      <font size="-2" class="text-muted">
                        {{ item }}
                      </font>
                      <div v-if="item.arrayLength">
                        <b-row v-for="(e, eIndex) of item.value" v-bind:key="eIndex">
                          <b-col>
                            <font size="-1" class="text-muted">{{ eIndex + 1 }}</font>
                          </b-col>
                          <b-col cols="7">
                            <b-form-input type="text" size="sm" :value="e" class="mt-1" @change="setInputArrayElement(data.index, eIndex, $event)"></b-form-input>
                          </b-col>
                          <b-col cols="4">
                            <b-button v-if="item.arrayLength < 0" size="sm" variant="primary" @click="removeInputArrayElement(data.index, eIndex);">Remove Row</b-button>
                          </b-col>
                        </b-row>
                        <b-row>
                          <b-col cols="8">
                          </b-col>
                          <b-col cols="4">
                            <b-button v-if="item.arrayLength < 0" size="sm" variant="primary" @click="addNewInputArrayItem(data.index);">Add New Row</b-button>
                          </b-col>
                        </b-row>
                      </div>
                      <div v-else>
                        <b-input-group class="align-items-start">
                          <b-form-input type="text" size="sm" :value="item.value" @change="setInput(data.index, $event)"></b-form-input>
                          <b-input-group-append>
                            <div v-if="item.isInt">
                              <b-form-select size="sm" :value="getInputUnits(data.index)" @change="setInputUnits(data.index, $event)" :options="uintUnitsOptions" v-b-popover.hover.top="'Select units'"></b-form-select>
                            </div>
                          </b-input-group-append>
                        </b-input-group>
                      </div>
                    </div>
                  </template>
                </b-table>
              </b-form-group>
              <b-form-group v-if="getSelectedMethodId && selectedFunctionStateMutability == 'payable'" label="Value:" label-for="function-outputs" label-size="sm" label-cols-sm="1" label-align-sm="right" class="mx-0 my-1 p-0">
                <b-form-input type="text" size="sm" :value="getValue()" @change="setValue($event)"></b-form-input>
              </b-form-group>
              <b-form-group v-if="getSelectedMethodId && (selectedFunctionStateMutability == 'view' || selectedFunctionStateMutability == 'pure')" label="" label-for="function-call" label-size="sm" label-cols-sm="1" label-align-sm="right" class="mx-0 my-1 p-0">
                <b-button size="sm" variant="primary" @click="callFunction();">Call Function</b-button>
              </b-form-group>
              <b-form-group v-if="getSelectedMethodId && (selectedFunctionStateMutability == 'payable' || selectedFunctionStateMutability == 'nonpayable')" label="" label-for="function-execute" label-size="sm" label-cols-sm="1" label-align-sm="right" class="mx-0 my-1 p-0">
                <b-button size="sm" variant="warning" @click="executeTransaction();">TODO: Execute Transaction</b-button>
              </b-form-group>
              <b-form-group v-if="getSelectedMethodId" label="Outputs:" label-for="function-outputs" label-size="sm" label-cols-sm="1" label-align-sm="right" class="mx-0 my-1 mt-4 p-0">
                <b-table small :fields="outputFields" :items="selectedFunctionOutputs" borderless>
                  <template #cell(index)="data">
                    <font size="-1" class="text-muted">{{ parseInt(data.index) + 1 }}</font>
                  </template>
                  <template #cell(name)="data">
                    <font v-if="!data.item.name" size="-1" class="text-muted">(Unnamed)</font>
                    {{ data.item.name }}
                  </template>
                  <template #cell(type)="data">
                    <font size="-1" class="text-muted">{{ data.item.type }}</font>
                  </template>
                  <template #cell(output)="data">
                    <b-input-group class="align-items-start">
                      <b-form-input v-if="data.item.type == 'uint256'" type="text" readonly size="sm" :value="formatUintUnits(getOutput(data.index), getOutputUnits(data.index))"></b-form-input>
                      <b-form-input v-else type="text" readonly size="sm" :value="getOutput(data.index)"></b-form-input>
                      <b-input-group-append>
                        <div v-if="data.item.type == 'uint256'">
                          <b-form-select size="sm" :value="getOutputUnits(data.index)" @change="setOutputUnits(data.index, $event)" :options="uintUnitsOptions" v-b-popover.hover.top="'Select units'"></b-form-select>
                        </div>
                      </b-input-group-append>
                    </b-input-group>
                  </template>
                </b-table>
              </b-form-group>
            </div>
            <div v-if="settings.tabIndex == 3">
              <b-form-group label="Source code:" label-for="contractabi-sourcecode" label-size="sm" label-cols-sm="2" label-align-sm="right" class="mx-0 my-1 p-0">
                <b-input-group class="align-items-start">
                  <b-form-textarea plaintext size="sm" id="contractabi-sourcecode" :value="info.sourceCode && JSON.stringify(info.sourceCode) || null" rows="5" max-rows="10"></b-form-textarea>
                  <b-input-group-append>
                    <b-button :disabled="!etherscanAPIKey || !inputAddress" size="sm" @click="importSourceCodeFromEtherscan();" variant="link" v-b-popover.hover.top="'Import ABI from https://api.etherscan.io/. You will need to enter your Etherscan API key in the Config page'">
                      <b-icon-cloud-download shift-v="-3" font-scale="1.2"></b-icon-cloud-download>
                    </b-button>
                    <b-button :disabled="!info || !info.sourceCode" size="sm" @click="copyToClipboard(info.sourceCode && JSON.stringify(info.sourceCode) || null);" variant="link">
                      <b-icon-clipboard shift-v="-1" font-scale="1.1"></b-icon-clipboard>
                    </b-button>
                  </b-input-group-append>
                </b-input-group>
              </b-form-group>
            </div>
          </b-card>
        </b-card>
      </b-card>
    </div>
  `,
  props: ['inputAddress'],
  data: function () {
    return {
      settings: {
        tabIndex: 0,
        selectedMethodIds: {}, // address -> methodId
        inputs: {},            // address -> methodId -> index -> value
        inputUnits: {},        // address -> methodId -> index -> units
        outputs: {},           // address -> methodId -> array of values
        outputUnits: {},       // address -> methodId -> index -> units
        values: {},            // address -> methodId -> value
        functionsTable: {
          filter: null,
          currentPage: 1,
          pageSize: 5,
          sortOption: 'nameasc',
        },
        eventsTable: {
          filter: null,
          currentPage: 1,
          pageSize: 5,
          sortOption: 'nameasc',
        },
        version: 7,
      },
      info: {},
      functionsSortOptions: [
        { value: 'nameasc', text: '▲ Function' },
        { value: 'namedsc', text: '▼ Function' },
        { value: 'methodidasc', text: '▲ Method Id' },
        { value: 'methodiddsc', text: '▼ Method Id' },
        { value: 'mutabilityasc', text: '▲ Mutability, ▲ Function' },
        { value: 'mutabilitydsc', text: '▼ Mutability, ▲ Function' },
      ],
      eventsSortOptions: [
        { value: 'nameasc', text: '▲ Event' },
        { value: 'namedsc', text: '▼ Event' },
        { value: 'signatureasc', text: '▲ Signature' },
        { value: 'signaturedsc', text: '▼ Signature' },
      ],
      pageSizes: [
        { value: 5, text: '5' },
        { value: 10, text: '10' },
        { value: 15, text: '15' },
        { value: 25, text: '25' },
        { value: 50, text: '50' },
        { value: 100, text: '100' },
      ],
      uintUnitsOptions: [
        { value: null, text: 'Number' },
        { value: "wei", text: 'Wei x10^0' },
        { value: "kwei", text: 'K, or Kwei x10^3' },
        { value: "mwei", text: 'M, or Mwei x10^6' },
        { value: "gwei", text: 'G, or Gwei x10^9' },
        { value: "szabo", text: 'T, or Szabo x10^12' },
        { value: "finney", text: 'Finney x10^15' },
        { value: "ether", text: 'Ether x10^18' },
        // { value: "k", text: 'K x10^3' },
        // { value: "m", text: 'M x10^6' },
        // { value: "g", text: 'G x10^9' },
        // { value: "t", text: 'T x10^12' },
        { value: "boolean", text: 'Boolean (0 = false, >0 = true)' },
        { value: "datetimelocal", text: 'Local yyyy-mm-dd [hh:mm:ss]' },
        { value: "datetimeutc", text: 'UTC yyyy-mm-dd [hh:mm:ss]' },
      ],
      functionFields: [
        { key: 'index', label: '#', sortable: false, thStyle: 'width: 5%;', tdClass: 'text-truncate' },
        { key: 'methodId', label: 'Method Id', sortable: false, thStyle: 'width: 15%;', tdClass: 'text-truncate' },
        { key: 'stateMutability', label: 'State Mutability', sortable: false, thStyle: 'width: 15%;', tdClass: 'text-truncate' },
        { key: 'fullName', label: 'Function', sortable: false, thStyle: 'width: 65%;', tdClass: 'text-left' },
      ],
      eventFields: [
        { key: 'index', label: '#', sortable: false, thStyle: 'width: 5%;', tdClass: 'text-truncate' },
        { key: 'signature', label: 'Signature', sortable: false, thStyle: 'width: 35%;', tdClass: 'text-truncate' },
        { key: 'fullName', label: 'Event', sortable: false, thStyle: 'width: 60%;', tdClass: 'text-left' },
      ],
      inputFields: [
        { key: 'index', label: '#', sortable: false, thStyle: 'width: 5%;', tdClass: 'text-truncate' },
        { key: 'name', label: 'Name', sortable: false, thStyle: 'width: 15%;', tdClass: 'text-truncate' },
        { key: 'type', label: 'Type', sortable: false, thStyle: 'width: 15%;', tdClass: 'text-truncate' },
        { key: 'input', label: 'Input', sortable: false, thStyle: 'width: 65%;', tdClass: 'text-left' },
      ],
      outputFields: [
        { key: 'index', label: '#', sortable: false, thStyle: 'width: 5%;', tdClass: 'text-truncate' },
        { key: 'name', label: 'Name', sortable: false, thStyle: 'width: 15%;', tdClass: 'text-truncate' },
        { key: 'type', label: 'Type', sortable: false, thStyle: 'width: 15%;', tdClass: 'text-truncate' },
        { key: 'output', label: 'Output', sortable: false, thStyle: 'width: 65%;', tdClass: 'text-left' },
      ],
    }
  },
  computed: {
    SAMPLES() {
      return SAMPLES;
    },
    etherscanAPIKey() {
      return store.getters['settings'].etherscanAPIKey;
    },
    chainId() {
      return store.getters['chainId'];
    },
    dbInfo() {
      return store.getters['db'];
    },
    functions() {
      const results = {};
      if (this.info.abi) {
        try {
          const interface = new ethers.utils.Interface(this.info.abi);
          for (const fullName of interface.format(ethers.utils.FormatTypes.full)) {
            if (fullName.substring(0, 8) == "function") {
              const functionInfo = interface.getFunction(fullName.substring(9,));
              const methodId = interface.getSighash(functionInfo);
              results[methodId] = { name: functionInfo.name, fullName, stateMutability: functionInfo.stateMutability, inputs: functionInfo.inputs, outputs: functionInfo.outputs };
            }
          }
        } catch (e) {
          console.error(now() + " Contract - computed.functions - ERROR info.abi: " + e.message);
        }
      }
      return results;
    },
    events() {
      const results = {};
      if (this.info.abi) {
        try {
          const interface = new ethers.utils.Interface(this.info.abi);
          for (const fullName of interface.format(ethers.utils.FormatTypes.full)) {
            if (fullName.substring(0, 5) == "event") {
              const eventInfo = interface.getEvent(fullName.substring(6,));
              const topicCount = eventInfo.inputs.filter(e => e.indexed).length + 1;
              const signature = interface.getEventTopic(eventInfo);
              const parameters = eventInfo.inputs.map(e => ({ name: e.name, type: e.type, indexed: e.indexed }));
              results[signature] = { name: eventInfo.name, fullName, parameters, topicCount };
            }
          }
        } catch (e) {
          console.error(now() + " Contract - computed.events - ERROR: " + e.message);
        }
      }
      return results;
    },
    functionsOptions() {
      const results = [];
      results.push({ value: null, text: "(Select function)"});
      for (const [methodId, functionData] of Object.entries(this.functions)) {
        results.push({ value: methodId, text: functionData.fullName /*.substring(9,)*/ });
      }
      results.sort((a, b) => {
        return ('' + a.text).localeCompare(b.text);
      });
      return results;
    },
    getSelectedMethodId() {
      // console.log(now() + " Contract - getSelectedMethodId");
      return this.info.address && this.settings.selectedMethodIds[this.info.address] || null;
    },
    selectedFunction() {
      return this.getSelectedMethodId && this.functions[this.getSelectedMethodId] || null;
    },
    selectedFunctionStateMutability() {
      return this.selectedFunction && this.selectedFunction.stateMutability || null;
    },
    selectedFunctionInputs() {
      return this.selectedFunction && this.selectedFunction.inputs || [];
    },
    selectedFunctionOutputs() {
      return this.selectedFunction && this.selectedFunction.outputs || [];
    },
    functionsList() {
      const results = [];
      for (const [methodId, functionData] of Object.entries(this.functions)) {
        results.push({ methodId, ...functionData });
      }
      return results;
    },
    filteredSortedFunctions() {
      const results = [];
      let regex = null;
      if (this.settings.functionsTable.filter != null && this.settings.functionsTable.filter.length > 0) {
        try {
          regex = new RegExp(this.settings.functionsTable.filter, 'i');
        } catch (e) {
          console.error(now() + " Contract - filteredSortedFunctions - ERROR regex: " + e.message);
          regex = new RegExp(/thequickbrowndogjumpsoverthelazyfox/, 'i');
        }
      }
      for (const item of this.functionsList) {
        let include = true;
        if (regex) {
          if (!(regex.test(item.methodId)) && !(regex.test(item.fullName))) {
            include = false;
          }
        }
        if (include) {
          results.push(item);
        }
      }
      if (this.settings.functionsTable.sortOption == 'nameasc') {
        results.sort((a, b) => {
          return ('' + a.fullName).localeCompare(b.fullName);
        });
      } else if (this.settings.functionsTable.sortOption == 'namedsc') {
        results.sort((a, b) => {
          return ('' + b.fullName).localeCompare(a.fullName);
        });
      } else if (this.settings.functionsTable.sortOption == 'methodidasc') {
        results.sort((a, b) => {
          return ('' + a.methodId).localeCompare(b.methodId);
        });
      } else if (this.settings.functionsTable.sortOption == 'methodiddsc') {
        results.sort((a, b) => {
          return ('' + b.methodId).localeCompare(a.methodId);
        });
      } else if (this.settings.functionsTable.sortOption == 'mutabilityasc') {
        results.sort((a, b) => {
          if (('' + a.stateMutability).localeCompare(b.stateMutability) == 0) {
            return ('' + a.fullName).localeCompare(b.fullName);
          } else {
            return ('' + a.stateMutability).localeCompare(b.stateMutability);
          }
        });
      } else if (this.settings.functionsTable.sortOption == 'mutabilitydsc') {
        results.sort((a, b) => {
          if (('' + a.stateMutability).localeCompare(b.stateMutability) == 0) {
            return ('' + a.fullName).localeCompare(b.fullName);
          } else {
            return ('' + b.stateMutability).localeCompare(a.stateMutability);
          }
        });
      }
      return results;
    },
    pagedFilteredSortedFunctions() {
      const results = this.filteredSortedFunctions.slice((this.settings.functionsTable.currentPage - 1) * this.settings.functionsTable.pageSize, this.settings.functionsTable.currentPage * this.settings.functionsTable.pageSize);
      // console.log(now() + " Contract - computed.pagedFilteredSortedFunctions - results: " + JSON.stringify(results, null, 2));
      return results;
    },
    eventsList() {
      const results = [];
      for (const [signature, eventData] of Object.entries(this.events)) {
        results.push({ signature, ...eventData });
      }
      return results;
    },
    filteredSortedEvents() {
      const results = [];
      let regex = null;
      if (this.settings.eventsTable.filter != null && this.settings.eventsTable.filter.length > 0) {
        try {
          regex = new RegExp(this.settings.eventsTable.filter, 'i');
        } catch (e) {
          console.error(now() + " Contract - filteredSortedEvents - ERROR regex: " + e.message);
          regex = new RegExp(/thequickbrowndogjumpsoverthelazyfox/, 'i');
        }
      }
      for (const item of this.eventsList) {
        let include = true;
        if (regex) {
          if (!(regex.test(item.signature)) && !(regex.test(item.fullName))) {
            include = false;
          }
        }
        if (include) {
          results.push(item);
        }
      }
      if (this.settings.eventsTable.sortOption == 'nameasc') {
        results.sort((a, b) => {
          return ('' + a.fullName).localeCompare(b.fullName);
        });
      } else if (this.settings.eventsTable.sortOption == 'namedsc') {
        results.sort((a, b) => {
          return ('' + b.fullName).localeCompare(a.fullName);
        });
      } else if (this.settings.eventsTable.sortOption == 'signatureasc') {
        results.sort((a, b) => {
          return ('' + a.signature).localeCompare(b.signature);
        });
      } else if (this.settings.eventsTable.sortOption == 'signaturedsc') {
        results.sort((a, b) => {
          return ('' + b.signature).localeCompare(a.signature);
        });
      }
      return results;
    },
    pagedFilteredSortedEvents() {
      return this.filteredSortedEvents.slice((this.settings.eventsTable.currentPage - 1) * this.settings.eventsTable.pageSize, this.settings.eventsTable.currentPage * this.settings.eventsTable.pageSize);
    },
  },
  methods: {
    async loadAddress(inputAddress) {
      console.log(now() + " Contract - methods.loadAddress - inputAddress: " + inputAddress);
      this.$router.push({ name: 'Contract', params: { inputAddress } })
      await this.loadData(inputAddress);
    },
    async loadData(inputAddress, forceUpdate = false) {
      console.log(now() + " Contract - methods.loadData - inputAddress: " + inputAddress + ", forceUpdate: " + forceUpdate);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const db = new Dexie(this.dbInfo.name);
      db.version(this.dbInfo.version).stores(this.dbInfo.schemaDefinition);
      const validatedAddress = validateAddress(inputAddress);
      let info = {};
      if (validatedAddress) {
        info = await dbGetCachedData(db, validatedAddress + "_" + this.chainId + "_contract", {});
        console.log(now() + " Contract - methods.loadData - info: " + JSON.stringify(info).substring(0, 200) + "...");
        if (Object.keys(info).length == 0 || forceUpdate) {
          info = await getAddressInfo(validatedAddress, provider);
          console.log(now() + " Contract - methods.loadData - info: " + JSON.stringify(info).substring(0, 200) + "...");
          await dbSaveCacheData(db, validatedAddress + "_" + this.chainId + "_contract", info);
        }
      }
      Vue.set(this, 'info', info);
      db.close();
    },
    async updateABI(address, abi) {
      console.log(now() + " Contract - methods.updateABI - address: " + address + ", abi: " + abi);
      const db = new Dexie(this.dbInfo.name);
      db.version(this.dbInfo.version).stores(this.dbInfo.schemaDefinition);
      const validatedAddress = validateAddress(address);
      if (validatedAddress && validatedAddress == this.info.address) {
        console.log(now() + " Contract - methods.updateABI - this.info: " + JSON.stringify(this.info).substring(0, 1000) + "...");
        Vue.set(this.info, 'abi', abi);
        await dbSaveCacheData(db, this.info.address + "_" + this.chainId + "_contract", this.info);
      }
      db.close();
    },
    async testIt() {
      // console.log(now() + " Contract - methods.testIt - inputAddress: " + this.inputAddress);
      // const provider = new ethers.providers.Web3Provider(window.ethereum);
      // console.log(now() + " Contract - methods.testIt - dbInfo: " + JSON.stringify(this.dbInfo, null, 2));
      // const db = new Dexie(this.dbInfo.name);
      // db.version(this.dbInfo.version).stores(this.dbInfo.schemaDefinition);
      // const name = "BLah";
      // await dbSaveCacheData(db, name, { blah: "Blah" });
      // const retrievedData = await dbGetCachedData(db, name, {});
      // console.log("retrievedData: " + JSON.stringify(retrievedData, null, 2));
      // db.close();
    },
    async importABIFromEtherscan() {
      console.log(now() + " Contract - methods.importABIFromEtherscan");
      const db = new Dexie(this.dbInfo.name);
      db.version(this.dbInfo.version).stores(this.dbInfo.schemaDefinition);
      const url = "https://api.etherscan.io/v2/api?chainid=" + this.chainId + "&module=contract&action=getabi&address=" + (this.info.implementation ? this.info.implementation : this.info.address) + "&apikey=" + store.getters['settings'].etherscanAPIKey;
      console.log(now() + " Contract - url: " + url);
      const data = await fetch(url).then(response => response.json());
      console.log(now() + " Contract - data: " + JSON.stringify(data, null, 2));
      if (data && data.status == 1 && data.message == "OK") {
        const abi = JSON.parse(data.result);
        console.log(now() + " Contract - abi: " + JSON.stringify(abi, null, 2).substring(0, 1000) + "...");
        console.log(now() + " Contract - methods.importABIFromEtherscan - this.info: " + JSON.stringify(this.info).substring(0, 1000) + "...");
        Vue.set(this.info, 'abi', abi);
        await dbSaveCacheData(db, this.info.address + "_" + this.chainId + "_contract", this.info);
      }
      db.close();
    },
    async importSourceCodeFromEtherscan() {
      console.log(now() + " Contract - methods.importSourceCodeFromEtherscan");
      const db = new Dexie(this.dbInfo.name);
      db.version(this.dbInfo.version).stores(this.dbInfo.schemaDefinition);
      const url = "https://api.etherscan.io/v2/api?chainid=1&module=contract&action=getsourcecode&address=" + (this.info.implementation ? this.info.implementation : this.info.address) + "&apikey=" + store.getters['settings'].etherscanAPIKey;
      console.log(now() + " Contract - url: " + url);
      const data = await fetch(url).then(response => response.json());
      console.log(now() + " Contract - data: " + JSON.stringify(data, null, 2));
      if (data && data.status == 1 && data.message == "OK") {
        console.log(now() + " Contract - data.result: " + JSON.stringify(data.result, null, 2));
        // Vue.set(this.info, 'sourceCode', JSON.stringify(data.result).replace(/\/\//, "/"));
        // Vue.set(this.info, 'sourceCode', data.result[0].SourceCode.replace(/\/r\/n/, ""));
        Vue.set(this.info, 'sourceCode', data.result[0].SourceCode);
        await dbSaveCacheData(db, this.info.address + "_" + this.chainId + "_contract", this.info);
      }
      db.close();
    },

    setSelectedMethodId(value) {
      console.log(now() + " Contract - setSelectedMethodId - value: " + JSON.stringify(value));
      if (!(this.info.address in this.settings.selectedMethodIds)) {
        Vue.set(this.settings.selectedMethodIds, this.info.address, {});
      }
      Vue.set(this.settings.selectedMethodIds, this.info.address, value);
      this.saveSettings();
    },
    getInput(index) {
      // console.log(now() + " Contract - getInput - index: " + index + ", this.selectedFunction: " + JSON.stringify(this.selectedFunction));
      let [ value, unit, type, elementType, isInt, arrayLength, error ] = [ null, null, null, null, false, null, null ];
      if (this.selectedFunction) {
        type = this.selectedFunction.inputs[index].type;
        elementType = this.selectedFunction.inputs[index].type.replace(/\[.\d*\]/, "");
        isInt = this.selectedFunction.inputs[index].type.substring(0, 3) == "int" || this.selectedFunction.inputs[index].type.substring(0, 4) == "uint";
        arrayLength = this.selectedFunction.inputs[index].arrayLength;

        if (this.info.address in this.settings.inputs) {
          if (this.getSelectedMethodId in this.settings.inputs[this.info.address]) {
            if (this.settings.inputs[this.info.address][this.getSelectedMethodId][index]) {
              value = this.settings.inputs[this.info.address][this.getSelectedMethodId][index].value;
              unit = this.settings.inputs[this.info.address][this.getSelectedMethodId][index].unit;
            }
          }
        }
        if (arrayLength != null) {
          console.log(now() + " Contract - getInput - ARRAY");
          if (value == null) {
            if (arrayLength > 0) {
              value = new Array(arrayLength).fill(null);
            } else {
              value = [];
            }
          }
        }
      }
      return { value, unit, type, elementType, isInt, arrayLength, error };
    },
    addNewInputArrayItem(index) {
      console.log(now() + " Contract - addNewInputArrayItem - index: " + index);
      const input = this.getInput(index);
      if (input.arrayLength) {
        console.log(now() + " Contract - addNewInputArrayItem - Is an array: " + JSON.stringify(input.value));
        const newValue = input.value;
        newValue.push(null);
        if (!(this.info.address in this.settings.inputs)) {
          Vue.set(this.settings.inputs, this.info.address, {});
        }
        if (!(this.getSelectedMethodId in this.settings.inputs[this.info.address])) {
          Vue.set(this.settings.inputs[this.info.address], this.getSelectedMethodId, {});
        }
        if (!(index in this.settings.inputs[this.info.address][this.getSelectedMethodId])) {
          Vue.set(this.settings.inputs[this.info.address][this.getSelectedMethodId], index, { value: newValue, type: null });
        } else {
          Vue.set(this.settings.inputs[this.info.address][this.getSelectedMethodId][index], "value", newValue);
        }
      }
      this.saveSettings();
    },
    setInputArrayElement(inputIndex, arrayIndex, elementValue) {
      console.log(now() + " Contract - setInputArrayElement - inputIndex: " + inputIndex + ", arrayIndex: " + arrayIndex + ", elementValue: " + elementValue);
      if (this.selectedFunction) {
        console.log(now() + " Contract - setInputArrayElement - this.selectedFunction: " + JSON.stringify(this.selectedFunction, null, 2));
        if (this.info.address in this.settings.inputs) {
          if (this.getSelectedMethodId in this.settings.inputs[this.info.address]) {
            console.log(now() + " Contract - setInputArrayElement - inputIndex: " + inputIndex);
            console.log(now() + " Contract - setInputArrayElement - this.settings.inputs[this.info.address][this.getSelectedMethodId]: " + JSON.stringify(this.settings.inputs[this.info.address][this.getSelectedMethodId], null, 2));
            if (this.settings.inputs[this.info.address][this.getSelectedMethodId][inputIndex]) {
              const currentElement = this.settings.inputs[this.info.address][this.getSelectedMethodId][inputIndex].value;
              console.log(now() + " Contract - setInputArrayElement - currentElement: " + JSON.stringify(currentElement));
              Vue.set(this.settings.inputs[this.info.address][this.getSelectedMethodId][inputIndex].value, arrayIndex, elementValue);
              const newElement = this.settings.inputs[this.info.address][this.getSelectedMethodId][inputIndex].value;
              console.log(now() + " Contract - setInputArrayElement - newElement: " + JSON.stringify(newElement));
            }
          }
        }
      }
      this.saveSettings();
    },
    // setInputArrayElement(inputIndex, arrayIndex, elementValue) {
    //   console.log(now() + " Contract - setInputArrayElement - inputIndex: " + inputIndex + ", arrayIndex: " + arrayIndex + ", elementValue: " + elementValue);
    //   if (this.selectedFunction) {
    //     if (this.info.address in this.settings.inputs) {
    //       if (this.getSelectedMethodId in this.settings.inputs[this.info.address]) {
    //         if (inputIndex in this.settings.inputs[this.info.address][this.getSelectedMethodId]) {
    //           const currentElement = this.settings.inputs[this.info.address][this.getSelectedMethodId][inputIndex];
    //           console.log(now() + " Contract - setInputArrayElement - currentElement: " + JSON.stringify(currentElement));
    //           Vue.set(this.settings.inputs[this.info.address][this.getSelectedMethodId][inputIndex].value, arrayIndex, elementValue);
    //           const newElement = this.settings.inputs[this.info.address][this.getSelectedMethodId][inputIndex];
    //           console.log(now() + " Contract - setInputArrayElement - newElement: " + JSON.stringify(newElement));
    //         }
    //       }
    //     }
    //   }
    //   this.saveSettings();
    // },
    removeInputArrayElement(inputIndex, arrayIndex) {
      console.log(now() + " Contract - removeInputArrayElement - inputIndex: " + inputIndex + ", arrayIndex: " + arrayIndex);
      if (this.selectedFunction) {
        if (this.info.address in this.settings.inputs) {
          if (this.getSelectedMethodId in this.settings.inputs[this.info.address]) {
            // console.log(now() + " Contract - removeInputArrayElement - BEFORE elements: " + JSON.stringify(this.settings.inputs[this.info.address][this.getSelectedMethodId][inputIndex]));
            if (inputIndex in this.settings.inputs[this.info.address][this.getSelectedMethodId]) {
              array = this.settings.inputs[this.info.address][this.getSelectedMethodId][inputIndex].value;
              array.splice(arrayIndex, 1);
              Vue.set(this.settings.inputs[this.info.address][this.getSelectedMethodId][inputIndex], "value", array);
              // console.log(now() + " Contract - removeInputArrayElement - AFTER  elements: " + JSON.stringify(this.settings.inputs[this.info.address][this.getSelectedMethodId][inputIndex]));
            }
          }
        }
      }
      this.saveSettings();
    },
    setInput(index, value) {
      // console.log(now() + " Contract - setInput - index: " + index + ", value: " + value);
      if (this.selectedFunction) {
        if (value) {
          if (!(this.info.address in this.settings.inputs)) {
            Vue.set(this.settings.inputs, this.info.address, {});
          }
          if (!(this.getSelectedMethodId in this.settings.inputs[this.info.address])) {
            Vue.set(this.settings.inputs[this.info.address], this.getSelectedMethodId, {});
          }
          if (!(index in this.settings.inputs[this.info.address][this.getSelectedMethodId])) {
            Vue.set(this.settings.inputs[this.info.address][this.getSelectedMethodId], index, { value, type: null });
          } else {
            Vue.set(this.settings.inputs[this.info.address][this.getSelectedMethodId][index], "value", value);
          }
        } else {
          if (this.info.address in this.settings.inputs) {
            if (this.getSelectedMethodId in this.settings.inputs[this.info.address]) {
              if (index in this.settings.inputs[this.info.address][this.getSelectedMethodId]) {
                Vue.delete(this.settings.inputs[this.info.address][this.getSelectedMethodId], index);
              }
              if (Object.keys(this.settings.inputs[this.info.address][this.getSelectedMethodId]).length == 0) {
                Vue.delete(this.settings.inputs[this.info.address], this.getSelectedMethodId);
              }
            }
            if (Object.keys(this.settings.inputs[this.info.address]).length == 0) {
              Vue.delete(this.settings.inputs, this.info.address);
            }
          }
        }
      }
      this.saveSettings();
    },
    getInputUnits(index) {
      console.log(now() + " Contract - getInputUnits - index: " + index);
      if (this.getSelectedMethodId in this.functions) {
        if (this.info.address in this.settings.inputUnits) {
          if (this.getSelectedMethodId in this.settings.inputUnits[this.info.address]) {
            return this.settings.inputUnits[this.info.address][this.getSelectedMethodId][index];
          }
        }
      }
      return null;
    },
    setInputUnits(index, value) {
      console.log(now() + " Contract - setInputUnits - index: " + index + ", value: " + value);
      if (this.getSelectedMethodId in this.functions) {
        if (value) {
          if (!(this.info.address in this.settings.inputUnits)) {
            Vue.set(this.settings.inputUnits, this.info.address, {});
          }
          if (!(this.getSelectedMethodId in this.settings.inputUnits[this.info.address])) {
            Vue.set(this.settings.inputUnits[this.info.address], this.getSelectedMethodId, {});
          }
          Vue.set(this.settings.inputUnits[this.info.address][this.getSelectedMethodId], index, value);
        } else {
          if (this.info.address in this.settings.inputUnits) {
            if (this.getSelectedMethodId in this.settings.inputUnits[this.info.address]) {
              if (index in this.settings.inputUnits[this.info.address][this.getSelectedMethodId]) {
                Vue.delete(this.settings.inputUnits[this.info.address][this.getSelectedMethodId], index);
              }
              if (Object.keys(this.settings.inputUnits[this.info.address][this.getSelectedMethodId]).length == 0) {
                Vue.delete(this.settings.inputUnits[this.info.address], this.getSelectedMethodId);
              }
            }
            if (Object.keys(this.settings.inputUnits[this.info.address]).length == 0) {
              Vue.delete(this.settings.inputUnits, this.info.address);
            }
          }
        }
      }
      this.saveSettings();
    },
    getOutput(index) {
      // console.log(now() + " Contract - getOutput - index: " + index);
      if (this.getSelectedMethodId in this.functions) {
        if (this.info.address in this.settings.outputs) {
          if (this.getSelectedMethodId in this.settings.outputs[this.info.address]) {
            return this.settings.outputs[this.info.address][this.getSelectedMethodId][index];
          }
        }
      }
      return null;
    },
    setOutputs(outputs) {
      // console.log(now() + " Contract - setOutputs - outputs: " + JSON.stringify(outputs));
      if (!(this.info.address in this.settings.outputs)) {
        Vue.set(this.settings.outputs, this.info.address, {});
      }
      Vue.set(this.settings.outputs[this.info.address], this.getSelectedMethodId, outputs);
      this.saveSettings();
    },
    getValue() {
      console.log(now() + " Contract - getValue");
      if (this.getSelectedMethodId in this.functions) {
        if (this.info.address in this.settings.values) {
          if (this.getSelectedMethodId in this.settings.values[this.info.address]) {
            return this.settings.values[this.info.address][this.getSelectedMethodId];
          }
        }
      }
      return null;
    },
    setValue(value) {
      console.log(now() + " Contract - setValue - value: " + JSON.stringify(value));
      if (!(this.info.address in this.settings.values)) {
        Vue.set(this.settings.values, this.info.address, {});
      }
      Vue.set(this.settings.values[this.info.address], this.getSelectedMethodId, value);
      this.saveSettings();
    },
    getOutputUnits(index) {
      console.log(now() + " Contract - getOutputUnits - index: " + index);
      if (this.getSelectedMethodId in this.functions) {
        if (this.info.address in this.settings.outputUnits) {
          if (this.getSelectedMethodId in this.settings.outputUnits[this.info.address]) {
            return this.settings.outputUnits[this.info.address][this.getSelectedMethodId][index];
          }
        }
      }
      return null;
    },
    setOutputUnits(index, value) {
      console.log(now() + " Contract - setOutputUnits - index: " + index + ", value: " + value);
      if (this.getSelectedMethodId in this.functions) {
        if (value) {
          if (!(this.info.address in this.settings.outputUnits)) {
            Vue.set(this.settings.outputUnits, this.info.address, {});
          }
          if (!(this.getSelectedMethodId in this.settings.outputUnits[this.info.address])) {
            Vue.set(this.settings.outputUnits[this.info.address], this.getSelectedMethodId, {});
          }
          Vue.set(this.settings.outputUnits[this.info.address][this.getSelectedMethodId], index, value);
        } else {
          if (this.info.address in this.settings.outputUnits) {
            if (this.getSelectedMethodId in this.settings.outputUnits[this.info.address]) {
              if (index in this.settings.outputUnits[this.info.address][this.getSelectedMethodId]) {
                Vue.delete(this.settings.outputUnits[this.info.address][this.getSelectedMethodId], index);
              }
              if (Object.keys(this.settings.outputUnits[this.info.address][this.getSelectedMethodId]).length == 0) {
                Vue.delete(this.settings.outputUnits[this.info.address], this.getSelectedMethodId);
              }
            }
            if (Object.keys(this.settings.outputUnits[this.info.address]).length == 0) {
              Vue.delete(this.settings.outputUnits, this.info.address);
            }
          }
        }
      }
      this.saveSettings();
    },

    formatUintUnits(n, unit) {
      console.log(now() + " Contract - methods.formatUintUnits - n: " + n + ", unit: " + unit);
      if (n == null) {
        return null;
      }
      let result;
      if (unit == null) {
        result = n.toString();
      } else if (unit in ETHERS_UNIT_TRANSLATION) {
        result = ethers.utils.formatUnits(n, ETHERS_UNIT_TRANSLATION[unit]);
      } else if (unit == "boolean") {
        result = n == null || n == 0 ? "false" : "true";
      } else if (unit == "datetimelocal") {
        result = moment.unix(n).format("YYYY-MM-DD HH:mm:ss")
      } else if (unit == "datetimeutc") {
        result = moment.unix(n).utc().format("YYYY-MM-DD HH:mm:ss")
      }
      console.log(now() + " functions.js:formatUintUnits(" + n + ", \"" + unit + "\") => \"" + result + "\"");
      return result;
    },

    parseUintUnits(n, unit) {
      if (n == null) {
        return null;
      }
      let result;
      if (unit == null) {
        result = ethers.utils.parseUnits(n, "wei");
      } else if (unit in ETHERS_UNIT_TRANSLATION) {
        result = ethers.utils.parseUnits(n, ETHERS_UNIT_TRANSLATION[unit]);
      } else if (unit == "boolean") {
        result = n.substring(0, 1).toLowerCase() == "t" ? ethers.BigNumber.from("1") : ethers.BigNumber.from("0");
      } else if (unit == "datetimelocal") {
        result = ethers.BigNumber.from(moment(n).unix());
      } else if (unit == "datetimeutc") {
        result = ethers.BigNumber.from(moment.utc(n).unix());
      }
      console.log(now() + " functions.js:parseUintUnits(" + n + ", \"" + unit + "\") => \"" + result + "\"");
      return result;
    },

    async callFunction() {
      console.log(now() + " Contract - callFunction - address: " + this.info.address);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const functionInfo = this.getSelectedMethodId && this.functions[this.getSelectedMethodId] || null;
      if (functionInfo) {
        console.log(now() + " Contract - callFunction - functionInfo: " + JSON.stringify(functionInfo));
        const interface = new ethers.utils.Interface(this.info.abi);
        const contract = new ethers.Contract(this.info.address, this.info.abi, provider);
        const parameters = [];
        for (const [index, input] of functionInfo.inputs.entries()) {
          console.log(index + " => " + JSON.stringify(input));
          const value = this.getInput(index).value;
          parameters.push(value);
        }
        console.log(now() + " Contract - callFunction - parameters: " + JSON.stringify(parameters));
        try {
          const results  = await contract[functionInfo.name](...parameters);
          console.log(now() + " Contract - callFunction - results: " + JSON.stringify(results));
          const outputs = [];
          for (const [index, output] of functionInfo.outputs.entries()) {
            console.log(index + " => " + typeof output + " " + JSON.stringify(output));
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
          console.log(now() + " Contract - callFunction - outputs: " + JSON.stringify(outputs));
          this.setOutputs(outputs);

        } catch (e) {
          console.error(moment().format("HH:mm:ss") + " Contract - callFunction - error: " + e.message);
        }
      }
    },
    executeTransaction() {
      console.log(now() + " Contract - executeTransaction");
    },

    saveSettings() {
      // console.log(now() + " Contract - saveSettings: " + JSON.stringify(this.settings, null, 2));
      console.log(now() + " Contract - saveSettings - settings.inputs: " + JSON.stringify(this.settings.inputs, null, 2));
      localStorage.explorerContractSettings = JSON.stringify(this.settings);
    },
    copyToClipboard(str) {
      navigator.clipboard.writeText(str);
    },
    commify0(n) {
      if (n != null) {
        return Number(n).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
      }
      return null;
    },
    formatETH(e) {
      if (e) {
        return ethers.utils.formatEther(e).replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
      }
      return null;
    },
    formatGas(e) {
      if (e) {
        return ethers.utils.formatUnits(e, "gwei").replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
      }
      return null;
    },
    formatTimestamp(ts) {
      if (ts != null) {
        return moment.unix(ts).format("YYYY-MM-DD HH:mm:ss");
      }
      return null;
    },
  },
  // beforeRouteUpdate(to, from) {
  //   console.log(now() + " Contract - beforeRouteUpdate");
  //   console.table(to);
  //   console.table(from);
  // },
  beforeDestroy() {
    console.log(now() + " Contract - beforeDestroy()");
  },
  mounted() {
    console.log(now() + " Contract - mounted() $route.params: " + JSON.stringify(this.$route.params));
    if ('explorerContractSettings' in localStorage) {
      const tempSettings = JSON.parse(localStorage.explorerContractSettings);
      if ('version' in tempSettings && tempSettings.version == this.settings.version) {
        Vue.set(this, 'settings', tempSettings);
        // this.settings.xTable.currentPage = 1;
      }
    }
    const t = this;
    setTimeout(function() {
      (async() => {
        await t.loadData(t.inputAddress);
      })();
    }, 1000);
  },
  destroyed() {
    this.reschedule = false;
  },
};

const contractModule = {
  namespaced: true,
  state: {
  },
  getters: {
  },
  mutations: {
  },
  actions: {
  },
};
