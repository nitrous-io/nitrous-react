import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import LeftBar from 'components/left-bar';
import { Input, ButtonInput } from 'react-bootstrap';
import passwordStore from 'stores/password-store';
import passwordActions from 'actions/password-actions';
import snackbarActions from 'actions/snackbar-actions';
import classNames from 'classnames';

export default class ResetPassword extends React.Component {
  displayName = 'ResetPassword';

  static contextTypes = {
    router: React.PropTypes.func.isRequired
  };

  static propTypes = {
    query: PropTypes.shape({
      token: PropTypes.string.isRequired
    })
  }

  state = {
    password: null,
    passwordConfirmation: null,
    processing: false,
    errorMessage: null
  }

  componentDidMount() {
    if (!this.props.query.token) {
      snackbarActions.post('The link to reset your password was invalid. Please try again.');
      this.context.router.transitionTo('forgot-password');
    }
    passwordStore.onChange(this.passwordStoreDidChange);
    this.refs.passwordField.getInputDOMNode().focus();
  }

  componentWillUnmount() {
    passwordStore.offChange(this.passwordStoreDidChange);
  }

  passwordStoreDidChange = () => {
    if (!this.state.processing) {
      return;
    }

    if (passwordStore.resetSucceeded) {
      snackbarActions.post('Your password has been reset. Please login with your new password.');
      this.setState({ processing: false });
      this.context.router.transitionTo('login');
    } else if (passwordStore.lastError) {
      this.setState({ processing: false, errorMessage: passwordStore.lastError });
      const node = this.refs.passwordField.getInputDOMNode();
      node.focus();
      node.select();
    }
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
    passwordActions.resetPassword(this.state.password, this.props.query.token);
  }

  submitDisabled = () => {
    const { processing, password, passwordConfirmation } = this.state;
    return processing || !password || (password !== passwordConfirmation);
  }

  render() {
    const { password, passwordConfirmation, processing, errorMessage } = this.state,
          showPasswordConfirmError = passwordConfirmation && (password !== passwordConfirmation),
          formPanelClasses = (errorMessage ? classNames('shake', 'form-panel') : classNames('form-panel'));

    return (
      <div className='reset-password-component login-screen dark'>
        <LeftBar />
        <div className={formPanelClasses}>
          <h2 className='nitrous-logo'></h2>
          <form onSubmit={this.handleSubmit}>
            <Input type='password' required placeholder='New password'
              ref='passwordField'
              disabled={processing}
              value={password}
              onChange={this.handlePasswordChanged} />
            <Input type='password' required placeholder='New password, again'
              disabled={processing}
              value={passwordConfirmation}
              help={showPasswordConfirmError ? 'Passwords do not match' : null}
              onChange={this.handlePasswordConfirmationChanged} />
            <div className='actions'>
              <ButtonInput type='submit' bsStyle='primary' disabled={this.submitDisabled()}>
                {processing ? 'Resetting...' : 'Reset Password'}
              </ButtonInput>
            </div>
          </form>
          <p>Already have an account? <Link to='login'>Log in</Link></p>
        </div>
      </div>
    );
  }
}
