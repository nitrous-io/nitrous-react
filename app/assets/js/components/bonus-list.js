import React from 'react';
import { Table, Panel } from 'react-bootstrap';

import userActions from 'actions/user-actions';
import bonusUseActions from 'actions/bonus-use-actions';
import snackbarActions from 'actions/snackbar-actions';
import userStore from 'stores/user-store';
import bonusUseStore from 'stores/bonus-use-store';

export default class BonusList extends React.Component {
  displayName = 'BonusList';

  state = {
    bonusUses: bonusUseStore.bonusUses
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

    userStore.on('added-bonus', this.onAddedBonus);

    bonusUseActions.fetchAll();
    bonusUseStore.onChange(this.bonusUseStoreDidChange);
    userStore.onChange(this.userStoreDidChange);
  }

  componentDidUnmount() {
    userStore.off('added-bonus', this.onAddedBonus);
    bonusUseStore.offChange(this.bonusUseStoreDidChange);
    userStore.offChange(this.userStoreDidChange);
  }

  bonusUseStoreDidChange = () => {
    this.setState({ bonusUses: bonusUseStore.bonusUses });
  }

  userStoreDidChange = () => {
    this.setState({ bonusUses: bonusUseStore.bonusUses });
  }

  onAddedBonus = () => {
    snackbarActions.post(`Your monthly quota has been increased.`);
  }

  onFollow() {
    userActions.addBonus('follow-twitter');
  }

  onTweet() {
    userActions.addBonus('tweet');
  }

  onLikeFacebook() {
    userActions.addBonus('like-facebook');
  }

  render() {
    const { bonusUses } = this.state;

    return (
      <div className='bonus-tasks-component'>
        <Panel header={<h4>Get Bonus Hours</h4>}>
          <Table responsive hover>
            <thead>
              <tr>
                <th>Task</th>
                <th>Bonus</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {!bonusUses.has(1) ? (
                <tr>
                  <td>
                    Follow @Nitrous on Twitter
                  </td>
                  <td>
                    3 extra hours/mo
                  </td>
                  <td>
                    <a className="twitter-follow-button"
                      href="https://twitter.com/Nitrous"
                      data-show-count="false">
                      Follow @Nitrous</a>
                  </td>
                </tr>
              ) : ''}
              {!bonusUses.has(2) ? (
                <tr>
                  <td>
                    Tweet about @Nitrous
                  </td>
                  <td>
                    5 extra hours/mo
                  </td>
                  <td>
                    <a className="twitter-share-button"
                      href="https://twitter.com/intent/tweet?text=I%20love%20Nitrous! Check it out here">
                      Tweet</a>
                  </td>
                </tr>
              ) : ''}
              {!bonusUses.has(3) ? (
                <tr>
                  <td>
                    Like us on Facebook
                  </td>
                  <td>
                    3 extra hours/mo
                  </td>
                  <td>
                    <div className="fb-like"
                      data-href="https://www.facebook.com/NitrousIO/"
                      data-layout="button"
                      data-action="like"
                      data-show-faces="false"></div>
                  </td>
                </tr>
              ) : ''}
              {!bonusUses.has(4) ? (
                <tr>
                  <td>
                    Share about us on Facebook
                  </td>
                  <td>
                    5 extra hours/mo
                  </td>
                  <td>
                    <div className="fb-share-button" data-href="https://facebook.com/NitrousIO/" data-layout="button"></div>
                  </td>
                </tr>
              ) : ''}
            </tbody>
          </Table>
        </Panel>
      </div>
    );
  }
}
