import { ajax }  from 'lib/ajax';
import appSettingsStore from 'stores/app-settings-store';

class AppSettingsActions {
  fetch() {
    return ajax({
      type: 'GET',
      url: '/api/v0/app_settings',
      dataType: 'json'
    }).then((data) => {
      appSettingsStore.handleAction({
        type: 'app-settings.fetched',
        data
      });
    }).catch((jqxhr) => {
      appSettingsStore.handleAction({
        type: 'app-settings.fetch-failed',
        data: jqxhr
      });
    });
  }
}

export default new AppSettingsActions();
