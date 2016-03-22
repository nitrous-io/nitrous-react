import React, { PropTypes } from 'react';

import { ajax } from 'lib/ajax';

export default class QuickstartContext extends React.Component {
  displayName = 'QuickstartContext';

  _githubRepoRegex = /github.com\/([^\/]+)\/(.+?)(.git)?$/

  static propTypes = {
    repo: PropTypes.string.isRequired,
    login: PropTypes.bool,
    signup: PropTypes.bool
  };

  state = {
    repoInfoFetched: false,
    repoLogoUrl: null,
    repoName: null
  };

  componentDidMount() {
    if (!this.repoOwner() || !this.repoName()) {
      return;
    }

    // Use the GitHub Get repository API: https://developer.github.com/v3/repos/#get
    ajax({
      type: 'GET',
      url: `https://api.github.com/repos/${this.repoOwner()}/${this.repoName()}`,
      dataType: 'json'
    }).then((data) => {
      this.setState({
        repoInfoFetched: true,
        repoLogoUrl: data.owner.avatar_url,
        repoName: data.full_name
      });
    });
  }

  componentWillUnmount() {
    // Ideally we should cancel the Ajax request in componentDidMount(), but
    // there is no way to cancel an ES6 Promise.
  }

  repoOwner = () => {
    const { repo } = this.props;
    const matches = this._githubRepoRegex.exec(repo);
    if (!matches) {
      return null;
    }

    const [, owner] = matches;
    return owner;
  }

  repoName = () => {
    const { repo } = this.props;
    const matches = this._githubRepoRegex.exec(repo);
    if (!matches) {
      return null;
    }

    const [, , name] = matches;
    return name;
  }

  renderLogin() {
    const { repoInfoFetched, repoName } = this.state;
    return (
      <div>
        {repoInfoFetched ? (
          <h3>You need to log in first to launch &ldquo;{repoName}&rdquo;.</h3>
        ) : (
          <h3>You need to log in first to Quickstart on Nitrous.</h3>
        )}
        <p>Not so fast, hotshot.</p>
      </div>
    );
  }

  renderSignup() {
    const { repoInfoFetched, repoName } = this.state;
    return (
      <div>
        {repoInfoFetched ? (
          <h3>You need to sign up first to launch &ldquo;{repoName}&rdquo;.</h3>
        ) : (
          <h3>Sign up to Quickstart on Nitrous.</h3>
        )}
        <p>Your first project is free forever.</p>
      </div>
    );
  }

  render() {
    const { login, signup } = this.props,
          { repoInfoFetched, repoLogoUrl } = this.state;

    return (
      <div className='quickstart-context-component'>
        {repoInfoFetched ? (
          <img className='repo-logo' src={repoLogoUrl} />
        ) : (
          // "src" is the data URI for a transparent gif. We do this because the
          // "src" attribute is mandatory. If left out, some browsers do stupid
          // things like using the current page (which is a HTML page).
          <img className='repo-logo default' src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" />
        )}

        {login ? this.renderLogin() : ''}

        {signup ? this.renderSignup() : ''}
      </div>
    );
  }
}
