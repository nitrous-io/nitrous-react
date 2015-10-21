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
    snackbarActions.post('Account details updated successfully.');
  }

  onUserUpdateFailed = () => {
    this.setState({ updating: false });
  }

  handleChangeNameField = (event) => {
    this.setState({ name: event.target.value });
  };

  handleChangeEmailField = (event) => {
    this.setState({ email: event.target.value });
  };

  handleChangeNewPasswordField = (event) => {
    var val = event.target.value;
    if (val === "") {
      val = null;
    }
    this.setState({ newPassword: val });
  };

  handleChangeNewPasswordConfirmField = (event) => {
    var val = event.target.value;
    if (val === "") {
      val = null;
    }
    this.setState({ newPasswordConfirm: val });
  };

  handleSubmit = (event) => {
    event.preventDefault();

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
          showPasswordConfirmError = newPasswordConfirm && !newPasswordMatch,
          emailEmpty = (email === ""),
          saveButtonDisabled = emailEmpty || updating || !newPasswordMatch;

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
                help={(emailEmpty ? 'An email must be provided' : null)}
                required disabled={updating} value={email} onChange={this.handleChangeEmailField} />
            </div>
            <div className='new-password'>
              <Input label="New Password" type='password' placeholder='New password...'
                disabled={updating} value={newPassword} onChange={this.handleChangeNewPasswordField} />
              {newPassword ? (
                <Input label="Confirm Password" type='password' placeholder='Confirm password...'
                  help={(showPasswordConfirmError ? 'Passwords do not match' : null)}
                  disabled={updating} value={newPasswordConfirm} onChange={this.handleChangeNewPasswordConfirmField} />
              ) : ''}
            </div>
            <Button disabled={saveButtonDisabled} type='submit' bsStyle='primary'>{updating ? "Saving..." : "Save"}</Button>
          </form>
        </div>
      </div>
    );
  }
}
