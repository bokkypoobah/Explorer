const RenderBlockNumber = {
  template: `
    <v-menu location="bottom">
      <template v-slot:activator="{ props }">
        <v-btn v-if="block" color="primary" dark v-bind="props" variant="text" class="ma-0 px-2 lowercase-btn">
          {{ commify0(block) }}
        </v-btn>
      </template>
      <v-list>
        <v-list-subheader>Block {{ commify0(block) }}</v-list-subheader>
        <v-list-item v-if="!suppressView" :href="'#/block/' + block">
          <template v-slot:prepend>
            <v-icon>mdi-arrow-right-bold-outline</v-icon>
          </template>
          <v-list-item-title>View</v-list-item-title>
        </v-list-item>
        <v-list-item @click="copyToClipboard(block);">
          <template v-slot:prepend>
            <v-icon>mdi-content-copy</v-icon>
          </template>
          <v-list-item-title>Copy block number to clipboard</v-list-item-title>
        </v-list-item>
        <v-list-item :href="explorer + 'block/' + block" target="_blank">
          <template v-slot:prepend>
            <v-icon>mdi-link-variant</v-icon>
          </template>
          <v-list-item-title>View in explorer</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  `,
  props: {
    block: {
      type: Number,
    },
    suppressView: {
      type: Boolean,
      default: false,
    },
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
    commify0(n) {
      if (n != null) {
        return Number(n).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
      }
      return null;
    },
    copyToClipboard(str) {
      navigator.clipboard.writeText(str);
    },
  },
  // beforeCreate() {
  //   console.log(now() + " RenderBlockNumber - beforeCreate");
	// },
  // mounted() {
  //   console.log(now() + " RenderBlockNumber - mounted");
	// },
  // unmounted() {
  //   console.log(now() + " RenderBlockNumber - unmounted");
	// },
  // destroyed() {
  //   console.log(now() + " RenderBlockNumber - destroyed");
	// },
};
