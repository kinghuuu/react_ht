import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { Row, Col, Upload, Input, Button, Icon, Alert, Form } from 'antd';
import { ContextPath } from '../../../constants';
import { PlainSelector } from '../../../components/selector/selector';
import { handleUploadChange, beforeUpload, DATA_BASE_TYPES, DISASTE_AREAS } from '../common';

const FormItem = Form.Item;

class DatabaseOperation extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isShowOtherQuery: false,
            isShowOtherQueryBtn: false,
            queryList: [], // 自定义属性列表
        };
    }

    handleSearch = (e) => {
        e.preventDefault();
        const { getModelConfigList, form: { getFieldsValue }, updateQueryValue } = this.props;
        let { dataBaseType, masterIp } = getFieldsValue();
        dataBaseType = dataBaseType.value[0]
        let propertyValueDtoList = [
            { propId: 'masterIp', propValue: masterIp },
            { propId: 'dataBaseType', propValue: dataBaseType },
        ];

        if (_.isFunction(getModelConfigList)) {
            getModelConfigList({ propertyValueDtoList });
        }
        if (_.isFunction(updateQueryValue)) {
            updateQueryValue(propertyValueDtoList);
        }
    }

    handleReset = () => {
        const { getModelConfigList, form: { setFieldsValue }, updateQueryValue } = this.props;
        setFieldsValue({
            dataBaseType: {
                data: DATA_BASE_TYPES,
                value: []
            },
            masterIp: ''
        })
        let params = {
            propertyValueDtoList: []
        }
        if (_.isFunction(updateQueryValue)) {
            updateQueryValue([]);
        }
        if (_.isFunction(getModelConfigList)) {
            getModelConfigList(params);
        }
    }

    handleCreate = () => {
        const { showEditModal } = this.props;
        if (_.isFunction(showEditModal)) {
            showEditModal();
        }
    }

    // 下载模板
    downloadTemplate = () => {
        let { nodeType, systemId } = this.props;
        let params = encodeURI(`configItemType=${nodeType}&systemId=${systemId}`);
        window.open(`${ContextPath}/cmdbCommon/downloadTemp?${params}`);
    };

    // 导出 Excel 模板
    downloadImportExcel = () => {
        const { getModelConfigList, systemId, nodeType, form: { getFieldsValue } } = this.props;
        let { dataBaseType, masterIp } = getFieldsValue();
        dataBaseType = dataBaseType.value[0]
        let propertyValueDtoList = [
            { propId: 'masterIp', propValue: masterIp },
            { propId: 'dataBaseType', propValue: dataBaseType },
        ];
        let params = encodeURI(`configItemType=${nodeType}&systemId=${systemId}&propertyValueList=${JSON.stringify(propertyValueDtoList)}`);
        window.open(`${ContextPath}/cmdbCommon/downloadData?${params}`);
    }

    componentDidMount() {
        const { getModelConfigList } = this.props;
        let params = {
            propertyValueDtoList: []
        }
        if (_.isFunction(getModelConfigList)) {
            getModelConfigList(params);
        }
    }

    componentDidUpdate() {
        const { systemId: pId, nodeType, updateQueryValue, form: { setFieldsValue } } = this.props;
        const { systemId } = this.state;
        if (pId !== systemId) {
            this.setState(
                () => ({ systemId: pId, nodeType })
            )
            setFieldsValue({
                dataBaseType: {
                    data: DATA_BASE_TYPES,
                    value: []
                },
                masterIp: ''
            })
            if (_.isFunction(updateQueryValue)) {
                updateQueryValue([]);
            }
        }
    }

    render() {
        
        const {
            form: { getFieldDecorator },
            buttonLoading,
            nodeType, systemId, role,
        } = this.props;

        const uploadProps = {
            name: 'file',
            action: `${ContextPath}/cmdbCommon/import`,
            data: { systemId, configItemType: nodeType },
            showUploadList: false,
            beforeUpload: beforeUpload.bind(this),
            onChange: handleUploadChange.bind(this, this.handleReset),
        };

        let isLeader = role === '领导', isAdmin = role === '管理员';

        return (
            <Row>
                <Col>
                    <Form
                        layout='inline'
                        onSubmit={this.handleSearch}
                    >
                        <FormItem label='主库IP'>
                            {getFieldDecorator('masterIp', {
                                // initialValue: ''
                            })
                                (
                                    <Input placeholder='请输入主库IP' style={{ width: '200px' }} autoComplete='off' />
                                )
                            }
                        </FormItem>

                        <FormItem label='数据库类型'>
                            {getFieldDecorator('dataBaseType', {
                                initialValue: {
                                    data: DATA_BASE_TYPES,
                                    value: [],
                                }
                            })
                                (
                                    <PlainSelector
                                        style={{ width: '180px' }}
                                        allowClear={false}
                                        forceOuterData={true}
                                        placeholder='请选择数据库类型!'
                                        allowClear={true}
                                    />
                                )
                            }
                        </FormItem>



                        <FormItem>
                            <Button type='primary' htmlType='submit' loading={buttonLoading} >查询</Button>
                        </FormItem>
                        <FormItem>
                            <Button onClick={this.handleReset} type='primary' >重置</Button>
                        </FormItem>

                        {
                            !isLeader || isAdmin ? (
                                <Fragment>
                                    <FormItem>
                                        <Button onClick={this.handleCreate} type='primary' className='button-success' >新增</Button>
                                    </FormItem>
                                    {/* <FormItem>
                                        <Button onClick={showDeleteConfirm.bind(this, { moduleKey: 'processName' })} type='danger' >批量删除</Button>
                                    </FormItem> */}
                                    <FormItem>
                                        <Button onClick={this.downloadTemplate.bind(this)} >模板下载</Button>
                                    </FormItem>
                                    <FormItem>
                                        <Upload {...uploadProps}><Button>批量上传</Button></Upload>
                                    </FormItem>
                                </Fragment>
                            ) : null
                        }

                        <FormItem>
                            <Button onClick={this.downloadImportExcel.bind(this)}>导出Excel</Button>
                        </FormItem>

                    </Form>
                </Col>

            </Row >
        )
    }
}
const mapStateToProps = (state) => {
    const { buttonLoading, pagination } = state.modelConfig;
    return { buttonLoading, pagination };
}

DatabaseOperation = Form.create()(DatabaseOperation);

export default connect(mapStateToProps)(DatabaseOperation);