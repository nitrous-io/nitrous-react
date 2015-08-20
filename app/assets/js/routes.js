import React from 'react';
import { Route } from 'react-router';
import Application from 'components/application';
import Login from 'components/login';
import Dashboard from 'components/dashboard';

export default (
  <Route name="application" path="/" handler={Application}>
    <Route name="login" handler={Login} />
    <Route name="dashboard" handler={Dashboard} />
  </Route>
);
