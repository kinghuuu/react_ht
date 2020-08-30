import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import Standardtable from '../../components/standardtable';
import LineEdit from './module/lineEdit';

class LineModule extends Component {
    constructor(props) {
        super(props);
        this.state = {
            editVisable: false,
            editData: {},
        };

        const { role } = props;
        let isLeader = role === '领导';

        this.columns = [
            { title: '编号', dataIndex: 'serialNumber', width: '8%' },
            { title: '线路名称', dataIndex: 'lineName', width: '20%' },
            { title: 'A端IP', dataIndex: 'aIp', width: '10%' },
            { title: 'A端端口', dataIndex: 'aPort', width: '10%' },
            { title: 'Z端IP', dataIndex: 'zIp', width: '10%' },
            { title: 'Z端端口', dataIndex: 'zPort', width: '10%' },
            { title: '线路组序号', dataIndex: 'lineGroupIdList', width: '20%' },
            {
                title: '操作', dataIndex: 'operation', render: (value, record) => {
                    return (<Fragment>
                        {
                            isLeader ? null : (
                                <Fragment>
                                    <a
                                        onClick={props.showDeleteConfirm.bind(this, { record, moduleKey: 'lineName' })}
                                        style={{ color: 'red' }}
                                    >删除</a>
                                </Fragment>
                            )
                        }
                    </Fragment>);
                }
            },
        ]

        if (isLeader) {
            this.columns = this.columns.filter(item => item.dataIndex !== 'operation')
        }
    }

    // 关闭编辑窗口、如果需要则重新加载列表
    hideEditModal = (isRefresh = false, isCreate = false) => {
        const { getLineInfoList, pagination, updateIsCreate } = this.props;

        this.setState(() => ({ editVisable: false, editData: {} }));
        if (_.isFunction(updateIsCreate)) {
            updateIsCreate(false);
        }
        if (isRefresh) {
            if (isCreate) {
                // 新建的时候，页面刷新到第一页去
                getLineInfoList({ limit: pagination.limit, pageIndex: 0, lineName: '' });
            } else {
                getLineInfoList();
            }
        }
    }

    // 编辑属性
    handleUpdateSelfDefining = (editData, evt) => {
        evt.stopPropagation();
        this.setState(() => ({
            editVisable: true,
            editData,
        }));
    }

    render() {
        const {
            nodeType, systemId, isCreate,
            rows, results, tableLoading, pagination,
            handleRowChange, handlePaginationChange,
        } = this.props;

        const {
            editData, editVisable,
        } = this.state;
        let scrollY = window.document.body.offsetHeight - 230;

        return (
            <Fragment>
                <Standardtable
                    style={{ borderTop: '#eee solid 1px' }}
                    rowKey='lineName'
                    loading={tableLoading}
                    columns={this.columns}
                    size='middle'
                    scroll={{ y: scrollY > 460 ? false : scrollY }}
                    data={{
                        list: rows,
                        pagination: {
                            current: pagination.pageIndex + 1,
                            pageSize: pagination.limit,
                            total: results
                        }
                    }}
                    rowSelection={{ selectedRowKeys: [], type: 'checkbox' }}
                    onSelectRow={handleRowChange}
                    onChange={handlePaginationChange}
                >
                </Standardtable>
                {
                    editVisable || isCreate ? (
                        <LineEdit
                            editData={editData}
                            systemId={systemId}
                            nodeType={nodeType}
                            hideModal={this.hideEditModal}
                        />
                    ) : null
                }
            </Fragment>
        );
    }
}

const mapStateToProps = (state) => {
    const { rows, results, tableLoading, pagination } = state.modelConfig;
    return { rows, results, tableLoading, pagination };
}

export default connect(mapStateToProps)(LineModule);