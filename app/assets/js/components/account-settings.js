import React from 'react';
import { Panel, Alert, Input, Button } from 'react-bootstrap';

import userStore from 'stores/user-store';
import userActions from 'actions/user-actions';
import snackbarActions from 'actions/snackbar-actions';
import UserNav from 'components/user-nav';
import Fa from 'components/fa';
import PromptModal from 'components/prompt-modal';
import SelectableText from 'components/selectable-text';
import Mp from 'lib/mp';
import MpEvents from 'lib/mp-events';
import stringUtil from 'lib/string-util';

export default class AccountSettings extends React.Component {
  displayName = 'AccountSettings';

  state = {
    user: userStore.user,
    updating: false,
    updatingProfile: false,
    name: userStore.user.name,
    email: userStore.user.unconfirmedEmail || userStore.user.email,
    newPassword: null,
    newPasswordConfirm: null,
    existingPassword: null,
    connectingToGitHub: false,
    advanced: userStore.advanced,

    canDeleteAccount: false,
    cannotDeleteAccountReason: 'You cannot delete your account at this time',
    deleting: false,
    usernameConfirmation: null
  };

  static willTransitionTo() {
    Mp.track(MpEvents.EventDashboardViewedAccount);
  }

  componentDidMount() {
    userActions.canDeleteAccount().then(() => {
      this.setState({canDeleteAccount: true});
    }).catch((jqxhr) => {
      if (jqxhr.status === 500) {
        return; // use default reason
      }
      const { responseJSON } = jqxhr;
      if (responseJSON && responseJSON.error_description) {
        this.setState({cannotDeleteAccountReason: responseJSON.error_description});
      }
    });

    userStore.onChange(this.userStoreDidChange);
    userStore.on('update-failed', this.onUserUpdateFailed);
    userStore.on('account-deleted', this.onAccountDeleted);
    userStore.on('account-delete-failed', this.onAccountDeleteFailed);
  }

  componentWillUnmount() {
    userStore.offChange(this.userStoreDidChange);
    userStore.off('update-failed', this.onUserUpdateFailed);
    userStore.off('account-deleted', this.onAccountDeleted);
    userStore.off('account-delete-failed', this.onAccountDeleteFailed);
  }

  userStoreDidChange = () => {
    const user = userStore.user;
    this.setState({
      user,
      updating: false,
      updatingProfile: false,
      name: user.name,
      email: user.unconfirmedEmail || user.email,
      newPassword: null,
      newPasswordConfirm: null,
      existingPassword: null,
      connectingToGitHub: false,
      advanced: userStore.advanced
    });
    snackbarActions.post('Account details updated successfully.');
  }

  onUserUpdateFailed = () => {
    this.setState({ updating: false, updatingProfile: false });
  }

  onAccountDeleted = () => {
    this.setState({ deleting: false });
    snackbarActions.post('Your account has been deleted');
    // give user time to read the snackbar message
    window.setTimeout(() => {
      // subset of tokenStore token.invalidate
      localStorage.removeItem('token');
      location.href = '/';
    }, 2000);
  }

  onAccountDeleteFailed = () => {
    this.setState({ deleting: false });
  }

  handleChangeNameField = (event) => {
    this.setState({ name: event.target.value });
  }

  handleChangeEmailField = (event) => {
    this.setState({ email: event.target.value });
  }

  handleChangeNewPasswordField = (event) => {
    var val = event.target.value;
    if (val === '') {
      val = null;
    }
    this.setState({ newPassword: val });
  }

  handleChangeNewPasswordConfirmField = (event) => {
    var val = event.target.value;
    if (val === '') {
      val = null;
    }
    this.setState({ newPasswordConfirm: val });
  }

  handleChangeExistingPasswordField = (event) => {
    var val = event.target.value;
    if (val === '') {
      val = null;
    }
    this.setState({ existingPassword: val });
  }

  handleChangeAdvanced = () => {
    this.setState({ advanced: this.refs.advanced.getChecked() });
  }

  handleSubmit = (evt) => {
    evt.preventDefault();
    this.setState({ updating: true });

    const { name, email, existingPassword } = this.state;
    userActions.update({ name, email, password: this.state.newPassword, existingPassword });
  }

  handleSubmitSettings = (evt) => {
    evt.preventDefault();
    const { advanced } = this.state;

    this.setState({ updatingProfile: true });
    userActions.updateProfile({ advanced });
  }

  handleClickGitHubConnect = () => {
    this.setState({ connectingToGitHub: true });
    userActions.connectToGitHub().then((data) => {
      window.location.href = data.redirect_url;
    }).catch(() => {
      this.setState({ connectingToGitHub: false });
    });
  }

  handleClickDeleteAccount = () => {
    this.setState({ usernameConfirmation: '' }, () => {
      this.refs.deleteAccountModal.show();
    });
  }

  handleDeleteAccountModalTextInput = (text) => {
    this.setState({ usernameConfirmation: text });
  }

  handleDeleteAccountModalOK = () => {
    this.setState({ deleting: true });
    userActions.deleteUser();
  }

  submitDisabled() {
    const { updating, email, newPassword, newPasswordConfirm, existingPassword } = this.state;
    return updating || !email || (newPassword !== newPasswordConfirm) || (newPassword && !existingPassword);
  }

