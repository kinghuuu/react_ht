import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import _ from 'lodash';
import { Row, Col, Modal, Form, Input, Radio, message, Spin, Alert, InputNumber, Tooltip, Icon, Button, TimePicker } from 'antd';
import { SearchInput } from '../../../components/searchinput/searchinput';
import { PlainSelector } from '../../../components/selector/selector';
import { ContextPath } from '../../../constants';
import { getSelfDefiningList, } from '../../../actions/selfDefining/action';
import {
    getSelfDefiningValue,
    createModel,
    updateModel,
    saveSelfDefiningValue,
} from '../../../actions/modelConfig/action';
import { DYNAMIC_PROPERTIES } from '../common';
import styles from '../index.module.less';
import SelectProcess from './selectProcess'

import { renderFormItems, getFormItemsValue } from '../../common/renderFormItems';
// console.log(renderFormItems)
const FormItem = Form.Item,
    RadioGroup = Radio.Group,
    spanLeft = 22, spanRight = 2,
    formItemLayout = {
        labelCol: { span: 4 },
        wrapperCol: { span: 20 }
    },
    initFixedPropertieList = [
        { propId: 'processName', propName: '进程名称', propValue: '' },
        { propId: 'port', propName: '端口', propValue: '' },
        { propId: 'programId', propName: '所属模块', propValue: '' },
        { propId: 'isMonitor', propName: '是否监控', propValue: '' },
        { propId: 'monitorProcName', propName: '监控进程名称', propValue: '' },
        { propId: 'monitorProcParam', propName: '监控进程参数', propValue: '' },
        { propId: 'monitorProcPath', propName: '监控进程路径', propValue: '' },
        { propId: 'tagName', propName: '监控tag标识', propValue: '' },
        { propId: 'tagValue', propName: '监控tag值', propValue: '' },
        { propId: 'monitorAlertReceiver', propName: '告警接收人', propValue: '' },
        { propId: 'portType', propName: '监控端口类型', propValue: '' },
        { propId: 'processNum', propName: '正常进程个数', propValue: '' },
        { propId: 'isSms', propName: '是否短信告警', propValue: '' },
        { propId: 'alertTime', propName: '告警时间段', propValue: '' },
        { propId: 'alertCalendar', propName: '告警日历', propValue: '' },
    ];
const timeReg = /^(([0,1]\d)|(2[0-3])):[0-5]\d$/;

