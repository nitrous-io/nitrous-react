import React, { PropTypes } from 'react';
import { Grid, Row, Button } from 'react-bootstrap';
import Org from 'records/org';
import planStore from 'stores/plan-store';
import planActions from 'actions/plan-actions';
import regionStore from 'stores/region-store';
import regionActions from 'actions/region-actions';
import ContextSwitcher from 'components/context-switcher';
import PlanListItem from 'components/plan-list-item';
import RegionListItem from 'components/region-list-item';
import { notImplementedFn } from 'lib/not-implemented';

export default class NewWorkspace extends React.Component {
  displayName = 'NewWorkspace';

  static contextTypes = {
    org: PropTypes.instanceOf(Org)
  };

  state = {
    plans: this.context.org ? planStore.orgPlans : planStore.personalPlans,
    regions: regionStore.regions,
    selectedPlan: this.context.org ? planStore.orgPlans.first() : planStore.personalPlans.first(),
    selectedRegion: regionStore.regions.first()
  };

  componentDidMount() {
    planStore.onChange(this.planStoreDidChange);
    regionStore.onChange(this.regionStoreDidChange);
    planActions.fetchAll();
    regionActions.fetchAll();
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (this.context.org !== nextContext.org) {
      this.setPlans(nextContext);
    }
  }

  componentWillUnmount() {
    planStore.offChange(this.planStoreDidChange);
    regionStore.offChange(this.regionStoreDidChange);
  }

  setPlans(context=this.context) {
    const plans = context.org ? planStore.orgPlans : planStore.personalPlans;
    this.setState({
      plans,
      selectedPlan: this.state.selectedPlan || plans.first()
    });
  }

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

  render() {
    const org = this.context.org,
          plans = this.state.plans,
          regions = this.state.regions,
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
          <Button className='create-btn' bsStyle='success' onClick={notImplementedFn('Create Host', 'Use username as name of host')}>Create Workspace</Button>
        </div>
      </div>
    );
  }
}
