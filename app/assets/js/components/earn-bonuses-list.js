import React, { PropTypes } from 'react';
import { Modal, Button, ProgressBar, Panel } from 'react-bootstrap';

import bonusActions from 'actions/bonus-actions';
import bonusStore from 'stores/bonus-store';
import freeUsageStore from 'stores/free-usage-store';
import userStore from 'stores/user-store';
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
    usageQuota: freeUsageStore.usageQuota,
    showPublishArticleModal: false,
    user: userStore.user
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

    userStore.onChange(this.userStoreDidChange);

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

    userStore.offChange(this.userStoreDidChange);
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

  userStoreDidChange = () => {
    this.setState({ user: userStore.user });
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
          // Prefill username field in Wufoo form.
          surveyUrl = "https://actionio.wufoo.com/forms/q1vgejzs0mnoffy/def/field113=" + user.email;
    window.location.href = surveyUrl;
  }

  publishArticle = () => {
    this.setState({ showPublishArticleModal: true });
  }

  handleClosePublishArticleModal = () => {
    this.setState({ showPublishArticleModal: false });
  };

  hidePublishArticleModal = () => {
    this.setState({ showPublishArticleModal: false });
  };

  getBonusHours(action) {
    const { bonuses } = this.state;

    const bonus = bonuses.find((b) => {
      return b.slug === action;
    });

    if (bonus) {
      return bonus.amountHours;
    }
    return null;
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
          {this.getBonusHours('connect-twitter') ? (
            <Button className='bonus-action-item' onClick={this.connectTwitter}
              block
              disabled={this.earnedBonus('connect-twitter')}>
              <span className='bonus-action-task'>
              <Fa icon="twitter" />
              Connect Twitter</span>

              <span className='bonus-action-hours'>
              {this.earnedBonus('connect-twitter') ? 'Bonus earned' : this.getBonusHours('connect-twitter') + ' extra hours/mo'}
              </span>
            </Button>
          ) : ''}
          {this.getBonusHours('follow-twitter') ? (
            <Button className='bonus-action-item'
              block
              onClick={this.followTwitter}
              disabled={this.earnedBonus('follow-twitter') || !this.earnedBonus('connect-twitter')}>
              <span className='bonus-action-task'>
              <Fa icon="twitter" />
              Follow Nitrous On Twitter</span>
              <span className='bonus-action-hours'>
                {this.earnedBonus('follow-twitter') ? 'Bonus earned' : this.getBonusHours('follow-twitter') + ' extra hours/mo'}
              </span>
            </Button>
          ) : ''}
          {this.getBonusHours('tweet') ? (
            <Button className='bonus-action-item'
              block
              onClick={this.tweet}
              disabled={this.earnedBonus('tweet') || !this.earnedBonus('connect-twitter')}>
              <span className='bonus-action-task'>
              <Fa icon="twitter" />
              Tweet About Nitrous</span>
              <span className='bonus-action-hours'>
                {this.earnedBonus('tweet') ? 'Bonus earned' : this.getBonusHours('tweet') + ' extra hours/mo'}
              </span>
            </Button>
          ) : ''}
          {this.getBonusHours('like-facebook') ? (
            <Button className='bonus-action-item'
              block
              disabled={this.earnedBonus('like-facebook')}>
              <span className='bonus-action-task'>
              <Fa icon="facebook" />
              Like Us On Facebook</span>
              <div className="fb-like"
                data-href="https://www.facebook.com/NitrousIO/"
                data-layout="button"
                data-action="like"
                data-show-faces="false"></div>

              <span className='bonus-action-hours'>
                {this.earnedBonus('tweet') ? 'Bonus earned' : this.getBonusHours('like-facebook') + ' extra hours/mo'}
              </span>
            </Button>
          ) : ''}
          {this.getBonusHours('connect-github') ? (
            <Button className='bonus-action-item'
              block
              onClick={this.connectGithub}
              disabled={this.earnedBonus('connect-github')}>
              <span className='bonus-action-task'>
              <Fa icon="github" />
              Connect With GitHub</span>
              <span className='bonus-action-hours'>
                {this.earnedBonus('connect-github') ? 'Bonus earned' : this.getBonusHours('connect-github') + ' extra hours/mo'}
              </span>
            </Button>
          ) : ''}
          {this.getBonusHours('complete-survey') ? (
            <Button className='bonus-action-item'
              block
              onClick={this.completeSurvey}
              disabled={this.earnedBonus('complete-survey')}>
              <span className='bonus-action-task'>
              <Fa icon="laptop" />
              Complete Our Survey</span>
              <span className='bonus-action-hours'>
                {this.earnedBonus('complete-survey') ? 'Bonus earned' : this.getBonusHours('complete-survey') + ' extra hours/mo'}
              </span>
            </Button>
          ) : ''}
          {this.getBonusHours('publish-article') ? (
            <Button className='bonus-action-item'
              block
              onClick={this.publishArticle}
              disabled={this.earnedBonus('publish-article')}>
              <span className='bonus-action-task'>
              <Fa icon="newspaper-o" />
              Publish A Community Article</span>
              <span className='bonus-action-hours'>
                {this.earnedBonus('publish-article') ? 'Bonus earned' : this.getBonusHours('publish-article') + ' extra hours/mo'}
              </span>
            </Button>
          ) : ''}

        </Panel>

        <Modal show={this.state.showPublishArticleModal} onHide={this.hidePublishArticleModal}>
          <Modal.Header>
            <Modal.Title>Publish A Community Article</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Submit a tutorial or blog post to <a href='mailto:community@nitrous.io'>community@nitrous.io</a>. If we approve your submission, you can earn:</p>
            <ul>
              <li><strong>Up to $200</strong> for an article (> 1000 words); and</li>
              <li>Additional <strong>{this.getBonusHours('publish-article')} free hours.</strong></li>
            </ul>
            <p>You can read more about <a href='https://community.nitrous.io/docs/tutorial-submission-guidelines' target='_blank'>submission guidelines here</a>.</p>
            <p><a href='mailto:community@nitrous.io'>Send us an article proposal</a>.</p>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.handleClosePublishArticleModal}>Close</Button>
          </Modal.Footer>
        </Modal>

      </div>
    );
  }
}
