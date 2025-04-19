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
            <v-tab prepend-icon="mdi-cash-multiple" text="Balances" value="balances" class="lowercase-btn"></v-tab>
            <v-tab prepend-icon="mdi-log" text="Events" value="events" class="lowercase-btn"></v-tab>
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
                <span v-if="type == 'erc20'">
                  {{ formatUnits(item.info.tokens, decimals) }}
                </span>
                <span v-else-if="type == 'erc721'">
                  <span v-if="item.info.event == 'Transfer'">
                    <v-btn variant="text" class="lowercase-btn ma-0 px-0">
                      {{ item.info.tokenId }}
                    </v-btn>
                  </span>
                  <span v-else-if="item.info.event == 'Approval'">
                    <v-btn variant="text" class="lowercase-btn ma-0 px-0">
                      {{ item.info.tokenId }}
                    </v-btn>
                  </span>
                  <span v-else>
                    <v-btn variant="text" class="lowercase-btn ma-0 px-0">
                      {{ item.info.approved }}
                    </v-btn>
                  </span>
                </span>
                <span v-else>
                  <span v-if="item.info.event == 'TransferSingle'">
                    <v-btn variant="text" class="lowercase-btn ma-0 px-0">
                      {{ item.info.tokenId }}
                    </v-btn>
                  </span>
                  <span v-else-if="item.info.event == 'TransferBatch'">
                    <v-btn variant="text" class="lowercase-btn ma-0 px-0">
                      {{ item.info.tokenIds.join(',') }}
                    </v-btn>
                  </span>
                  <span v-else-if="item.info.event == 'ApprovalForAll'">
                    <v-btn variant="text" class="lowercase-btn ma-0 px-0">
                      {{ item.info.approved }}
                    </v-btn>
                  </span>
                </span>
              </template>
              <template v-slot:item.value2="{ item }">
                <span v-if="type == 'erc1155'">
                  <span v-if="item.info.event == 'TransferSingle'">
                    <v-btn variant="text" class="lowercase-btn ma-0 px-0">
                      {{ item.info.value }}
                    </v-btn>
                  </span>
                  <span v-else-if="item.info.event == 'TransferBatch'">
                    <v-btn variant="text" class="lowercase-btn ma-0 px-0">
                      {{ item.info.values.join(',') }}
                    </v-btn>
                  </span>
                </span>
              </template>
            </v-data-table-server>
          </v-tabs-window-item>
        </v-tabs-window>
      </v-container fluid class="pa-1">

      <!-- <v-card v-if="!inputAddress">
        <v-card-text>
          Enter address in the search field above
        </v-card-text>
      </v-card> -->
      <!-- <v-container fluid class="pa-1">
        <v-toolbar v-if="inputAddress && address" density="compact" class="mt-1">
          <v-menu location="bottom">
            <template v-slot:activator="{ props }">
              <v-btn color="primary" dark v-bind="props" variant="text" class="lowercase-btn">
                {{ address }}
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="copyToClipboard(address);">
                <template v-slot:prepend>
                  <v-icon>mdi-content-copy</v-icon>
                </template>
                <v-list-item-title>Copy address to clipboard</v-list-item-title>
              </v-list-item>
              <v-list-item :href="explorer + 'address/' + address" target="_blank">
                <template v-slot:prepend>
                  <v-icon>mdi-link-variant</v-icon>
                </template>
                <v-list-item-title>View in explorer</v-list-item-title>
              </v-list-item>
              <v-list-item :href="'https://remix.ethereum.org/address/' + address" target="_blank">
                <template v-slot:prepend>
                  <v-icon>mdi-link-variant</v-icon>
                </template>
                <v-list-item-title>View in remix.ethereum.org</v-list-item-title>
              </v-list-item>
              <v-list-item :href="'https://opensea.io/' + address" target="_blank">
                <template v-slot:prepend>
                  <v-icon>mdi-link-variant</v-icon>
                </template>
                <v-list-item-title>View in opensea.io</v-list-item-title>
              </v-list-item>
              <v-list-item :href="'https://app.ens.domains/' + address" target="_blank">
                <template v-slot:prepend>
                  <v-icon>mdi-link-variant</v-icon>
                </template>
                <v-list-item-title>View in app.ens.domains</v-list-item-title>
              </v-list-item>
              <div v-if="type == 'safe'">
                <v-divider inset></v-divider>
                <v-list-subheader inset>Gnosis Safe v{{ version }}</v-list-subheader>
                <v-list-item :href="'https://app.safe.global/home?safe=eth:' + address" target="_blank">
                  <template v-slot:prepend>
                    <v-icon>mdi-link-variant</v-icon>
                  </template>
                  <v-list-item-title>View in app.safe.global</v-list-item-title>
                </v-list-item>
                <v-list-item :href="explorer + 'address/' + implementation" target="_blank">
                  <template v-slot:prepend>
                    <v-icon>mdi-link-variant</v-icon>
                  </template>
                  <v-list-item-title>View implementation in explorer</v-list-item-title>
                </v-list-item>
                <v-list-item :href="'https://remix.ethereum.org/address/' + implementation" target="_blank">
                  <template v-slot:prepend>
                    <v-icon>mdi-link-variant</v-icon>
                  </template>
                  <v-list-item-title>View implementation in remix.ethereum.org</v-list-item-title>
                </v-list-item>
              </div>
            </v-list>
          </v-menu>
          <v-spacer></v-spacer>
          <v-btn @click="syncToken();" color="primary" icon>
            <v-icon>mdi-refresh</v-icon>
          </v-btn>
          <v-spacer></v-spacer>
          <v-tabs right color="deep-purple-accent-4">
            <v-tab :disabled="!address" :to="'/address/' + address" class="lowercase-btn">Address</v-tab>
            <v-tab :disabled="!address" :to="'/address/' + address + '/contract'" class="lowercase-btn">Contract</v-tab>
            <v-tab :disabled="!address" :to="'/address/' + address + '/functions'" class="lowercase-btn">Functions</v-tab>
            <v-tab :disabled="!address" :to="'/address/' + address + '/tokens'" class="lowercase-btn">Tokens</v-tab>
            <v-tab :disabled="!address" :to="'/address/' + address + '/transactions'" class="lowercase-btn">Transactions</v-tab>
            <v-tab :disabled="!address" :to="'/address/' + address + '/events'" class="lowercase-btn">Events</v-tab>
          </v-tabs>
        </v-toolbar>
        <router-view v-if="inputAddress && address" />
      </v-container> -->
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
      items: [],
      eventsHeaders: [
        { title: 'When', value: 'when', sortable: true },
        { title: 'Event', value: 'event', sortable: false },
        { title: 'Info', value: 'info', sortable: true },
      ],
      itemsPerPageOptions: [
        { value: 5, title: "5" },
        { value: 10, title: "10" },
        { value: 20, title: "20" },
        { value: 30, title: "30" },
        { value: 40, title: "40" },
        { value: 50, title: "50" },
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
      return store.getters['token/info'].numberOfEvents || null;
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
          { title: 'Tokens', value: 'value1', sortable: false },
        ];
      } else if (this.type == "erc721") {
        return [
          { title: 'When', value: 'when', sortable: false },
          { title: 'Block #', value: 'blockNumber', sortable: true },
          { title: 'Tx Hash', value: 'txHash', sortable: false },
          { title: 'Event', value: 'event', sortable: false },
          { title: 'From / Owner / Account', value: 'address1', sortable: false },
          { title: 'To / Approved / Operator', value: 'address2', sortable: false },
          { title: 'Token Id / Token Id / Approved', value: 'value1', sortable: false },
        ];
      } else {
        return [
          { title: 'When', value: 'when', sortable: false },
          { title: 'Block #', value: 'blockNumber', sortable: true },
          { title: 'Tx Hash', value: 'txHash', sortable: false },
          { title: 'Event', value: 'event', sortable: false },
          { title: 'From / Owner', value: 'address1', sortable: false },
          { title: 'To / Operator', value: 'address2', sortable: false },
          { title: 'Token Id / Approved', value: 'value1', sortable: false },
          { title: 'Tokens', value: 'value2', sortable: false },
        ];
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
      console.log(now() + " Token - methods.loadItems - page: " + page + ", itemsPerPage: " + itemsPerPage + ", sortBy: " + JSON.stringify(sortBy));
      const dbInfo = store.getters["db"];
      const db = new Dexie(dbInfo.name);
      db.version(dbInfo.version).stores(dbInfo.schemaDefinition);
      const address = store.getters["token/address"];
      console.log(now() + " Token - methods.loadItems - address: " + address);
      if (address) {
        const chainId = store.getters["chainId"];
        const row = (page - 1) * itemsPerPage;
        const data = await db.tokenEvents.where('[chainId+address+blockNumber+logIndex]').between([chainId, address, Dexie.minKey, Dexie.minKey],[chainId, address, Dexie.maxKey, Dexie.maxKey]).offset(row).limit(itemsPerPage).toArray();
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
