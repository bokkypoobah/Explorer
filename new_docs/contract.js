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
    console.log(now() + " Contract - beforeCreate");
	},
  mounted() {
    console.log(now() + " Contract - mounted");
	},
  unmounted() {
    console.log(now() + " Contract - unmounted");
	},
  destroyed() {
    console.log(now() + " Contract - destroyed");
	},
};
