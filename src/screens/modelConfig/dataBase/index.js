import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { Divider } from 'antd';
import Standardtable from '../../../components/standardtable';
import DatabaseOperation from './operation';
import DatabaseEdit from './edit';

class DatabaseModel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            editVisable: false,
            editData: {},
            queryValues: [],
        };

        const { showModuleDetails, role } = props;
        let isLeader = role === '领导';

        this.columns = [
            { title: '编号', dataIndex: 'serialNumber', width: '6%' },
            { title: '数据库类型', dataIndex: 'dataBaseType', width: '8%' },
            { title: '主库IP', dataIndex: 'masterIp', width: '10%' },
            { title: '主库端口', dataIndex: 'masterPort', width: '12%' },
            { title: '主库服务名', dataIndex: 'masterServer', width: '12%' },
            {
                title: '主库DBA', dataIndex: 'dbaname', width: '12%', render: (value = '') => {
                    let arr = value.split(',');
                    if (_.isEmpty(arr)) {
                        return '';
                    }
                    return arr.map(item => (<div key={item}>{item}</div>))
                }
            },
            { title: '最大连接数', dataIndex: 'maxConnectionNum', width: '10%' },
            {
                title: '灾备', dataIndex: 'disaster', render: (value = '') => {
                    let arr = value.split(';');
                    if (_.isEmpty(arr)) {
                        return ''
                    }
                    return arr.map(item => (<div key={item}>{item}</div>))
                }
            },
            {
                title: '操作', dataIndex: 'operation', width: '12%', render: (value, record) => {
                    return (<Fragment>
                        <a onClick={showModuleDetails.bind(this, record)} style={{ color: 'green' }} >详情</a>
                        {isLeader ? null : (
                            <Fragment>
                                <Divider type="vertical" />
                                <a onClick={this.handleUpdateSelfDefining.bind(this, record)}>编辑</a>
                                <Divider type='vertical' />
                                <a
                                    onClick={props.showDeleteConfirm.bind(this, { record, moduleKey: 'masterIp' })}
                                    style={{ color: 'red' }}
                                >删除</a>
                            </Fragment>
                        )}
                    </Fragment>);
                }
            },
        ]
    }


    // 关闭编辑天窗、如果需要则重新加载列表
    hideEditModal = (isRefresh = false, isCreate = false) => {
        const { getModelConfigList, pagination, updateIsCreate } = this.props;
        this.setState(() => ({ editVisable: false, editData: {} }));
        // if (_.isFunction(updateIsCreate)) {
        //     updateIsCreate(false);
        // }
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

    showEditModal = (editVisable = false) => {
        this.setState(() => ({ editVisable: true }))
    }



    render() {

        const {
            nodeType, systemId, isCreate, role,
            rows, results, tableLoading, pagination,
            handleRowChange, handlePaginationChange,
            getModelConfigList,
            updateQueryValue
        } = this.props;

        const {
            editData, editVisable
        } = this.state;
        let scrollY = window.document.body.offsetHeight - 230;

        return (
            <Fragment>

                <DatabaseOperation
                    systemId={systemId}
                    role={role}
                    nodeType={nodeType}
                    showEditModal={this.showEditModal}
                    getModelConfigList={getModelConfigList}
                    updateQueryValue={updateQueryValue}
                />


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
                        <DatabaseEdit
                            editData={editData}
                            systemId={systemId}
                            nodeType={nodeType}
                            hideEditModal={this.hideEditModal}
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

export default connect(mapStateToProps)(DatabaseModel);