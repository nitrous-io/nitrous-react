import React, { PropTypes } from 'react';

export default class DocsAnchor extends React.Component {
  displayName = 'DocsAnchor';

  static propTypes = {
    id: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]),
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node
    ])
  };

  render() {
    const anchorName = `/ui?focus=${this.props.id}`;

    return (
      <a name={anchorName} href={'#' + anchorName} className="anchor">
        <span className="anchor-icon">#</span>
        {this.props.children}
      </a>
    );
  }
}
