import React from 'react';
import userStore from 'stores/user-store';
import userActions from 'actions/user-actions';
import { Input, Button } from 'react-bootstrap';

export default class AccountSettings extends React.Component {
  displayName = 'AccountSettings';

  state = {
    user: userStore.user,
    updating: false,
    name: userStore.user.name,
    email: userStore.user.unconfirmedEmail || userStore.user.email,
    newPassword: null,
    newPasswordConfirm: null
  };

  componentDidMount() {
    userStore.on('updated', this.onUserUpdated);
    userStore.on('update-failed', this.onUserUpdateFailed);
  }

  componentWillUnmount() {
    userStore.off('updated', this.onUserUpdated);
    userStore.off('update-failed', this.onUserUpdateFailed);
  }

  onUserUpdated = () => {
    const user = userStore.user;
    this.setState({
      user,
      updating: false,
      name: user.name,
      email: user.unconfirmedEmail || user.email,
      newPassword: null,
      newPasswordConfirm: null
    });
  }

  onUserUpdateFailed = () => {
    this.setState({
      updating: false
    });
  }

  handleChangeNameField = () => {
    this.setState({ name: event.target.value });
  };

  handleChangeEmailField = () => {
    this.setState({ email: event.target.value });
  };

  handleChangeNewPasswordField = () => {
    var val = event.target.value;
    if (val === "") {
      val = null;
    }
    this.setState({ newPassword: val });
  };

  handleChangeNewPasswordConfirmField = () => {
    var val = event.target.value;
    if (val === "") {
      val = null;
    }
    this.setState({ newPasswordConfirm: val });
  };

  handleClickSaveBtn = () => {
    const { newPassword, newPasswordConfirm } = this.state;
    if (newPassword !== newPasswordConfirm) {
      return;
    }

    this.setState({ updating: true });

    const { name, email } = this.state;
    userActions.update({ name, email, password: newPassword });
  };

  render() {
    const { updating,
           user,
           name,
           email,
           newPassword,
           newPasswordConfirm
          } = this.state;

    const { unconfirmedEmail } = this.state.user,
          newPasswordMatch = (newPassword === newPasswordConfirm),
          emailEmpty = (email === ""),
          saveButtonDisabled = emailEmpty || updating || !newPasswordMatch;

    return (
      <div className='account-settings'>
        <div className='container'>
          <h3>Account Settings</h3>
          <div className='name'>
            <Input label="Name" ref='nameField' type='text' placeholder='Your name...'
              required disabled={updating} value={name} onChange={this.handleChangeNameField} />
          </div>
          {unconfirmedEmail ? (
            <p><i>The email {unconfirmedEmail} is unconfirmed, in the meantime email will be sent to the email {user.email}.</i></p>
          ) : ''}
          <div className='email'>
            <Input label="Email" ref='emailField' type='text' placeholder='Email...'
              help={(emailEmpty ? 'An email must be provided' : null)}
              required disabled={updating} value={email} onChange={this.handleChangeEmailField} />
          </div>
          <div className='new-password'>
            <Input label="New Password" ref='newPasswordField' type='password' placeholder='New password...'
              required disabled={updating} value={newPassword} onChange={this.handleChangeNewPasswordField} />
            {newPassword ? (
              <Input label="Confirm Password" ref='newPasswordConfirmField' type='password' placeholder='Confirm password...'
                help={(newPasswordMatch ? null : 'Passwords do not match')}
                required disabled={updating} value={newPasswordConfirm} onChange={this.handleChangeNewPasswordConfirmField} />
            ) : ''}
          </div>
          <Button disabled={saveButtonDisabled} className='save-btn' bsStyle='success' onClick={this.handleClickSaveBtn}>{updating ? "Saving" : "Save"}</Button>
        </div>
      </div>
    );
  }
}
