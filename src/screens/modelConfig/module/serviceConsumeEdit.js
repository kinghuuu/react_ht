import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import _ from 'lodash';
import { Row, Col, Modal, Form, Input, message, Spin, Alert, TreeSelect } from 'antd';
import { SearchInput } from '../../../components/searchinput/searchinput';
import { PlainSelector } from '../../../components/selector/selector';
import { ContextPath } from '../../../constants';
import { getSelfDefiningList, } from '../../../actions/selfDefining/action';
import {
    getSelfDefiningValue,
    saveSelfDefiningValue,
    createModel,
    updateModel,
    getTreeList,
} from '../../../actions/modelConfig/action';
import styles from '../index.module.less';
import { DYNAMIC_PROPERTIES } from '../common';
import { renderFormItems, getFormItemsValue } from '../../common/renderFormItems';

const FormItem = Form.Item,
    spanLeft = 22,
    formItemLayout = {
        labelCol: { span: 4 },
        wrapperCol: { span: 20 }
    },
    formItemLayout_ResponseTime = {
        labelCol: { span: 5 },
        wrapperCol: { span: 19 }
    },
    initFixedPropertieList = [
        { propId: 'providerServiceId', propName: '调用方服务名称', propValue: '' },
        { propId: 'serviceCallerSystemId', propName: '提供方应用系统', propValue: '' },
        { propId: 'callerServiceId', propName: '提供方服务名称', propValue: '' },
        { propId: 'serviceCallType', propName: '调用方式', propValue: '' },
        { propId: 'callerQPS', propName: '调用方QPS', propValue: '' },
        { propId: 'callerNeedResponseTime', propName: '调用方要求响应时间', propValue: '' },
        { propId: 'businessId', propName: '业务', propValue: '', },
    ];

