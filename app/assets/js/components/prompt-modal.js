import React, { PropTypes } from 'react';
import { Modal, Button, Input } from 'react-bootstrap';

export default class PromptModal extends React.Component {
  displayName = 'PromptModal';

  static propTypes = {
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(React.PropTypes.node),
      PropTypes.node
    ]),
    okButtonLabel: PropTypes.string.isRequired,
    okButtonStyle: PropTypes.string.isRequired,
    okButtonDisabled: PropTypes.bool.isRequired,
    placeholder: PropTypes.string,
    onCancel: PropTypes.func,
    onOK: PropTypes.func,
    onTextInput: PropTypes.func
  };

  static defaultProps = {
    okButtonLabel: 'OK',
    okButtonStyle: 'default',
    okButtonDisabled: false,
    placeholder: ''
  };

  state = {
    showModal: false
  };

  show() {
    this.setState({ showModal: true }, () => {
      const textField = this.refs.textField.getInputDOMNode();
      textField.select();
      textField.focus();
    });
  }

  hide() {
    this.setState({ showModal: false });
  }

  handleCancel = () => {
    this.setState({ showModal: false }, () => {
      if (typeof this.props.onCancel === 'function') {
        this.props.onCancel();
      }
    });
  };

  handleOK = () => {
    this.setState({ showModal: false }, () => {
      if (typeof this.props.onOK === 'function') {
        this.props.onOK();
      }
    });
  };

  handleTextInput = () => {
    if (typeof this.props.onTextInput === 'function') {
      this.props.onTextInput(this.refs.textField.getValue());
    }
  };

  render() {
    return (
      <Modal className='prompt-modal-component' show={this.state.showModal} onHide={this.handleCancel}>
        <Modal.Body>
          {this.props.children}
          <Input ref='textField' type='text' placeholder={this.props.placeholder} onChange={this.handleTextInput} />
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.handleCancel}>Cancel</Button>
          <Button bsStyle={this.props.okButtonStyle} onClick={this.handleOK} disabled={this.props.okButtonDisabled}>{this.props.okButtonLabel}</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}
