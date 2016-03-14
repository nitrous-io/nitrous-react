import React, { PropTypes } from 'react';
import { Button, ProgressBar, Panel } from 'react-bootstrap';

import bonusActions from 'actions/bonus-actions';
import bonusStore from 'stores/bonus-store';
import freeUsageStore from 'stores/free-usage-store';
import Fa from 'components/fa';
import LoadingIndicator from 'components/loading-indicator';
import snackbarActions from 'actions/snackbar-actions';
import format from 'lib/format';

export default class EarnBonusesList extends React.Component {
  displayName = 'EarnBonusesList';

  state = {
    earnedBonuses: bonusStore.earnedBonuses,
    bonuses: bonusStore.bonuses,
    usageRemaining: freeUsageStore.usageRemaining,
    usageQuota: freeUsageStore.usageQuota
  }

  static propTypes = {
    connectedTwitter: PropTypes.bool,
    connectedGithub: PropTypes.bool,
    completedSurvey: PropTypes.bool
  };

  componentDidMount() {
    var FB = window.FB;
    FB.XFBML.parse();

    // https://developers.facebook.com/docs/reference/javascript/FB.Event.subscribe/v2.5
    FB.Event.subscribe('edge.create', this.onLikeFacebook);

    freeUsageStore.on('usage-remaining-tick', this.onUsageRemainingTick);

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
    if (this.props.completedSurvey) {
      snackbarActions.post(`Added bonus: 10 extra hours/mo`);
    }
  }

  componentWillUnmount() {
    var FB = window.FB;
    // https://developers.facebook.com/docs/reference/javascript/FB.Event.unsubscribe
    FB.Event.unsubscribe('edge.create', this.onLikeFacebook);

    freeUsageStore.off('usage-remaining-tick', this.onUsageRemainingTick);

    bonusStore.offChange(this.bonusStoreDidChange);
    bonusStore.off('connected-twitter', this.onConnectedTwitter);
    bonusStore.off('followed-twitter', this.onFollowedTwitter);
    bonusStore.off('tweeted', this.onTweeted);

    bonusStore.off('already-connected-github', this.onAlreadyConnectedGithub);
    bonusStore.off('connected-github', this.onConnectedGithub);
  }

  onUsageRemainingTick = () => {
    const { usageRemaining, usageQuota } = freeUsageStore;
    this.setState({ usageRemaining, usageQuota });
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

  completeSurvey = () => {
    const { user } = this.state,
          // Prefill email field
          surveyUrl = "https://actionio.wufoo.com/forms/q1vgejzs0mnoffy/def/field1=" + user.username;
    window.location.href = surveyUrl;
  }

  earnedBonus(task) {
    const { earnedBonuses, bonuses } = this.state,
          bonusTask = bonuses ? bonuses.get(task) : null;

    if (!bonusTask) {
      return;
    }

    return earnedBonuses.has(bonusTask.id);
  }

  usagePercentage() {
    const { usageRemaining, usageQuota } = this.state;
    if (usageRemaining == null || usageQuota == null || usageQuota === 0) {
      return 0;
    }
    return (usageRemaining / usageQuota * 100).toFixed(0);
  }

  render() {
    const { usageRemaining, usageQuota } = this.state,
          usageRemainingLoaded = usageRemaining != null && usageQuota != null;

    let progressBarStyle = "success";
    if (this.usagePercentage() < 10) {
      progressBarStyle = "danger";
    }

    return (
      <div className='earn-bonuses-list-component'>
        <Panel header={<h4>Usage Remaining</h4>}>
          {usageRemainingLoaded ? (
            <div>
              <ProgressBar
                bsStyle={progressBarStyle}
                label={format.convertSecondsToHours(usageRemaining) + " hours remaining"}
                max={usageQuota}
                now={usageRemaining} />

              <li className='usage-quota-info'>
                <ul>Monthly hours: <strong>{format.convertSecondsToHours(usageQuota)}</strong> hrs</ul>
                <ul>Hours remaining: <strong>{format.convertSecondsToHours(usageRemaining)}</strong> hrs</ul>
                <ul>% remaining: <strong>{this.usagePercentage()}</strong></ul>
              </li>
            </div>
          ) : (<LoadingIndicator />)}
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
            <Fa icon="github" />
            Connect With GitHub</span>
            <span className='bonus-action-hours'>
              {this.earnedBonus('connect-github') ? 'Bonus earned' : '5 extra hours/mo'}
            </span>
          </Button>
          <Button className='bonus-action-item'
            block
            onClick={this.completeSurvey}
            disabled={this.earnedBonus('complete-survey')}>
            <span className='bonus-action-task'>
            <Fa icon="laptop" />
            Complete our survey</span>
            <span className='bonus-action-hours'>
              {this.earnedBonus('complete') ? 'Bonus earned' : '10 extra hours/mo'}
            </span>
          </Button>

        </Panel>
      </div>
    );
  }
}
