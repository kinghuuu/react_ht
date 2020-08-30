import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { Divider } from 'antd';
import Standardtable from '../../components/standardtable';
import ServiceEdit from './module/serviceEdit';

class ServiceModule extends Component {
    constructor(props) {
        super(props);
        this.state = {
            editVisable: false,
            editData: {},
        };

        const { showModuleDetails, role } = props;
        let isLeader = role === '领导';

        this.columns = [
            { title: '编号', dataIndex: 'serialNumber', width: '8%' },
            { title: '服务名称', dataIndex: 'serverName' },
            { title: '服务路径', dataIndex: 'serverPath', width: '15%' },
            { title: '服务描述', dataIndex: 'description', width: '15%' },
            {
                title: '所属进程', dataIndex: 'process', width: '20%', render: (value = '', record) => {
                    let process = value.split(';');
                    return _.map(process, item => {
                        let [moduleName, process, port] = item.split('|');
                        return (<div key={item}>
                            {moduleName} -> {process}{port ? ` (${port})` : null}
                        </div>)
                    })
                }
            },
            { title: '运行状态', dataIndex: 'statusName', width: '10%' },
            {
                title: '操作', dataIndex: 'operation', width: '15%', render: (value, record) => {
                    return (<Fragment>
                        <a onClick={showModuleDetails.bind(this, record)} style={{ color: 'green' }} >详情</a>
                        {isLeader ? null : (
                            <Fragment>
                                <Divider type="vertical" />
                                <a onClick={this.handleUpdateSelfDefining.bind(this, record)}>编辑</a>
                                <Divider type="vertical" />
                                <a onClick={props.showDeleteConfirm.bind(this, { record, moduleKey: 'serverName' })} style={{ color: 'red' }} >删除</a>
                            </Fragment>
                        )}
                    </Fragment>);
                }
            },
        ];

    }


    // 关闭编辑天窗、如果需要则重新加载列表
    hideEditModal = (isRefresh = false, isCreate = false) => {
        const { getModelConfigList, pagination, updateIsCreate } = this.props;
        this.setState(() => ({ editVisable: false, editData: {} }));
        if (_.isFunction(updateIsCreate)) {
            updateIsCreate(false);
        }
        if (isRefresh) {
            if (isCreate) {
                // 新建的时候，要讲页面刷新到第一页去
                getModelConfigList({ limit: pagination.limit, pageIndex: 0 });
            } else {
                getModelConfigList();
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
            editData, editVisable
        } = this.state;
        let scrollY = window.document.body.offsetHeight - 234;

        return (
            <Fragment>

                <Standardtable
                    style={{ borderTop: '#eee solid 1px' }}
                    rowKey='nodeId'
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
                />

                {
                    editVisable || isCreate ? (
                        <ServiceEdit
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

export default connect(mapStateToProps)(ServiceModule);