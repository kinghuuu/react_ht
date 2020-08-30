import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Row, Col, Breadcrumb, Button, Icon, Input, message, Divider, Modal } from 'antd';
import {
    getSelfDefiningList,
    deleteSelfDefining,
} from '../../actions/selfDefining/action';
import Standardtable from '../../components/standardtable';
import EditSelfDefining from './edit';
import styles from './index.module.less';
const { confirm } = Modal;

class AttributeList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            editVisable: false,
            editData: {},
            query: '',
            queryValue: '',
            selectRows: [],
            systemId: ''
        };

        this.columns = [
            { title: '编号', dataIndex: 'serialNumber', width: '10%' },
            { title: '属性名称', dataIndex: 'propName' },
            { title: '属性类型', dataIndex: 'propType', width: '10%' },
            {
                title: '是否必填', dataIndex: 'isRequired', width: '10%', render: (value) => {
                    return value === '1' ? '是' : '否';
                }
            },
            { title: '显示顺序', dataIndex: 'draworder', width: '10%' },
            { title: '默认值', dataIndex: 'defaultValue', width: '10%' },
            {
                title: '操作', dataIndex: 'operation', width: '20%', render: (value, record) => {
                    return (<Fragment>
                        <a onClick={this.handleUpdateSelfDefining.bind(this, record)}>编辑</a>
                        <Divider type="vertical" />
                        <a onClick={this.showDeleteConfirm.bind(this, record)} style={{ color: 'red' }} >删除</a>
                    </Fragment>);
                }
            },
        ]
    }

    getAttributeList = (pagination) => {
        const { dispatch, sdPagination, nodeType, systemId } = this.props;
        const { query } = this.state;
        const { pageIndex, limit } = sdPagination;
        let params = {
            query, systemId, nodeType, pageIndex, limit, start: pageIndex * limit,
        };
        if (pagination) {
            const { pageIndex, limit } = pagination;
            params = {
                ...params, pageIndex, limit, start: pageIndex * limit,
            };
        }
        dispatch(getSelfDefiningList(params));
    }


    componentDidMount() {
        this.getAttributeList({ limit: 50, pageIndex: 0 });
    }

    componentDidUpdate() {
        const { systemId: _props, sdPagination: { limit } } = this.props;
        const { systemId: _state } = this.state;
        if (_props && _props !== _state) {
            this.setState(() => ({ systemId: _props }), () => {
                this.getAttributeList({ limit, pageIndex: 0 })
            });
        }
    }



    hideEditModal = (isRefresh = false, isCreate = false) => {
        this.setState(() => ({
            editVisable: false
        }));
        if (isRefresh) {
            if (isCreate) {
                // 新建的时候，要讲页面刷新到第一页去
                const { sdPagination } = this.props;
                this.getAttributeList({ limit: sdPagination.limit, pageIndex: 0 });
            } else {
                this.getAttributeList();
            }
        }
    }

    // 翻页
    handlePaginationChange = (pagination) => {
        if (!_.isEmpty(pagination)) {
            const { current, pageSize, total } = pagination;
            this.getAttributeList({ limit: pageSize, pageIndex: current - 1 });
            this.setState(() => ({ selectRows: [] }));
        }
    }

    // 查询属性
    handleSearchSelfDefining = () => {
        const { queryValue } = this.state;
        const { sdPagination } = this.props;
        this.setState(() => ({ query: queryValue }), () => {
            this.getAttributeList({ limit: sdPagination.limit, pageIndex: 0 });
        })
    }

    // 表格多选
    handleRowChange = (selectRows) => {
        this.setState(() => ({ selectRows }));
    }

    // 新增属性
    handleCreateSelfDefining = () => {
        this.setState(() => ({
            editVisable: true,
            editData: {},
        }));
    }


    // 删除提醒
    showDeleteConfirm = (singleDeleteData, evt) => {
        evt.stopPropagation();
        const { selectRows } = this.state;
        let descriptions = '';
        if (singleDeleteData) {
            descriptions = `你确认删除 ${singleDeleteData.propName} 这个属性？`;
        } else {
            if (_.isEmpty(selectRows)) {
                message.warning('请选怎要删除的属性!')
                return
            }
            let [first, second] = selectRows.map(item => item.propName);
            if (second) {
                descriptions = `你确认删除 ${first}、${second}... 这些属性？`;
            } else {
                descriptions = `你确认删除 ${first} 这个属性？`;
            }
        }
        confirm({
            title: '删除提醒',
            content: descriptions,
            okText: '确认',
            okType: 'primary',
            cancelText: '取消',
            onOk: () => {
                this.handleDeleteDefining(singleDeleteData);
            },
        });

    }
    // 删除属性（含批量删除）
    handleDeleteDefining = (singleDeleteData, evt) => {
        const { dispatch, sdPagination } = this.props;
        const { selectRows } = this.state;

        let ids = [];
        if (singleDeleteData) {
            ids = [singleDeleteData.id];
        } else {
            ids = _.map(selectRows, item => item.id);
        }
        dispatch(deleteSelfDefining({ ids }, (result) => {
            message.success('属性删除成功');
            this.getAttributeList({ limit: sdPagination.limit, pageIndex: 0 });
        }, error => {
            message.error(error);
        }));
    }

    // 编辑属性
    handleUpdateSelfDefining = (editData) => {
        this.setState(() => ({
            editVisable: true,
            editData,
        }));
    }

    render() {

        const {
            nodeType,
            sdList, sdResults, sdButtonLoading, sdTableLoading, sdPagination
        } = this.props;

        const {
            systemId,
            thirdBreadcrumb,
            queryValue,
            editData, editVisable,
        } = this.state;
        let scrollY = window.document.body.offsetHeight - 242;

        return (
            <div className={styles.block_body}>

                <Row>
                    <Col span={6} className={styles.searchInput} >
                        <span>属性名称：</span>
                        <Input
                            value={queryValue}
                            onChange={e => {
                                let queryValue = e.target.value;
                                this.setState(() => ({ queryValue }));
                            }}
                            placeholder='请输入属性名称'
                        />
                    </Col>
                    <Col span={15} offset={1}>
                        <Button loading={sdButtonLoading} onClick={this.handleSearchSelfDefining} type='primary' style={{ marginRight: '16px' }} >查询</Button>
                        <Button onClick={this.handleCreateSelfDefining} type='primary' className='button-success' style={{ marginRight: '16px' }}>新增</Button>
                        <Button onClick={this.showDeleteConfirm.bind(this, false)} style={{ marginRight: '16px' }} type='danger' >批量删除</Button>
                    </Col>
                </Row>

                <Standardtable
                    style={{ borderTop: '#eee solid 1px' }}
                    rowKey='id'
                    loading={sdTableLoading}
                    columns={this.columns}
                    size='middle'
                    scroll={{ y: scrollY > 460 ? false : scrollY }}
                    data={{
                        list: sdList,
                        pagination: {
                            current: sdPagination.pageIndex + 1,
                            pageSize: sdPagination.limit,
                            total: sdResults
                        }
                    }}
                    rowSelection={{ selectedRowKeys: [], type: 'checkbox' }}
                    onSelectRow={this.handleRowChange.bind(this)}
                    onChange={this.handlePaginationChange.bind(this)}
                />

                {
                    editVisable ?
                        (
                            <EditSelfDefining
                                editData={editData}
                                systemId={systemId}
                                nodeType={nodeType}
                                hideModal={this.hideEditModal}
                            />
                        ) : null

                }

            </div>
        );
    }
}

const mapStateToProps = (state, ownProps) => {
    const { rows, results, buttonLoading, tableLoading, pagination } = state.selfDefining;
    return {
        sdList: rows,
        sdResults: results,
        sdButtonLoading: buttonLoading,
        sdTableLoading: tableLoading,
        sdPagination: pagination
    }
}

export default connect(mapStateToProps)(AttributeList);