import React, { PropTypes } from 'react';
import classNames from 'classnames';

import { PortBinding } from 'records/container-config';
import quickstartActions from 'actions/quickstart-actions';
import containerActions from 'actions/container-actions';
import hostActions from 'actions/host-actions';
import snackbarActions from 'actions/snackbar-actions';
import containerStore from 'stores/container-store';
import planStore from 'stores/plan-store';
import quickstartStore from 'stores/quickstart-store';
import userStore from 'stores/user-store';
import hostStore from 'stores/host-store';
import regionStore from 'stores/region-store';
import term from 'term.js';

export default class Quickstart extends React.Component {
  displayName = 'Quickstart';
  _terminal = null;

  static contextTypes = {
    router: PropTypes.func.isRequired
  };

  static propTypes = {
    query: PropTypes.shape({
      repo: PropTypes.string
    })
  }

  get terminal() {
    if (!this._terminal) {
      this._terminal = new term.Terminal({
        cols: 80,
        rows: 24,
        useStyle: true,
        screenKeys: true,
        cursorBlink: false
      });
    }

    return this._terminal;
  }

  constructor(props, context) {
    super(props, context);

    // Find a host that hasn't hit the max_container limit, preferring user hosts
    // to org hosts. Stopped hosts are fine - we'll just start them.
    const { userHosts, orgHosts } = hostStore;
    let host = null;
    if (userHosts.size > 0) {
      host = userHosts.find((h) => {
        return !h.containersMaxedOut;
      });
    }
    if (!host && orgHosts.size > 0) {
      host = orgHosts.find((h) => {
        return !h.containersMaxedOut;
      });
    }

    // If there are no eligible hosts because they've all hit the project limit,
    // we'll ask the user to upgrade the host (excluding org hosts).
    let hostToUpgrade = null;
    if (host == null && userHosts.size > 0) {
      hostToUpgrade = userHosts.first();
    }

    this.state = {
      host,
      hostToUpgrade,
      hasHosts: userHosts.size > 0 || orgHosts.size > 0,
      user: userStore.user,
      owner: null,
      template: null,
      serializedPorts: null,
      container: null,
      progressMessages: ['Retrieving repository info...'],
      repoInfoFetched: false,
      repoLogoUrl: null,
      done: false,
      hasError: false,
      showConsole: false
    };
  }

  componentDidMount() {
    quickstartStore.on('fetched-repo-info', this.onRepoInfoFetched);
    quickstartStore.on('fetch-repo-info-failed', this.onRepoInfoFetchFailed);
    hostStore.on('created', this.onHostCreated);
    hostStore.on('create-failed', this.onHostCreateFailed);
    hostStore.on('started', this.onHostStarted);
    containerStore.on('created', this.onContainerCreated);
    containerStore.on('create-failed', this.onContainerCreateFailed);
    containerStore.on('run-command', this.onContainerCommandRun);
    containerStore.on('running-command', this.onContainerCommandRunning);
    containerStore.on('ran-command', this.onContainerCommandRan);
    containerStore.on('run-command-failed', this.onContainerCommandRunFailed);

    const { repo } = this.props.query;
    // TODO If there is no repo in the query string, we should either redirect
    // users elsewhere, or show a form allowing them to specify a repo.
    if (repo) {
      quickstartActions.fetchRepoInfo(repo);
    }

    this.initTerminal();
  }

  componentWillUnmount() {
    quickstartStore.off('fetched-repo-info', this.onRepoInfoFetched);
    quickstartStore.off('fetch-repo-info-failed', this.onRepoInfoFetchFailed);
    hostStore.off('created', this.onHostCreated);
    hostStore.off('create-failed', this.onHostCreateFailed);
    hostStore.off('started', this.onHostStarted);
    containerStore.off('created', this.onContainerCreated);
    containerStore.off('create-failed', this.onContainerCreateFailed);
    containerStore.off('run-command', this.onContainerCommandRun);
    containerStore.off('running-command', this.onContainerCommandRunning);
    containerStore.off('ran-command', this.onContainerCommandRan);
    containerStore.off('run-command-failed', this.onContainerCommandRunFailed);
  }

