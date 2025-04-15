const RenderAddress = {
  template: `
    <v-menu location="bottom">
      <template v-slot:activator="{ props }">
        <v-btn v-if="address" color="primary" dark v-bind="props" variant="text" class="ma-0 px-2 lowercase-btn">
          {{ shortAddress ? (address.substring(0, 10) + "..." + address.slice(-8)) : address }}
        </v-btn>
      </template>
      <v-list>
        <v-list-subheader>{{ address }}</v-list-subheader>
        <v-list-item :href="'#/address/' + address">
          <template v-slot:prepend>
            <v-icon>mdi-arrow-right-bold-outline</v-icon>
          </template>
          <v-list-item-title>View</v-list-item-title>
        </v-list-item>
        <v-list-item @click="copyToClipboard(address);">
          <template v-slot:prepend>
            <v-icon>mdi-content-copy</v-icon>
          </template>
          <v-list-item-title>Copy address to clipboard</v-list-item-title>
        </v-list-item>
        <v-list-item :href="explorer + 'address/' + address" target="_blank">
          <template v-slot:prepend>
            <v-icon>mdi-link-variant</v-icon>
          </template>
          <v-list-item-title>View in explorer</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  `,
  props: {
    address: {
      type: String,
    },
    shortAddress: {
      type: Boolean,
      default: false
    }
  },
  data: function () {
    return {
    };
  },
  computed: {
    explorer() {
      return store.getters['explorer'];
    },
  },
  methods: {
    copyToClipboard(str) {
      navigator.clipboard.writeText(str);
    },
  },
  // beforeCreate() {
  //   console.log(now() + " RenderAddress - beforeCreate");
	// },
  // mounted() {
  //   console.log(now() + " RenderAddress - mounted");
	// },
  // unmounted() {
  //   console.log(now() + " RenderAddress - unmounted");
	// },
  // destroyed() {
  //   console.log(now() + " RenderAddress - destroyed");
	// },
};
