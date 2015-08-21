import React from 'react';
import { Alert, Panel, Input, ButtonInput } from 'react-bootstrap';
import tokenStore from 'stores/token-store';
import tokenActions from 'actions/token-actions';

export default class Login extends React.Component {
  displayName: 'Login'

  static contextTypes = {
    router: React.PropTypes.func.isRequired // Router.PropTypes.router.isRequired
  };

  static willTransitionTo(transition) {
    if (tokenStore.token) {
      transition.redirect('dashboard');
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      loggingIn: false,
      errorMessage: null
    };
  }

  componentDidMount() {
    tokenStore.on('change', this.tokenStoreDidChange);
    this.refs.username.getInputDOMNode().focus();
  }

  componentWillUnmount() {
    tokenStore.removeListener('change', this.tokenStoreDidChange);
  }

  tokenStoreDidChange = () => {
    if (tokenStore.token) {
      this.context.router.transitionTo('dashboard');
    } else if (tokenStore.lastError) {
      this.setState({
        loggingIn: false,
        errorMessage: tokenStore.lastError
      }, () => {
        const usernameInput = this.refs.username.getInputDOMNode();
        usernameInput.select();
        usernameInput.focus();
      });
    }
  }

  handleSubmit = (evt) => {
    evt.preventDefault();
    this.setState({loggingIn: true, errorMessage: null});
    tokenActions.fetch(this.refs.username.getValue(), this.refs.password.getValue());
  };

  render() {
    const loggingIn = this.state.loggingIn,
          loginLabel = loggingIn ? 'Logging In...' : 'Log In';
    let error;
    if (this.state.errorMessage) {
      error = (
        <Alert bsStyle='danger'>{this.state.errorMessage}</Alert>
      );
    }

    return (
      <div className='login-component'>
        <Panel header={<h3>Login</h3>}>
          {error}
          <form onSubmit={this.handleSubmit}>
            <Input ref="username" type='text' label='Username or Email' required disabled={loggingIn} />
            <Input ref="password" type='password' label='Password' required disabled={loggingIn} />
            <div className='actions'>
              <ButtonInput type='submit' bsStyle='primary' value={loginLabel} disabled={loggingIn} />
            </div>
          </form>
        </Panel>
      </div>
    );
  }
}
