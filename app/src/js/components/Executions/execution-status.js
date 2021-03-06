import React from 'react';
import { Helmet } from 'react-helmet';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import get from 'lodash/get';
import { withRouter, Link } from 'react-router-dom';
import { getExecutionStatus, getCumulusInstanceMetadata } from '../../actions';
import { displayCase, fullDate, parseJson } from '../../utils/format';
import { getPersistentQueryParams } from '../../utils/url-helper';
import { kibanaExecutionLink } from '../../utils/kibana';
import { window } from '../../utils/browser';

import ErrorReport from '../Errors/report';

import ExecutionStatusGraph from './execution-status-graph';
import Metadata from '../Table/Metadata';
import DefaultModal from '../Modal/modal';

class ExecutionStatus extends React.Component {
  constructor() {
    super();
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.state = {
      showInputModal: false,
      showOutputModal: false,
    };
  }

  componentDidMount () {
    const { dispatch, match } = this.props;
    const { executionArn } = match.params;
    dispatch(getExecutionStatus(executionArn));
    dispatch(getCumulusInstanceMetadata());
  }

  openModal(type) {
    switch (type) {
      case 'input':
        this.setState({ showInputModal: true });
        break;
      case 'output':
        this.setState({ showOutputModal: true });
        break;
      default:
        // do nothing
    }
  }

  closeModal(type) {
    switch (type) {
      case 'input':
        this.setState({ showInputModal: false });
        break;
      case 'output':
        this.setState({ showOutputModal: false });
        break;
      default:
        // do nothing
    }
  }

  render() {
    const { showInputModal, showOutputModal } = this.state;
    const { executionStatus, cumulusInstance } = this.props;
    const { error, execution, executionHistory, stateMachine } = executionStatus;

    if (!execution) return null;

    const { name } = execution;

    const metaAccessors = [
      {
        label: 'Execution Status',
        property: 'status',
        accessor: (d) => (
          <span className={`status__badge--small status__badge--${d.toLowerCase()}`}>
            {displayCase(d)}
          </span>
        ),
      },
      {
        label: 'Execution Arn',
        property: 'executionArn',
      },
      {
        label: 'State Machine Arn',
        property: 'stateMachineArn',
      },
      {
        label: 'Async Operation ID',
        property: 'output',
        accessor: (d) => {
          if (!d) return;
          const outputJson = JSON.parse(d);
          return get(outputJson.cumulus_meta, 'asyncOperationId');
        },
      },
      {
        label: 'Started',
        property: 'startDate',
        accessor: fullDate,
      },
      {
        label: 'Ended',
        property: 'stopDate',
        accessor: fullDate,
      },
      {
        label: 'Parent Workflow Execution',
        property: 'input',
        accessor: (d) => {
          if (!d) return 'N/A';
          const input = JSON.parse(d);
          const parent = get(input.cumulus_meta, 'parentExecutionArn');
          if (parent) {
            return (
              <Link
                to={(location) => ({
                  pathname: `/executions/execution/${parent}`,
                  search: getPersistentQueryParams(location),
                })}
                title={parent}
              >
                {parent}
              </Link>
            );
          }
          return 'N/A';
        },
      },
      {
        label: 'Input',
        property: 'input',
        accessor: (d) => {
          if (d) {
            return (
              <>
                <button
                  onClick={() => this.openModal('input')}
                  className="button button--small button--no-left-padding"
                >
                  Show Input
                </button>
                <DefaultModal
                  showModal={showInputModal}
                  title="Execution Input"
                  onCloseModal={() => this.closeModal('input')}
                  hasConfirmButton={false}
                  cancelButtonClass="button--close"
                  cancelButtonText="Close"
                  className="execution__modal"
                >
                  <pre>{parseJson(d)}</pre>
                </DefaultModal>
              </>
            );
          }
          return 'N/A';
        },
      },
      {
        label: 'Output',
        property: 'output',
        accessor: (d) => {
          if (d) {
            const jsonData = typeof Blob !== 'undefined' ? new Blob([d], { type: 'text/json' }) : null;
            const downloadUrl = typeof window.URL.createObjectURL === 'function'
              ? window.URL.createObjectURL(jsonData)
              : '';
            return (
              <>
                <button
                  onClick={() => this.openModal('output')}
                  className="button button--small button--no-left-padding"
                >
                  Show Output
                </button>
                <DefaultModal
                  showModal={showOutputModal}
                  title={
                    <>
                      <span>Execution Output</span>
                      <a
                        className="button button--small button--download button--green form-group__element--right"
                        id="download_link"
                        download="output.json"
                        href={downloadUrl}
                      >
                        Download File
                      </a>
                    </>
                  }
                  onCloseModal={() => this.closeModal('output')}
                  hasConfirmButton={false}
                  cancelButtonClass="button--close"
                  cancelButtonText="Close"
                  className="execution__modal"
                >
                  <pre>{parseJson(d)}</pre>
                </DefaultModal>
              </>
            );
          }
          return 'N/A';
        },
      },
      {
        label: 'Logs',
        property: 'executionArn',
        accessor: (d) => {
          const kibanaLink = kibanaExecutionLink(cumulusInstance, d);
          const className =
            'button button--small button__goto button__arrow button__animation button__arrow--white';
          if (kibanaLink && kibanaLink.length) {
            return (
              <a href={kibanaLink} target="_blank" className={className}>
                View Logs in Kibana
              </a>
            );
          }
          return (
            <Link
              to={(location) => ({
                pathname: `/executions/execution/${d}/logs`,
                search: getPersistentQueryParams(location),
              })}
              title={`${d}/logs`}
              className={className}
            >
              View Execution Logs
            </Link>
          );
        },
      },
    ];

    return (
      <div className="page__component">
        <Helmet>
          <title> Execution Status </title>
        </Helmet>
        <section className="page__section page__section__header-wrapper">
          <h1 className="heading--large heading--shared-content with-description width--three-quarters">
            Execution: {name}
          </h1>

          {error && <ErrorReport report={error} />}
        </section>

        {/* stateMachine's definition and executionHistory's event statuses are needed to draw the graph */}
        {stateMachine && executionHistory && (
          <section className="page__section">
            <div className="heading__wrapper--border">
              <h2 className="heading--medium with-description">Visual</h2>
            </div>
            <ExecutionStatusGraph executionStatus={executionStatus} />
          </section>
        )}

        <section className="page__section">
          <div className="heading__wrapper--border">
            <h2 className="heading--medium with-description">Details</h2>
          </div>
          <div className="execution__content status--process">
            <Metadata data={execution} accessors={metaAccessors} />
          </div>
        </section>
      </div>
    );
  }
}

ExecutionStatus.propTypes = {
  executionStatus: PropTypes.object,
  match: PropTypes.object,
  dispatch: PropTypes.func,
  cumulusInstance: PropTypes.object,
};

ExecutionStatus.displayName = 'Execution';

export { ExecutionStatus };

export default withRouter(
  connect((state) => ({
    executionStatus: state.executionStatus,
    cumulusInstance: state.cumulusInstance,
  }))(ExecutionStatus)
);
