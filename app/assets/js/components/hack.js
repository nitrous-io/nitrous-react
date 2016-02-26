import React, { PropTypes } from 'react';

import { PortBinding } from 'records/container-config';
import hackActions from 'actions/hack-actions';
import containerActions from 'actions/container-actions';
import containerStore from 'stores/container-store';
import hackStore from 'stores/hack-store';
import hostStore from 'stores/host-store';
import EtaProgressBar from 'components/eta-progress-bar';

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
    template: null,
    ports: null,
    container: null,
    done: false
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
    containerStore.on('created', this.onContainerCreated);
    containerStore.on('ran-command', this.onContainerCommandRan);

    const { repo } = this.props.query;
    if (repo) {
      hackActions.fetchRepoInfo(repo);
    }
  }

  componentWillUnmount() {
    hackStore.off('fetched-repo-info', this.onRepoInfoFetched);
    containerStore.off('created', this.onContainerCreated);
    containerStore.off('ran-command', this.onContainerCommandRan);
  }

  onContainerCommandRan = () => {
    this.setState({ done: true });
    const redirectUrl = `/ide/#/${this.state.container.slug}`;
    window.location.href = redirectUrl;
  };

  onContainerCreated = (data) => {
    const { container, hostSlug } = data,
          { host } = this.state;

    if (this.projectName() === container.name
        && host.slug === hostSlug) {
      this.setState({ container });
      containerActions.runCommand(
        container,
        `. /etc/profile && cd && git clone ${this.props.query.repo} && cd ${this.projectName()} && ./nitrous-post-create.sh`,
        1800
      );
    }
  };

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
    const { done } = this.state;

    return (
      <div className='hack-component'>
        <h2>Your new container &ldquo;{this.projectName()}&rdquo; is being created...</h2>
        <p>This may take several minutes to complete.</p>
        <EtaProgressBar eta={200} done={done} />
      </div>
    );
  }
}
