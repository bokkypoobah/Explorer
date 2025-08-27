const AddressBook = {
  template: `
    <div>
      <v-dialog :model-value="show" persistent theme="system" max-width="900px">
        <v-card min-height="75vh">
          <v-toolbar density="compact">
            <v-card-item prepend-icon="mdi-book-open-variant-outline" title="Address Book"></v-card-item>
            <v-spacer></v-spacer>
            <v-tabs v-model="tab" right color="deep-purple-accent-4">
              <v-tab prepend-icon="mdi-numeric" text="Addresses" value="addresses" class="lowercase-btn"></v-tab>
              <v-tab prepend-icon="mdi-tag" text="Tags" value="tags" class="lowercase-btn"></v-tab>
            </v-tabs>
            <v-divider vertical class="ml-1">
            </v-divider>
            <v-btn @click="hide();" prepend-icon="mdi-window-close" class="lowercase-btn ml-1">Cancel</v-btn>
          </v-toolbar>
          <v-card-text>
            <v-dialog :model-value="addressDialog.mode != null" persistent max-width="500px">
              <v-card min-height="40vh">
                <v-toolbar density="compact">
                  <v-card-item :prepend-icon="addressDialog.mode == 'add' ? 'mdi-pencil-plus' : 'mdi-pencil'" :title="addressDialog.mode == 'add' ? 'Address - Add' : 'Address - Edit'"></v-card-item>
                </v-toolbar>
                <v-card-text class="ma-2 pa-2">
                  <v-text-field v-model="addressDialog.address" :readonly="addressDialog.mode == 'edit'" label="Address" :rules="addressRules" density="compact" placeholder="new account"></v-text-field>
                  <v-text-field v-model="addressDialog.name" label="Name" density="compact"></v-text-field>
                  <!-- <v-text-field v-model="portfolioDialog.name" label="Name" density="compact" style="width: 360px;"></v-text-field> -->
                  <!-- <v-data-table :headers="accountsHeaders" :items="portfolioDialog.accounts" density="compact" style="position: relative;">
                    <template v-slot:item.account="{ item }">
                      {{ item.account }}
                    </template>
                    <template v-slot:item.active="{ item }">
                      <v-checkbox v-model="item.active" hide-details></v-checkbox>
                    </template>
                    <template v-slot:item.actions="{ item, index }">
                      <v-btn @click="portfolioDialog.accounts.splice(index, 1);" prepend-icon="mdi-delete" variant="text" class="lowercase-btn">Delete</v-btn>
                    </template>
                    <template v-slot:body.append>
                      <tr class="bg-grey-lighten-4">
                        <td class="ma-0 pa-0">
                          <v-text-field v-model="portfolioDialog.account" :rules="addressRules" variant="solo" flat density="compact" single-line class="ma-2 pa-0" placeholder="new account" ></v-text-field>
                        </td>
                        <td>
                          <v-checkbox v-model="portfolioDialog.active" hide-details></v-checkbox>
                        </td>
                        <td>
                          <v-btn @click="portfolioDialog.accounts.push({ account: portfolioDialog.account, active: portfolioDialog.active });" prepend-icon="mdi-pencil-plus" variant="text" class="lowercase-btn">Add</v-btn>
                        </td>
                      </tr>
                    </template>
                  </v-data-table> -->
                </v-card-text>
                <v-card-actions>
                  <!-- <v-btn v-if="portfolioDialog.mode == 'add'" :disabled="!portfolioDialog.name || !!portfolios[portfolioDialog.name]" @click="portfolioDialogAddOrSave();" prepend-icon="mdi-check" variant="text" class="lowercase-btn">Add</v-btn> -->
                  <!-- <v-btn v-if="portfolioDialog.mode == 'edit'" @click="portfolioDialogAddOrSave();" prepend-icon="mdi-check" variant="text" class="lowercase-btn">Save</v-btn> -->
                  <v-btn v-if="addressDialog.mode == 'edit'" @click="addressDialogDelete();" prepend-icon="mdi-delete" variant="text" class="lowercase-btn">Delete</v-btn>
                  <v-btn @click="addressDialog.mode = null;" prepend-icon="mdi-window-close" variant="text" class="lowercase-btn">Cancel</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>

            <v-data-table
              v-if="tab == 'addresses'"
              :items="addressesList"
              :headers="addressesHeaders"
              v-model:sort-by="addressSortBy"
              v-model:items-per-page="addressItemsPerPage"
              v-model:page="addressCurrentPage"
              density="comfortable"
              hide-default-footer
            >
              <template v-slot:item.rowNumber="{ index }">
                {{ commify0((addressCurrentPage - 1) * addressItemsPerPage + index + 1) }}
              </template>
              <template v-slot:item.address="{ item }">
                {{ item.address }}
              </template>
              <template v-slot:item.name="{ item }">
                {{ item.name }}
                <br />
                {{ item.tags.join(", ") }}
              </template>
              <template v-slot:item.actions="{ item }">
                <v-btn @click="showAddressDialog(item.address);" prepend-icon="mdi-pencil" variant="text" class="lowercase-btn">Edit</v-btn>
              </template>
              <template v-slot:body.append>
                <tr class="bg-grey-lighten-4">
                  <td></td>
                  <td></td>
                  <td>
                    <v-btn @click="showAddressDialog(null);" prepend-icon="mdi-pencil-plus" variant="text" class="lowercase-btn">Add</v-btn>
                  </td>
                </tr>
              </template>
            </v-data-table>
            <v-data-table
              v-if="tab == 'tags'"
              :items="tagsList"
              :headers="tagsHeaders"
              v-model:sort-by="tagSortBy"
              v-model:items-per-page="tagItemsPerPage"
              v-model:page="tagCurrentPage"
              density="comfortable"
              hide-default-footer
            >
              <template v-slot:item.rowNumber="{ index }">
                {{ commify0((tagCurrentPage - 1) * tagItemsPerPage + index + 1) }}
              </template>
              <template v-slot:item.tag="{ item }">
                {{ item.tag }}
              </template>
              <template v-slot:item.addresses="{ item }">
                {{ item.addresses }}
              </template>
              <!-- <template v-slot:item.name="{ item }">
                {{ item.name }}
                <br />
                {{ item.tags.join(", ") }}
              </template> -->
            </v-data-table>
          </v-card-text>
          <v-card-actions>
            <v-toolbar flat color="transparent" density="compact">
              <v-spacer></v-spacer>
              <v-select
                v-if="tab == 'addresses'"
                v-model="addressItemsPerPage"
                :items="itemsPerPageOptions"
                variant="plain"
                density="compact"
                class="mt-2 mr-2"
                style="max-width: 80px;"
              ></v-select>
              <v-select
                v-if="tab == 'tags'"
                v-model="tagItemsPerPage"
                :items="itemsPerPageOptions"
                variant="plain"
                density="compact"
                class="mt-2 mr-2"
                style="max-width: 80px;"
              ></v-select>
              <v-pagination
                v-if="tab == 'addresses'"
                v-model="addressCurrentPage"
                :length="Math.ceil(addressesList.length / addressItemsPerPage)"
                total-visible="0"
                density="comfortable"
                show-first-last-page
                class="mr-1"
                color="primary"
              >
              </v-pagination>
              <v-pagination
                v-if="tab == 'tags'"
                v-model="tagCurrentPage"
                :length="Math.ceil(Object.keys(tags).length / tagItemsPerPage)"
                total-visible="0"
                density="comfortable"
                show-first-last-page
                class="mr-1"
                color="primary"
              >
              </v-pagination>
            </v-toolbar>
            <!-- <v-btn @click="hide();" prepend-icon="mdi-check" class="lowercase-btn">OK</v-btn>
            <v-btn @click="hide();" prepend-icon="mdi-window-close" class="lowercase-btn">Cancel</v-btn> -->
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  `,
  data: function () {
    return {
      initialised: false,
      settings: {
        version: 0,
      },
      addressDialog: {
        mode: null,
        address: null,
        name: null,
        tags: [],
      },
      itemsPerPageOptions: [
        { value: 5, title: "5" },
        { value: 10, title: "10" },
        { value: 25, title: "25" },
        { value: 50, title: "50" },
        { value: 100, title: "100" },
        { value: 1000, title: "1000" },
      ],
      addressesHeaders: [
        { title: 'Address', value: 'address', width: '65%', sortable: true },
        { title: 'Name / Tags', value: 'name', width: '20%', sortable: true },
        { title: '', value: 'actions', width: '15%', sortable: false },
      ],
      tagsHeaders: [
        { title: 'Tag', value: 'tag', width: '20%', sortable: true },
        { title: 'Addresses / Names', value: 'addresses', width: '65%', sortable: true, sortRaw: function sortRaw(a, b) { return a.addresses.length - b.addresses.length; } },
        { title: '', value: 'actions', width: '15%', sortable: false },
      ],
      addressRules: [
        (v) => (v || "").length > 0 || "Address is required",
        (v) => {
          try {
            ethers.utils.getAddress(v);
            return true;
          } catch (e) {
            return "Invalid Address";
          }
        },
      ],
    };
  },
  computed: {
    show() {
      return store.getters['addressBook/show'];
    },
    tab: {
      get: function () {
        return store.getters['addressBook/tab'];
      },
      set: function (tab) {
        store.dispatch('addressBook/setTab', tab);
      },
    },
    addressSortBy: {
      get: function () {
        return store.getters['addressBook/address'].sortBy;
      },
      set: function (sortBy) {
        store.dispatch('addressBook/setAddressSortBy', sortBy);
      },
    },
    addressItemsPerPage: {
      get: function () {
        return store.getters['addressBook/address'].itemsPerPage;
      },
      set: function (itemsPerPage) {
        store.dispatch('addressBook/setAddressItemsPerPage', itemsPerPage);
      },
    },
    addressCurrentPage: {
      get: function () {
        return store.getters['addressBook/address'].currentPage;
      },
      set: function (currentPage) {
        store.dispatch('addressBook/setAddressCurrentPage', currentPage);
      },
    },
    tagSortBy: {
      get: function () {
        return store.getters['addressBook/tag'].sortBy;
      },
      set: function (sortBy) {
        store.dispatch('addressBook/setTagSortBy', sortBy);
      },
    },
    tagItemsPerPage: {
      get: function () {
        return store.getters['addressBook/tag'].itemsPerPage;
      },
      set: function (itemsPerPage) {
        store.dispatch('addressBook/setTagItemsPerPage', itemsPerPage);
      },
    },
    tagCurrentPage: {
      get: function () {
        return store.getters['addressBook/tag'].currentPage;
      },
      set: function (currentPage) {
        store.dispatch('addressBook/setTagCurrentPage', currentPage);
      },
    },
    addresses() {
      return store.getters['addressBook/addresses'];
    },
    tags() {
      console.error("tags()");
      return store.getters['addressBook/tags'];
    },
    addressesList() {
      const results = [];
      for (const [address, addressData] of Object.entries(this.addresses)) {
        console.error(address + " => " + JSON.stringify(addressData));
        results.push({ address, name: addressData.name, tags: addressData.tags });
      }
      console.error("addressesList: " + JSON.stringify(results));
      return results;
    },
    tagsList() {
      const collator = {};
      for (const [tag, tagData] of Object.entries(store.getters['addressBook/tags'])) {
        if (!(tag in collator)) {
          collator[tag] = [];
        }
        for (const data of tagData) {
          collator[tag].push({ address: data.address, name: data.name });
        }
      }
      const results = [];
      for (const [tag, addresses] of Object.entries(collator)) {
        addresses.sort((a, b) => {
          return ('' + a.address).localeCompare(b.address);
        });
        results.push( { tag, addresses });
      }
      return results;
    },
  },
  methods: {
    hide() {
      console.log(now() + " AddressBook - methods.hide");
      store.dispatch('addressBook/setShow', false);
    },
    showAddressDialog(address) {
      console.log(now() + " AddressBook - methods.showAddressDialog - address: " + address);
      console.log(now() + " AddressBook - methods.showAddressDialog - addresses: " + JSON.stringify(this.addresses, null, 2));
      this.addressDialog.mode = address == null ? "add" : "edit";
      this.addressDialog.address = address;
      this.addressDialog.name = address == null ? "" : this.addresses[address].name;
      this.addressDialog.tags = address == null ? "" : this.addresses[address].tags;
      console.log(now() + " AddressBook - methods.showAddressDialog - addressDialog: " + JSON.stringify(this.addressDialog));
    },
    addressDialogAddOrSave() {
      console.log(now() + " AddressBook - methods.addressDialogAddOrSave - addressDialog: " + JSON.stringify(this.addressDialog));
      // store.dispatch('config/addPortfolio', { name: this.addressDialog.name, originalName: this.addressDialog.originalName, accounts: this.addressDialog.accounts });
      this.addressDialog.mode = null;
    },
    addressDialogDelete() {
      console.log(now() + " AddressBook - methods.addressDialogDelete");
      store.dispatch('addressBook/deleteAddress', this.addressDialog.address);
      this.addressDialog.mode = null;
    },
  },
  beforeCreate() {
    console.log(now() + " AddressBook - beforeCreate");
	},
  mounted() {
    console.log(now() + " AddressBook - mounted");
    // if ('explorerAddressBookSettings' in localStorage) {
    //   const tempSettings = JSON.parse(localStorage.explorerAddressBookSettings);
    //   // console.log(now() + " AddressBook - mounted - tempSettings: " + JSON.stringify(tempSettings));
    //   if ('version' in tempSettings && tempSettings.version == this.settings.version) {
    //     this.settings = tempSettings;
    //   }
    // }
    // this.initialised = true;
    // console.log(now() + " AddressBook - mounted - this.settings: " + JSON.stringify(this.settings));
	},
  unmounted() {
    console.log(now() + " AddressBook - unmounted");
	},
  destroyed() {
    console.log(now() + " AddressBook - destroyed");
	},
};


