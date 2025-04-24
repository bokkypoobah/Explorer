const RenderTokenId = {
  template: `
    <v-menu location="bottom">
      <template v-slot:activator="{ props }">
        <v-btn v-if="token != null && tokenId != null" color="primary" dark v-bind="props" variant="text" :class="noXPadding ? 'ma-0 px-0 lowercase-btn' : 'ma-0 px-2 lowercase-btn'" style="min-width: 0px;">
          {{ commify0(tokenId) }}
          <v-chip v-if="count != null" size="small" variant="plain">
            {{ 'x' + commify0(count) }}
          </v-chip>
        </v-btn>
      </template>
      <v-list>
        <v-list-subheader>Token {{ token + ':' + tokenId }}</v-list-subheader>
        <v-list-item :href="'https://opensea.io/item/ethereum/' + token + '/' + tokenId" target="_blank">
          <!-- https://opensea.io/item/ethereum/0xb32979486938aa9694bfc898f35dbed459f44424/10063 -->
          <template v-slot:prepend>
            <v-icon>mdi-link-variant</v-icon>
          </template>
          <v-list-item-title>View in opensea.io</v-list-item-title>
        </v-list-item>
        <!-- <v-list-item :href="'#/address/' + resolvedAddress">
          <template v-slot:prepend>
            <v-icon>mdi-arrow-right-bold-outline</v-icon>
          </template>
          <v-list-item-title>View</v-list-item-title>
        </v-list-item> -->
        <!-- <v-list-item @click="copyToClipboard(resolvedAddress);">
          <template v-slot:prepend>
            <v-icon>mdi-content-copy</v-icon>
          </template>
          <v-list-item-title>Copy address to clipboard</v-list-item-title>
        </v-list-item> -->
        <!-- <v-list-item :href="explorer + 'address/' + resolvedAddress" target="_blank">
          <template v-slot:prepend>
            <v-icon>mdi-link-variant</v-icon>
          </template>
          <v-list-item-title>View this address in the explorer</v-list-item-title>
        </v-list-item> -->
        <!-- <v-list-item v-if="token" :href="explorer + 'token/' + token + '?a=' + resolvedAddress" target="_blank">
          <template v-slot:prepend>
            <v-icon>mdi-link-variant</v-icon>
          </template>
          <v-list-item-title>View token filtered by this address in the explorer</v-list-item-title>
        </v-list-item> -->
      </v-list>
    </v-menu>
  `,
  props: {
    token: {
      type: String,
      default: null,
    },
    tokenId: {
      type: [String, Number],
    },
    count: {
      type: [String, Number],
      default: null,
    },
    // addresses: {
    //   type: Array,
    //   default: () => []
    // },
    // shortAddress: {
    //   type: Boolean,
    //   default: false,
    // },
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
    // resolvedAddress() {
    //   if (this.address.length != 42) {
    //     return this.addresses[this.address] || this.address;
    //   }
    //   return this.address;
    // },
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
