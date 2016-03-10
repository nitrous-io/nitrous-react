import React, { PropTypes } from 'react';

import { PortBinding } from 'records/container-config';
import hackActions from 'actions/hack-actions';
import containerActions from 'actions/container-actions';
import hostActions from 'actions/host-actions';
import snackbarActions from 'actions/snackbar-actions';
import containerStore from 'stores/container-store';
import planStore from 'stores/plan-store';
import hackStore from 'stores/hack-store';
import userStore from 'stores/user-store';
import hostStore from 'stores/host-store';
import regionStore from 'stores/region-store';
import LoadingIndicator from 'components/loading-indicator';
import term from 'term.js';

export default class Hack extends React.Component {
  displayName = 'Hack';

  static contextTypes = {
    router: PropTypes.func.isRequired
  };

  static propTypes = {
    query: PropTypes.shape({
      repo: PropTypes.string
    })
  }

  findTerminal = () => {
    if (!this.state.terminal) {
      this.setState({
        terminal: (new term.Terminal({
          cols: 80,
          rows: 24,
          useStyle: true,
          screenKeys: true,
          cursorBlink: false
        }))
      });
    }

    return this.state.terminal;
  }

  // First find a running user host, otherwise return an org host.
  findHost = () => {
    const { userHosts, orgHosts } = hostStore;
    let host = null;
    if (userHosts.size > 0) {
      host = userHosts.find((h) => {
        // FIXME: find stopped host as well so that we can start it and use it.
        return h.state === 'running';
      });
    }
    if (!host && orgHosts.size > 0) {
      host = orgHosts.find((h) => {
        return h.state === 'running';
      });
    }
    return host;
  }

  state = {
    host: this.findHost(),
    user: userStore.user,
    owner: null,
    template: null,
    serializedPorts: null,
    container: null,
    logs: ['Retrieving repository info...'],
    terminal: null
  };

  static willTransitionTo = (transition) => {
    const { userHosts } = hostStore;
    const { freePlan } = planStore;
    if (!userHosts && !freePlan) {
      transition.redirect('new-user-host');
    }
  }

  componentDidMount() {
    hackStore.on('fetched-repo-info', this.onRepoInfoFetched);
    hackStore.on('fetch-repo-info-failed', this.onRepoInfoFetchFailed);
    hostStore.on('created', this.onHostCreated);
    hostStore.on('create-failed', this.onHostCreateFailed);
    containerStore.on('created', this.onContainerCreated);
    containerStore.on('create-failed', this.onContainerCreateFailed);
    containerStore.on('run-command', this.onContainerCommandRun);
    containerStore.on('running-command', this.onContainerCommandRunning);
    containerStore.on('ran-command', this.onContainerCommandRan);
    containerStore.on('run-command-failed', this.onContainerCommandRunFailed);

    const { repo } = this.props.query;
    if (repo) {
      hackActions.fetchRepoInfo(repo);
    }
  }

  componentWillUnmount() {
    hackStore.off('fetched-repo-info', this.onRepoInfoFetched);
    hackStore.off('fetch-repo-info-failed', this.onRepoInfoFetchFailed);
    hostStore.off('created', this.onHostCreated);
    hostStore.off('create-failed', this.onHostCreateFailed);
    containerStore.off('created', this.onContainerCreated);
    containerStore.off('create-failed', this.onContainerCreateFailed);
    containerStore.off('run-command', this.onContainerCommandRun);
    containerStore.off('running-command', this.onContainerCommandRunning);
    containerStore.off('ran-command', this.onContainerCommandRan);
    containerStore.off('run-command-failed', this.onContainerCommandRunFailed);
  }

  onContainerCommandRun = () => {
    this.log((<span id="run-command-terminal"></span>));
    this.findTerminal().open(document.getElementById("run-command-terminal"));
  };

  onContainerCommandRunning = (data) => {
    this.findTerminal().write(data.data);
  };

  onContainerCommandRan = () => {
    this.log('Done!');
    const redirectUrl = `/ide/#/${this.state.container.slug}`;
    window.location.href = redirectUrl;
    this.findTerminal().terminal.destroy();
  };

  onContainerCommandRunFailed = () => {
    this.log('Failed to clone project or execute nitrous-post-create.sh.');
  };

  onHostCreated = (data) => {
    const { host } = data;
    this.setState({ host });

    this.log('Workstation created.', `Creating project "${this.projectName()}"...`);

    const { template, serializedPorts } = this.state;
    containerActions.createAtomic(this.projectName(), host, {
      template, serializedPorts, publishAll: true
    });
  };

  onHostCreateFailed = () => {
    snackbarActions.post('There was a problem creating a workstation. Please create one manually.');
    this.context.router.transitionTo('new-user-host');
  };

  onContainerCreated = (data) => {
    const { container, hostSlug } = data,
          { host } = this.state;

    if (this.projectName() === container.name
        && host.slug === hostSlug) {
      this.setState({ container });
      this.log(`Created project "${this.projectName()}".`,
          'Cloning repository and executing nitrous-post-create.sh...');

      containerActions.runCommand(
        host,
        container,
        `. /etc/profile && cd && git clone ${this.props.query.repo} && cd ${this.projectName()} && ./nitrous-post-create.sh; echo "Run command done."`,
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
      const { template, ports, repoName, owner } = hack;
      const serializedPorts = ports.map((port) => {
        return (new PortBinding({
          public: true,
          containerPort: port,
          tcp: true
        })).serialize();
      });
      this.setState({ template, serializedPorts, owner, repoName });

      // If a user don't have host, we create a free host for them,
      // and then create a container
      const { host, user } = this.state;
      if (!host) {
        const logs = this.state.logs;
        logs.push(`Creating workstation...`);
        this.setState({ logs });
        hostActions.create({
          name: user.username,
          plan: planStore.freePlan,
          // TODO: Should assign an appropriate region instead of
          // always using the 1st region
          region: regionStore.regions.first()
        });
        return;
      }

      this.setState({ template, ports, repoName, owner });

      this.log('Retrieved repository info.', `Creating project "${repoName}"...`);

      containerActions.createAtomic(this.projectName(), host, {
        template, ports: serializedPorts, publishAll: true
      });
    }
  }

  onRepoInfoFetchFailed = () => {
    const { user } = this.state,
          { canDeleteGitHubPublicKeys } = user.userProfile,
          { makeHref } = this.context.router,
          connectURL = makeHref('account-settings');
    let failedMessageJSX = null;

    // canDeleteGitHubPublicKeys means user has already connected to github
    if (canDeleteGitHubPublicKeys) {
      failedMessageJSX = (
        <span>
          nitrous.json not found.
        </span>
      );
    } else {
      failedMessageJSX = (
        <span>
          Failed to retrieve repository info.
          Please <a href={connectURL}>connect to GitHub</a> and try again.
        </span>
      );
    }
    this.log(failedMessageJSX);
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
    return (
      <div className='hack-component'>
        <h2>Your new project &ldquo;{this.projectName()}&rdquo; is being created...</h2>
        <p>This may take several minutes to complete.</p>
        <LoadingIndicator />
        {this.renderLogs()}
      </div>
    );
  }
}
