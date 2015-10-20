import React, { PropTypes } from 'react';
import { Grid, Row, Button } from 'react-bootstrap';
import Org from 'records/org';
import hostStore from 'stores/host-store';
import planStore from 'stores/plan-store';
import regionStore from 'stores/region-store';
import userStore from 'stores/user-store';
import hostActions from 'actions/host-actions';
import planActions from 'actions/plan-actions';
import regionActions from 'actions/region-actions';
import ContextSwitcher from 'components/context-switcher';
import PlanListItem from 'components/plan-list-item';
import RegionListItem from 'components/region-list-item';

export default class NewWorkspace extends React.Component {
  displayName = 'NewWorkspace';

  static contextTypes = {
    router: PropTypes.func.isRequired, // Router.PropTypes.router.isRequired
    org: PropTypes.instanceOf(Org)
  };

  state = {
    user: userStore.user,
    plans: this.context.org ? planStore.orgPlans : planStore.personalPlans,
    regions: regionStore.regions,
    selectedPlan: this.context.org ? planStore.orgPlans.first() : planStore.personalPlans.first(),
    selectedRegion: regionStore.regions.first(),
    creating: false
  };

  componentDidMount() {
    planStore.onChange(this.planStoreDidChange);
    regionStore.onChange(this.regionStoreDidChange);
    planActions.fetchAll();
    regionActions.fetchAll();

    hostStore.on('create-initiated', this.onHostCreateInitiated);
    hostStore.on('created', this.onHostCreated);
    hostStore.on('create-failed', this.onHostCreateFailed);
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (this.context.org !== nextContext.org) {
      this.setPlans(nextContext);
    }
  }

  componentWillUnmount() {
    planStore.offChange(this.planStoreDidChange);
    regionStore.offChange(this.regionStoreDidChange);

    hostStore.off('create-initiated', this.onHostCreateInitiated);
    hostStore.off('created', this.onHostCreated);
    hostStore.off('create-failed', this.onHostCreateFailed);
  }

  onHostCreateInitiated = () => {
    // Do nothing.
  };

  onHostCreated = (data) => {
    const host = data.host;
    this.context.router.transitionTo('new-container', { hostSlug: host.slug });
  };

  onHostCreateFailed = () => {
    this.setState({ creating: false });
  };

  setPlans(context=this.context) {
    const plans = context.org ? planStore.orgPlans : planStore.personalPlans;
    this.setState({
      plans,
      selectedPlan: this.state.selectedPlan || plans.first()
    });
  }

  userStoreDidChange = () => {
    this.setState({ user: userStore.user });
  };

  planStoreDidChange = () => {
    this.setPlans();
  };

  regionStoreDidChange = () => {
    const regions = regionStore.regions;
    this.setState({
      regions,
      selectedRegion: this.state.selectedRegion || regions.first()
    });
  };

  handlePlanSelection = (plan) => {
    this.setState({ selectedPlan: plan });
  };

  handleRegionSelection = (region) => {
    this.setState({ selectedRegion: region });
  };

  handleClickCreateBtn = () => {
    this.setState({ creating: true });

    const { user, selectedPlan, selectedRegion } = this.state,
          org = this.context.org,
          name = user.username; // use username for name of host

    hostActions.create({ name, org, plan: selectedPlan, region: selectedRegion });
  };

  render() {
    const org = this.context.org,
          { plans, regions, creating } = this.state,
          selectedPlanSlug = this.state.selectedPlan ? this.state.selectedPlan.slug : null,
          selectedRegionSlug = this.state.selectedRegion ? this.state.selectedRegion.slug : null;

    return (
      <div className='new-workspace-component'>
        <div className='container'>
          <ContextSwitcher selectedOrg={org} />
          <h2>Create New Workspace</h2>
          <h3>Select Plan</h3>
          <p className='hint'>All plans are standard with solid state drives (SSD)</p>
          <Grid className='ui-card-grid'>
            <Row>
              {plans.toList().map((plan) => {
                return (
                  <PlanListItem key={`plan-${plan.slug}`} plan={plan}
                    selected={selectedPlanSlug === plan.slug} // compare slug because plans may have been reloaded
                    onSelect={this.handlePlanSelection} />
                );
              })}
            </Row>
          </Grid>
          <h3>Select Region</h3>
          <p className='hint'>Select the region closest to you for best performance</p>
          <Grid className='ui-card-grid'>
            <Row>
              {regions.toList().map((region) => {
                return (
                  <RegionListItem key={`region-${region.slug}`} region={region}
                    selected={selectedRegionSlug === region.slug}
                    onSelect={this.handleRegionSelection} />
                );
              })}
            </Row>
          </Grid>
          <Button disabled={creating} className='create-btn' bsStyle='success' onClick={this.handleClickCreateBtn}>Create Workspace</Button>
        </div>
      </div>
    );
  }
}
