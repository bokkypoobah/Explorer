const routes = [{
    path: '/transaction',
    component: Transaction,
    name: 'Transaction',
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
