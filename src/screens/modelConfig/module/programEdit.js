import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import _ from 'lodash';
import { Row, Col, Alert, Modal, Form, Input, message, Spin, DatePicker, Collapse, TreeSelect } from 'antd';
import { ContextPath } from '../../../constants';
import { PlainSelector } from '../../../components/selector/selector';
import { getSelfDefiningList } from '../../../actions/selfDefining/action';
import {
    getRelationValue,
    getSelfDefiningValue,
    createModel,
    updateModel,
    saveSelfDefiningValue,
    saveRelationValue,
} from '../../../actions/modelConfig/action';
import { renderFormItems, getFormItemsValue } from '../../common/renderFormItems';
import { DYNAMIC_PROPERTIES, RELATION_PROPERTIES } from '../common';
import styles from '../index.module.less';

const { Panel } = Collapse,
    FormItem = Form.Item,
    spanLeft = 22,
    formItemLayout = {
        labelCol: { span: 4 },
        wrapperCol: { span: 20 }
    },
    initFixedPropertieList = [
        { propId: 'moduleName', propName: '模块名称', propValue: '' },
        { propId: 'moduleType', propName: '模块类型', propValue: '' },
        { propId: 'moduleVersion', propName: '模块版本', propValue: '', },
        { propId: 'lastUpTime', propName: '最近一次上线时间', propValue: '', },
        { propId: 'clusteredType', propName: '集群类型', propValue: '', },
        { propId: 'path', propName: '部署路径', propValue: '', },
        { propId: 'port', propName: '端口', propValue: '', },
        { propId: 'deployAccount', propName: '部署账户', propValue: '', },
        { propId: 'description', propName: '描述信息', propValue: '', },
    ];