class ProcessEdit extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isSyncTagName: _.isEmpty(props.editData),
            loading: false,
            fixedPropertieList: initFixedPropertieList,
            dynamicPropertieList: [],
            keys: [0],
            alertTimes: [],
        };
    }

    componentDidMount() {
        this.getSelfDefiningList()
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


            // 找到 programName 
            let { programId: { value: [programId], data }, isMonitor, monitorProcPath, monitorProcParam, monitorProcName, keys, alertTime } = values;
            let programName = data.find(item => item.value === programId).text;

            if (isMonitor === '01' && !(monitorProcPath || monitorProcParam || monitorProcName)) {
                message.warning('监控进程名称、参数、路径中，至少填一个');
                return
            }

            if (loading) {
                message.warning('请勿重复提交');
                return;
            }
            this.setState(() => ({ loading: true }));
            let alertTimes = keys.map(key => {
                let { start = '', end = '' } = alertTime[key] || {};
                if (moment.isMoment(start)) {
                    start = start.format('HH:mm');
                }
                if (moment.isMoment(end)) {
                    end = end.format('HH:mm');
                }

                let str = `${start}-${end}`;

                if (str === 'null-null') {
                    str = ''
                }
                return str
            })
            alertTimes = alertTimes.join(';');
            values.alertTime = alertTimes;

            let fixedProperties = _.map(initFixedPropertieList, item => {
                const { propId } = item;
                let propValue = values[propId];
                // 选择框
                if (_.isObject(propValue)) {
                    propValue = propValue.value.join(',')
                }
                return { propId, propValue };
            });

            let { dynamicProperties } = getFormItemsValue(values, dynamicPropertieList);
            let properties = { dynamicProperties, fixedProperties, programName };
            this.postData(properties);
        });
    }

    // 发送数据
    postData = (params) => {
        const { dispatch, hideModal, editData = {}, systemId, nodeType } = this.props;
        let { dynamicProperties, fixedProperties, programName = '' } = params;
        const { nodeId, monitorProcId } = editData;
        let isUpdate = !!nodeId;
        let times = moment().format('YYYY-MM-DD HH:mm:ss');
        const close = () => {
            this.setState(() => ({ loading: false }));
            message.success(nodeId ? '进程编辑成功' : '进程新增成功');
            if (_.isFunction(hideModal)) {
                hideModal(true, !nodeId);
            }
        }
        const processName = fixedProperties[0].propValue;
        const port = fixedProperties[1].propValue;
        const programId = fixedProperties[2].propValue;

        let _monitorProcId = {
            propId: 'monitorProcId'
        };
        if (isUpdate) {
            _monitorProcId.propValue = monitorProcId;
        } else {
            _monitorProcId.propValue = `${systemId}-mod-${programName}-proc-${processName}`
        }
        fixedProperties.push(_monitorProcId);


        let newParams = {
            nodeId, times,
            topoName: `${programId}|${processName}|${port}`,
            systemId, configItemType: nodeType,
            propertyValueDtoList: fixedProperties
        }


        let ecb = (error = '请求错误') => {
            this.setState(() => ({ loading: false }));
            message.error(error);
        }

        let action = createModel;
        if (isUpdate) {
            action = updateModel;
        }

        // console.log(newParams)
        // return

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

    updateProcess = (values={}) => {
        const {processName,processParams,processPath,processUser,ip} = values;
        const {form:{setFieldsValue}} = this.props;
        setFieldsValue({
            monitorProcName:processName,
            monitorProcParam:processParams,
            monitorProcPath:processPath,
        });

    }

    addKey = () => {
        const { form: { getFieldValue, setFieldsValue } } = this.props;
        let keys = getFieldValue('keys');
        let lastItem = _.last(keys);
        keys.push(lastItem + 1);
        setFieldsValue({ keys });
    }
    delKey = (key) => {
        const { form: { getFieldValue, setFieldsValue } } = this.props;
        let keys = getFieldValue('keys');
        keys = keys.filter(item => item !== key);
        setFieldsValue({ keys });
    }

    validatorTimes = (rule, value, callback) => {
        const { form: { getFieldValue } } = this.props;
        let { field } = rule;
        let [str1, str2] = field.split('[');
        let [index] = str2.split(']');

        let start = getFieldValue(`alertTime[${index}].start`)
        let end = getFieldValue(`alertTime[${index}].end`)

        if (start && end && !start.isBefore(end)) {
            callback('结束时间必须大于开始时间')
            return
        }
        callback()
    }


    render() {

        let {
            loading,
            dynamicPropertieList,
            isSyncTagName,
            keys,
            alertTimes,
        } = this.state;
        const {
            form,
            form: { getFieldDecorator, getFieldValue },
            editData = {},
            systemId, nodeType,
        } = this.props;

        let {
            nodeId,
            processName = '', programId, program, port = '', portType,
            isMonitor = '02', processNum = 1,
            monitorProcName = '', monitorProcParam = '', monitorProcPath = '',
            tagName = '', tagValue = '', monitorAlertReceiver = '', monitorAlertReceiverName, isSms = '01',
            alertCalendar = '', alertTime = '',
        } = editData;
        let initProgram = { data: [], value: [] };
        if (programId) {
            initProgram = {
                data: [{ text: program, value: programId }],
                value: [programId]
            }
        }

        let initMonitorAlertReceiver = { data: [], value: [] };
        if (monitorAlertReceiver) {
            let value = monitorAlertReceiver.split(',') || [],
                texts = monitorAlertReceiverName.split(',') || [],
                data = value.map((value, index) => {
                    return { text: texts[index] || '', value }
                });
            initMonitorAlertReceiver = { data, value }
        }

        let initAlertCalendar = [];
        if (alertCalendar) {
            initAlertCalendar = alertCalendar.split(',');
        }

        if (alertTime) {
            let arr = alertTime.split(';');
            keys = arr.map((item, index) => index);
            alertTimes = arr.map(item => {
                let [start = '', end = ''] = item.split('-');
                return { start, end }
            })
        }


        let height = window.document.body.offsetHeight * 0.6;

        let _isMonitor = getFieldValue('isMonitor');
        let _programId = getFieldValue('programId');
        if (_.isObject(_programId)) {
            _programId = _programId.value[0]
        }



        getFieldDecorator('keys', { initialValue: keys });
        let _keys = getFieldValue('keys');

        return (
            <Modal
                title={nodeId ? '编辑进程' : '新增进程'}
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
                                <Col style={{ marginBottom: '16px' }}><Alert message='基本属性' type='info' /></Col>

                                <Col span={spanLeft}>
                                    <FormItem label="所属模块" {...formItemLayout}>
                                        {getFieldDecorator('programId', {
                                            rules: [{
                                                required: true,
                                                validator: (rule, value, callback) => {
                                                    if (_.isEmpty(value && value.value)) {
                                                        callback('请选择所属模块!');
                                                    } else {
                                                        callback();
                                                    }
                                                }
                                            }],
                                            initialValue: initProgram
                                        })
                                            (
                                                <SearchInput
                                                    placeholder='请选择所属模块'
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
                                    <FormItem label="进程名称"  {...formItemLayout}>
                                        {getFieldDecorator('processName', {
                                            rules: [{ required: true, message: '请输入进程名称', }],
                                            initialValue: processName,
                                        })
                                            (<Input autoComplete='off' placeholder='请输入进程名称' />)
                                        }
                                    </FormItem>
                                </Col>
                                <Col span={2}>
                                    <SelectProcess programId={_programId} updateProcess={this.updateProcess} ></SelectProcess>
                                </Col>

                            </Row>

                            <Row>
                                <Col style={{ marginBottom: '16px' }}><Alert
                                    message={<span>监控属性 <em style={{ color: 'red', fontStyle: 'normal' }}>(详细采集指标与告警参数请至统一监控平台配置)</em></span>}
                                    type='info' />
                                </Col>

                                <Col span={spanLeft}>
                                    <FormItem label="是否监控"  {...formItemLayout}>
                                        {getFieldDecorator('isMonitor', {
                                            initialValue: isMonitor
                                        })
                                            (<RadioGroup>
                                                <Radio value={'01'}>是</Radio>
                                                <Radio value={'02'}>否</Radio>
                                            </RadioGroup>)
                                        }
                                    </FormItem>
                                </Col>
                                
                                <Col span={spanLeft}>
                                    <FormItem label="监控进程名称"  {...formItemLayout}>
                                        {getFieldDecorator('monitorProcName', {
                                            initialValue: monitorProcName
                                        })
                                            (<Input autoComplete='off' placeholder='请输入监控进程名称' />)
                                        }
                                    </FormItem>
                                </Col>
                                
                                <Col span={2}>
                                    <Tooltip placement="topRight" title='启动进程的程序，如 java' arrowPointAtCenter={true}>
                                        <Icon type='question-circle' theme='filled' style={{ fontSize: '24px', color: '#1890ff', float: 'left', margin: '8px 0 0 8px' }} />
                                    </Tooltip>
                                </Col>

                                <Col span={spanLeft}>
                                    <FormItem label="监控进程参数"  {...formItemLayout}>
                                        {getFieldDecorator('monitorProcParam', {
                                            initialValue: monitorProcParam
                                        })
                                            (<Input autoComplete='off' placeholder='请输入监控进程参数' />)
                                        }
                                    </FormItem>
                                </Col>
                                <Col span={2}>
                                    <Tooltip placement="topRight" title='进程启动时指定的启动参数，如 -config.json等' arrowPointAtCenter={true}>
                                        <Icon type='question-circle' theme='filled' style={{ fontSize: '24px', color: '#1890ff', float: 'left', margin: '8px 0 0 8px' }} />
                                    </Tooltip>
                                </Col>

                                <Col span={spanLeft}>
                                    <FormItem label="监控进程路径"  {...formItemLayout}>
                                        {getFieldDecorator('monitorProcPath', {
                                            initialValue: monitorProcPath
                                        })
                                            (<Input autoComplete='off' placeholder='请输入监控进程路径' />)
                                        }
                                    </FormItem>
                                </Col>
                                <Col span={2}>
                                    <Tooltip placement="topRight" title='执行该进程的工作目录(未必是可执行文件所在目录)' arrowPointAtCenter={true}>
                                        <Icon type='question-circle' theme='filled' style={{ fontSize: '24px', color: '#1890ff', float: 'left', margin: '8px 0 0 8px' }} />
                                    </Tooltip>
                                </Col>
                                <Col span={spanLeft}>
                                    <Row>
                                        <Col offset={4} style={{ color: 'red', height: '36px' }} >监控进程名称、参数、路径中，至少填一个</Col>
                                    </Row>
                                </Col>

                                <Col span={spanLeft}>
                                    <FormItem label="监控tag标识"  {...formItemLayout}>
                                        {getFieldDecorator('tagName', {
                                            initialValue: tagName,
                                            normalize: (value, prevValue, allValues) => {
                                                if (isSyncTagName && !prevValue) {
                                                    return 'processName'
                                                }
                                                return value
                                            }
                                        })
                                            (<Input autoComplete='off' placeholder='请输入监控tag标识' />)
                                        }
                                    </FormItem>
                                </Col>
                                <Col span={2}>
                                    <Tooltip placement="topRight" title='自定义的key，会添加到process.num的采集值中tag内，用于查询和配置告警（tag内容为k1=v1,k2=v2,...的形式）' arrowPointAtCenter={true}>
                                        <Icon type='question-circle' theme='filled' style={{ fontSize: '24px', color: '#1890ff', float: 'left', margin: '8px 0 0 8px' }} />
                                    </Tooltip>
                                </Col>

                                <Col span={spanLeft}>
                                    <FormItem label="监控tag值"  {...formItemLayout}>
                                        {getFieldDecorator('tagValue', {
                                            initialValue: tagValue,
                                            normalize: (value, prevValue, allValues) => {
                                                if (isSyncTagName) {
                                                    if (value !== prevValue) {
                                                        this.setState(() => ({ isSyncTagName: false }))
                                                        return value
                                                    }
                                                    return allValues.processName
                                                }
                                                return value
                                            }
                                        })
                                            (<Input autoComplete='off' placeholder='请输入监控tag值' />)
                                        }
                                    </FormItem>
                                </Col>
                                <Col span={2}>
                                    <Tooltip placement="topRight" title='自定义的value，会添加到process.num的采集值中tag内，用于查询和配置告警（tag内容为k1=v1,k2=v2,...的形式）' arrowPointAtCenter={true}>
                                        <Icon type='question-circle' theme='filled' style={{ fontSize: '24px', color: '#1890ff', float: 'left', margin: '8px 0 0 8px' }} />
                                    </Tooltip>
                                </Col>

                                <Col span={spanLeft}>
                                    <FormItem label="正常进程个数"  {...formItemLayout}>
                                        {getFieldDecorator('processNum', {
                                            rules: [{ required: _isMonitor === '01', message: '请输入进程名称', }],
                                            initialValue: processNum
                                        })
                                            (<InputNumber style={{ width: '100%' }} min={1} step={1} placeholder='请输入正常进程个数' />)
                                        }
                                    </FormItem>
                                </Col>

                                <Col span={spanLeft} >
                                    <FormItem label="监控端口类型" {...formItemLayout}>
                                        {getFieldDecorator('portType', {
                                            initialValue: {
                                                data: [],
                                                value: [],
                                            }
                                        })
                                            (
                                                <PlainSelector
                                                    allowClear={false}
                                                    placeholder='请选择监控端口类型'
                                                    method='get'
                                                    params={{ param: 'portType' }}
                                                    dataUrl={`${ContextPath}/cmdbCommon/getParameterList`}
                                                    selectFirstData={!nodeId}
                                                    selectedValue={[portType]}
                                                />
                                            )
                                        }
                                    </FormItem>
                                </Col>

                                <Col span={spanLeft}>
                                    <Row>
                                        <Col offset={4} style={{ color: 'red', height: '36px' }} >暂不支持UDP协议类型的端口监控</Col>
                                    </Row>
                                </Col>

                                <Col span={spanLeft}>
                                    <FormItem label="监控端口" {...formItemLayout}>
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
                                    <FormItem label="告警接收人"  {...formItemLayout}>
                                        {getFieldDecorator('monitorAlertReceiver', {
                                            rules: [{
                                                required: _isMonitor === '01',
                                                validator: (rule, value, callback) => {
                                                    // console.log(rule, _isMonitor, value.value)
                                                    if (rule.required && _.isEmpty(value && value.value)) {
                                                        callback('请选择告警接收人!');
                                                        return
                                                    }
                                                    callback();
                                                }
                                            }],
                                            initialValue: initMonitorAlertReceiver
                                        })
                                            (
                                                <SearchInput
                                                    placeholder='请选择告警接收人'
                                                    method='get'
                                                    queryName='keyword'
                                                    dataUrl={`${ContextPath}/cmdbCommon/getUserInfo`}
                                                    forceOuterData={true}
                                                    allowClear={false}
                                                    mode='multiple'
                                                />
                                            )
                                        }
                                    </FormItem>
                                </Col>

                                <Col span={spanLeft} >
                                    <FormItem label="告警日历" {...formItemLayout}>
                                        {getFieldDecorator('alertCalendar', {
                                            initialValue: {
                                                data: [],
                                                value: [],
                                            }
                                        })
                                            (
                                                <PlainSelector
                                                    allowClear={false}
                                                    placeholder='请选择告警日历'
                                                    method='get'
                                                    params={{ param: 'alarmCalendar' }}
                                                    dataUrl={`${ContextPath}/cmdbCommon/getParameterList`}
                                                    mode='multiple'
                                                    // selectFirstData={!nodeId}
                                                    selectedValue={initAlertCalendar}
                                                />
                                            )
                                        }
                                    </FormItem>
                                </Col>


                                {_.map(_keys, (key, index) => {
                                    const { start = '', end = '' } = alertTimes[key] || {};
                                    return (<div key={key}>
                                        <Col span={spanLeft}>
                                            <Row>
                                                <Col span={4} style={{ lineHeight: '38px', textAlign: 'right', padding: '0 4px' }}>{index === 0 ? '告警时间段:' : ''}</Col>
                                                <Col span={20}>
                                                    <Row>
                                                        <Col span={11}>
                                                            <FormItem>
                                                                {getFieldDecorator(`alertTime[${key}].start`, {
                                                                    rules: [{
                                                                        validator: this.validatorTimes
                                                                    }],
                                                                    initialValue: start ? moment(start, 'HH:mm') : null
                                                                })
                                                                    (<TimePicker placeholder='请选择开始时间' style={{ width: '100%' }} format={'HH:mm'} />)
                                                                }
                                                            </FormItem>
                                                        </Col>
                                                        <Col span={2} style={{ lineHeight: '38px', textAlign: 'center' }}>-</Col>
                                                        <Col span={11}>
                                                            <FormItem>
                                                                {getFieldDecorator(`alertTime[${key}].end`, {
                                                                    rules: [{
                                                                        validator: this.validatorTimes
                                                                    }],
                                                                    initialValue: end ? moment(end, 'HH:mm') : null
                                                                })
                                                                    (<TimePicker placeholder='请选择结束时间' style={{ width: '100%' }} format={'HH:mm'} />)
                                                                }
                                                            </FormItem>
                                                        </Col>
                                                    </Row>
                                                </Col>
                                            </Row>
                                        </Col>
                                        <Col span={spanRight}>
                                            {index === 0 ?
                                                (
                                                    <Button
                                                        type='primary'
                                                        icon='plus'
                                                        size='small'
                                                        style={{ marginLeft: '16px', background: '#87d068', borderColor: '#87d068', marginTop: '8px' }}
                                                        onClick={this.addKey}
                                                    ></Button>
                                                ) : (
                                                    <Button
                                                        type='danger'
                                                        icon='close'
                                                        size='small'
                                                        style={{ marginLeft: '16px', marginTop: '8px' }}
                                                        onClick={this.delKey.bind(this, key)}
                                                    ></Button>
                                                )
                                            }
                                        </Col>
                                    </div>);
                                })}

                                <Col span={spanLeft}>
                                    <FormItem label="是否短信告警"  {...formItemLayout}>
                                        {getFieldDecorator('isSms', {
                                            initialValue: isSms
                                        })
                                            (<RadioGroup>
                                                <Radio value={'01'}>是</Radio>
                                                <Radio value={'02'}>否</Radio>
                                            </RadioGroup>)
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

ProcessEdit = Form.create()(ProcessEdit)

export default connect()(ProcessEdit);