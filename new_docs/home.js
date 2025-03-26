// const Home = { template: '<div>Home Page</div>' };

const Home = {
  template: `
    <div><h1>Home</h1><p>This is home page</p></div>
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
    console.log("now()" + " home.js - app:beforeCreate");
	},
  mounted() {
    console.log("now()" + " home.js - app:mounted");
	},
  destroyed() {
    console.log("now()" + " home.js - app:destroyed");
	},
};
