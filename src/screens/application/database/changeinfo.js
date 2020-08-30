import React, { Component } from 'react';
import StandardTable from '../../../components/standardtable'
import { connect } from 'react-redux';
import { changeRecord } from '../../../actions/application/database/action'

class ChangeInfo extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      pagination: { limit: 10, pageIndex: 0 },
      changeList: [],
      changesLoading: false
    };
  }

  componentDidMount() {
    const { dispatch, record } = this.props;
    this.setState({
      changesLoading: true
    });
    dispatch(changeRecord(record, (res) => {
      if (!res.hasError)
        this.setState({
          changeList: res.rows || [],
          changesLoading: false
        });
    }));
  }

  //分页
  changePage = (pagination) => {
    let page = { pageIndex: pagination.current - 1, limit: pagination.pageSize };
    this.setState({
      pagination: page,
    });
  }

  render() {
    const { changeList, pagination: { limit, pageIndex }, changesLoading } = this.state;
    const columns = [
      {
        title: '操作类型', dataIndex: 'changeType', width: '15%',
        render: (changeType = '修改', record) => (
          <span> {changeType} </span>
        )
      },
      {
        title: '变更人', dataIndex: 'changeOperator', width: '20%',
      },
      {
        title: '变更内容', dataIndex: 'changeDetails', width: '40%',
        render: (changeInfo = [], record) => {
          return (
            <div>
              <span>{record.changeDescription}</span>
              {changeInfo.length && changeInfo.map((item, index) => {
                let oldValue = item.oldValue ? item.oldValue : '',
                  newValue = item.newValue ? item.newValue : '',
                  propName = item.propName ? item.propName : '',
                  arrayItems = '';
                //是字符串数组或 数组里包含着changeDetails时
                if (_.isArray(item)) {
                  arrayItems = _.map(item, (oracle, index) => (
                    (oracle.changeDetails && oracle.changeDetails.length) ?
                      _.map(oracle.changeDetails, (detail, index) => (
                        <div key={'oracle' + index}>
                          <span style={{ color: 'red' }}>{detail.propName}:</span> &nbsp;
                            {detail.oldValue} &nbsp;->&nbsp;{detail.newValue}
                        </div>
                      )) :
                      <div key={'item' + index}>
                        <span>{oracle}</span> </div>
                  ));
                }
                if (_.isString(item)) {
                  arrayItems = item;
                }
                return (
                  <div key={'info' + index}>
                    <div>{item.changeDescription}</div>
                    <div key={'change' + index}>
                      {(_.isArray(item) || _.isString(item)) && arrayItems}
                      {(item.propName || item.oldValue || item.newValue) &&
                        <span>
                          <span style={{ color: 'red' }}>{propName}:</span> &nbsp;
                        {oldValue} &nbsp;->&nbsp;{newValue}
                        </span>}
                      {(item.changeDetails && item.changeDetails.length) &&
                        _.map(item.changeDetails, (detail, index) => (
                          <div key={'detail' + index}>
                            <span style={{ color: 'red' }}>{detail.propName}:</span> &nbsp;
                            {detail.oldValue} &nbsp;->&nbsp;{detail.newValue}
                          </div>
                        ))}
                    </div>
                  </div>
                )
              }) || <span>{!record.changeDescription && 无}</span>
              }
            </div>
          )
        }
      },
      { title: '变更时间', dataIndex: 'changeTime', width: '25%' },
    ];

    return (
      <div>
        <StandardTable
          rowKey='changeTime'
          loading={changesLoading}
          columns={columns}
          data={{
            list: changeList,
            pagination: {
              current: pageIndex + 1,
              pageSize: limit,
              size: 'small',
              showSizeChanger: false,
              total: changeList.length,
            }
          }}
          rowSelection={false}
          onChange={this.changePage.bind(this)} />
      </div >
    );
  }
}

export default connect()(ChangeInfo);

