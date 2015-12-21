import React, { PropTypes } from 'react';
import { Alert, Input, Button, Modal } from 'react-bootstrap';

import Container from 'records/container';
import containerStore from 'stores/container-store';
import containerActions from 'actions/container-actions';

export default class SnapshotContainer extends React.Component {
  displayName = 'SnapshotContainer';

  static propTypes = {
    container: PropTypes.instanceOf(Container).isRequired,
    show: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
    onSuccess: PropTypes.func
  };

  state = {
    name: this.props.container.displayName,
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
    if (nextContainer.slug === container.slug && nextContainer.snapshotDisabled && this.props.show && nextProps.show) {
      nextProps.onHide();
      return;
    }

    if (nextContainer.slug === container.slug && nextProps.show === this.props.show) {
      return; // no change, do not bother
    }
    this.setState({ processing: false }, () => {
      if (nextProps.show) {
        this.refs.name.getInputDOMNode().focus();
        this.refs.name.getInputDOMNode().select();
      }
    });
  }

  handleCommitted = (event) => {
    if (event.containerSlug !== this.props.container.slug) {
      return;
    }

    this.setState({ name: null, processing: false });
    this.props.onHide();
    if (this.props.onSuccess) {
      this.props.onSuccess();
    }
  }

  handleCommitFailed = (event) => {
    if (event.containerSlug !== this.props.container.slug) {
      return;
    }

    this.setState({ processing: false });
  }

  handleNameChanged = (event) => {
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
          { show, onHide } = this.props;

    return (
      <Modal show={show} onHide={onHide}>
        <Modal.Header>
          <Modal.Title>Snapshot Project</Modal.Title>
        </Modal.Header>
        <form onSubmit={this.handleSubmit}>
          <Modal.Body>
            <Alert bsStyle='warning'><p>Any security credentials in your project, such as SSH keys, heroku logins and AWS credentials will be part of the snapshot!</p></Alert>
            <Input ref='name' id='snapshot-name' label='Snapshot Name' required
              type='text' value={name} onChange={this.handleNameChanged} />
          </Modal.Body>
          <Modal.Footer>
            <Button ref='modalCancel' onClick={onHide}>Cancel</Button>
            <Button type='submit' disabled={this.submitDisabled()} bsStyle='primary'>{processing ? 'Creating...' : 'Create Snapshot'}</Button>
          </Modal.Footer>
        </form>
      </Modal>
    );
  }
}
