import React, { PropTypes } from 'react';
import { Input, Button, Modal } from 'react-bootstrap';
import Host from 'records/host';
import imageActions from 'actions/image-actions';
import imageStore from 'stores/image-store';

export default class PullImage extends React.Component {
  displayName = 'PullImage';

  static propTypes = {
    host: PropTypes.instanceOf(Host).isRequired,
    showModal: PropTypes.bool.isRequired,
    onHideModal: PropTypes.func.isRequired
  };

  state = {
    name: null,
    pulling: false,
    pendingPullName: null
  };

  componentDidMount() {
    imageStore.on('pulling', this.handleImagePulling);
    imageStore.on('pull-failed', this.handleImagePullFailed);
    imageStore.on('pulled', this.handleImagePulling);
  }

  componentWillUnmount() {
    imageStore.off('pulling', this.handleImagePulling);
    imageStore.off('pull-failed', this.handleImagePullFailed);
    imageStore.off('pulled', this.handleImagePulling);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ pendingPullName: null, pulling: false }, () => {
      if (nextProps.showModal) {
        this.refs.name.getInputDOMNode().focus();
      }
    });
  }

  handleImagePulling = (event) => {
    if (!this.props.showModal) {
      return;
    }

    const { pendingPullName } = this.state;
    if (!pendingPullName) {
      return;
    }

    if (event.repository && event.repository.startsWith(pendingPullName)) {
      this.setState({ name: null, pulling: false });
      this.props.onHideModal();
    }
  }

  handleImagePullFailed = (event) => {
    if (!this.props.showModal) {
      return;
    }

    const { pendingPullName } = this.state;
    if (!pendingPullName) {
      return;
    }

    if (event.repository && event.repository.startsWith(pendingPullName)) {
      this.setState({ pulling: false });
    }
  }

  handleChangeNameField = (event) => {
    this.setState({ name: event.target.value });
  }

  submitDisabled = () => {
    const { name, pulling } = this.state;

    return pulling || !name;
  }

  handleSubmit = (event) => {
    event.preventDefault();

    if (this.submitDisabled()) {
      return;
    }

    const { name } = this.state;
    this.setState({ pulling: true, pendingPullName: name });
    imageActions.pull(this.props.host.slug, name, true);
  }

  render() {
    const { name, pulling } = this.state,
          { showModal, onHideModal } = this.props;

    return (
      <Modal show={showModal} onHide={onHideModal}>
        <Modal.Header>
          <Modal.Title>Pull Image from a Docker repository</Modal.Title>
        </Modal.Header>
        <form onSubmit={this.handleSubmit}>
          <Modal.Body>
            <Input ref='name' label="Image Repository" type='text' placeholder='e.g: centos or quay.io/mycompany/rails'
              required value={name} onChange={this.handleChangeNameField} />
          </Modal.Body>
          <Modal.Footer>
            <Button ref='modalCancel' onClick={onHideModal}>Cancel</Button>
            <Button type='submit' disabled={this.submitDisabled()} bsStyle='primary'>{pulling ? 'Pulling' : 'Pull'}</Button>
          </Modal.Footer>
        </form>
      </Modal>
    );
  }
}
