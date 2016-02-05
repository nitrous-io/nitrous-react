import React from 'react';
import { Alert, Label, ProgressBar, Table, Panel } from 'react-bootstrap';

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

    bonusActions.fetchAll();
    bonusActions.fetchAllUserEarnedBonuses();
  }

  componentDidUnmount() {
    userStore.offChange(this.userStoreDidChange);
    bonusStore.offChange(this.bonusStoreDidChange);

    var twttr = window.twttr,
        FB = window.FB;

    twttr.events.unbind('follow', this.onFollow);
    twttr.events.unbind('tweet', this.onTweet);

    // https://developers.facebook.com/docs/reference/javascript/FB.Event.unsubscribe
    FB.Event.unsubscribe('edge.create', this.onLikeFacebook);
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

  onFollow() {
    bonusActions.earnBonus('follow-twitter');
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
    const { user } = this.state;

    let progressBarStyle = "success";
    if (user.usagePercentage < 10) {
      progressBarStyle = "danger";
    }

    return (
      <div className='earn-bonuses-list-component'>
        <Panel header={<h4>Current Usage</h4>}>
          <ProgressBar
            bsStyle={progressBarStyle}
            label="%(percent)s%"
            max={user.usageQuota}
            now={user.usageRemaining} />

          <li className='usage-quota-info'>
            <ul>Monthly hours: <strong>{user.usageQuotaHours}</strong> hrs</ul>
            <ul>Hours remaining: <strong>{user.usageRemainingHours}</strong> hrs</ul>
            <ul>% remaining: <strong>{user.usagePercentage}</strong></ul>
          </li>
        </Panel>

        <Panel header={<h4>Get Bonus Hours</h4>}>
          <Alert bsStyle='info'>
            <Fa icon='info-circle' /> Share some love for Nitrous and increase your monthly quota!
          </Alert>

          <Table responsive hover>
            <thead>
              <tr>
                <th>Task</th>
                <th>Bonus</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  Follow @Nitrous on Twitter
                </td>
                <td>
                  3 extra hours/mo
                </td>
                <td>
                {!this.earnedBonus('follow-twitter') ? (
                  <a className="twitter-follow-button"
                    href="https://twitter.com/Nitrous"
                    data-show-count="false">
                    Follow @Nitrous</a>
                ) : (
                  <Label bsStyle='success'>Thanks, bonus added</Label>
                )}
                </td>
              </tr>
              <tr>
                <td>
                  Tweet about @Nitrous
                </td>
                <td>
                  5 extra hours/mo
                </td>
                <td>
                {!this.earnedBonus('tweet') ? (
                  <a className="twitter-share-button"
                    href="https://twitter.com/intent/tweet?text=I%20love%20Nitrous! Check it out here">
                    Tweet</a>
                ) : (
                  <Label bsStyle='success'>Thanks, bonus added</Label>
                )}
                </td>
              </tr>
              <tr>
                <td>
                  Like us on Facebook
                </td>
                <td>
                  3 extra hours/mo
                </td>
                <td>
                {!this.earnedBonus('like-facebook') ? (
                  <div className="fb-like"
                    data-href="https://www.facebook.com/NitrousIO/"
                    data-layout="button"
                    data-action="like"
                    data-show-faces="false"></div>
                ) : (
                  <Label bsStyle='success'>Thanks, bonus added</Label>
                )}
                </td>
              </tr>
            </tbody>
          </Table>
        </Panel>
      </div>
    );
  }
}
