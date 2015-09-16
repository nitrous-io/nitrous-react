import React, { PropTypes } from 'react';
import { Nav, NavItem } from 'react-bootstrap';
import containerStore from 'stores/container-store';
import containerActions from 'actions/container-actions';
import ContextSwitcher from 'components/context-switcher';
import ContainerList from 'components/container-list';

export default class SharedContainers extends React.Component {
  displayName = 'SharedContainers';

  static contextTypes = {
    router: PropTypes.func.isRequired // Router.PropTypes.router.isRequired
  };

  state = {
    containers: containerStore.sharedContainers
  };

  componentDidMount() {
    containerStore.onChange(this.containerStoreDidChange);
    containerActions.fetchAllShared();
  }

  componentWillUnmount() {
    containerStore.offChange(this.containerStoreDidChange);
  }

  containerStoreDidChange = () => {
    this.setState({ containers: containerStore.sharedContainers });
  };

  render() {
    const { makeHref } = this.context.router,
          containers = this.state.containers.toList();

    return (
      <div className='shared-containers-component'>
        <div className='container'>
          <ContextSwitcher shared />
          <Nav className='ui-centered-tabs' bsStyle='tabs' activeKey='containers'>
            <NavItem href={makeHref('shared-containers')} eventKey='containers'>Projects</NavItem>
          </Nav>
          <ContainerList containers={containers} />
        </div>
      </div>
    );
  }
}
