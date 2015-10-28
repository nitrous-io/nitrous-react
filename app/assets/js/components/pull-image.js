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
    name: null
  };

  componentDidMount() {
    imageStore.on('pulling', this.handleImagePulling);
  }

  componentWillUnmount() {
    imageStore.off('pulling', this.handleImagePulling);
  }

  handleImagePulling = (event) => {
    if (!this.props.showModal) {
      return;
    }

    const { pendingPullName } = this.state;
    if (!pendingPullName) {
      return;
    }

    if (event.repo && event.repo.indexOf(pendingPullName) !== -1) {
      this.props.onHideModal();
    }
  }

  handleChangeNameField = (event) => {
    this.setState({ name: event.target.value });
  }

  handleSubmit = (event) => {
    event.preventDefault();

    const { name } = this.state;
    if (!name) {
      return;
    }

    this.setState({ pendingPullName: name });
    imageActions.pull(this.props.host.slug, name, true);
  }

  render() {
    const { name } = this.state,
          { showModal, onHideModal } = this.props,
          canPull = name && name.length > 0;

    return (
      <Modal show={showModal} onHide={onHideModal}>
        <Modal.Header>
          <Modal.Title>Pull Image from a Docker repository</Modal.Title>
        </Modal.Header>
        <form onSubmit={this.handleSubmit}>
          <Modal.Body>
            <Input label="Image Repository" type='text' placeholder='e.g: centos or quay.io/mycompany/rails'
              required value={name} onChange={this.handleChangeNameField} />
          </Modal.Body>
          <Modal.Footer>
            <Button ref='modalCancel' onClick={onHideModal}>Cancel</Button>
            <Button type='submit' disabled={!canPull} bsStyle='primary'>Pull</Button>
          </Modal.Footer>
        </form>
      </Modal>
    );
  }
}
