import React from 'react';
import { DropdownButton, MenuItem, OverlayTrigger, Tooltip, Badge } from 'react-bootstrap';
import userStore from 'stores/user-store';
import orgStore from 'stores/org-store';

export default class Containers extends React.Component {
  displayName: 'Containers'

  constructor(props) {
    super(props);
    this.state = {
      user: userStore.user,
      orgs: orgStore.orgs
    };
  }

  componentDidMount() {
    userStore.onChange(this.userStoreDidChange);
    orgStore.onChange(this.orgStoreDidChange);
  }

  componentWillUnmount() {
    userStore.offChange(this.userStoreDidChange);
    orgStore.offChange(this.orgStoreDidChange);
  }

  userStoreDidChange = () => {
    this.setState({ user: userStore.user });
  };

  orgStoreDidChange = () => {
    this.setState({ orgs: orgStore.orgs });
  };

  handleSwitcherMenu = () => {
  };

  render() {
    const user = this.state.user,
          orgs = this.state.orgs;

    const switcherTooltip = (
      <Tooltip>Switch Dashboard Context</Tooltip>
    );
    const usernameWithGravatar = user ? (
      <span>
        <img className='gravatar' src={user.gravatar(40)} />
        {user.name || user.username}
      </span>
    ) : '';
    const orgsWithGravatars = orgs ?
      orgs.toArray().map((org) => {
        return (
          <MenuItem key={org.id} disabled>
            <img className='gravatar' src={org.gravatar(40)} />
            {org.name}
          </MenuItem>
        );
      })
    : '';

    return (
      <div className='containers-component'>
        <div className='container'>
          {user ? (
            <OverlayTrigger lacement='right' overlay={switcherTooltip}>
              <DropdownButton className='context-switcher' title={usernameWithGravatar} onSelect={this.handleSwitcherMenu}>
                <MenuItem header>Personal</MenuItem>
                <MenuItem>{usernameWithGravatar}</MenuItem>
                <MenuItem divider />
                {orgs ? <MenuItem header>Organization</MenuItem> : ''}
                {orgsWithGravatars}
                {orgs ? <MenuItem divider /> : ''}
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
