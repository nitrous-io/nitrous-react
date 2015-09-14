import React, { PropTypes } from 'react';
import classNames from 'classnames';

export default class SelectableText extends React.Component {
  displayName = 'SelectableText';

  static propTypes = {
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(React.PropTypes.node),
      PropTypes.node
    ]),
    className: PropTypes.string
  };

  handleClick = () => {
    const span = this.refs.textSpan.getDOMNode(),
          sel = window.getSelection(),
          range = document.createRange();
    range.selectNodeContents(span);
    sel.removeAllRanges();
    sel.addRange(range);
  };

  render() {
    return (
      <span ref='textSpan' className={classNames('selectable-text-component', this.props.className)} onClick={this.handleClick}>
        {this.props.children}
      </span>
    );
  }
}
