import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import _ from 'lodash';
import { Modal, Form, Input, message, TreeSelect, Spin, Row, Col, Alert } from 'antd';
import { PlainSelector } from '../../../components/selector/selector';
import { ContextPath } from '../../../constants';
import {
    createModel,
    updateModel,
    getTreeList,
    saveSelfDefiningValue,
    getSelfDefiningValue,
} from '../../../actions/modelConfig/action';
import { getSelfDefiningList } from '../../../actions/selfDefining/action';
import { renderFormItems, getFormItemsValue } from '../../common/renderFormItems';
import { DYNAMIC_PROPERTIES, RELATION_PROPERTIES } from '../common';
import styles from '../index.module.less';

const FormItem = Form.Item,
    spanLeft = 22,
    formItemLayout = {
        labelCol: { span: 5 },
        wrapperCol: { span: 19 }
    },
    initFixedPropertieList = [
        { propId: 'serverName', propName: '服务名称', propValue: '' },
        { propId: 'serverPath', propName: '服务路径', propValue: '' },
        { propId: 'agreementType', propName: '协议类型', propValue: '' },
        { propId: 'description', propName: '服务描述', propValue: '' },
        { propId: 'processId', propName: '所属进程', propValue: '' },
        { propId: 'status', propName: '状态', propValue: '' },
    ];

