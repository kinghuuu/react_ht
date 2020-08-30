import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import _ from 'lodash';
import { Row, Col, Modal, Form, Input, message, Spin, Button, InputNumber } from 'antd';
import { ContextPath } from '../../../constants';
import { PlainSelector } from '../../../components/selector/selector';
import { SearchInput } from '../../../components/searchinput/searchinput';
import {
    createModel,
    updateModel,
} from '../../../actions/modelConfig/action';
import styles from '../index.module.less';
import { DATA_BASE_TYPES, DISASTE_AREAS } from '../common';


const reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;

const FormItem = Form.Item,
    formItemLayout = {
        labelCol: { span: 4 },
        wrapperCol: { span: 16 }
    };

class DatabaseEdit extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            keys: [0],
            zbValues: [],
        };
    }

    // 确定
    handleOk = (e) => {
        e.preventDefault();
        const { loading } = this.state;
        const { form: { validateFields } } = this.props;
        validateFields((err, values) => {
            if (err) {
                return;
            }
            if (loading) {
                message.warning('请勿重复提交');
            }
            this.setState(() => ({ loading: true }));

            let {
                dataBaseType,
                masterIp,
                masterPort,
                masterServer = '',
                maxConnectionNum = '',
                DBA = '', keys, disaster } = values;
            dataBaseType = dataBaseType.value[0];
            let DBAStr = DBA.value.join(',');
            let disasterArr = keys.map(key => {
                let data = disaster[key] || {};
                let { type, ip = '', port = '', name = '' } = data;
                type = type.value[0] || '';
                let str = `${type},${ip}:${port}/${name}`;
                if (str === ',:/') {
                    return ''
                }
                return str;
            });
            let disasterStr = disasterArr.join(';')

            let propertyValueDtoList = [
                { propId: 'dataBaseType', propValue: dataBaseType },
                { propId: 'masterIp', propValue: masterIp },
                { propId: 'masterPort', propValue: masterPort },
                { propId: 'DBA', propValue: DBAStr },
                { propId: 'maxConnectionNum', propValue: maxConnectionNum },
                { propId: 'masterServer', propValue: masterServer },
                { propId: 'disaster', propValue: disasterStr },
            ];
            this.postData(propertyValueDtoList, { dataBaseType, masterIp, masterPort })
        });
    }

    // 发送数据
    postData = (propertyValueDtoList, { dataBaseType, masterIp, masterPort }) => {
        const { dispatch, hideEditModal, editData = {}, systemId, nodeType } = this.props;
        const { nodeId = '' } = editData;
        let times = moment().format('YYYY-MM-DD HH:mm:ss');
        const close = () => {
            this.setState(() => ({ loading: false }));
            message.success(nodeId ? '数据库编辑成功' : '数据库新增成功');
            if (_.isFunction(hideEditModal)) {
                hideEditModal(true, !nodeId);
            }
        }
        let topoName = `${masterIp}:${masterPort}`;

        if (dataBaseType === 'oracle') {
            topoName += `/${dataBaseType}`
        }
        let newParams = {
            times,
            nodeId,
            topoName,
            systemId, configItemType: nodeType,
            propertyValueDtoList
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
            close();
        }, ecb));
    }

    // 取消
    handleCancel = () => {
        const { hideEditModal } = this.props;
        if (_.isFunction(hideEditModal)) {
            hideEditModal(false);
        }
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
        const { programIds, states } = this.state;
        let keys = getFieldValue('keys');
        keys = keys.filter(item => item !== key);
        setFieldsValue({ keys });
    }

    render() {
        let { loading, keys, zbValues, } = this.state;
        const { form: { getFieldDecorator, getFieldValue }, editData = {}, } = this.props;

        let height = window.document.body.offsetHeight * 0.6;

        const {
            dataBaseType = 'mysql',
            masterIp = '',
            masterPort = '',
            masterServer,
            maxConnectionNum,
            dba, dbaname,
            nodeId,
            disaster,
        } = editData;



        let initDBA = { data: [], value: [] };
        if (dba) {
            let value = dba.split(',');
            let dbanameArr = dbaname.split(',');
            let data = dbanameArr.map((text, index) => {
                return { text, value: value[index] }
            })
            initDBA = { data, value };
        }

        if (disaster) {
            zbValues = disaster.split(';')
            keys = zbValues.map((item, index) => index);
            zbValues = zbValues.map(item => {
                let [type, str1] = item.split(',');
                let [ip, str2] = str1.split(':');
                let [port, name] = str2.split('/');
                return { type, ip, port, name };
            })
        }

        getFieldDecorator('keys', { initialValue: keys });
        let _keys = getFieldValue('keys');

        return (
            <Modal
                title={nodeId ? '编辑数据库' : '新增数据库'}
                visible={true}
                onOk={this.handleOk}
                onCancel={this.handleCancel}
                width={1000}
                className={styles.customModal}
                maskClosable={false}
                destroyOnClose={true}
            >
                <Spin spinning={loading}>
                    <div className={styles.customModalBody} style={{ maxHeight: `${height}px`, height: 'auto' }} >
                        <Form>
                            <Row>
                                {/* {_.isEmpty(dynamicPropertieList) && _.isEmpty(relationPropertieList) ? null : (
                                    <Col style={{ marginBottom: '16px' }}><Alert message='基本信息' type='info' /></Col>
                                )} */}

                                <Col>
                                    <FormItem label='数据库类型' {...formItemLayout}>
                                        {getFieldDecorator('dataBaseType', {
                                            rules: [{
                                                required: true,
                                                validator: (rule, value, callback) => {
                                                    if (_.isEmpty(value && value.value)) {
                                                        callback('请选择数据库类型!');
                                                    } else {
                                                        callback();
                                                    }
                                                }
                                            }],
                                            initialValue: {
                                                data: DATA_BASE_TYPES,
                                                value: [dataBaseType],
                                            }
                                        })
                                            (
                                                <PlainSelector
                                                    allowClear={false}
                                                    forceOuterData={true}
                                                    placeholder='请选择数据库类型!'
                                                />
                                            )
                                        }
                                    </FormItem>
                                </Col>

                                <Col >
                                    <FormItem label='主库IP' {...formItemLayout}>
                                        {getFieldDecorator('masterIp', {
                                            rules: [
                                                { required: true, message: '请输入IP地址!' },
                                                { pattern: reg, message: '正确的IP格式为 1.1.1.1' }
                                            ],
                                            initialValue: masterIp
                                        })
                                            (<Input placeholder='请输入主库IP' autoComplete='off' />)
                                        }
                                    </FormItem>
                                </Col>

                                <Col>
                                    <FormItem label='主库端口' {...formItemLayout}>
                                        {getFieldDecorator('masterPort', {
                                            initialValue: masterPort,
                                            rules: [{
                                                required: true,
                                                validator(rule, value, callback) {
                                                    if (value) {
                                                        if (Number(value) < 0 || Number(value) > 65536 || isNaN(Number(value))) {
                                                            callback('端口范围值为0 ~ 65536')
                                                            return
                                                        }
                                                    }
                                                    callback()
                                                }
                                            }],
                                        })
                                            (<Input placeholder='请输入主库端口' autoComplete='off' />)
                                        }
                                    </FormItem>
                                </Col>

                                <Col>
                                    <FormItem label='主库服务名' {...formItemLayout}>
                                        {getFieldDecorator('masterServer', {
                                            initialValue: masterServer
                                        })
                                            (<Input placeholder='请输入主库服务名' autoComplete='off' />)
                                        }
                                    </FormItem>
                                </Col>

                                <Col>
                                    <FormItem label='最大连接数' {...formItemLayout}>
                                        {getFieldDecorator('maxConnectionNum', {
                                            initialValue: maxConnectionNum
                                        })
                                            (<InputNumber style={{ width: '100%' }} placeholder='请输入最大连接数' min={0} step={1} />)
                                        }
                                    </FormItem>
                                </Col>

                                <Col>
                                    <FormItem label='DBA'  {...formItemLayout}>
                                        {getFieldDecorator('DBA', {
                                            rules: [{
                                                required: true,
                                                validator: (rule, value, callback) => {
                                                    if (_.isEmpty(value && value.value)) {
                                                        callback('请选择数据库类型!');
                                                    } else {
                                                        callback();
                                                    }
                                                }
                                            }],
                                            initialValue: initDBA
                                        })
                                            (
                                                <SearchInput
                                                    placeholder='请选择DBA'
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


                                {_.map(_keys, (key, index) => {
                                    const data = zbValues[key] || {};
                                    const { type, ip, port, name } = data;
                                    return (<Row key={key} gutter={8}>
                                        <Col style={{ textAlign: 'right', lineHeight: '38px' }} span={4}>{index === 0 ? '灾备库:' : ''}</Col>
                                        <Col span={4}>
                                            <FormItem>
                                                {getFieldDecorator(`disaster[${key}].type`, {
                                                    // rules: [{
                                                    //     required: true,
                                                    //     validator: (rule, value, callback) => {
                                                    //         if (_.isEmpty(value && value.value)) {
                                                    //             callback('请选择数据库类型!');
                                                    //         } else {
                                                    //             callback();
                                                    //         }
                                                    //     }
                                                    // }],
                                                    initialValue: {
                                                        data: DISASTE_AREAS,
                                                        value: type ? [type] : [],
                                                    }
                                                })
                                                    (
                                                        <PlainSelector
                                                            allowClear={false}
                                                            forceOuterData={true}
                                                            placeholder='请选择灾备库类型'
                                                        />
                                                    )
                                                }
                                            </FormItem>
                                        </Col>
                                        <Col span={4}>
                                            <FormItem >
                                                {getFieldDecorator(`disaster[${key}].ip`, {
                                                    rules: [
                                                        // { required: true, message: '请输入灾备库IP!' },
                                                        { pattern: reg, message: '正确的IP格式为 1.1.1.1' }
                                                    ],
                                                    initialValue: ip
                                                })
                                                    (
                                                        <Input autoComplete='off' placeholder='请输入灾备库IP' />
                                                    )
                                                }
                                            </FormItem>
                                        </Col>
                                        <Col span={4}>
                                            <FormItem>
                                                {getFieldDecorator(`disaster[${key}].port`, {
                                                    initialValue: port,
                                                    rules: [{
                                                        validator(rule, value, callback) {
                                                            if (value) {
                                                                if (Number(value) < 0 || Number(value) > 65536 || isNaN(Number(value))) {
                                                                    callback('端口范围值为0 ~ 65536')
                                                                    return
                                                                }
                                                            }
                                                            callback()
                                                        }
                                                    }],
                                                })
                                                    (
                                                        <Input autoComplete='off' placeholder='请输入灾备库端口' />
                                                    )
                                                }
                                            </FormItem>
                                        </Col>
                                        <Col span={4}>
                                            <FormItem >
                                                {getFieldDecorator(`disaster[${key}].name`, {
                                                    rules: [
                                                        // { required: true, message: '请输入灾备库服务名!' },
                                                    ],
                                                    initialValue: name
                                                })
                                                    (
                                                        <Input autoComplete='off' placeholder='请输入灾备库服务名' />
                                                    )
                                                }
                                            </FormItem>
                                        </Col>
                                        <Col span={4}>
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

                            </Row>
                        </Form>
                    </div>
                </Spin>
            </Modal>
        );
    }
}

DatabaseEdit = Form.create()(DatabaseEdit)

export default connect()(DatabaseEdit);