  onContainerCommandRun = () => {
    this.terminalPrint(`Running nitrous-post-create.sh from repository...`);
  };

  onContainerCommandRunning = (data) => {
    this.terminal.write(data.data);
  };

  onContainerCommandRan = () => {
    this.logProgress(`We're all done! Redirecting to the IDE...`);
    this.terminalPrintSuccess(`Ran nitrous-post-create.sh, redirecting to the IDE...`);
    this.setState({ done: true });

    const ideUrl = `/ide/#/${this.state.container.slug}`;
    window.location.href = ideUrl;
    this.terminal.destroy();
  };

  onContainerCommandRunFailed = () => {
    this.logProgress(`Failed to clone repository or execute nitrous-post-create.sh.`);
    this.terminalPrintError(`Error cloning repository ${this.props.query.repo}.`);
    // TODO What happens now? Ideally we should show the user exactly what went
    // wrong (i.e. we should be able to tell the difference between a failed
    // git clone and an error in running nitrous-post-create.sh), and give them
    // a way to go to the IDE anyway.
  };

  onHostCreated = (data) => {
    const { host } = data;
    this.setState({ host });

    this.logProgress('Workstation created.');
    this.terminalPrintSuccess(`OK - a new workstation "${host.slug}" has been created.`);
    this.logProgress(`Creating project "${this.projectName()}"...`);
    this.terminalPrint(`Creating a new project "${this.projectName()}" on workstation "${host.slug}"...`);

    const { template, serializedPorts } = this.state;
    containerActions.createAtomic(this.projectName(), host, {
      template, serializedPorts, publishAll: true,
      repo: this.props.query.repo
    });
  };

  onHostCreateFailed = () => {
    this.setState({ done: true, hasError: true });
    snackbarActions.post('There was a problem creating a workstation. Please create one manually.', 'error');
    this.logProgress(`There was a problem creating a workstation.`);
    this.terminalPrintError(`Error creating workstation.`);
    this.context.router.transitionTo('new-user-host');
  };

  onHostStarted = (data) => {
    const { host } = data;
    if (this.state.host.slug === host.slug) {
      this.logProgress('Workstation started.');
      this.terminalPrintSuccess(`OK - workstation "${host.slug}" started.`);
      this.logProgress(`Creating project "${this.projectName()}"...`);
      this.terminalPrint(`Creating a new project "${this.projectName()}" on workstation "${host.slug}"...`);

      const { template, serializedPorts } = this.state;
      containerActions.createAtomic(this.projectName(), host, {
        template, ports: serializedPorts, publishAll: true,
        repo: this.props.query.repo
      });
    }
  };

  onContainerCreated = (data) => {
    const { container, hostSlug } = data,
          { host } = this.state;

    if (this.projectName() === container.name
        && host.slug === hostSlug) {
      this.setState({ container });
      this.logProgress(`Created project "${this.projectName()}".`);
      this.terminalPrintSuccess(`OK - project "${this.projectName()}" created.`);

      // TODO Cloning repository and executing nitrous-post-create.sh should be
      // 2 separate steps. We should also know whether a repository actually has
      // a nitrous-post-create.sh or not (otherwise it looks dumb saying we're
      // "executing nitrous-post-create.sh").
      this.logProgress('Cloning repository and executing nitrous-post-create.sh...');
      this.terminalPrint(`Cloning ${this.props.query.repo} to home directory on "${this.projectName()}"...`);

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
      this.setState({ done: true, hasError: true });
      this.logProgress(`Failed to create project "${this.projectName()}".`);
      this.terminalPrintError(`Error creating project.`);
    }
  };

