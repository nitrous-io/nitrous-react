import React, { PropTypes } from 'react';
import { Input, Button } from 'react-bootstrap';
import Host from 'records/host';
import imageActions from 'actions/image-actions';
import imageStore from 'stores/image-store';

export default class PullImage extends React.Component {
  displayName = 'PullImage';

  static contextTypes = {
    router: PropTypes.func.isRequired,
    host: PropTypes.instanceOf(Host).isRequired
  };

  state = {
    name: null
  };

  componentDidMount() {
    imageStore.on('pulling', this.handleImagePulling);
  }

  componentWillUnmount() {
    imageStore.off('pulling', this.handleImagePulling);
  }

  handleImagePulling = (event) => {
    const { pendingPullName } = this.state;
    if (!pendingPullName) {
      return;
    }

    if (event.repo && event.repo.indexOf(pendingPullName) !== -1) {
      this.context.router.transitionTo('workspace-images', { hostSlug: this.context.host.slug });
    }
  }

  handleChangeNameField = (event) => {
    this.setState({ name: event.target.value });
  }

  handleSubmit = (event) => {
    event.preventDefault();

    const { name } = this.state;
    if (!name) {
      return;
    }

    this.setState({ pendingPullName: name });
    imageActions.pull(this.context.host.slug, name, true);
  }

  render() {
    const { name } = this.state,
          canPull = name && name.length > 0;

    return (
      <div className='pull-image-component'>
        <div className='container'>
          <h3>Pull Image from a Docker repository</h3>
          <form onSubmit={this.handleSubmit}>
            <div className='name'>
              <Input label="Image Repository" type='text' placeholder='e.g: centos or quay.io/mycompany/rails'
                required value={name} onChange={this.handleChangeNameField} />
            </div>
            <Button type='submit' disabled={!canPull} bsStyle='primary'>Pull</Button>
          </form>
        </div>
      </div>
    );
  }
}
