import React, { Component } from 'react';
import { connect } from 'react-redux';
import { updateRecordAction } from '../../../actions/application/action'
import { Table, Popover } from 'antd'
import Styles from './index.module.less'

class record extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    updateRecordList = () => {
        const { systemId, detailProgramList } = this.props
        let id = detailProgramList.fixedMap.id
        this.props.dispatch(updateRecordAction(systemId, id))
    }
    
    render() {
        const { recordList } = this.props

        const columns = [
            {
                title: '操作类型',
                dataIndex: 'changeType',
                // align: 'center',
                width: '15%'
            }, {
                title: '变更内容',
                dataIndex: 'changeDetails',
                // align: 'center',
                width: '35%',
                render: (text, record, index) => {
                    let changeDetails = record.changeDetails
                    return (
                        changeDetails.map((item, index) => {
                            return (
                                <div key={index} className={Styles.changeList}>
                                    <span style={{ color: 'red' }}>{item.propName}：</span>
                                    <span>{item.oldValue}<span style={{ color: 'blue' }}> -> </span> </span><span>{item.newValue}</span>
                                </div>
                            )
                        })

                    )
                }
            }, {
                title: '变更描述',
                dataIndex: 'changeDescription',
                // align: 'center',
                width: '20',
                ellipsis: true,
                render: (text, record, index) => {
                    return (
                        <Popover content={record.changeDescription} trigger="hover" placement="top" style={{ width: '35%' }}>
                            <div>{record.changeDescription}</div>
                        </Popover>
                    )
                }
            }, {
                title: '变更时间',
                dataIndex: 'changeTime',
                // align: 'center',
                width: '15%'
            }, {
                title: '变更人',
                dataIndex: 'changeOperator',
                // align: 'center',
                width: '15%'
            }
        ]

        let dataSource = []
        if (recordList.length > 0) {
            recordList.map((item, index) => {
                dataSource.push({
                    key: index,
                    changeType: item.changeType,
                    changeDetails: item.changeDetails,
                    changeDescription: item.changeDescription,
                    changeTime: item.changeTime,
                    changeOperator: item.changeOperator
                })
                return dataSource
            })
        }
        return (
            <div>
                <Table columns={columns} dataSource={dataSource} />
            </div>
        );
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        detailProgramList: state.detailProgramList,
        recordList: state.recordList,
    }
}

export default connect(mapStateToProps)(record);