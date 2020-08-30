import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Form, Input, Modal, message } from 'antd';
import { ContextPath } from '../../../constants';
import { PlainSelector } from '../../../components/selector/selector';
import { updateServiceConsume, creatServiceConsume } from '../../../actions/application/service/action'

const formItemLayout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 12 }
};
const FormItem = Form.Item;
const { TextArea } = Input;
//添加服务消费弹框
class ConsumeModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    handleSubmit = () => {
        let { form: { validateFields }, currentRecord, parentRecord, dispatch } = this.props;
        validateFields((error, fieldsValue) => {
            if (error) {
                return;
            }
            let propertyDetailList = [{
                'propId': 'consumeSystem',
                'propName': '消费系统',
                'propValue': fieldsValue.system
            }, {
                'propId': 'consumeProgram',
                'propName': '消费程序',
                'propValue': fieldsValue.program
            }, {
                'propId': 'consumeType',
                'propName': '消费方式',
                'propValue': fieldsValue.consumeType ? _.join(fieldsValue.consumeType.value, ',') : ''
            }, {
                'propId': 'consumeConnectType',
                'propName': '连接方式',
                'propValue': fieldsValue.consumeConnectType ? _.join(fieldsValue.consumeConnectType.value, ',') : ''
            }, {
                'propId': 'consumeQPS',
                'propName': '消费方QPS',
                'propValue': fieldsValue.consumeQPS
            }, {
                'propId': 'consumeTime',
                'propName': '消费方要求响应时间(MS)',
                'propValue': fieldsValue.consumeTime
            }, {
                'propId': 'channelNum',
                'propName': '渠道号',
                'propValue': fieldsValue.channelNum
            }, {
                'propId': 'consumeDescription',
                'propName': '消费业务功能描述',
                'propValue': fieldsValue.consumeDescription
            }];
            let params = {
                configItemType: 'serviceConsume',
                'parentId': parentRecord.nodeId,
                'systemId': parentRecord.systemId,
                'serviceConsumeSystem': fieldsValue.system,
                'serviceConsumeProgram': fieldsValue.program,
                'propertyValueDtoList': propertyDetailList
            };

            if (currentRecord.nodeId) {
                params.nodeId = currentRecord.nodeId
                dispatch(updateServiceConsume(params, (res) => {
                    if (!res.hasError) {
                        message.success('编辑成功');
                        let { onClose } = this.props;
                        onClose(false, 'update');
                    }

                }));
            } else {
                dispatch(creatServiceConsume(params, (res) => {
                    if (!res.hasError) {
                        message.success('保存成功');
                        let { onClose } = this.props;
                        onClose(false, 'update');
                    }
                }));
            }
        });
    }

    render() {
        const { form: { getFieldDecorator }, onClose, currentRecord, isLook } = this.props;
        const { consumeType = '', consumeTypeName, consumeConnectType = '', consumeConnectTypeName = '',
            consumeSystem, consumeProgram, consumeDescription, consumeQPS, consumeTime, channelNum
        } = currentRecord;

        // 消费方式初始化
        let consumeTypeData = [], consumeTypeValue = [];
        if (consumeType) {
            consumeTypeData = [{
                value: consumeType,
                text: consumeTypeName
            }];
            consumeTypeValue = [consumeType];
        }
        let consumeConnectTypeData = [], consumeConnectTypeValue = [];
        if (consumeConnectType) {
            consumeConnectTypeData = [{
                value: consumeConnectType,
                text: consumeConnectTypeName
            }];
            consumeConnectTypeValue = [consumeConnectType];
        }
        return (
            <Modal
                title={currentRecord.nodeId ? '修改服务消费' : '新增服务消费'}
                visible={true}
                okText='保存'
                maskClosable={false}
                onOk={this.handleSubmit.bind(this)}
                onCancel={() => { onClose(false); }}>
                <Form>
                    <FormItem {...formItemLayout} label='消费系统'>
                        {
                            getFieldDecorator('system', {
                                rules: [{ required: true, message: '消费系统不能为空' }],
                                initialValue: consumeSystem
                            })
                                (<Input autoComplete='off' placeholder='请输入消费系统' />)}

                    </FormItem>
                    <FormItem {...formItemLayout} label='消费程序'>
                        {
                            getFieldDecorator('program', {
                                rules: [{ required: true, message: '消费程序不能为空' }],
                                initialValue: consumeProgram
                            })
                                (<Input autoComplete='off' placeholder='请输入消费程序' />)
                        }
                    </FormItem>
                    <FormItem {...formItemLayout} label='消费方式'>
                        {
                            getFieldDecorator(`consumeType`, {
                                rules: [
                                    { required: true, message: `消费方式不能为空` },
                                ],
                                initialValue: {
                                    data: consumeTypeData,
                                    value: consumeTypeValue,
                                },
                            })(
                                <PlainSelector
                                    allowClear={false}
                                    method='get'
                                    placeholder='请选择消费方式'
                                    params={{ cmdbServerType: 'consumeType' }}
                                    dataUrl={`${ContextPath}/cmdbForService/getServiceType`}
                                    selectFirstData={consumeTypeValue.length === 0}
                                    selectedValue={consumeTypeValue} />
                            )
                        }
                    </FormItem>
                    <FormItem {...formItemLayout} label='连接方式'>
                        {
                            getFieldDecorator(`consumeConnectType`, {
                                rules: [
                                    { required: true, message: `连接方式不能为空` },
                                ],
                                initialValue: {
                                    data: consumeConnectTypeData,
                                    value: consumeConnectTypeValue,
                                },
                            })(
                                <PlainSelector
                                    allowClear={false}
                                    method='get'
                                    placeholder='请选择连接方式'
                                    params={{ cmdbServerType: 'serverType' }}
                                    dataUrl={`${ContextPath}/cmdbForService/getServiceType`}
                                    selectFirstData={consumeConnectTypeValue.length === 0}
                                    selectedValue={consumeConnectTypeValue} />
                            )
                        }
                    </FormItem>
                    <FormItem  {...formItemLayout} label='消费方QPS'>
                        {getFieldDecorator('consumeQPS', {
                            initialValue: consumeQPS
                        })(<Input autoComplete='off' placeholder={isLook ? '' : '请输入消费方QPS'} />)}
                    </FormItem>
                    <FormItem
                        label='消费方要求响应时间(MS)'
                        {...formItemLayout}>
                        {getFieldDecorator('consumeTime', {
                            initialValue: consumeTime
                        })(<Input autoComplete='off' placeholder={isLook ? '' : '请输入消费方要求响应时间(MS)'} />)}
                    </FormItem>
                    <FormItem
                        label='渠道号'
                        {...formItemLayout}>
                        {getFieldDecorator('channelNum', {
                            initialValue: channelNum
                        })(<Input autoComplete='off' placeholder={isLook ? '' : '请输入渠道号'} />)}
                    </FormItem>
                    <FormItem
                        label='消费业务功能描述'
                        {...formItemLayout}>
                        {getFieldDecorator('consumeDescription', {
                            initialValue: consumeDescription
                        })
                            (<TextArea placeholder={isLook ? '' : '请填写消费业务功能描述信息'} rows={4} readOnly={isLook} autoComplete='off' />)
                        }
                    </FormItem>
                </Form>
            </Modal>
        )
    }
}

ConsumeModal = Form.create()(ConsumeModal);

export default connect()(ConsumeModal);