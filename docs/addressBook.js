const AddressBook = {
  template: `
    <div>
      <v-dialog :model-value="show" persistent theme="system" max-width="800px">
        <v-card title="Address Book" min-height="50vh">
          <!-- <v-card-text class="ma-2 pa-2"> -->
          <v-card-text>
            Blah
          </v-card-text>
          <v-card-actions>
            <!-- <v-btn @click="hide();" prepend-icon="mdi-window-close" variant="text" class="lowercase-btn">Cancel</v-btn> -->
            <v-btn @click="hide();" prepend-icon="mdi-check" size="small" class="lowercase-btn">OK</v-btn>
            <v-btn @click="hide();" prepend-icon="mdi-window-close" size="small" class="lowercase-btn">Cancel</v-btn>
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
      addresses: {},
      version: 0,
    },
  },
  getters: {
    show: state => state.addressBook.show,
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
  },
};
