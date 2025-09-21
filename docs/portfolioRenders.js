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
          <v-list-item :href="'https://opensea.io/' + address" target="_blank">
            <template v-slot:prepend>
              <v-icon>mdi-link-variant</v-icon>
            </template>
            <v-list-item-title>View address in OpenSea</v-list-item-title>
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
    <v-chip variant="plain" density="compact" class="ma-0 pa-1" style="min-width: 40px;">{{ name }}</v-chip>
    <v-chip variant="plain" density="compact" class="ma-0 ml-1 pa-1">{{ ensName }}</v-chip>
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
      <div class="pa-1 flex-shrink-0" style="width: 70px;">
        <div v-if="type == 0">
          <v-icon size="50px">mdi-ethereum</v-icon>
        </div>
        <div v-else-if="type == 1">
          <v-icon size="40px">mdi-cash-multiple</v-icon>
        </div>
        <div v-else>
          <v-img :src="image" alt="Card image"></v-img>
        </div>
      </div>
      <div class="pa-1 d-flex d-flex-shrink-1 d-flex-grow-0">
        <v-card-text>
          <v-btn color="primary" dark variant="text" density="compact" :class="noXPadding ? 'ma-0 px-0 pt-2 lowercase-btn' : 'ma-0 px-2 pt-2 lowercase-btn'" style="min-width: 0px;">
            {{ name || "(none)" }}
            <!-- {{ address.substring(0, 8) + "&hellip;" + address.slice(-6) }} -->
            <v-menu activator="parent" location="bottom">
              <v-list>
                <v-list-subheader>{{ contract || "Ethereums" }}</v-list-subheader>
                <v-list-subheader v-if="name"><v-chip variant="plain" density="compact" class="ma-0 pa-0">{{ name }}</v-chip></v-list-subheader>
                <v-list-item v-if="!contract" :href="'#/address/' + address">
                  <template v-slot:prepend>
                    <v-icon>mdi-arrow-right-bold-outline</v-icon>
                  </template>
                  <v-list-item-title>View address</v-list-item-title>
                </v-list-item>
                <v-list-item v-if="contract" :href="'#/address/' + contract">
                  <template v-slot:prepend>
                    <v-icon>mdi-arrow-right-bold-outline</v-icon>
                  </template>
                  <v-list-item-title>View contract address</v-list-item-title>
                </v-list-item>
                <v-list-item v-if="contract" :href="'#/token/' + contract">
                  <template v-slot:prepend>
                    <v-icon>mdi-arrow-right-bold-outline</v-icon>
                  </template>
                  <v-list-item-title>View as token contract</v-list-item-title>
                </v-list-item>
                <v-list-item v-if="contract" @click="copyToClipboard(contract);">
                  <template v-slot:prepend>
                    <v-icon>mdi-content-copy</v-icon>
                  </template>
                  <v-list-item-title>Copy contract address to clipboard</v-list-item-title>
                </v-list-item>
                <!-- <v-list-item @click="copyToClipboard(ensName);">
                  <template v-slot:prepend>
                    <v-icon>mdi-content-copy</v-icon>
                  </template>
                  <v-list-item-title>Copy ENS name to clipboard</v-list-item-title>
                </v-list-item> -->
                <v-list-item v-if="slug" :href="'https://opensea.io/collection/' + slug" target="_blank">
                  <template v-slot:prepend>
                    <v-icon>mdi-link-variant</v-icon>
                  </template>
                  <v-list-item-title>View collection in the OpenSea</v-list-item-title>
                </v-list-item>
                <v-list-item v-if="!contract" :href="explorer + 'address/' + address" target="_blank">
                  <template v-slot:prepend>
                    <v-icon>mdi-link-variant</v-icon>
                  </template>
                  <v-list-item-title>View address in the explorer</v-list-item-title>
                </v-list-item>
                <v-list-item v-if="contract" :href="explorer + 'address/' + contract" target="_blank">
                  <template v-slot:prepend>
                    <v-icon>mdi-link-variant</v-icon>
                  </template>
                  <v-list-item-title>View contract address in the explorer</v-list-item-title>
                </v-list-item>
                <v-list-item v-if="contract && address" :href="explorer + 'token/' + contract + '?a=' + address" target="_blank">
                  <template v-slot:prepend>
                    <v-icon>mdi-link-variant</v-icon>
                  </template>
                  <v-list-item-title>View contract as token in the explorer</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-btn><br />
          <v-chip variant="plain" class="ma-0 pa-0" style="min-width: 50px;">{{ contract == null ? "Ethereums" : (contract.substring(0, 8) + "..." + contract.slice(-6)) }}</v-chip>
          <v-chip variant="plain" class="ma-0 ml-1 pa-0">{{ contractTypeString }}</v-chip>
        </v-card-text>
      </div>
    </v-card>
  `,
  props: {
    type: {
      type: Number,
    },
    contractType: {
      type: String,
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
    contractTypeString() {
      if (this.contractType == "eth") {
        return "ETH";
      } else if (this.contractType == "erc20") {
        return "ERC-20";
      } else if (this.contractType == "erc721") {
        return "ERC-721";
      } else if (this.contractType == "erc1155") {
        return "ERC-1155";
      } else {
        return "Contract";
      }
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
    image() {
      if (this.type > 1) {
        if (this.contract && this.chainId in this.portfolioMetadata && this.contract in this.portfolioMetadata[this.chainId]) {
          const contract = this.portfolioMetadata[this.chainId][this.contract];
          return contract.collectionImage;
        }
      }
      return null;
    },
    slug() {
      if (this.type > 1) {
        if (this.contract && this.chainId in this.portfolioMetadata && this.contract in this.portfolioMetadata[this.chainId]) {
          const contract = this.portfolioMetadata[this.chainId][this.contract];
          return contract.collectionSlug;
        }
      }
      return null;
    },
    // ensName() {
    //   if (this.address && this.address in this.portfolioData && "1" in this.portfolioData[this.address]) {
    //     return this.portfolioData[this.address]["1"].ensName;
    //   }
    //   return null;
    // },
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


const PortfolioRenderBalance = {
  template: `
    <!-- <v-chip variant="plain" class="ma-0 pa-0" style="min-width: 50px;">{{ contract == null ? "Ethereums" : (contract.substring(0, 8) + "..." + contract.slice(-6)) }}</v-chip>
    <v-chip variant="plain" class="ma-0 ml-1 pa-0">{{ balance }}</v-chip>
    <v-chip variant="plain" class="ma-0 ml-1 pa-0">{{ decimals }}</v-chip> -->
    <div v-if="type <= 1">
      {{ formatUnits(balance, decimals) }} {{ symbol }}
    </div>
    <div v-else>
      {{ Object.keys(tokenData).join(", ") }}
    </div>
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
    balance: {
      type: String,
    },
    tokenData: {
      type: Object,
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
    symbol() {
      if (this.type == 0) {
        return "ETH";
      } else if (this.type == 1) {
        if (this.contract && this.chainId in this.portfolioMetadata && this.contract in this.portfolioMetadata[this.chainId]) {
          const contract = this.portfolioMetadata[this.chainId][this.contract];
          return contract.symbol || null;
        }
      } else {
        return null;
      }
    },
    decimals() {
      if (this.type == 0) {
        return 18;
      } else if (this.type == 1) {
        if (this.contract && this.chainId in this.portfolioMetadata && this.contract in this.portfolioMetadata[this.chainId]) {
          const contract = this.portfolioMetadata[this.chainId][this.contract];
          return contract.decimals || 0;
        }
      } else {
        return null;
      }
    },
    explorer() {
      return store.getters['web3/explorer'];
    },
  },
  methods: {
    copyToClipboard(str) {
      navigator.clipboard.writeText(str);
    },
    formatUnits(e, decimals) {
      if (e) {
        return ethers.utils.formatUnits(e, decimals).replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
      }
      return null;
    },
  },
};


