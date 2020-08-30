import React, { Component } from 'react';
import { Row, Col, Button, Form, Input, message } from 'antd';
import { PlainSelector } from '../../../components/selector/selector';
import { ContextPath } from '../../../constants/index';
import { update, add } from '../../../actions/application/service/action'
import _ from 'lodash';
import styles from './index.module.less';
import { connect } from 'react-redux';
const FormItem = Form.Item;
const { TextArea } = Input;

// 编辑或新增服务表单
class BaseInfoForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            savebtn: false
        };
    }

    handleSave = () => {
        let { form: { validateFields }, record, dispatch } = this.props;
        validateFields((error, fieldsValue) => {
            if (error) {
                return;
            }
            let propertyDetailList = [{
                'propId': 'serverName',
                'propName': '服务名称',
                'propValue': fieldsValue.serverName
            }, {
                'propId': 'interfaceName',
                'propName': '接口名称',
                'propValue': fieldsValue.interfaceName
            }, {
                'propId': 'serverType',
                'propName': '服务类型',
                'propValue': fieldsValue.serverType ? _.join(fieldsValue.serverType.value, ',') : ''
            }, {
                'propId': 'status',
                'propName': '启用状态',
                'propValue': fieldsValue.status ? _.join(fieldsValue.status.value, ',') : ''
            }, {
                'propId': 'description',
                'propName': '描述信息',
                'propValue': fieldsValue.description
            }, {
                'propId': 'remark',
                'propName': '备注信息',
                'propValue': fieldsValue.remark
            }];
            let params = {
                configItemType: 'service',
                parentId: record.parentId,
                systemId: record.systemId,
                serverName: fieldsValue.serverName,
                propertyValueDtoList: propertyDetailList
            };
            this.setState({
                savebtn: true
            });
            if (record.nodeId) {
                params.nodeId = record.nodeId
                dispatch(update(params, (res) => {
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
                dispatch(add(params, (res) => {
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
    render() {
        let { isLook, record, form: { getFieldDecorator } } = this.props;
        const { serverName = '', interfaceName = '', serverType = '', serverTypeName = '', status = '', statusName = '', description = '', remark = '' } = record;
        const formItemLayout2 = {
            labelCol: { span: 6 },
            wrapperCol: { span: 12 }
        };
        const formItemLayout3 = {
            labelCol: { span: 6 },
            wrapperCol: { span: 18 }
        };
        let serveTypeData = [], serveTypeValue = [], statusData = [], statusValue = [];
        if (serverType) {
            serveTypeData = [{
                value: serverType,
                text: serverTypeName
            }];
            serveTypeValue = [serverType];
        }
        if (status) {
            statusData = [{
                value: status,
                text: statusName
            }];
            statusValue = [status];
        }

        return (
            <Form>
                {isLook ? null : (<Button className={styles.baseinfo_save}
                    type='primary' size='small'
                    disabled={this.state.savebtn}
                    onClick={this.handleSave}>保存</Button>)
                }
                <Row style={{ marginTop: 5 }}>
                    <Col span={16}>
                        <FormItem label='服务名' {...formItemLayout2}>
                            {
                                getFieldDecorator('serverName', {
                                    rules: [
                                        { required: true, message: '请输入服务名称!' },
                                    ],
                                    initialValue: serverName
                                })(
                                    <Input placeholder='请输入服务名称' readOnly={isLook} autoComplete='off' />
                                )
                            }
                        </FormItem>
                    </Col>
                </Row>
                <Row>
                    <Col span={16}>
                        <FormItem label='接口名' {...formItemLayout2}>
                            {
                                getFieldDecorator('interfaceName', {
                                    rules: [
                                        { required: true, message: '请输入接口名称!' },
                                    ],
                                    initialValue: interfaceName
                                })(
                                    <Input placeholder='请输入接口名称' readOnly={isLook} autoComplete='off' />
                                )
                            }
                        </FormItem>
                    </Col>
                </Row>
                <Row>
                    <Col span={16} >
                        <FormItem {...formItemLayout2} label='服务类型'>
                            {
                                getFieldDecorator('serverType', {
                                    rules: [
                                        {
                                            required: true,
                                            validator: (rule, value, callback) => {
                                                if (_.isEmpty(value && value.value)) {
                                                    callback('请选择服务类型!');
                                                } else {
                                                    callback();
                                                }
                                            }
                                        }
                                    ],
                                    initialValue: {
                                        data: serveTypeData,
                                        value: serveTypeValue
                                    }
                                })(<PlainSelector
                                    allowClear={false}
                                    placeholder='请选择服务类型'
                                    method='get'
                                    params={{ cmdbServerType: 'serverType' }}
                                    dataUrl={`${ContextPath}/cmdbForService/getServiceType`}
                                    selectFirstData={serveTypeValue.length === 0}
                                    selectedValue={serveTypeValue}
                                    disabled={isLook} />)
                            }
                        </FormItem>
                    </Col>
                </Row>
                <Row>
                    <Col span={16} >
                        <FormItem {...formItemLayout2} label='启用状态'>
                            {
                                getFieldDecorator('status', {
                                    rules: [
                                        {
                                            required: true,
                                            validator: (rule, value, callback) => {
                                                if (_.isEmpty(value && value.value)) {
                                                    callback('请选择启用状态!');
                                                } else {
                                                    callback();
                                                }
                                            }
                                        }
                                    ],
                                    initialValue: {
                                        data: statusData,
                                        value: statusValue
                                    }
                                })(<PlainSelector
                                    allowClear={false}
                                    placeholder='请选择服务类型'
                                    method='get'
                                    params={{ cmdbServerType: 'serverStatus' }}
                                    dataUrl={`${ContextPath}/cmdbForService/getServiceType`}
                                    selectFirstData={statusValue.length === 0}
                                    selectedValue={statusValue}
                                    disabled={isLook} />)
                            }
                        </FormItem>
                    </Col>
                </Row>
                <Row>
                    <Col span={16}>
                        <FormItem {...formItemLayout3} label='描述信息'>
                            {
                                getFieldDecorator('description', {
                                    initialValue: description
                                })
                                    (<TextArea placeholder={isLook ? '' : '请填写描述信息'} rows={4} readOnly={isLook} autoComplete='off' />)
                            }
                        </FormItem>
                    </Col>
                </Row>
                <Row>
                    <Col span={16}>
                        <FormItem {...formItemLayout3} label='备注信息'>
                            {
                                getFieldDecorator('remark', {
                                    initialValue: remark
                                })
                                    (<TextArea placeholder={isLook ? '' : '请填写备注信息'} rows={4} readOnly={isLook} autoComplete='off' />)
                            }
                        </FormItem>
                    </Col>
                </Row>
            </Form>
        );
    }
}

BaseInfoForm = Form.create()(BaseInfoForm)
export default connect()(BaseInfoForm);
