import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { Alert, ButtonToolbar, ButtonInput, Input, Button, Panel, OverlayTrigger, Tooltip } from 'react-bootstrap';
import ReCAPTCHA from 'react-google-recaptcha';

import QuickstartContext from 'components/quickstart-context';
import Fa from 'components/fa';
import tokenActions from 'actions/token-actions';
import userActions from 'actions/user-actions';
import pendingMemberActions from 'actions/pending-member-actions';
import pendingMemberStore from 'stores/pending-member-store';
import tokenStore from 'stores/token-store';
import userStore from 'stores/user-store';
import { randomPassword } from 'lib/random';
import snackbarActions from 'actions/snackbar-actions';
import Mp from 'lib/mp';
import MpEvents from 'lib/mp-events';
import promocodeActions from 'actions/promocode-actions';
import promocodeStore from 'stores/promocode-store';
import Captcha from 'lib/captcha';

export default class Signup extends React.Component {
  displayName = 'Signup';

  static propTypes = {
    query: PropTypes.shape({
      gitHubUserName: PropTypes.string,
      gitHubUserEmail: PropTypes.string,
      promo: PropTypes.string,
      invite: PropTypes.string,
      returnTo: PropTypes.string,
      intent: PropTypes.string,
      repo: PropTypes.string
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
                        props.query.gitHubUserEmail,
          isInvited = props.query.invite;

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
      isInvited,
      gitHubUserName: isViaGitHub ? props.query.gitHubUserName : null,
      createOrg: this.props.query.intent === 'org',
      inviteCode: isInvited ? this.props.query.invite : null,
      pendingMember: null,
      invalidCode: false,
      captchaToken: null
    };

    Captcha.setHandlerForTokenChange(this.handleChangeCaptcha.bind(this));
  }

  componentWillReceiveProps(nextProps) {
    this.loadPromoCode(nextProps);
  }

  componentDidMount() {
    userStore.on('created', this.onUserCreated);
    userStore.on('create-failed', this.onUserCreateFailed);
    userStore.on('signed-up-via-github', this.onUserSignedUpViaGithub);
    userStore.on('sign-up-via-github-failed', this.onUserSignUpViaGithubFailed);
    promocodeStore.onChange(this.promocodeStoreDidChange);
    tokenStore.onChange(this.tokenStoreDidChange);
    pendingMemberStore.onChange(this.pendingMemberStoreDidChange);

    if (this.props.query.invite) {
      pendingMemberActions.fetchPendingMemberByCode(this.props.query.invite);
    }

    this.loadPromoCode();
  }

  componentWillUnmount() {
    userStore.off('created', this.onUserCreated);
    userStore.off('create-failed', this.onUserCreateFailed);
    userStore.off('signed-up-via-github', this.onUserSignedUpViaGithub);
    userStore.off('sign-up-via-github-failed', this.onUserSignUpViaGithubFailed);
    promocodeStore.offChange(this.promocodeStoreDidChange);
    tokenStore.offChange(this.tokenStoreDidChange);
    pendingMemberStore.offChange(this.pendingMemberStoreDidChange);
  }

  pendingMemberStoreDidChange = () => {
    const { invite } = this.props.query,
          pendingMember = invite ? pendingMemberStore.pendingMemberByInviteCode(invite) : null,
          invalidCode = pendingMember ? false : true;
    this.setState({ pendingMember, invalidCode });
  }

  loadPromoCode = (props=this.props) => {
    const { promo } = props.query;
    if (promo && promo !== 'null') { // For some unknown reason, some people have `signup-promo: null` in localStorage.
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
    this.setState({ processing: false, captchaToken: null });
    Captcha.reset();
  }

  onUserSignedUpViaGithub = (data) => {
    const { redirectUrl } = data;
    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
  }

  onUserSignUpViaGithubFailed = () => {
    snackbarActions.post('Unable to connect to GitHub. Please try again.');
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

    const pendingMember = this.state.pendingMember,
          isInvitedCollaborator = pendingMember && pendingMember.containerId;
    if (isInvitedCollaborator) {
      this.context.router.transitionTo('shared-containers');
      return;
    }

    if (this.props.query.returnTo) {
      this.context.router.transitionTo(this.props.query.returnTo);
    } else {
      this.context.router.transitionTo('dashboard');
    }
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

    const { username, email, pendingMember, password, gitHubUserName, promocode,
            inviteCode, captchaToken } = this.state,
          signupEmail = (pendingMember && pendingMember.pendingEmail) ? pendingMember.pendingEmail : email,
          promocodeSlug = promocode && promocode.slug;

    userActions.create({ username, signupEmail, password, gitHubUserName, promocodeSlug,
                         inviteCode, captchaToken });
  }

  handleSignupWithGithub = () => {
    this.setState({ authorizing: true });
    userActions.signupViaGithub();
  }

  handleChangeCaptcha = (value) => {
    this.setState({captchaToken: value});
  }

  isQuickstartIntent = () => {
    return !!this.props.query.repo;
  }

  render() {
    const { isViaGitHub, username, email, password, passwordConfirmation,
            authorizing, processing, createOrg, promocode, isInvited, pendingMember,
            invalidCode, captchaToken } = this.state,
          { returnTo, repo } = this.props.query,
          showPasswordConfirmError = passwordConfirmation && (password !== passwordConfirmation),
          signupEmail = (pendingMember && pendingMember.pendingEmail) ? pendingMember.pendingEmail : email,
          missing = !(username && signupEmail && password && passwordConfirmation && (!Captcha.isInitialized() || Captcha.isInitialized() && captchaToken)),
          submitDisabled = authorizing || processing || missing || (password !== passwordConfirmation),
          inviteMsg = (pendingMember && pendingMember.containerId) ? 'collaborating' : 'coding on your workstation';

    return (
      <div className='signup-component login-screen'>
        {this.isQuickstartIntent() ? (
          <QuickstartContext repo={repo} signup />
        ) : ''}

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
            <Input type='email' disabled={isInvited && pendingMember} placeholder='Email' required
              value={signupEmail}
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

            {Captcha.isInitialized() ? (
              <ReCAPTCHA className="captcha" sitekey={Captcha.siteKey} onChange={Captcha.onTokenChange()} />
            ) : ''}

            {isInvited && pendingMember ? (
              <Alert bsStyle='info'>
                Create an account below to start {inviteMsg}.
              </Alert>
            ) : (
              <Input type='checkbox' label='Create an organization after sign up'
                checked={createOrg}
                onChange={this.handleCreateOrgChanged} />
            )}

            {isInvited && invalidCode ? (
              <Alert bsStyle='danger'>
                <Fa icon='exclamation-circle' /> Invalid invite code
              </Alert>
            ) : ''}

            <ButtonToolbar>
              <ButtonInput type='submit' bsStyle='primary' value={
                processing ? 'Signing up...' : 'Sign Up'
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
          <p>Already have an account? <Link to='login' query={{ returnTo, repo }}>Log in</Link></p>
        </div>
      </div>
    );
  }
}
