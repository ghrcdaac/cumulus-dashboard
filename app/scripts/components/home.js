'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { get } from 'object-path';
import {
  interval,
  getStats,
  getCount,
  getDistMetrics,
  listGranules,
  listExecutions,
  listRules
} from '../actions';
import {
  nullValue,
  tally,
  seconds
} from '../utils/format';
import List from './table/list-view';
import GranulesProgress from './granules/progress';
import {
  errorTableHeader,
  errorTableRow,
  errorTableSortProps
} from '../utils/table-config/granules';
import { recent, updateInterval } from '../config';

import { strings } from './locale';

class Home extends React.Component {
  constructor () {
    super();
    this.displayName = 'Home';
    this.query = this.query.bind(this);
    this.generateQuery = this.generateQuery.bind(this);
  }

  componentDidMount () {
    this.cancelInterval = interval(() => {
      this.query();
    }, updateInterval, true);
  }

  componentWillUnmount () {
    if (this.cancelInterval) { this.cancelInterval(); }
  }

  query () {
    const { dispatch } = this.props;
    // TODO should probably time clamp this by most recent as well?
    dispatch(getStats({
      timestamp__from: recent
    }));
    dispatch(getCount({
      type: 'granules',
      field: 'status'
    }));
    dispatch(getDistMetrics({}));
    dispatch(listExecutions({}));
    dispatch(listRules({}));
  }

  generateQuery () {
    return {
      q: '_exists_:error AND status:failed',
      limit: 20
    };
  }

  renderButtonListSection (items, header, listId) {
    const data = items.filter(d => d[0] !== nullValue);
    if (!data.length) return null;
    return (
      <section className='page_section'>
        <div className='row'>
          <div className='heading__wrapper--border'>
              <h2 className='heading--medium heading--shared-content--right'>{header}</h2>
          </div>
          <ul id={listId}>
            {data.map(d => {
              const value = d[0];
              return (
                <li key={d[1]}>
                  <Link id={d[1]} className='overview-num' to={d[2] || '#'}>
                    <span className='num--large'>{value}</span> {d[1]}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    );
  }

  render () {
    const { list } = this.props.granules;
    const { stats, count } = this.props.stats;
    const { dist } = this.props;
    const overview = [
      [tally(get(stats.data, 'errors.value')), 'Errors', '/logs'],
      [tally(get(stats.data, 'collections.value')), strings.collections, '/collections'],
      [tally(get(stats.data, 'granules.value')), strings.granules, '/granules'],
      [tally(get(this.props.executions, 'list.meta.count')), 'Executions', '/executions'],
      [tally(get(this.props.rules, 'list.meta.count')), 'Ingest Rules', '/rules'],
      [seconds(get(stats.data, 'processingTime.value', nullValue)), 'Average processing Time']
    ];
    const distStats = [
      [tally(get(dist.data, 'errors')), 'Errors', '/distribution'],
      [tally(get(dist.data, 'successes')), 'Successes', '/distribution']
    ];
    const granuleCount = get(count.data, 'granules.meta.count');
    const numGranules = !isNaN(granuleCount) ? `(${tally(granuleCount)})` : null;
    const granuleStatus = get(count.data, 'granules.count', []);

    return (
      <div className='page__home'>
        <div className='content__header content__header--lg'>
          <div className='row'>
            <h1 className='heading--xlarge'>{strings.dashboard}</h1>
          </div>
        </div>
        <div className='page__content page__content__nosidebar'>
          {this.renderButtonListSection(overview, 'Updates')}
          {this.renderButtonListSection(distStats, 'Distribution Metrics', 'distMetrics')}
          <section className='page__section'>
            <div className='row'>
              <div className='heading__wrapper--border'>
                <h2 className='heading--medium heading--shared-content--right'>{strings.granules_updated}<span className='num--title'>{numGranules}</span></h2>
              </div>
              <GranulesProgress granules={granuleStatus} />
            </div>
          </section>
          <section className='page__section list--granules'>
            <div className='row'>
              <div className='heading__wrapper--border'>
                <h2 className='heading--medium'>{strings.granules_errors}</h2>
              </div>
              <List
                list={list}
                dispatch={this.props.dispatch}
                action={listGranules}
                tableHeader={errorTableHeader}
                sortIdx={4}
                tableRow={errorTableRow}
                tableSortProps={errorTableSortProps}
                query={this.generateQuery()}
              />
              <Link className='link--secondary link--learn-more' to='/granules'>{strings.view_granules_overview}</Link>
            </div>
          </section>
        </div>
      </div>
    );
  }
}

Home.propTypes = {
  dispatch: PropTypes.func,
  stats: PropTypes.object,
  dist: PropTypes.object,
  rules: PropTypes.object,
  granules: PropTypes.object,
  pdrs: PropTypes.object,
  executions: PropTypes.object
};

export { Home };
export default connect(state => ({
  rules: state.rules,
  stats: state.stats,
  dist: state.dist,
  granules: state.granules,
  pdrs: state.pdrs,
  executions: state.executions
}))(Home);
