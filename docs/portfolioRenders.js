const PortfolioRenderAddress = {
  template: `
    <v-btn v-if="address != null" color="primary" dark variant="text" density="compact" :class="noXPadding ? 'ma-0 px-0 pt-2 lowercase-btn' : 'ma-0 px-2 pt-2 lowercase-btn'">
      {{ address.substring(0, 8) + "&hellip;" + address.slice(-6) }}
      <v-menu activator="parent" location="bottom">
        <v-list>
          <v-list-subheader>{{ address }}</v-list-subheader>
          <v-list-subheader v-if="name || ensName"><v-chip variant="plain" density="compact" class="ma-0 pa-0">{{ name }}</v-chip><v-chip variant="plain" density="compact" class="ma-0 ml-2 pa-0">{{ ensName }}</v-chip></v-list-subheader>
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
          <v-list-item @click="copyToClipboard(ensName);">
            <template v-slot:prepend>
              <v-icon>mdi-content-copy</v-icon>
            </template>
            <v-list-item-title>Copy ENS name to clipboard</v-list-item-title>
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
    <v-chip variant="plain" density="compact" class="ma-0 pa-0" style="min-width: 50px;">{{ name }}</v-chip><v-chip variant="plain" density="compact" class="ma-0 ml-1 pa-0">{{ ensName }}</v-chip>
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


const PortfolioRenderCollection = {
  template: `

    <v-card flat class="d-flex">
      <div class="pa-1 flex-shrink-0">
        <v-img
          src="http://localhost:7676/images/fknchad_FkqVTzBaUAAiE8x_nobg.png"
          width="70"
          alt="Card image"
        ></v-img>
      </div>
      <div class="pa-1 d-flex d-flex-shrink-1 d-flex-grow-0">
        <v-card-text>
          <v-btn color="primary" dark variant="text" density="compact" :class="noXPadding ? 'ma-0 px-0 pt-2 lowercase-btn' : 'ma-0 px-2 pt-2 lowercase-btn'" style="min-width: 0px;">
            {{ name }}
            <!-- {{ address.substring(0, 8) + "&hellip;" + address.slice(-6) }} -->
            <v-menu activator="parent" location="bottom">
              <v-list>
                <v-list-subheader>{{ contract }}</v-list-subheader>
                <v-list-subheader v-if="name || ensName"><v-chip variant="plain" density="compact" class="ma-0 pa-0">{{ name }}</v-chip><v-chip variant="plain" density="compact" class="ma-0 ml-2 pa-0">{{ ensName }}</v-chip></v-list-subheader>
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
                <v-list-item @click="copyToClipboard(ensName);">
                  <template v-slot:prepend>
                    <v-icon>mdi-content-copy</v-icon>
                  </template>
                  <v-list-item-title>Copy ENS name to clipboard</v-list-item-title>
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
          <v-chip variant="plain" density="compact" class="ma-0 pa-0" style="min-width: 50px;">{{ contract == null ? "Ethereums" : (contract.substring(0, 8) + "..." + contract.slice(-6)) }}</v-chip>
          <!-- <v-chip variant="plain" density="compact" class="ma-0 ml-1 pa-0">{{ ensName }}</v-chip> -->
        </v-card-text>
      </div>
    </v-card>

  `,
  props: {
    type: {
      type: Number,
    },
    contract: {
      type: String,
    },
    address: {
      type: String,
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
      return store.getters['web3/chainId'];
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
      if (this.type == 0) {
        return "ETH";
      }
      // if (this.contract && this.contract in this.addressBook) {
      //   return this.addressBook[this.contract].name;
      // }
      // console.error("this.chainId: " + this.chainId);
      if (this.contract && this.chainId in this.portfolioMetadata && this.contract in this.portfolioMetadata[this.chainId]) {
        const contract = this.portfolioMetadata[this.chainId][this.contract];
        if (this.type == 1 && (contract.symbol || contract.name)) {
          // console.error("this.portfolioMetadata: " + JSON.stringify(this.portfolioMetadata, null, 2));
          return (contract.symbol && (contract.symbol + " ") || "") + (contract.name || "");
        } else if (this.type >= 1 && contract.collectionName) {
          return contract.collectionName;
        } else {
          return this.contract.substring(0, 8) + "..." + this.contract.slice(-6);
        }
      }
      return null;
    },
    ensName() {
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
