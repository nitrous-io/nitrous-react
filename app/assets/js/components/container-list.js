import React, { PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Grid, Row, Col, Button } from 'react-bootstrap';
import Host from 'records/host';
import userStore from 'stores/user-store';
import templateActions from 'actions/template-actions';
import Container from 'records/container';
import LoadingIndicator from 'components/loading-indicator';
import Fa from 'components/fa';
import ContainerListItem from 'components/container-list-item';

export default class ContainerList extends React.Component {
  displayName = 'ContainerList';

  static contextTypes = {
    router: PropTypes.func.isRequired // Router.PropTypes.router.isRequired
  };

  static propTypes = {
    containers: ImmutablePropTypes.listOf(PropTypes.instanceOf(Container)),
    host: PropTypes.instanceOf(Host)
  };

  state = {
    user: userStore.user
  }

  componentDidMount() {
    userStore.onChange(this.userStoreDidChange);

    templateActions.fetchAll();
  }

  componentWillUnmount() {
    userStore.offChange(this.userStoreDidChange);
  }

  userStoreDidChange = () => {
    this.setState({ user: userStore.user });
  }

  canCreateContainer = () => {
    const { containers, host } = this.props,
          { user } = this.state;

    if (!host) {
      return false;
    }

    let containerLimit = host.maxContainers;
    if (!containerLimit || (user && user.maxContainers && containerLimit < user.maxContainers)) {
      containerLimit = user.maxContainers;
    }

    // no limits exist
    if (containerLimit === null) {
      return true;
    }

    return containers.size < containerLimit;
  }

  handleClickNewContainer = () => {
    this.context.router.transitionTo('new-container', { hostSlug: this.props.host.slug });
  };

  render() {
    const { containers, host } = this.props;

    return (
      <div className='container-list-component'>
        {containers == null ? (
          <LoadingIndicator large />
        ) : (
          <Grid className='ui-card-grid'>
            <Row>
              {containers.map((container) => {
                return (<ContainerListItem
                  key={`container-${container.slug}`}
                  container={container}
                  host={host} />);
              })}
              {this.canCreateContainer() ? (
                <Col lg={3} md={4} sm={6} xs={12} className='new-container-btn container-list-item'>
                  <Button className='ui-card' disabled={host.isUnusable} onClick={this.handleClickNewContainer}>
                    <Fa icon='plus' />
                  </Button>
                </Col>
              ) : ''}
            </Row>
          </Grid>
        )}
      </div>
    );
  }
}
