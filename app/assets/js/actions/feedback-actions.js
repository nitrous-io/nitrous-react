import { authedAjax }  from 'lib/ajax';
// import dispatcher from 'app-dispatcher';

class FeedbackActions {
  send(subject, message) {
    const promise = authedAjax({
      type: 'POST',
      url: `/api/v0/feedback`,
      dataType: 'json',
      data: {
        subject,
        body: message,
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        currentURL: window.location.href
      }
    });
    
    return promise;
  }
}

export default new FeedbackActions();
