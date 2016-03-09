import React, { PropTypes } from 'react';
import { Button, ProgressBar, Panel } from 'react-bootstrap';

import bonusActions from 'actions/bonus-actions';
import bonusStore from 'stores/bonus-store';
import userStore from 'stores/user-store';
import Fa from 'components/fa';
import snackbarActions from 'actions/snackbar-actions';

export default class EarnBonusesList extends React.Component {
  displayName = 'EarnBonusesList';

  state = {
    earnedBonuses: bonusStore.earnedBonuses,
    bonuses: bonusStore.bonuses,
    user: userStore.user
  }

  static propTypes = {
    connectedTwitter: PropTypes.bool,
    connectedGithub: PropTypes.bool
  };

  componentDidMount() {
    var FB = window.FB;
    FB.XFBML.parse();

    // https://developers.facebook.com/docs/reference/javascript/FB.Event.subscribe/v2.5
    FB.Event.subscribe('edge.create', this.onLikeFacebook);

    userStore.onChange(this.userStoreDidChange);
    bonusStore.onChange(this.bonusStoreDidChange);

    bonusStore.on('connected-twitter', this.onConnectedTwitter);
    bonusStore.on('followed-twitter', this.onFollowedTwitter);
    bonusStore.on('tweeted', this.onTweeted);

    bonusStore.on('already-connected-github', this.onAlreadyConnectedGithub);
    bonusStore.on('connected-github', this.onConnectedGithub);

    bonusActions.fetchAll();
    bonusActions.fetchAllUserEarnedBonuses();

    // When the oauth_callback endpoint on nitrous redirects to this page, display the snackbar
    // notification by checking the connected_twitter param passed in the redirect
    if (this.props.connectedTwitter) {
      snackbarActions.post(`Added bonus: 3 extra hours/mo`);
    }

    if (this.props.connectedGithub) {
      snackbarActions.post(`Added bonus: 5 extra hours/mo`);
    }
  }

  componentWillUnmount() {
    var FB = window.FB;
    // https://developers.facebook.com/docs/reference/javascript/FB.Event.unsubscribe
    FB.Event.unsubscribe('edge.create', this.onLikeFacebook);

    userStore.offChange(this.userStoreDidChange);
    bonusStore.offChange(this.bonusStoreDidChange);
    bonusStore.off('connected-twitter', this.onConnectedTwitter);
    bonusStore.off('followed-twitter', this.onFollowedTwitter);
    bonusStore.off('tweeted', this.onTweeted);

    bonusStore.off('already-connected-github', this.onAlreadyConnectedGithub);
    bonusStore.off('connected-github', this.onConnectedGithub);
  }

  userStoreDidChange = () => {
    this.setState({ user: userStore.user });
  }

  bonusStoreDidChange = () => {
    this.setState({
      earnedBonuses: bonusStore.earnedBonuses,
      bonuses: bonusStore.bonuses
    });
  }

  onConnectedTwitter = (data) => {
    const { redirectUrl } = data;
    window.location.href = redirectUrl;
  }

  onFollowedTwitter = () => {
    snackbarActions.post(`Added bonus: 3 extra hours/mo`);
  }

  onTweeted = () => {
    snackbarActions.post(`Added bonus 5 extra hours/mo`);
  }

  connectTwitter() {
    bonusActions.connectTwitter();
  }

  followTwitter() {
    bonusActions.followTwitter();
  }

  tweet() {
    bonusActions.tweet();
  }

  onLikeFacebook() {
    bonusActions.earnBonus('like-facebook');
  }

  connectGithub() {
    bonusActions.connectGithub();
  }

  onConnectedGithub = (data) => {
    const { redirectUrl } = data;
    window.location.href = redirectUrl;
  }

  onAlreadyConnectedGithub = () => {
    snackbarActions.post(`GitHub connection already completed. 5 bonus hours added to your account.`);
  }

  earnedBonus(task) {
    const { earnedBonuses, bonuses } = this.state,
          bonusTask = bonuses ? bonuses.get(task) : null;

    if (!bonusTask) {
      return;
    }

    return earnedBonuses.has(bonusTask.id);
  }

  render() {
    const { user } = this.state,
          progressBarLabel = user.usageRemainingHours + " hours remaining";

    let progressBarStyle = "success";
    if (user.usagePercentage < 10) {
      progressBarStyle = "danger";
    }

    return (
      <div className='earn-bonuses-list-component'>
        <Panel header={<h4>Usage Remaining</h4>}>
          <ProgressBar
            bsStyle={progressBarStyle}
            label={progressBarLabel}
            max={user.usageQuota}
            now={user.usageRemaining} />

          <li className='usage-quota-info'>
            <ul>Monthly hours: <strong>{user.usageQuotaHours}</strong> hrs</ul>
            <ul>Hours remaining: <strong>{user.usageRemainingHours}</strong> hrs</ul>
            <ul>% remaining: <strong>{user.usagePercentage}</strong></ul>
          </li>
        </Panel>

        <Panel header={<h4>Get Bonus Hours</h4>}>
          <Button className='bonus-action-item' onClick={this.connectTwitter}
            block
            disabled={this.earnedBonus('connect-twitter')}>
            <span className='bonus-action-task'>
            <Fa icon="twitter" />
            Connect Twitter</span>

            <span className='bonus-action-hours'>
            {this.earnedBonus('connect-twitter') ? 'Bonus earned' : '3 extra hours/mo'}
            </span>
          </Button>
          <Button className='bonus-action-item'
            block
            onClick={this.followTwitter}
            disabled={this.earnedBonus('follow-twitter') || !this.earnedBonus('connect-twitter')}>
            <span className='bonus-action-task'>
            <Fa icon="twitter" />
            Follow Nitrous on Twitter</span>
            <span className='bonus-action-hours'>
              {this.earnedBonus('follow-twitter') ? 'Bonus earned' : '3 extra hours/mo'}
            </span>
          </Button>
          <Button className='bonus-action-item'
            block
            onClick={this.tweet}
            disabled={this.earnedBonus('tweet') || !this.earnedBonus('connect-twitter')}>
            <span className='bonus-action-task'>
            <Fa icon="twitter" />
            Tweet about Nitrous</span>
            <span className='bonus-action-hours'>
              {this.earnedBonus('tweet') ? 'Bonus earned' : '5 extra hours/mo'}
            </span>
          </Button>
          <Button className='bonus-action-item'
            block
            disabled={this.earnedBonus('like-facebook')}>
            <span className='bonus-action-task'>
            <Fa icon="facebook" />
            Like us on Facebook</span>
            <div className="fb-like"
              data-href="https://www.facebook.com/NitrousIO/"
              data-layout="button"
              data-action="like"
              data-show-faces="false"></div>

            <span className='bonus-action-hours'>3 extra hours/mo</span>
          </Button>
          <Button className='bonus-action-item'
            block
            onClick={this.connectGithub}
            disabled={this.earnedBonus('connect-github')}>
            <span className='bonus-action-task'>
            <Fa icon="github " />
            Connect With GitHub</span>
            <span className='bonus-action-hours'>
              {this.earnedBonus('connect-github') ? 'Bonus earned' : '5 extra hours/mo'}
            </span>
          </Button>

        </Panel>
      </div>
    );
  }
}
