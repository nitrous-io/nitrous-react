import React, { PropTypes } from 'react';
import { Input } from 'react-bootstrap';
import classNames from 'classnames';

export default class SelectableTextarea extends React.Component {
  displayName = 'SelectableTextarea';

  static propTypes = {
    className: PropTypes.string,
    readOnly: PropTypes.bool,
    rows: PropTypes.string,
    value: PropTypes.any
  };

  handleClick = () => {
    this.refs.textarea.getInputDOMNode().select();
  };

  render() {
    return (
      <Input
        ref='textarea'
        type='textarea'
        className={classNames('selectable-textarea-component', this.props.className)}
        readOnly={this.props.readOnly}
        rows={this.props.rows}
        value={this.props.value}
        onClick={this.handleClick} />
    );
  }
}
