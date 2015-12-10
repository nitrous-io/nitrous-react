import React, { PropTypes } from 'react';
import { Carousel, CarouselItem, Modal } from 'react-bootstrap';

import userActions from 'actions/user-actions';
import userStore from 'stores/user-store';

export default class OnboardingModal extends React.Component {
  displayName = 'OnboardingModal';

  static contextTypes = {
    router: PropTypes.func.isRequired
  };

  static propTypes = {
    activeSlide: PropTypes.func.isRequired
  };

  constructor(props, context) {
    super(props, context);

    const user = userStore.user,
          showOnboardingModal = user ? (user && user.firstTime) : false;

    this.state = {
      coverSlide: true,
      finalSlide: false,
      showOnboardingModal
    };
  }

  componentDidMount() {
    userStore.onChange(this.userStoreDidChange);
  }

  componentWillUnmount() {
    userStore.offChange(this.userStoreDidChange);
  }

  userStoreDidChange = () => {
    const user = userStore.user;
    if (user && user.firstTime) {
      this.setState({ showOnboardingModal: true });
    }
  }

  hideOnboardingModal = () => {
    this.setState({ showOnboardingModal: false });
    this.props.activeSlide();
    this.setBtnLabel();
    userActions.dismissFirstTime();
  };

  handleSelect = (selectedIndex) => {
    const slides = {
      cover: 0,
      dashboard: 1,
      context: 2,
      settings: 3
    };

    switch (selectedIndex) {
      case slides.cover: {
        this.setBtnLabel('cover');
        this.props.activeSlide();
        return;
      }
      case slides.dashboard: {
        this.setBtnLabel();
        this.props.activeSlide('dashboard');
        return;
      }
      case slides.context: {
        this.setBtnLabel();
        this.props.activeSlide('context');
        return;
      }
      case slides.settings: {
        this.setBtnLabel('final');
        this.props.activeSlide('settings');
        return;
      }
      default: {
        this.props.activeSlide();
      }
    }
  };

  setBtnLabel(slide) {
    let coverSlide = false,
        finalSlide = false;

    switch (slide) {
      case 'cover': { coverSlide = true; break; }
      case 'final': { finalSlide = true; break; }
      default: { break; }
    }

    this.setState({
      coverSlide,
      finalSlide
    });
  }

  render() {
    const { coverSlide, finalSlide, showOnboardingModal } = this.state;

    let nextLabel = 'Show me >';
    let prevLabel = null;
    if (!coverSlide && !finalSlide) {
      nextLabel = 'Next >';
      prevLabel = '< Back';
    } else if (finalSlide) {
      nextLabel = null;
      prevLabel = '< Back';
    }

    return (
      <Modal show={showOnboardingModal} onHide={this.hideOnboardingModal} dialogClassName='onboarding-modal' backdrop={false}>
        <Modal.Header closeButton>
          <Modal.Title>Quick Tour</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Carousel prevIcon ={prevLabel} nextIcon={nextLabel} interval={0} onSelect={this.handleSelect} id='carousel-onboard'>
            <CarouselItem> 
              <h2>Welcome to the new Nitrous</h2>
              <p className='hint'>We&#39;ve made Nitrous even better and simpler</p>
              <div className='logo-image'></div>
            </CarouselItem>
            <CarouselItem>
              <h2>A whole new Dashboard</h2>
              <p className='hint'>Simpler, faster, with access to your projects in one click</p>
              <div className='dashboard-image'></div>
            </CarouselItem>
            <CarouselItem>
              <h2>Quick access to Shared Projects</h2>
              <p className='hint'>Switch between your projects, your team&#39;s, and the ones shared with you</p>
              <div className='context-image'></div>
            </CarouselItem>
            <CarouselItem>
              <h2>All your settings in one place</h2>
              <p className='hint'>No more hunting around&mdash; everything is where it should be</p>
              <div className='settings-image'></div>
            </CarouselItem>
          </Carousel>
        </Modal.Body>
      </Modal>
    );
  }
}
