const Portfolio = {
  template: `
    <div>
      <v-container fluid class="pa-1">
        <v-toolbar density="compact" class="mt-1">
          <v-card-item prepend-icon="mdi-bank" title="Portfolio"></v-card-item>
          <!-- <render-address v-if="address" :address="address"></render-address> -->
          <!-- <p class="ml-5 text-caption text--disabled">
            {{ type && type.substring(0, 3) == "erc" && type.replace(/erc/, "ERC-") || "Not a token contract" }} {{ symbol }} {{ name && ("'" + name + "'") || "" }} {{ decimals }}
          </p> -->
          <!-- <v-spacer></v-spacer> -->

          <!-- <v-combobox v-model="settings.selectedTagOrAddress" @update:model-value="search();" :items="samples" item-title="title" item-value="value" hide-details single-line density="compact" variant="underlined" style="width: 330px;" placeholder="block #, tx hash, address or name[.eth]"> -->

          <v-combobox v-model="settings.selectedTagOrAddress" @update:model-value="loadPortfolio();" :items="tagOrAddressOptions" item-title="title" item-subtitle="subtitle" item-value="value" hide-details single-line density="compact" variant="underlined" style="max-width: 420px;" placeholder="address or tag">
            <template v-slot:prepend-item>
              <v-tabs v-model="settings.selectTagOrAddress" align-tabs="end" size="default" color="deep-purple-accent-4" class="m-0 p-0">
                <v-tab prepend-icon="mdi-numeric" value="addresses" class="lowercase-btn">Addresses</v-tab>
                <v-tab prepend-icon="mdi-tag" value="tags" class="lowercase-btn">Tags</v-tab>
              </v-tabs>
            </template>
            <template v-slot:item="{ item, props }">
              <v-list-item v-bind="props">
                <v-list-item-subtitle>{{ item.raw.subtitle }}</v-list-item-subtitle>
              </v-list-item>
            </template>
          </v-combobox>

          <v-btn @click="showAddressBook();" color="primary" icon size="default" v-tooltip="'Show address book - cmd+b'">
            <v-icon>mdi-book-open-variant-outline</v-icon>
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn v-if="sync.info == null" @click="syncPortfolio();" color="primary" icon v-tooltip="'Sync Portfolio'">
            <v-icon>mdi-refresh</v-icon>
          </v-btn>
          <v-btn v-if="sync.info != null" @click="setSyncHalt();" color="primary" icon v-tooltip="'Halt syncing'">
            <v-icon>mdi-stop</v-icon>
          </v-btn>
          <v-progress-circular v-if="sync.info != null" color="primary" :model-value="sync.total ? (parseInt(sync.completed * 100 / sync.total)) : 0" :size="30" :width="6" v-tooltip="sync.info + ': Part ' + commify0(sync.completed) + ' of ' + commify0(sync.total)"></v-progress-circular>
          <v-spacer></v-spacer>
          <v-tabs v-model="settings.tab" @update:modelValue="saveSettings();" right color="deep-purple-accent-4">
            <v-tab prepend-icon="mdi-sigma" text="Collections" value="collections" class="lowercase-btn"></v-tab>
            <v-tab prepend-icon="mdi-text-long" text="Items" value="items" class="lowercase-btn"></v-tab>
            <!-- <v-tab prepend-icon="mdi-cash-multiple" text="Fungibles" value="fungibles" class="lowercase-btn"></v-tab> -->
            <!-- <v-tab prepend-icon="mdi-cards-playing-heart-multiple-outline" text="Non-Fungibles" value="nonfungibles" class="lowercase-btn"></v-tab> -->
            <!-- <v-tab prepend-icon="mdi-alphabetical" text="Names" value="names" class="lowercase-btn"></v-tab> -->
            <v-tab prepend-icon="mdi-check-outline" text="Approvals" value="approvals" class="lowercase-btn"></v-tab>
            <v-tab prepend-icon="mdi-math-log" text="Activity" value="activity" class="lowercase-btn"></v-tab>
            <!-- <v-tab prepend-icon="mdi-cog" text="Config" value="config" class="lowercase-btn"></v-tab> -->
          </v-tabs>
        </v-toolbar>

        <v-alert
          v-if="Object.keys(addressBook).length < 1"
          closable
          title="Info"
          text="Click on the address book icon to set up your addresses, or paste in your address."
          type="info"
          color="info"
          class="mx-0 my-1"
        >
        </v-alert>
        <!-- icon="mdi-alert-circle-outline" -->

        <v-toolbar flat color="transparent" density="compact">
          <v-btn icon @click="settings.showFilter = !settings.showFilter; saveSettings();" color="primary" class="lowercase-btn" v-tooltip="'Filters'">
            <v-icon :icon="settings.showFilter ? 'mdi-filter' : 'mdi-filter-outline'"></v-icon>
          </v-btn>
          <v-spacer></v-spacer>
          <v-spacer></v-spacer>
          <v-spacer></v-spacer>
          <p v-if="settings.tab == 'collections'" class="mr-1 text-caption text--disabled">
            {{ commify0(filteredSortedCollections.length) + '/' + commify0(collections.length) }}
          </p>
          <p v-if="settings.tab == 'items'" class="mr-1 text-caption text--disabled">
            {{ commify0(filteredSortedItems.length) + '/' + commify0(items.length) }}
          </p>
          <v-btn-toggle v-if="settings.tab == 'items'" v-model="settings.items.view" variant="plain" class="mr-3" @update:modelValue="saveSettings();" density="compact">
            <v-btn icon disabled value="large">
              <v-icon color="primary">mdi-grid-large</v-icon>
            </v-btn>
            <v-btn icon disabled value="medium">
              <v-icon color="primary">mdi-grid</v-icon>
            </v-btn>
            <v-btn icon value="list">
              <v-icon color="primary">mdi-format-list-bulleted-square</v-icon>
            </v-btn>
          </v-btn-toggle>
          <v-pagination
            v-if="settings.tab == 'collections'"
            v-model="settings.collections.currentPage"
            :length="Math.ceil(filteredSortedCollections.length / settings.collections.itemsPerPage)"
            total-visible="0"
            density="comfortable"
            show-first-last-page
            class="mr-1"
            @update:modelValue="saveSettings();"
            color="primary"
          ></v-pagination>
          <v-pagination
            v-if="settings.tab == 'items'"
            v-model="settings.items.currentPage"
            :length="Math.ceil(filteredSortedItems.length / settings.items.itemsPerPage)"
            total-visible="0"
            density="comfortable"
            show-first-last-page
            class="mr-1"
            @update:modelValue="saveSettings();"
            color="primary"
          ></v-pagination>
        </v-toolbar>

        <v-row dense>
          <v-col v-if="settings.showFilter" cols="2">
            <v-card>
              <v-expansion-panels v-model="settings.assetTypeFilter.visible" @update:modelValue="saveSettings();" multiple flat>
                <v-expansion-panel class="ma-0 pa-0">
                  <v-expansion-panel-title>
                    Addresses
                  </v-expansion-panel-title>
                  <v-expansion-panel-text class="ma-0 pa-0">
                    <v-list-item v-for="(addressData, address) of portfolioAddresses" density="compact" class="ma-0 pa-1">
                      <v-checkbox-btn :model-value="settings.addressFilter[address]" @update:modelValue="updateAddressFilter(address, $event);" :label="address.substring(0, 8) + '...' + address.slice(-6)" class="ma-0 pa-0" v-tooltip="address"></v-checkbox-btn>
                    </v-list-item>
                  </v-expansion-panel-text>
                </v-expansion-panel>
                <v-expansion-panel class="ma-0 pa-0">
                  <v-expansion-panel-title>
                    Asset Type
                  </v-expansion-panel-title>
                  <v-expansion-panel-text class="ma-0 pa-0">
                    <v-list-item append-icon="mdi-ethereum" density="compact" class="ma-0 pa-1">
                      <v-checkbox-btn v-model="settings.assetTypeFilter.eth" @update:modelValue="saveSettings();" label="ETH" class="ma-0 pa-0"></v-checkbox-btn>
                    </v-list-item>
                    <v-list-item append-icon="mdi-cash-multiple" density="compact" class="ma-0 pa-1">
                      <v-checkbox-btn v-model="settings.assetTypeFilter.fungibles" @update:modelValue="saveSettings();" label="Fungibles" class="ma-0 pa-0" v-tooltip="'ERC-20'"></v-checkbox-btn>
                    </v-list-item>
                    <v-list-item append-icon="mdi-cards-playing-heart-multiple-outline" density="compact" class="ma-0 pa-1">
                      <v-checkbox-btn v-model="settings.assetTypeFilter.nonFungibles" @update:modelValue="saveSettings();" label="Non-Fungibles" class="ma-0 pa-0" v-tooltip="'ERC-721 & ERC-1155 excluding ENS Names'"></v-checkbox-btn>
                    </v-list-item>
                    <v-list-item append-icon="mdi-alphabetical" density="compact" class="ma-0 pa-1">
                      <v-checkbox-btn v-model="settings.assetTypeFilter.names" @update:modelValue="saveSettings();" label="ENS Names" class="ma-0 pa-0" v-tooltip="'ERC-721 & ERC-1155 ENS Names'"></v-checkbox-btn>
                    </v-list-item>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-card>
          </v-col>
          <v-col :cols="settings.showFilter ? 10 : 12" align="left">
            <v-card>
              <v-card-text class="ma-0 pa-2">
                <v-tabs-window v-model="settings.tab">
                  <v-tabs-window-item value="collections">
                    <v-data-table
                      :items="filteredSortedCollections"
                      :headers="collectionsHeaders"
                      v-model:items-per-page="settings.collections.itemsPerPage"
                      :page="settings.collections.currentPage"
                      @update:options="saveSettings();"
                      density="comfortable"
                      hide-default-footer
                    >
                      <template v-slot:item.rowNumber="{ index }">
                        {{ commify0((settings.collections.currentPage - 1) * settings.collections.itemsPerPage + index + 1) }}
                      </template>
                      <template v-slot:item.address="{ item }">
                        <portfolio-render-address :address="item.address" noXPadding></portfolio-render-address>
                      </template>
                      <template v-slot:item.collection="{ item }">
                        <portfolio-render-collection :type="item.type" :contract="item.contract" :address="item.address" noXPadding></portfolio-render-collection>
                      </template>
                      <template v-slot:item.balance="{ item }">
                        <portfolio-render-balance :type="item.type" :contract="item.contract" :address="item.address" :balance="item.balance" :tokenData="item.tokenData" noXPadding></portfolio-render-balance>
                        {{ item }}
                      </template>
                    </v-data-table>
                    <!-- portfolioMetadata: {{ portfolioMetadata }} -->
                  </v-tabs-window-item>
                  <v-tabs-window-item value="items">
                    <!-- items: {{ items }}<br /> -->
                    <!-- v-if="settings.tokens.view == 'list'" -->
                    <!-- v-model:sort-by="settings.items.sortBy" -->
                    <v-data-table
                      :items="pagedFilteredSortedItems"
                      :headers="itemsHeaders"
                      v-model:items-per-page="settings.items.itemsPerPage"
                      :page="settings.items.currentPage"
                      @update:options="saveSettings();"
                      density="comfortable"
                      hide-default-footer
                    >
                      <template v-slot:item.rowNumber="{ index }">
                        {{ commify0((settings.items.currentPage - 1) * settings.items.itemsPerPage + index + 1) }}
                      </template>
                      <template v-slot:item.address="{ item }">
                        <portfolio-render-address :address="item.address" noXPadding></portfolio-render-address>
                      </template>
                      <template v-slot:item.collection="{ item }">
                        <portfolio-render-collection :type="item.type" :contract="item.contract" :address="item.address" noXPadding></portfolio-render-collection>
                      </template>
                      <template v-slot:item.token="{ item }">
                        {{ item }}
                      </template>
                      <!-- <template v-slot:item.punkId="{ item }">
                        {{ commify0(item[0]) }}
                      </template> -->
                      <!-- <template v-slot:item.image="{ item }">
                        <v-img :src="'data:image/png;base64,' + images[item[0]]" width="60" class="ma-2 pa-0" style="image-rendering: pixelated; background-color: #638596;">
                        </v-img>
                      </template> -->
                      <!-- <template v-slot:item.owner="{ item }">
                        <render-address :address="item[2]" :addresses="addresses" shortAddress noXPadding></render-address>
                      </template> -->
                      <!-- <template v-slot:item.attributes="{ item }">
                        <v-chip v-for="attribute of item[1]" size="x-small" variant="tonal" color="secondary" class="ma-2">
                          {{ attribute[0] + ": " + attribute[1] }}
                        </v-chip>
                      </template> -->
                      <!-- <template v-slot:item.attributeCount="{ item }">
                        {{ item[1].length }}
                      </template> -->
                      <!-- <template v-slot:item.bid="{ item }">
                        <span v-if="item[3]">
                          {{ formatETH(item[3][0]) }}
                        </span>
                      </template> -->
                      <!-- <template v-slot:item.offer="{ item }">
                        <span v-if="item[4]">
                          {{ formatETH(item[4][0]) }}
                        </span>
                      </template> -->
                      <!-- <template v-slot:item.last="{ item }">
                        <span v-if="item[5]">
                          {{ formatETH(item[5]) }}
                        </span>
                      </template> -->
                    </v-data-table>

                    <!-- <pre>
assets: {{ assets }}
                      <br />
pagedFilteredSortedAssets: {{ pagedFilteredSortedAssets }}
                      <br />
filteredSortedAssets: {{ filteredSortedAssets }}
                      <br />
portfolioData: {{ portfolioData }}
                    </pre> -->
                  </v-tabs-window-item>
                  <!-- <v-tabs-window-item value="fungibles">
                    TODO: ERC-20 Fungibles
                  </v-tabs-window-item> -->
                  <!-- <v-tabs-window-item value="nonfungibles">
                    TODO: ERC-721 and ERC-1155 Non-Fungibles
                  </v-tabs-window-item> -->
                  <!-- <v-tabs-window-item value="names">
                    TODO: ENS Names, with expiry information
                  </v-tabs-window-item> -->
                  <v-tabs-window-item value="approvals">
                    TODO: ERC-20, ERC-721 and ERC-1155 Approvals
                  </v-tabs-window-item>
                  <v-tabs-window-item value="activity">
                    TODO: Activity
                  </v-tabs-window-item>
                </v-tabs-window>
              </v-card-text>
              <v-toolbar flat color="transparent" density="compact">
                <v-spacer></v-spacer>
                <v-select
                  v-if="settings.tab == 'collections'"
                  v-model="settings.collections.itemsPerPage"
                  :items="itemsPerPageOptions"
                  variant="plain"
                  density="compact"
                  class="mt-2 mr-2"
                  style="max-width: 70px;"
                  @update:modelValue="saveSettings();"
                ></v-select>
                <v-select
                  v-if="settings.tab == 'items'"
                  v-model="settings.items.itemsPerPage"
                  :items="itemsPerPageOptions"
                  variant="plain"
                  density="compact"
                  class="mt-2 mr-2"
                  style="max-width: 70px;"
                  @update:modelValue="saveSettings();"
                ></v-select>
                <v-pagination
                  v-if="settings.tab == 'collections'"
                  v-model="settings.collections.currentPage"
                  :length="Math.ceil(filteredSortedCollections.length / settings.collections.itemsPerPage)"
                  total-visible="0"
                  density="comfortable"
                  show-first-last-page
                  class="mr-1"
                  @update:modelValue="saveSettings();"
                  color="primary"
                ></v-pagination>
                <v-pagination
                  v-if="settings.tab == 'items'"
                  v-model="settings.items.currentPage"
                  :length="Math.ceil(filteredSortedItems.length / settings.items.itemsPerPage)"
                  total-visible="0"
                  density="comfortable"
                  show-first-last-page
                  class="mr-1"
                  @update:modelValue="saveSettings();"
                  color="primary"
                ></v-pagination>
              </v-toolbar>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </div>
  `,
  props: ['inputTagOrAddress'],
  data: function () {
    return {
      initialised: false,
      settings: {
        selectTagOrAddress: "addresses",
        selectedTagOrAddress: null,
        selectedPortfolio: null, // TODO: Delete
        tab: "collections",
        showFilter: false,
        addressFilter: {},
        assetTypeFilter: {
          visible: false,
          eth: true,
          fungibles: true,
          nonFungibles: true,
          names: true,
        },
        collections: {
          filter: null,
          view: "large",
          sortOption: "typenameasc",
          itemsPerPage: 10,
          currentPage: 1,
        },
        items: {
          filter: null,
          view: "large",
          sortOption: "typenameasc",
          itemsPerPage: 10,
          currentPage: 1,
        },
        version: 7,
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
      collectionsHeaders: [
        { title: '#', value: 'rowNumber', width: '10%', align: 'end', sortable: false },
        { title: 'Address', value: 'address', width: '20%', sortable: false }, // TODO: Sortable: true after deleting from index worked out
        { title: 'Collection', value: 'collection', width: '40%', sortable: false }, // TODO: Sortable: true after deleting from index worked out
        { title: 'Balance', value: 'balance', width: '30%', sortable: false }, // TODO: Sortable: true after deleting from index worked out
      ],
      itemsHeaders: [
        { title: '#', value: 'rowNumber', width: '10%', align: 'end', sortable: false },
        { title: 'Address', value: 'address', width: '20%', sortable: false }, // TODO: Sortable: true after deleting from index worked out
        { title: 'Collection', value: 'collection', width: '40%', sortable: false }, // TODO: Sortable: true after deleting from index worked out
        { title: 'Token', value: 'token', width: '30%', sortable: false }, // TODO: Sortable: true after deleting from index worked out
      ],
    };
  },
  computed: {
    chainId() {
      return store.getters['chainId'];
    },
    addressBook() {
      return store.getters['addressBook/addresses'];
    },
    tags() {
      return store.getters['addressBook/tags'];
    },
    tagOrAddressOptions() {
      const results = [];
      if (this.settings.selectTagOrAddress == "addresses") {
        for (const [address, addressData] of Object.entries(this.addressBook)) {
          const subtitle = addressData.name + " [ " + addressData.tags.join(", ") + " ]";
          results.push({ title: address, value: address, subtitle, tags: addressData.tags });
        }
        results.sort((a, b) => {
          return ('' + a.value).localeCompare(b.value);
        });
      } else {
        for (const [tag, addresses] of Object.entries(this.tags)) {
          const sortedAddresses = addresses;
          sortedAddresses.sort((a, b) => {
            return ('' + a.address).localeCompare(b.address);
          });
          const subtitle = sortedAddresses.map(e => e.address.substring(0, 6) + "..." + e.address.slice(-4)).join(", ");
          results.push({ title: tag, value: tag, subtitle });
        }
        results.sort((a, b) => {
          return ('' + a.value).localeCompare(b.value);
        });
      }
      return results;
    },
    portfolioInputTagOrAddress() {
      return store.getters['portfolio/inputTagOrAddress'];
    },
    portfolioAddresses() {
      return store.getters['portfolio/addresses'];
    },
    portfolioData() {
      return store.getters['portfolio/data'];
    },
    portfolioMetadata() {
      return store.getters['portfolio/metadata'];
    },

    collections() {
      const results = [];
      // console.log(now() + " Portfolio - computed.collections - portfolioData: " + JSON.stringify(this.portfolioData, null, 2));
      for (const [address, addressData] of Object.entries(this.portfolioData)) {
        for (const [chainId, chainData] of Object.entries(addressData)) {
          results.push({ type: 0, address, chainId: parseInt(chainId), contract: null, contractType: "eth", name: "ETH", balance: chainData.balance, decimals: 18, transactionCount: chainData.transactionCount, blockNumber: chainData.blockNumber, timestamp: chainData.timestamp });
          for (const [token, balance] of Object.entries(chainData.tokenBalances || {})) {
            const metadata = this.portfolioMetadata[chainId] && this.portfolioMetadata[chainId][token] || {};
            results.push({ type: 1, address, chainId: parseInt(chainId), contract: token, contractType: metadata.type, symbol: metadata.symbol, name: metadata.name, balance, decimals: metadata.decimals });
          }
          for (const [token, tokenData] of Object.entries(chainData.tokens || {})) {
            const type = (token == ENS_BASEREGISTRARIMPLEMENTATION_ADDRESS || token == ENS_NAMEWRAPPER_ADDRESS) ? 3 : 2;
            const metadata = this.portfolioMetadata[chainId] && this.portfolioMetadata[chainId][token] || {};
            // console.log(now() + " Portfolio - computed.collections - metadata: " + JSON.stringify(metadata, null, 2));
            const newTokenData = {};
            for (const [tokenId, count] of Object.entries(tokenData)) {
              const tokens = count === true ? null : count;
              const tokenMetadata = metadata && metadata.tokens && metadata.tokens[tokenId] || {};
              // console.error(now() + " Portfolio - computed.collections - tokenMetadata: " + JSON.stringify(tokenMetadata, null, 2));
              newTokenData[tokenId] = { tokens, name: tokenMetadata.name, description: tokenMetadata.description };
            }
            results.push({ type, address, chainId: parseInt(chainId), contract: token, contractType: metadata.type, name: addressData.name, collectionName: metadata.collectionName, tokenData: newTokenData });
          }
        }
      }
      // console.error(now() + " Portfolio - computed.collections - results: " + JSON.stringify(results, null, 2));
      return results;
    },
    filteredSortedCollections() {
      const results = [];
      // console.log(now() + " Portfolio - computed.filteredSortedCollections - assets: " + JSON.stringify(this.assets, null, 2));
      const activeAddressFilter = {};
      for (const [address, addressInfo] of Object.entries(this.portfolioAddresses)) {
        if (this.settings.addressFilter[address]) {
          activeAddressFilter[address] = true;
        }
      }
      const filterByAddress = Object.keys(activeAddressFilter).length > 0;

      const filterByType = this.settings.assetTypeFilter.eth != this.settings.assetTypeFilter.fungibles ||
        this.settings.assetTypeFilter.eth != this.settings.assetTypeFilter.nonFungibles ||
        this.settings.assetTypeFilter.eth != this.settings.assetTypeFilter.names;
      for (const collection of this.collections) {
        // console.error(now() + " Portfolio - computed.filteredSortedCollections - collection: " + JSON.stringify(collection, null, 2));
        let include = false;
        if (filterByType) {
          if ((collection.type == 0 && this.settings.assetTypeFilter.eth) ||
            (collection.type == 1 && this.settings.assetTypeFilter.fungibles) ||
            (collection.type == 2 && this.settings.assetTypeFilter.nonFungibles) ||
            (collection.type == 3 && this.settings.assetTypeFilter.names)) {
              include = true;
          }
        } else {
          include = true;
        }
        if (include && filterByAddress) {
          if (!(collection.address in activeAddressFilter)) {
            include = false;
          }
        }
        if (include) {
          results.push(collection);
        }
      }
      // TODO: Sort
      return results;
    },
    pagedFilteredSortedCollections() {
      const results = this.filteredSortedCollections.slice((this.settings.collections.currentPage - 1) * this.settings.collections.itemsPerPage, this.settings.collections.currentPage * this.settings.collections.itemsPerPage);
      console.log(now() + " Portfolio - computed.pagedFilteredSortedCollections - results: " + JSON.stringify(results, null, 2));
      return results;
    },


    items() {
      const results = [];
      for (const collection of this.collections) {
        if (collection.type == 2 || collection.type == 3) {
          // console.log(now() + " Portfolio - computed.collections - portfolioMetadata[chainId][contract]: " + JSON.stringify(this.portfolioMetadata[collection.chainId][collection.contract], null, 2));
          for (const [tokenId, tokenInfo] of Object.entries(collection.tokenData)) {
            const metadata = this.portfolioMetadata[collection.chainId] && this.portfolioMetadata[collection.chainId][collection.contract] && this.portfolioMetadata[collection.chainId][collection.contract].tokens[tokenId] || {};
            results.push({
              type: collection.type,
              address: collection.address,
              chainId: collection.chainId,
              contract: collection.contract,
              contractType: collection.contractType,
              collectionName: collection.collectionName,
              collectionImage: collection.collectionImage,
              collectionSlug: collection.collectionSlug,
              tokenId,
              tokens: tokenInfo.tokens,
              name: tokenInfo.name,
              description: tokenInfo.description,
            });
          }
        } else {
          results.push(collection);
        }
      }
      return results;
    },
    filteredSortedItems() {
      const results = [];
      // console.log(now() + " Portfolio - computed.filteredSortedItems - assets: " + JSON.stringify(this.assets, null, 2));
      const activeAddressFilter = {};
      for (const [address, addressInfo] of Object.entries(this.portfolioAddresses)) {
        if (this.settings.addressFilter[address]) {
          activeAddressFilter[address] = true;
        }
      }
      const filterByAddress = Object.keys(activeAddressFilter).length > 0;

      for (const item of this.items) {
        // console.error(now() + " Portfolio - computed.filteredSortedItems - item: " + JSON.stringify(item, null, 2));
        let include = false;
        if ((item.type == 0 && this.settings.assetTypeFilter.eth) ||
          (item.type == 1 && this.settings.assetTypeFilter.fungibles) ||
          (item.type == 2 && this.settings.assetTypeFilter.nonFungibles) ||
          (item.type == 3 && this.settings.assetTypeFilter.names)) {
            include = true;
        }
        if (include && filterByAddress) {
          if (!(item.address in activeAddressFilter)) {
            include = false;
          }
        }
        if (include) {
          results.push(item);
        }
      }
      // TODO: Sort
      return results;
    },
    pagedFilteredSortedItems() {
      const results = this.filteredSortedItems.slice((this.settings.items.currentPage - 1) * this.settings.items.itemsPerPage, this.settings.items.currentPage * this.settings.items.itemsPerPage);
      // console.log(now() + " Portfolio - computed.pagedFilteredSortedItems - results: " + JSON.stringify(results, null, 2));
      return results;
    },

    // assets() {
    //   const results = [];
    //   // console.log(now() + " Portfolio - computed.assets - portfolioData: " + JSON.stringify(this.portfolioData, null, 2));
    //   for (const [address, addressData] of Object.entries(this.portfolioData)) {
    //     for (const [chain, chainData] of Object.entries(addressData)) {
    //       // console.error(address + "/" + chain + " => " + JSON.stringify(chainData));
    //       results.push({ type: 0, address, chain, contract: null, contractType: null, name: "ETH", balance: chainData.balance, decimals: 18, transactionCount: chainData.transactionCount });
    //       for (const [token, balance] of Object.entries(chainData.tokenBalances || {})) {
    //         // console.error(address + "/" + chain + "/" + token + " => " + balance);
    //         results.push({ type: 1, address, chain, contract: token, contractType: "erc20", name: "{ERC-20 name}", balance, decimals: 18 });
    //       }
    //       // console.error(address + "/" + chain + " => " + JSON.stringify(chainData.tokens));
    //       for (const [token, tokenData] of Object.entries(chainData.tokens || {})) {
    //         const type = (token == ENS_BASEREGISTRARIMPLEMENTATION_ADDRESS || token == ENS_NAMEWRAPPER_ADDRESS) ? 3 : 2;
    //         // console.log(address + "/" + chain + "/" + token + " => " + JSON.stringify(tokenData, null, 2));
    //         // if (this.settings.items.expandCollections) {
    //         if (false) {
    //           for (const [tokenId, count] of Object.entries(tokenData)) {
    //             const tokens = count === true ? null : count;
    //             results.push({ type, address, chain, contract: token, contractType: "erc721/1155", name: "{ERC-721/1155 name}", tokenId, tokens });
    //           }
    //         } else {
    //           results.push({ type, address, chain, contract: token, contractType: "erc721/1155", name: "{ERC-721/1155 name}", tokenData });
    //         }
    //       }
    //     }
    //   }
    //   return results;
    // },
    // filteredSortedAssets() {
    //   const results = [];
    //   // console.log(now() + " Portfolio - computed.filteredSortedAssets - assets: " + JSON.stringify(this.assets, null, 2));
    //   const activeAddressFilter = {};
    //   for (const [address, addressInfo] of Object.entries(this.portfolioAddresses)) {
    //     if (this.settings.addressFilter[address]) {
    //       activeAddressFilter[address] = true;
    //     }
    //   }
    //   const filterByAddress = Object.keys(activeAddressFilter).length > 0;
    //
    //   for (const asset of this.assets) {
    //     // console.error(now() + " Portfolio - computed.filteredSortedAssets - asset: " + JSON.stringify(asset, null, 2));
    //     let include = false;
    //     if ((asset.type == 0 && this.settings.assetTypeFilter.eth) ||
    //       (asset.type == 1 && this.settings.assetTypeFilter.fungibles) ||
    //       (asset.type == 2 && this.settings.assetTypeFilter.nonFungibles) ||
    //       (asset.type == 3 && this.settings.assetTypeFilter.names)) {
    //         include = true;
    //     }
    //     if (include && filterByAddress) {
    //       if (!(asset.address in activeAddressFilter)) {
    //         include = false;
    //       }
    //     }
    //     if (include) {
    //       results.push(asset);
    //     }
    //   }
    //   // TODO: Sort
    //   return results;
    // },
    // pagedFilteredSortedAssets() {
    //   const results = this.filteredSortedAssets.slice((this.settings.items.currentPage - 1) * this.settings.items.itemsPerPage, this.settings.items.currentPage * this.settings.items.itemsPerPage);
    //   // console.log(now() + " Portfolio - computed.pagedFilteredSortedAssets - results: " + JSON.stringify(results, null, 2));
    //   return results;
    // },
    sync() {
      return store.getters['portfolio/sync'];
    },
    explorer() {
      return store.getters['web3/explorer'];
    },
  },
  methods: {
    async loadPortfolio() {
      console.log(now() + " Portfolio - methods.loadPortfolio - settings: " + JSON.stringify(this.settings));
      clearTimeout(this._timerId);
      this._timerId = setTimeout(async () => {
        await this.loadPortfolioDebounced();
      }, 500);
    },
    async loadPortfolioDebounced() {
      console.log(now() + " Portfolio - methods.loadPortfolioDebounced - settings: " + JSON.stringify(this.settings));
      this.$router.push({ name: 'Portfolio', params: { inputTagOrAddress: (this.settings.selectedTagOrAddress && this.settings.selectedTagOrAddress.value) || this.settings.selectedTagOrAddress } });
      store.dispatch('portfolio/loadPortfolio', { inputTagOrAddress: (this.settings.selectedTagOrAddress && this.settings.selectedTagOrAddress.value) || this.settings.selectedTagOrAddress, forceUpdate: true });
      this.saveSettings();
    },
    syncPortfolio() {
      console.log(now() + " Portfolio - methods.syncPortfolio");
      store.dispatch('portfolio/syncPortfolio', { forceUpdate: true });
    },
    showAddressBook() {
      console.log(now() + " Portfolio - methods.showAddressBook");
      store.dispatch('addressBook/setShow', true);
    },

    // syncTokenEvents() {
    //   console.log(now() + " Portfolio - methods.syncTokenEvents - address: " + this.address);
    //   store.dispatch('token/syncTokenEvents', { inputAddress: this.address, forceUpdate: true });
    // },
    // syncTokenMetadata() {
    //   console.log(now() + " Portfolio - methods.syncTokenMetadata - address: " + this.address);
    //   store.dispatch('token/syncTokenMetadata', this.address);
    // },

    setSyncHalt() {
      console.log(now() + " Portfolio - methods.setSyncHalt");
      store.dispatch('portfolio/setSyncHalt');
    },

    updateAddressFilter(address, value) {
      console.log(now() + " Portfolio - methods.updateAddressFilter - address: " + address + ", value: " + value);
      if (value) {
        this.settings.addressFilter[address] = true;
      } else {
        if (this.settings.addressFilter[address]) {
          delete this.settings.addressFilter[address];
        }
      }
      this.saveSettings();
    },

    // async loadEvents({ page, itemsPerPage, sortBy }) {
    //   const sort = !sortBy || sortBy.length == 0 || (sortBy[0].key == "blockNumber" && sortBy[0].order == "desc") ? "desc" : "asc";
    //   console.log(now() + " Portfolio - methods.loadEvents - page: " + page + ", itemsPerPage: " + itemsPerPage + ", sortBy: " + JSON.stringify(sortBy) + ", sort: " + sort);
    //   const dbInfo = store.getters["db"];
    //   const db = new Dexie(dbInfo.name);
    //   db.version(dbInfo.version).stores(dbInfo.schemaDefinition);
    //   const address = store.getters["token/address"];
    //   console.log(now() + " Portfolio - methods.loadEvents - address: " + address);
    //   if (address) {
    //     const chainId = store.getters["web3/chainId"];
    //     const row = (page - 1) * itemsPerPage;
    //     let data;
    //     if (sort == "asc") {
    //       data = await db.tokenEvents.where('[chainId+address+blockNumber+logIndex]').between([chainId, address, Dexie.minKey, Dexie.minKey],[chainId, address, Dexie.maxKey, Dexie.maxKey]).offset(row).limit(itemsPerPage).toArray();
    //     } else {
    //       data = await db.tokenEvents.where('[chainId+address+blockNumber+logIndex]').between([chainId, address, Dexie.minKey, Dexie.minKey],[chainId, address, Dexie.maxKey, Dexie.maxKey]).reverse().offset(row).limit(itemsPerPage).toArray();
    //     }
    //     this.eventItems = data;
    //   }
    //   db.close();
    // },

    // updateAttributes(event) {
    //   console.log(now() + " Portfolio - methods.updateAttributes - event: " + JSON.stringify(event));
    //   if (event.value) {
    //     if (!(event.address in this.settings.attributes)) {
    //       this.settings.attributes[event.address] = {};
    //     }
    //     if (!(event.attribute in this.settings.attributes[event.address])) {
    //       this.settings.attributes[event.address][event.attribute] = {};
    //     }
    //     if (!(event.option in this.settings.attributes[event.address][event.attribute])) {
    //       this.settings.attributes[event.address][event.attribute][event.option] = event.value;
    //     }
    //   } else {
    //     if (this.settings.attributes[event.address][event.attribute][event.option]) {
    //       delete this.settings.attributes[event.address][event.attribute][event.option];
    //     }
    //     if (Object.keys(this.settings.attributes[event.address][event.attribute]).length == 0) {
    //       delete this.settings.attributes[event.address][event.attribute];
    //     }
    //     if (Object.keys(this.settings.attributes[event.address]).length == 0) {
    //       delete this.settings.attributes[event.address];
    //     }
    //   }
    //   this.saveSettings();
    // },

    formatUnits(e, decimals) {
      if (e) {
        return ethers.utils.formatUnits(e, decimals).replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
      }
      return null;
    },
    formatTimestamp(ts) {
      if (ts != null) {
        return moment.unix(ts).format("YYYY-MM-DD HH:mm:ss");
      }
      return null;
    },
    commify0(n) {
      if (n != null) {
        return Number(n).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
      }
      return null;
    },
    commify2(n) {
      if (n != null) {
        return Number(n).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
      }
      return null;
    },
    saveSettings() {
      // console.log(now() + " Portfolio - methods.saveSettings - settings: " + JSON.stringify(this.settings, null, 2));
      if (this.initialised) {
        localStorage.explorerPortfolioSettings = JSON.stringify(this.settings);
      }
    },
    copyToClipboard(str) {
      navigator.clipboard.writeText(str);
    },
  },
  beforeCreate() {
    console.log(now() + " Portfolio - beforeCreate");
	},
  mounted() {
    console.log(now() + " Portfolio - mounted - inputTagOrAddress: " + this.inputTagOrAddress);

    if ('explorerPortfolioSettings' in localStorage) {
      const tempSettings = JSON.parse(localStorage.explorerPortfolioSettings);
      // console.log(now() + " Portfolio - mounted - tempSettings: " + JSON.stringify(tempSettings));
      if ('version' in tempSettings && tempSettings.version == this.settings.version) {
        this.settings = tempSettings;
      }
    }
    this.initialised = true;
    console.log(now() + " Portfolio - mounted - this.settings: " + JSON.stringify(this.settings));

    const t = this;
    setTimeout(function() {
      store.dispatch('portfolio/loadPortfolio', { inputTagOrAddress: t.inputTagOrAddress, forceUpdate: false });
    }, 100);
	},
  unmounted() {
    console.log(now() + " Portfolio - unmounted");
	},
  destroyed() {
    console.log(now() + " Portfolio - destroyed");
	},
};
