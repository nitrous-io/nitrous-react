import { authedAjax }  from 'lib/ajax';
import dispatcher from 'app-dispatcher';

class QuickstartActions {
  fetchRepoInfo(repo) {
    const promise = authedAjax({
      type: 'GET',
      url: '/api/v0/quickstart/repo_info',
      dataType: 'json',
      data: { repo }
    });
    promise.then((data) => {
      dispatcher.dispatch({
        type: 'quickstart.fetched-repo-info',
        data: { data }
      });
    });
    promise.catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'quickstart.fetch-repo-info-failed',
        data: { jqxhr }
      });
    });
    return promise;
  }
}

export default new QuickstartActions();
