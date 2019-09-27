// src/App.js


import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Security, SecureRoute, ImplicitCallback } from '@okta/okta-react';
import Home from './Home';
import Login from './Login';
import Protected from './Protected';

function onAuthRequired({history}) {
  history.push('/login');
}

// See config-overrides.js
/* global WIDGET_TEST_SERVER, WIDGET_AUTH_SERVER_ID, WIDGET_CLIENT_ID */
class App extends Component {
  render() {
    return (
      <Router>
        <Security issuer={`${WIDGET_TEST_SERVER}/oauth2/${WIDGET_AUTH_SERVER_ID}`}
                  client_id={WIDGET_CLIENT_ID}
                  redirect_uri={window.location.origin + '/implicit/callback'}
                  onAuthRequired={onAuthRequired} >
          <Route path='/' exact={true} component={Home} />
          <SecureRoute path='/protected' component={Protected} />
          <Route path='/login' render={() => <Login baseUrl={WIDGET_TEST_SERVER} />} />
          <Route path='/implicit/callback' component={ImplicitCallback} />
        </Security>
      </Router>
    );
  }
}

export default App;
