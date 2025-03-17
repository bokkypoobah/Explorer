const routes = [{
    path: '/tx/:txHash?',
    component: Transaction,
    name: 'Transaction',
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
