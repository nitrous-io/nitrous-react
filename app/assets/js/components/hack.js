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
    done: false,
    logs: ['Getting repository info...']
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
    containerStore.on('create-failed', this.onContainerCreateFailed);
    containerStore.on('ran-command', this.onContainerCommandRan);

    const { repo } = this.props.query;
    if (repo) {
      hackActions.fetchRepoInfo(repo);
    }
  }

  componentWillUnmount() {
    hackStore.off('fetched-repo-info', this.onRepoInfoFetched);
    containerStore.off('created', this.onContainerCreated);
    containerStore.off('create-failed', this.onContainerCreateFailed);
    containerStore.off('ran-command', this.onContainerCommandRan);
  }

  onContainerCommandRan = () => {
    this.log('Done!');
    const redirectUrl = `/ide/#/${this.state.container.slug}`;
    window.location.href = redirectUrl;
  };


  onContainerCreated = (data) => {
    const { container, hostSlug } = data,
          { host } = this.state;

    if (this.projectName() === container.name
        && host.slug === hostSlug) {
      this.setState({ container });
      this.log(`Created project "${this.projectName()}".`,
          'Cloning repository and execute nitrous-post-create.sh...');

      containerActions.runCommand(
        container,
        `. /etc/profile && cd && git clone ${this.props.query.repo} && cd ${this.projectName()} && ./nitrous-post-create.sh`,
        1800
      );
    }
  };

  onContainerCreateFailed = (data) => {
    const { name, hostSlug } = data;
    if ((this.projectName() === name) && (this.state.host.slug === hostSlug)) {
      this.log(`Failed to create project "${this.projectName()}".`);
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

      this.log('Retrieved repository info.', `Creating project "${repoName}"...`);

      containerActions.createAtomic(this.projectName(), host, {
        template, ports: serializedPorts, publishAll: true
      });
    }
  }

  projectName = () => {
    const { repoName } = this.state;
    return repoName;
  }

  log = (...newLogs) => {
    const logs = this.state.logs;
    newLogs.forEach((newLog) => {
      logs.push(newLog);
    });
    this.setState({ logs });
  }

  renderLogs = () => {
    const { logs } = this.state;
    return (
      <div>
        {logs.map((log) => {
          return <p>{log}</p>;
        })}
      </div>
    );
  }

  render() {
    const { done } = this.state;

    return (
      <div className='hack-component'>
        <h2>Your new container &ldquo;{this.projectName()}&rdquo; is being created...</h2>
        <p>This may take several minutes to complete.</p>
        <EtaProgressBar eta={200} done={done} />
        {this.renderLogs()}
      </div>
    );
  }
}
