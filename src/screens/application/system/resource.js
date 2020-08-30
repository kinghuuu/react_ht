import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ContextPath } from '../../../constants';
import { updateResourcePagination, getResourceList, deleteResource, bindResource, detailProgramAction, updateAttributeAction, updateGroupAction, editResourceGroupAction } from '../../../actions/application/action';
import StandardTable from '../../../components/standardtable';
import { Row, Col, Button, Input, Divider, Popconfirm, message, Modal, Upload, Form } from 'antd';
import TransferDialog from './transferDialog';

class resourceInfo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showRefModal: false,
            changeResourceList: [],
            resourceList: [],
            pageSize: 10,
            seqIdList: [],
            showDeleteModal: false,
            rightData: {},
            rowSelection: {},
            identifiedAttrColumns: [],
            // showEditResourceModal: false,
            showEditResourceGroupModal: false,
            resourceGroupData: [],
            isEdit: false,
            editResourceItem: {},
            groupColumns: []
        };
    }

    componentDidMount() {
        let { dispatch, systemid } = this.props;
        let scb = (data) => {
            if (data && data.length > 0) {
                let identifiedAttrColumns = _.map(data, (item) => {
                    return {
                        title: item.propName,
                        dataIndex: item.propId,
                        sortable: false,
                        selected: false
                    }
                });
                this.setState({ identifiedAttrColumns });
            }
        };
        let groupScb = (data) => {
            if (data && data.length > 0) {
                let groupColumns = _.map(data, (item) => {
                    return {
                        title: item.propName,
                        dataIndex: item.propId,
                        sortable: false,
                        selected: false
                    }
                });
                // _.forEach(data, (item, idx) => {
                //     item.key = idx;
                // });
                this.setState({
                    groupColumns,
                    resourceGroupData: data
                });
            }
        };
        dispatch(updateAttributeAction(systemid, scb));
        // dispatch(detailProgramAction(systemid, id, scb));
        dispatch(updateGroupAction(systemid, groupScb));
        this.requestResourceList();
    }

    editResourceGroupScb = (res) => {
        if (res.length === 0) {
            message.warining('请先新建分组！');
        } else {
            // 设置新增分组的弹框内容
            _.forEach(res, (item, idx) => {
                item.key = idx;
            });
            this.setState({
                showEditResourceGroupModal: true,
                resourceGroupData: res
            });
        }
    };

    // 资源分组
    editResourceGroup = () => {
        const { dispatch, systemid } = this.props;
        let { changeResourceList, resourceGroupData } = this.state;
        if (changeResourceList.length === 0) {
            message.warning('请先选择要分组的资源！');
            return;
        }
        if (resourceGroupData.length === 0) {
            message.warning('请先新建分组！');
            return;
        }
        this.setState({
            showEditResourceGroupModal: true,
            isEdit: false
        });
        // dispatch(updateGroupAction(systemid, this.editResourceGroupScb));
    };

    hideEditResourceGroupModal = () => {
        this.setState({ showEditResourceGroupModal: false }, () => {
            document.body.style.overflow = 'auto'
        });
    };

    handleSubmitResourceGroupEdit = e => {
        e.preventDefault();
        e.stopPropagation();
        const { dispatch, systemid, id, form: { getFieldValue } } = this.props;
        let { changeResourceList, resourceGroupData, editResourceItem } = this.state;
        let resourceIdList = [];
        let customCategories = [];
        let data = {};
        let param = {};
        let querySeq = getFieldValue('querySeq');
        let queryIp = getFieldValue('queryIp');
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.setState({ showEditResourceGroupModal: false }, () => {
                    document.body.style.overflow = 'auto'
                });
                resourceIdList = changeResourceList.length > 0 ? _.map(changeResourceList, (item) => {
                    return item.resourceId;
                }) : editResourceItem.resourceId;
                customCategories = _.map(resourceGroupData, (item, idx) => {
                    let valueIdx = `propValue${idx}`;
                    return {
                        propId: item.propId,
                        propName: item.propName,
                        propValue: values[valueIdx]
                    }
                });
                data.resourceIdList = resourceIdList;
                data.customCategories = customCategories;
                dispatch(editResourceGroupAction(systemid, id, data, () => {
                    if (querySeq) {
                        param.querySeq = querySeq;
                    };
                    if (queryIp) {
                        param.ip = queryIp;
                    };
                    this.requestResourceList(param);
                    // this.setState({ 
                    //     resourceGroupData: []
                    // });
                }));
            }
        })
    };

    // 编辑自定义属性
    editResource = (record) => {
        const { detailProgramList, systemid, dispatch } = this.props;
        let { groupValues } = this.state;
        this.setState({
            // showEditResourceModal: true,
            isEdit: true,
            editResourceItem: record,
            showEditResourceGroupModal: true,
        });
        // dispatch(updateGroupAction(systemid, this.editResourceGroupScb));
    };

    // hideEditResourceModal = () => {
    //     this.setState({ showEditResourceModal: false });
    // };

    // handleSubmitResourceEdit = () => {
    // };

    // 获取资源列表数据
    requestResourceList = (params = {}, pagination = null) => {
        let { pagination: { limit, pageIndex }, dispatch, systemid, id, searchGroupValues, searchCustomGroupList, form: { getFieldsValue, getFieldValue } } = this.props;
        let { pageSize } = this.state;
        // _.map(searchGroupValues, (item, index) => {
        //     let value = getFieldValue(`${item.propId}`);
        //     if(value){
        //         searchGroupValues[index]['propValue'] = value;
        //     }
        // });
        if (pagination) {
            limit = pagination.limit
            pageIndex = pagination.pageIndex
            dispatch(updateResourcePagination({ limit, pageIndex }));//更新页码
        }
        let newParams = { ...params, limit, start: pageIndex * pageSize };
        // if(searchGroupValues && searchGroupValues.length > 0 ){
        //     newParams.customCategoryList = searchGroupValues;
        // };
        newParams.customCategoryList = _.map(searchCustomGroupList, (item, index) => {
            let value = getFieldValue(`${item.propId}`);
            return {
                id: item.id,
                systemId: item.systemId,
                propId: item.propId,
                propName: item.propName,
                propValue: value
            }
        })
        // newParams.customCategoryList = searchCustomGroupList;
        dispatch(getResourceList(newParams, systemid, id));//获取更新后的列表
        this.setState({
            rowSelection: { selectedRowKeys: [] },
            changeResourceList: []
        });
    };

    // 单行删除
    handleDeleteResource = (e) => {
        let { dispatch, systemid, id, form: { getFieldValue } } = this.props;
        let data = e.sequenceId;
        let params = {};
        let querySeq = getFieldValue('querySeq') || '';
        let queryIp = getFieldValue('queryIp') || '';
        if (querySeq.length > 0 || queryIp.length > 0) {
            params.sequenceId = querySeq;
            params.ip = queryIp;
        }
        dispatch(deleteResource({ seqIdList: data }, systemid, id, () => {
            message.success('删除成功');
            this.requestResourceList(params);
        }, (err) => {
            message.error(err);
        }));
    };

    // 批量删除
    deleteResources = () => {
        let { changeResourceList } = this.state;
        let seqIdList = [];
        if (changeResourceList.length === 0) {
            message.warning('请先选择要删除的资源！');
            return;
        };
        seqIdList = _.map(changeResourceList, (item) => {
            return item.sequenceId;
        });
        this.setState({ seqIdList, showDeleteModal: true });
    };

    // 批量删除确认
    confirmDelete = () => {
        let { dispatch, systemid, id, form: { getFieldValue } } = this.props;
        let { seqIdList } = this.state;
        let params = {};
        let querySeq = getFieldValue('querySeq');
        let queryIp = getFieldValue('queryIp');
        if (querySeq || queryIp) {
            params.sequenceId = querySeq;
            params.ip = queryIp;
        }
        dispatch(deleteResource({ seqIdList: seqIdList.join(',') }, systemid, id, () => {
            message.success('删除成功');
            this.setState({ changeResourceList: [] });
            this.requestResourceList(params, { limit: 10, pageIndex: 0 });
        }, (err) => {
            message.error(err);
        }));
        this.setState({ showDeleteModal: false }, () => {
            document.body.style.overflow = 'auto'
        });
    };

    // 下载模板
    downloadImportExcel = () => {
        let { systemid } = this.props;
        window.open(`${ContextPath}/cmdb/resource/import/downloadTemp/${systemid}/`);
    };

    // 关联资源弹框点击确认
    handleTransferConfirm = (values) => {
        let { dispatch, systemid, id } = this.props;
        let { rightData } = this.state;
        this.setState({ showRefModal: false }, () => {
            document.body.style.overflow = 'auto';
        });
        if (values && values.rows && values.rows.length > 0) {
            let rightRows = values.rows;
            let seqIdList = _.map(rightRows, (row) => {
                return row.sequenceid;
            });
            rightData = values;
            this.setState({ rightData });
            dispatch(bindResource({ seqIdList: seqIdList.join(',') }, systemid, id, () => {
                message.success('关联资源成功');
                this.requestResourceList();
            }, (err) => {
                message.error(err);
            }));
        }
    };

    // 改变单页展示数量
    handleTableChange = (pagination, filters, sorter) => {
        let { pagination: { limit, pageIndex }, form: { getFieldValue } } = this.props;
        let { current, pageSize } = pagination;
        let querySeq = getFieldValue('querySeq');
        let queryIp = getFieldValue('queryIp');
        this.setState({ pageSize });
        let params = { sequenceId: querySeq, ip: queryIp };
        if (limit !== pageSize || pageIndex !== (current - 1)) {
            limit = pageSize;
            pageIndex = current - 1;
        };
        this.requestResourceList(params, { limit, pageIndex });
    };

    handleUploadChange = (info) => {
        let fileList = info.fileList;
        // 控制大小在20M以内
        fileList = _.filter(fileList, function (file) {
            return file.size === undefined || _.divide(file.size, 1024 * 1024) <= 20;
        });
        if (info.file.status === 'done') {
            if (info.file.response && !info.file.response.hasError && info.file.uid) {
                message.success(`${info.file.name} 上传成功！`);
                this.requestResourceList();
            } else {
                let failReason = info.file.response ? info.file.response.error : '上传接口出错！';
                // message.error(`${info.file.name} 上传失败！原因：${failReason}`);
                message.error(`${failReason}`);
                return;
            }
        } else if (info.file.status === 'error') {
            message.error(`${info.file.name} 上传失败！`);
        }
    }

    // 选中资源
    handleRowSelection = (list) => {
        this.setState({
            changeResourceList: list,
            rowSelection: {
                selectedRowKeys: [...list].map(v => v.name)
            }
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

    // 查询
    handleSearch = () => {
        let { form: { getFieldValue }, searchGroupValues, searchCustomGroupList } = this.props;
        let querySeq = getFieldValue('querySeq');
        let queryIp = getFieldValue('queryIp');
        let param = { sequenceId: querySeq, ip: queryIp };
        // if(searchGroupValues && searchGroupValues.length > 0){
        //     _.map(searchGroupValues, (item, index) => {
        //         let value = getFieldValue(`${item.propId}`);
        //         if(value){
        //             searchGroupValues[index]['propValue'] = value;
        //         }
        //     });
        //     param.customCategoryList = searchGroupValues;
        // } else {
        /*param.customCategoryList = _.map(searchCustomGroupList, (item, index) => {
            let value = getFieldValue(`${item.propId}`);
            return {
                id: item.id,
                systemId: item.systemId,
                propId: item.propId,
                propName: item.propName,
                propValue: value
            }
        })*/
        param.customCategoryList = searchCustomGroupList;
        // }
        this.requestResourceList(param, { limit: 10, pageIndex: 0 })
    }

    render() {
        let { showRefModal, showDeleteModal, changeResourceList, rightData, rowSelection, identifiedAttrColumns, groupColumns, showEditResourceModal, showEditResourceGroupModal, resourceGroupData, groupNames, isEdit, editResourceItem } = this.state;
        let { rows, tableLoading, results, pagination: { limit, pageIndex }, systemid, id, searchGroupValues, searchCustomGroupList } = this.props;
        const { getFieldDecorator } = this.props.form;
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 5 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 18 },
            },
        }

        let columns = [];
        const columnsToAdd = [
            {
                title: '类别',
                dataIndex: 'assetTypeName',
                // align: 'center',
                // width: '8%',
                sortable: false,
                selected: true
            },
            {
                title: '流水号',
                dataIndex: 'sequenceId',
                // width: '10%',
                sortable: false,
                selected: true
            },
            {
                title: 'IP地址',
                dataIndex: 'outerIp',
                // width: '13%',
                sortable: false,
                selected: true,
                render: (value, record) => {
                    if (value.indexOf(';') !== -1) {
                        return _.map(value.split(';'), (ip, index) => {
                            return <div key={index}>{ip}</div>
                        })
                    } else {
                        return <div>{value}</div>
                    }
                }
            },
            {
                title: '使用人',
                dataIndex: 'useEmpName',
                // width: '13%',
                sortable: false,
                selected: true
            },
            {
                title: '状态',
                dataIndex: 'useStatusName',
                // width: '10%',
                sortable: false,
                selected: true
            },
            {
                title: '操作系统',
                dataIndex: 'operatingSystemName',
                // width: '10%',
                sortable: false
            },
            {
                title: '所属机房',
                dataIndex: 'addressName',
                // width: '14%',
                sortable: false
            },
            {
                title: '宿主机',
                dataIndex: 'hostSeqId',
                // width: '8%',
                sortable: false
            },
            {
                title: '主要配置',
                dataIndex: 'mainConfiguration',
                // width: '14%',
                sortable: false
            },
            {
                title: '端口',
                dataIndex: 'port',
                // width: '8%',
                sortable: false,
                selected: true
            },
            {
                title: '部署路径',
                dataIndex: 'path',
                // width: '12%',
                sortable: false,
                selected: true
            }
        ];

        const leftTableColumns = [
            { dataIndex: 'assetTypeName', title: '类别', width: '14%' },
            { dataIndex: 'sequenceid', title: '流水号', width: '19%' },
            { dataIndex: 'outip', title: 'IP地址', width: '22%' },
            { dataIndex: 'useEmpName', title: '使用人', width: '25%' },
            { dataIndex: 'relatedProgram', title: '所属程序', width: '20%' },
        ];
        const rightTableColumns = [
            { dataIndex: 'assetTypeName', title: '类别', width: '16%' },
            { dataIndex: 'sequenceid', title: '流水号', width: '20%' },
            { dataIndex: 'outip', title: 'IP地址', width: '25%' },
            { dataIndex: 'useEmpName', title: '使用人', width: '19%' },
            { dataIndex: 'relatedProgram', title: '所属程序', width: '20%' },
        ];

        const uploadProps = {
            name: 'fileData',
            action: `${ContextPath}/cmdb/system/${systemid}/resource/import/upload`,
            showUploadList: false,
            onChange: this.handleUploadChange.bind(this),
            beforeUpload: this.beforeUpload.bind(this)
        };

        let operate = [
            {
                title: '操作',
                dataIndex: 'operation',
                selected: true,
                sortable: false,
                render: (value, record) => {
                    return (
                        <div>
                            <a onClick={this.editResource.bind(this, record)}>编辑</a>
                            <Popconfirm
                                title={`确认删除这台${record.assetTypeName}吗？`}
                                onConfirm={this.handleDeleteResource.bind(this, record)}
                                onCancel={() => { }}
                                okText="删除"
                                cancelText="取消"
                            ><a style={{ padding: '0 10px' }}>删除</a></Popconfirm>
                        </div>
                    );
                }
            }
        ]

        let customGroupSearchDom = null;
        if (searchCustomGroupList.length > 0) {
            customGroupSearchDom = searchCustomGroupList.map((item, index) => {
                let placeholder = `请输入${item.propName}`;
                return (
                    <Col span={8} key={index}>
                        <Form.Item label={item.propName}>
                            {getFieldDecorator(`${item.propId}`, {
                                initialValue: searchGroupValues && searchGroupValues[index] ? searchGroupValues[index]['propValue'] : item.propValue
                            })
                                (
                                    <Input
                                        placeholder={placeholder}
                                    />
                                )
                            }
                        </Form.Item>
                    </Col>
                )
            })
        }

        if (groupColumns.length > 0) {
            columns = columns.concat(groupColumns);
        };
        columns = columns.concat(columnsToAdd);
        if (identifiedAttrColumns.length > 0) {
            columns = columns.concat(identifiedAttrColumns);
        };
        columns = columns.concat(operate);

        return (
            <div>
                <Row style={{ marginBottom: '16px' }}>
                    <Col span={24}>
                        <Button
                            style={{ marginRight: '8px', backgroundColor: '#87d068', borderColor: '#87d068', color: '#fff' }}
                            icon='plus-circle'
                            onClick={() => this.setState({ showRefModal: true })}
                        >关联资源</Button>
                        <Button
                            type='danger'
                            icon='close-circle'
                            onClick={this.deleteResources.bind(this)}
                        >删除</Button>
                        <Divider type='vertical' style={{ height: '2.2em' }} />
                        <Button
                            style={{ marginRight: '8px' }}
                            type='primary'
                            icon='download'
                            onClick={this.downloadImportExcel.bind(this)}
                        >下载模板</Button>
                        <Upload {...uploadProps} >
                            <Button type='primary' icon='import' style={{ backgroundColor: '#f0ad4e', borderColor: '#eea236' }}>导入资源</Button>
                        </Upload>
                        <Button
                            // style={{ marginRight: '8px' }}
                            style={{ marginLeft: '8px' }}
                            type='primary'
                            icon='edit'
                            onClick={this.editResourceGroup.bind(this)}
                        >资源自定义分组</Button>
                        <Divider type='vertical' style={{ height: '2.2em' }} />
                        <Button
                            type='primary'
                            icon='search'
                            onClick={this.handleSearch}
                        >查询</Button>
                    </Col>
                </Row>

                <Form {...formItemLayout} style={{ marginBottom: '16px', background: '#e7f3f9', paddingTop: '10px' }}>
                    <Row>
                        <Col span={8}>
                            <Form.Item label="流水号">
                                {getFieldDecorator('querySeq', {
                                })
                                    (<Input placeholder='请输入流水号' />)
                                }
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label="IP地址">
                                {getFieldDecorator('queryIp', {
                                })
                                    (<Input placeholder='请输入IP地址' />)
                                }
                            </Form.Item>
                        </Col>
                    </Row>
                    {
                        searchCustomGroupList.length > 0 ?
                            <Row>
                                {customGroupSearchDom}
                            </Row> :
                            null
                    }
                </Form>
                {/* <Row style={{ background: '#e7f3f9', padding: '20px' }}>
                    <Col span={24}>
                        流水号
                        <Input
                            style={{ width: '200px', marginRight: '10px' }}
                            value={querySeq}
                            placeholder='请输入流水号'
                            onChange={(evt) => {
                                let querySeq = evt.target.value;
                                this.setState(() => ({ querySeq }));
                            }}
                        />
                        IP地址
                        <Input
                            style={{ width: '200px', marginRight: '10px' }}
                            value={queryIp}
                            placeholder='请输入IP地址'
                            onChange={(evt) => {
                                let queryIp = evt.target.value;
                                this.setState(() => ({ queryIp }));
                            }}
                        />
                    </Col>
                </Row> */}
                <StandardTable
                    sysId={systemid}
                    name='CMDB-resource'
                    rowKey='sequenceId'
                    loading={tableLoading}
                    columns={columns}
                    data={{
                        list: rows,
                        pagination: {
                            current: pageIndex + 1,
                            total: results,
                            pageSize: limit,
                            showTotal: total => `共 ${total} 条`
                        }
                    }}
                    onChange={this.handleTableChange}
                    onSelectRow={this.handleRowSelection}
                    showSetting={true}
                    pageId='cmdb-resource'
                    maxColNum={8}
                    rowSelection={rowSelection}
                />

                {showRefModal && <TransferDialog
                    width={1000}
                    height={`${window.screen.height * 0.56}px`}
                    title='关联资源'
                    initRight={rightData.rows}
                    url={`${ContextPath}/cmdb/system/${systemid}/getAll`}
                    visible={showRefModal}
                    leftCols={leftTableColumns}
                    rightCols={rightTableColumns}
                    onCreate={this.handleTransferConfirm.bind(this)}
                    onCancel={() => this.setState({ showRefModal: false },
                        () => {
                            document.body.style.overflow = 'auto';
                        })
                    }
                />}

                <Modal
                    title="删除资源"
                    visible={showDeleteModal}
                    onOk={this.confirmDelete}
                    onCancel={() => {
                        this.setState({ showDeleteModal: false },
                            () => {
                                document.body.style.overflow = 'auto';
                            })
                    }}
                >
                    <p>确定删除选中的{changeResourceList.length}个资源？</p>
                </Modal>
                {/* <Modal
                    title='编辑资源'
                    visible={showEditResourceModal}
                    onOk={this.handleSubmitResourceEdit}
                    onCancel={this.hideEditResourceModal}
                    width={620}
                    destroyOnClose={true}>
                </Modal> */}
                <Modal
                    title='资源自定义分组'
                    visible={showEditResourceGroupModal}
                    onOk={this.handleSubmitResourceGroupEdit}
                    onCancel={this.hideEditResourceGroupModal}
                    width={620}
                    destroyOnClose={true}
                >
                    <Form {...formItemLayout}>
                        {resourceGroupData.map((item, index) => {
                            let _propId = resourceGroupData[index].propId;
                            return (
                                <Row key={item.id}>
                                    {/* <Col span={12}>
                                <Form.Item label="分组类型">
                                    {getFieldDecorator(`propName${index}`, {
                                        rules: [{
                                            required: true,
                                            message: '请输入名称',
                                        }],
                                        initialValue: item.propName
                                    })
                                        (<Input readOnly />)
                                    }
                                </Form.Item>
                            </Col> */}
                                    <Col span={24}>
                                        <Form.Item label={item.propName}>
                                            {getFieldDecorator(`propValue${index}`, {
                                                // rules: [{
                                                //     required: true,
                                                //     message: '请输入值',
                                                // }],
                                                initialValue: isEdit ? editResourceItem[_propId] : ''
                                            })
                                                (<Input />)
                                            }
                                        </Form.Item>
                                    </Col>
                                </Row>
                            )
                        })}
                    </Form>
                </Modal>

            </div>
        );
    }
}

const mapStateToProps = (state, ownProps) => {
    const { resource: { rows, tableLoading, results, pagination } } = state.applicationResource;
    return {
        detailProgramList: state.detailProgramList,
        searchCustomGroupList: state.searchCustomGroupList,
        searchGroupValues: state.searchGroupValues,
        rows,
        tableLoading,
        results,
        pagination,
    }
}


resourceInfo = Form.create()(resourceInfo)

export default connect(mapStateToProps)(resourceInfo);