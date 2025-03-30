const routes = [
  {
    path: '/block/:inputBlockNumber?',
    name: "Block",
    component: Block,
    props: true,
  },
  {
    path: '/transaction/:inputTxHash?',
    name: "Transaction",
    component: Transaction,
    props: true,
  },
  {
    path: '/address/:inputAddress?',
    name: "Address",
    component: Address,
    props: true,
  },
  {
    path: '/address/:inputAddress?/abi',
    name: "AddressABI",
    component: AddressABI,
    props: true,
  },
  {
    path: '/address/:inputAddress?/sourcecode',
    name: "AddressSourceCode",
    component: AddressSourceCode,
    props: true,
  },
  {
    path: '/address/:inputAddress?/functions',
    name: "AddressFunctions",
    component: AddressFunctions,
    props: true,
  },
  {
    path: '/address/:inputAddress?/tokens',
    name: "Tokens",
    component: AddressTokens,
    props: true,
  },
  {
    path: '/address/:inputAddress?/transactions',
    name: "Transactions",
    component: AddressTransactions,
    props: true,
  },
  {
    path: '/address/:inputAddress?/events',
    name: "Events",
    component: AddressEvents,
    props: true,
  },
  {
    path: '/config',
    name: "Config",
    component: Config,
  },
  {
    path: "/",
    name: "Home",
    component: Home,
  },
];
