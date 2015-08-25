import React from 'react';
import { Route, DefaultRoute } from 'react-router';
import Application from 'components/application';
import Login from 'components/login';
import Dashboard from 'components/dashboard';
import Inventory from 'components/inventory';

export default (
  <Route name='application' path='/' handler={Application}>
    <DefaultRoute handler={redirectTo('dashboard')} />
    <Route name='login' handler={Login} />

    <Route name='dashboard' handler={Dashboard}>
      <DefaultRoute handler={redirectTo('inventory')} />
      <Route name='inventory' handler={Inventory} />
    </Route>
  </Route>
);

function redirectTo(route, params, query) {
  return class extends React.Component {
    static willTransitionTo(transition) {
      transition.redirect(route, params, query);
    }
  };
}
