import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { Divider } from 'antd';
import Standardtable from '../../../components/standardtable';
import DataBaseUserOperation from './operation';
import DataBaseUserEdit from './edit';

class DataBaseUserModel extends Component {
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
            { title: '所属数据库', dataIndex: 'dataBase' },
            { title: '用户名', dataIndex: 'userName', width: '15%' },
            { title: '用户权限', dataIndex: 'userAuthorityName', width: '15%' },
            {
                title: '所属模块', dataIndex: 'program', width: '15%', render: (value = '') => {
                    let arr = value.split(';');
                    if (_.isEmpty(arr)) {
                        return '';
                    }
                    return arr.map(item => (<div key={item}>{item}</div>))
                }
            },
            {
                title: '负责人', dataIndex: 'leaderName', width: '15%', render: (value = '') => {
                    let arr = value.split(',');
                    if (_.isEmpty(arr)) {
                        return '';
                    }
                    return arr.map(item => (<div key={item}>{item}</div>))
                }
            },
            {
                title: '操作', dataIndex: 'operation', width: '15%', render: (value, record) => {
                    return (<Fragment>
                        <a onClick={showModuleDetails.bind(this, record)} style={{ color: 'green' }} >详情</a>
                        {isLeader ? null : (
                            <Fragment>
                                <Divider type="vertical" />
                                <a onClick={this.handleUpdateSelfDefining.bind(this, record)}>编辑</a>
                                <Divider type='vertical' />
                                <a
                                    onClick={props.showDeleteConfirm.bind(this, { record, moduleKey: 'userName' })}
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

                <DataBaseUserOperation
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
                        <DataBaseUserEdit
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

export default connect(mapStateToProps)(DataBaseUserModel);