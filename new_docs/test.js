const Test = {
  template: "<div><h1>Test</h1><p>This is a test page</p></div>",
  data: function () {
    return {};
  },
  computed: {

  },
  methods: {

  },
  beforeCreate() {
    console.log(now() + " Test - app:beforeCreate");
	},
  mounted() {
    console.log(now() + " Test - app:mounted");
	},
  destroyed() {
    console.log(now() + " Test - app:destroyed");
	},
};
