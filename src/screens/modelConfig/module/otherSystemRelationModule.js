import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import _ from 'lodash';
import { Row, Col, Modal, Form, message, Button, Spin, Input } from 'antd';
import { PlainSelector } from '../../../components/selector/selector';
import { SearchInput } from '../../../components/searchinput/searchinput';
import { saveAssetByIpAndSysId } from '../../../actions/modelConfig/action';
import { ContextPath } from '../../../constants';
import { STATION_STATUS } from '../../common/commonData';

const FormItem = Form.Item,
    formItemLayout = {
        labelCol: { span: 8 },
        wrapperCol: { span: 16 }
    },
    reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;


class OtherSystemRelationModule extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isShow: false,
            loading: false,
            keys: [0],
            programIds: [],
            states: []
        };
    }

    // 确定
    handleOk = (e) => {
        e.preventDefault();
        const { loading } = this.state;
        const { form: { validateFields }, systemId, editData = {}, useStatusName, arrangementStatus } = this.props;
        validateFields((err, values) => {
            if (err) {
                return;
            }
            this.setState(() => ({ loading: true }));
            let { programIds, states, keys, ip, querySysId } = values;
            let times = moment().format('YYYY-MM-DD HH:mm:ss');
            let dependProgram = _.map(keys, key => {
                let programId = programIds[key];
                let state = states[key];
                programId = programId.value[0];
                state = state.value[0];
                return `${programId},${state}`;
            });
            querySysId = querySysId.value[0];
            let dependProgramValue = dependProgram.join('|');
            let params = {
                querySysId,
                sysId: systemId,
                ip,
                times,
                dependProgram: dependProgramValue
            }
            this.postData(params);
        });
    }

    // 发送数据
    postData = (params) => {
        const { dispatch, getResourceInfo } = this.props;
        dispatch(saveAssetByIpAndSysId(params, result => {
            this.setState(() => ({
                loading: false,
                isShow: false,
                keys: [0],
                programIds: [],
                states: []
            }));
            message.success('模块关联成功');
            this.props.form.resetFields();
            if (_.isFunction(getResourceInfo)) {
                getResourceInfo()
            }
        }, (error = '模块关联失败') => {
            this.setState(() => ({ loading: false }));
            message.error(error);
        }));
    }

    // 取消
    handleCancel = () => {
        this.setState(() => ({
            isShow: false,
            keys: [0],
            programIds: [],
            states: []
        }))
        this.props.form.resetFields();
    }

    addKey = () => {
        const { form: { getFieldValue, setFieldsValue } } = this.props;
        let keys = getFieldValue('keys');
        let lastItem = _.last(keys);
        if (lastItem === undefined) {
            lastItem = -1
        }
        keys.push(lastItem + 1);
        setFieldsValue({ keys });
        // this.setState(() => ({ programIds: [], states: [] }));
    }
    delKey = (key) => {
        const { form: { getFieldValue, setFieldsValue } } = this.props;
        const { programIds, states } = this.state;
        let keys = getFieldValue('keys');
        keys = keys.filter(item => item !== key);
        setFieldsValue({ keys });
        if (programIds[key]) {
            programIds[key] = null;
            states[key] = null;
            this.setState(() => ({ programIds, states }));
        }
    }

    validatorProgram = (rule, value, callback) => {
        const { fullField } = rule;
        const { form: { getFieldsValue } } = this.props;
        let programIds = getFieldsValue() || {};
        programIds = programIds.programIds;

        if (_.isEmpty(value) || _.isEmpty(value.value)) {
            callback('关联模块不能为空');
            return
        }

        let isSome = false, isEmpty = false;
        _.forEach(programIds, (item, index) => {
            if (`programIds[${index}]` !== fullField && item && _.isEqual(item.value, value.value)) {
                isSome = true
            }
        });
        if (isSome) {
            callback('关联模块不能重复');
            return
        }
        callback();
    }

    handleShow = () => {
        this.setState(() => ({ isShow: true }))
    }

    render() {

        const { isShow, loading, keys, programIds, states } = this.state;
        const {
            form: { getFieldDecorator, getFieldValue },
            systemId,
        } = this.props;

        getFieldDecorator('keys', { initialValue: keys });
        let _keys = getFieldValue('keys');

        return (<Fragment>

            <Button onClick={this.handleShow} type='primary'>关联其他应用系统主机</Button>

            {isShow ? (
                <Modal
                    title='关联其他应用系统主机'
                    visible={true}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                    width={760}
                    maskClosable={false}
                    destroyOnClose={true}
                >
                    <Spin spinning={loading}>
                        <Form>
                            <Row>
                                <Col span={10}>
                                    <FormItem label="其他应用系统" {...formItemLayout}>
                                        {getFieldDecorator(`querySysId`, {
                                            rules: [
                                                {
                                                    required: true,
                                                    validator: (rule, value, callback) => {
                                                        // console.log(_.isEmpty(value) && _.isEmpty(value.value))
                                                        if (_.isEmpty(value) ||  _.isEmpty(value.value)) {
                                                            callback(`应用系统不能为空`);
                                                        } else {
                                                            callback();
                                                        }
                                                    }
                                                }
                                            ],
                                            initialValue: { data: [], value: [] }
                                        })
                                            (
                                                <SearchInput
                                                    method='get'
                                                    placeholder='请选择应用系统'
                                                    queryName='systemName'
                                                    dataUrl={`${ContextPath}/cmdb/querySystemFuzzy`}
                                                    forceOuterData={true}
                                                    allowClear={false}
                                                />
                                            )
                                        }
                                    </FormItem>
                                </Col>

                                <Col span={10}  offset={1}>
                                    <FormItem label="其他应用系统IP" {...formItemLayout}>
                                        {getFieldDecorator(`ip`, {
                                            rules: [
                                                { required: true, message: '请输入IP地址!' },
                                                { pattern: reg, message: '正确的IP格式为 1.1.1.1' }
                                            ],
                                            initialValue: ''
                                        })
                                            (
                                                <Input autoComplete='off' placeholder='请输入其他应用系统IP' />
                                            )
                                        }
                                    </FormItem>
                                </Col>

                            </Row>

                            {_.map(_keys, (key, index) => {
                                const initProgramId = programIds[key] || { data: [], value: [] };
                                const initState = states[key] || ['01'];
                                return (<Row key={key}>
                                    <Col span={10}>
                                        <FormItem label="本系统模块" {...formItemLayout}>
                                            {getFieldDecorator(`programIds[${key}]`, {
                                                rules: [
                                                    {
                                                        required: true,
                                                        // validator: this.validatorProgram.bind(this, key)
                                                        validator: this.validatorProgram
                                                    }
                                                ],
                                                initialValue: initProgramId
                                            })
                                                (
                                                    <SearchInput
                                                        method='get'
                                                        placeholder='请选择要关联的模块'
                                                        attachParams={{ systemId, nodeType: 'program' }}
                                                        dataUrl={`${ContextPath}/cmdbCommon/getSelectList`}
                                                        forceOuterData={true}
                                                        allowClear={false}
                                                    />
                                                )
                                            }
                                        </FormItem>
                                    </Col>
                                    <Col span={10} offset={1} >
                                        <FormItem label="部署状态" {...formItemLayout}>
                                            {getFieldDecorator(`states[${key}]`, {
                                                initialValue: {
                                                    data: STATION_STATUS,
                                                    value: initState,
                                                }
                                            })
                                                (
                                                    <PlainSelector
                                                        forceOuterData={true}
                                                        allowClear={false}
                                                        placeholder='请选择部署状态'
                                                    />
                                                )
                                            }
                                        </FormItem>
                                    </Col>
                                    <Col span={2}>
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
                                </Row>)
                            })}
                        </Form>
                    </Spin>
                </Modal>
            ) : null}
        </Fragment>);
    }
}

OtherSystemRelationModule = Form.create()(OtherSystemRelationModule)

export default connect()(OtherSystemRelationModule);