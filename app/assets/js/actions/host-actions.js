import { authedAjax }  from 'lib/ajax';
import dispatcher from 'app-dispatcher';

class HostActions {
  fetchAll() {
    return authedAjax({
      type: 'GET',
      url: '/api/v0/hosts',
      dataType: 'json'
    }).then((data) => {
      dispatcher.dispatch({
        type: 'host.fetched-all',
        data: { data }
      });
    }).catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'host.fetch-all-failed',
        data: { jqxhr }
      });
    });
  }

  fetchOne(slug) {
    return authedAjax({
      type: 'GET',
      url: `/api/v0/hosts/${slug}`,
      dataType: 'json'
    }).then((data) => {
      dispatcher.dispatch({
        type: 'host.fetched-one',
        data: {
          data,
          slug
        }
      });
    }).catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'host.fetch-one-failed',
        data: { jqxhr }
      });
    });
  }

  create(options) {
    const { name, plan, region } = options;

    return authedAjax({
      type: 'POST',
      url: '/api/v0/hosts',
      data: {
        async: true,
        name,
        size: plan.slug,
        region: region.slug
      }
    }).then((data) => {
      dispatcher.dispatch({
        type: 'host.create-initiated',
        data: {
          data,
          hostId: data.host.id
        }
      });
    }).catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'host.create-failed',
        data: {
          jqxhr
        }
      });
    });
  }
}

export default new HostActions();
