// const Home = { template: '<div>Home Page</div>' };

const Home = {
  template: `
    <div>
      <v-card>
        <v-card-text>
          <h1>Home</h1>
          <p>TODO</p>
        </v-card-text>
      </v-card>
    </div>
  `,
  <!-- props: ['testProp'], -->
  data: function () {
    return {};
  },
  computed: {

  },
  methods: {

  },
  beforeCreate() {
    console.log(now() + " Home - app:beforeCreate");
	},
  mounted() {
    console.log(now() + " Home - app:mounted");
	},
  destroyed() {
    console.log(now() + " Home - app:destroyed");
	},
};
