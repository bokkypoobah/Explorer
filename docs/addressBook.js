const AddressBook = {
  template: `
    <div>
      <v-dialog :model-value="show" persistent theme="system" max-width="800px">
        <v-card min-height="50vh">
          <v-card-title class="ma-0 pa-1">
            <h4 class="ml-2">Address Book</h4>
          </v-card-title>
          <v-toolbar density="compact">
            <h4 class="ml-2">Blah</h4>
            <v-spacer></v-spacer>
            <v-tabs v-model="tab" right color="deep-purple-accent-4">
              <v-tab prepend-icon="mdi-numeric" text="Addresses" value="addresses" class="lowercase-btn"></v-tab>
              <v-tab prepend-icon="mdi-tag" text="Tags" value="tags" class="lowercase-btn"></v-tab>
            </v-tabs>
          </v-toolbar>
          <!-- <v-card-text class="ma-2 pa-2"> -->
          <v-card-text>
            <!-- {{ addressesList }} -->
            <!-- {{ tagsList }} -->
            {{ tags }}
          </v-card-text>
          <v-card-actions>
            <!-- <v-btn @click="hide();" prepend-icon="mdi-window-close" variant="text" class="lowercase-btn">Cancel</v-btn> -->
            <v-btn @click="hide();" prepend-icon="mdi-check" class="lowercase-btn">OK</v-btn>
            <v-btn @click="hide();" prepend-icon="mdi-window-close" class="lowercase-btn">Cancel</v-btn>
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
      portfoliosHeaders: [
        { title: 'Name', value: 'name', width: '20%', sortable: true },
        { title: 'Accounts', value: 'accounts', width: '65%', sortable: false },
        { title: '', value: 'actions', width: '15%', sortable: false },
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
    addresses() {
      return store.getters['addressBook/addresses'];
    },
    tags() {
      return store.getters['addressBook/tags'];
    },
    addressesList() {
      const results = [];
      for (const [address, addressData] of Object.entries(this.addresses)) {
        // console.error(address + " => " + JSON.stringify(addressData));
        results.push({ value: address, title: address, tags: addressData.tags });
      }
      return results;
    },
    tagsList() {
      const collator = {};
      const results = [];
      for (const [address, addressData] of Object.entries(this.addresses)) {
        console.error(address + " => " + JSON.stringify(addressData));
        results.push({ value: address, title: address, tags: addressData.tags });
        for (let tag of addressData.tags) {
          console.error("  " + tag);
          if (!(tag in collator)) {
            collator[tag] = [];
          }
          collator[tag].push(address);
        }
      }
      return collator;
    },
  },
  methods: {
    hide() {
      console.log(now() + " AddressBook - methods.hide");
      store.dispatch('addressBook/setShow', false);
    },
  },
  beforeCreate() {
    console.log(now() + " AddressBook - beforeCreate");
	},
  mounted() {
    console.log(now() + " AddressBook - mounted");
    if ('explorerAddressBookSettings' in localStorage) {
      const tempSettings = JSON.parse(localStorage.explorerAddressBookSettings);
      // console.log(now() + " AddressBook - mounted - tempSettings: " + JSON.stringify(tempSettings));
      if ('version' in tempSettings && tempSettings.version == this.settings.version) {
        this.settings = tempSettings;
      }
    }
    this.initialised = true;
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
    addressBook: {
      show: false,
      tab: "addresses",
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
      version: 2,
    },
  },
  getters: {
    show: state => state.addressBook.show,
    tab: state => state.addressBook.tab,
    addresses: state => state.addressBook.addresses,
    tags(state) {
      const results = {};
      for (const [address, addressData] of Object.entries(state.addressBook.addresses)) {
        for (let tag of addressData.tags) {
          if (!(tag in results)) {
            results[tag] = [];
          }
          results[tag].push(address);
        }
      }
      console.error(now() + " addressBookModule - getters.tags - results: " + JSON.stringify(results));
      return results;
    },
  },
  mutations: {
    setAddressBook(state, addressBook) {
      // console.log(now() + " addressBookModule - mutations.setAddressBook - addressBook: " + JSON.stringify(addressBook).substring(0, 200));
      state.addressBook = addressBook;
    },
    setShow(state, show) {
      // console.log(now() + " addressBookModule - mutations.setShow - show: " + show);
      state.addressBook.show = show;
    },
    setTab(state, tab) {
      // console.log(now() + " addressBookModule - mutations.setTab - tab: " + tab);
      state.addressBook.tab = tab;
    },
  },
  actions: {
    async loadAddressBook(context) {
      console.log(now() + " addressBookModule - actions.loadAddressBook");
      if (localStorage.explorerAddressBook) {
        const tempAddressBook = JSON.parse(localStorage.explorerAddressBook);
        if ('version' in tempAddressBook && tempAddressBook.version == context.state.addressBook.version) {
          // console.log(now() + " addressBookModule - actions.loadAddressBook - tempAddressBook: " + JSON.stringify(tempAddressBook).substring(0, 200));
          context.commit('setAddressBook', tempAddressBook);
        }
      }
      store.subscribe((mutation, state) => {
        if (mutation.type.substring(0, 15) == "addressBook/set") {
          console.log(now() + " addressBookModule - actions.loadAddressBook - subscribe - mutation.type: " + mutation.type);
          localStorage.explorerAddressBook = JSON.stringify(context.state.addressBook);
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
  },
};
