import React, { cloneElement } from 'react';
import classNames from 'classnames';
import { utils } from 'react-bootstrap';
const { ValidComponentChildren } = utils;

const Breadcrumb = React.createClass({
  displayName: 'Breadcrumb',

  propTypes: {
    /**
     * bootstrap className
     * @private
     */
    bsClass: React.PropTypes.string,
    className: React.PropTypes.string,
    children: React.PropTypes.oneOfType([
      React.PropTypes.node,
      React.PropTypes.arrayOf(React.PropTypes.node)
    ])
  },

  getDefaultProps() {
    return {
      bsClass: 'breadcrumb'
    };
  },

  render() {
    const { className, ...props } = this.props;

    return (
      <ol
        {...props}
        role="navigation"
        aria-label="breadcrumbs"
        className={classNames(className, this.props.bsClass)}>
        {ValidComponentChildren.map(this.props.children, this.renderBreadcrumbItem)}
      </ol>
    );
  },

  renderBreadcrumbItem(child, index) {
    return cloneElement( child, { key: child.key ? child.key : index } );
  }
});

export default Breadcrumb;
