import React, { PropTypes } from 'react';
import { Grid, Row, Col, ListGroup, ListGroupItem, Button, Input, Label } from 'react-bootstrap';

import Org from 'records/org';
import { Roles } from 'records/org-member';
import orgMemberActions from 'actions/org-member-actions';
import snackbarActions from 'actions/snackbar-actions';
import orgMemberStore from 'stores/org-member-store';
import userStore from 'stores/user-store';
import LoadingIndicator from 'components/loading-indicator';
import Fa from 'components/fa';

export default class OrgMemberList extends React.Component {
  displayName = 'OrgMemberList';

  static contextTypes = {
    router: PropTypes.func.isRequired
  };

  static propTypes = {
    org: PropTypes.instanceOf(Org).isRequired
  };

  state = {
    members: orgMemberStore.orgMembersByOrgSlug(this.props.org.slug),
    user: userStore.user,
    newMember: null,
    newMemberRole: Roles.DefaultRole,
    adding: false,
    addFailed: false,
    updatingMember: false
  };

  componentDidMount() {
    orgMemberStore.onChange(this.orgMemberStoreDidChange);
    orgMemberStore.on('add-failed', this.onOrgMemberAddFailed);
    orgMemberStore.on('remove-failed', this.onOrgMemberRemoveFailed);
    orgMemberStore.on('update-failed', this.onOrgMemberUpdateFailed);
    orgMemberActions.fetchAllByOrgSlug(this.props.org.slug);
    userStore.onChange(this.userStoreDidChange);
  }

  componentWillUnmount() {
    orgMemberStore.offChange(this.orgMemberStoreDidChange);
    orgMemberStore.off('add-failed', this.onOrgMemberAddFailed);
    orgMemberStore.off('remove-failed', this.onOrgMemberRemoveFailed);
    orgMemberStore.off('update-failed', this.onOrgMemberUpdateFailed);
    userStore.offChange(this.userStoreDidChange);
  }

  orgMemberStoreDidChange = () => {
    const members = orgMemberStore.orgMembersByOrgSlug(this.props.org.slug);
    this.setState({ members });

    // If we were adding a member while the store is changed, check whether the
    // member was added.
    if (this.state.adding) {
      const { newMember } = this.state;
      const added = members.find((member) => {
        return member.username === newMember || member.email === newMember;
      });
      if (added) {
        this.setState({ adding: false, addFailed: false, newMember: null });
        this.refs.newMember.getInputDOMNode().focus();
      }
    }

    // If we were updating a member while the store is changed, check whether
    // the member was updated.
    const { updatingMember } = this.state;
    if (updatingMember) {
      const updated = members.find((member) => {
        return member.id === updatingMember.id;
      });
      if (updated) {
        this.setState({ updatingMember: null });
      }
    }
  }

  onOrgMemberAddFailed = (data) => {
    this.setState({ adding: false, addFailed: true });
    this.postEditError(data);
    this.refs.newMember.getInputDOMNode().focus();
  }

  onOrgMemberRemoveFailed = (data) => {
    this.postEditError(data);
  }

  onOrgMemberUpdateFailed = (data) => {
    this.postEditError(data);
  }

  postEditError = (data) => {
    const { orgSlug, member, errorMessage } = data;
    if (orgSlug !== this.props.org.slug) {
      return;
    }

    switch (errorMessage) {
      case orgMemberStore.NOT_ALLOWED: {
        snackbarActions.post('You do not have sufficient privileges to perform this action.');
        break;
      }
      case orgMemberStore.MEMBER_NOT_FOUND: {
        snackbarActions.post(`${member} doesn't have a Nitrous account.`);
        break;
      }
      default: {
        snackbarActions.post(errorMessage);
      }
    }
  }

  userStoreDidChange = () => {
    this.setState({ user: userStore.user });
  }

  handleRemoveMember = (member) => {
    const memberIdentifier = member.username || member.email;
    orgMemberActions.remove(this.props.org.slug, memberIdentifier);
  }

