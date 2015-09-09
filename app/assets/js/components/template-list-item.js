import React, { PropTypes } from 'react';
import { Col, Button } from 'react-bootstrap';
import Template from 'records/template';
import classNames from 'classnames';

export default class TemplateListItem extends React.Component {
  displayName: 'TemplateListItem'

  static propTypes = {
    template: PropTypes.instanceOf(Template).isRequired,
    selected: PropTypes.bool.isRequired,
    onSelect: PropTypes.func.isRequired
  };

  handleClick = () => {
    this.props.onSelect(this.props.template);
  };

  render() {
    const { template, selected } = this.props;

    return (
      <Col lg={3} md={4} sm={6} xs={12} className='template-list-item-component'>
        <Button className={classNames('ui-card', { selected })} onClick={this.handleClick}>
          <div className='ui-card-body'>
            <div className='template'>
              <div className='template-icon' style={{ backgroundImage: `url(${Template.defaultIconUrl})` }}>
                <div style={{ backgroundImage: `url(${template.iconUrl})` }}></div>
              </div>
              <h4>{template.name}</h4>
            </div>
          </div>
        </Button>
      </Col>
    );
  }
}