  renderGitHubConnectButton() {
    const { canDeleteGitHubPublicKeys, authorizedGitHubUserName } = this.state.user.userProfile,
          { connectingToGitHub } = this.state;

    if (!authorizedGitHubUserName) {
      return (
        <Button onClick={this.handleClickGitHubConnect}>
          {connectingToGitHub ?
            <span>
              <Fa icon='github' /> Connecting...
            </span>
          :
            <span>
              <Fa icon='github' /> Connect to GitHub
            </span>
          }
        </Button>
      );
    }

    return (
      <Button bsStyle={canDeleteGitHubPublicKeys ? 'default' : 'warning'} onClick={this.handleClickGitHubConnect}>
        {connectingToGitHub ?
          <span>
            <Fa icon='github' /> Connecting...
          </span>
        :
          <span>
            <Fa icon='github' /> Reconnect to GitHub
          </span>
        }
      </Button>
    );
  }

  render() {
    const { updating,
            updatingProfile,
            user,
            name,
            email,
            newPassword,
            newPasswordConfirm,
            existingPassword,
            advanced,
            canDeleteAccount,
            cannotDeleteAccountReason,
            deleting
          } = this.state;

    const { unconfirmedEmail, userProfile, username } = this.state.user,
          newPasswordMatch = (newPassword === newPasswordConfirm),
          showPasswordConfirmError = newPasswordConfirm && !newPasswordMatch,
          showExistingPasswordError = newPasswordMatch && !existingPassword,
          { canDeleteGitHubPublicKeys, authorizedGitHubUserName } = userProfile;

    return (
      <div className='account-settings-component'>
        <UserNav activeTab='account'>
          <Panel header={(<h4>Account</h4>)}>
            <form onSubmit={this.handleSubmit}>
              <div className='name'>
                <Input label='Name' type='text' placeholder='John Doe'
                  required disabled={updating} value={name} onChange={this.handleChangeNameField} />
              </div>
              {unconfirmedEmail ? (
                <p><i>The email {unconfirmedEmail} is unconfirmed, in the meantime emails will be sent to {user.email}.</i></p>
              ) : ''}
              <div className='email'>
                <Input label='Email' type='text' placeholder='johndoe@mail.com'
                  help={(!email ? 'An email must be provided' : null)}
                  required disabled={updating} value={email} onChange={this.handleChangeEmailField} />
              </div>
              <div className='new-password'>
                <Input label='New Password' type='password' placeholder='New password...'
                  disabled={updating} value={newPassword} onChange={this.handleChangeNewPasswordField} />
                {(newPassword || newPasswordConfirm) ? (
                  <Input label='Confirm Password' type='password' placeholder='Confirm password...'
                    help={(showPasswordConfirmError ? 'Passwords do not match' : null)}
                    disabled={updating} value={newPasswordConfirm} onChange={this.handleChangeNewPasswordConfirmField} />
                ) : ''}
                {(newPassword || existingPassword) ? (
                  <Input label='Existing Password' type='password' placeholder='Your existing password...'
                    help={(showExistingPasswordError ? 'Please enter your existing password' : null)}
                    disabled={updating} value={existingPassword} onChange={this.handleChangeExistingPasswordField} />
                ) : ''}
              </div>
              <Button disabled={this.submitDisabled()} type='submit' bsStyle='primary'>{updating ? 'Saving...' : 'Save Changes'}</Button>
            </form>
          </Panel>

          <Panel className='integration' header={(<h4>GitHub</h4>)}>
            {canDeleteGitHubPublicKeys ? '' : (
              <Alert bsSize='xsmall' bsStyle='info'>
                <Fa icon='info-circle' /> Please connect with GitHub to manage your public keys
              </Alert>
            )}
            {authorizedGitHubUserName ? (
              <p className='connected'>Connected as <strong>{authorizedGitHubUserName}</strong>.</p>
            ) : ''}
            {this.renderGitHubConnectButton()}
          </Panel>

          <Panel header={<h4>Settings</h4>}>
            <form onSubmit={this.handleSubmitSettings}>
              <div className='advanced-mode'>
                <Input ref="advanced" type="checkbox" label="Show Advanced Features" checked={advanced} onChange={this.handleChangeAdvanced} />
              </div>
              <Button type='submit' bsStyle='primary' disabled={updatingProfile}>{updatingProfile ? 'Saving...' : 'Apply'}</Button>
            </form>
          </Panel>

          <Panel header={<h4>Delete my Account</h4>}>
            {canDeleteAccount ? (
              <Button onClick={this.handleClickDeleteAccount} disabled={deleting} type='submit' bsStyle='danger'>{deleting ? 'Deleting...' : 'Delete Account'}</Button>
            ) : (
              <Alert bsSize='xsmall' bsStyle='info'>
                <Fa icon='info-circle' /> {stringUtil.capitalize(cannotDeleteAccountReason)}
              </Alert>
            )}
            <PromptModal ref='deleteAccountModal' okButtonLabel='Delete My Account' okButtonStyle='danger'
              okButtonDisabled={this.state.usernameConfirmation !== username} placeholder={username}
              onOK={this.handleDeleteAccountModalOK} onTextInput={this.handleDeleteAccountModalTextInput}>
              <p>This action <strong>CANNOT</strong> be undone!</p>
              <p>Deleting your account is irreversible.</p>
              <p>
                Please type your username
                (<SelectableText><strong>{username}</strong></SelectableText>)
                to confirm:
              </p>
            </PromptModal>
          </Panel>
        </UserNav>
      </div>
    );
  }
}
