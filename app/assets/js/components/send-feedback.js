import React, { PropTypes } from 'react';
import { Modal, Input, Button } from 'react-bootstrap';

import feedbackActions from 'actions/feedback-actions';
import snackbarActions from 'actions/snackbar-actions';

export default class SendFeedback extends React.Component {
  displayName = 'SendFeedback';

  static propTypes = {
    show: PropTypes.bool,
    onHide: PropTypes.func
  };

  state = {
    subject: null,
    message: null,
    sending: false
  };

  componentDidUpdate(prevProps) {
    if (this.props.show && !prevProps.show) {
      const subjectField = this.refs.subjectField.getInputDOMNode();
      subjectField.select();
      subjectField.focus();
    }
  }

  handleSubjectChanged = (event) => {
    this.setState({ subject: event.target.value });
  };

  handleMessageChanged = (event) => {
    this.setState({ message: event.target.value });
  };

  handleHideModal = () => {
    if (this.props.onHide) {
      this.props.onHide();
    }
  };

  handleSendFeedback = () => {
    this.setState({ sending: true });

    const { subject, message } = this.state;
    feedbackActions.send(subject, message).then(() => {
      this.setState({ sending: false, subject: null, message: null });
      this.handleHideModal();
      snackbarActions.post('Thanks for your feedback!');
    }).catch(() => {
      this.setState({ sending: false });
      snackbarActions.post('Failed to send your feedback, please try again or send an email to support@nitrous.io.');
    });
  };

  render() {
    const { show } = this.props,
          { subject, message, sending } = this.state;

    return (
      <Modal className='send-feedback-component'
        show={show}
        onHide={this.handleHideModal}>
        <Modal.Header>
          <Modal.Title>Send Feedback</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <label htmlFor='subject-field'>Subject</label>
          <Input id='subject-field'
            ref='subjectField'
            type='text'
            disabled={sending}
            value={subject}
            onChange={this.handleSubjectChanged} />

          <label htmlFor='message-field'>Message</label>
          <Input id='message-field' required
            type='textarea' rows='5'
            disabled={sending}
            value={message}
            onChange={this.handleMessageChanged} />
        </Modal.Body>
        <Modal.Footer>
          <Button ref='modalCancel' onClick={this.handleHideModal}>Cancel</Button>
          <Button bsStyle='primary'
            disabled={sending || message === '' || message == null}
            onClick={sending ? null : this.handleSendFeedback}>
            {sending ? 'Sending...' : 'Send'}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}
