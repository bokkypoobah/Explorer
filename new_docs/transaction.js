const Transaction = {
  template: "<div><h1>Transaction</h1><p>TODO</p></div>",
  data: function () {
    return {};
  },
  computed: {

  },
  methods: {

  },
  beforeCreate() {
    console.log(now() + " Transaction - app:beforeCreate");
	},
  mounted() {
    console.log(now() + " Transaction - app:mounted");
	},
  destroyed() {
    console.log(now() + " Transaction - app:destroyed");
	},
};
