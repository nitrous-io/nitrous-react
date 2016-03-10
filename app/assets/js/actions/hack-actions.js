import { authedAjax }  from 'lib/ajax';
import dispatcher from 'app-dispatcher';

class HackActions {
  fetchRepoInfo(repo) {
    const promise = authedAjax({
      type: 'GET',
      url: '/api/v0/hack/repo_info',
      dataType: 'json',
      data: { repo }
    });
    promise.then((data) => {
      dispatcher.dispatch({
        type: 'hack.fetched-repo-info',
        data: { data }
      });
    });
    promise.catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'hack.fetch-repo-info-failed',
        data: { jqxhr }
      });
    });
    return promise;
  }
}

export default new HackActions();
