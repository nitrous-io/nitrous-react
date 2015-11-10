import React, { PropTypes } from 'react';
import { Input, Button, Modal } from 'react-bootstrap';

import Container from 'records/container';
import containerStore from 'stores/container-store';
import containerActions from 'actions/container-actions';

export default class SnapshotContainer extends React.Component {
  displayName = 'SnapshotContainer';

  static propTypes = {
    container: PropTypes.instanceOf(Container).isRequired,
    showModal: PropTypes.bool.isRequired,
    onHideModal: PropTypes.func.isRequired
  };

  state = {
    name: null,
    processing: false
  };

  componentDidMount() {
    containerStore.on('committed', this.handleCommitted);
    containerStore.on('commit-failed', this.handleCommitFailed);
  }

  componentWillUnmount() {
    containerStore.off('committed', this.handleCommitted);
    containerStore.off('commit-failed', this.handleCommitFailed);
  }

  componentWillReceiveProps(nextProps) {
    const { container } = this.props,
          nextContainer = nextProps.container;
    if (nextContainer.slug === container.slug && nextContainer.snapshotDisabled && this.props.showModal && nextProps.showModal) {
      nextProps.onHideModal();
      return;
    }

    if (nextContainer.slug === container.slug && nextProps.showModal === this.props.showModal) {
      return; // no change, do not bother
    }

    const date = new Date(),
          name = `${nextProps.container.name} ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    this.setState({ name, processing: false }, () => {
      if (nextProps.showModal) {
        this.refs.name.getInputDOMNode().focus();
      }
    });
  }

  handleCommitted = (event) => {
    if (event.containerSlug !== this.props.container.slug) {
      return;
    }

    this.setState({ name: null, processing: false });
    this.props.onHideModal();
  }

  handleCommitFailed = (event) => {
    if (event.containerSlug !== this.props.container.slug) {
      return;
    }

    this.setState({ processing: false });
  }

  handleChangeNameField = (event) => {
    const val = event.target.value;
    if (!val || val.trim() === '') {
      this.setState({ name: null });
    }
    this.setState({ name: val });
  }

  submitDisabled = () => {
    const { name, processing } = this.state;

    return processing || !name;
  }

  handleSubmit = (event) => {
    event.preventDefault();

    if (this.submitDisabled()) {
      return;
    }

    const { name } = this.state,
          { container } = this.props;

    this.setState({ processing: true });
    containerActions.commit(container.slug, name);
  }

  render() {
    const { name, processing } = this.state,
          { showModal, onHideModal } = this.props;

    return (
      <Modal show={showModal} onHide={onHideModal}>
        <Modal.Header>
          <Modal.Title>Snapshot Project</Modal.Title>
        </Modal.Header>
        <form onSubmit={this.handleSubmit}>
          <Modal.Body>
            <Input ref='name' label="Snapshot Name" type='text' placeholder='My Awesome Project'
              required value={name} onChange={this.handleChangeNameField} />
          </Modal.Body>
          <Modal.Footer>
            <Button ref='modalCancel' onClick={onHideModal}>Cancel</Button>
            <Button type='submit' disabled={this.submitDisabled()} bsStyle='primary'>{processing ? 'Creating...' : 'Create Snapshot'}</Button>
          </Modal.Footer>
        </form>
      </Modal>
    );
  }
}
