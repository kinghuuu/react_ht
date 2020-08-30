import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import _ from 'lodash';
import { Row, Col, Modal, Form, message, Spin, Alert, TreeSelect } from 'antd';
import { SearchInput } from '../../../components/searchinput/searchinput';
import { ContextPath } from '../../../constants';
import {
    createModel,
    updateModel,
    getTreeList,
} from '../../../actions/modelConfig/action';
import styles from '../index.module.less';
import { getFormItemsValue } from '../../common/renderFormItems';

const FormItem = Form.Item,
    spanLeft = 22,
    formItemLayout = {
        labelCol: { span: 4 },
        wrapperCol: { span: 20 }
    },
    initFixedPropertieList = [
        { propId: 'providerProgramId', propName: '调用方模块名称', propValue: 'providerProgram' },
        { propId: 'programCallerSystemId', propName: '提供方应用系统', propValue: 'programCallerSystem' },
        { propId: 'callerProgramId', propName: '提供方模块名称', propValue: 'callerProgram' },
        { propId: 'businessId', propName: '业务', propValue: '', },
    ];

class ProgramConsumeEdit extends Component {
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
        this.getTreeList();
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
        let { fixedProperties } = params;
        const { nodeId } = editData;
        let times = moment().format('YYYY-MM-DD HH:mm:ss');

        const providerProgramId = fixedProperties[0].propValue;
        const programCallerSystemId = fixedProperties[1].propValue;
        const callerProgramId = fixedProperties[2].propValue;

        let newParams = {
            nodeId, times,
            topoName: `${providerProgramId}|${programCallerSystemId}|${callerProgramId}`,
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

        // console.log(newParams)

        dispatch(action(newParams, result => {
            this.setState(() => ({ loading: false }));
            message.success(nodeId ? '模块调用编辑成功' : '模块调用新增成功');
            if (_.isFunction(hideModal)) {
                hideModal(true, !nodeId);
            }
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
            treeData,
        } = this.state;

        const {
            form: { getFieldDecorator, setFieldsValue },
            editData = {},
            systemId,
        } = this.props;

        const { nodeId,
            providerProgram, providerProgramId,
            programCallerSystem, programCallerSystemId,
            callerProgram, callerProgramId,
            businessId = '', business = '',
        } = editData;

        //初始化 提供方模块名称
        let initProviderProgram = { data: [], value: [] }
        if (providerProgramId) {
            initProviderProgram = {
                data: [{ text: providerProgram, value: providerProgramId }],
                value: [providerProgramId]
            }
        }

        //初始化 调用方应用系统
        let initProgramCallerSystem = { data: [], value: [] }
        if (programCallerSystemId) {
            initProgramCallerSystem = {
                data: [{ text: programCallerSystem, value: programCallerSystemId }],
                value: [programCallerSystemId]
            }
        }

        //初始化 调用方模块名称
        let initCallerProgram = { data: [], value: [] }
        if (callerProgramId) {
            initCallerProgram = {
                data: [{ text: callerProgram, value: callerProgramId }],
                value: [callerProgramId]
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
                title={nodeId ? '编辑模块调用' : '新增模块调用'}
                visible={true}
                onOk={this.handleOk}
                onCancel={this.handleCancel}
                width={800}
                className={styles.customModal}
                maskClosable={false}
            >
                <Spin spinning={loading}>
                    <div className={styles.programConsumeModalBody} >
                        <Form>
                            <Row>
                                {/* <Col style={{ marginBottom: '16px' }}><Alert message='基本属性' type='info' /></Col> */}
                                <Col span={spanLeft}>
                                    <FormItem label="调用方模块名称" {...formItemLayout}>
                                        {getFieldDecorator('providerProgramId', {
                                            rules: [{
                                                required: true,
                                                validator: (rule, value, callback) => {
                                                    if (_.isEmpty(value && value.value)) {
                                                        callback('请选择调用方模块名称!');
                                                    } else {
                                                        callback();
                                                    }
                                                }
                                            }],
                                            initialValue: initProviderProgram
                                        })
                                            (
                                                <SearchInput
                                                    placeholder='请选择调用方模块名称'
                                                    method='get'
                                                    attachParams={{ systemId, nodeType: 'program' }}
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
                                        {getFieldDecorator('programCallerSystemId', {
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
                                            initialValue: initProgramCallerSystem
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
                                                        this.setState({
                                                            selectId: value
                                                        })
                                                        setFieldsValue({
                                                            callerProgramId: { data: [], value: [] }
                                                        })
                                                    }}
                                                />
                                            )
                                        }
                                    </FormItem>
                                </Col>

                                <Col span={spanLeft}>
                                    <FormItem label="提供方模块名称" {...formItemLayout}>
                                        {getFieldDecorator('callerProgramId', {
                                            rules: [{
                                                required: true,
                                                validator: (rule, value, callback) => {
                                                    if (_.isEmpty(value && value.value)) {
                                                        callback('请选择提供方模块名称!');
                                                    } else {
                                                        callback();
                                                    }
                                                }
                                            }],
                                            initialValue: initCallerProgram
                                        })
                                            (
                                                <SearchInput
                                                    placeholder='请选择提供方模块名称'
                                                    method='get'
                                                    disabled={nodeId ? false : (this.state.selectId ? false : true)}
                                                    attachParams={{ systemId: (this.state.selectId ? this.state.selectId : programCallerSystemId), nodeType: 'program' }}
                                                    dataUrl={`${ContextPath}/cmdbCommon/getSelectList`}
                                                    forceOuterData={true}
                                                    allowClear={false}
                                                />
                                            )
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

                        </Form>
                    </div>
                </Spin>
            </Modal>
        );
    }
}


ProgramConsumeEdit = Form.create()(ProgramConsumeEdit)

export default connect()(ProgramConsumeEdit);