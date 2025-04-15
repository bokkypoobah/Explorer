const RenderTxHash = {
  template: `
    <v-menu location="bottom">
      <template v-slot:activator="{ props }">
        <v-btn v-if="txHash" color="primary" dark v-bind="props" variant="text" class="ma-0 px-2 lowercase-btn">
          {{ shortTxHash ? (txHash.substring(0, 20) + "...") : txHash }}
        </v-btn>
      </template>
      <v-list>
        <v-list-subheader>Transaction hash {{ txHash }}</v-list-subheader>
        <v-list-item v-if="!supressView" :href="'#/transaction/' + txHash">
          <template v-slot:prepend>
            <v-icon>mdi-arrow-right-bold-outline</v-icon>
          </template>
          <v-list-item-title>View</v-list-item-title>
        </v-list-item>
        <v-list-item @click="copyToClipboard(txHash);">
          <template v-slot:prepend>
            <v-icon>mdi-content-copy</v-icon>
          </template>
          <v-list-item-title>Copy block to clipboard</v-list-item-title>
        </v-list-item>
        <v-list-item :href="explorer + 'tx/' + txHash" target="_blank">
          <template v-slot:prepend>
            <v-icon>mdi-link-variant</v-icon>
          </template>
          <v-list-item-title>View in explorer</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  `,
  props: {
    txHash: {
      type: String,
    },
    shortTxHash: {
      type: Boolean,
      default: false,
    },
    supressView: {
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
  //   console.log(now() + " RenderTxHash - beforeCreate");
	// },
  // mounted() {
  //   console.log(now() + " RenderTxHash - mounted");
	// },
  // unmounted() {
  //   console.log(now() + " RenderTxHash - unmounted");
	// },
  // destroyed() {
  //   console.log(now() + " RenderTxHash - destroyed");
	// },
};
