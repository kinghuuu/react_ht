import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Row, Col, Breadcrumb, Button, Icon, Input, message, Divider, Modal } from 'antd';
import {
    getBusinessList,
    deleteBusiness,
} from '../../actions/business/action';
import Standardtable from '../../components/standardtable';
import ApplicationTitle from '../common/applicationTitle';
import EditBusiness from './edit';
import styles from './index.module.less';
const { confirm } = Modal;

class Business extends Component {
    constructor(props) {
        super(props);
        this.state = {
            editVisable: false,
            isCreate: true,
            parentData: {},
            editData: {},

            expandedRowKeys: [],
            selectRows: [],
            systemId: ''
        };

        this.columns = [
            { title: '业务', dataIndex: 'businessName' },
            { title: '业务描述', dataIndex: 'description', width: '20%' },
            {
                title: '操作', dataIndex: 'operation', width: '20%', render: (value, record) => {
                    return (<Fragment>
                        <a onClick={this.handleCreate.bind(this, record)} style={{ color: 'green' }}>新增子业务</a>
                        <Divider type="vertical" />
                        <a onClick={this.handleUpdate.bind(this, record)}>编辑</a>
                        <Divider type="vertical" />
                        <a onClick={this.showDeleteConfirm.bind(this, record)} style={{ color: 'red' }} >删除</a>
                    </Fragment>);
                }
            },
        ]
    }

    getBusinessList = (_params) => {
        const { dispatch } = this.props;
        const { pageIndex, limit, parentId = '-1', editId } = _params;
        let params = {
            pageIndex, limit, start: pageIndex * limit, parentId, editId,
        };
        dispatch(getBusinessList(params));
    }
    // 新增业务
    handleCreate = (record, evt) => {
        evt.stopPropagation();
        const { selectRows } = this.state;
        let parentData = selectRows[0] || { businessName: '', id: '-1' };
        if (record) {
            parentData = record;
        }
        this.setState(() => ({ editVisable: true, parentData, isCreate: true, editData: {} }));
    }
    // 关闭弹框
    hideEditModal = (isRefresh = false, isCreate = false) => {
        this.setState(() => ({
            editVisable: false
        }));
        if (isRefresh) {
            if (isCreate) {
                // 新建的时候，要讲页面刷新到第一页去
                const { parentData } = this.state;
                const { pagination } = this.props;
                this.getBusinessList({ limit: pagination.limit, pageIndex: 0, parentId: parentData.id });
            } else {
                const { editData } = this.state;
                const { pagination } = this.props;
                this.getBusinessList({ limit: pagination.limit, pageIndex: 0, parentId: editData.parentId, editId: editData.id });
            }
        }
    }

    // 编辑业务
    handleUpdate = (editData) => {
        this.setState(() => ({ editVisable: true, parentData: {}, isCreate: false, editData }));
    }

    // 删除提醒
    showDeleteConfirm = (singleDeleteData, evt) => {
        evt.stopPropagation();
        const { selectRows } = this.state;
        let descriptions = '';
        if (singleDeleteData) {
            descriptions = `你确认删除 ${singleDeleteData.businessName} 这个业务？`;
        } else {
            if (_.isEmpty(selectRows)) {
                message.warning('请选怎要删除的属性!')
                return
            }
            let [first, second] = selectRows.map(item => item.businessName);
            if (second) {
                descriptions = `你确认删除 ${first}、${second}... 这些业务？`;
            } else {
                descriptions = `你确认删除 ${first} 这个业务？`;
            }
        }
        confirm({
            title: '删除提醒',
            content: descriptions,
            okText: '确认',
            okType: 'primary',
            cancelText: '取消',
            onOk: () => {
                this.handleDelete(singleDeleteData);
            },
        });

    }
    // 删除属性（含批量删除）
    handleDelete = (singleDeleteData, evt) => {
        const { dispatch, pagination } = this.props;
        const { selectRows } = this.state;
        const { id, parentId = '-1' } = singleDeleteData;

        let ids = [];
        if (singleDeleteData) {
            ids = [id];
        } else {
            ids = _.map(selectRows, item => item.id);
        }
        dispatch(deleteBusiness({ ids }, (result) => {
            message.success('业务删除成功');
            this.getBusinessList({ limit: pagination.limit, pageIndex: 0, parentId });
        }, error => {
            message.error(error);
        }));
    }

    // 翻页
    handlePaginationChange = (pagination) => {
        if (!_.isEmpty(pagination)) {
            const { current, pageSize } = pagination;
            this.getBusinessList({ limit: pageSize, pageIndex: current - 1, parentId: '-1' });
            this.setState(() => ({ selectRows: [], expandedRowKeys: [] }));
        }
    }

    // 表格多选
    handleRowChange = (selectRows) => {
        this.setState(() => ({ selectRows }));
    }

    handleExpand = (expanded, record) => {
        if (expanded) {
            const { pagination } = this.props;
            const { id: parentId } = record;
            let params = { ...pagination, parentId };
            this.getBusinessList(params);
        }
    }

    componentDidMount() {
        const { pagination = {} } = this.props;
        const { limit = 50, pageIndex = 0 } = pagination;
        this.getBusinessList({ limit, pageIndex, parentId: '-1' });
    }

    render() {

        const {
            rows, results, buttonLoading, tableLoading, pagination
        } = this.props;

        const {
            editVisable, isCreate, parentData, editData,
            selectRows, expandedRowKeys,
        } = this.state;

        let selectedRowKeys = _.map(selectRows, item => item.id);

        return (
            <div className={styles.block_body}>

                <ApplicationTitle
                    firstBreadcrumb='配置中心'
                    secondBreadcrumb='业务模型'
                    appSelectVisable={false}
                />

                <Row>
                    <Col className={styles.searchInput} >
                        <Button onClick={this.handleCreate.bind(this, null)} type='primary' style={{ marginRight: '16px' }} >新增根业务</Button>
                    </Col>
                </Row>

                <Standardtable
                    style={{ borderTop: '#eee solid 1px' }}
                    rowKey='id'
                    loading={tableLoading}
                    columns={this.columns}
                    size='middle'
                    expandedRowKeys={expandedRowKeys}
                    onExpand={this.handleExpand}
                    onExpandedRowsChange={(expandedRows) => {
                        this.setState(() => ({ expandedRowKeys: expandedRows }))
                    }}
                    data={{
                        list: rows,
                        pagination: {
                            current: pagination.pageIndex + 1,
                            pageSize: pagination.limit,
                            total: results
                        }
                    }}
                    // rowSelection={{ selectedRowKeys, type: 'radio' }}
                    // onSelectRow={this.handleRowChange.bind(this)}
                    onChange={this.handlePaginationChange.bind(this)}
                />

                {
                    editVisable ?
                        (
                            <EditBusiness
                                isCreate={isCreate}
                                parentData={parentData}
                                editData={editData}
                                hideModal={this.hideEditModal}
                            />
                        ) : null

                }

            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const { rows, results, buttonLoading, tableLoading, pagination } = state.business;
    return {
        rows,
        results,
        buttonLoading,
        tableLoading,
        pagination
    }
}

export default connect(mapStateToProps)(Business);