const addressBookModule = {
  namespaced: true,
  state: {
    settings: {
      show: false,
      tab: "addresses",
      address: {
        sortBy: [{ key: "address", order: "asc" }],
        itemsPerPage: 10,
        currentPage: 1,
      },
      tag: {
        sortBy: [{ key: "tag", order: "asc" }],
        itemsPerPage: 10,
        currentPage: 1,
      },
      addresses: {
        "0x0000...0003": {
          name: "address3",
          tags: [ "test3", "test" ],
        },
        "0x0000...0001": {
          name: "address1",
          tags: [ "test1", "test" ],
        },
        "0x0000...0002": {
          name: "address2",
          tags: [ "test2", "test" ],
        },
        "0x0000...0004": {
          name: "address4",
          tags: [ "test4", "test" ],
        },
        "0x0000...0005": {
          name: "address5",
          tags: [ "test5", "test" ],
        },
        "0x0000...0006": {
          name: "address6",
          tags: [ "test6", "test" ],
        },
        "0x0000...0007": {
          name: "address7",
          tags: [ "test7", "test" ],
        },
        "0x0000...0008": {
          name: "address8",
          tags: [ "test8", "test" ],
        },
        "0x0000...0009": {
          name: "address9",
          tags: [ "test9", "test" ],
        },
        "0x0000...0010": {
          name: "address10",
          tags: [ "test10", "test" ],
        },
        "0x0000...0011": {
          name: "address11",
          tags: [ "test11", "test" ],
        },
        "0x0000...0012": {
          name: "address12",
          tags: [ "test12", "test" ],
        },
        "0x0000...0013": {
          name: "address13",
          tags: [ "test13", "test" ],
        },
        "0x0000...0014": {
          name: "address14",
          tags: [ "test14", "test" ],
        },
        "0x0000...0015": {
          name: "address15",
          tags: [ "test15", "test" ],
        },
      },
      version: 4,
    },
  },
  getters: {
    show: state => state.settings.show,
    tab: state => state.settings.tab,
    address: state => state.settings.address,
    tag: state => state.settings.tag,
    addresses: state => state.settings.addresses,
    tags(state) {
      const results = {};
      for (const [address, addressData] of Object.entries(state.settings.addresses)) {
        for (let tag of addressData.tags) {
          if (!(tag in results)) {
            results[tag] = [];
          }
          results[tag].push({ address, name: addressData.name });
        }
      }
      console.error(now() + " addressBookModule - getters.tags - results: " + JSON.stringify(results));
      return results;
    },
  },
  mutations: {
    setAddressBook(state, settings) {
      // console.log(now() + " addressBookModule - mutations.setAddressBook - settings: " + JSON.stringify(settings).substring(0, 200));
      state.settings = settings;
    },
    setShow(state, show) {
      // console.log(now() + " addressBookModule - mutations.setShow - show: " + show);
      state.settings.show = show;
    },
    setTab(state, tab) {
      // console.log(now() + " addressBookModule - mutations.setTab - tab: " + tab);
      state.settings.tab = tab;
    },
    setAddressSortBy(state, sortBy) {
      console.error(now() + " addressBookModule - mutations.setAddressSortBy - sortBy: " + JSON.stringify(sortBy));
      state.settings.address.sortBy = sortBy;
    },
    setAddressItemsPerPage(state, itemsPerPage) {
      console.error(now() + " addressBookModule - mutations.setAddressItemsPerPage - itemsPerPage: " + itemsPerPage);
      state.settings.address.itemsPerPage = itemsPerPage;
    },
    setAddressCurrentPage(state, currentPage) {
      console.error(now() + " addressBookModule - mutations.setAddressCurrentPage - currentPage: " + currentPage);
      state.settings.address.currentPage = currentPage;
    },
    setTagSortBy(state, sortBy) {
      console.error(now() + " addressBookModule - mutations.setTagSortBy - sortBy: " + JSON.stringify(sortBy));
      state.settings.tag.sortBy = sortBy;
    },
    setTagItemsPerPage(state, itemsPerPage) {
      console.error(now() + " addressBookModule - mutations.setTagItemsPerPage - itemsPerPage: " + itemsPerPage);
      state.settings.tag.itemsPerPage = itemsPerPage;
    },
    setTagCurrentPage(state, currentPage) {
      console.error(now() + " addressBookModule - mutations.setTagCurrentPage - currentPage: " + currentPage);
      state.settings.tag.currentPage = currentPage;
    },
    deleteAddress(state, address) {
      console.error(now() + " addressBookModule - mutations.deleteAddress - address: " + address);
      delete state.settings.addresses[address];
    },
  },
  actions: {
    async loadAddressBook(context) {
      console.log(now() + " addressBookModule - actions.loadAddressBook");
      if (localStorage.explorerAddressBookSettings) {
        const tempAddressBook = JSON.parse(localStorage.explorerAddressBookSettings);
        if ('version' in tempAddressBook && tempAddressBook.version == context.state.settings.version) {
          // console.log(now() + " addressBookModule - actions.loadAddressBook - tempAddressBook: " + JSON.stringify(tempAddressBook).substring(0, 200));
          context.commit('setAddressBook', tempAddressBook);
        }
      }
      store.subscribe((mutation, state) => {
        if (mutation.type.substring(0, 15) == "addressBook/set" || mutation.type.substring(0, 18) == "addressBook/delete") {
          console.log(now() + " addressBookModule - actions.loadAddressBook - subscribe - mutation.type: " + mutation.type + " => " + JSON.stringify(mutation.payload));
          localStorage.explorerAddressBookSettings = JSON.stringify(context.state.settings);
        }
      });
    },
    setShow(context, show) {
      // console.log(now() + " addressBookModule - actions.setShow - show: " + show);
      context.commit('setShow', show);
    },
    setTab(context, tab) {
      // console.log(now() + " addressBookModule - actions.setTab - tab: " + tab);
      context.commit('setTab', tab);
    },
    setAddressSortBy(context, sortBy) {
      console.error(now() + " addressBookModule - actions.setAddressSortBy - sortBy: " + JSON.stringify(sortBy));
      context.commit('setAddressSortBy', sortBy);
    },
    setAddressItemsPerPage(context, itemsPerPage) {
      console.error(now() + " addressBookModule - actions.setAddressItemsPerPage - itemsPerPage: " + itemsPerPage);
      context.commit('setAddressItemsPerPage', itemsPerPage);
    },
    setAddressCurrentPage(context, currentPage) {
      console.error(now() + " addressBookModule - actions.setAddressCurrentPage - currentPage: " + currentPage);
      context.commit('setAddressCurrentPage', currentPage);
    },
    setTagSortBy(context, sortBy) {
      console.error(now() + " addressBookModule - actions.setTagSortBy - sortBy: " + JSON.stringify(sortBy));
      context.commit('setTagSortBy', sortBy);
    },
    setTagItemsPerPage(context, itemsPerPage) {
      console.error(now() + " addressBookModule - actions.setTagItemsPerPage - itemsPerPage: " + itemsPerPage);
      context.commit('setTagItemsPerPage', itemsPerPage);
    },
    setTagCurrentPage(context, currentPage) {
      console.error(now() + " addressBookModule - actions.setTagCurrentPage - currentPage: " + currentPage);
      context.commit('setTagCurrentPage', currentPage);
    },
    deleteAddress(context, address) {
      console.error(now() + " addressBookModule - actions.deleteAddress - address: " + address);
      context.commit('deleteAddress', address);
    },
  },
};
