const RenderAddress = {
  template: `
    <v-menu location="bottom">
      <template v-slot:activator="{ props }">
        <!-- <v-btn v-if="address != null" color="primary" dark v-bind="props" :size="miniAddress ? 'x-small' : 'regular'" variant="text" :class="noXPadding ? 'ma-0 px-0 lowercase-btn' : 'ma-0 px-2 lowercase-btn'"> -->
        <v-btn v-if="address != null" color="primary" dark v-bind="props" :size="miniAddress ? 'x-small' : ''" variant="text" :class="noXPadding ? 'ma-0 px-0 lowercase-btn' : 'ma-0 px-2 pt-2 lowercase-btn'">
          <span v-if="miniAddress">
            {{ resolvedAddress.length == 42 ? (resolvedAddress.substring(0, 10)) : resolvedAddress }}
          </span>
          <span v-else-if="shortAddress">
            {{ resolvedAddress.substring(0, 10) + "..." + resolvedAddress.slice(-8) }}
          </span>
          <span v-else>
            <span v-if="name">
              {{ name + " " + resolvedAddress.substring(0, 10) + "..." + resolvedAddress.slice(-8) }}
            </span>
            <span v-else>
              {{ resolvedAddress }}
            </span>
          </span>
        </v-btn>
      </template>
      <v-list>
        <v-list-subheader>Address {{ resolvedAddress }}</v-list-subheader>
        <v-list-subheader v-if="name">Name {{ name }}</v-list-subheader>
        <v-list-item :href="'#/address/' + resolvedAddress">
          <template v-slot:prepend>
            <v-icon>mdi-arrow-right-bold-outline</v-icon>
          </template>
          <v-list-item-title>View address</v-list-item-title>
        </v-list-item>
        <v-list-item @click="copyToClipboard(resolvedAddress);">
          <template v-slot:prepend>
            <v-icon>mdi-content-copy</v-icon>
          </template>
          <v-list-item-title>Copy address to clipboard</v-list-item-title>
        </v-list-item>
        <v-list-item :href="explorer + 'address/' + resolvedAddress" target="_blank">
          <template v-slot:prepend>
            <v-icon>mdi-link-variant</v-icon>
          </template>
          <v-list-item-title>View address in the explorer</v-list-item-title>
        </v-list-item>
        <v-list-item v-if="token" :href="explorer + 'token/' + token + '?a=' + resolvedAddress" target="_blank">
          <template v-slot:prepend>
            <v-icon>mdi-link-variant</v-icon>
          </template>
          <v-list-item-title>View address in token contract in the explorer</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  `,
  props: {
    address: {
      type: [String, Number],
    },
    addresses: {
      type: Array,
      default: () => []
    },
    token: {
      type: String,
      default: null,
    },
    miniAddress: {
      type: Boolean,
      default: false,
    },
    shortAddress: {
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
    resolvedAddress() {
      if (this.address.length != 42) {
        return this.addresses[this.address] || this.address;
      }
      return this.address;
    },
    addressBook() {
      return store.getters['addresses/addresses'];
    },
    name() {
      return this.addressBook[this.address] && this.addressBook[this.address].ensName || null;
    },
    explorer() {
      return store.getters['explorer'];
    },
  },
  methods: {
    copyToClipboard(str) {
      navigator.clipboard.writeText(str);
    },
  },
};
