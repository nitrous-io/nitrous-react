import React, { PropTypes } from 'react';
import { Input, Button, Modal } from 'react-bootstrap';
import Host from 'records/host';
import registryActions from 'actions/registry-actions';
import registryStore from 'stores/registry-store';

export default class ConnectRegistry extends React.Component {
  displayName = 'ConnectRegistry';

  static propTypes = {
    host: PropTypes.instanceOf(Host).isRequired,
    showModal: PropTypes.bool.isRequired,
    onHideModal: PropTypes.func.isRequired,
    urlPrefill: PropTypes.string
  };

  state = {
    connecting: false,
    url: null,
    username: null,
    email: null,
    password: null
  };

  componentDidMount() {
    registryStore.on('logged-in', this.handleRegistryLoggedIn);
    registryStore.on('login-failed', this.handleRegistryLoginFailed);
  }

  componentWillUnmount() {
    registryStore.off('logged-in', this.handleRegistryLoggedIn);
    registryStore.off('login-failed', this.handleRegistryLoginFailed);
  }

  componentWillReceiveProps(nextProps) {
    const { host, urlPrefill } = this.props;

    if (nextProps.host === host && nextProps.urlPrefill === urlPrefill) {
      this.setState({ connecting: false });
      return;
    }

    this.setState({
      url: nextProps.urlPrefill,
      username: null,
      email: null,
      password: null,
      connecting: false
    });
  }

  handleRegistryLoggedIn = (event) => {
    const { host } = this.props;

    if (host && host.slug !== event.hostSlug) {
      return;
    }

    this.props.onHideModal();
    this.setState({ connecting: false });
  }

  handleRegistryLoginFailed = (event) => {
    const { host } = this.props;

    if (host && host.slug !== event.hostSlug) {
      return;
    }

    this.setState({ connecting: false });
  }

  handleChangeUrlField = (event) => {
    this.setState({ url: event.target.value });
  }

  handleChangeUsernameField = (event) => {
    this.setState({ username: event.target.value });
  }

  handleChangeEmailField = (event) => {
    this.setState({ email: event.target.value });
  }

  handleChangePasswordField = (event) => {
    this.setState({ password: event.target.value });
  }

  submitDisabled = () => {
    const { url, username, email, password, connecting } = this.state;

    return connecting || !url || !username || !email || !password;
  }

  handleSubmit = (event) => {
    event.preventDefault();

    if (this.submitDisabled()) {
      return;
    }

    const { url, username, email, password } = this.state;
    registryActions.login(this.props.host.slug, { url, username, email, password });
    this.setState({ connecting: true });
  }

  render() {
    const { url, username, email, password, connecting } = this.state,
          { showModal, onHideModal } = this.props;

    return (
      <Modal show={showModal} onHide={onHideModal}>
        <Modal.Header>
          <Modal.Title>Connect to a Docker Registry</Modal.Title>
        </Modal.Header>
        <form onSubmit={this.handleSubmit}>
          <Modal.Body>
            <Input label="Registry URL" type='text'
              required value={url} onChange={this.handleChangeUrlField} />
            <Input label="Username" type='text'
              required value={username} onChange={this.handleChangeUsernameField} />
            <Input label="Email" type='email'
              required value={email} onChange={this.handleChangeEmailField} />
            <Input label="Password" type='password'
              required value={password} onChange={this.handleChangePasswordField} />
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={onHideModal}>Cancel</Button>
            <Button type='submit' disabled={this.submitDisabled()} bsStyle='primary'>{connecting ? 'Connecting' : 'Connect'}</Button>
          </Modal.Footer>
        </form>
      </Modal>
    );
  }
}
