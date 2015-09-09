import React, { PropTypes } from 'react';
import { Input, Tabs, Tab, Grid, Row, Table, Button } from 'react-bootstrap';
import Host from 'records/host';
import templateStore from 'stores/template-store';
import templateActions from 'actions/template-actions';
import imageStore from 'stores/image-store';
import imageActions from 'actions/image-actions';
import TemplateListItem from 'components/template-list-item';
import ImageListItem from 'components/image-list-item';
import Registries from 'components/registries';
import keypather from 'keypather';

const keypath = keypather();

const imageTypeTemplate = 'template',
      imageTypeImage = 'image',
      imageTypeRepo = 'repo';

export default class NewContainer extends React.Component {
  displayName = 'NewContainer';

  static contextTypes = {
    host: PropTypes.instanceOf(Host).isRequired
  };

  state = {
    projectName: null,
    creating: false,
    templates: templateStore.templates,
    snapshots: imageStore.snapshotsByHostSlug(this.context.host.slug),
    otherImages: imageStore.otherImagesByHostSlug(this.context.host.slug),
    selectedImageType: imageTypeTemplate,
    selectedImage: keypath.get(templateStore, 'templates.first().image')
  };

  componentDidMount() {
    templateStore.onChange(this.templateStoreDidChange);
    imageStore.onChange(this.imageStoreDidChange);
    templateActions.fetchAll();
    imageActions.fetchAllByHostSlug(this.context.host.slug);
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (this.context.host !== nextContext.host) {
      this.setState({
        snapshots: imageStore.snapshotsByHostSlug(nextContext.host.slug),
        otherImages: imageStore.otherImagesByHostSlug(nextContext.host.slug)
      });
      imageActions.fetchAllByHostSlug(nextContext.host.slug);
    }
  }

  componentWillUnmount() {
    templateStore.offChange(this.templateStoreDidChange);
    imageStore.offChange(this.imageStoreDidChange);
  }

  templateStoreDidChange = () => {
    const { templates } = templateStore;
    this.setState({
      templates,
      selectedImage: this.state.selectedImage || keypath.get(templates, 'first().image')
    });
  };

  imageStoreDidChange = () => {
    this.setState({
      snapshots: imageStore.snapshotsByHostSlug(this.context.host.slug),
      otherImages: imageStore.otherImagesByHostSlug(this.context.host.slug)
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

  get isValid() {
    return !!(this.state.projectName && this.state.selectedImageType && this.state.selectedImage);
  }

  render() {
    const { projectName, creating, templates, snapshots, otherImages, selectedImageType, selectedImage } = this.state;

    return (
      <div className='new-container-component'>
        <div className='container'>
          <h2>Create New Project</h2>
          <h3>Project Name</h3>
          <Input ref='projectNameField' className='project-name-field' type='text' placeholder='Name your Project...'
            required disabled={creating} value={projectName} onChange={this.handleChangeProjectNameField} />
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
              <Tabs defaultActiveKey='snapshots' bsStyle='pills' className='ui-segmented-pill images-tab'>
                <Tab eventKey='snapshots' title='My Snapshots'>
                  <Table className='image-table' striped>
                    <thead>
                      <tr>
                        <th className='btn-column' />
                        <th>Name</th>
                        <th className='created-column'>Created</th>
                        <th className='size-column'>Size</th>
                      </tr>
                    </thead>
                    <tbody>
                      {snapshots && snapshots.size > 0 ? snapshots.toList().map((snapshot) => {
                        return (
                          <ImageListItem key={`snapshot-${snapshot.id}`} image={snapshot}
                            selected={selectedImage === snapshot.repo}
                            onSelect={this.handleImageSelection} />
                        );
                      }) : (
                        <tr>
                          <td colSpan={4}>&nbsp;</td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </Tab>
                <Tab eventKey='other-images' title='Other Images'>
                  <Table className='image-table' striped>
                    <thead>
                      <tr>
                        <th className='btn-column' />
                        <th>Name</th>
                        <th className='created-column'>Created</th>
                        <th className='size-column'>Size</th>
                      </tr>
                    </thead>
                    <tbody>
                      {otherImages && otherImages.size > 0 ? otherImages.toList().map((image) => {
                        return (
                          <ImageListItem key={`image-${image.id}`} image={image}
                            selected={selectedImage === image.repo}
                            onSelect={this.handleImageSelection} />
                        );
                      }) : (
                        <tr>
                          <td colSpan={4}>&nbsp;</td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </Tab>
              </Tabs>
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
          <Button disabled={!this.isValid} className='create-btn' bsStyle='success'>Create Project</Button>
        </div>
      </div>
    );
  }
}
