import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { Input, ButtonInput, Button } from 'react-bootstrap';
import classNames from 'classnames';

import LeftBar from 'components/left-bar';
import tokenStore from 'stores/token-store';
import tokenActions from 'actions/token-actions';
import snackbarActions from 'actions/snackbar-actions';
import { ajax }  from 'lib/ajax';

export default class Login extends React.Component {
  displayName = 'Login';

  static propTypes = {
    query: PropTypes.shape({
      token: PropTypes.string
    })
  };

  static contextTypes = {
    router: React.PropTypes.func.isRequired // Router.PropTypes.router.isRequired
  };

  static willTransitionTo(transition) {
    if (tokenStore.token) {
      transition.redirect('dashboard');
    }
  }

  state = {
    loggingIn: !!this.props.query.token,
    loggingInWithGithub: false,
    errorMessage: null
  };

  componentDidMount() {
    tokenStore.onChange(this.tokenStoreDidChange);
    if (this.props.query.token) {
      tokenActions.setToken(this.props.query.token);
    } else {
      this.refs.username.getInputDOMNode().focus();
    }
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

  actionsDisabled = () => {
    const { loggingInWithGithub, loggingIn } = this.state;
    return loggingIn || loggingInWithGithub;
  }

  handleSubmit = (evt) => {
    evt.preventDefault();
    this.setState({ loggingIn: true, errorMessage: null });
    tokenActions.fetch(this.refs.username.getValue(), this.refs.password.getValue());
  };

  handleLoginWithGithub = () => {
    this.setState({ loggingInWithGithub: true });

    ajax({
      type: 'POST',
      url: '/api/v0/github/authorize_to_login',
      cache: false,
      data: { beta: true }
    }).then((json) => {
      window.location.href = json.redirect_url;
    }).catch(() => {
      snackbarActions.post('Unable to connect to GitHub. Please try again.');
    });
  }

  render() {
    const { loggingIn, errorMessage } = this.state,
          loginLabel = loggingIn ? 'Logging In...' : 'Log In',
          formPanelClasses = classNames('form-panel', { shake: errorMessage }),
          disabled = this.actionsDisabled();

    return (
      <div className='login-component login-screen dark'>
        <LeftBar />
        <div className={formPanelClasses}>
          <h2 className='nitrous-logo'></h2>
          <form onSubmit={this.handleSubmit}>
            <Input ref='username' type='text' placeholder='Username or Email' required disabled={disabled} />
            <Input ref='password' type='password' placeholder='Password' required disabled={disabled} />
            <div className='actions inline'>
              <ButtonInput type='submit' bsStyle='primary' value={loginLabel} disabled={disabled} />
              <Button onClick={this.handleLoginWithGithub} className='github' type='button' value='Log in with GitHub' disabled={disabled} />
            </div>
          </form>
          <p>No account? <Link to='signup'>Sign Up</Link></p>
          <p><Link to='forgot-password'>Forgot Your Password?</Link></p>
        </div>
      </div>
    );
  }
}
