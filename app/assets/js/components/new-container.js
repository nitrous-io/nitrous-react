import React, { PropTypes } from 'react';
import { Input, Tabs, Tab, Grid, Row, Button } from 'react-bootstrap';
import Host from 'records/host';
import containerStore from 'stores/container-store';
import orgStore from 'stores/org-store';
import userStore from 'stores/user-store';
import templateStore from 'stores/template-store';
import orgActions from 'actions/org-actions';
import templateActions from 'actions/template-actions';
import containerActions from 'actions/container-actions';
import ContextSwitcher from 'components/context-switcher';
import TemplateListItem from 'components/template-list-item';
import LocalSnapshotList from 'components/local-snapshot-list';
import TeamSnapshotList from 'components/team-snapshot-list';
import Registries from 'components/registries';
import GenerateRandomNameButton from 'components/generate-random-name-button';
import keypather from 'keypather';
import Mp from 'lib/mp';
import MpEvents from 'lib/mp-events';

const keypath = keypather();

const imageTypeTemplate = 'template',
      imageTypeLocalSnapshot = 'local-snapshot',
      imageTypeTeamSnapshot = 'team-snapshot',
      imageTypeRepo = 'repo';

export default class NewContainer extends React.Component {
  displayName = 'NewContainer';

  static contextTypes = {
    router: PropTypes.func.isRequired, // Router.PropTypes.router.isRequired
    host: PropTypes.instanceOf(Host).isRequired
  };

  static propTypes = {
    query: PropTypes.shape({
      tab: PropTypes.string,
      image: PropTypes.string,
      snapshotId: PropTypes.string
    })
  };

  static willTransitionTo() {
    Mp.track(MpEvents.EventDashboardViewedNewContainer);
  }

  constructor(props, context) {
    super(props, context);

    let selectedTab = 'templates',
        selectedImageType = imageTypeTemplate,
        selectedImage = null,
        selectedSnapshotId = null;

    switch (props.query.tab) {
      case 'local-snapshots': {
        selectedTab = props.query.tab;
        selectedImageType = imageTypeLocalSnapshot;
        selectedImage = props.query.image;
        break;
      }
      case 'team-snapshots': {
        selectedTab = props.query.tab;
        selectedImageType = imageTypeTeamSnapshot;
        selectedSnapshotId = parseInt(props.query.snapshotId, 10);
        break;
      }
      default: {
        selectedImage = keypath.get(templateStore, 'templates.first().image');
        break;
      }
    }

    this.state = {
      org: orgStore.orgByOrgId(this.context.host.orgId),
      projectName: null,
      creating: false,
      templates: templateStore.templates,
      selectedTab,
      selectedImageType,

      // Either selectedImage or selectedSnapshotId should be set.
      //   selectedImage: image repository to use to create container
      //   selectedSnapshotId: ID of snapshot to use to create container
      selectedImage,
      selectedSnapshotId
    };
  }

  componentDidMount() {
    templateStore.onChange(this.templateStoreDidChange);
    templateActions.fetchAll();

    orgStore.onChange(this.orgStoreDidChange);
    orgActions.fetchAll();

    containerStore.on('creating', this.onContainerCreating);
    containerStore.on('create-failed', this.onContainerCreateFailed);

    this.refs.generateNameBtn.generate();
  }

  componentWillUnmount() {
    templateStore.offChange(this.templateStoreDidChange);
    orgStore.offChange(this.orgStoreDidChange);
    containerStore.off('creating', this.onContainerCreating);
    containerStore.off('create-failed', this.onContainerCreateFailed);
  }

  templateStoreDidChange = () => {
    const { templates } = templateStore;
    this.setState({ templates });
    if (!this.state.selectedImage && !this.state.selectedSnapshotId) {
      this.setState({ selectedImage: keypath.get(templates, 'first().image') });
    }
  };

  orgStoreDidChange = () => {
    this.setState({ org: orgStore.orgByOrgId(this.context.host.orgId) });
  };

  onContainerCreating = (data) => {
    const { name, hostSlug, requestId } = data;
    if ((this.state.projectName === name) && (this.context.host.slug === hostSlug)) {
      this.context.router.transitionTo('container-creating',
        { hostSlug },
        { name, requestId });
    }
  };

  onContainerCreateFailed = (data) => {
    const { name, hostSlug } = data;
    if ((this.state.projectName === name) && (this.context.host.slug === hostSlug)) {
      this.setState({ creating: false });
    }
  };

  handleTabSelected = (key) => {
    // Clear selected image/snapshot when user changes tabs.
    this.setState({
      selectedTab: key,
      selectedImageType: null,
      selectedImage: null,
      selectedSnapshotId: null
    });
  };

  handleTemplateSelection = (template) => {
    this.setState({
      selectedImageType: imageTypeTemplate,
      selectedImage: template.image,
      selectedSnapshotId: null // Clear any previously selected snapshot.
    });
  };

  handleLocalSnapshotSelection = (snapshot) => {
    this.setState({
      selectedImageType: imageTypeLocalSnapshot,
      selectedImage: snapshot.repo,
      selectedSnapshotId: null // Clear any previously selected snapshot.
    });
  };

