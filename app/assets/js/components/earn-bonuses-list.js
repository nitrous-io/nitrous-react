import React from 'react';
import { Button, ProgressBar, Table, Panel } from 'react-bootstrap';

import bonusActions from 'actions/bonus-actions';
import bonusStore from 'stores/bonus-store';
import userStore from 'stores/user-store';
import Fa from 'components/fa';

export default class EarnBonusesList extends React.Component {
  displayName = 'EarnBonusesList';

  state = {
    earnedBonuses: bonusStore.earnedBonuses,
    bonuses: bonusStore.bonuses,
    user: userStore.user
  }

  componentDidMount() {
    var twttr = window.twttr,
        FB = window.FB;

    // Initialize JS SDKs
    // https://dev.twitter.com/web/javascript/loading
    twttr.widgets.load();
    // https://developers.facebook.com/docs/reference/javascript/FB.XFBML.parse
    FB.XFBML.parse();

    // https://dev.twitter.com/web/javascript/events
    twttr.events.bind('follow', this.onFollow);
    twttr.events.bind('tweet', this.onTweet);

    // https://developers.facebook.com/docs/reference/javascript/FB.Event.subscribe/v2.5
    FB.Event.subscribe('edge.create', this.onLikeFacebook);

    userStore.onChange(this.userStoreDidChange);
    bonusStore.onChange(this.bonusStoreDidChange);

    bonusStore.on('connected-twitter', this.onConnectedTwitter);

    bonusActions.fetchAll();
    bonusActions.fetchAllUserEarnedBonuses();
  }

  componentDidUnmount() {
    var twttr = window.twttr,
        FB = window.FB;

    twttr.events.unbind('tweet', this.onTweet);

    // https://developers.facebook.com/docs/reference/javascript/FB.Event.unsubscribe
    FB.Event.unsubscribe('edge.create', this.onLikeFacebook);
  }

  componentWillUnmount() {
    userStore.offChange(this.userStoreDidChange);
    bonusStore.offChange(this.bonusStoreDidChange);
    bonusStore.off('connected-twitter', this.onConnectedTwitter);
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

  connectTwitter() {
    bonusActions.connectTwitter();
  }

  followTwitter() {
    bonusActions.followTwitter();
  }

  onTweet() {
    bonusActions.earnBonus('tweet');
  }

  onLikeFacebook() {
    bonusActions.earnBonus('like-facebook');
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
          <Table responsive hover>
            <tbody>
              <tr>
                <td>
                  <Button className='bonus-action-item' onClick={this.connectTwitter}
                    disabled={this.earnedBonus('connect-twitter')}>
                    <span className='bonus-action-task'>
                    <Fa icon="twitter" />
                    Connect Twitter</span>

                    <span className='bonus-action-hours'>
                      {this.earnedBonus('connect-twitter') ? 'Done' : '3 extra hours/mo'}
                    </span>
                  </Button>
                </td>
              </tr>

              <tr>
                <td>
                  <Button className='bonus-action-item'
                    onClick={this.followTwitter}
                    disabled={this.earnedBonus('follow-twitter') || !this.earnedBonus('connect-twitter')}>
                    <span className='bonus-action-task'>
                    <Fa icon="twitter" />
                    Follow @Nitrous on Twitter</span>
                    <span className='bonus-action-hours'>
                      {this.earnedBonus('follow-twitter') ? 'Done' : '3 extra hours/mo'}
                    </span>
                  </Button>
                </td>
              </tr>
              <tr>
                <td>
                  <Button className='bonus-action-item'
                    disabled={this.earnedBonus('tweet') || !this.earnedBonus('connect-twitter')}>
                    <span className='bonus-action-task'>
                    <Fa icon="twitter" />
                    Tweet about @Nitrous</span>
                    {this.earnedBonus('tweet') || !this.earnedBonus('connect-twitter') ? '' : (
                      <a className="twitter-share-button"
                        data-url="https://www.nitrous.io"
                        data-text="I’m using @nitrous, the fastest way to code in the cloud! Claim your free account here: "
                        href="https://twitter.com/share">
                      Tweet</a>
                    )}

                    <span className='bonus-action-hours'>5 extra hours/mo</span>
                  </Button>
                </td>
              </tr>
              <tr>
                <td>
                  <Button className='bonus-action-item'
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
                </td>
              </tr>
            </tbody>
          </Table>
        </Panel>
      </div>
    );
  }
}
