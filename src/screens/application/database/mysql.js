import React, { Component } from 'react';
import { Row, Col, Button, Divider, Modal, Form, Input, message, Popconfirm } from 'antd';
import StandardTable from '../../../components/standardtable'
import { getMysqlList, deleteMysql } from '../../../actions/application/database/action'
import _ from 'lodash';
import styles from './index.module.less';
import DrawerContent from './drawer-content';
import { connect } from 'react-redux';
const FormItem = Form.Item;
const { confirm } = Modal;

// Oracle 或 mysql数据库 列表
class Mysql extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pagination: { limit: 10, pageIndex: 0 },
            lookDetailVisible: false,
            currentRecord: {},
            selectedRows: [],
            tableLoading: false,
            isLook: false
        };
    }

    query = () => {
        let page = { pageIndex: 0, limit: 10 };
        this.setState(() => ({ pagination: page }), () => {
            this.queryList();
        });
    }

    add = (record) => {
        this.setState({
            lookDetailVisible: true,
            isLook: false,
            currentRecord: {},
        })
    }

    edit = (record, e) => {
        e.stopPropagation();
        e.preventDefault();
        this.setState({
            lookDetailVisible: true,
            isLook: false,
            currentRecord: record
        })
    }

    onCloseModal = (visible, type) => {
        if (type == 'update') {
            this.queryList();
        }
        this.setState({
            lookDetailVisible: visible || false,
        });
    }

    delRow = (record, e) => {
        let { selectedRows } = this.state;
        if (record.nodeId) {
            e.stopPropagation();
            e.preventDefault();
            this.handleDelete([record.nodeId]);
        } else {
            if (_.isEmpty(selectedRows)) {
                message.warning('请先选择待删除的Mysql数据库！');
                return;
            }
            confirm({
                title: '删除Mysql数据库',
                content: `确定删除选中的${selectedRows.length}个Mysql数据库?`,
                onOk: () => {
                    this.handleDelete(selectedRows.map((v) => v.nodeId))
                },
                onCancel() { },
            })
        }
    }

    handleDelete = (ids) => {
        const { dispatch } = this.props
        let params = {
            configItemType: 'mysqlType',
            nodeIds: ids
        }
        dispatch(deleteMysql(params, (res) => {
            message.success('删除成功！');
            let page = { pageIndex: 0, limit: 10 };
            this.setState(() => ({ pagination: page }), () => {
                this.queryList();
            });
            this.setState({
                selectedRows: []
            });
        }));
    }

    handleCancel = () => {
        this.setState({
            visible: false
        })
    }

    queryList() {
        let { form: { validateFields }, databaseInfo, dispatch } = this.props;
        validateFields((err, fieldsValue) => {
            var params = {
                configItemType: 'mysqlType',
                systemId: databaseInfo.systemId,
                parentId: databaseInfo.parentId,
                propertyValueDtoList: [
                    {
                        propId: 'mysqlIp',
                        propValue: fieldsValue.dateBaseIp || ''
                    },
                    {
                        propId: 'mysqlExample',
                        propValue:fieldsValue.dateBaseExample || ''
                    }
                ],
            }
            const { pagination: { pageIndex, limit } } = this.state;
            let data = { ...params, limit, pageIndex, start: pageIndex * limit };
            dispatch(getMysqlList(data));
        });
    }

    componentDidMount() {
        this.queryList();
    }

    changePage = (pagination) => {
        let page = { pageIndex: pagination.current - 1, limit: pagination.pageSize };
        this.setState(() => ({ pagination: page }), () => {
            this.queryList();
        });
    }

    handleStandardTableRowChange = (rows) => {
        this.setState({
            selectedRows: rows
        });
    }

    handleLook = (record, e) => {
        e.stopPropagation();
        e.preventDefault();
        this.setState({
            lookDetailVisible: true,
            currentRecord: record,
            isLook: true,
        });
    }

    render() {
        const { pagination: { limit, pageIndex }, lookDetailVisible, isLook,
            currentRecord, selectedRows, tableLoading } = this.state
        let { databaseInfo, mysqlList, form: { getFieldDecorator }, dispatch } = this.props;
        const rowSelection = {
            selectedRowKeys: selectedRows
        };
        const formLayout = {
            labelCol: { xs: { span: 24 }, sm: { span: 8 } },
            wrapperCol: { xs: { span: 24 }, sm: { span: 14 } }
        }

        const columns = [
            { title: 'IP地址', dataIndex: 'mysqlIp', width: '12%' },
            { title: '端口', dataIndex: 'mysqlPort', width: '10%' },
            { title: '实例', dataIndex: 'mysqlExample', width: '12%' },
            { title: '用户名', dataIndex: 'mysqlUserName', width: '10%' },
            { title: '灾备库信息', dataIndex: 'mysqlDisasterInfo', width: '12%' },
            { title: '最小连接数', dataIndex: 'mysqlConnectMinNum', width: '12%' },
            { title: '最大连接数', dataIndex: 'mysqlConnectMaxNum', width: '12%' },
            {
                title: '操作',
                dataIndex: 'action',
                width: '15%',
                render: (text, record) => (
                    <span>
                        <a onClick={this.handleLook.bind(this, record)}>查看</a>
                        <Divider type="vertical" />
                        <a onClick={this.edit.bind(this, record)}>编辑</a>
                        <Divider type="vertical" />
                        <Popconfirm title='确定删除吗？'
                            onConfirm={this.delRow.bind(this, record)}
                            onCancel={(e) => { e.stopPropagation(); }}>
                            <a href='#' onClick={(e) => { e.stopPropagation(); }}>删除</a>
                        </Popconfirm>
                    </span>
                )
            }
        ];

        return (
            <Form>
                <Row className={styles.queryCol}>
                    <Col span={5}>
                        <FormItem {...formLayout} label='IP地址'>
                            {
                                getFieldDecorator('dateBaseIp')
                                    (<Input placeholder='请输入IP地址' autoComplete='off' />)
                            }
                        </FormItem>
                    </Col>
                    <Col span={5}>
                        <FormItem {...formLayout} label='实例'>
                            {
                                getFieldDecorator('dateBaseExample')
                                    (<Input placeholder='请输入实例' autoComplete='off' />)
                            }
                        </FormItem>
                    </Col>
                    <Col span={12} style={{ marginLeft: 8 }}>
                        <Button
                            type='primary'
                            icon='search'
                            onClick={this.query.bind(this)}>查询</Button>
                        <Divider type='vertical' style={{ height: '1.5em' }} />
                        <Button
                            type='primary'
                            icon='plus-circle'
                            style={{ background: '#87d068', borderColor: '#87d068' }}
                            onClick={this.add.bind(this, 'add')}>新增</Button>
                        <Button
                            type='danger'
                            icon='close-circle'
                            style={{ marginLeft: 8 }}
                            onClick={this.delRow.bind(this, {})}>删除</Button>
                    </Col>
                </Row>

                <Row style={{ marginTop: 10 }}>
                    <Col span={24}>
                        <StandardTable
                            rowKey='nodeId'
                            loading={tableLoading}
                            columns={columns}
                            data={{
                                list: mysqlList.rows,
                                pagination: {
                                    current: pageIndex + 1,
                                    pageSize: limit,
                                    total: mysqlList.results
                                }
                            }}
                            rowSelection={rowSelection}
                            onSelectRow={this.handleStandardTableRowChange.bind(this)}
                            onChange={this.changePage.bind(this)} />
                    </Col>
                </Row>
                {lookDetailVisible &&
                    <DrawerContent
                        visible={lookDetailVisible}
                        currentRecord={currentRecord}
                        databaseInfo={databaseInfo}
                        dispatch={dispatch}
                        form={this.props.form}
                        isLook={isLook}
                        onClose={this.onCloseModal.bind(this)} />}
            </Form>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        tableLoading: state.mysqlList.tableLoading,
        mysqlList: state.mysqlList,
    }
}

Mysql = Form.create()(Mysql)

export default connect(mapStateToProps)(Mysql);
