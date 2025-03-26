const Config = {
  template: "<div><h1>Config</h1><p>TODO</p></div>",
  data: function () {
    return {};
  },
  computed: {

  },
  methods: {

  },
  beforeCreate() {
    console.log(now() + " Config - app:beforeCreate");
	},
  mounted() {
    console.log(now() + " Config - app:mounted");
	},
  unmounted() {
    console.log(now() + " Config - app:unmounted");
	},
  destroyed() {
    console.log(now() + " Config - app:destroyed");
	},
};
