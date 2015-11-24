import React, { PropTypes } from 'react';
import { Button } from 'react-bootstrap';

import SubHost from 'records/sub-host';
import PromptModal from 'components/prompt-modal';
import SelectableText from 'components/selectable-text';
import hostActions from 'actions/host-actions';
import hostStore from 'stores/host-store';

export default class SubHostListItem extends React.Component {
  displayName = 'SubHostListItem';

  static propTypes = {
    subHost: PropTypes.instanceOf(SubHost).isRequired
  };

  state = {
    terminated: false,
    terminating: false,
    slugConfirmation: null
  };

  componentDidMount() {
    hostStore.on('terminated', this.handleHostTerminated);
    hostStore.on('terminate-failed', this.handleHostTerminateFailed);
  }

  componentWillUnmount() {
    hostStore.off('terminated', this.handleHostTerminated);
    hostStore.off('terminate-failed', this.handleHostTerminateFailed);
  }

  handleHostTerminated = (data) => {
    const { hostSlug } = data,
          { host } = this.props.subHost;

    if (hostSlug === host.slug) {
      this.setState({ terminating: false, terminated: true });
    }
  }

  handleHostTerminateFailed = (data) => {
    const { hostSlug } = data,
          { host } = this.props.subHost;

    if (hostSlug === host.slug) {
      this.setState({ terminating: false });
    }
  }

  handleTerminate = () => {
    if (this.terminateDisabled()) {
      return;
    }

    this.setState({ slugConfirmation: '' }, () => {
      this.refs.terminateModal.show();
    });
  }

  handleTerminateModalTextInput = (text) => {
    this.setState({ slugConfirmation: text });
  }

  handleTerminateModalOK = () => {
    const { host } = this.props.subHost;

    this.setState({ terminating: true });
    hostActions.terminate(host.slug);
  }

  terminateButtonLabel = () => {
    const { terminated, terminating } = this.state;

    if (terminated) {
      return 'Terminated';
    }

    if (terminating) {
      return 'Terminating';
    }

    return 'Terminate';
  }

  terminateDisabled = () => {
    const { terminated, terminating } = this.state;

    return (terminated || terminating);
  }

  render() {
    const { subHost } = this.props,
          { host } = subHost;

    return (
      <tr>
        <td className='col-md-1'><img className='gravatar rounded-gravatar' src={subHost.gravatar(72)} /></td>
        <td className='col-md-4'>{subHost.username}</td>
        <td>{host.slug}</td>
        <td>{host.state}</td>
        <td>
          <Button className='pull-right' bsStyle='danger' onClick={this.handleTerminate} disabled={this.terminateDisabled()}>{this.terminateButtonLabel()}</Button>

          <PromptModal ref='terminateModal' okButtonLabel='Terminate' okButtonStyle='danger'
            okButtonDisabled={this.state.slugConfirmation !== host.slug} placeholder={host.slug}
            onOK={this.handleTerminateModalOK} onTextInput={this.handleTerminateModalTextInput}>
            <p>This action <strong>CANNOT</strong> be undone!</p>
            <p>This will permanently delete the workstation &ldquo;{host.displayName}&rdquo; and all projects stored within the project.</p>
            <p>
              Please type in the slug of the project
              (<SelectableText><strong>{host.slug}</strong></SelectableText>)
              to confirm:
            </p>
          </PromptModal>
        </td>
      </tr>
    );
  }
}
