const routes = [{
    path: '/block/:blockNumber?',
    component: Block,
    name: 'Block',
    props: true,
  }, {
    path: '/tx/:txHash?',
    component: Transaction,
    name: 'Transaction',
    props: true,
  }, {
    path: '/address/:inputAddress?',
    component: Address,
    name: 'Address',
    props: true,
  }, {
    path: '/contract/:inputAddress?',
    component: Contract,
    name: 'Contract',
    props: true,
  }, {
    path: '/config',
    component: Config,
    name: 'Config',
  }, {
    path: '/home',
    component: Welcome,
    name: ''
  }, {
    path: '*',
    redirect: '/home',
  }
];
