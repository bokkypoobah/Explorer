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
    path: '/address/:inputAddress?/contract',
    name: "Contract",
    component: Contract,
    props: true,
  },
  {
    path: '/address/:inputAddress?/tokens',
    name: "Tokens",
    component: Contract,
    props: true,
  },
  {
    path: '/address/:inputAddress?/transactions',
    name: "Transactions",
    component: Contract,
    props: true,
  },
  {
    path: '/address/:inputAddress?/events',
    name: "Events",
    component: Contract,
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
