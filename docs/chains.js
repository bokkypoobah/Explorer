// OpenSea URLs from https://docs.opensea.io/reference/list_collections

const CHAINS = {
  // ETH Mainnet
  "1": {
      name: "Ethereum Mainnet",
      explorer: "https://etherscan.io/",
      api: "https://api.etherscan.io/v2/api?chainid=1",
      reservoir: "https://api.reservoir.tools/",
      opensea: "https://opensea.io/chain/ethereum/",
    },
  // Sepolia Testnet
  "11155111": {
    name: "Sepolia Testnet",
    explorer: "https://sepolia.etherscan.io/",
    api: "https://api.etherscan.io/v2/api?chainid=11155111",
    reservoir: "https://api-sepolia.reservoir.tools/",
    opensea: null,
  },
  // Arbitrum One Mainnet
  "42161": {
    name: "Arbitrum One Mainnet",
    explorer: "https://arbiscan.io/",
    api: "https://api.etherscan.io/v2/api?chainid=42161",
    reservoir: "https://api-arbitrum.reservoir.tools/",
    opensea: "https://opensea.io/chain/arbitrum/",
  },
  // Arbitrum Nova Mainnet
  "42170": {
    name: "Arbitrum Nova Mainnet",
    explorer: "https://nova.arbiscan.io/",
    api: "https://api.etherscan.io/v2/api?chainid=42170",
    reservoir: "https://api-arbitrum-nova.reservoir.tools/",
    opensea: "https://opensea.io/chain/arbitrum_nova/",
  },
  // Base Mainnet
  "8453": {
    name: "Base Mainnet",
    explorer: "https://basescan.org/",
    api: "https://api.etherscan.io/v2/api?chainid=8453",
    reservoir: "https://api-base.reservoir.tools/",
    opensea: "https://opensea.io/chain/base/",
  },
  // Base Sepolia
  "84532": {
    name: "Arbitrum Nova Mainnet",
    explorer: "https://sepolia.basescan.org/",
    api: "https://api.etherscan.io/v2/api?chainid=84532",
    reservoir: "https://api-base-sepolia.reservoir.tools/",
    opensea: null,
  },
  // Linea Mainnet
  "59144": {
    name: "Linea Mainnet",
    explorer: "https://lineascan.build/",
    api: "https://api.etherscan.io/v2/api?chainid=59144",
    reservoir: "https://api-linea.reservoir.tools/",
    opensea: null,
  },
  // OP Mainnet
  "10": {
    name: "OP Mainnet",
    explorer: "https://optimistic.etherscan.io/",
    api: "https://api.etherscan.io/v2/api?chainid=10",
    reservoir: "https://api-optimism.reservoir.tools/",
    opensea: "https://opensea.io/chain/optimism/",
  },
  // Polygon
  "137": {
    name: "Polygon",
    explorer: "https://polygonscan.com/",
    api: "https://api.etherscan.io/v2/api?chainid=137",
    reservoir: "https://api-polygon.reservoir.tools/",
    opensea: null,
  },
  // Hardhat Node
  "31337": {
    name: "Hardhat Node",
    explorer: null,
    api: null,
    reservoir: null,
    opensea: null,
  },
};
