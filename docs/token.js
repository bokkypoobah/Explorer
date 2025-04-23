const Token = {
  template: `
    <div>
      <v-container fluid class="pa-1">
        <v-toolbar density="compact" class="mt-1">
          <h4 class="ml-2">Token</h4>
          <render-address v-if="address" :address="address"></render-address>
          <p class="ml-5 text-caption text--disabled">
            {{ type && type.replace(/erc/, "ERC-") || "" }} {{ symbol }} {{ name && ("'" + name + "'") || "" }} {{ decimals }}
          </p>
          <v-spacer></v-spacer>
          <v-btn v-if="sync.info == null" @click="syncToken();" color="primary" icon v-tooltip="'Sync Token Info'">
            <v-icon>mdi-refresh</v-icon>
          </v-btn>
          <v-btn v-if="sync.info == null" @click="syncTokenEvents();" color="primary" icon v-tooltip="'Sync Token Events'">
            <v-icon>mdi-download-multiple</v-icon>
          </v-btn>
          <v-btn v-if="sync.info != null" @click="setSyncHalt();" color="primary" icon v-tooltip="'Halt syncing'">
            <v-icon>mdi-stop</v-icon>
          </v-btn>
          <v-progress-circular v-if="sync.info != null" color="primary" :model-value="sync.total ? (parseInt(sync.completed * 100 / sync.total)) : 0" :size="30" :width="6" v-tooltip="sync.info + ': ' + commify0(sync.completed) + ' of ' + commify0(sync.total)"></v-progress-circular>
          <v-spacer></v-spacer>
          <v-tabs v-model="settings.tab" @update:modelValue="saveSettings();" right color="deep-purple-accent-4">
            <v-tab prepend-icon="mdi-text-long" text="Info" value="info" class="lowercase-btn"></v-tab>
            <v-tab prepend-icon="mdi-account-multiple-outline" text="Owners" value="owners" class="lowercase-btn"></v-tab>
            <v-tab prepend-icon="mdi-check-outline" text="Approvals" value="approvals" class="lowercase-btn"></v-tab>
            <v-tab prepend-icon="mdi-math-log" text="Events" value="events" class="lowercase-btn"></v-tab>
          </v-tabs>
        </v-toolbar density="compact" class="mt-1">
        <v-tabs-window v-model="settings.tab">
          <v-tabs-window-item value="info">
            <v-card>
              <v-card-text>
                <v-row no-gutters dense>
                  <v-col cols="2" align="right">
                    <p class="my-2">Address:</p>
                  </v-col>
                  <v-col cols="6" align="left">
                    <render-address v-if="address" :address="address"></render-address>
                  </v-col>
                </v-row>
                <v-row no-gutters dense>
                  <v-col cols="2" align="right">
                    <p class="my-2">Type:</p>
                  </v-col>
                  <v-col cols="6" align="left">
                    <v-btn v-if="type" variant="text" class="lowercase-btn ma-0 px-2" style="min-width: 0px;">
                      {{ type && type.replace(/erc/, "ERC-") || "" }}
                    </v-btn>
                  </v-col>
                </v-row>
                <v-row v-if="type == 'erc20'" no-gutters dense>
                  <v-col cols="2" align="right">
                    <p class="my-2">Symbol:</p>
                  </v-col>
                  <v-col cols="6" align="left">
                    <v-btn v-if="symbol" variant="text" class="lowercase-btn ma-0 px-2" style="min-width: 0px;">
                      {{ symbol }}
                    </v-btn>
                  </v-col>
                </v-row>
                <v-row no-gutters dense>
                  <v-col cols="2" align="right">
                    <p class="my-2">Name:</p>
                  </v-col>
                  <v-col cols="6" align="left">
                    <v-btn v-if="name" variant="text" class="lowercase-btn ma-0 px-2" style="min-width: 0px;">
                      {{ name }}
                    </v-btn>
                  </v-col>
                </v-row>
                <v-row v-if="type == 'erc20'" no-gutters dense>
                  <v-col cols="2" align="right">
                    <p class="my-2">Decimals:</p>
                  </v-col>
                  <v-col cols="6" align="left">
                    <v-btn v-if="decimals" variant="text" class="lowercase-btn ma-0 px-2" style="min-width: 0px;">
                      {{ decimals }}
                    </v-btn>
                  </v-col>
                </v-row>
                <v-row v-if="type == 'erc20'" no-gutters dense>
                  <v-col cols="2" align="right">
                    <p class="my-2">Total Supply:</p>
                  </v-col>
                  <v-col cols="6" align="left">
                    <v-btn v-if="totalSupply" variant="text" class="lowercase-btn ma-0 px-2" style="min-width: 0px;">
                      {{ totalSupply && formatUnits(totalSupply) || "" }}
                    </v-btn>
                  </v-col>
                </v-row>
                <v-row no-gutters dense>
                  <v-col cols="2" align="right">
                    <p class="my-2">Number of Events:</p>
                  </v-col>
                  <v-col cols="6" align="left">
                    <v-btn variant="text" class="lowercase-btn ma-0 px-2" style="min-width: 0px;">
                      {{ numberOfEvents != null && commify0(numberOfEvents) || "Click [Sync Token Events] above" }}
                    </v-btn>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-tabs-window-item>
          <v-tabs-window-item value="owners">
            <v-row v-if="type == 'erc20'" no-gutters dense>
              <v-col cols="7">
                <v-data-table
                  :items="erc20OwnersList"
                  :headers="erc20OwnersHeaders"
                  v-model:sort-by="settings.erc20Owners.sortBy"
                  v-model:items-per-page="settings.erc20Owners.itemsPerPage"
                  v-model:page="settings.erc20Owners.currentPage"
                  @update:options="saveSettings();"
                  density="comfortable"
                >
                  <template v-slot:item.rowNumber="{ index }">
                    {{ (settings.erc20Owners.currentPage - 1) * settings.erc20Owners.itemsPerPage + index + 1 }}
                  </template>
                  <template v-slot:item.address="{ item }">
                    <render-address :address="item.address" noXPadding></render-address>
                  </template>
                  <template v-slot:item.balance="{ item }">
                    {{ formatUnits(item.balance, decimals) }}
                  </template>
                </v-data-table>
                <!-- <pre v-if="type == 'erc721' || type == 'erc1155'">
nftOwnersList: {{ nftOwnersList }}
                  <br />
nftTotalSupply: {{ nftTotalSupply }}
                  <br />
tokens: {{ tokens }}
                </pre> -->
              </v-col>
              <v-col cols="5">
                <apexchart type="pie" :options="erc20OwnersChartOptions" :series="erc20OwnersChartSeries" class="ml-5 mt-5"></apexchart>
              </v-col>
            </v-row>
            <!-- <pre v-if="type == 'erc1155'">
nftTotalSupply: {{ nftTotalSupply }}
              <br />
nftOwnersList: {{ nftOwnersList }}
            </pre> -->
            <v-data-table
              v-if="type == 'erc721' || type == 'erc1155'"
              :items="nftOwnersList"
              :headers="nftOwnersHeaders"
              v-model:sort-by="settings.nftOwners.sortBy"
              v-model:items-per-page="settings.nftOwners.itemsPerPage"
              v-model:page="settings.nftOwners.currentPage"
              @update:options="saveSettings();"
              density="comfortable"
            >
              <template v-slot:item.rowNumber="{ index }">
                {{ (settings.nftOwners.currentPage - 1) * settings.nftOwners.itemsPerPage + index + 1 }}
              </template>
              <template v-slot:item.address="{ item }">
                <render-address :address="item.address" shortAddress noXPadding></render-address>
              </template>
              <template v-slot:item.count="{ item }">
                {{ item.count }}
              </template>
              <template v-slot:item.tokens="{ item }">
                <span v-if="type == 'erc721'">
                  {{ item.tokens.join(", ") }}
                </span>
                <span v-else>
                  {{ item.tokens.map(e => e.tokenId + "x" + e.count).join(", ") }}
                </span>
              </template>
            </v-data-table>

          </v-tabs-window-item>
          <v-tabs-window-item value="approvals">
            <v-data-table
              :items="approvalsList"
              :headers="getApprovalsHeaders"
              v-model:sort-by="settings.approvals.sortBy"
              v-model:items-per-page="settings.approvals.itemsPerPage"
              v-model:page="settings.approvals.currentPage"
              @update:options="saveSettings();"
              density="comfortable"
            >
            <template v-slot:item.rowNumber="{ index }">
              {{ (settings.approvals.currentPage - 1) * settings.approvals.itemsPerPage + index + 1 }}
            </template>
            <template v-slot:item.blockNumber="{ item }">
              <render-block-number :block="item.blockNumber" noXPadding></render-block-number>
            </template>
            <template v-slot:item.txHash="{ item }">
              <render-tx-hash :txHash="item.txHash" shortTxHash noXPadding></render-tx-hash>
            </template>
            <template v-slot:item.event="{ item }">
              <v-btn variant="text" class="lowercase-btn ma-0 px-0">
                {{ item.event }}
              </v-btn>
            </template>
            <template v-slot:item.address1="{ item }">
              <render-address :address="item.owner" shortAddress noXPadding></render-address>
            </template>
            <template v-slot:item.address2="{ item }">
              <span v-if="type == 'erc20'">
                <render-address :address="item.spender" shortAddress noXPadding></render-address>
              </span>
              <span v-else-if="type == 'erc721'">
                <span v-if="item.event == 'Approval'">
                  {{ item.tokenId }}
                </span>
                <span v-else-if="item.event == 'ApprovalForAll'">
                  <render-address :address="item.operator" shortAddress noXPadding></render-address>
                </span>
              </span>
              <span v-else-if="type == 'erc1155'">
                <render-address :address="item.operator" shortAddress noXPadding></render-address>
              </span>
            </template>
            <template v-slot:item.value1="{ item }">
              <span v-if="type == 'erc20'">
                <!-- {{ item.tokens }} -->

                <span v-if="item.tokens.toString().length > 40" v-tooltip="formatUnits(item.tokens, decimals)">
                  <v-btn variant="text" class="lowercase-btn ma-0 px-2" style="min-width: 0px;">
                    &infin;
                  </v-btn>
                </span>
                <span v-else>
                  <v-btn variant="text" class="lowercase-btn ma-0 px-2" style="min-width: 0px;">
                    {{ formatUnits(item.tokens, decimals) }}
                  </v-btn>
                </span>

              </span>
              <span v-else-if="type == 'erc721'">
                <span v-if="item.event == 'Approval'">
                  <render-address :address="item.approved" shortAddress noXPadding></render-address>
                </span>
                <span v-else-if="item.event == 'ApprovalForAll'">
                  <v-btn variant="text" class="lowercase-btn ma-0 px-0"  style="min-width: 0px;">
                    {{ item.approved }}
                  </v-btn>
                </span>
              </span>
              <span v-else-if="type == 'erc1155'">
                <v-btn variant="text" class="lowercase-btn ma-0 px-0"  style="min-width: 0px;">
                  {{ item.approved }}
                </v-btn>
              </span>
            </template>
            </v-data-table>
          </v-tabs-window-item>
          <v-tabs-window-item value="events">
            <!-- <v-data-table-server
              v-model:items-per-page="itemsPerPage"
              :items-per-page-options="itemsPerPageOptions"
              :headers="blocksHeaders"
              :items="blocks"
              :items-length="blockNumber + 1"
              :loading="loading"
              :search="live && blockNumber.toString() || null"
              item-value="name"
              @update:options="loadItems"
              v-model:page="currentPage"
              density="comfortable"
            > -->
            <v-data-table-server
              v-if="address"
              :headers="getEventsHeaders"
              :items-length="numberOfEvents || 0"
              :items="items"
              :search="numberOfEvents && numberOfEvents.toString() || null"
              @update:options="loadItems"
              :items-per-page-options="itemsPerPageOptions"
            >
              <template v-slot:item.blockNumber="{ item }">
                <render-block-number :block="item.blockNumber" noXPadding></render-block-number>
              </template>
              <template v-slot:item.txHash="{ item }">
                <render-tx-hash :txHash="item.txHash" shortTxHash noXPadding></render-tx-hash>
              </template>
              <template v-slot:item.event="{ item }">
                <v-btn variant="text" class="lowercase-btn ma-0 px-0">
                  {{ item.info.event }}
                </v-btn>
              </template>
              <template v-slot:item.address1="{ item }">
                <span v-if="type == 'erc20'">
                  <span v-if="item.info.event == 'Transfer'">
                    <render-address :address="item.info.from" shortAddress noXPadding></render-address>
                  </span>
                  <span v-else>
                    <render-address :address="item.info.owner" shortAddress noXPadding></render-address>
                  </span>
                </span>
                <span v-else-if="type == 'erc721'">
                  <span v-if="item.info.event == 'Transfer'">
                    <render-address :address="item.info.from" shortAddress noXPadding></render-address>
                  </span>
                  <span v-else-if="item.info.event == 'Approval'">
                    <render-address :address="item.info.owner" shortAddress noXPadding></render-address>
                  </span>
                  <span v-else>
                    <render-address :address="item.info.owner" shortAddress noXPadding></render-address>
                  </span>
                </span>
                <span v-else>
                  <span v-if="item.info.event == 'TransferSingle'">
                    <render-address :address="item.info.from" shortAddress noXPadding></render-address>
                  </span>
                  <span v-else-if="item.info.event == 'TransferBatch'">
                    <render-address :address="item.info.from" shortAddress noXPadding></render-address>
                  </span>
                  <span v-else-if="item.info.event == 'ApprovalForAll'">
                    <render-address :address="item.info.owner" shortAddress noXPadding></render-address>
                  </span>
                </span>
              </template>
              <template v-slot:item.address2="{ item }">
                <span v-if="type == 'erc20'">
                  <span v-if="item.info.event == 'Transfer'">
                    <render-address :address="item.info.to" shortAddress noXPadding></render-address>
                  </span>
                  <span v-else>
                    <render-address :address="item.info.spender" shortAddress noXPadding></render-address>
                  </span>
                </span>
                <span v-else-if="type == 'erc721'">
                  <span v-if="item.info.event == 'Transfer'">
                    <render-address :address="item.info.to" shortAddress noXPadding></render-address>
                  </span>
                  <span v-else-if="item.info.event == 'Approval'">
                    <render-address :address="item.info.approved" shortAddress noXPadding></render-address>
                  </span>
                  <span v-else>
                    <render-address :address="item.info.operator" shortAddress noXPadding></render-address>
                  </span>
                </span>
                <span v-else>
                  <span v-if="item.info.event == 'TransferSingle'">
                    <render-address :address="item.info.to" shortAddress noXPadding></render-address>
                  </span>
                  <span v-else-if="item.info.event == 'TransferBatch'">
                    <render-address :address="item.info.to" shortAddress noXPadding></render-address>
                  </span>
                  <span v-else-if="item.info.event == 'ApprovalForAll'">
                    <render-address :address="item.info.operator" shortAddress noXPadding></render-address>
                  </span>
                </span>
              </template>
              <template v-slot:item.value1="{ item }">
                <v-row justify="end">
                  <span v-if="type == 'erc20'">
                    <span v-if="item.info.tokens.toString().length > 40" v-tooltip="formatUnits(item.info.tokens, decimals)">
                      <v-btn variant="text" class="lowercase-btn ma-0 px-2" style="min-width: 0px;">
                        &infin;
                      </v-btn>
                    </span>
                    <span v-else>
                      <v-btn variant="text" class="lowercase-btn ma-0 px-2" style="min-width: 0px;">
                        {{ formatUnits(item.info.tokens, decimals) }}
                      </v-btn>
                    </span>
                  </span>
                  <span v-else-if="type == 'erc721'">
                    <span v-if="item.info.event == 'Transfer'">
                      <v-btn variant="text" class="lowercase-btn ma-0 px-2" style="min-width: 0px;">
                        {{ item.info.tokenId }}
                      </v-btn>
                    </span>
                    <span v-else-if="item.info.event == 'Approval'">
                      <v-btn variant="text" class="lowercase-btn ma-0 px-2" style="min-width: 0px;">
                        {{ item.info.tokenId }}
                      </v-btn>
                    </span>
                    <span v-else>
                      <v-btn variant="text" class="lowercase-btn ma-0 px-2" style="min-width: 0px;">
                        {{ item.info.approved }}
                      </v-btn>
                    </span>
                  </span>
                  <span v-else>
                    <span v-if="item.info.event == 'TransferSingle'">
                      <v-btn variant="text" class="lowercase-btn ma-0 px-2" style="min-width: 0px;">
                        {{ item.info.tokenId }}
                      </v-btn>
                    </span>
                    <span v-else-if="item.info.event == 'TransferBatch'">
                      <v-btn variant="text" class="lowercase-btn ma-0 px-2" style="min-width: 0px;">
                        {{ item.info.tokenIds.join(',') }}
                      </v-btn>
                    </span>
                    <span v-else-if="item.info.event == 'ApprovalForAll'">
                      <v-btn variant="text" class="lowercase-btn ma-0 px-2" style="min-width: 0px;">
                        {{ item.info.approved }}
                      </v-btn>
                    </span>
                  </span>
                </v-row>
              </template>
              <template v-slot:item.value2="{ item }">
                <span v-if="type == 'erc1155'">
                  <span v-if="item.info.event == 'TransferSingle'">
                    <v-btn variant="text" class="lowercase-btn ma-0 px-2" style="min-width: 0px;">
                      {{ item.info.value }}
                    </v-btn>
                  </span>
                  <span v-else-if="item.info.event == 'TransferBatch'">
                    <v-btn variant="text" class="lowercase-btn ma-0 px-2" style="min-width: 0px;">
                      {{ item.info.values.join(',') }}
                    </v-btn>
                  </span>
                </span>
              </template>
            </v-data-table-server>
          </v-tabs-window-item>
        </v-tabs-window>
      </v-container>
    </div>
  `,
  props: ['inputAddress'],
  data: function () {
    return {
      initialised: false,
      settings: {
        tab: null,
        erc20Owners: {
          sortBy: [{ key: "balances", order: "desc" }],
          itemsPerPage: 10,
          currentPage: 1,
          top: 20,
        },
        nftOwners: {
          sortBy: [{ key: "count", order: "desc" }],
          itemsPerPage: 10,
          currentPage: 1,
          top: 20,
        },
        approvals: {
          sortBy: [{ key: "blockNumber", order: "desc" }],
          itemsPerPage: 10,
          currentPage: 1,
        },
        version: 4,
      },
      items: [],
      itemsPerPageOptions: [
        { value: 5, title: "5" },
        { value: 10, title: "10" },
        { value: 20, title: "20" },
        { value: 30, title: "30" },
        { value: 40, title: "40" },
        { value: 50, title: "50" },
        { value: 100, title: "100" },
      ],
      erc20OwnersHeaders: [
        { title: '#', value: 'rowNumber', align: 'end', sortable: false },
        { title: 'Address', value: 'address', sortable: true, sortRaw: (a, b) => a.address.localeCompare(b.address) },
        { title: 'Balance', value: 'balance', align: 'end', sortable: true, sortRaw: (a, b) => ethers.BigNumber.from(a.balance).sub(b.balance) },
        { title: '%', value: 'percent', align: 'end', sortable: false },
      ],
      nftOwnersHeaders: [
        { title: '#', value: 'rowNumber', align: 'end', sortable: false },
        { title: 'Address', value: 'address', sortable: true, sortRaw: (a, b) => a.address.localeCompare(b.address) },
        { title: 'Count', value: 'count', align: 'end', sortable: true, sortRaw: (a, b) => a.count - b.count },
        { title: '%', value: 'percent', align: 'end', sortable: false },
        { title: 'Tokens', value: 'tokens', sortable: false },
      ],
    };
  },
  computed: {
    sync() {
      return store.getters['token/sync'];
    },
    address() {
      return store.getters['token/address'];
    },
    type() {
      return store.getters['token/info'].type || null;
    },
    name() {
      return store.getters['token/info'].name || null;
    },
    symbol() {
      return store.getters['token/info'].symbol || null;
    },
    decimals() {
      return store.getters['token/info'].decimals || null;
    },
    totalSupply() {
      return store.getters['token/info'].totalSupply || null;
    },
    numberOfEvents() {
      return store.getters['token/numberOfEvents'];
    },
    balances() {
      return store.getters['token/balances'];
    },
    tokens() {
      return store.getters['token/tokens'];
    },
    approvals() {
      return store.getters['token/approvals'];
    },
    approvalForAlls() {
      return store.getters['token/approvalForAlls'];
    },
    version() {
      return store.getters['token/info'].version || null;
    },
    implementation() {
      return store.getters['token/info'].implementation || null;
    },
    explorer() {
      return store.getters['explorer'];
    },
    getEventsHeaders() {
      if (this.type == "erc20") {
        return [
          { title: 'When', value: 'when', sortable: false },
          { title: 'Block #', value: 'blockNumber', sortable: true },
          { title: 'Tx Hash', value: 'txHash', sortable: false },
          { title: 'Event', value: 'event', sortable: false },
          { title: 'From / Owner', value: 'address1', sortable: false },
          { title: 'To / Spender', value: 'address2', sortable: false },
          { title: 'Tokens', value: 'value1', align: 'end', sortable: false },
        ];
      } else if (this.type == "erc721") {
        return [
          { title: 'When', value: 'when', sortable: false },
          { title: 'Block #', value: 'blockNumber', sortable: true },
          { title: 'Tx Hash', value: 'txHash', sortable: false },
          { title: 'Event', value: 'event', sortable: false },
          { title: 'From / Owner / Account', value: 'address1', sortable: false },
          { title: 'To / Approved / Operator', value: 'address2', sortable: false },
          { title: 'Token Id / Token Id / Approved', value: 'value1', align: 'end', sortable: false },
        ];
      } else {
        return [
          { title: 'When', value: 'when', sortable: false },
          { title: 'Block #', value: 'blockNumber', sortable: true },
          { title: 'Tx Hash', value: 'txHash', sortable: false },
          { title: 'Event', value: 'event', sortable: false },
          { title: 'From / Owner', value: 'address1', sortable: false },
          { title: 'To / Operator', value: 'address2', sortable: false },
          { title: 'Token Id / Approved', value: 'value1', align: 'end', sortable: false },
          { title: 'Tokens', value: 'value2', align: 'end', sortable: false },
        ];
      }
    },
    getApprovalsHeaders() {
      if (this.type == "erc20") {
        return [
          { title: '#', value: 'rowNumber', align: 'end', sortable: false },
          // { title: 'When', value: 'when', sortable: false },
          { title: 'Block #', value: 'blockNumber', sortable: true },
          { title: 'Tx Hash', value: 'txHash', sortable: false },
          { title: 'Event', value: 'event', sortable: false },
          { title: 'Owner', value: 'address1', sortable: false },
          { title: 'Spender', value: 'address2', sortable: false },
          { title: 'Tokens', value: 'value1', align: 'end', sortable: false },
        ];
      } else if (this.type == "erc721") {
        return [
          { title: '#', value: 'rowNumber', align: 'end', sortable: false },
          // { title: 'When', value: 'when', sortable: false },
          { title: 'Block #', value: 'blockNumber', sortable: true },
          { title: 'Tx Hash', value: 'txHash', sortable: false },
          { title: 'Event', value: 'event', sortable: false },
          { title: 'Owner', value: 'address1', sortable: false },
          { title: 'Token Id / Operator', value: 'address2', sortable: false },
          { title: 'Approved', value: 'value1', sortable: false },
        ];
      } else {
        return [
          { title: '#', value: 'rowNumber', align: 'end', sortable: false },
          // { title: 'When', value: 'when', sortable: false },
          { title: 'Block #', value: 'blockNumber', sortable: true },
          { title: 'Tx Hash', value: 'txHash', sortable: false },
          { title: 'Event', value: 'event', sortable: false },
          { title: 'Owner', value: 'address1', sortable: false },
          { title: 'Operator', value: 'address2', sortable: false },
          { title: 'Approved', value: 'value1', sortable: false },
        ];
      }
    },
    erc20OwnersList() {
      const results = [];
      // console.log(now() + " Token - computed.erc20OwnersList - this.balances: " + JSON.stringify(this.balances, null, 2));
      for (const [address, balance] of Object.entries(this.balances)) {
        const percent = ethers.BigNumber.from(balance).mul(1000000).div(this.totalSupply) / 10000.0;
        // results.push({ address, balance: ethers.utils.formatUnits(balance, this.decimals), percent });
        results.push({ address, balance, percent });
      }
      results.sort((a, b) => {
        return ethers.BigNumber.from(b.balance).sub(a.balance);
        // return b.balance - a.balance;
      });
      return results;
    },
    nftTotalSupply() {
      let result = 0;
      if (this.type == "erc721") {
        result = Object.keys(this.tokens).length;
      } else if (this.type == "erc1155") {
        for (const [tokenId, ownerData] of Object.entries(this.tokens)) {
          // console.log(tokenId + " => " + JSON.stringify(ownerData));
          for (const [owner, count] of Object.entries(ownerData)) {
            // console.log(tokenId + "/" + owner + " => " + count);
            result += parseInt(count);
          }
        }
      }
      return result;
    },
    nftOwnersList() {
      const results = [];
      // console.log(now() + " Token - computed.nftOwnersList - this.tokens: " + JSON.stringify(this.tokens, null, 2));
      if (this.type == "erc721") {
        const totalSupply = this.nftTotalSupply;
        const owners = {};
        for (const [tokenId, owner] of Object.entries(this.tokens)) {
          if (!(owner in owners)) {
            owners[owner] = [];
          }
          owners[owner].push(tokenId);
        }
        // console.log(now() + " Token - computed.nftOwnersList - owners: " + JSON.stringify(owners, null, 2));
        for (const [address, tokens] of Object.entries(owners)) {
          const percent = tokens.length * 100.0 / totalSupply ;
          results.push({ address, count: tokens.length, percent: percent.toFixed(4), tokens });
        }
      } else if (this.type == "erc1155") {
        const totalSupply = this.nftTotalSupply;
        const owners = {};
        for (const [tokenId, ownerData] of Object.entries(this.tokens)) {
          for (const [owner, count] of Object.entries(ownerData)) {
            if (!(owner in owners)) {
              owners[owner] = [];
            }
            owners[owner].push({ tokenId, count });
          }
        }
        // console.log(now() + " Token - computed.nftOwnersList - owners: " + JSON.stringify(owners, null, 2));
        for (const [address, tokenInfo] of Object.entries(owners)) {
          let count = 0;
          for (const item of tokenInfo) {
            // console.log("  " + JSON.stringify(item));
            count += parseInt(item.count);
          }
          // console.log(address + " => " + count + " " + JSON.stringify(tokenInfo));
          const percent = count * 100.0 / totalSupply ;
          results.push({ address, count, percent: percent.toFixed(4), tokens: tokenInfo });
        }

      }
      results.sort((a, b) => {
        return b.count - a.count;
      });
      // console.log(now() + " Token - computed.nftOwnersList - results: " + JSON.stringify(results, null, 2));
      return results;
    },
    approvalsList() {
      const results = [];
      // console.log(now() + " Token - computed.approvalsList - this.approvals: " + JSON.stringify(this.approvals, null, 2));
      // console.log(now() + " Token - computed.approvalsList - this.approvalForAlls: " + JSON.stringify(this.approvalForAlls, null, 2));
      if (this.type == "erc20") {
        for (const [owner, ownerData] of Object.entries(this.approvals)) {
          for (const [spender, data] of Object.entries(ownerData)) {
            results.push({ event: "Approval", owner, spender, ...data });
          }
        }
      } else if (this.type == "erc721") {
        for (const [owner, ownerData] of Object.entries(this.approvals)) {
          for (const [tokenId, data] of Object.entries(ownerData)) {
            results.push({ event: "Approval", owner, tokenId, ...data });
          }
        }
        for (const [owner, ownerData] of Object.entries(this.approvalForAlls)) {
          for (const [operator, data] of Object.entries(ownerData)) {
            results.push({ event: "ApprovalForAll", owner, operator, ...data });
          }
        }
      } else if (this.type == "erc1155") {
        for (const [owner, ownerData] of Object.entries(this.approvalForAlls)) {
          for (const [operator, data] of Object.entries(ownerData)) {
            results.push({ event: "ApprovalForAll", owner, operator, ...data });
          }
        }
      }
      results.sort((a, b) => {
        return b.blockNumber - a.blockNumber;
      });
      // console.log(now() + " Token - computed.approvalsList - results: " + JSON.stringify(results, null, 2));
      return results;
    },
    erc20OwnersChartSeries() {
      const series = [];
      let other = 0;
      for (const [index, row] of this.erc20OwnersList.entries()) {
        const value = parseFloat(ethers.utils.formatUnits(row.balance, this.decimals));
        if (index < this.settings.erc20Owners.top) {
          series.push(value);
        } else {
          other += value;
        }
      }
      if (other > 0) {
        series.push(other);
      }
      // console.log(now() + " Token - computed.erc20OwnersChartSeries - series: " + JSON.stringify(series));
      return series;
    },
    erc20OwnersChartOptions() {
      const labels = [];
      let other = 0;
      let otherPercent = 0;
      for (const [index, row] of this.erc20OwnersList.entries()) {
        const value = parseFloat(ethers.utils.formatUnits(row.balance, this.decimals));
        if (index < this.settings.erc20Owners.top) {
          labels.push(row.address.substring(0, 10) + " " + row.percent.toFixed(4) + "%");
        } else {
          other += value;
          otherPercent += row.percent;
        }
      }
      if (other > 0) {
        labels.push("Other " + otherPercent.toFixed(4) + "%");
      }
      // console.log(now() + " Token - computed.erc20OwnersChartOptions - labels: " + JSON.stringify(labels));
      return {
        chart: {
          width: 540,
          type: 'pie',
        },
        labels,
        // responsive: [{
        //   breakpoint: 480,
        //   options: {
        //     chart: {
        //       width: 200
        //     },
        //     legend: {
        //       position: 'bottom'
        //     }
        //   }
        // }],
      }
    },
  },
  methods: {
    syncToken() {
      console.log(now() + " Token - methods.syncToken");
      const address = store.getters["token/address"];
      console.log(now() + " Token - methods.syncToken - address: " + address);
      store.dispatch('token/loadToken', { inputAddress: address, forceUpdate: true });
    },
    syncTokenEvents() {
      console.log(now() + " Token - methods.syncTokenEvents");
      const address = store.getters["token/address"];
      console.log(now() + " Token - methods.syncTokenEvents - address: " + address);
      store.dispatch('token/syncTokenEvents', { inputAddress: address, forceUpdate: true });
    },
    setSyncHalt() {
      console.log(now() + " Token - methods.setSyncHalt");
      store.dispatch('token/setSyncHalt');
    },

    async loadItems ({ page, itemsPerPage, sortBy }) {
      const sort = !sortBy || sortBy.length == 0 || (sortBy[0].key == "blockNumber" && sortBy[0].order == "desc") ? "desc" : "asc";
      console.log(now() + " Token - methods.loadItems - page: " + page + ", itemsPerPage: " + itemsPerPage + ", sortBy: " + JSON.stringify(sortBy) + ", sort: " + sort);
      const dbInfo = store.getters["db"];
      const db = new Dexie(dbInfo.name);
      db.version(dbInfo.version).stores(dbInfo.schemaDefinition);
      const address = store.getters["token/address"];
      console.log(now() + " Token - methods.loadItems - address: " + address);
      if (address) {
        const chainId = store.getters["chainId"];
        const row = (page - 1) * itemsPerPage;
        let data;
        if (sort == "asc") {
          data = await db.tokenEvents.where('[chainId+address+blockNumber+logIndex]').between([chainId, address, Dexie.minKey, Dexie.minKey],[chainId, address, Dexie.maxKey, Dexie.maxKey]).offset(row).limit(itemsPerPage).toArray();
        } else {
          data = await db.tokenEvents.where('[chainId+address+blockNumber+logIndex]').between([chainId, address, Dexie.minKey, Dexie.minKey],[chainId, address, Dexie.maxKey, Dexie.maxKey]).reverse().offset(row).limit(itemsPerPage).toArray();
        }
        this.items = data;
      }
      db.close();
    },

    formatUnits(e, decimals) {
      if (e) {
        return ethers.utils.formatUnits(e, decimals).replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
      }
      return null;
    },
    commify0(n) {
      if (n != null) {
        return Number(n).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
      }
      return null;
    },
    saveSettings() {
      // console.log(now() + " Token - methods.saveSettings - settings: " + JSON.stringify(this.settings, null, 2));
      if (this.initialised) {
        localStorage.explorerTokenSettings = JSON.stringify(this.settings);
      }
    },
    copyToClipboard(str) {
      navigator.clipboard.writeText(str);
    },
  },
  beforeCreate() {
    console.log(now() + " Token - beforeCreate");
	},
  mounted() {
    console.log(now() + " Token - mounted - inputAddress: " + this.inputAddress);

    if ('explorerTokenSettings' in localStorage) {
      const tempSettings = JSON.parse(localStorage.explorerTokenSettings);
      // console.log(now() + " Token - mounted - tempSettings: " + JSON.stringify(tempSettings));
      if ('version' in tempSettings && tempSettings.version == this.settings.version) {
        this.settings = tempSettings;
      }
    }
    this.initialised = true;
    console.log(now() + " Token - mounted - this.settings: " + JSON.stringify(this.settings));

    const t = this;
    setTimeout(function() {
      store.dispatch('token/loadToken', { inputAddress: t.inputAddress, forceUpdate: false });
    }, 1000);
	},
  unmounted() {
    console.log(now() + " Token - unmounted");
	},
  destroyed() {
    console.log(now() + " Token - destroyed");
	},
};
