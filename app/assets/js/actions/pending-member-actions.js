import { ajax }  from 'lib/ajax';
import dispatcher from 'app-dispatcher';

class PendingMemberActions {
  fetchPendingMemberByCode(code) {
    const promise = ajax({
      type: 'GET',
      url: `/api/v0/pending_members/${code}`,
      dataType: 'json'
    }).then((data) => {
      dispatcher.dispatch({
        type: 'pending-member.fetched',
        data: { data, code }
      });
    });
    promise.catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'pending-member.fetch-failed',
        data: { jqxhr, code }
      });
    });
    return promise;
  }
}

export default new PendingMemberActions();
