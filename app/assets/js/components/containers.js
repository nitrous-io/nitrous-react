import React from 'react';
import { DropdownButton, MenuItem, OverlayTrigger, Tooltip, Badge } from 'react-bootstrap';
import userStore from 'stores/user-store';

export default class Containers extends React.Component {
  displayName: 'Containers'

  constructor(props) {
    super(props);
    this.state = {
      user: userStore.user
    };
  }

  componentDidMount() {
    userStore.onChange(this.userStoreDidChange);
  }

  componentWillUnmount() {
    userStore.offChange(this.userStoreDidChange);
  }

  userStoreDidChange = () => {
    this.setState({
      user: userStore.user
    });
  }

  handleSwitcherMenu = () => {
  };

  render() {
    const user = this.state.user;
    const switcherTooltip = (
      <Tooltip>Switch Dashboard Context</Tooltip>
    );

    return (
      <div className='containers-component'>
        <div className='container'>
          {user ? (
            <OverlayTrigger placement='right' overlay={switcherTooltip}>
              <DropdownButton title={user.username} onSelect={this.handleSwitcherMenu}>
                <MenuItem header>Personal</MenuItem>
                <MenuItem>{user.username}</MenuItem>
                <MenuItem divider />
                <MenuItem header>Organization</MenuItem>
                <MenuItem disabled>Nitrous</MenuItem>
                <MenuItem divider />
                <MenuItem disabled>
                  Shared
                  <Badge eventKey='shared' pullRight>1</Badge>
                </MenuItem>
                <MenuItem divider />
                <MenuItem eventKey='manage-orgs' disabled>Manage Organizations...</MenuItem>
                <MenuItem eventKey='create-org' disabled>Create Organization...</MenuItem>
              </DropdownButton>
            </OverlayTrigger>
          ) : ''}
        </div>
      </div>
    );
  }
}
