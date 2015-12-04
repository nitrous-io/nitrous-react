import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { Alert, ButtonToolbar, ButtonInput, Input, Button, Panel, OverlayTrigger, Tooltip } from 'react-bootstrap';

import Fa from 'components/fa';
import tokenActions from 'actions/token-actions';
import userActions from 'actions/user-actions';
import tokenStore from 'stores/token-store';
import userStore from 'stores/user-store';
import { randomPassword } from 'lib/random';
import snackbarActions from 'actions/snackbar-actions';
import Mp from 'lib/mp';
import MpEvents from 'lib/mp-events';
import promocodeActions from 'actions/promocode-actions';
import promocodeStore from 'stores/promocode-store';

export default class Signup extends React.Component {
  displayName = 'Signup';

  static propTypes = {
    query: PropTypes.shape({
      intent: PropTypes.string,
      gitHubUserName: PropTypes.string,
      gitHubUserEmail: PropTypes.string,
      promo: PropTypes.string
    })
  };

  static contextTypes = {
    router: React.PropTypes.func.isRequired
  };

  static willTransitionTo() {
    Mp.track(MpEvents.EventViewedSignup);
  }

  constructor(props, context) {
    if (!props.query.promo) {
      props.query.promo = localStorage.getItem('signup-promo');
    } else {
      localStorage.setItem('signup-promo', props.query.promo);
    }
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
      isViaGitHub,
      gitHubUserName: isViaGitHub ? props.query.gitHubUserName : null,
      createOrg: this.props.query.intent === 'org'
    };
  }

  componentWillReceiveProps(nextProps) {
    this.loadPromoCode(nextProps);
  }

  componentDidMount() {
    userStore.on('created', this.onUserCreated);
    userStore.on('create-failed', this.onUserCreateFailed);
    promocodeStore.onChange(this.promocodeStoreDidChange);
    tokenStore.onChange(this.tokenStoreDidChange);

    this.loadPromoCode();
  }

  componentWillUnmount() {
    userStore.off('created', this.onUserCreated);
    userStore.off('create-failed', this.onUserCreateFailed);
    promocodeStore.offChange(this.promocodeStoreDidChange);
    tokenStore.offChange(this.tokenStoreDidChange);
  }

  loadPromoCode = (props=this.props) => {
    const { promo } = props.query;
    if (promo) {
      promocodeActions.fetchBySlug(promo);
    } else {
      this.setState({ promocode: null });
    }
  }

  promocodeStoreDidChange = () => {
    const { promo } = this.props.query;
    if (!promo) {
      this.setState({ promocode: null });
    }
    const promocode = promocodeStore.promocodeBySlug(promo, true);
    this.setState({ promocode });
  }

  onUserCreated = (data) => {
    const { username } = data;
    Mp.track(MpEvents.EventUserSignedUp);
    tokenActions.fetch(username, this.state.password);
  }

  onUserCreateFailed = () => {
    this.setState({ processing: false });
  }

  tokenStoreDidChange = () => {
    if (!tokenStore.token) {
      // Ignore failure to get token because we assume that we are able to login
      // with the newly created account.
      return;
    }

    localStorage.setItem('signup-promo', null);

    if (this.state.createOrg) {
      this.context.router.transitionTo('new-org');
      return;
    }
    this.context.router.transitionTo('dashboard');
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

  handleCreateOrgChanged = (event) => {
    this.setState({ createOrg: event.target.checked });
  }

  handleSubmit = (event) => {
    event.preventDefault();

    this.setState({ processing: true });

    const { username, email, password, gitHubUserName, promocode } = this.state,
          promocodeSlug = promocode && promocode.slug;
    userActions.create({ username, email, password, gitHubUserName, promocodeSlug });
  }

  handleSignupWithGithub = () => {
    this.setState({ authorizing: true });

    userActions.signupViaGithub().then((json) => {
      window.location.href = json.redirect_url;
    }).catch(() => {
      snackbarActions.post('Unable to connect to GitHub. Please try again.');
    });
  }

  render() {
    const { isViaGitHub, username, email, password, passwordConfirmation,
            authorizing, processing, createOrg, promocode } = this.state,
          showPasswordConfirmError = passwordConfirmation && (password !== passwordConfirmation),
          missing = !(username && email && password && passwordConfirmation),
          submitDisabled = authorizing || processing || missing || (password !== passwordConfirmation);

    return (
      <div className='signup-component login-screen'>
        <Panel>
          <h2 className='nitrous-logo'></h2>
          {isViaGitHub ? (
            <Alert bsStyle="success">
              <strong>Awesome!</strong> Check your information below.
            </Alert>
          ) : ''}
          {promocode ? (
            <Alert bsStyle='info'>
              Using Promo <strong>{promocode.slug}</strong>: {promocode.trialInfo}
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
              <Input type='password' placeholder='Confirm password' required
                value={passwordConfirmation}
                help={showPasswordConfirmError ? 'Passwords do not match' : null}
                onChange={this.handlePasswordConfirmationChanged} />
            )}

            <Input type='checkbox' label='Create an organization after sign up'
              checked={createOrg}
              onChange={this.handleCreateOrgChanged} />

            <ButtonToolbar>
              <ButtonInput type='submit' bsStyle='primary' value={
                processing ? 'Creating...' : 'Create Account'
              } disabled={submitDisabled} />
              {isViaGitHub ? '' : (
                <OverlayTrigger placement='bottom' overlay={<Tooltip id='container-state-tooltip'>Log in with GitHub account</Tooltip>}>
                  <Button onClick={this.handleSignupWithGithub} className='github-btn' disabled={processing || authorizing}>
                    <Fa icon='github' />
                    <span className='text'>Log in with GitHub</span>
                  </Button>
                </OverlayTrigger>
              )}
            </ButtonToolbar>
          </form>
        </Panel>
        <div className='misc-links'>
          <p>By creating an account, you agree to the Nitrous <a href='https://community.nitrous.io/docs/terms-of-use'>Terms of Service</a> and <a href='https://community.nitrous.io/docs/privacy-policy'>Privacy Policy</a>.</p>
          <p>Already have an account? <Link to='login'>Log in</Link></p>
        </div>
      </div>
    );
  }

}
