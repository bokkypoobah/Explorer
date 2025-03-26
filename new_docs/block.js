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
  destroyed() {
    console.log(now() + " Block - app:destroyed");
	},
};
