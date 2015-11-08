import React, { PropTypes } from 'react';
import Invoice from 'records/invoice';
import { Grid, Row, Col, Modal, Button } from 'react-bootstrap';
import Time from 'react-time';
import Currency from 'components/currency';
import stringUtil from 'lib/string-util';

export default class InvoiceListItem extends React.Component {
  displayName = 'InvoiceListItem';

  static propTypes = {
    invoice: PropTypes.instanceOf(Invoice).isRequired
  };

  state = {
    showModal: false
  }

  handleViewInvoice = () => {
    this.setState({ showModal: true });
  }

  hideModal = () => {
    this.setState({ showModal: false });
  }

  handleCloseModal = () => {
    this.hideModal();
  }

  render() {
    const invoice = this.props.invoice,
          invoiceTitle = stringUtil.titleize(`${invoice.title}`);
        
    return (
      <div className='invoice-list-item-component'>
        <Grid>
          <Row>
            <Col lg={3} md={3} sm={3} xs={3}>{invoiceTitle}</Col>
            <Col lg={3} md={3} sm={3} xs={3}><Time value={invoice.periodEnd} format="YYYY-MM-DD" /></Col>
            <Col lg={3} md={3} sm={3} xs={3}><Currency value={invoice.totalChargeDollars} /></Col>
            <Col lg={3} md={3} sm={3} xs={3}><a onClick={this.handleViewInvoice} className='btn btn-default'>View</a></Col>
          </Row>
        </Grid>
 
        <Modal show={this.state.showModal} onHide={this.hideModal}>
          <Modal.Header>
            <Modal.Title><Time value={invoice.periodEnd} format="YYYY-MM-DD" /></Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Grid>
              <Row>
                <Col lg={6} md={6} sm={6} xs={6}>Subscription to {invoiceTitle}</Col>
                <Col lg={3} md={3} sm={3} xs={3}><Currency value={invoice.totalChargeDollars} /></Col>
              </Row>
                {invoice.creditAvailable ? (
                  <Row>
                    <Col lg={6} md={6} sm={6} xs={6}>Credits applied</Col>
                    <Col lg={3} md={3} sm={3} xs={3}>(<Currency value={invoice.creditAvailableDollars} />)</Col>
                  </Row>
                ) : ''}
              <Row>
                <Col lg={6} md={6} sm={6} xs={6}><strong>Total Charge</strong></Col>
                <Col lg={3} md={3} sm={3} xs={3}><strong><Currency value={invoice.totalChargeDollars} /></strong></Col>
              </Row>
            </Grid>
          </Modal.Body>
          <Modal.Footer>
            <Button ref='modalCancel' onClick={this.handleCloseModal}>Close</Button>
          </Modal.Footer>
        </Modal>

      </div>
    );
  }
}
