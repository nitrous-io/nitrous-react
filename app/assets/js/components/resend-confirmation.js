import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { Alert, ButtonInput, ButtonToolbar, Panel } from 'react-bootstrap';

import tokenStore from 'stores/token-store';
import userActions from 'actions/user-actions';
import snackbarActions from 'actions/snackbar-actions';

export default class ResendConfirmation extends React.Component {
  displayName = 'ResendConfirmation';

  static propTypes = {
    query: PropTypes.shape({
      appToken: PropTypes.string,
      confirmationToken: PropTypes.string
    })
  }

  static contextTypes = {
    router: React.PropTypes.func.isRequired
  };

  state = {
    appToken: tokenStore.invalidatedToken || this.props.query.appToken,
    processing: false,
    processed: false
  }

  componentDidMount() {
    if (!(this.state.appToken || this.props.query.confirmationToken)) {
      this.context.router.transitionTo('login');
    }
  }

  submitDisabled = () => {
    const { processing, processed } = this.state;

    return processing || processed;
  }

  handleSubmit = (event) => {
    event.preventDefault();

    if (this.submitDisabled()) {
      return;
    }

    const { appToken } = this.state,
          { confirmationToken } = this.props.query;
    this.setState({ processing: true });

    userActions.resendConfirmation({ appToken, confirmationToken }).then(() => {
      this.setState({ processed: true, processing: false });
    }).catch(() => {
      this.setState({ processing: true });
      snackbarActions.post('Unable to resend confirmation, please contact support.');
    });
  }

  render() {
    const { processing, processed } = this.state;

    return (
      <div className='forgot-password-component login-screen'>
        <Panel>
          <h2 className='nitrous-logo'></h2>
          {!processed ? (
            <Alert bsStyle="warning">
              Your confirmation email has expired, you will need to resend a new one.
            </Alert>
          ) : (
            <Alert bsStyle="success">
              Your confirmation email has been sent, please check your inbox.
            </Alert>
          )}

          {!processed ? (
            <form onSubmit={this.handleSubmit}>
              <ButtonToolbar>
                <ButtonInput type='submit' bsStyle='primary' disabled={this.submitDisabled()}>
                  {processing ? 'Sending...' : 'Send Confirmation Email'}
                </ButtonInput>
              </ButtonToolbar>
            </form>
          ) : ''}
        </Panel>
        <div className='misc-links'>
          <p>Already have an account? <Link to='login'>Log in</Link></p>
        </div>
      </div>
    );
  }
}
