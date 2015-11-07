import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { Alert, Input, ButtonToolbar, ButtonInput, Button, Panel, OverlayTrigger, Tooltip } from 'react-bootstrap';
import Fa from 'components/fa';
import classNames from 'classnames';

import tokenStore from 'stores/token-store';
import tokenActions from 'actions/token-actions';
import userActions from 'actions/user-actions';
import snackbarActions from 'actions/snackbar-actions';

export default class Login extends React.Component {
  displayName = 'Login';

  static propTypes = {
    query: PropTypes.shape({
      token: PropTypes.string,
      existingGitHubEmail: PropTypes.string
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
    tokenStore.transitionedFromResendConfirmation();
    tokenStore.onChange(this.tokenStoreDidChange);

    if (this.props.query.token) {
      tokenActions.setToken(this.props.query.token);
    }

    if (!this.props.query.existingGitHubEmail) {
      this.refs.password.getInputDOMNode().focus();
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

      // we then automatically perform the connect for them
      // if not connected but emails match
      if (this.props.query.existingGitHubEmail) {
        userActions.connectToGitHub().then((data) => {
          window.location.href = data.redirect_url;
        }).catch(() => {
          snackbarActions.post('Could not connect to GitHub. Please try again.', 'error');
          this.context.router.transitionTo('dashboard');
        });
        return;
      }

      this.context.router.transitionTo('dashboard');
    } else if (tokenStore.lastError) {
      snackbarActions.post(tokenStore.lastError, 'warning');
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

  handleLoginWithGithub = () => {
    this.setState({ loggingInWithGithub: true });

    userActions.loginViaGithub().then((json) => {
      window.location.href = json.redirect_url;
    }).catch(() => {
      snackbarActions.post('Could not connect to GitHub. Please try again.', 'error');
    });
  }

  render() {
    const { loggingIn, loggingInWithGithub, errorMessage } = this.state,
          { existingGitHubEmail } = this.props.query,
          disabled = loggingIn || loggingInWithGithub;

    return (
      <div className='login-component login-screen'>
        <Panel className={classNames({ shake: errorMessage })}>
          <h2 className='nitrous-logo'><span>Nitrous</span></h2>

          {existingGitHubEmail ? (
            <Alert bsStyle='warning'>
              An account that is associated with your email address already exists.
              <br /><br />
              Please log in to the existing account to connect with GitHub.
            </Alert>
          ) : ''}
          <form onSubmit={this.handleSubmit}>
            <Input ref='username' value={existingGitHubEmail} type='text' placeholder='Username or Email' required disabled={disabled} />
            <Input ref='password' type='password' placeholder='Password' required disabled={disabled} />
            <ButtonToolbar>
              <ButtonInput type='submit' bsStyle='primary' value={
                loggingIn ? 'Logging In...' : 'Log In'
              } disabled={disabled} />
              <OverlayTrigger placement='bottom' overlay={<Tooltip id='container-state-tooltip'>Log in with GitHub account</Tooltip>}>
                <Button onClick={this.handleLoginWithGithub} className='github-btn' disabled={disabled}>
                  <Fa icon='github' />
                  <span className='text'>Log in with GitHub</span>
                </Button>
              </OverlayTrigger>
            </ButtonToolbar>
          </form>
          <div className='links'>
            <p>No account? <Link to='signup'>Sign Up</Link></p>
            <p><Link to='forgot-password'>Forgot Your Password?</Link></p>
          </div>
        </Panel>
      </div>
    );
  }
}
