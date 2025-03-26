const Address = {
  template: "<div><h1>Address</h1><p>TODO</p></div>",
  data: function () {
    return {};
  },
  computed: {

  },
  methods: {

  },
  beforeCreate() {
    console.log(now() + " Address - app:beforeCreate");
	},
  mounted() {
    console.log(now() + " Address - app:mounted");
	},
  destroyed() {
    console.log(now() + " Address - app:destroyed");
	},
};
