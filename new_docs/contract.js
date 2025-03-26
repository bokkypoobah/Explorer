const Contract = {
  template: "<div><h1>Contract</h1><p>TODO</p></div>",
  data: function () {
    return {};
  },
  computed: {

  },
  methods: {

  },
  beforeCreate() {
    console.log(now() + " Contract - app:beforeCreate");
	},
  mounted() {
    console.log(now() + " Contract - app:mounted");
	},
  destroyed() {
    console.log(now() + " Contract - app:destroyed");
	},
};
