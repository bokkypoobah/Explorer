const Punks = {
  template: `
    <div>
      <v-container fluid class="pa-1">
        <v-toolbar density="compact" class="mt-1">
          <h4 class="ml-2">Punks</h4>
          <v-spacer></v-spacer>
          <v-btn :disabled="chainId != 1" @click="syncPunks();" color="primary" icon>
            <v-icon>mdi-refresh</v-icon>
          </v-btn>
          <v-btn v-if="sync.info == null" :disabled="chainId != 1" @click="syncPunksEvents();" color="primary" icon v-tooltip="'Sync Punks Events'">
            <v-icon>mdi-download</v-icon>
          </v-btn>
          <v-btn v-if="sync.info != null" @click="setSyncHalt();" color="primary" icon v-tooltip="'Halt syncing'">
            <v-icon>mdi-stop</v-icon>
          </v-btn>
          <v-progress-circular v-if="sync.info != null" color="primary" :model-value="sync.total ? (parseInt(sync.completed * 100 / sync.total)) : 0" :size="30" :width="6" v-tooltip="sync.info + ': Block #' + commify0(sync.completed) + ' of ' + commify0(sync.total)"></v-progress-circular>
          <v-spacer></v-spacer>
          <v-tabs v-model="settings.tab" @update:modelValue="saveSettings();" right color="deep-purple-accent-4">
            <v-tab prepend-icon="mdi-emoticon-cool-outline" text="Punks" value="punks" class="lowercase-btn"></v-tab>
            <v-tab prepend-icon="mdi-account-multiple-outline" text="Owners" value="owners" class="lowercase-btn"></v-tab>
            <v-tab prepend-icon="mdi-chart-line" text="Charts" value="charts" class="lowercase-btn"></v-tab>
            <v-tab prepend-icon="mdi-math-log" text="Events" value="events" class="lowercase-btn"></v-tab>
          </v-tabs>
        </v-toolbar>
        <v-toolbar flat color="transparent" density="compact">
          <v-btn icon @click="settings.tokens.showFilter = !settings.tokens.showFilter; saveSettings();" color="primary" class="lowercase-btn" v-tooltip="'Attributes filter'">
            <v-icon :icon="settings.tokens.showFilter ? 'mdi-filter' : 'mdi-filter-outline'"></v-icon>
          </v-btn>
          <v-text-field :model-value="settings.tokens.filter" @update:modelValue="filterUpdated($event);" variant="solo" flat density="compact" prepend-inner-icon="mdi-magnify" hide-details single-line class="ml-2" style="max-width: 200px;" placeholder="single id or range" v-tooltip="'e.g., 123 or 1234-2345'"></v-text-field>
          <v-spacer></v-spacer>
          <div v-for="(attributeData, attribute) of settings.attributes">
            <v-btn v-for="(optionData, option) of attributeData" size="x-small" variant="elevated" append-icon="mdi-close" @click="updateAttributes({ attribute, option, value: false });" class="ma-1 pa-1 lowercase-btn">
              {{ attribute }}: {{ option }}
              <template v-slot:append>
                <v-icon color="primary"></v-icon>
              </template>
            </v-btn>
          </div>
          <v-spacer></v-spacer>
          <v-select
            v-if="settings.tab == 'punks'"
            v-model="settings.tokens.sortOption"
            :items="tokensSortOptions"
            variant="plain"
            density="compact"
            class="mt-3 mr-3"
            style="max-width: 200px;"
            @update:modelValue="saveSettings();"
          ></v-select>
          <v-select
            v-if="settings.tab == 'owners'"
            v-model="settings.owners.sortOption"
            :items="ownersSortOptions"
            variant="plain"
            density="compact"
            class="mt-3 mr-3"
            style="max-width: 200px;"
            @update:modelValue="saveSettings();"
          ></v-select>
          <v-btn-toggle v-if="settings.tab == 'punks'" v-model="settings.tokens.view" variant="plain" class="mr-3" @update:modelValue="saveSettings();" density="compact">
            <v-btn icon value="large">
              <v-icon color="primary">mdi-grid-large</v-icon>
            </v-btn>
            <v-btn icon value="medium">
              <v-icon color="primary">mdi-grid</v-icon>
            </v-btn>
            <v-btn icon value="list">
              <v-icon color="primary">mdi-format-list-bulleted-square</v-icon>
            </v-btn>
          </v-btn-toggle>
          <p v-if="settings.tab == 'punks'" class="mr-1 text-caption text--disabled">
            {{ commify0(filteredTokens.length) + '/' + commify0(attributes.length) }}
          </p>
          <p v-if="settings.tab == 'owners'" class="mr-1 text-caption text--disabled">
            {{ commify0(filteredOwnersList.length) + "/" + commify0(totalOwners) }}
          </p>
          <v-pagination
            v-if="settings.tab == 'punks'"
            v-model="settings.tokens.currentPage"
            :length="Math.ceil(filteredTokens.length / settings.tokens.itemsPerPage)"
            total-visible="0"
            density="comfortable"
            show-first-last-page
            class="mr-1"
            @update:modelValue="saveSettings();"
            color="primary"
          >
          </v-pagination>
          <v-pagination
            v-if="settings.tab == 'owners'"
            v-model="settings.owners.currentPage"
            :length="Math.ceil(filteredOwnersList.length / settings.owners.itemsPerPage)"
            total-visible="0"
            density="comfortable"
            show-first-last-page
            class="mr-1"
            @update:modelValue="saveSettings();"
            color="primary"
          >
          </v-pagination>
        </v-toolbar>
        <v-row dense>
          <v-col v-if="settings.tokens.showFilter" cols="2">
            <v-card>
              <v-expansion-panels flat>
                <!-- <v-expansion-panel class="ma-0 pa-0">
                  <v-expansion-panel-title class="ma-1 pa-1">
                    Price
                  </v-expansion-panel-title>
                  <v-expansion-panel-text class="ma-0 pa-0">
                    <v-list-item class="ma-0 pa-1">
                      <v-text-field label="Min" variant="underlined" density="compact" class="my-1"></v-text-field>
                    </v-list-item>
                    <v-list-item class="ma-0 pa-1">
                      <v-text-field label="Max" variant="underlined" density="compact" class="my-1"></v-text-field>
                    </v-list-item>
                  </v-expansion-panel-text>
                </v-expansion-panel> -->
                <v-expansion-panel v-for="attribute in attributesList" class="ma-0 pa-0">
                  <v-expansion-panel-title class="ma-1 pa-1">
                    {{ attribute.attribute }}
                  </v-expansion-panel-title>
                  <v-expansion-panel-text class="ma-0 pa-0">
                    <span v-for="option in attribute.options" class="ma-0 pa-0">
                      <v-list-item class="ma-0 pa-0">
                        <v-list-item-title style="font-size: 12px !important;">
                          {{ option.value }}
                        </v-list-item-title>
                        <template v-slot:prepend="{ isSelected, select }">
                          <v-list-item-action class="flex-column align-end">
                            <v-checkbox-btn
                              :model-value="settings.attributes[attribute.attribute] && settings.attributes[attribute.attribute][option.value] || false"
                              @update:modelValue="updateAttributes({ attribute: attribute.attribute, option: option.value, value: $event })"
                            >
                            </v-checkbox-btn>
                          </v-list-item-action>
                        </template>
                        <template v-slot:append="{ isSelected, select }">
                          <v-list-item-action class="flex-column align-end">
                            <small class="mt-0 text-high-emphasis opacity-60">{{ commify0(option.count) }}</small>
                          </v-list-item-action>
                        </template>
                      </v-list-item>
                    </span>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-card>
          </v-col>
          <v-col :cols="settings.tokens.showFilter ? 10 : 12" align="left">
            <v-card>
              <v-card-text class="ma-0 pa-2">
                <v-tabs-window v-model="settings.tab">
                  <v-tabs-window-item value="punks">
                    <v-row v-if="settings.tokens.view != 'list'" dense class="d-flex flex-wrap" align="stretch">
                      <v-col v-for="(item, index) in filteredTokensPaged" :key="index" align="center">
                        <v-card class="pb-2" :max-width="settings.tokens.view != 'medium' ? 260 : 130">
                          <v-img :src="'data:image/png;base64,' + images[item[0]]" :width="settings.tokens.view != 'medium' ? 260 : 130" cover align="left" class="align-end text-white" style="image-rendering: pixelated; background-color: #638596;">
                            <!-- <v-card-title v-if="settings.tokens.view == 'large'" class="text-left" style="text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5); font-size: 1em;">{{ item[0] }}</v-card-title>
                            <!-- <v-card-title v-if="settings.tokens.view == 'medium'" class="text-left" style="text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5); font-size: 0.7em;">{{ item[0] }}</v-card-title> -->
                            <v-chip label size="x-small" variant="flat" color="secondary" class="ma-1">
                              {{ commify0(item[0]) }}
                            </v-chip>
                          </v-img>

                          <v-card-text class="ma-0 pa-0 px-2 pt-1 d-flex">
                            <render-address :address="item[2]" :addresses="addresses" miniAddress noXPadding></render-address>
                            <!-- <v-chip v-for="attribute of item[1]" size="x-small" variant="tonal" color="secondary" class="ma-0">
                              {{ attribute[1] }}
                            </v-chip> -->
                            <!-- <div v-if="type == 'erc721'">
                              <render-address :address="item.owner" :addresses="addresses" miniAddress noXPadding></render-address>
                            </div> -->
                            <!-- <div class="mt-2">
                              {{ Object.keys(item.owners || {}).length + ' owners' }}
                            </div> -->
                            <v-spacer></v-spacer>
                            <!-- <div v-if="item.price" v-tooltip="'Price on ' + item.price.source + ' ~ ' + commify2(item.price.amountUSD) + ' USD'" class="mt-2">
                              {{ item.price.amount + " " + item.price.currency }}
                            </div> -->
                          </v-card-text>
                          <!-- <v-card-subtitle v-if="settings.tokens.view == 'large'" class="ma-0 px-2 pt-0 d-flex">
                            <div v-if="item.lastSale" v-tooltip="'Last sale @ ' + formatTimestamp(item.lastSale.timestamp) + ' ~ ' + commify2(item.lastSale.amountUSD) + ' USD'">
                              <small class="mb-4 text-high-emphasis opacity-60">{{ item.lastSale.amount + " " + item.lastSale.currency }}</small>
                            </div>
                            <v-spacer></v-spacer>
                            <div v-if="item.topBid" v-tooltip="'Top bid on ' + item.topBid.source + ' ~ ' + commify2(item.topBid.amountUSD) + ' USD'">
                              <small class="mb-4 text-high-emphasis opacity-60">{{ item.topBid.amount + " " + item.topBid.currency }}</small>
                            </div>
                          </v-card-subtitle> -->
                        </v-card>
                      </v-col>
                    </v-row>

                    <v-data-table
                      v-if="settings.tokens.view == 'list'"
                      :items="filteredTokens"
                      :headers="tokensHeaders"
                      v-model:sort-by="settings.tokens.sortBy"
                      v-model:items-per-page="settings.tokens.itemsPerPage"
                      v-model:page="settings.tokens.currentPage"
                      @update:options="saveSettings();"
                      density="comfortable"
                      hide-default-footer
                    >
                      <template v-slot:item.rowNumber="{ index }">
                        {{ (settings.tokens.currentPage - 1) * settings.tokens.itemsPerPage + index + 1 }}
                      </template>
                      <template v-slot:item.punkId="{ item }">
                        {{ commify0(item[0]) }}
                      </template>
                      <template v-slot:item.image="{ item }">
                        <v-img :src="'data:image/png;base64,' + images[item[0]]" width="60" class="ma-2 pa-0" style="image-rendering: pixelated; background-color: #638596;">
                        </v-img>
                      </template>
                      <template v-slot:item.owner="{ item }">
                        <render-address :address="item[2]" :addresses="addresses" shortAddress noXPadding></render-address>
                      </template>
                      <template v-slot:item.attributes="{ item }">
                        <v-chip v-for="attribute of item[1]" size="small" variant="tonal" color="secondary" class="ma-2">
                          {{ attribute[0] + ": " + attribute[1] }}
                        </v-chip>
                      </template>
                      <template v-slot:item.attributeCount="{ item }">
                        {{ item[1].length }}
                      </template>
                      <template v-slot:item.bid="{ item }">
                        <span v-if="item[3]">
                          {{ formatETH(item[3][0]) }}
                        </span>
                      </template>
                      <template v-slot:item.offer="{ item }">
                        <span v-if="item[4]">
                          {{ formatETH(item[4][0]) }}
                        </span>
                      </template>
                      <template v-slot:item.last="{ item }">
                        <span v-if="item[5]">
                          {{ formatETH(item[5][0]) }}
                        </span>
                      </template>
                    </v-data-table>
                  </v-tabs-window-item>
                  <v-tabs-window-item value="owners">
                    <v-data-table
                      :items="filteredOwnersList"
                      :headers="ownersHeaders"
                      v-model:sort-by="settings.owners.sortBy"
                      v-model:items-per-page="settings.owners.itemsPerPage"
                      v-model:page="settings.owners.currentPage"
                      @update:options="saveSettings();"
                      density="comfortable"
                      hide-default-footer
                    >
                      <template v-slot:item.rowNumber="{ index }">
                        {{ (settings.owners.currentPage - 1) * settings.owners.itemsPerPage + index + 1 }}
                      </template>
                      <template v-slot:item.owner="{ item }">
                        <render-address :address="item.owner" :addresses="addresses" shortAddress noXPadding></render-address>
                      </template>
                      <template v-slot:item.punks="{ item }">
                        <v-row dense class="d-flex flex-row justify-start">
                          <v-col v-for="punkId in item.punkIds">
                            <v-card class="ma-1" max-width="72">
                              <v-img :src="'data:image/png;base64,' + images[punkId]" width="72" cover align="left" class="align-end text-white" style="image-rendering: pixelated; background-color: #638596;">
                                <!-- <v-card-title v-if="settings.tokens.view == 'large'" class="text-left" style="text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5); font-size: 1em;">{{ punkId }}</v-card-title>
                                <v-card-title v-if="settings.tokens.view == 'medium'" class="text-left" style="text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5); font-size: 0.7em;">{{ punkId }}</v-card-title> -->
                              </v-img>
                              <v-chip label size="x-small" variant="tonal" color="secondary" class="ma-1">
                                {{ commify0(punkId) }}
                              </v-chip>
                            </v-card>
                          </v-col>
                          <v-spacer></v-spacer>
                        </v-row>
                      </template>
                      <template v-slot:item.punksCount="{ item }">
                        {{ commify0(item.count) }}
                      </template>
                    </v-data-table>
                  </v-tabs-window-item>
                  <v-tabs-window-item value="charts">
                    TODO: Charts
                    Punk #0
                    <v-img :src="'data:image/png;base64,' + images[0]" width="400" style="image-rendering: pixelated;">
                    </v-img>
                    {{ attributes[0] }}
                  </v-tabs-window-item>
                  <v-tabs-window-item value="events">
                    TODO: Events
                  </v-tabs-window-item>
                </v-tabs-window>
              </v-card-text>
              <v-toolbar flat color="transparent" density="compact">
                <v-spacer></v-spacer>
                <v-select
                  v-if="settings.tab == 'punks'"
                  v-model="settings.tokens.itemsPerPage"
                  :items="itemsPerPageOptions"
                  variant="plain"
                  density="compact"
                  class="mt-2 mr-2"
                  style="max-width: 70px;"
                  @update:modelValue="saveSettings();"
                ></v-select>
                <v-select
                  v-if="settings.tab == 'owners'"
                  v-model="settings.owners.itemsPerPage"
                  :items="itemsPerPageOptions"
                  variant="plain"
                  density="compact"
                  class="mt-2 mr-2"
                  style="max-width: 70px;"
                  @update:modelValue="saveSettings();"
                ></v-select>
                <v-pagination
                  v-if="settings.tab == 'punks'"
                  v-model="settings.tokens.currentPage"
                  :length="Math.ceil(filteredTokens.length / settings.tokens.itemsPerPage)"
                  total-visible="0"
                  density="comfortable"
                  show-first-last-page
                  class="mr-1"
                  @update:modelValue="saveSettings();"
                  color="primary"
                >
                </v-pagination>
                <v-pagination
                  v-if="settings.tab == 'owners'"
                  v-model="settings.owners.currentPage"
                  :length="Math.ceil(filteredOwnersList.length / settings.owners.itemsPerPage)"
                  total-visible="0"
                  density="comfortable"
                  show-first-last-page
                  class="mr-1"
                  @update:modelValue="saveSettings();"
                  color="primary"
                >
                </v-pagination>
              </v-toolbar>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </div>
  `,
  props: ['inputPunkId'],
  data: function () {
    return {
      initialised: false,
      settings: {
        tab: null,
        tokens: {
          filter: null,
          showFilter: false,
          view: "large",
          sortOption: "punkidasc",
          itemsPerPage: 10,
          currentPage: 1,
        },
        owners: {
          showFilter: false,
          view: "large",
          sortOption: "ownercountdsc",
          itemsPerPage: 10,
          currentPage: 1,
        },
        attributes: {}, // address -> attribute -> option -> selected?
        version: 2,
      },
      _timerId: null,
      itemsPerPageOptions: [
        { value: 5, title: "5" },
        { value: 10, title: "10" },
        { value: 20, title: "20" },
        { value: 30, title: "30" },
        { value: 40, title: "40" },
        { value: 50, title: "50" },
        { value: 100, title: "100" },
        { value: 250, title: "250" },
        { value: 500, title: "500" },
        { value: 1000, title: "1000" },
      ],
      tokensSortOptions: [
        { value: "punkidasc", title: "▲ Punk Id" },
        { value: "punkiddsc", title: "▼ Punk Id" },
      ],
      ownersSortOptions: [
        { value: "ownercountasc", title: "▲ Owner Count" },
        { value: "ownercountdsc", title: "▼ Owner Count" },
      ],
      tokensHeaders: [
        { title: '#', value: 'rowNumber', align: 'end', sortable: false },
        { title: 'PunkId', value: 'punkId', align: 'end', sortable: false },
        { title: 'Image', value: 'image', sortable: false },
        { title: 'Owner', value: 'owner', sortable: false },
        { title: 'Attributes', value: 'attributes', sortable: false },
        { title: '#Attributes', value: 'attributeCount', sortable: false },
        { title: 'Bid', value: 'bid', sortable: false },
        { title: 'Offer', value: 'offer', sortable: false },
        { title: 'Last', value: 'last', sortable: false },
      ],
      ownersHeaders: [
        { title: '#', value: 'rowNumber', align: 'end', sortable: false },
        { title: 'Owner', value: 'owner', sortable: false },
        { title: 'Count', value: 'punksCount', sortable: false },
        { title: 'Punks', value: 'punks', sortable: false },
      ],
    };
  },
  computed: {
    chainId() {
      return store.getters['chainId'];
    },
    attributes() {
      return store.getters['punks/attributes'];
    },
    images() {
      return PUNK_IMAGES;
    },
    addresses() {
      return store.getters['punks/addresses'];
    },
    txHashes() {
      return store.getters['punks/txHashes'];
    },
    owners() {
      return store.getters['punks/owners'];
    },
    bids() {
      return store.getters['punks/bids'];
    },
    offers() {
      return store.getters['punks/offers'];
    },
    last() {
      return store.getters['punks/last'];
    },
    sync() {
      return store.getters['punks/sync'];
    },
    attributesMap() {
      const results = {};
      if (this.attributes && this.attributes.length > 0) {
        for (const [punkId, attributes] of this.attributes.entries()) {
          for (const attributeRecord of attributes) {
            const [attribute, option] = attributeRecord;
            if (!(attribute in results)) {
              results[attribute] = {};
            }
            if (!(option in results[attribute])) {
              results[attribute][option] = [];
            }
            results[attribute][option].push(parseInt(punkId));
          }
        }
      }
      return results;
    },
    attributesList() {
      const results = [];
      for (const [attribute, attributeInfo] of Object.entries(this.attributesMap)) {
        const array = [];
        for (const [value, punkIds] of Object.entries(attributeInfo)) {
          array.push({ value, count: punkIds.length });
        }
        array.sort((a, b) => {
          return a.count - b.count;
        });
        results.push({ attribute, options: array });
      }
      results.sort((a, b) => {
        return a.attribute.localeCompare(b.attribute);
      });
      return results;
    },
    filteredTokens() {
      const idRegex = /^\d+$/;
      const rangeRegex = /^\d+\-\d+$/;

      const filter = this.settings.tokens.filter;
      let [ id, minId, maxId ] = [ null, null, null ];
      if (idRegex.test(filter)) {
        console.log(now() + " Token - computed.filteredTokens - ID filter: " + filter);
        id = parseInt(filter);
      } else if (rangeRegex.test(filter)) {
        const parts = filter.split(/-/);
        minId = parts[0];
        maxId = parts[1];
        console.log(now() + " Token - computed.filteredTokens - RANGE filter: " + filter);
      } else {
        id = 999999;
        console.log(now() + " Token - computed.filteredTokens - OTHER filter: " + filter);
      }
      console.log(now() + " Token - computed.filteredTokens - id: " + id + ", minId: " + minId + ", maxId: " + maxId);

      const results = [];
      if (Object.keys(this.settings.attributes).length > 0 && this.attributesList.length > 0) {
        let punkIds = null;
        for (const [attribute, attributeData] of Object.entries(this.settings.attributes)) {
          let attributePunkIds = null;
          for (const [option, value] of Object.entries(attributeData)) {
            if (!attributePunkIds) {
              attributePunkIds = new Set(this.attributesMap[attribute][option]);
            } else {
              attributePunkIds = new Set([...attributePunkIds, ...this.attributesMap[attribute][option]]);
            }
          }
          if (!punkIds) {
            punkIds = attributePunkIds;
          } else {
            const newPunkIds = new Set();
            for (const tokenId of punkIds) {
              if ((attributePunkIds.has(tokenId))) {
                newPunkIds.add(tokenId);
              }
            }
            punkIds = newPunkIds;
          }
        }
        for (const punkId of punkIds) {
          if (!filter || ((id == null || punkId == id) && (minId == null || punkId >= minId) && (maxId == null || punkId <= maxId))) {
            results.push([ punkId, this.attributes[punkId], this.owners[punkId], this.bids[punkId] || null, this.offers[punkId] || null, this.last[punkId] || null ]);
          }
        }
      } else {
        if (this.attributes && this.attributes.length > 0) {
          for (const [punkId, attribute] of this.attributes.entries()) {
            if (!filter || ((id == null || punkId == id) && (minId == null || punkId >= minId) && (maxId == null || punkId <= maxId))) {
              results.push([ punkId, attribute, this.owners[punkId], this.bids[punkId] || null, this.offers[punkId] || null, this.last[punkId] || null ]);
            }
          }
        }
      }
      if (this.settings.tokens.sortOption == "punkidasc") {
        results.sort((a, b) => {
          return a[0] - b[0];
        });
      } else if (this.settings.tokens.sortOption == "punkiddsc") {
        results.sort((a, b) => {
          return b[0] - a[0];
        });
      }
      // console.log(now() + " Token - computed.filteredTokens - results: " + JSON.stringify(results, null, 2));
      return results;
    },
    filteredTokensPaged() {
      const results = this.filteredTokens.slice((this.settings.tokens.currentPage - 1) * this.settings.tokens.itemsPerPage, this.settings.tokens.currentPage * this.settings.tokens.itemsPerPage);
      // console.log(now() + " Token - computed.filteredTokensPaged - results: " + JSON.stringify(results, null, 2));
      return results;
    },
    totalOwners() {
      const collator = {};
      for (const [punkId, owner] of this.owners.entries()) {
        if (!(owner in collator)) {
          collator[owner] = true;
        }
      }
      return Object.keys(collator).length;
    },
    filteredOwnersList() {
      const collator = {};
      for (const item of this.filteredTokens) {
        if (!(item[2] in collator)) {
          collator[item[2]] = [];
        }
        collator[item[2]].push(item[0]);
      }
      // console.log(now() + " Token - computed.filteredOwnersList - collator: " + JSON.stringify(collator, null, 2));
      const results = [];
      for (const [owner, punkIds] of Object.entries(collator)) {
        results.push({ owner, punkIds, count: punkIds.length });
      }
      if (this.settings.owners.sortOption == "ownercountasc") {
        results.sort((a, b) => {
          if (a.count == b.count) {
            return a.owner - b.owner;
          } else {
            return a.count - b.count;
          }
        });
      } else if (this.settings.owners.sortOption == "ownercountdsc") {
        results.sort((a, b) => {
          if (a.count == b.count) {
            return a.owner - b.owner;
          } else {
            return b.count - a.count;
          }
        });
      }
      // console.log(now() + " Token - computed.filteredOwnersList - results: " + JSON.stringify(results, null, 2));
      return results;
    },
  },
  methods: {
    syncPunks() {
      console.log(now() + " Punks - methods.syncPunks - this.inputPunkId: " + this.inputPunkId);
      store.dispatch('punks/syncPunks', true);
    },
    syncPunksEvents() {
      console.log(now() + " Punks - methods.syncPunksEvents");
      store.dispatch('punks/syncPunksEvents', true);
    },
    setSyncHalt() {
      console.log(now() + " Punks - methods.setSyncHalt");
      store.dispatch('punks/setSyncHalt');
    },
    filterUpdated(filter) {
      console.log(now() + " Punks - methods.filterUpdated - filter: " + filter);
      clearTimeout(this._timerId);
      this._timerId = setTimeout(async () => {
        this.filterUpdatedDebounced(filter);
      }, 1000);
    },
    filterUpdatedDebounced(filter) {
      console.log(now() + " Punks - methods.filterUpdatedDebounced - filter: " + filter);
      this.settings.tokens.filter = filter;
      this.saveSettings();
    },
    updateAttributes(event) {
      console.log(now() + " Punks - methods.updateAttributes - event: " + JSON.stringify(event));
      if (event.value) {
        if (!(event.attribute in this.settings.attributes)) {
          this.settings.attributes[event.attribute] = {};
        }
        if (!(event.option in this.settings.attributes[event.attribute])) {
          this.settings.attributes[event.attribute][event.option] = event.value;
        }
      } else {
        if (this.settings.attributes[event.attribute][event.option]) {
          delete this.settings.attributes[event.attribute][event.option];
        }
        if (Object.keys(this.settings.attributes[event.attribute]).length == 0) {
          delete this.settings.attributes[event.attribute];
        }
      }
      this.saveSettings();
    },

    formatETH(e) {
      if (e) {
        return ethers.utils.formatEther(e).replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
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
      // console.log(now() + " Punks - methods.saveSettings - settings: " + JSON.stringify(this.settings, null, 2));
      if (this.initialised) {
        localStorage.explorerPunksSettings = JSON.stringify(this.settings);
      }
    },
    // copyToClipboard(str) {
    //   navigator.clipboard.writeText(str);
    // },
  },
  beforeCreate() {
    console.log(now() + " Punks - beforeCreate");
	},
  mounted() {
    console.log(now() + " Punks - mounted - this.inputPunkId: " + this.inputPunkId);

    if ('explorerPunksSettings' in localStorage) {
      const tempSettings = JSON.parse(localStorage.explorerPunksSettings);
      if ('version' in tempSettings && tempSettings.version == this.settings.version) {
        this.settings = tempSettings;
      }
    }
    this.initialised = true;
    console.log(now() + " Punks - mounted - this.settings: " + JSON.stringify(this.settings));

    const t = this;
    setTimeout(function() {
      store.dispatch('punks/startup');
    }, 100);
	},
  unmounted() {
    console.log(now() + " Punks - unmounted");
	},
  destroyed() {
    console.log(now() + " Punks - destroyed");
	},
};
