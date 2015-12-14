import React, { PropTypes } from 'react';
import { Tooltip, OverlayTrigger, Label } from 'react-bootstrap';
import Plan from 'records/plan';

export default class RecommendTemplateList extends React.Component {
  displayName = 'RecommendTemplateList';

  static propTypes = {
    plan: PropTypes.instanceOf(Plan).isRequired
  };

  render() {
    const { plan } = this.props;

    let recommendTemplates = ['rails', 'nodejs', 'meteor'];
    if (plan.isBasic) {
      recommendTemplates = ['html5', 'jekyll'];
    } else if  (plan.isPlus) {
      recommendTemplates = ['java', 'docker'];
    }

    return (
      <div className='plan-recommend-templates'>
        <Label className='plan-recommend-label' bsStyle="info">Recommended for:</Label>

        {recommendTemplates.map((tmpl) => {
          const tooltip = <Tooltip id='recommend-icon-text'>{tmpl}</Tooltip>;
          return (
            <OverlayTrigger key={tmpl} placement='top' overlay={tooltip}>
              <div className='template-icon' style={{ backgroundImage: `url('https://nitrous-image-icons-update.s3.amazonaws.com/${tmpl}.png')` }}></div>
            </OverlayTrigger>);
        })}
      </div>
    );
  }
}