class ProgramEdit extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            fixedPropertieList: initFixedPropertieList,
            dynamicPropertieList: [],
            relationPropertieList: [],
        };
    }

    // 确定
    handleOk = (e) => {
        e.preventDefault();
        const { loading, dynamicPropertieList, relationPropertieList } = this.state;
        const { form: { validateFields } } = this.props;
        validateFields((err, values) => {
            // console.log(values)
            // return
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
                // 日期
                if (moment.isMoment(propValue)) {
                    propValue = propValue.format('YYYY-MM-DD')
                }
                // 选择框
                if (_.isObject(propValue)) {
                    propValue = propValue.value[0]
                }
                return { propId, propValue };
            });

            let { dynamicProperties, relationProperties } = getFormItemsValue(values, dynamicPropertieList, relationPropertieList);
            let properties = { dynamicProperties, relationProperties, fixedProperties };
            // console.log(properties)
            // return
            this.postData(properties)
        });
    }

    // 发送数据
    postData = (params) => {
        const { dispatch, hideModal, editData = {}, systemId, nodeType } = this.props;
        const { dynamicProperties, relationProperties, fixedProperties } = params;
        const { nodeId } = editData;
        let times = moment().format('YYYY-MM-DD HH:mm:ss');
        const close = () => {
            this.setState(() => ({ loading: false }));
            message.success(nodeId ? '可执行模块编辑成功' : '可执行模块新增成功');
            if (_.isFunction(hideModal)) {
                hideModal(true, !nodeId);
            }
        }
        const moduleName = fixedProperties[0].propValue;
        let newParams = {
            times,
            nodeId,
            topoName: moduleName,
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
            let count = 0;
            let saveSelfDefiningParams = {
                systemId, nodeType, times,
                nodeId: isUpdate ? nodeId : resultId,
                propertyDetailList: dynamicProperties
            }

            relationProperties.forEach(item => {
                item.times = times;
                item.systemId = systemId;
                item.parentId = isUpdate ? nodeId : resultId;
                item.programName = moduleName;
            });

            dispatch(saveSelfDefiningValue(saveSelfDefiningParams, res => {
                count++;
                if (count === 2) {
                    close()
                }
            }, ecb));

            dispatch(saveRelationValue(relationProperties, res => {
                count++;
                if (count === 2) {
                    close()
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

    componentDidMount() {
        this.getSelfDefiningList()
        this.getRelationList();
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

    getRelationList = () => {
        const { dispatch, editData = {} } = this.props;
        let parentId = '0';
        if (editData.nodeId) {
            parentId = editData.nodeId;
        }
        dispatch(getRelationValue({ parentId }, (res = { rows: [] }) => {
            this.setState(() => ({ relationPropertieList: res.rows }));
        }));
    }

    validatorModuleName = (rule, value, callback) => {
        let reg = /[ '":：“”]/;
        if (reg.test(value)) {
            callback('模块名称不能包含空格、单引号、双引号、冒号')
            return
        }
        callback()
    }

    render() {
        const {
            loading,
            dynamicPropertieList,
            relationPropertieList,
        } = this.state;
        const {
            form, form: { getFieldDecorator },
            editData = {},
            systemId,
        } = this.props;

        let height = window.document.body.offsetHeight * 0.6;

        const {
            nodeId,
            moduleName = '',
            moduleType,
            moduleVersion = '',
            lastUpTime = null,
            clusteredType,
            path = '',
            port = '',
            deployAccount = '',
            description = ''
        } = editData;


        return (
            <Modal
                title={nodeId ? '编辑可执行模块' : '新增可执行模块'}
                visible={true}
                onOk={this.handleOk}
                onCancel={this.handleCancel}
                width={800}
                className={styles.customModal}
                maskClosable={false}
            >
                <Spin spinning={loading}>
                    <div className={styles.customModalBody} style={{ maxHeight: `${height}px`, height: 'auto' }} >
                        <Form>
                            <Row>
                                {_.isEmpty(dynamicPropertieList) && _.isEmpty(relationPropertieList) ? null : (
                                    <Col style={{ marginBottom: '16px' }}><Alert message='基本信息' type='info' /></Col>
                                )}

                                <Col span={spanLeft} >
                                    <FormItem label="模块名称" {...formItemLayout}>
                                        {getFieldDecorator('moduleName', {
                                            rules: [
                                                { required: true, message: '请输入模块名称' },
                                                { validator: this.validatorModuleName }
                                            ],
                                            initialValue: moduleName
                                        })
                                            (<Input autoComplete='off' />)
                                        }
                                    </FormItem>
                                </Col>

                                <Col span={spanLeft} >
                                    <FormItem label="模块类型" {...formItemLayout}>
                                        {getFieldDecorator('moduleType', {
                                            rules: [{
                                                required: true,
                                                validator: (rule, value, callback) => {
                                                    if (_.isEmpty(value && value.value)) {
                                                        callback('请选择模块类型!');
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
                                                    allowClear={false}
                                                    placeholder='请选择模块类型'
                                                    method='get'
                                                    params={{ param: 'programModuleType' }}
                                                    dataUrl={`${ContextPath}/cmdbCommon/getParameterList`}
                                                    selectFirstData={!nodeId}
                                                    selectedValue={[moduleType]}
                                                />
                                            )
                                        }
                                    </FormItem>
                                </Col>

                                <Col span={spanLeft}>
                                    <FormItem label="模块版本" {...formItemLayout}>
                                        {getFieldDecorator('moduleVersion', {
                                            initialValue: moduleVersion
                                        })
                                            (<Input autoComplete='off' />)
                                        }
                                    </FormItem>
                                </Col>

                                <Col span={spanLeft}>
                                    <FormItem label='最近一次上线时间' {...formItemLayout}>
                                        {getFieldDecorator('lastUpTime', {
                                            initialValue: lastUpTime ? moment(lastUpTime, 'YYYY-MM-DD') : null
                                        })
                                            (<DatePicker
                                                allowClear={false}
                                                placeholder='请选择最近一次上线时间'
                                                style={{ width: '100%', minWidth: '100px' }}
                                            />)
                                        }
                                    </FormItem>
                                </Col>

                                <Col span={spanLeft}>
                                    <FormItem label='集群类型' {...formItemLayout}>
                                        {getFieldDecorator('clusteredType', {
                                            rules: [{
                                                required: true,
                                                validator: (rule, value, callback) => {
                                                    if (_.isEmpty(value && value.value)) {
                                                        callback('请选择集群类型!');
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
                                                    placeholder='请选择模块类型'
                                                    method='get'
                                                    params={{ param: 'programClusteredType' }}
                                                    dataUrl={`${ContextPath}/cmdbCommon/getParameterList`}
                                                    selectFirstData={!nodeId}
                                                    selectedValue={clusteredType ? [clusteredType] : []}
                                                // selectFirstData={serveTypeValue.length === 0}
                                                // selectedValue={serveTypeValue}
                                                // disabled={isLook}
                                                />
                                            )
                                        }
                                    </FormItem>
                                </Col>

                                <Col span={spanLeft}>
                                    <FormItem label="部署路径" {...formItemLayout}>
                                        {getFieldDecorator('path', {
                                            // rules: [{ required: true, message: '请输入部署路径' }],
                                            initialValue: path
                                        })
                                            (<Input autoComplete='off' />)
                                        }
                                    </FormItem>
                                </Col>

                                <Col span={spanLeft}>
                                    <FormItem label="端口" {...formItemLayout}>
                                        {getFieldDecorator('port', {
                                            initialValue: port,
                                            rules: [{
                                                validator(rule, value, callback) {
                                                    if (value) {
                                                        let valueItem = value.split(',');
                                                        _.map(valueItem, (item) => {
                                                            if (Number(item) < 0 || Number(item) > 65536 || isNaN(Number(item))) {
                                                                callback('端口范围值为0 ~ 65536')
                                                                return
                                                            }
                                                        })
                                                    }
                                                    callback()
                                                }
                                            }],
                                        })
                                            (<Input placeholder='多个端口请用英文逗号隔开' autoComplete='off' />)
                                        }
                                    </FormItem>
                                </Col>

                                <Col span={spanLeft}>
                                    <FormItem label="部署账户" {...formItemLayout}>
                                        {getFieldDecorator('deployAccount', {
                                            // rules: [{ required: true, message: '请输入部署账户' }],
                                            initialValue: deployAccount
                                        })
                                            (<Input autoComplete='off' placeholder='请输入部署账户' />)
                                        }
                                    </FormItem>
                                </Col>

                                
                                <Col span={spanLeft}>
                                    <FormItem label="描述信息" {...formItemLayout}>
                                        {getFieldDecorator('description', {
                                            // rules: [{ required: true, message: '请选择描述信息' }],
                                            initialValue: description
                                        })
                                            (
                                                <Input.TextArea rows={3} autoComplete='off' placeholder='请输入描述信息' />
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

                            {_.isEmpty(relationPropertieList) ? null : (
                                <Row>
                                    <Col style={{ marginBottom: '16px' }}><Alert message='联动属性信息' type='info' /></Col>
                                    <Col>
                                        <Collapse bordered={false} className={styles.customCollapse}>
                                            {_.map(relationPropertieList, (item = {}, index) => {
                                                const { nodeId, nodeType, propertyDetailList } = item;
                                                return (<Panel header={nodeType} key={`eidttemplate-${nodeType}-${index}`}>
                                                    {nodeType === '日志联动属性' ? (<Row>
                                                        <Col span={20} style={{ color: 'red', marginBottom: '16px' }} offset={2} >
                                                            应用首次接入日志，请联系日志分析系统管理员（周东杰013563）；<br></br >
                                                            该模块日志格式若与已接入模块不同，请联系日志分析系统管理员（周东杰013563）。
                                                        </Col>
                                                    </Row>) : null}
                                                    <Row>
                                                        {renderFormItems({
                                                            prefix: `${RELATION_PROPERTIES}-${nodeId || index}`,
                                                            list: propertyDetailList,
                                                            form, formItemLayout,
                                                            systemId
                                                        })}
                                                    </Row>
                                                </Panel>)
                                            })}
                                        </Collapse>
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

ProgramEdit = Form.create()(ProgramEdit)

export default connect()(ProgramEdit);