import React from 'react';
import { Link } from 'react-router';
import LeftBar from 'components/left-bar';
import { Alert, Input, ButtonInput } from 'react-bootstrap';
import tokenStore from 'stores/token-store';
import tokenActions from 'actions/token-actions';
import classNames from 'classnames';

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
      this.context.router.transitionTo('dashboard');
    } else if (tokenStore.lastError) {
      this.setState({
        loggingIn: false,
        errorMessage: tokenStore.lastError
      }, () => {
        const usernameInput = this.refs.username.getInputDOMNode();
        usernameInput.select();
        usernameInput.focus();
      });
    }
  }

  handleSubmit = (evt) => {
    evt.preventDefault();
    this.setState({loggingIn: true, errorMessage: null});
    tokenActions.fetch(this.refs.username.getValue(), this.refs.password.getValue());
  };

  render() {
    const loggingIn = this.state.loggingIn,
          loginLabel = loggingIn ? 'Logging In...' : 'Log In';

    var formPanelClasses = classNames('form-panel');

    let error;
    if (this.state.errorMessage) {
      formPanelClasses = classNames('shake', 'form-panel');
      error = (
        <Alert bsStyle='default'>{this.state.errorMessage}</Alert>
      );
    }

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
          <p>No account? <a href="/#/signup">Sign Up</a></p>
          <p><Link to='forgot-password'>Forgot Your Password?</Link></p>
        </div>
        <div className="form-notifications">
          {error}
        </div>
      </div>
    );
  }
}
