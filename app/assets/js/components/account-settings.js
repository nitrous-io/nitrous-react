import React from 'react';
import userStore from 'stores/user-store';
import userActions from 'actions/user-actions';
import snackbarActions from 'actions/snackbar-actions';
import { Input, Button } from 'react-bootstrap';

export default class AccountSettings extends React.Component {
  displayName = 'AccountSettings';

  state = {
    user: userStore.user,
    updating: false,
    name: userStore.user.name,
    email: userStore.user.unconfirmedEmail || userStore.user.email,
    newPassword: null,
    newPasswordConfirm: null,
    existingPassword: null
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
      newPasswordConfirm: null,
      existingPassword: null
    });
    snackbarActions.post('Account details updated successfully.');
  }

  onUserUpdateFailed = () => {
    this.setState({ updating: false });
  }

  handleChangeNameField = (event) => {
    this.setState({ name: event.target.value });
  }

  handleChangeEmailField = (event) => {
    this.setState({ email: event.target.value });
  }

  handleChangeNewPasswordField = (event) => {
    var val = event.target.value;
    if (val === "") {
      val = null;
    }
    this.setState({ newPassword: val });
  }

  handleChangeNewPasswordConfirmField = (event) => {
    var val = event.target.value;
    if (val === "") {
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

  handleSubmit = (event) => {
    event.preventDefault();
    if (this.submitDisabled()) {
      return;
    }

    this.setState({ updating: true });

    const { name, email, existingPassword } = this.state;
    userActions.update({ name, email, password: this.state.newPassword, existingPassword });
  }

  submitDisabled = () => {
    const { updating, email, newPassword, newPasswordConfirm, existingPassword } = this.state;
    return updating || !email || (newPassword !== newPasswordConfirm) || (newPassword && !existingPassword);
  }

  render() {
    const { updating,
           user,
           name,
           email,
           newPassword,
           newPasswordConfirm,
           existingPassword
          } = this.state;

    const { unconfirmedEmail } = this.state.user,
          newPasswordMatch = (newPassword === newPasswordConfirm),
          showPasswordConfirmError = newPasswordConfirm && !newPasswordMatch,
          showExistingPasswordError = newPasswordMatch && !existingPassword;

    return (
      <div className='account-settings'>
        <div className='container'>
          <h3>Account Settings</h3>
          <form onSubmit={this.handleSubmit}>
            <div className='name'>
              <Input label="Name" type='text' placeholder='Your name...'
                required disabled={updating} value={name} onChange={this.handleChangeNameField} />
            </div>
            {unconfirmedEmail ? (
              <p><i>The email {unconfirmedEmail} is unconfirmed, in the meantime email will be sent to the email {user.email}.</i></p>
            ) : ''}
            <div className='email'>
              <Input label="Email" type='text' placeholder='Email...'
                help={(!email ? 'An email must be provided' : null)}
                required disabled={updating} value={email} onChange={this.handleChangeEmailField} />
            </div>
            <div className='new-password'>
              <Input label="New Password" type='password' placeholder='New password...'
                disabled={updating} value={newPassword} onChange={this.handleChangeNewPasswordField} />
              {(newPassword || newPasswordConfirm) ? (
                <Input label="Confirm Password" type='password' placeholder='Confirm password...'
                  help={(showPasswordConfirmError ? 'Passwords do not match' : null)}
                  disabled={updating} value={newPasswordConfirm} onChange={this.handleChangeNewPasswordConfirmField} />
              ) : ''}
              {(newPassword || existingPassword) ? (
                <Input label="Existing Password" type='password' placeholder='Your existing password...'
                  help={(showExistingPasswordError ? 'Please enter your existing password' : null)}
                  disabled={updating} value={existingPassword} onChange={this.handleChangeExistingPasswordField} />
              ) : ''}
            </div>
            <Button disabled={this.submitDisabled()} type='submit' bsStyle='primary'>{updating ? "Saving..." : "Save"}</Button>
          </form>
        </div>
      </div>
    );
  }
}
