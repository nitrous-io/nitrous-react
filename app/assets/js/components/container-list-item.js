import React, { PropTypes } from 'react';
import { Col, ButtonToolbar, Button, DropdownButton, MenuItem } from 'react-bootstrap';
import Container from 'records/container';
import containerActions from 'actions/container-actions';
import ContainerState from 'components/container-state';
import Fa from 'components/fa';
import PromptModal from 'components/prompt-modal';
import SelectableText from 'components/selectable-text';

export default class ContainerListItem extends React.Component {
  displayName = 'ContainerListItem';

  static propTypes = {
    container: PropTypes.instanceOf(Container).isRequired
  };

  state = {
    slugConfirmation: null // slug entered by user in the termination confirmation dialog
  };

  handleStop = () => {
    containerActions.stop(this.props.container);
  };

  handleRestart = () => {
    containerActions.restart(this.props.container);
  };

  handleStart = () => {
    containerActions.start(this.props.container);
  };

  handleTerminate = () => {
    this.setState({ slugConfirmation: '' }, () => {
      this.refs.terminateModal.show();
    });
  };

  handleTerminateModalOK = () => {
    containerActions.terminate(this.props.container);
  };

  handleTerminateModalTextInput = (text) => {
    this.setState({ slugConfirmation: text });
  };

  render() {
    const container = this.props.container;

    return (
      <Col lg={3} md={4} sm={6} xs={12} className='container-list-item-component container-list-item'>
        <div className='ui-card'>
          <div className='ui-card-body'>
            <h4>{container.displayName}</h4>
            <div className='info'>
              <ContainerState state={container.state} />
              <SelectableText className='slug'>{container.slug}</SelectableText>
            </div>
              {container.state !== 'terminated' ? (
                <ButtonToolbar className='buttons'>
                  <DropdownButton title={<Fa icon='power-off' />} disabled={container.isInIntermediateState}>
                    {container.state === 'running' ? [
                      <MenuItem key='cm1' onSelect={this.handleStop}>Stop</MenuItem>,
                      <MenuItem key='cm2' onSelect={this.handleRestart}>Restart</MenuItem>
                    ] : ''}
                    {container.state === 'stopped' ? [
                      <MenuItem key='cm3' onSelect={this.handleStart}>Start</MenuItem>,
                      <MenuItem key='cm4' divider />,
                      <MenuItem key='cm5' onSelect={this.handleTerminate}>Terminate...</MenuItem>
                    ] : ''}
                  </DropdownButton>
                  <DropdownButton title='Settings'>
                    <MenuItem>Snapshot...</MenuItem>
                    <MenuItem divider />
                    <MenuItem>Manage Collaborators...</MenuItem>
                    <MenuItem>Manage SSH Keys...</MenuItem>
                    <MenuItem>Manage Ports...</MenuItem>
                  </DropdownButton>
                  <Button>Open IDE</Button>
                </ButtonToolbar>
              ) : (
                <ButtonToolbar className='buttons'>
                  <Button disabled>Terminated</Button>
                </ButtonToolbar>
              )
            }
            {container.state === 'stopped' ? (
              <PromptModal ref='terminateModal' okButtonLabel='Terminate' okButtonStyle='danger'
                okButtonDisabled={this.state.slugConfirmation !== container.slug} placeholder={container.slug}
                onOK={this.handleTerminateModalOK} onTextInput={this.handleTerminateModalTextInput}>
                <p>This action <strong>CANNOT</strong> be undone!</p>
                <p>This will permanently delete the project &ldquo;{container.displayName}&rdquo; and all data stored within the project container.</p>
                <p>
                  Please type in the slug of the project
                  (<SelectableText><strong>{container.slug}</strong></SelectableText>)
                  to confirm:
                </p>
              </PromptModal>
            ) : ''}
          </div>
        </div>
      </Col>
    );
  }
}
