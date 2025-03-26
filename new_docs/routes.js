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
    path: '/contract/:inputAddress?',
    name: "Contract",
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
