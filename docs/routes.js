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
    children: [
      {
        path: '',
        name: "AddressSummary",
        component: AddressSummary,
        props: true,
      },
      {
        path: 'summary',
        name: "AddressSummary",
        component: AddressSummary,
        props: true,
      },
      {
        path: 'contract',
        name: "AddressContract",
        component: AddressContract,
        props: true,
      },
      {
        path: 'functions',
        name: "AddressFunctions",
        component: AddressFunctions,
        props: true,
      },
      {
        path: 'tokens',
        name: "Tokens",
        component: AddressTokens,
        props: true,
      },
      {
        path: 'transactions',
        name: "Transactions",
        component: AddressTransactions,
        props: true,
      },
      {
        path: 'events',
        name: "Events",
        component: AddressEvents,
        props: true,
      },
    ],
  },
  {
    path: '/name/:inputName?',
    name: "Name",
    component: Name,
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
