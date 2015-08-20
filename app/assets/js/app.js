import React from 'react';
import Router from 'react-router';
import routes from 'routes';
import $ from 'jquery';

$(function() {
  Router.run(routes, function(Handler) {
    React.render(
      <Handler />,
      document.getElementById('application')
    );
  });
});