const PortfolioRenderToken = {
  template: `
    <v-card flat class="d-flex">
      <div class="pa-1 flex-shrink-0" style="width: 140px;">
        <div v-if="type == 0">
          ETH
        </div>
        <div v-else-if="type == 1">
          {{ symbol }}
        </div>
        <div v-else>
          <v-img :src="image" alt="Card image"></v-img>
        </div>
      </div>
      <div class="pa-1 d-flex d-flex-shrink-1 d-flex-grow-0">
        <v-btn color="primary" dark variant="text" density="compact" :class="noXPadding ? 'ma-0 px-0 pt-2 lowercase-btn' : 'ma-0 px-2 pt-2 lowercase-btn'" style="min-width: 0px;">
          <div v-if="type <= 1">
            {{ formatUnits(balance, decimals) }}
          </div>
          <div v-else>
            {{ name }}
          </div>
          <v-menu activator="parent" location="bottom">
            <v-list>
              <v-list-subheader v-if="type <= 1">{{ symbol }}</v-list-subheader>
              <v-list-subheader v-if="type > 1">{{ name }}</v-list-subheader>

              <v-list-item v-if="type <= 1" @click="copyToClipboard(formatUnits(balance, decimals));">
                <template v-slot:prepend>
                  <v-icon>mdi-content-copy</v-icon>
                </template>
                <v-list-item-title>Copy value to clipboard</v-list-item-title>
              </v-list-item>
              <v-list-item v-if="type > 1" @click="copyToClipboard(name);">
                <template v-slot:prepend>
                  <v-icon>mdi-content-copy</v-icon>
                </template>
                <v-list-item-title>Copy name to clipboard</v-list-item-title>
              </v-list-item>
              <v-list-item v-if="type > 1" @click="copyToClipboard(tokenId);">
                <template v-slot:prepend>
                  <v-icon>mdi-content-copy</v-icon>
                </template>
                <v-list-item-title>Copy token id to clipboard</v-list-item-title>
              </v-list-item>

              <v-list-item v-if="type > 1" :href="opensea.replace(/chain/,'item') + contract + '/' + tokenId" target="_blank">
                <template v-slot:prepend>
                  <v-icon>mdi-link-variant</v-icon>
                </template>
                <v-list-item-title>View token in the OpenSea</v-list-item-title>
              </v-list-item>

              <v-list-item v-if="type > 1"  :href="explorer + 'nft/' + contract + '/' + tokenId" target="_blank">
                <template v-slot:prepend>
                  <v-icon>mdi-link-variant</v-icon>
                </template>
                <v-list-item-title>View token in the explorer</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-btn>
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
    balance: {
      type: String,
    },
    tokenId: {
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
    opensea() {
      return store.getters['web3/opensea'];
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
    portfolioENSData() {
      return store.getters['portfolio/ensData'];
    },
    symbol() {
      if (this.type == 0) {
        return "ETH";
      } else if (this.type == 1) {
        if (this.contract && this.chainId in this.portfolioMetadata && this.contract in this.portfolioMetadata[this.chainId]) {
          const contract = this.portfolioMetadata[this.chainId][this.contract];
          return contract.symbol || null;
        }
      } else {
        return null;
      }
    },
    name() {
      if (this.type == 0) {
        return "ETH";
      } else if (this.type == 1) {
        if (this.contract && this.chainId in this.portfolioMetadata && this.contract in this.portfolioMetadata[this.chainId]) {
          const contract = this.portfolioMetadata[this.chainId][this.contract];
          return contract.name || null;
        }
      } else {
        if (this.contract && this.chainId in this.portfolioMetadata && this.contract in this.portfolioMetadata[this.chainId]) {
          const contract = this.portfolioMetadata[this.chainId][this.contract];
          let name = contract && contract.tokens && contract.tokens[this.tokenId] && contract.tokens[this.tokenId].name;
          if ((name == null || name == "") && (this.contract == ENS_BASEREGISTRARIMPLEMENTATION_ADDRESS || this.contract == ENS_NAMEWRAPPER_ADDRESS)) {
            if (this.contract in this.portfolioENSData && this.tokenId in this.portfolioENSData[this.contract]) {
              name = this.portfolioENSData[this.contract][this.tokenId].name;
              // console.error(now() + " PortfolioRenderToken - computed.items - name: " + name);
            }
          }
          return name;
        }
      }
    },
    decimals() {
      if (this.type == 0) {
        return 18;
      } else if (this.type == 1) {
        if (this.contract && this.chainId in this.portfolioMetadata && this.contract in this.portfolioMetadata[this.chainId]) {
          const contract = this.portfolioMetadata[this.chainId][this.contract];
          return contract.decimals || 0;
        }
      }
      return null;
    },
    image() {
      if (this.type >= 1) {
        if (this.contract && this.chainId in this.portfolioMetadata && this.contract in this.portfolioMetadata[this.chainId]) {
          const contract = this.portfolioMetadata[this.chainId][this.contract];
          let image = contract && contract.tokens && contract.tokens[this.tokenId] && contract.tokens[this.tokenId].image;
          // if (!image) {
            if (this.contract == ENS_BASEREGISTRARIMPLEMENTATION_ADDRESS || this.contract == ENS_NAMEWRAPPER_ADDRESS) {
              return "https://metadata.ens.domains/mainnet/" + this.contract + "/" + this.tokenId + "/image";
            }
          // }
          return image;
        }
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
    formatUnits(e, decimals) {
      if (e) {
        return ethers.utils.formatUnits(e, decimals).replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
      }
      return null;
    },
  },
};
