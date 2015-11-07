import React, { PropTypes } from 'react';
import { Grid, Row, Col, ListGroup, ListGroupItem, Button, Input, Label } from 'react-bootstrap';

import Org from 'records/org';
import orgMemberActions from 'actions/org-member-actions';
import snackbarActions from 'actions/snackbar-actions';
import orgMemberStore from 'stores/org-member-store';
import userStore from 'stores/user-store';
import LoadingIndicator from 'components/loading-indicator';
import Fa from 'components/fa';

export default class OrgMembers extends React.Component {
  displayName = 'OrgMembers';

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
    newMemberRole: 'member', // TODO Member roles should be constants somewhere.
    adding: false,
    addFailed: false,
    updatingMember: false
  }

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
  }

  onOrgMemberRemoveFailed = (data) => {
    this.postEditError(data);
  }

  onOrgMemberUpdateFailed = (data) => {
    this.postEditError(data);
  }

  postEditError = (data) => {
    const { orgSlug, member, errorMessage } = data;
    if (orgSlug !== this.props.org.slug || member !== this.state.newMember) {
      return;
    }

    if (errorMessage === orgMemberStore.MEMBER_NOT_FOUND) {
      snackbarActions.post(`${member} doesn't have a Nitrous account.`);
      return;
    }

    snackbarActions.post(errorMessage);
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

  handleNewMemberChanged = (event) => {
    this.setState({ newMember: event.target.value });
  }

  handleNewMemberRoleChanged = (event) => {
    this.setState({ newMemberRole: event.target.value });
  }

  render() {
    const { members, user, newMember, newMemberRole,
            adding, addFailed, updatingMember } = this.state,
          loading = (members == null);

    if (loading) {
      return (
        <div className='org-members-component'>
          <LoadingIndicator />
        </div>
      );
    }

    return (
      <div className='org-members-component'>
        <ListGroup>
          {members.map((member) => {
            const isSelf = (user.id === member.userId);

            return (
              <ListGroupItem key={`member-${member.id}`}>
                <Grid>
                  <Row>
                    <Col lg={6} md={6} sm={6} xs={6}>
                      <img className='gravatar' src={member.gravatar(72)} />
                      <span>{member.username}</span>
                    </Col>
                    <Col lg={4} md={4} sm={4} xs={4}>
                      {isSelf ? (
                        <div className='org-member-role'>
                          <span>{member.role}</span>
                          <Label bsStyle='success'>You</Label>
                        </div>
                      ) : (
                        <select className='form-control'
                          value={member.role}
                          disabled={!!updatingMember}
                          onChange={(e) => this.handleMemberRoleChanged(e, member)}>
                          <option value='owner'>Owner</option>
                          <option value='admin'>Admin</option>
                          <option value='member'>Member</option>
                          <option value='limited'>Limited</option>
                        </select>
                      )}
                    </Col>
                    <Col lg={2} md={2} sm={2} xs={2}>
                      {!isSelf ? (
                        <Button bsStyle='warning' className='pull-right'
                          onClick={this.handleRemoveMember.bind(this, member)}>
                          <Fa icon='trash' />
                        </Button>
                      ) : ''}
                    </Col>
                  </Row>
                </Grid>
              </ListGroupItem>
            );
          })}
        </ListGroup>

        <form onSubmit={this.handleAddMember}>
          <Grid>
            <Row>
              <Col lg={12}>
                <label htmlFor='add-new-member'>Add New Member</label>
              </Col>
            </Row>

            <Row>
              <Col lg={6} md={6} sm={6} xs={6}>
                <Input type='text' required placeholder='Username or email'
                  id='add-new-member'
                  value={newMember}
                  disabled={adding}
                  bsStyle={addFailed ? 'error' : null}
                  onChange={this.handleNewMemberChanged} />
              </Col>

              <Col lg={4} md={6} sm={6} xs={6}>
                <select className='form-control' defaultValue='member'
                  disabled={adding}
                  value={newMemberRole}
                  onChange={this.handleNewMemberRoleChanged}>
                  <option value='owner'>Owner</option>
                  <option value='admin'>Admin</option>
                  <option value='member'>Member</option>
                  <option value='limited'>Limited</option>
                </select>
              </Col>

              <Col lg={2} md={12} sm={12} xs={12}>
                <Button type='submit' disabled={adding}>{adding ? 'Adding...' : 'Add'}</Button>
              </Col>
            </Row>
          </Grid>
        </form>
      </div>
    );
  }
}
