import React, { Component } from 'react';
import { Row, Col, Upload, Button, Divider, Modal, Form, Input, message, Popconfirm } from 'antd';
import { connect } from 'react-redux';
import { ContextPath } from '../../../constants';
import StandardTable from '../../../components/standardtable'
import { PlainSelector } from '../../../components/selector/selector';
import DrawerContent from './drawer-content';
import styles from './index.module.less';
import { getServeList, deleteRecord, onOffLine } from '../../../actions/application/service/action'

const { confirm } = Modal;
const FormItem = Form.Item;

class Service extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLook: false,
            pagination: { limit: 10, pageIndex: 0 },
            lookDetailVisible: false,
            currentRecord: {},
            selectedRows: [],
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

    onCloseModal = (visible, saveType) => {
        this.setState({
            lookDetailVisible: visible || false,
        });
        if (saveType == 'save') {
            this.queryList();
        }
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

    onLine = (record, e) => {
        let { selectedRows } = this.state;
        if (record.nodeId) {
            e.stopPropagation();
            e.preventDefault();
            this.handleOnOffLine([record], '01')
        } else {
            if (_.isEmpty(selectedRows)) {
                message.warning('请先选择待上线的服务！');
                return;
            }
            confirm({
                title: '上线服务',
                content: `确定上线选中的${selectedRows.length}个服务?`,
                onOk: () => {
                    this.handleOnOffLine(selectedRows, '01')
                },
                onCancel() { },
            })
        }
    }

    offLine = (record, e) => {
        let { selectedRows } = this.state;
        if (record.nodeId) {
            e.stopPropagation();
            e.preventDefault();
            this.handleOnOffLine([record], '02')
        } else {
            if (_.isEmpty(selectedRows)) {
                message.warning('请先选择待下线的服务！');
                return;
            }
            confirm({
                title: '下线服务',
                content: `确定下线选中的${selectedRows.length}个服务?`,
                onOk: () => {
                    this.handleOnOffLine(selectedRows, '02')
                },
                onCancel() { },
            })
        }
    }

    handleOnOffLine = (rows, status) => {
        const { dispatch, parentId, systemId } = this.props
        let serverForUpAndDownList = [];
        rows.forEach(item => {
            serverForUpAndDownList.push({
                'nodeId': item.nodeId,
                'propValue': status
            });
        });
        let params = {
            parentId,
            systemId,
            'serverForUpAndDownList': serverForUpAndDownList,
        };
        dispatch(onOffLine(params, (res) => {
            this.queryList();
            this.setState({
                selectedRows: []
            });
        }));
    }

    delRow = (record, e) => {
        let { selectedRows } = this.state;
        if (record.nodeId) {
            e.stopPropagation();
            e.preventDefault();
            this.handleDelete([record.nodeId]);
        } else {
            if (_.isEmpty(selectedRows)) {
                message.warning('请先选择待删除的服务！');
                return;
            }
            confirm({
                title: '删除服务',
                content: `确定删除选中的${selectedRows.length}个服务?`,
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
            configItemType: 'service',
            nodeIds: ids
        }
        dispatch(deleteRecord(params, (res) => {
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
        let { form: { validateFields }, systemId, parentId, dispatch } = this.props;
        validateFields((err, fieldsValue) => {
            var params = {
                configItemType: 'service',
                systemId: systemId,
                parentId: parentId,
                propertyValueDtoList: [
                    {
                        propId: 'serverName',
                        propValue: fieldsValue.serverName || ''
                    },
                    {
                        propId: 'interfaceName',
                        propValue: fieldsValue.interfaceName || ''
                    },
                    {
                        propId: 'serverType',
                        propValue: fieldsValue.serverType ? _.join(fieldsValue.serverType.value, ',') : ''
                    },
                    {
                        propId: 'status',
                        propValue: fieldsValue.status ? _.join(fieldsValue.status.value, ',') : ''
                    }
                ],
            }

            const { pagination: { pageIndex, limit } } = this.state;
            let data = { ...params, limit, pageIndex, start: pageIndex * limit };
            dispatch(getServeList(data));
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

    // 上传前钩子函数 false||Promise.reject阻止上传
    beforeUpload = (file) => {
        if (_.divide(file.size, 1024 * 1024) >= 20) {
            message.error(`${file.name}上传失败，文件大小不能超过20M！`);
            return false;
        }
        return true;
    }

    handleChange = (info) => {
        let fileList = info.fileList;
        // 控制大小在20M以内
        fileList = _.filter(fileList, function (file) {
            return file.size === undefined || _.divide(file.size, 1024 * 1024) <= 20;
        });
        if (info.file.status === 'done') {
            if (info.file.response && !info.file.response.hasError && info.file.uid) {
                message.success(`${info.file.name} 上传成功！`);
                this.queryList();
            } else {
                let failReason = info.file.response ? info.file.response.error : '上传接口出错！';
                message.error(`${info.file.name} 上传失败！原因：${failReason}`);
                return;
            }
        } else if (info.file.status === 'error') {
            message.error(`${info.file.name} 上传失败！`);
        }
    }

    handleStandardTableRowChange = (rows) => {
        this.setState({
            selectedRows: rows
        });
    }

    render() {
        const { pagination: { limit, pageIndex }, lookDetailVisible, isLook,
            currentRecord, selectedRows } = this.state
        const { dispatch, systemId, parentId, serveDataList, tableLoading } = this.props
        const { getFieldDecorator } = this.props.form;
        let recordInfo = { ...currentRecord, systemId, parentId };
        const rowSelection = {
            selectedRowKeys: selectedRows
        };
        const formLayout = {
            labelCol: { xs: { span: 24 }, sm: { span: 8 } },
            wrapperCol: { xs: { span: 24 }, sm: { span: 16 } }
        }
        const uploadProps = {
            data: {
                systemId, parentId, configItemType: 'service'
            },
            name: 'file',
            action: `${ContextPath}/cmdbCommon/import`,
            showUploadList: false,
            onChange: this.handleChange.bind(this),
            beforeUpload: this.beforeUpload.bind(this)
        };

        const columns = [
            { title: '服务名', dataIndex: 'serverName', width: '15%' },
            { title: '接口名', dataIndex: 'interfaceName', width: '13%' },
            { title: '服务类型', dataIndex: 'serverTypeName', width: '10%' },
            { title: '描述信息', dataIndex: 'description', width: '15%', },
            { title: '备注信息', dataIndex: 'remark', width: '15%' },
            { title: '启用状态', dataIndex: 'statusName', width: '10%' },
            {
                title: '操作',
                dataIndex: 'action',
                // align: 'center',
                width: '20%',
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
                        <Divider type="vertical" />
                        <Popconfirm
                            title={record.statusName == '上线' ? `确定下线吗？` : `确定上线吗？`}
                            onConfirm={record.statusName == '上线' ? this.offLine.bind(this, record) : this.onLine.bind(this, record)}
                            onCancel={(e) => { e.stopPropagation(); }}>
                            <a href='#' onClick={(e) => { e.stopPropagation(); }}>
                                {record.statusName == '上线' ? '下线' : '上线'}
                            </a>
                        </Popconfirm>
                    </span>
                ),
            },
        ]

        return (
            <Form>
                <Row>
                    <Col span={24} style={{ marginLeft: 8, lineHeight: '38px' }}>
                        <Button
                            type='primary'
                            icon='search'
                            onClick={this.query.bind(this)}>查询</Button>
                        <Divider type='vertical' style={{ height: '1.5em' }} />
                        <Button
                            type='primary'
                            icon='plus-circle'
                            style={{ background: '#87d068', borderColor: '#87d068' }}
                            onClick={this.add.bind(this, 'add')}>添加</Button>
                        <Button
                            type='danger'
                            icon='close-circle'
                            style={{ marginLeft: 8 }}
                            onClick={this.delRow.bind(this, {})}>删除</Button>
                        <Divider type='vertical' style={{ height: '1.5em' }} />
                        <Button
                            type='primary'
                            icon=''
                            style={{ backgroundColor: '#f0ad4e', borderColor: '#eea236' }}
                            onClick={this.onLine.bind(this, {})}>上线</Button>
                        <Button
                            type='primary'
                            icon=''
                            style={{ backgroundColor: '#f0ad4e', borderColor: '#eea236', marginLeft: 8 }}
                            onClick={this.offLine.bind(this, {})}>下线</Button>
                        <Divider type='vertical' style={{ height: '1.5em' }} />
                        <Upload {...uploadProps}>
                            <Button
                                type='primary'
                                icon='import'
                                style={{ backgroundColor: '#f0ad4e', borderColor: '#eea236' }}>导入服务</Button>
                        </Upload>
                        {/* <Button
                            type='primary'
                            icon='export'
                            style={{ backgroundColor: '#f0ad4e', borderColor: '#eea236', marginLeft: 8 }}>导出服务</Button>
                          <Divider type='vertical' style={{ height: '1.5em' }} /> */}
                        <Button
                            type='primary'
                            icon='download'
                            onClick={() => window.open(`${ContextPath}/cmdbCommon/downloadTemp?configItemType=service`)}
                            style={{ backgroundColor: '#f0ad4e', borderColor: '#eea236', marginLeft: 8 }}>模板下载</Button>
                    </Col>
                </Row>
                <Row className={styles.queryCol}>
                    <Col span={5}>
                        <FormItem {...formLayout} label='服务名称'>
                            {
                                getFieldDecorator('serverName')
                                    (<Input placeholder='请输入服务名称' autoComplete='off' />)
                            }
                        </FormItem>
                    </Col>
                    <Col span={5}>
                        <FormItem {...formLayout} label='服务类型'>
                            {
                                getFieldDecorator('serverType', {
                                    initialValue: {
                                        data: [],
                                        value: []
                                    }
                                })
                                    (<PlainSelector
                                        method='get'
                                        params={{ cmdbServerType: 'serverType' }}
                                        placeholder='请选择服务类型'
                                        dataUrl={`${ContextPath}/cmdbForService/getServiceType`} />)
                            }
                        </FormItem>
                    </Col>
                    <Col span={5}>
                        <FormItem {...formLayout} label='接口名称'>
                            {
                                getFieldDecorator('interfaceName')
                                    (<Input placeholder='请输入接口名称' autoComplete='off' />)
                            }
                        </FormItem>
                    </Col>
                    <Col span={5}>
                        <FormItem {...formLayout} label='启用状态'>
                            {
                                getFieldDecorator('status')
                                    (<PlainSelector
                                        method='get'
                                        params={{ cmdbServerType: 'serverStatus' }}
                                        placeholder='请选择启用状态'
                                        dataUrl={`${ContextPath}/cmdbForService/getServiceType`} />)
                            }
                        </FormItem>
                    </Col>
                </Row>
                <Row style={{ marginTop: 10 }}>
                    <Col span={24}>
                        <StandardTable
                            rowKey='nodeId'
                            loading={tableLoading}
                            columns={columns}
                            data={{
                                list: serveDataList.rows,
                                pagination: {
                                    current: pageIndex + 1,
                                    pageSize: limit,
                                    total: serveDataList.results
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
                        currentRecord={recordInfo}
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
        serveDataList: state.cmdbServeList,
        tableLoading: state.cmdbServeList.tableLoading
    }
}

Service = Form.create()(Service)

export default connect(mapStateToProps)(Service);