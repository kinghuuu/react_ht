import React, { Component, Fragment } from 'react';
import { Row, Col, Upload, Button, Divider, Modal, Form, Input, message, Popconfirm } from 'antd';
import StandardTable from '../../../components/standardtable'
import { ContextPath } from '../../../constants/index';
import { getConsumeList, deleteServiceConsume } from '../../../actions/application/service/action'
import _ from 'lodash';
import styles from './index.module.less';
import ConsumeModal from './consumeModal';
import { connect } from 'react-redux';
const FormItem = Form.Item;
const { confirm } = Modal;

// 消费--消费
class ConsumeInfo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pagination: { limit: 10, pageIndex: 0 },
            visibleModal: false,
            currentRecord: {},
            selectedRows: [],
            tableLoading: false,
            serveDataList: {}
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
            visibleModal: true,
            isLook: false,
            currentRecord: {},
        })
    }

    edit = (record, e) => {
        e.stopPropagation();
        e.preventDefault();
        this.setState({
            visibleModal: true,
            isLook: false,
            currentRecord: record
        })
    }

    onCloseModal = (visible, type) => {
        if (type == 'update') {
            this.queryList();
        }
        this.setState({
            visibleModal: visible || false,
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
                message.warning('请先选择待删除的服务消费！');
                return;
            }
            confirm({
                title: '删除服务消费',
                content: `确定删除选中的${selectedRows.length}个服务消费?`,
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
            configItemType: 'serviceConsume',
            nodeIds: ids
        }
        dispatch(deleteServiceConsume(params, (res) => {
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
        let { form: { validateFields }, record, dispatch } = this.props;
        validateFields((err, fieldsValue) => {
            var params = {
                configItemType: 'serviceConsume',
                systemId: record.systemId,
                parentId: record.nodeId,
                propertyValueDtoList: [
                    {
                        propId: 'consumeSystem',
                        propValue: fieldsValue.consumeSystem || ''
                    },
                    {
                        propId: 'consumeProgram',
                        propValue:fieldsValue.consumeProgram || ''
                    }
                ],
            }
            const { pagination: { pageIndex, limit } } = this.state;
            let data = { ...params, limit, pageIndex, start: pageIndex * limit };
            dispatch(getConsumeList(data, (res) => {
                this.setState({
                    serveDataList: res
                })
            }));
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
        const { pagination: { limit, pageIndex }, serveDataList, visibleModal,
            currentRecord, selectedRows, tableLoading } = this.state
        let { isLook, record, form: { getFieldDecorator } } = this.props;
        const { systemId } = record;
        const rowSelection = {
            selectedRowKeys: selectedRows
        };
        const formLayout = {
            labelCol: { xs: { span: 24 }, sm: { span: 8 } },
            wrapperCol: { xs: { span: 24 }, sm: { span: 14 } }
        }

        const uploadProps = {
            data: {
                systemId,
                parentId: record.nodeId,
                configItemType: 'serviceConsume'
            },
            name: 'file',
            action: `${ContextPath}/cmdbCommon/import`,
            showUploadList: false,
            onChange: this.handleChange.bind(this),
            beforeUpload: this.beforeUpload.bind(this)
        };

        const columns = [
            { title: '消费系统', dataIndex: 'consumeSystem', width: '12%' },
            { title: '消费程序', dataIndex: 'consumeProgram', width: '10%' },
            { title: '消费业务功能描述', dataIndex: 'consumeDescription', width: '12%' },
            { title: '消费方式', dataIndex: 'consumeTypeName', width: '10%', },
            { title: '连接方式', dataIndex: 'consumeConnectTypeName', width: '10%' },
            { title: '消费方QPS', dataIndex: 'consumeQPS', width: '10%' },
            { title: '渠道号', dataIndex: 'channelNum', width: '8%' },
            { title: '消费方要求响应时间(MS)', dataIndex: 'consumeTime', width: '13%' },
        ];
        if (!isLook) {
            columns.push({
                title: '操作',
                dataIndex: 'action',
                width: '15%',
                render: (text, record) => (
                    <span>
                        <a onClick={this.edit.bind(this, record)}>编辑</a>
                        <Divider type="vertical" />
                        <Popconfirm title='确定删除吗？'
                            onConfirm={this.delRow.bind(this, record)}
                            onCancel={(e) => { e.stopPropagation(); }}>
                            <a href='#' onClick={(e) => { e.stopPropagation(); }}>删除</a>
                        </Popconfirm>
                    </span>
                )
            });
        }

        return (
            <Form>
                {!isLook && (<Fragment>
                    <Row>
                        <Col span={24} style={{ marginLeft: 8, lineHeight: '38px' }}>
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
                                icon='download'
                                onClick={() => window.open(`${ContextPath}/cmdbCommon/downloadTemp?configItemType=serviceConsume`)}
                                style={{ marginRight: 8 }}>模板下载</Button>
                            <Upload {...uploadProps}>
                                <Button
                                    type='primary'
                                    icon='import'
                                    style={{ backgroundColor: '#f0ad4e', borderColor: '#eea236' }}>导入消费</Button>
                            </Upload>
                            {/* <Button
                                type='primary'
                                icon='export'
                                style={{ backgroundColor: '#f0ad4e', borderColor: '#eea236', marginLeft: 8 }}>导出消费</Button>
                            <Divider type='vertical' style={{ height: '1.5em' }} /> */}
                        </Col>
                    </Row>
                    <Row className={styles.queryCol}>
                        <Col span={5}>
                            <FormItem {...formLayout} label='消费系统'>
                                {
                                    getFieldDecorator('consumeSystem')
                                        (<Input placeholder='请输入消费系统' autoComplete='off' />)
                                }
                            </FormItem>
                        </Col>
                        <Col span={5}>
                            <FormItem {...formLayout} label='消费程序'>
                                {
                                    getFieldDecorator('consumeProgram')
                                        (<Input placeholder='请输入消费程序' autoComplete='off' />)
                                }
                            </FormItem>
                        </Col>
                        <Col span={5} style={{ marginLeft: 8, lineHeight: '38px' }}>
                            <Button
                                type='primary'
                                icon='search'
                                onClick={this.query.bind(this)}>查询</Button>
                        </Col>
                    </Row>
                </Fragment>)}
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
                            rowSelection={isLook ? false : rowSelection}
                            onSelectRow={this.handleStandardTableRowChange.bind(this)}
                            onChange={this.changePage.bind(this)} />
                    </Col>
                </Row>
                {visibleModal &&
                    <ConsumeModal
                        visible={visibleModal}
                        currentRecord={currentRecord}
                        parentRecord={record}
                        form={this.props.form}
                        isLook={isLook}
                        onClose={this.onCloseModal.bind(this)} />}
            </Form>
        );
    }
}

ConsumeInfo = Form.create()(ConsumeInfo)
export default connect()(ConsumeInfo);
