import React, { PropTypes } from 'react';
import { Modal, Button, ProgressBar, Panel } from 'react-bootstrap';

import bonusActions from 'actions/bonus-actions';
import bonusStore from 'stores/bonus-store';
import freeUsageStore from 'stores/free-usage-store';
import userStore from 'stores/user-store';
import referralcodeStore from 'stores/referralcode-store';
import referralcodeActions from 'actions/referralcode-actions';
import Fa from 'components/fa';
import SelectableText from 'components/selectable-text';
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
    user: userStore.user,
    referralcode: referralcodeStore.referralcode,
    showPublishArticleModal: false,
    showPublishBlogModal: false,
    showIncludeQuickstartModal: false,
    showReferralModal: false
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

    referralcodeStore.onChange(this.referralcodeStoreDidChange);

    referralcodeActions.fetch();

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

    referralcodeStore.offChange(this.referralcodeStoreDidChange);

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

  referralcodeStoreDidChange = () => {
    this.setState({ referralcode: referralcodeStore.referralcode });
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
  }

  hidePublishArticleModal = () => {
    this.setState({ showPublishArticleModal: false });
  }

  publishBlog = () => {
    this.setState({ showPublishBlogModal: true });
  }

  handleClosePublishBlogModal = () => {
    this.setState({ showPublishBlogModal: false });
  }

  hidePublishBlogModal = () => {
    this.setState({ showPublishBlogModal: false });
  }

  includeQuickstart = () => {
    this.setState({ showIncludeQuickstartModal: true });
  }

  handleCloseIncludeQuickstartModal = () => {
    this.setState({ showIncludeQuickstartModal: false });
  }

  hideIncludeQuickstartModal = () => {
    this.setState({ showIncludeQuickstartModal: false });
  }

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

  referUsers = () => {
    this.setState({ showReferralModal: true });
  }

  handleCloseReferralModal = () => {
    this.setState({ showReferralModal: false });
  };

  hideReferralModal = () => {
    this.setState({ showReferralModal: false });
  };

  usagePercentage() {
    const { usageRemaining, usageQuota } = this.state;
    if (usageRemaining == null || usageQuota == null || usageQuota === 0) {
      return 0;
    }
    return (usageRemaining / usageQuota * 100).toFixed(0);
  }

  render() {
    const { referralcode, usageRemaining, usageQuota } = this.state,
          usageRemainingLoaded = usageRemaining != null && usageQuota != null,
          referralCode = referralcode ? referralcode.code : '',
          referralURL = "https://www.nitrous.io/app/#/signup?referral=" + referralCode;

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
          {referralcode && referralcode.code ? (
            <Button className='bonus-action-item'
              block
              onClick={this.referUsers}
              disabled={this.earnedBonus('refer-friend')}>
              <span className='bonus-action-task'>
              <Fa icon="users" />
              Invite Friends and Colleagues</span>
              <span className='bonus-action-hours'>
                {this.earnedBonus('refer-friend') ? 'Bonus earned' : 'Up to 30 extra hours/mo'}
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
          {this.getBonusHours('publish-blog') ? (
            <Button className='bonus-action-item'
              block
              onClick={this.publishBlog}
              disabled={this.earnedBonus('publish-blog')}>
              <span className='bonus-action-task'>
              <Fa icon="newspaper-o" />
              Publish A Tutorial On Your Blog</span>
              <span className='bonus-action-hours'>
                {this.earnedBonus('publish-blog') ? 'Bonus earned' : this.getBonusHours('publish-blog') + ' extra hours/mo'}
              </span>
            </Button>
          ) : ''}
          {this.getBonusHours('include-quickstart') ? (
            <Button className='bonus-action-item'
              block
              onClick={this.includeQuickstart}
              disabled={this.earnedBonus('include-quickstart')}>
              <span className='bonus-action-task'>
              <Fa icon="keyboard-o" />
              Include Nitrous Quickstart</span>
              <span className='bonus-action-hours'>
                {this.earnedBonus('include-quickstart') ? 'Bonus earned' : 'Up to ' + this.getBonusHours('include-quickstart') + ' extra hours/mo'}
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

        <Modal show={this.state.showPublishBlogModal} onHide={this.hidePublishBlogModal}>
          <Modal.Header>
            <Modal.Title>Publish A Tutorial On Your Blog</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Publish a programming tutorial on your personal blog. The tutorial must <strong>use Nitrous and include screenshots of the Nitrous platform</strong>, and have more than 750 words.</p>
            <p>Email your Nitrous username and a link to the tutorial to <a href='mailto:community@nitrous.io'>community@nitrous.io</a> and we will increase the limit on your account.</p>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.handleClosePublishBlogModal}>Close</Button>
          </Modal.Footer>
        </Modal>

        <Modal show={this.state.showIncludeQuickstartModal} onHide={this.hideIncludeQuickstartModal}>
          <Modal.Header>
            <Modal.Title>Include Nitrous Quickstart</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Please read <a href='https://community.nitrous.io/docs/nitrous-quickstarts' target='_blank'>our guide</a> to learn how to include the Nitrous Quickstart Button in your git repository README.</p>
            <p>Once you have included the Quickstart Button in your README, please email the link to your repository and your Nitrous username to <a href='mailto:community@nitrous.io'>community@nitrous.io</a>.</p>
            <p>We will award 1 bonus hour for each star on your project, up to a maximum of {this.getBonusHours('include-quickstart')} hours.</p>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.handleCloseIncludeQuickstartModal}>Close</Button>
          </Modal.Footer>
        </Modal>

        <Modal show={this.state.showReferralModal} onHide={this.hideReferralModal} backdrop='static'>
          <Modal.Header>
            <Modal.Title>Invite Friends and Colleagues</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Your referral URL:</p>
            <p className='referral-url'>
              <SelectableText><strong>{referralURL}</strong></SelectableText>
            </p>
            <p>Share this URL on your blog, personal website or paste it in an email to earn additional bonus hours on Nitrous.</p>
            <p>You will receive an additional <strong>3 bonus hours</strong> each for the first 10 users who sign up via your referral code, up to 30 hours in total.</p>

            <p>Each new user who signs up with your referral code will also earn 3 extra bonus hours.</p>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.handleCloseReferralModal}>Close</Button>
          </Modal.Footer>
        </Modal>

    </div>
    );
  }
}
