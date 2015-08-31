import React, { PropTypes } from 'react';
import { Col, Button } from 'react-bootstrap';
import Region from 'records/region';
import classNames from 'classnames';

export default class RegionListItem extends React.Component {
  displayName: 'RegionListItem'

  static propTypes = {
    region: PropTypes.instanceOf(Region).isRequired,
    selected: PropTypes.bool.isRequired,
    onSelect: PropTypes.func.isRequired
  };

  handleClick = () => {
    this.props.onSelect(this.props.region);
  };

  render() {
    const region = this.props.region,
          selected = this.props.selected;

    return (
      <Col lg={2} md={3} sm={4} xs={6} className='region-list-item-component'>
        <div className={classNames('ui-card', { selected })}>
          <div className='ui-card-body'>
            <h4>{region.name}</h4>
            <div className='description'>{region.slug}</div>
            <Button onClick={this.handleClick} bsStyle={selected ? 'primary' : 'default'} block>Select</Button>
          </div>
        </div>
      </Col>
    );
  }
}
