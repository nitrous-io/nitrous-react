import React, { PropTypes } from 'react';

import Org from 'records/org';
import orgMemberActions from 'actions/org-member-actions';
import orgMemberStore from 'stores/org-member-store';
import LoadingIndicator from 'components/loading-indicator';

export default class OrgMembers extends React.Component {
  displayName = 'OrgMembers';

  static contextTypes = {
    router: PropTypes.func.isRequired
  };

  static propTypes = {
    org: PropTypes.instanceOf(Org).isRequired
  };

  state = {
    members: orgMemberStore.orgMembersByOrgSlug(this.props.org.slug)
  }

  componentDidMount() {
    orgMemberStore.onChange(this.orgMemberStoreDidChange);
    orgMemberActions.fetchAllByOrgSlug(this.props.org.slug);
  }

  componentWillUnmount() {
    orgMemberStore.offChange(this.orgMemberStoreDidChange);
  }

  orgMemberStoreDidChange = () => {
    const members = orgMemberStore.orgMembersByOrgSlug(this.props.org.slug);
    this.setState({ members });
  }

  render() {
    const { org } = this.props,
          { members } = this.state,
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
        <ul>
          {members.map((member) => {
            return (
              <li key={`member-${member.id}`}>{member.username}</li>
            );
          })}
        </ul>
      </div>
    );
  }
}
