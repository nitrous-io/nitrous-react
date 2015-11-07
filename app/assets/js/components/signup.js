import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { Alert, ButtonInput, Input, Button } from 'react-bootstrap';
import classNames from 'classnames';

import Fa from 'components/fa';
import tokenActions from 'actions/token-actions';
import userActions from 'actions/user-actions';
import tokenStore from 'stores/token-store';
import userStore from 'stores/user-store';
import { randomPassword } from 'lib/random';
import snackbarActions from 'actions/snackbar-actions';

export default class Signup extends React.Component {
  displayName = 'Signup';

  static propTypes = {
    query: PropTypes.shape({
      gitHubUserName: PropTypes.string,
      gitHubUserEmail: PropTypes.string
    })
  };

  static contextTypes = {
    router: React.PropTypes.func.isRequired
  };

  constructor(props, context) {
    super(props, context);

    const isViaGitHub = props.query.gitHubUserName &&
                        props.query.gitHubUserEmail;
    let password = null,
        username = null,
        email = null;
    if (isViaGitHub) {
      password = randomPassword();
      username = props.query.gitHubUserName;
      email = props.query.gitHubUserEmail;
    }

    this.state = {
      username,
      email,
      password,
      passwordConfirmation: password,
      processing: false,
      authorizing: false,
      errorMessage: null,
      isViaGitHub,
      gitHubUserName: (isViaGitHub && props.query.gitHubUserName || null)
    };
  }

  componentDidMount() {
    userStore.on('created', this.onUserCreated);
    userStore.on('create-failed', this.onUserCreateFailed);
    tokenStore.onChange(this.tokenStoreDidChange);
  }

  componentWillUnmount() {
    userStore.off('created', this.onUserCreated);
    userStore.off('create-failed', this.onUserCreateFailed);
    tokenStore.offChange(this.tokenStoreDidChange);
  }

  onUserCreated = (data) => {
    const { username } = data;
    tokenActions.fetch(username, this.state.password);
  }

  onUserCreateFailed = () => {
    this.setState({ processing: false, errorMessage: userStore.lastError });
  }

  tokenStoreDidChange = () => {
    if (tokenStore.token) {
      this.context.router.transitionTo('dashboard');
    }
    // Ignore failure to get token because we assume that we are able to login
    // with the newly created account.
  }

  handleUsernameChanged = (event) => {
    this.setState({ username: event.target.value });
  }

  handleEmailChanged = (event) => {
    this.setState({ email: event.target.value });
  }

  handlePasswordChanged = (event) => {
    this.setState({ password: event.target.value });
  }

  handlePasswordConfirmationChanged = (event) => {
    this.setState({ passwordConfirmation: event.target.value });
  }

  handleSubmit = (event) => {
    event.preventDefault();
    if (this.submitDisabled()) {
      return;
    }

    this.setState({ processing: true });

    const { username, email, password, gitHubUserName } = this.state;
    userActions.create({ username, email, password, gitHubUserName });
  }

  handleSignupWithGithub = () => {
    this.setState({ authorizing: true });

    userActions.signupViaGithub().then((json) => {
      window.location.href = json.redirect_url;
    }).catch(() => {
      snackbarActions.post('Unable to connect to GitHub. Please try again.');
    });
  }

  submitDisabled = () => {
    const { authorizing, processing, username, email, password, passwordConfirmation } = this.state;
    if (authorizing) {
      return true;
    }

    const missing = ![username, email, password, passwordConfirmation].every((elem) => {
      return elem;
    });
    return missing || processing || (password !== passwordConfirmation);
  }

  render() {
    const { isViaGitHub, username, email, password, passwordConfirmation, authorizing, processing, errorMessage } = this.state,
          showPasswordConfirmError = passwordConfirmation && (password !== passwordConfirmation),
          formPanelClasses = classNames('form-panel', { shake: errorMessage });

    return (
      <div className='signup-component login-screen'>
        <div className={formPanelClasses}>
          <h2 className='nitrous-logo'></h2>
          {isViaGitHub ? (
            <Alert bsStyle="success">
              <strong>Awesome!</strong> Check your information below.
            </Alert>
          ) : ''}
          <form onSubmit={this.handleSubmit}>
            <Input type='text' placeholder='Username' required
              value={username}
              onChange={this.handleUsernameChanged} />
            <Input type='email' placeholder='Email' required
              value={email}
              onChange={this.handleEmailChanged} />
            {isViaGitHub ? '' : (
              <Input type='password' placeholder='Password' required
                value={password}
                onChange={this.handlePasswordChanged} />
            )}
            {isViaGitHub ? '' : (
              <Input type='password' placeholder='Password, again' required
                value={passwordConfirmation}
                help={showPasswordConfirmError ? 'Passwords do not match' : null}
                onChange={this.handlePasswordConfirmationChanged} />
            )}

            <div className='actions'>
              <ButtonInput type='submit' bsStyle='primary'
                disabled={this.submitDisabled()}>
                {processing ? 'Creating...' : 'Create Account'}
              </ButtonInput>
            </div>
          </form>

          {isViaGitHub ? '' : (
            <div className='github-signup actions'>
              <div className='form-group'>
                <Button className='primary-btn' onClick={this.handleSignupWithGithub} type='button' disabled={processing}>
                  <Fa icon='github' /> {authorizing ? 'Connecting....' : 'Signup with GitHub'}
                </Button>
              </div>
            </div>
          )}

          <p>By creating an account, you agree to the Nitrous <a href='https://community.nitrous.io/docs/terms-of-use'>Terms of Service</a> and <a href='https://community.nitrous.io/docs/privacy-policy'>Privacy Policy</a>.</p>
          <p>Already have an account? <Link to='login'>Log in</Link></p>
        </div>
      </div>
    );
  }

}
