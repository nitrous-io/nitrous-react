import React, { PropTypes } from 'react';
import { Input, Tabs, Tab, Grid, Row, Button } from 'react-bootstrap';
import Host from 'records/host';
import templateStore from 'stores/template-store';
import templateActions from 'actions/template-actions';
import containerActions from 'actions/container-actions';
import TemplateListItem from 'components/template-list-item';
import ImageList from 'components/image-list';
import Registries from 'components/registries';
import GenerateRandomNameButton from 'components/generate-random-name-button';
import keypather from 'keypather';

const keypath = keypather();

const imageTypeTemplate = 'template',
      imageTypeImage = 'image',
      imageTypeRepo = 'repo';

export default class NewContainer extends React.Component {
  displayName = 'NewContainer';

  static contextTypes = {
    router: PropTypes.func.isRequired, // Router.PropTypes.router.isRequired
    host: PropTypes.instanceOf(Host).isRequired
  };

  state = {
    projectName: null,
    creating: false,
    templates: templateStore.templates,
    selectedImageType: imageTypeTemplate,
    selectedImage: keypath.get(templateStore, 'templates.first().image')
  };

  componentDidMount() {
    templateStore.onChange(this.templateStoreDidChange);
    templateActions.fetchAll();

    this.refs.generateNameBtn.generate();
  }

  componentWillUnmount() {
    templateStore.offChange(this.templateStoreDidChange);
  }

  templateStoreDidChange = () => {
    const { templates } = templateStore;
    this.setState({
      templates,
      selectedImage: this.state.selectedImage || keypath.get(templates, 'first().image')
    });
  };

  handleTemplateSelection = (template) => {
    this.setState({
      selectedImageType: imageTypeTemplate,
      selectedImage: template.image
    });
  };

  handleImageSelection = (image) => {
    this.setState({
      selectedImageType: imageTypeImage,
      selectedImage: image.repo
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
        selectedImage: repo
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

  handleClickCreateBtn = () => {
    this.setState({ creating: true });

    const { projectName, selectedImage } = this.state,
          { host } = this.context,
          publishAll = true,
          updateImage = (this.state.selectedImageType !== imageTypeImage);

    let template = null;
    if (this.state.selectedImageType === imageTypeTemplate) {
      template = templateStore.templates.find((t) => {
        return t.image === selectedImage;
      });
    }

    const privileged = template ? template.privileged : false;

    containerActions.create(
      projectName, selectedImage, template, host, updateImage, privileged, publishAll
    ).then((imageId) => {
      this.context.router.transitionTo('container-creating',
        { hostSlug: host.slug },
        { name: projectName, imageId });
    }).catch(() => {
      this.setState({ creating: false });
    });
  };

  get isValid() {
    return !!(this.state.projectName && this.state.selectedImageType && this.state.selectedImage);
  }

  render() {
    const { projectName, creating, templates, selectedImageType, selectedImage } = this.state,
          { host } = this.context;

    return (
      <div className='new-container-component'>
        <div className='container'>
          <h2>Create New Project</h2>
          <h3>Project Name</h3>
          <div className='project-name'>
            <Input ref='projectNameField' type='text' placeholder='Name your Project...'
              required disabled={creating} value={projectName} onChange={this.handleChangeProjectNameField}
              buttonAfter={<GenerateRandomNameButton ref='generateNameBtn' onGenerate={this.handleRandomNameGenerated} />} />
          </div>
          <h3>Select Image</h3>
          <Tabs defaultActiveKey='templates'>
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
            <Tab eventKey='images' title='My Images'>
              <ImageList host={host}
                selectedImage={selectedImage}
                onSelect={this.handleImageSelection} />
            </Tab>
            <Tab eventKey='registries' title='Docker Repositories'>
              <Registries host={this.context.host} />
              <div className='custom-repo'>
                <Input ref='repoRadioBtn' type='radio' label='Use Image from Docker Repo:'
                  checked={selectedImageType === imageTypeRepo} onChange={this.handleClickRepoRadioBtn} />
                <Input ref='repoField' type='text' placeholder='registry/repo:tag'
                  disabled={selectedImageType !== imageTypeRepo} onChange={this.handleChangeRepoField} />
              </div>
            </Tab>
          </Tabs>
          <Button disabled={!this.isValid || creating} className='create-btn' bsStyle='success' onClick={this.handleClickCreateBtn}>Create Project</Button>
        </div>
      </div>
    );
  }
}
