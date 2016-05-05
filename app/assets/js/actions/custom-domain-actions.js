import { authedAjax }  from 'lib/ajax';
import dispatcher from 'app-dispatcher';

class CustomDomainActions {
  fetchAllByContainerSlug(containerSlug) {
    const promise = authedAjax({
      type: 'GET',
      url: `/api/v0/containers/${containerSlug}/custom_domains`,
      dataType: 'json'
    }).then((data) => {
      dispatcher.dispatch({
        type: 'custom-domain.fetched-all-by-container-slug',
        data: { data, containerSlug }
      });
    });
    promise.catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'custom-domain.fetch-all-by-container-slug-failed',
        data: { jqxhr }
      });
    });
    return promise;
  }

  add(containerSlug, domainName, port, containerPort) {
    const data = {
      slug: containerSlug,
      domain: domainName,
      port, container_port: containerPort
    };
    const promise = authedAjax({
      type: 'POST',
      url: `/api/v0/containers/${containerSlug}/custom_domains`,
      data,
      dataType: 'json'
    }).then(() => {
      dispatcher.dispatch({
        type: 'custom-domain.added'
      });
    });
    promise.catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'custom-domain.add-failed',
        data: { jqxhr }
      });
    });
    return promise;
  }

  delete(containerSlug, customDomainId) {
    const promise = authedAjax({
      type: 'DELETE',
      url: `/api/v0/containers/${containerSlug}/custom_domains/${customDomainId}`,
      dataType: 'json'
    }).then(() => {
      dispatcher.dispatch({
        type: 'custom-domain.deleted'
      });
    });
    promise.catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'custom-domain.delete-failed',
        data: { jqxhr, customDomainId }
      });
    });
    return promise;
  }
}

export default new CustomDomainActions();
