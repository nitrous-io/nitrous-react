import { authedAjax }  from 'lib/ajax';
import dispatcher from 'app-dispatcher';

class RegistryActions {
  fetchAllByHostSlug(hostSlug) {
    return authedAjax({
      type: 'GET',
      url: `/api/v0/hosts/${hostSlug}/registries`,
      dataType: 'json'
    }).then((data) => {
      dispatcher.dispatch({
        type: 'registry.fetched-all-by-host-slug',
        data: {
          data,
          hostSlug
        }
      });
    }).catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'registry.fetch-all-by-host-slug-failed',
        data: {
          jqxhr,
          hostSlug
        }
      });
    });
  }

  login(hostSlug, options) {
    const { url, username, email, password } = options;
    const params = {
      url,
      username,
      email,
      password,
      async: true
    };
    return authedAjax({
      type: 'POST',
      url: `/api/v0/hosts/${hostSlug}/registries`,
      data: params
    }).then((data) => {
      dispatcher.dispatch({
        type: 'registry.logged-in',
        data: {
          data,
          hostSlug
        }
      });
    }).catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'registry.login-failed',
        data: {
          jqxhr,
          hostSlug
        }
      });
    });
  }

  logout(hostSlug, id) {
    return authedAjax({
      type: 'DELETE',
      url: `/api/v0/hosts/${hostSlug}/registries/${id}`
    }).then((data) => {
      dispatcher.dispatch({
        type: 'registry.logged-out',
        data: {
          data,
          hostSlug,
          id
        }
      });
    }).catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'registry.logout-failed',
        data: {
          jqxhr,
          hostSlug,
          id
        }
      });
    });
  }
}

export default new RegistryActions();