  onRepoInfoFetched = (data) => {
    const { quickstart } = data,
          { template, ports, repoName, owner, repoLogoUrl } = quickstart;
    const serializedPorts = ports.map((port) => {
      return (new PortBinding({
        public: true,
        containerPort: port,
        tcp: true
      })).serialize();
    });
    this.setState({ template, serializedPorts, owner, repoName, repoLogoUrl,
      repoInfoFetched: true });

    this.logProgress('Retrieved repository info.');
    this.terminalPrintSuccess(`OK - GitHub says ${this.props.query.repo} is legit.`);

    const { host } = this.state;

    // If there is no eligible host, and the user is not eligible for a free
    // plan, we either ask the user to upgrade a host, or just show an error
    // message if none of the hosts can be upgraded.
    if (!host && !planStore.freePlan) {
      this.setState({ done: true, hasError: true });

      const { hostToUpgrade } = this.state;
      if (hostToUpgrade) {
        this.logProgress(`Workstation has hit project limit.`);
        this.terminalPrintError(`Could not find an eligible workstation.`);
        snackbarActions.post(`You have hit the project limit of ${hostToUpgrade.maxContainers} ${hostToUpgrade.maxContainers === 1 ? 'project' : 'projects'} for your workstation's plan. Please upgrade or terminate a project to continue.`, 'error');
        this.context.router.transitionTo('subscriptions-upgrade', { subscriptionSlug: hostToUpgrade.subscriptionSlug }, { prev: 'container-list' });
        return;
      }

      if (this.state.hasHosts) {
        snackbarActions.post(`You have hit the project limit for your workstation's plan. Please terminate a project if you want to continue.`, 'error');
        this.logProgress(`Workstation has hit project limit.`);
        this.terminalPrintError(`Could not find an eligible workstation.`);
      } else {
        // Give up.
        snackbarActions.post(`Please create a workstation and try again.`, 'error');
        this.logProgress(`Could not find an eligible workstation.`);
        this.terminalPrintError(`Could not find an eligible workstation.`);
      }

      this.context.router.transitionTo('dashboard');
      return;
    }

    // If a user don't have host, but is eligible for a free plan, we create a
    // free host on their behalf.
    if (!host) {
      this.logProgress(`Creating workstation...`);
      this.terminalPrint(`Creating a free workstation...`);
      hostActions.create({
        name: this.state.user.username,
        plan: planStore.freePlan,
        // TODO: Should assign an appropriate region instead of
        // always using the 1st region
        region: regionStore.regions.first()
      });
      return;
    }

    // If eligible host is not running, we start it.
    if (!host.isRunning) {
      if (!host.isStopped) {
        // TODO We should also handle cases when the host is starting /
        // restarting / stopping.
        snackbarActions.post(`Please start your workstation and try again.`, 'error');
        this.context.router.transitionTo('dashboard');
        return;
      }

      this.logProgress(`Starting your "${host.displayName}" workstation...`);
      this.terminalPrint(`Workstation "${host.displayName}" is stopped, starting it up...`);
      hostActions.start(host.slug);
      return;
    }

    this.logProgress(`Creating project "${this.projectName()}"...`);
    this.terminalPrint(`Creating project on workstation "${host.displayName}"...`);

    containerActions.createAtomic(this.projectName(), host, {
      template, ports: serializedPorts, publishAll: true,
      repo: this.props.query.repo
    });
  }

  onRepoInfoFetchFailed = () => {
    const { user } = this.state,
          { canDeleteGitHubPublicKeys } = user.userProfile,
          { makeHref } = this.context.router,
          connectURL = makeHref('account-settings');
    let failedMessageJSX = null,
        failedMessage = null;

    // canDeleteGitHubPublicKeys means user has already connected to github
    if (canDeleteGitHubPublicKeys) {
      failedMessageJSX = (
        <span>
          nitrous.json not found.
        </span>
      );
      failedMessage = 'Repository does not contain a nitrous.json file.';
    } else {
      failedMessageJSX = (
        <span>
          Failed to retrieve repository info.
          Please <a href={connectURL}>connect to GitHub</a> and try again.
        </span>
      );
      failedMessage = 'Failed to retrieve repository info.';
    }
    this.setState({ done: true, hasError: true });
    this.logProgress(failedMessageJSX);
    this.terminalPrintError(failedMessage);
  }

