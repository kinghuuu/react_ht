import React, { Component } from 'react';
import { Row, Col, Button, Form, Input, message } from 'antd';
import { updateMysql, createMysql } from '../../../actions/application/database/action'
import _ from 'lodash';
import styles from './index.module.less';
import { connect } from 'react-redux';
const FormItem = Form.Item;
const reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;

// 编辑或新增数据库基本信息
class MysqlBaseInfo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            savebtn: false,
        };
    }

    handleSave = () => {
        let { form: { validateFields }, record, dispatch } = this.props;
        validateFields((error, fieldsValue) => {
            if (error) {
                return;
            }
            let propertyDetailList = [{
                'propId': 'mysqlIp',
                'propName': 'IP地址',
                'propValue': fieldsValue.mysqlIp
            }, {
                'propId': 'mysqlPort',
                'propName': '端口',
                'propValue': fieldsValue.mysqlPort
            }, {
                'propId': 'mysqlExample',
                'propName': '实例',
                'propValue': fieldsValue.mysqlExample
            }, {
                'propId': 'mysqlUserName',
                'propName': '用户名',
                'propValue': fieldsValue.mysqlUserName
            }, {
                'propId': 'mysqlDisasterInfo',
                'propName': '灾备库信息',
                'propValue': fieldsValue.mysqlDisasterInfo
            }, {
                'propId': 'mysqlConnectMinNum',
                'propName': '最小连接数',
                'propValue': fieldsValue.mysqlConnectMinNum
            }, {
                'propId': 'mysqlConnectMaxNum',
                'propName': '最大连接数',
                'propValue': fieldsValue.mysqlConnectMaxNum
            }];
            let params = {
                'configItemType': 'mysqlType',
                'parentId': record.parentId,
                'systemId': record.systemId,
                'mysqlExample': fieldsValue.mysqlExample,
                'propertyValueDtoList': propertyDetailList
            };
            this.setState({
                savebtn: true
            });
            if (record.nodeId) {
                params.nodeId = record.nodeId
                dispatch(updateMysql(params, (res) => {
                    if (!res.hasError) {
                        message.success('编辑成功');
                        let { onClose } = this.props;
                        onClose(false, 'update');
                    }
                    this.setState({
                        savebtn: false
                    });
                }));
            } else {
                dispatch(createMysql(params, (res) => {
                    if (!res.hasError) {
                        message.success('添加成功');
                        let { onAdd, onClose } = this.props;
                        onClose(false, 'update');
                        // onAdd(res.data);
                    }
                    this.setState({
                        savebtn: false
                    });
                }));
            }
        });
    }

    render() {
        let { isLook, record, form: { getFieldDecorator } } = this.props;
        const { mysqlIp = '', mysqlPort = '', mysqlExample = '', mysqlDisasterInfo = '', mysqlUserName = '', mysqlConnectMinNum = '', mysqlConnectMaxNum = '' } = record;
        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 12 }
        };

        return (
            <Form>
                {isLook ? null : (<Button className={styles.baseinfo_save}
                    type='primary' size='small'
                    disabled={this.state.savebtn}
                    onClick={this.handleSave}>保存</Button>)
                }

                <Row>
                    <Col span={16}>
                        <FormItem label='IP地址' {...formItemLayout}>
                            {
                                getFieldDecorator('mysqlIp', {
                                    rules: [
                                        { required: true, message: '请输入IP地址!' },
                                        { pattern: reg, message: '正确的IP格式为 1.1.1.1' }
                                    ],
                                    initialValue: mysqlIp
                                })(
                                    <Input placeholder='请输入IP地址' readOnly={isLook} autoComplete='off' />
                                )
                            }
                        </FormItem>
                    </Col>
                </Row>
                <Row>
                    <Col span={16}>
                        <FormItem label='端口' {...formItemLayout}>
                            {
                                getFieldDecorator('mysqlPort', {
                                    rules: [
                                        { required: true, message: '请输入端口!' },
                                    ],
                                    initialValue: mysqlPort
                                })(
                                    <Input placeholder='请输入端口' readOnly={isLook} autoComplete='off' />
                                )
                            }
                        </FormItem>
                    </Col>
                </Row>
                <Row>
                    <Col span={16}>
                        <FormItem label='实例' {...formItemLayout}>
                            {
                                getFieldDecorator('mysqlExample', {
                                    rules: [
                                        { required: true, message: '请输入实例名称!' },
                                    ],
                                    initialValue: mysqlExample
                                })(
                                    <Input placeholder='请输入实例名称' readOnly={isLook} autoComplete='off' />
                                )
                            }
                        </FormItem>
                    </Col>
                </Row>
                <Row>
                    <Col span={16} >
                        <FormItem label='用户名' {...formItemLayout}>
                            {
                                getFieldDecorator('mysqlUserName', {
                                    rules: [
                                        { required: true, message: '请输入用户名!' },
                                    ],
                                    initialValue: mysqlUserName
                                })(
                                    <Input placeholder='请输入用户名' readOnly={isLook} autoComplete='off' />
                                )
                            }
                        </FormItem>
                    </Col>
                </Row>
                <Row>
                    <Col span={16} >
                        <FormItem label='灾备库信息' {...formItemLayout}>
                            {
                                getFieldDecorator('mysqlDisasterInfo', {
                                    initialValue: mysqlDisasterInfo
                                })(
                                    <Input placeholder='请输入灾备库信息' readOnly={isLook} autoComplete='off' />
                                )
                            }
                        </FormItem>
                    </Col>
                </Row>
                <Row>
                    <Col span={16}>
                        <FormItem {...formItemLayout} label='最小连接数'>
                            {
                                getFieldDecorator('mysqlConnectMinNum', {
                                    initialValue: mysqlConnectMinNum
                                })
                                    (<Input placeholder={isLook ? '' : '请填写最小连接数'} readOnly={isLook} autoComplete='off' />)
                            }
                        </FormItem>
                    </Col>
                </Row>
                <Row>
                    <Col span={16}>
                        <FormItem {...formItemLayout} label='最大连接数'>
                            {
                                getFieldDecorator('mysqlConnectMaxNum', {
                                    initialValue: mysqlConnectMaxNum
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

MysqlBaseInfo = Form.create()(MysqlBaseInfo)
export default connect()(MysqlBaseInfo);
