const RenderTxHash = {
  template: `
    <v-menu location="bottom">
      <template v-slot:activator="{ props }">
        <v-btn v-if="txHash != null" color="primary" dark v-bind="props" variant="text" :class="noXPadding ? 'ma-0 px-0 lowercase-btn' : 'ma-0 px-2 lowercase-btn'">
          {{ shortTxHash && resolvedTxHash.length == 66 ? (resolvedTxHash.substring(0, 20) + "...") : resolvedTxHash }}
        </v-btn>
      </template>
      <v-list>
        <v-list-subheader>Transaction hash {{ txHash }}</v-list-subheader>
        <v-list-item v-if="!suppressView" :href="'#/transaction/' + txHash">
          <template v-slot:prepend>
            <v-icon>mdi-arrow-right-bold-outline</v-icon>
          </template>
          <v-list-item-title>View</v-list-item-title>
        </v-list-item>
        <v-list-item @click="copyToClipboard(txHash);">
          <template v-slot:prepend>
            <v-icon>mdi-content-copy</v-icon>
          </template>
          <v-list-item-title>Copy transaction hash to clipboard</v-list-item-title>
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
      type: [String, Number],
    },
    txHashes: {
      type: Array,
      default: () => []
    },
    shortTxHash: {
      type: Boolean,
      default: false,
    },
    suppressView: {
      type: Boolean,
      default: false,
    },
    noXPadding: {
      type: Boolean,
      default: false,
    },
  },
  data: function () {
    return {
    };
  },
  computed: {
    resolvedTxHash() {
      if (this.txHash.length != 66) {
        return this.txHashes[this.txHash] || this.txHash;
      }
      return this.txHash;
    },
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
};
