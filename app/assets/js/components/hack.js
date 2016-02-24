import React, { PropTypes } from 'react';

import { PortBinding } from 'records/container-config';
import hackActions from 'actions/hack-actions';
import containerActions from 'actions/container-actions';
import hackStore from 'stores/hack-store';
import hostStore from 'stores/host-store';
import LoadingIndicator from 'components/loading-indicator';

export default class Hack extends React.Component {
  displayName = 'Hack';

  static propTypes = {
    query: PropTypes.shape({
      repo: PropTypes.string
    })
  }

  findHost = () => {
    const { userHosts, orgHosts } = hostStore;
    if (userHosts.size > 0) {
      // TODO We should return the first host that has not yet hit the container limit.
      return userHosts.first();
    }
    return orgHosts.first();
  }

  state = {
    host: this.findHost(),
    owner: null,
    projectName: null,
    template: null,
    ports: null
  };

  //static willTransitionTo = (transition, params, query) => {
    //const { userHosts } = hostStore;

    //if (userHosts.size > 0) {
      //return transition.redirect('new-container', {
        //hostSlug: userHosts.first().slug
      //}, {
        //tab: 'hack',
        //repo: query.repo
      //});
    //}
  //}

  componentDidMount() {
    hackStore.on('fetched-repo-info', this.onRepoInfoFetched);

    const { repo } = this.props.query;
    if (repo) {
      hackActions.fetchRepoInfo(repo);
    }
  }

  componentWillUnmount() {
    hackStore.off('fetched-repo-info', this.onRepoInfoFetched);
  }

  onRepoInfoFetched = (data) => {
    const { hack } = data;
    if (hack) {
      const { template, ports, repoName, owner } = hack,
            { host } = this.state;
      const serializedPorts = ports.map((port) => {
        return (new PortBinding({
          public: true,
          containerPort: port,
          tcp: true
        })).serialize();
      });

      this.setState({ template, ports, repoName, owner });
      containerActions.createAtomic(this.projectName(), host, {
        template, ports: serializedPorts, publishAll: true
      });
    }
  }

  projectName = () => {
    const { repoName } = this.state;
    return repoName;
  }

  render() {
    return (
      <div className='hack-component'>
        <LoadingIndicator large />
      </div>
    );
  }
}