  handleMemberRoleChanged = (event, member) => {
    const memberIdentifier = member.username || member.email,
          newRole = event.target.value;
    this.setState({ updatingMember: member });
    orgMemberActions.update(this.props.org.slug, memberIdentifier, newRole);
  }

  handleAddMember = (event) => {
    event.preventDefault();

    this.setState({ adding: true });

    const { newMember, newMemberRole } = this.state;
    orgMemberActions.add(this.props.org.slug, newMember, newMemberRole);
  }

  handleNewMemberChanged = () => {
    const value = this.refs.newMember.getValue();
    this.setState({ newMember: value });
  };

  handleNewMemberRoleChanged = () => {
    const value = this.refs.newMemberRole.getValue();
    this.setState({ newMemberRole: value });
  };

  render() {
    const { members, user, newMember, newMemberRole,
          adding, addFailed, updatingMember } = this.state,
          loading = (members == null);

    if (loading) {
      return (
        <div className='org-member-list-component'>
          <LoadingIndicator />
        </div>
      );
    }

    const allowedRoles = Roles.allowedFor(this.props.org.role);

    return (
      <div className='org-member-list-component ui-card-grid'>
        <ListGroup>
          {members.map((member) => {
            const isSelf = (member.userId === user.id),
                  canEditRole = !isSelf && allowedRoles.some((role) => role === member.role);

            return (
              <ListGroupItem key={`member-${member.id}`}>
                <Grid>
                  <Row>
                    <Col lg={1} md={1} sm={1} xs={2} className='user-avatar'>
                      <img className='gravatar' src={member.gravatar(72)} />
                    </Col>
                    <Col lg={1} md={1} sm={1} xs={2} className='collaborator-name'>
                      <strong>{member.username}</strong>
                    </Col>
                    <Col lg={3} md={3} sm={3} xs={4}>
                      {canEditRole ? (
                        <select className='form-control org-member-role'
                          value={member.role}
                          disabled={!!updatingMember}
                          onChange={(e) => this.handleMemberRoleChanged(e, member)}>
                          {allowedRoles.map((role) => {
                            return (
                            <option value={role}
                                key={`member-${member.id}-role-${role}`}>
                                {role}
                              </option>
                            );
                          })}
                        </select>
                      ) : (
                        <div className='org-member-role'>
                          <span>{member.role}</span>
                          {isSelf ? (<Label bsStyle='success'>You</Label>) : ''}
                        </div>
                      )}
                    </Col>
                    <Col lg={7} md={7} sm={7} xs={12} className='actions'>
                      {canEditRole ? (
                        <Button bsStyle='default' className='pull-right'
                          onClick={this.handleRemoveMember.bind(this, member)}>
                          <Fa icon='sign-out' />
                          <span>Remove</span>
                        </Button>
                      ) : ''}
                    </Col>
                  </Row>
                </Grid>
              </ListGroupItem>
            );
          })}
        </ListGroup>

        {allowedRoles.length > 0 ? (
          <form className='new-member-form' onSubmit={this.handleAddMember}>
            <Input className='org-member-role'
              ref='newMemberRole'
              type='select'
              defaultValue={Roles.DefaultRole}
              disabled={adding}
              value={newMemberRole}
              onChange={this.handleNewMemberRoleChanged}>
              {allowedRoles.map((role) => {
                return (<option value={role} key={`role-${role}`}>{role}</option>);
              })}
            </Input>

            <Input type='text' required placeholder='Username or email'
              ref='newMember'
              id='add-new-member'
              value={newMember}
              disabled={adding}
              bsStyle={addFailed ? 'error' : null}
              onChange={this.handleNewMemberChanged}
              buttonAfter={
                <Button type='submit' bsStyle='primary' disabled={adding}>{adding ? 'Adding...' : 'Add'}</Button>
              }/>

          </form>
        ) : ''}
      </div>
    );
  }
}
