const Search = {
  template: `
    <div>
      <v-dialog :model-value="show" persistent theme="system" max-width="800px">
        <v-card title="Search">
          <!-- <v-card-text class="ma-2 pa-2"> -->
          <v-card-text>
            Blah
          </v-card-text>
          <v-card-actions>
            <!-- <v-btn @click="hide();" prepend-icon="mdi-window-close" variant="text" class="lowercase-btn">Cancel</v-btn> -->
            <v-btn @click="hide();" prepend-icon="mdi-check" variant="outlined" rounded size="small" class="lowercase-btn">OK</v-btn>
            <v-btn @click="hide();" prepend-icon="mdi-window-close" variant="outlined" rounded size="small" class="lowercase-btn">Cancel</v-btn>
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
      return store.getters['search/show'];
    },
  },
  methods: {
    hide() {
      console.log(now() + " Search - methods.hide");
      store.dispatch('search/setShow', false);
    },
  },
  beforeCreate() {
    console.log(now() + " Search - beforeCreate");
	},
  mounted() {
    console.log(now() + " Search - mounted");
    if ('explorerSearchSettings' in localStorage) {
      const tempSettings = JSON.parse(localStorage.explorerSearchSettings);
      // console.log(now() + " Search - mounted - tempSettings: " + JSON.stringify(tempSettings));
      if ('version' in tempSettings && tempSettings.version == this.settings.version) {
        this.settings = tempSettings;
      }
    }
    this.initialised = true;
    // console.log(now() + " Search - mounted - this.settings: " + JSON.stringify(this.settings));
	},
  unmounted() {
    console.log(now() + " Search - unmounted");
	},
  destroyed() {
    console.log(now() + " Search - destroyed");
	},
};


const searchModule = {
  namespaced: true,
  state: {
    show: false,
  },
  getters: {
    show: state => state.show,
  },
  mutations: {
    setShow(state, show) {
      console.log(now() + " searchModule - mutations.setShow - show: " + show);
      state.show = show;
    },
  },
  actions: {
    setShow(context, show) {
      console.log(now() + " searchModule - actions.setShow - show: " + show);
      context.commit('setShow', show);
    },
  },
};