  handleTeamSnapshotSelection = (snapshot) => {
    this.setState({
      selectedImageType: imageTypeTeamSnapshot,
      selectedImage: null, // Clear any previously selected image.
      selectedSnapshotId: snapshot.id
    });
  };

  handleChangeProjectNameField = () => {
    this.setState({ projectName: this.refs.projectNameField.getValue() });
  };

  handleClickRepoRadioBtn = () => {
    const repo = this.refs.repoField.getValue();

    if (this.refs.repoRadioBtn.getChecked()) {
      this.setState({
        selectedImageType: imageTypeRepo,
        selectedImage: repo,
        selectedSnapshotId: null // Clear any previously selected snapshot.
      }, () => {
        const repoField = this.refs.repoField.getInputDOMNode();
        repoField.select();
        repoField.focus();
      });
    }
  };

  handleChangeRepoField = () => {
    const repo = this.refs.repoField.getValue();
    this.setState({ selectedImage: repo });
  };

  handleRandomNameGenerated = (name) => {
    this.setState({ projectName: name }, () => {
      const input = this.refs.projectNameField.getInputDOMNode();
      input.select();
      input.focus();
    });
  };

  handleSubmit = (event) => {
    event.preventDefault();
    if (!this.isValid()) {
      return;
    }

    this.setState({ creating: true });

    const { projectName, selectedImage, selectedImageType, selectedSnapshotId } = this.state,
          { host } = this.context,
          publishAll = true;
    let template = null,
        privileged = false,
        skipPull = false;

    if (selectedImageType === imageTypeTemplate) {
      template = templateStore.templates.find((t) => t.image === selectedImage);
      privileged = template.privileged;
    }
    if (selectedImageType === imageTypeLocalSnapshot) {
      skipPull = true;
    }

    containerActions.createAtomic(projectName, host, {
      imageRepo: selectedImage,
      template: template ? template.slug : null,
      snapshotId: selectedSnapshotId,
      privileged,
      publishAll,
      skipPull
    });
  };

  isValid() {
    const { projectName, selectedImageType, selectedImage, selectedSnapshotId } = this.state;
    if (!projectName) return false;
    if (!selectedImageType) return false;
    if (!selectedImage && !selectedSnapshotId) return false;
    return true;
  }

  render() {
    const { org, projectName, creating, templates,
            selectedImageType, selectedImage, selectedSnapshotId, selectedTab } = this.state,
          { host } = this.context,
          { advanced } = userStore;

    return (
      <div className='new-container-component'>
        <ContextSwitcher selectedHost={host} />
        <div className='container'>
          <h2>New Project</h2>

          <form onSubmit={this.handleSubmit}>
            <h3>Project Name</h3>
            <div className='project-name'>
              <Input ref='projectNameField' type='text' placeholder='Name your Project...'
                required disabled={creating} value={projectName} onChange={this.handleChangeProjectNameField}
                buttonAfter={<GenerateRandomNameButton ref='generateNameBtn' onGenerate={this.handleRandomNameGenerated} />} />
            </div>

            <Tabs defaultActiveKey='templates' className='ui-centered-tabs'
              activeKey={selectedTab}
              onSelect={this.handleTabSelected}>
              <Tab eventKey='templates' title='Nitrous Templates'>
                <Grid className='ui-card-grid'>
                  <Row>
                    {templates.toList().map((template) => {
                      return (
                        <TemplateListItem key={`template-${template.slug}`} template={template}
                          selected={selectedImage === template.image}
                          onSelect={this.handleTemplateSelection} />
                      );
                    })}
                  </Row>
                </Grid>
              </Tab>

              <Tab eventKey='local-snapshots' title='My Snapshots'>
                <LocalSnapshotList selectMode host={host}
                  selectedSnapshotRepo={selectedImage}
                  onSelect={this.handleLocalSnapshotSelection} />
              </Tab>

              {org ? (
                <Tab eventKey='team-snapshots' title='Team Snapshots'>
                  <TeamSnapshotList selectMode host={host} org={org}
                    selectedSnapshotId={selectedSnapshotId}
                    onSelect={this.handleTeamSnapshotSelection} />
                </Tab>
              ): ''}

              {advanced ? (
                <Tab eventKey='registries' title='Docker Repositories'>
                  <Registries showDisconnect={false} host={this.context.host} />
                  <div className='custom-repo'>
                    <Input ref='repoRadioBtn' type='radio' label='Use Image from Docker Repo:'
                      checked={selectedImageType === imageTypeRepo} onChange={this.handleClickRepoRadioBtn} />
                    <Input ref='repoField' type='text' placeholder='registry/repo:tag'
                      disabled={selectedImageType !== imageTypeRepo} onChange={this.handleChangeRepoField} />
                  </div>
                </Tab>
              ) : ''}
            </Tabs>

            <Button className='create-btn' bsStyle='primary' type='submit'
              disabled={!this.isValid() || creating}>
              Create Project
            </Button>
          </form>
        </div>
      </div>
    );
  }
}
