const Test = {
  template: `
    <div><h1>Test</h1><p>This is a test page</p></div>
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
