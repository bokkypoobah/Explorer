const AddressAddress = {
  template: `
    <v-card>
      <v-card-text>

        <v-row no-gutters dense>
          <v-col cols="2" align="right">
            <p class="my-2">Address:</p>
          </v-col>
          <v-col cols="6" align="left">
            <render-address :address="address"></render-address>
          </v-col>
        </v-row>
        <v-row no-gutters dense>
          <v-col cols="2" align="right">
            <p class="my-2">Type:</p>
          </v-col>
          <v-col cols="6" align="left">
            <v-btn variant="text" class="lowercase-btn ma-0 px-2" style="min-width: 0px;">
              {{ type && types[type] }}
            </v-btn>
          </v-col>
        </v-row>
        <v-row v-if="type == 'erc20'" no-gutters dense>
          <v-col cols="2" align="right">
            <p class="my-2">Symbol:</p>
          </v-col>
          <v-col cols="6" align="left">
            <v-btn variant="text" class="lowercase-btn ma-0 px-2" style="min-width: 0px;">
              {{ symbol }}
            </v-btn>
          </v-col>
        </v-row>
        <v-row v-if="type == 'erc20' || type == 'erc721' || type == 'erc1155'" no-gutters dense>
          <v-col cols="2" align="right">
            <p class="my-2">Name:</p>
          </v-col>
          <v-col cols="6" align="left">
            <v-btn variant="text" class="lowercase-btn ma-0 px-2" style="min-width: 0px;">
              {{ name }}
            </v-btn>
          </v-col>
        </v-row>
        <v-row v-if="type == 'erc20'" no-gutters dense>
          <v-col cols="2" align="right">
            <p class="my-2">Decimals:</p>
          </v-col>
          <v-col cols="6" align="left">
            <v-btn variant="text" class="lowercase-btn ma-0 px-2" style="min-width: 0px;">
              {{ decimals }}
            </v-btn>
          </v-col>
        </v-row>
        <v-row v-if="type == 'erc20'" no-gutters dense>
          <v-col cols="2" align="right">
            <p class="my-2">Total Supply:</p>
          </v-col>
          <v-col cols="6" align="left">
            <v-btn variant="text" class="lowercase-btn ma-0 px-2" style="min-width: 0px;">
              {{ formatUnits(totalSupply, decimals) }}
            </v-btn>
          </v-col>
        </v-row>
        <v-row v-if="type == 'eoa' || type == 'contract'" no-gutters dense>
          <v-col cols="2" align="right">
            <p class="my-2">ENS Name:</p>
          </v-col>
          <v-col cols="6" align="left">
            <v-btn variant="text" class="lowercase-btn ma-0 px-2" style="min-width: 0px;">
              {{ ensName }}
            </v-btn>
          </v-col>
        </v-row>
        <v-row no-gutters dense>
          <v-col cols="2" align="right">
            <p class="my-2">Balance (Ξ):</p>
          </v-col>
          <v-col cols="6" align="left">
            <v-btn variant="text" class="lowercase-btn ma-0 px-2" style="min-width: 0px;">
              {{ formatETH(balance) }}
            </v-btn>
          </v-col>
        </v-row>
        <v-row v-if="type == 'eoa'" no-gutters dense>
          <v-col cols="2" align="right">
            <p class="my-2">Transaction Count:</p>
          </v-col>
          <v-col cols="6" align="left">
            <v-btn variant="text" class="lowercase-btn ma-0 px-2" style="min-width: 0px;">
              {{ commify0(transactionCount) }}
            </v-btn>
          </v-col>
        </v-row>

        <!-- <h3 class="ms-2 mt-2">Address {{ address }}</h3> -->
        <v-textarea :model-value="JSON.stringify(info, null, 2)" label="Info" rows="20">
        </v-textarea>
        <!-- <v-textarea :model-value="JSON.stringify(functions, null, 2)" label="Functions" rows="10">
        </v-textarea>
        <v-textarea :model-value="JSON.stringify(events, null, 2)" label="Events" rows="10">
        </v-textarea> -->
        <!-- info: {{ info }}
        <br />
        address: {{ address }}
        <br />
        transactionCount: {{ transactionCount }}
        <br />
        balance: {{ balance }} -->
      </v-card-text>
      <!-- <v-card-actions>
        <v-btn>Action 1</v-btn>
        <v-btn>Action 2</v-btn>
      </v-card-actions> -->
    </v-card>
  `,
  props: ['inputAddress', 'tab'],
  data: function () {
    return {
      // tab: null,
      // address: null,
      types: {
        "eoa" : "Externally Owned Account",
        "erc20": "ERC-20 Fungible Token Contract",
        "erc721": "ERC-721 Non-Fungible Token Contract",
        "erc1155": "ERC-1155 Non-Fungible Token Contract",
        "contract": "Smart Contract",
        "safe": "Gnosis Safe",
      },
    };
  },
  computed: {
    address() {
      return store.getters['address/address'];
    },
    info() {
      return store.getters['address/info'];
    },
    type() {
      return this.info && this.info.type || null;
    },
    symbol() {
      return this.info && this.info.symbol || null;
    },
    name() {
      return this.info && this.info.name || null;
    },
    decimals() {
      return this.info && this.info.decimals || null;
    },
    totalSupply() {
      return this.info && this.info.totalSupply || null;
    },
    ensName() {
      return this.info && this.info.ensName || null;
    },
    balance() {
      return this.info && this.info.balance || null;
    },
    transactionCount() {
      return this.info && this.info.transactionCount || null;
    },
    functions() {
      return store.getters['address/functions'];
    },
    events() {
      return store.getters['address/events'];
    },
  },
  methods: {
    formatETH(e) {
      if (e) {
        return ethers.utils.formatEther(e).replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
      }
      return null;
    },
    formatUnits(e, decimals) {
      if (e) {
        return ethers.utils.formatUnits(e, decimals).replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
      }
      return null;
    },
    commify0(n) {
      if (n != null) {
        return Number(n).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
      }
      return null;
    },
  },
  beforeCreate() {
    console.log(now() + " AddressAddress - beforeCreate");
	},
  mounted() {
    console.log(now() + " AddressAddress - mounted - inputAddress: " + this.inputAddress);
    // const t = this;
    // setTimeout(function() {
    //   store.dispatch('address/loadAddress', { inputAddress: t.inputAddress, forceUpdate: false });
    // }, 1000);
	},
  unmounted() {
    console.log(now() + " AddressAddress - unmounted");
	},
  destroyed() {
    console.log(now() + " AddressAddress - destroyed");
	},
};
