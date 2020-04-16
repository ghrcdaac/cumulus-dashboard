'use strict';
import React from 'react';
import { withRouter, Route, Switch } from 'react-router-dom';
import PropTypes from 'prop-types';
import Sidebar from '../Sidebar/sidebar';
import DatePickerHeader from '../DatePickerHeader/DatePickerHeader';
import ExecutionOverview from './overview';
import ExecutionStatus from './execution-status';
import ExecutionLogs from './execution-logs';
import ExecutionEvents from './execution-events';
import { getCount, listExecutions } from '../../actions';
import { strings } from '../locale';

class Executions extends React.Component {
  query () {
    this.props.dispatch(getCount({
      type: 'executions',
      field: 'status'
    }));
    this.props.dispatch(listExecutions());
    this.displayName = strings.executions;
  }

  render () {
    return (
      <div className='page__workflows'>
        <DatePickerHeader onChange={this.query} heading={strings.executions}/>
        <div className='page__content'>
          <div className='wrapper__sidebar'>
            <Route path='/executions/execution/:executionArn' component={Sidebar} />
            <Route exact path='/executions' component={Sidebar} />
            <div className='page__content--shortened'>
              <Switch>
                <Route exact path='/executions' component={ExecutionOverview} />
                <Route exact path='/executions/execution/:executionArn/logs' component={ExecutionLogs} />
                <Route exact path='/executions/execution/:executionArn/events' component={ExecutionEvents} />
                <Route exact path='/executions/execution/:executionArn' component={ExecutionStatus} />
              </Switch>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Executions.propTypes = {
  dispatch: PropTypes.func
};

export default withRouter(Executions);
