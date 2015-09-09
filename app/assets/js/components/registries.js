import React, { PropTypes } from 'react';
import { Table, Button } from 'react-bootstrap';
import Host from 'records/host';

export default class Registries extends React.Component {
  displayName = 'Registries';

  static propTypes = {
    host: PropTypes.instanceOf(Host).isRequired
  };

  render() {
    return (
      <div className='registries-component'>
        <Table striped>
          <thead>
            <tr>
              <th>Registry</th>
              <th>Username</th>
              <th />
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>DockerHub</td>
              <td>Not Connected</td>
              <td>
                <Button>Connect</Button>
              </td>
            </tr>
            <tr>
              <td>Quay.io</td>
              <td>Not Connected</td>
              <td>
                <Button>Connect</Button>
              </td>
            </tr>
            <tr>
              <td colSpan={3}>
                <Button>Add Custom Registry</Button>
              </td>
            </tr>
          </tbody>
        </Table>
      </div>
    );
  }
}
