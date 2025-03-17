const routes = [{
    path: '/transaction',
    component: Transaction,
    name: 'Transaction',
  }, {
    path: '/home',
    component: Welcome,
    name: ''
  }, {
    path: '*',
    redirect: '/home',
  }
];
