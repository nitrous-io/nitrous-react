import { authedAjax }  from 'lib/ajax';

import dispatcher from 'app-dispatcher';

class FreeUsageActions {
  _timer = null;

  _fetch() {
    const promise = authedAjax({
      type: 'GET',
      url: '/api/v0/user',
      dataType: 'json'
    }).then((data) => {
      dispatcher.dispatch({
        type: 'free-usage.fetched',
        data: { data }
      });
    });
    promise.catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'free-usage.fetch-failed',
        data: { jqxhr }
      });
    });
    return promise;
  }

  periodicallyFetch() {
    this._timer = setInterval(() => {
      this._fetch();
    }, 60000);
  }

  stopFetching() {
    clearInterval(this._timer);
  }
}

export default new FreeUsageActions();
