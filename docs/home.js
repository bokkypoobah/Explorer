const Home = {
  template: `
    <div>
      <v-card>
        <v-card-text>
          <v-row>
            <v-col cols="6">
              Latest Blocks
            </v-col>
            <v-col cols="6">
              Latest Transactions
            </v-col>
          </v-row>

          <h1>Home</h1>
          {{ blocksList }}
        </v-card-text>
      </v-card>
    </div>
  `,
  data: function () {
    return {};
  },
  computed: {
    blocksList() {
      return store.getters['blocks/blocksList'];
    },
  },
  methods: {

  },
  beforeCreate() {
    console.log(now() + " Home - beforeCreate");
	},
  mounted() {
    console.log(now() + " Home - mounted");
	},
  destroyed() {
    console.log(now() + " Home - destroyed");
	},
};
