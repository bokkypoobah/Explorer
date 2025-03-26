const Block = {
  template: "<div><h1>Block</h1><p>TODO</p></div>",
  data: function () {
    return {};
  },
  computed: {

  },
  methods: {

  },
  beforeCreate() {
    console.log(now() + " Block - app:beforeCreate");
	},
  mounted() {
    console.log(now() + " Block - app:mounted");
	},
  unmounted() {
    console.log(now() + " Block - app:unmounted");
	},
  destroyed() {
    console.log(now() + " Block - app:destroyed");
	},
};