  // We render the term.js terminal into an iframe because term.js binds events
  // on the document object (e.g. keydown event).
  initTerminal = () => {
    const iframe = document.getElementById('quickstart-terminal')
      .appendChild(document.createElement('iframe'));
    const iframeWindow = iframe.contentWindow;
    const iframeDocument = iframeWindow.document;

    // hack to make iframe ready for injection in firefox
    iframeDocument.open();
    iframeDocument.close();

    let terminalJSPath = location.protocol + "//" + location.host + '/assets/js/term.js';
    /* eslint-disable no-undef */
    if (process.env.CDN_ADDRESS) {
      terminalJSPath = process.env.CDN_ADDRESS + 'js/term.js';
    }
    /* eslint-enable no-undef */

    const scriptEl = iframeDocument.createElement('script');
    scriptEl.setAttribute('src', terminalJSPath);
    scriptEl.onload = () => {
      const terminalDiv = iframeDocument.createElement('div');
      terminalDiv.id = 'terminal';
      iframeDocument.body.appendChild(terminalDiv);
      this.terminal.open(iframeDocument.getElementById('terminal'));
      this.terminalPrint(`Querying the GitHub API for ${this.props.query.repo}...`);
      iframeDocument.body.style.margin = '0px';
    };
    iframeDocument.body.appendChild(scriptEl);
  }

  showConsole = (e) => {
    e.preventDefault();
    this.setState({ showConsole: true });
  }

  hideConsole = (e) => {
    e.preventDefault();
    this.setState({ showConsole: false });
  }

  projectName = () => {
    const { repoName } = this.state;
    return repoName;
  }

  logProgress = (msg) => {
    const progressMessages = this.state.progressMessages;
    progressMessages.push(msg);
    this.setState({ progressMessages });
  }

  terminalPrint = (text) => {
    this.terminal.writeln(`${text}`);
  }

  terminalPrintSuccess = (text) => {
    this.terminal.writeln(`\x1b[92m${text}\x1b[m`);
  }

  terminalPrintError = (text) => {
    this.terminal.writeln(`\x1b[91m${text}\x1b[m`);
  }

  renderProgressMessages = () => {
    const { progressMessages } = this.state;
    return (
      <div className="progress-messages">
        {progressMessages.map((msg) => {
          return <p>{msg}</p>;
        })}
      </div>
    );
  }

  render() {
    const { repoInfoFetched, repoLogoUrl, showConsole, done, hasError } = this.state;
    return (
      <div className='quickstart-component'>
        <h1>Nitrous Quickstart</h1>

        <p className='tagline'>Your Nitrous Quickstart environment is loading&hellip;</p>

        <div className='pane'>
          <img className='repo-logo'
            src={repoLogoUrl || '/assets/images/left-bar-nitrous.svg'} />

          {repoInfoFetched ? (
            <h2>Launching &ldquo;{this.projectName()}&rdquo;&hellip;</h2>
          ) : (
            <h2>Launching&hellip;</h2>
          )}

          {this.renderProgressMessages()}

          <div className={classNames('progress-bar', { done, danger: hasError })}></div>

          {showConsole ? (
            <a className='toggle' href='#' onClick={this.hideConsole}>&#9660; &nbsp; Hide detailed logs</a>
          ) : (
            <a className='toggle' href='#' onClick={this.showConsole}>&#9654; &nbsp; Detailed logs</a>
          )}
          <span id='quickstart-terminal' className={classNames({ show: showConsole })}></span>
        </div>
      </div>
    );
  }
}
