const PortfolioRenderAddress = {
  template: `
    <v-btn v-if="address != null" color="primary" dark variant="text" :class="noXPadding ? 'ma-0 px-0 lowercase-btn' : 'ma-0 px-2 pt-2 lowercase-btn'">
      {{ address.substring(0, 8) + "..." + address.slice(-6) }}
      <v-menu activator="parent" location="bottom">
        <v-list>
          <v-list-subheader>{{ address }}</v-list-subheader>
          <v-list-subheader v-if="name || ensName">{{ name }} {{ ensName }}</v-list-subheader>
          <v-list-item :href="'#/address/' + address">
            <template v-slot:prepend>
              <v-icon>mdi-arrow-right-bold-outline</v-icon>
            </template>
            <v-list-item-title>View address</v-list-item-title>
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
            <v-list-item-title>View address in the explorer</v-list-item-title>
          </v-list-item>
          <v-list-item v-if="token" :href="explorer + 'token/' + token + '?a=' + address" target="_blank">
            <template v-slot:prepend>
              <v-icon>mdi-link-variant</v-icon>
            </template>
            <v-list-item-title>View address in token contract in the explorer</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-btn><br />
    <v-chip variant="plain" class="ma-0 pa-0" style="min-width: 50px;">{{ name }}</v-chip><v-chip variant="plain" class="ma-0 pa-0">{{ ensName }}</v-chip>
  `,
  props: {
    address: {
      type: String,
    },
    token: {
      type: String,
      default: null,
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
    chainId() {
      return store.getters['chainId'];
    },
    addressBook() {
      return store.getters['addressBook/addresses'];
    },
    portfolioData() {
      return store.getters['portfolio/data'];
    },
    portfolioMetadata() {
      return store.getters['portfolio/metadata'];
    },
    name() {
      if (this.address && this.address in this.addressBook) {
        return this.addressBook[this.address].name;
      }
      return null;
    },
    ensName() {
      // console.error("this.portfolioData: " + JSON.stringify(this.portfolioData, null, 2));
      // console.error("this.portfolioMetadata: " + JSON.stringify(this.portfolioMetadata, null, 2));
      if (this.address && this.address in this.portfolioData && "1" in this.portfolioData[this.address]) {
        return this.portfolioData[this.address]["1"].ensName;
      }
      return null;
    },
    explorer() {
      return store.getters['web3/explorer'];
    },
  },
  methods: {
    copyToClipboard(str) {
      navigator.clipboard.writeText(str);
    },
  },
};
