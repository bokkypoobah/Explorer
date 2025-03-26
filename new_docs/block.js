const Block = {
  template: `
    <div>
      <h1>Block</h1>
      <p>TODO</p>
      <p>{{ inputBlockNumber }}</p>
    </div>
  `,
  props: ['inputBlockNumber'],
  data: function () {
    return {
      blockNumber: null,
    };
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