class ServiceConsumeEdit extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            fixedPropertieList: initFixedPropertieList,
            dynamicPropertieList: [],
            selectId: '', // 调用方应用系统 下拉框的systemId
            treeData: [],
            expandedKeys: [],
        };
    }

    componentDidMount() {
        this.getSelfDefiningList();
        this.getTreeList();
    }

    // 获取自定义信息
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

    // 确定
    handleOk = (e) => {
        e.preventDefault();
        const { loading, dynamicPropertieList } = this.state;
        const { form: { validateFields } } = this.props;
        validateFields((err, values) => {
            if (err) {
                return;
            }
            if (loading) {
                message.warning('请勿重复提交');
            }
            this.setState(() => ({ loading: true }));

            let fixedProperties = _.map(initFixedPropertieList, item => {
                const { propId } = item;
                let propValue = values[propId];
                // 选择框
                if (_.isArray(propValue)) {
                    let value = '';
                    if (!_.isEmpty(propValue)) {
                        value = propValue.map(item => item.value);
                        value = value.join(',');
                    }
                    propValue = value
                } else if (_.isObject(propValue)) {
                    propValue = propValue.value[0]
                }
                return { propId, propValue };
            });

            let { dynamicProperties } = getFormItemsValue(values, dynamicPropertieList);
            let properties = { dynamicProperties, fixedProperties };
            this.postData(properties);
        });
    }

    // 发送数据
    postData = (params) => {
        const { dispatch, hideModal, editData = {}, systemId, nodeType } = this.props;
        let { dynamicProperties, fixedProperties } = params;
        const { nodeId } = editData;
        let times = moment().format('YYYY-MM-DD HH:mm:ss');
        const close = () => {
            this.setState(() => ({ loading: false }));
            message.success(nodeId ? '服务调用编辑成功' : '服务调用新增成功');
            if (_.isFunction(hideModal)) {
                hideModal(true, !nodeId);
            }
        }

        const providerServiceId = fixedProperties[0].propValue;
        const serviceCallerSystemId = fixedProperties[1].propValue;
        const callerServiceId = fixedProperties[2].propValue;

        let newParams = {
            nodeId, times,
            topoName: `${providerServiceId}|${serviceCallerSystemId}|${callerServiceId}`,
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

        dispatch(action(newParams, (result = {}) => {
            const { data: resultId } = result;
            let saveSelfDefiningParams = {
                systemId, nodeType, times,
                nodeId: isUpdate ? nodeId : resultId,
                propertyDetailList: dynamicProperties
            }
            dispatch(saveSelfDefiningValue(saveSelfDefiningParams, res => {
                close()
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

    findItems = (treeList, rows, parentId) => {
        treeList.forEach(item => {
            const { key, children } = item;
            let isSome = Number.parseInt(key) === Number.parseInt(parentId);
            if (isSome) {
                item.children = rows;
            } else {
                if (_.isArray(children)) {
                    this.findItems(children, rows, parentId);
                }
            }
            return isSome;
        });
    };

    getTreeList = (parentId = '-1') => {
        const { dispatch, systemId } = this.props;
        const { treeData } = this.state;
        let treeDataCopy = _.cloneDeep(treeData);
        dispatch(getTreeList({ parentId, nodeType: 'business', systemId }, (res = { rows: [] }) => {
            let newTreeData = res.rows;
            if (parentId !== '-1') {
                this.findItems(treeDataCopy, newTreeData, parentId);
                newTreeData = treeDataCopy;
            }
            this.setState(() => ({ treeData: newTreeData }));
        }));
    }

    handleTreeExpand = (_expandedKeys) => {
        const { expandedKeys } = this.state;
        if (_expandedKeys.length > expandedKeys.length) {
            let parentId = _expandedKeys[_expandedKeys.length - 1];
            this.getTreeList(parentId);
        }
        this.setState(() => ({ expandedKeys: _expandedKeys }));
    }


    render() {
        const {
            loading,
            dynamicPropertieList,
            treeData,
        } = this.state;
        const {
            form,
            form: { getFieldDecorator, setFieldsValue },
            editData = {},
            systemId,
        } = this.props;
        const {
            nodeId,
            providerServiceId, providerService,
            serviceCallerSystemId, serviceCallerSystem,
            callerServiceId, callerService,
            serviceCallType = '01',
            callerQPS,
            callerNeedResponseTime,
            businessId = '',
            business = '',
        } = editData;

        let height = window.document.body.offsetHeight * 0.6;

        //初始化 调用方服务名称
        let initProviderService = { data: [], value: [] }
        if (providerServiceId) {
            initProviderService = {
                data: [{ text: providerService, value: providerServiceId }],
                value: [providerServiceId]
            }
        }

        //初始化 提供方应用系统
        let initServiceCallerSystem = { data: [], value: [] }
        if (serviceCallerSystemId) {
            initServiceCallerSystem = {
                data: [{ text: serviceCallerSystem, value: serviceCallerSystemId }],
                value: [serviceCallerSystemId]
            }
        }

        //初始化 提供方服务名称
        let initCallerService = { data: [], value: [] }
        if (callerServiceId) {
            initCallerService = {
                data: [{ text: callerService, value: callerServiceId }],
                value: [callerServiceId]
            }
        }

        let initBusiness = [];
        if (businessId) {
            let ids = businessId.split(','), labels = business.split(',');
            initBusiness = _.map(ids, (value, index) => {
                return { value, label: labels[index] || '' }
            });
        }

        return (
            <Modal
                title={nodeId ? '编辑服务调用' : '新增服务调用'}
                visible={true}
                onOk={this.handleOk}
                onCancel={this.handleCancel}
                width={800}
                className={styles.customModal}
                maskClosable={false}
            >
                <Spin spinning={loading}>
                    <div className={styles.customModalBody} style={{ maxHeight: `${height}px` }}>
                        <Form>
                            <Row>
                                {_.isEmpty(dynamicPropertieList) ? null : (
                                    <Col style={{ marginBottom: '16px' }}><Alert message='基本信息' type='info' /></Col>
                                )}
                                <Col span={spanLeft}>
                                    <FormItem label="调用方服务名称" {...formItemLayout}>
                                        {getFieldDecorator('providerServiceId', {
                                            rules: [{
                                                required: true,
                                                validator: (rule, value, callback) => {
                                                    if (_.isEmpty(value && value.value)) {
                                                        callback('请选择调用方服务名称!');
                                                    } else {
                                                        callback();
                                                    }
                                                }
                                            }],
                                            initialValue: initProviderService
                                        })
                                            (
                                                <SearchInput
                                                    dropdownMenuStyle={{ overflow: 'hidden', maxHeight: '320px' }}
                                                    placeholder='请选择调用方服务名称'
                                                    method='get'
                                                    attachParams={{ systemId, nodeType: 'service' }}
                                                    dataUrl={`${ContextPath}/cmdbCommon/getSelectList`}
                                                    forceOuterData={true}
                                                    allowClear={false}
                                                />
                                            )
                                        }
                                    </FormItem>
                                </Col>

                                <Col span={spanLeft}>
                                    <FormItem label="提供方应用系统" {...formItemLayout}>
                                        {getFieldDecorator('serviceCallerSystemId', {
                                            rules: [{
                                                required: true,
                                                validator: (rule, value, callback) => {
                                                    if (_.isEmpty(value && value.value)) {
                                                        callback('请选择提供方应用系统!');
                                                    } else {
                                                        callback();
                                                    }
                                                }
                                            }],
                                            initialValue: initServiceCallerSystem
                                        })
                                            (
                                                <SearchInput
                                                    placeholder='请选择提供方应用系统'
                                                    method='get'
                                                    queryName='systemName'
                                                    dataUrl={`${ContextPath}/cmdb/querySystemFuzzy`}
                                                    forceOuterData={true}
                                                    allowClear={false}
                                                    onSelect={(value) => {
                                                        this.setState({ selectId: value })
                                                        setFieldsValue({
                                                            callerServiceId: { data: [], value: [] }
                                                        })
                                                    }}
                                                />
                                            )
                                        }
                                    </FormItem>
                                </Col>

                                <Col span={spanLeft}>
                                    <FormItem label="提供方服务名称" {...formItemLayout}>
                                        {getFieldDecorator('callerServiceId', {
                                            rules: [{
                                                required: true,
                                                validator: (rule, value, callback) => {
                                                    if (_.isEmpty(value && value.value)) {
                                                        callback('请选择提供方服务名称!');
                                                    } else {
                                                        callback();
                                                    }
                                                }
                                            }],
                                            initialValue: initCallerService
                                        })
                                            (
                                                <SearchInput
                                                    placeholder='请选择提供方服务名称'
                                                    method='get'
                                                    disabled={nodeId ? false : (this.state.selectId ? false : true)}
                                                    attachParams={{ systemId: (this.state.selectId ? this.state.selectId : serviceCallerSystemId), nodeType: 'service' }}
                                                    dataUrl={`${ContextPath}/cmdbCommon/getSelectList`}
                                                    forceOuterData={true}
                                                    allowClear={false}
                                                />
                                            )
                                        }
                                    </FormItem>
                                </Col>

                                <Col span={spanLeft}>
                                    <FormItem label="调用方式"  {...formItemLayout}>
                                        {getFieldDecorator('serviceCallType', {
                                            initialValue: {
                                                data: [],
                                                value: [],
                                            }
                                        })
                                            (
                                                <PlainSelector
                                                    // forceOuterData={true}
                                                    allowClear={false}
                                                    placeholder='请选择调用方式'
                                                    method='get'
                                                    params={{ param: 'serviceCallType' }}
                                                    dataUrl={`${ContextPath}/cmdbCommon/getParameterList`}
                                                    selectFirstData={!nodeId}
                                                    selectedValue={serviceCallType ? [serviceCallType] : []}
                                                />
                                            )
                                        }
                                    </FormItem>
                                </Col>

                                <Col span={spanLeft}>
                                    <FormItem label="调用方QPS"  {...formItemLayout}>
                                        {getFieldDecorator('callerQPS', {
                                            initialValue: callerQPS
                                        })
                                            (<Input autoComplete='off' placeholder='请输入调用方QPS' />)
                                        }
                                    </FormItem>
                                </Col>

                                <Col span={spanLeft}>
                                    <FormItem label="调用方要求响应时间"  {...formItemLayout_ResponseTime}>
                                        {getFieldDecorator('callerNeedResponseTime', {
                                            initialValue: callerNeedResponseTime
                                        })
                                            (<Input autoComplete='off' placeholder='请输入调用方要求响应时间' />)
                                        }
                                    </FormItem>
                                </Col>

                                <Col span={spanLeft}>
                                    <FormItem label="业务" {...formItemLayout}>
                                        {getFieldDecorator('businessId', {
                                            rules: [{
                                                required: true,
                                                validator: (rule, value, callback) => {
                                                    if (_.isEmpty(value)) {
                                                        callback('请选择业务!');
                                                    } else {
                                                        callback();
                                                    }
                                                }
                                            }],
                                            initialValue: initBusiness
                                        })
                                            (
                                                <TreeSelect
                                                    showLine={true}
                                                    onTreeExpand={this.handleTreeExpand}
                                                    dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                                                    treeData={treeData}
                                                    labelInValue={true}
                                                    treeCheckable={true}
                                                ></TreeSelect>
                                            )
                                        }
                                    </FormItem>
                                </Col>

                            </Row>

                            {_.isEmpty(dynamicPropertieList) ? null : (
                                <Row>
                                    <Col style={{ marginBottom: '16px' }}><Alert message='自定义属性' type='info' /></Col>
                                    <Col>
                                        {renderFormItems({
                                            prefix: DYNAMIC_PROPERTIES,
                                            list: dynamicPropertieList,
                                            form, formItemLayout,
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


ServiceConsumeEdit = Form.create()(ServiceConsumeEdit)

export default connect()(ServiceConsumeEdit);