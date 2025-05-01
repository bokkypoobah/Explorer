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
          <v-spacer></v-spacer>
          <v-tabs v-model="settings.tab" @update:modelValue="saveSettings();" right color="deep-purple-accent-4">
            <v-tab prepend-icon="mdi-emoticon-cool-outline" text="Punks" value="punks" class="lowercase-btn"></v-tab>
            <v-tab prepend-icon="mdi-account-multiple-outline" text="Owners" value="owners" class="lowercase-btn"></v-tab>
            <v-tab prepend-icon="mdi-math-log" text="Events" value="events" class="lowercase-btn"></v-tab>
          </v-tabs>
        </v-toolbar>
        <v-tabs-window v-model="settings.tab">
          <v-tabs-window-item value="punks">
            <v-card>
              <v-card-text class="ma-0 pa-0">
                <v-toolbar flat color="transparent" density="compact">
                  <v-btn icon @click="settings.tokens.showFilter = !settings.tokens.showFilter; saveSettings();" color="primary" class="lowercase-btn" v-tooltip="'Attributes filter'">
                    <v-icon :icon="settings.tokens.showFilter ? 'mdi-filter' : 'mdi-filter-outline'"></v-icon>
                  </v-btn>
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
                    v-model="settings.tokens.sortOption"
                    :items="tokensSortOptions"
                    variant="plain"
                    density="compact"
                    class="mt-3 mr-3"
                    style="max-width: 200px;"
                    @update:modelValue="saveSettings();"
                  ></v-select>
                  <v-btn-toggle v-model="settings.tokens.view" variant="plain" class="mr-3" @update:modelValue="saveSettings();" density="compact">
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
                  <p class="mr-1 text-caption text--disabled">
                    {{ commify0(filteredTokens.length) + '/' + commify0(attributes.length) }}
                  </p>
                  <v-pagination
                    v-model="settings.tokens.currentPage"
                    :length="Math.ceil(filteredTokens.length / settings.tokens.itemsPerPage)"
                    total-visible="0"
                    density="comfortable"
                    show-first-last-page
                    class="mr-1"
                    @update:modelValue="saveSettings();"
                    color="primary"
                  >
                  <!-- :length="Math.ceil((parseInt(nftFilteredTokens.length)) / settings.tokens.itemsPerPage)" -->
                  </v-pagination>
                </v-toolbar>
                <v-row no-gutters dense>
                  <v-col v-if="settings.tokens.showFilter" cols="2">
                    <v-card>
                      <v-expansion-panels flat>
                        <v-expansion-panel v-for="attribute in attributesList" class="ma-0 pa-0">
                          <v-expansion-panel-title>
                            {{ attribute.attribute }}
                          </v-expansion-panel-title>
                          <v-expansion-panel-text class="ma-0 pa-0">
                            <div v-for="option in attribute.options" class="ma-0 pa-0">
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
                                    <small class="mt-0 text-high-emphasis opacity-60">{{ option.count }}</small>
                                  </v-list-item-action>
                                </template>
                              </v-list-item>
                            </div>
                          </v-expansion-panel-text>
                        </v-expansion-panel>
                      </v-expansion-panels>
                    </v-card>
                  </v-col>
                  <v-col :cols="settings.tokens.showFilter ? 10 : 12" align="left">
                    <pre>
filteredTokensPaged: {{ JSON.stringify(filteredTokensPaged, null, 2) }}
                    </pre>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-tabs-window-item>
          <v-tabs-window-item value="owners">
            <v-card>
              <v-card-text>
                TODO: Owners
              </v-card-text>
            </v-card>
          </v-tabs-window-item>
        </v-tabs-window>
        Punk #0
        <v-img :src="'data:image/png;base64,' + images[0]" width="400" style="image-rendering: pixelated;">
        </v-img>
        {{ attributes[0] }}
        <!-- <pre>
images: {{ JSON.stringify(images, null, 2).substring(0, 20000) }}
attributes: {{ JSON.stringify(attributes, null, 2).substring(0, 20000) }}
        </pre> -->
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
          showFilter: false,
          view: "large",
          sortOption: "punkidasc",
          itemsPerPage: 10,
          currentPage: 1,
        },
        owners: {
          showFilter: false,
          view: "large",
          sortOption: "punkidasc",
          itemsPerPage: 10,
          currentPage: 1,
        },
        attributes: {}, // address -> attribute -> option -> selected?
        version: 0,
      },
      tokensSortOptions: [
        { value: "punkidasc", title: "▲ Punk Id" },
        { value: "punkiddsc", title: "▼ Punk Id" },
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
    attributesMap() {
      const results = {};
      for (const [punkId, attributes] of this.attributes.entries()) {
        // console.log(punkId + " => " + JSON.stringify(attributes));
        for (const attributeRecord of attributes) {
          const [attribute, option] = attributeRecord;
          // console.log(punkId + " => " + attribute + " " + option);
          if (!(attribute in results)) {
            results[attribute] = {};
          }
          if (!(option in results[attribute])) {
            results[attribute][option] = [];
          }
          results[attribute][option].push(parseInt(punkId));
        }
      }
      // console.log("results: " + JSON.stringify(results, null, 2));
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
      // console.log("results: " + JSON.stringify(results, null, 2));
      return results;
    },
    filteredTokens() {
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
          results.push([ punkId, this.attributes[punkId] ]);
        }
      } else {
        for (const [punkId, attribute] of this.attributes.entries()) {
          results.push([ punkId, attribute ]);
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
      return results;
    },
    filteredTokensPaged() {
      const results = this.filteredTokens.slice((this.settings.tokens.currentPage - 1) * this.settings.tokens.itemsPerPage, this.settings.tokens.currentPage * this.settings.tokens.itemsPerPage);
      // console.log(now() + " Token - computed.filteredTokensPaged - results: " + JSON.stringify(results, null, 2));
      return results;
    },
    // address() {
    //   return store.getters['address/address'];
    // },
    // type() {
    //   return store.getters['address/info'].type || null;
    // },
    // version() {
    //   return store.getters['address/info'].version || null;
    // },
    // implementation() {
    //   return store.getters['address/info'].implementation || null;
    // },
    // explorer() {
    //   return store.getters['explorer'];
    // },
  },
  methods: {
    syncPunks() {
      console.log(now() + " Punks - methods.syncPunks - this.inputPunkId: " + this.inputPunkId);
      store.dispatch('punks/syncPunks', true);
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

    // syncAddress() {
    //   console.log(now() + " Punks - methods.syncAddress");
    //   const address = store.getters["address/address"];
    //   console.log(now() + " Punks - methods.syncAddress - address: " + address);
    //   store.dispatch('address/loadAddress', { inputAddress: address, forceUpdate: true });
    // },
    // copyToClipboard(str) {
    //   navigator.clipboard.writeText(str);
    // },
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
