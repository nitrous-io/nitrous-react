import React from 'react';
import { Link } from 'react-router';
import { Input, ButtonInput } from 'react-bootstrap';
import classNames from 'classnames';

import LeftBar from 'components/left-bar';
import tokenStore from 'stores/token-store';
import tokenActions from 'actions/token-actions';
import snackbarActions from 'actions/snackbar-actions';

export default class Login extends React.Component {
  displayName = 'Login';

  static contextTypes = {
    router: React.PropTypes.func.isRequired // Router.PropTypes.router.isRequired
  };

  static willTransitionTo(transition) {
    if (tokenStore.token) {
      transition.redirect('dashboard');
    }
  }

  state = {
    loggingIn: false,
    errorMessage: null
  };

  componentDidMount() {
    tokenStore.onChange(this.tokenStoreDidChange);
    this.refs.username.getInputDOMNode().focus();
  }

  componentWillUnmount() {
    tokenStore.offChange(this.tokenStoreDidChange);
  }

  tokenStoreDidChange = () => {
    if (tokenStore.token) {
      snackbarActions.clear();
      this.context.router.transitionTo('dashboard');
    } else if (tokenStore.lastError) {
      snackbarActions.post(tokenStore.lastError);
      this.setState({ loggingIn: false }, () => {
        const usernameInput = this.refs.username.getInputDOMNode();
        usernameInput.select();
        usernameInput.focus();
      });
    }
  }

  handleSubmit = (evt) => {
    evt.preventDefault();
    this.setState({ loggingIn: true, errorMessage: null });
    tokenActions.fetch(this.refs.username.getValue(), this.refs.password.getValue());
  };

  render() {
    const { loggingIn, errorMessage } = this.state,
          loginLabel = loggingIn ? 'Logging In...' : 'Log In',
          formPanelClasses = classNames('form-panel', { shake: errorMessage });

    return (
      <div className='login-component login-screen dark'>
        <LeftBar />
        <div className={formPanelClasses}>
          <h2 className='nitrous-logo'></h2>
          <form onSubmit={this.handleSubmit}>
            <Input ref='username' type='text' placeholder='Username or Email' required disabled={loggingIn} />
            <Input ref='password' type='password' placeholder='Password' required disabled={loggingIn} />
            <div className='actions'>
              <ButtonInput type='submit' bsStyle='primary' value={loginLabel} disabled={loggingIn} />
              <a href="#" className="btn github">Log in with GitHub</a>
            </div>
          </form>
          <p>No account? <Link to='signup'>Sign Up</Link></p>
          <p><Link to='forgot-password'>Forgot Your Password?</Link></p>
        </div>
      </div>
    );
  }
}
