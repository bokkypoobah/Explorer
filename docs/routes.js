const routes = [
  {
    path: '/blocks/:inputBlockNumber?',
    name: "Blocks",
    component: Blocks,
    // props: true,
    children: [
      {
        path: 'latest',
        name: "BlocksLatest",
        component: BlocksLatest,
        // props: true,
      },
      {
        path: 'browse',
        name: "BlocksBrowse",
        component: BlocksBrowse,
        // props: true,
      },
    ],
  },
  {
    path: '/transactions/:inputBlockNumber?',
    name: "Transactions_",
    component: Transactions_, // Issue using `Transactions`, maybe due to a clash
    // props: true,
    children: [
      {
        path: 'latest',
        name: "TransactionsLatest",
        component: TransactionsLatest,
        // props: true,
      },
      // {
      //   path: 'search',
      //   name: "BlocksBrowse",
      //   component: BlocksBrowse,
      //   // props: true,
      // },
    ],
  },
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
        name: "AddressAddress",
        component: AddressAddress,
        props: true,
      },
      // {
      //   path: 'summary',
      //   name: "AddressAddress",
      //   component: AddressAddress,
      //   props: true,
      // },
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
    path: '/token/:inputAddress?',
    name: "Token",
    component: Token,
    props: true,
  },
  {
    path: '/punks/:inputPunkId?',
    name: "Punks",
    component: Punks,
    props: true,
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
