import React from 'react';
import { Route, DefaultRoute, Redirect } from 'react-router';
import Application from 'components/application';
import Login from 'components/login';
import Dashboard from 'components/dashboard';
import Containers from 'components/containers';

export default (
  <Route name="application" path="/" handler={Application}>
    <Route name="login" handler={Login} />
    <Route name="dashboard" handler={Dashboard}>
      <DefaultRoute name="containers" handler={Containers} />
    </Route>
    <Redirect to="dashboard" />
  </Route>
);
