import React, { Component } from 'react';
import { Row, Col, Button, Form, Input, message } from 'antd';
import { updateOracle, createOracle } from '../../../actions/application/database/action'
import _ from 'lodash';
import styles from './index.module.less';
import { connect } from 'react-redux';
const FormItem = Form.Item;
const reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;

// 编辑或新增数据库基本信息
class OracleBaseInfo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            savebtn: false,
            uuid: 1,
            oracleIPList: [
                { oracleIp: '', oraclePort: '', oracleIpRemark: '', key: 0 },
            ]
        };
    }

    componentDidMount() {
        const { record: { oracleIpDetails = '' } } = this.props;
        let oracleIpList = oracleIpDetails.split(';') || [], oracleIpDtoList = [];
        if (oracleIpList.length) {
            oracleIpList.forEach((item, index) => {
                let port = item.split(':')[1] || '';
                oracleIpDtoList.push({
                    oracleIp: item.split(':')[0] || '',
                    oraclePort: port.includes('(') ? port.slice(0, port.indexOf('(')) : port,
                    oracleIpRemark: item.includes('(') ? item.match(/\(([^)]*)\)/)[1] : '',
                    key: index
                });
            });
            this.setState({
                oracleIPList: oracleIpDtoList
            });
        }
    }

    handleSave = () => {
        let { form: { validateFields }, record, dispatch } = this.props;
        const { oracleIPList } = this.state;
        validateFields((error, fieldsValue) => {
            if (error) {
                return;
            }
            let oracleIps = fieldsValue.oracleIp;
            if (oracleIps.length !== _.uniq(oracleIps).length) {
                message.warning('当前IP地址存在重复值！');
                return;
            }
            let oracleIpDetails = [];
            if (oracleIps) {
                oracleIps.forEach((item, index) => {
                    let ip = item || '', port = fieldsValue.oraclePort[index] || '', remark = fieldsValue.oracleIpRemark[index] || '';
                    let oraclesString = remark ? `${ip}:${port}(${remark})` : `${ip}:${port}`;
                    oracleIpDetails.push(oraclesString);
                });
            }
            let propertyDetailList = [{
                'propId': 'oracleIpDetails',
                'propName': 'IP与端口',
                'propValue': oracleIpDetails.join(';')
            }, {
                'propId': 'oracleExample',
                'propName': '实例',
                'propValue': fieldsValue.oracleExample
            }, {
                'propId': 'oracleUserName',
                'propName': '用户名',
                'propValue': fieldsValue.oracleUserName
            }, {
                'propId': 'oracleDisasterInfo',
                'propName': '灾备库信息',
                'propValue': fieldsValue.oracleDisasterInfo
            }, {
                'propId': 'oracleConnectMinNum',
                'propName': '最小连接数',
                'propValue': fieldsValue.oracleConnectMinNum
            }, {
                'propId': 'oracleConnectMaxNum',
                'propName': '最大连接数',
                'propValue': fieldsValue.oracleConnectMaxNum
            }];

            let params = {
                'configItemType': 'oracleType',
                'parentId': record.parentId,
                'systemId': record.systemId,
                'oracleExample': fieldsValue.oracleExample,
                'propertyValueDtoList': propertyDetailList,
            };
            this.setState({
                savebtn: true
            });
            if (record.nodeId) {
                params.nodeId = record.nodeId
                dispatch(updateOracle(params, (res) => {
                    if (!res.hasError) {
                        message.success('编辑成功');
                        let { onClose } = this.props;
                        onClose(false, 'save');
                    }
                    this.setState({
                        savebtn: false
                    });
                }));
            } else {
                dispatch(createOracle(params, (res) => {
                    if (!res.hasError) {
                        message.success('保存成功');
                        let { onAdd, onClose } = this.props;
                        onClose(true, 'save');
                        onAdd(res.data);
                    }
                    this.setState({
                        savebtn: false
                    });
                }));
            }
        });
    }

    addIP = (key) => {
        const { form, form: { setFieldsValue, getFieldValue } } = this.props;
        form.validateFieldsAndScroll((errors, values) => {
            let oracleIps = values.oracleIp;
            if (oracleIps.length !== _.uniq(oracleIps).length) {
                message.warning('当前IP地址存在重复值！');
                return;
            }
            const { oracleIPList } = this.state;
            let oracleIPCopy = _.cloneDeep(oracleIPList);
            let newIp = { oracleIp: '', oraclePort: '', oracleIpRemark: '', key: oracleIPCopy.length + 1 };
            oracleIPCopy.push(newIp);
            oracleIPCopy.forEach((item, index) => {
                item.key = index;
            });
            const ipKeys = _.isEmpty(getFieldValue('oracleIp')) ? [] : [...getFieldValue('oracleIp')];
            ipKeys.push('');
            const portKeys = _.isEmpty(getFieldValue('oraclePort')) ? [] : [...getFieldValue('oraclePort')];
            portKeys.push('');
            const remarKeys = _.isEmpty(getFieldValue('oracleIpRemark')) ? [] : [...getFieldValue('oracleIpRemark')];
            remarKeys.push('');
            this.setState(() => ({ oracleIPList: oracleIPCopy }), () => {
                setFieldsValue({
                    oracleIp: ipKeys,
                    oraclePort: portKeys,
                    oracleIpRemark: remarKeys
                });
            });
        });
    }

    delIP = (key) => {
        const { oracleIPList } = this.state;
        const { form: { setFieldsValue, getFieldValue } } = this.props;
        let oracleIPCopy = _.cloneDeep(oracleIPList);
        oracleIPCopy.splice(key, 1);
        oracleIPCopy.forEach((item, index) => {
            item.key = index;
        });
        const curipKeys = _.isEmpty(getFieldValue('oracleIp')) ? [] : [...getFieldValue('oracleIp')];
        curipKeys.splice(key, 1);
        const portKeys = _.isEmpty(getFieldValue('oraclePort')) ? [] : [...getFieldValue('oraclePort')];
        portKeys.splice(key, 1);
        const remarKeys = _.isEmpty(getFieldValue('oracleIpRemark')) ? [] : [...getFieldValue('oracleIpRemark')];
        remarKeys.splice(key, 1);
        this.setState(() => ({ oracleIPList: oracleIPCopy }), () => {
            setFieldsValue({
                oracleIp: curipKeys,
                oraclePort: portKeys,
                oracleIpRemark: remarKeys,
            });
        });
    }

    render() {
        let { isLook, record, form: { getFieldDecorator } } = this.props;
        const { oracleExample = '', oracleDisasterInfo = '', oracleUserName = '',
            oracleConnectMinNum = '', oracleConnectMaxNum = '' } = record;
        let { oracleIPList } = this.state;
        const formItemLayout2 = {
            labelCol: { span: 6 },
            wrapperCol: { span: 12 }
        };
        const formItemLayout = {
            labelCol: { span: 8 },
            wrapperCol: { span: 15 }
        };

        const IPListInfo = _.map(oracleIPList, (item, index) => (
            <Row style={{ marginTop: 5, lineHeight: '38px' }} key={'ip' + index}>
                <Col offset={2} span={5}>
                    <FormItem label='IP地址' {...formItemLayout}>
                        {
                            getFieldDecorator(`oracleIp[${item.key}]`, {
                                rules: [
                                    { required: true, message: '请输入IP地址!' },
                                    { pattern: reg, message: '正确的IP格式为 1.1.1.1' }
                                ],
                                initialValue: item.oracleIp
                            })(
                                <Input placeholder='请输入IP地址' readOnly={isLook} autoComplete='off' />
                            )
                        }
                    </FormItem>
                </Col>
                <Col span={5}>
                    <FormItem label='端口' {...formItemLayout}>
                        {
                            getFieldDecorator(`oraclePort[${item.key}]`, {
                                rules: [
                                    { required: true, message: '请输入端口!' }
                                ],
                                initialValue: item.oraclePort
                            })(
                                <Input placeholder='请输入端口' readOnly={isLook} autoComplete='off' />
                            )
                        }
                    </FormItem>
                </Col>
                <Col span={5}>
                    <FormItem label='备注' {...formItemLayout}>
                        {
                            getFieldDecorator(`oracleIpRemark[${item.key}]`, {
                                initialValue: item.oracleIpRemark
                            })(
                                <Input placeholder='请输入备注信息' readOnly={isLook} autoComplete='off' />
                            )
                        }
                    </FormItem>
                </Col>
                {!isLook && <Col span={2}>
                    {
                        (index == 0) ? <Button
                            type='primary'
                            icon='plus'
                            size='small'
                            style={{ background: '#87d068', borderColor: '#87d068' }}
                            onClick={this.addIP.bind(this)}></Button>
                            :
                            <Button
                                type='danger'
                                icon='close'
                                size='small'
                                onClick={this.delIP.bind(this, item.key)}></Button>
                    }
                </Col>}
            </Row>
        ));

        return (
            <Form>
                {isLook ? null : (<Button className={styles.baseinfo_save}
                    type='primary' size='small'
                    disabled={this.state.savebtn}
                    onClick={this.handleSave}>保存</Button>)
                }
                {IPListInfo}

                <Row>
                    <Col span={16}>
                        <FormItem label='实例' {...formItemLayout2}>
                            {
                                getFieldDecorator('oracleExample', {
                                    rules: [
                                        { required: true, message: '请输入实例名称!' },
                                    ],
                                    initialValue: oracleExample
                                })(
                                    <Input placeholder='请输入实例名称' readOnly={isLook} autoComplete='off' />
                                )
                            }
                        </FormItem>
                    </Col>
                </Row>
                <Row>
                    <Col span={16} >
                        <FormItem label='用户名' {...formItemLayout2}>
                            {
                                getFieldDecorator('oracleUserName', {
                                    rules: [
                                        { required: true, message: '请输入用户名!' },
                                    ],
                                    initialValue: oracleUserName
                                })(
                                    <Input placeholder='请输入用户名' readOnly={isLook} autoComplete='off' />
                                )
                            }
                        </FormItem>
                    </Col>
                </Row>
                <Row>
                    <Col span={16} >
                        <FormItem label='灾备库信息' {...formItemLayout2}>
                            {
                                getFieldDecorator('oracleDisasterInfo', {
                                    initialValue: oracleDisasterInfo
                                })(
                                    <Input placeholder='请输入灾备库信息' readOnly={isLook} autoComplete='off' />
                                )
                            }
                        </FormItem>
                    </Col>
                </Row>
                <Row>
                    <Col span={16}>
                        <FormItem {...formItemLayout2} label='最小连接数'>
                            {
                                getFieldDecorator('oracleConnectMinNum', {
                                    initialValue: oracleConnectMinNum
                                })
                                    (<Input placeholder={isLook ? '' : '请填写最小连接数'} readOnly={isLook} autoComplete='off' />)
                            }
                        </FormItem>
                    </Col>
                </Row>
                <Row>
                    <Col span={16}>
                        <FormItem {...formItemLayout2} label='最大连接数'>
                            {
                                getFieldDecorator('oracleConnectMaxNum', {
                                    initialValue: oracleConnectMaxNum
                                })
                                    (<Input placeholder={isLook ? '' : '请填写最大连接数'} readOnly={isLook} autoComplete='off' />)
                            }
                        </FormItem>
                    </Col>
                </Row>
            </Form>
        );
    }
}

OracleBaseInfo = Form.create()(OracleBaseInfo)
export default connect()(OracleBaseInfo);
