const Contract = {
  template: `
    <div>
      <h1>Contract</h1>
      <p>TODO</p>
      <p>{{ inputAddress }}</p>
    </div>
  `,
  props: ['inputAddress'],
  data: function () {
    return {
      address: null,
    };
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
  unmounted() {
    console.log(now() + " Contract - app:unmounted");
	},
  destroyed() {
    console.log(now() + " Contract - app:destroyed");
	},
};
