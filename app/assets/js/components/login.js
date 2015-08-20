import React from 'react';
import { Alert, Panel, Input, ButtonInput } from 'react-bootstrap';
import token from 'models/token';
import currentUser from 'models/current-user';

export default class Login extends React.Component {
  displayName: 'Login'

  constructor(props) {
    super(props);
    this.state = {
      loggingIn: false,
      errorMessage: null
    };
  }

  handleSubmit = (evt) => {
    evt.preventDefault();

    this.setState({loggingIn: true, errorMessage: null});

    const username = this.refs.username.getValue(),
          password = this.refs.password.getValue();

    token.fetch(username, password).then(() => {
      currentUser.fetch().catch(() => {
        token.invalidate();
      });
    }).catch((j) => {
      this.setState({errorMessage: j.responseJSON.error_description || j.responseJSON.error || `${j.status} ${j.statusText}`});
    }).then(() => {
      this.setState({loggingIn: false}, () => {
        const usernameInput = this.refs.username.getInputDOMNode();
        usernameInput.select();
        usernameInput.focus();
      });
    });
  };

  componentDidMount() {
    this.refs.username.getInputDOMNode().focus();
  }

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