class ServiceEdit extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            expandedKeys: [],
            processData: [],
            dynamicPropertieList: [],
        };
    }

    componentDidMount() {
        // this.getTreeList();
        this.getProcessList();
        this.getSelfDefiningList();
    }

    // 确定
    handleOk = (e) => {
        e.preventDefault();
        const { loading, dynamicPropertieList } = this.state;
        const { form: { validateFields }, editData = {}, nodeType = '', systemId } = this.props;
        const { id } = editData;
        validateFields((err, values) => {
            if (err) {
                return;
            }
            if (loading) {
                message.warning('请勿重复提交');
            }
            this.setState(() => ({ loading: true }));
            // values.businessId = values.businessId.value
            let fixedProperties = _.map(initFixedPropertieList, item => {
                const { propId } = item;
                let propValue = values[propId];
                // 选择框
                if (_.isArray(propValue)) {
                    propValue = propValue.join(',');
                } else if (_.isObject(propValue)) {
                    propValue = propValue.value[0];
                }
                return { propId, propValue };
            });
            let { dynamicProperties } = getFormItemsValue(values, dynamicPropertieList);
            this.postData({ fixedProperties, dynamicProperties })
        });
    }

    // 发送数据
    postData = ({ fixedProperties, dynamicProperties }) => {
        const { dispatch, hideModal, editData = {}, systemId, nodeType } = this.props;
        const { nodeId } = editData;
        let topoName = fixedProperties[0].propValue;
        let times = moment().format('YYYY-MM-DD HH:mm:ss');

        let params = {
            nodeId, times,
            topoName,
            systemId, configItemType: nodeType,
            propertyValueDtoList: fixedProperties
        }

        let isUpdate = !!nodeId;
        let ecb = (error = '请求错误') => {
            this.setState(() => ({ loading: false }));
            message.error(error);
        }

        let action = createModel;
        if (isUpdate) {
            action = updateModel;
        }

        dispatch(action(params, result => {
            const { data: resultId } = result;
            let saveSelfDefiningParams = {
                systemId, nodeType, times,
                nodeId: isUpdate ? nodeId : resultId,
                propertyDetailList: dynamicProperties
            }
            dispatch(saveSelfDefiningValue(saveSelfDefiningParams, res => {
                this.setState(() => ({ loading: false }));
                message.success(nodeId ? '服务编辑成功' : '服务新增成功');
                if (_.isFunction(hideModal)) {
                    hideModal(true, !nodeId);
                }
            }, ecb));
        }, ecb));
    }

    // 取消
    handleCancel = () => {
        const { hideModal } = this.props;
        if (_.isFunction(hideModal)) {
            hideModal();
        }
    }

    getProcessList = (parentId = '-1') => {
        const { dispatch, systemId } = this.props;
        dispatch(getTreeList({ parentId, nodeType: 'process', systemId }, (res = { rows: [] }) => {
            let processData = res.rows;
            // console.log('processData:', processData)
            processData.forEach(item => {
                item.disabled = true;
            });
            this.setState(() => ({ processData }));
        }));
    }

    getSelfDefiningList = () => {
        const { dispatch, nodeType, systemId, editData = {} } = this.props;
        const { nodeId } = editData;
        let params = { systemId, nodeType, pageIndex: 0, limit: 100, start: 0 };
        let action = getSelfDefiningList;
        if (nodeId) {
            params.nodeId = nodeId;
            action = getSelfDefiningValue;
        }
        dispatch(action(params, res => {
            let dynamicPropertieList = [];
            if (nodeId) {
                if (res && res.data && res.data.propertyDetailList) {
                    dynamicPropertieList = res.data.propertyDetailList
                }
            } else {
                if (res && res.rows) {
                    dynamicPropertieList = res.rows;
                }
            }
            this.setState(() => ({ dynamicPropertieList }));
        }));
    }

    render() {

        const {
            loading,
            processData,
            dynamicPropertieList,
        } = this.state;
        const {
            form, form: { getFieldDecorator },
            editData = {}, systemId,
        } = this.props;

        const {
            nodeId,
            serverName = '',
            serverPath = '',
            agreementType,
            description = '',
            process = '',
            processId = '',
            status = '01',
        } = editData;
        let height = window.document.body.offsetHeight * 0.6;

        let processIds = processId ? processId.split(',') : [];

        return (
            <Modal
                title={nodeId ? '编辑服务' : '新增服务'}
                visible={true}
                onOk={this.handleOk}
                onCancel={this.handleCancel}
                width={620}
                maskClosable={false}
                className={styles.customModal}
            >
                <Spin spinning={loading}>
                    <div className={styles.customModalBody} style={{ maxHeight: `${height}px` }}>
                        <Form>
                            <Row>
                                {_.isEmpty(dynamicPropertieList) ? null : (
                                    <Col style={{ marginBottom: '16px' }}><Alert message='基本信息' type='info' /></Col>
                                )}
                                <Col span={spanLeft} >
                                    <FormItem label="服务名称" {...formItemLayout}>
                                        {getFieldDecorator('serverName', {
                                            rules: [{ required: true, message: '请输入服务名名称' }],
                                            initialValue: serverName
                                        })
                                            (<Input autoComplete='off' placeholder='请输入服务名名称' />)
                                        }
                                    </FormItem>
                                </Col>
                                <Col span={spanLeft} >
                                    <FormItem label="服务路径" {...formItemLayout}>
                                        {getFieldDecorator('serverPath', {
                                            // rules: [{ required: true, message: '请输入服务路径' }],
                                            initialValue: serverPath
                                        })
                                            (<Input autoComplete='off' placeholder='请输入服务路径' />)
                                        }
                                    </FormItem>
                                </Col>
                                <Col span={spanLeft} >
                                    <FormItem label="协议类型" {...formItemLayout}>
                                        {getFieldDecorator('agreementType', {
                                            rules: [{
                                                required: true,
                                                validator: (rule, value, callback) => {
                                                    if (_.isEmpty(value && value.value)) {
                                                        callback('请选择协议类型!');
                                                    } else {
                                                        callback();
                                                    }
                                                }
                                            }],
                                            initialValue: {
                                                data: [],
                                                value: [],
                                            }
                                        })
                                            (
                                                <PlainSelector
                                                    // forceOuterData={true}
                                                    allowClear={false}
                                                    placeholder='请选择协议类型'
                                                    method='get'
                                                    params={{ param: 'serverType' }}
                                                    dataUrl={`${ContextPath}/cmdbCommon/getParameterList`}
                                                    selectFirstData={!nodeId}
                                                    selectedValue={agreementType ? [agreementType] : []}
                                                // disabled={isLook}
                                                />
                                            )
                                        }
                                    </FormItem>
                                </Col>
                                <Col span={spanLeft} >
                                    <FormItem label="服务描述" {...formItemLayout}>
                                        {getFieldDecorator('description', {
                                            // rules: [{ required: true, message: '请输入服务描述' }],
                                            initialValue: description
                                        })
                                            (<Input autoComplete='off' placeholder='请输入服务描述' />)
                                        }
                                    </FormItem>
                                </Col>
                                <Col span={spanLeft} >
                                    <FormItem label="所属进程" {...formItemLayout}>
                                        {getFieldDecorator('processId', {
                                            rules: [{ required: true, message: '请选择所属进程' }],
                                            initialValue: processIds
                                        })
                                            (
                                                <TreeSelect
                                                    placeholder='请选择所属进程'
                                                    showLine={true}
                                                    treeCheckable={true}
                                                    dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                                                    treeData={processData}
                                                ></TreeSelect>
                                            )
                                        }
                                    </FormItem>
                                </Col>
                                <Col span={spanLeft} >
                                    <FormItem label="状态" {...formItemLayout}>
                                        {getFieldDecorator('status', {
                                            initialValue: {
                                                data: [],
                                                value: [],
                                            }
                                        })
                                            (
                                                <PlainSelector
                                                    // forceOuterData={true}
                                                    allowClear={false}
                                                    placeholder='请选择状态'
                                                    method='get'
                                                    params={{ param: 'serverStatus' }}
                                                    dataUrl={`${ContextPath}/cmdbCommon/getParameterList`}
                                                    selectFirstData={!nodeId}
                                                    selectedValue={status ? [status] : []}
                                                />
                                            )
                                        }
                                    </FormItem>
                                </Col>

                            </Row>

                            {_.isEmpty(dynamicPropertieList) ? null : (
                                <Row>
                                    <Col style={{ marginBottom: '16px' }}><Alert message='自定义属性信息' type='info' /></Col>
                                    <Col>
                                        {renderFormItems({
                                            prefix: DYNAMIC_PROPERTIES,
                                            list: dynamicPropertieList,
                                            form, formItemLayout,
                                            systemId
                                        })}
                                    </Col>
                                </Row>
                            )}

                        </Form>
                    </div>
                </Spin>
            </Modal>
        );
    }
}

ServiceEdit = Form.create()(ServiceEdit)

export default connect()(ServiceEdit);