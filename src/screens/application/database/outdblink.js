import React, { Component, Fragment } from 'react';
import { Row, Col, Upload, Button, Divider, Modal, Form, Input, message, Popconfirm } from 'antd';
import StandardTable from '../../../components/standardtable'
import { ContextPath } from '../../../constants/index';
import { getdblinkList, deletedblink } from '../../../actions/application/database/action'
import _ from 'lodash';
import styles from './index.module.less';
import OutDBLinkModal from './outdblinkModal';
import { connect } from 'react-redux';
const FormItem = Form.Item;
const { confirm } = Modal;

// Oracle数据库--dblink
class OutDBLink extends Component {
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
            this.props.form.resetFields();
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
                message.warning('请先选择待删除的访问外部dblink！');
                return;
            }
            confirm({
                title: '删除访问外部dblink',
                content: `确定删除选中的${selectedRows.length}个访问外部dblink?`,
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
            nodeIds: ids,
            configItemType: 'oracleOutType'
        }
        dispatch(deletedblink(params, (res) => {
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
                configItemType: 'oracleOutType',
                // isInnerDblink: 0,
                systemId: record.systemId,
                parentId: record.nodeId,
                propertyValueDtoList: [
                    {
                        propId: "userName",
                        propValue: fieldsValue.queryoutdblinkuser || ''
                    },
                    {
                        propId: "dblinkName",
                        propValue: fieldsValue.queryoutdblinkName || ''
                    }
                ],
            }
            const { pagination: { pageIndex, limit } } = this.state;
            let data = { ...params, limit, pageIndex, start: pageIndex * limit };
            dispatch(getdblinkList(data, (res) => {
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
            labelCol: { xs: { span: 24 }, sm: { span: 11 } },
            wrapperCol: { xs: { span: 24 }, sm: { span: 13 } }
        }
        const uploadProps = {
            data: {
                systemId, parentId: record.nodeId, configItemType: 'oracleOutType'
            },
            name: 'file',
            action: `${ContextPath}/cmdbCommon/import`,
            showUploadList: false,
            onChange: this.handleChange.bind(this),
            beforeUpload: this.beforeUpload.bind(this)
        };
        const columns = [
            { title: '外部分配的用户名', dataIndex: 'userName', width: '20%' },
            { title: 'dblink名称', dataIndex: 'dblinkName', width: '20%' },
            { title: '外部开放的系统', dataIndex: 'dblinkSystem', width: '20%' },
            {
                title: '外部开放表名及权限', dataIndex: 'dbInfo', width: '25%',
                render: (tab, record) => {
                    let tablist = tab ? tab.split(';') : [];
                    return (
                        tablist.map((item, index) => {
                            return (
                                <div key={'mctab' + index}>
                                    {item}
                                </div>
                            )
                        })
                    )
                }
            },
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
                                icon='search'
                                onClick={this.query.bind(this)}>查询</Button>
                            <Divider type="vertical" />
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
                            <Divider type='vertical' style={{ height: '1.5em' }} />
                            <Upload {...uploadProps}>
                                <Button
                                    type='primary'
                                    icon='import'
                                    style={{ backgroundColor: '#f0ad4e', borderColor: '#eea236' }}>导入访问外部dblink</Button>
                            </Upload>
                            <Button
                                type='primary'
                                icon='download'
                                onClick={() => window.open(`${ContextPath}/cmdbCommon/downloadTemp?configItemType=oracleOutType`)}
                                style={{ backgroundColor: '#f0ad4e', borderColor: '#eea236', marginLeft: 8 }}>模板下载</Button>
                        </Col>
                    </Row>
                    <Row className={styles.queryCol}>
                        <Col span={7}>
                            <FormItem {...formLayout} label='外部分配的用户名'>
                                {
                                    getFieldDecorator('queryoutdblinkuser')
                                        (<Input placeholder='请输入外部分配的用户名' autoComplete='off' />)
                                }
                            </FormItem>
                        </Col>
                        <Col span={7}>
                            <FormItem {...formLayout} label='dblink名称'>
                                {
                                    getFieldDecorator('queryoutdblinkName')
                                        (<Input placeholder='请输入dblink名称' autoComplete='off' />)
                                }
                            </FormItem>
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
                {visibleModal ?
                    <OutDBLinkModal
                        visible={visibleModal}
                        outdblinkRecord={currentRecord}
                        parentRecord={record}
                        form={this.props.form}
                        isLook={isLook}
                        onClose={this.onCloseModal.bind(this)} />
                    : null}
            </Form>
        );
    }
}

OutDBLink = Form.create()(OutDBLink)
export default connect()(OutDBLink);
