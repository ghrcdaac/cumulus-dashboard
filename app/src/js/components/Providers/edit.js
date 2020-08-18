'use strict';
import React from 'react';
import { Helmet } from 'react-helmet';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import {
  getProvider,
  updateProvider,
  clearUpdateProvider
} from '../../actions';
import EditRecord from '../Edit/edit';

const SCHEMA_KEY = 'provider';

class EditProvider extends React.Component {
  render () {
    const { providerId } = this.props.match.params;
    return (
      <div className = "edit_provider">
        <Helmet>
          <title> Edit Provider </title>
        </Helmet>
        <EditRecord
          merge={true}
          pk={providerId}
          schemaKey={SCHEMA_KEY}
          state={this.props.providers}
          getRecord={getProvider}
          updateRecord={updateProvider}
          clearRecordUpdate={clearUpdateProvider}
          backRoute={`/providers/provider/${providerId}`}
        />
      </div>
    );
  }
}

EditProvider.propTypes = {
  match: PropTypes.object,
  providers: PropTypes.object
};

export default withRouter(
  connect((state) => ({
    providers: state.providers
  }))(EditProvider));
