import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import _ from 'lodash';
import { Modal, Form, message, InputNumber, Spin } from 'antd';
import { SearchInput } from '../../../components/searchinput/searchinput';
import { PlainSelector } from '../../../components/selector/selector';
import { ContextPath } from '../../../constants';
import {
    createModel,
    updateModel,
} from '../../../actions/modelConfig/action';

const FormItem = Form.Item,
    spanLeft = 22, spanRight = 2,
    formItemLayout = {
        labelCol: { span: 6 },
        wrapperCol: { span: 16 }
    }, initFixedPropertieList = [
        { propId: 'serviceId', propName: '服务名称', propValue: '' },
        { propId: 'indicatorType', propName: '指标类型', propValue: '' },
        { propId: 'promiseValue', propName: '承诺值', propValue: '' },
        { propId: 'clusteredTPSExpandRatio', propName: '集群TPS扩展系数', propValue: '' },
    ];

class ServiceSliEdit extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false
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
            let fixedProperties = _.map(initFixedPropertieList, item => {
                const { propId } = item;
                let propValue = values[propId];
                // 选择框
                if (_.isObject(propValue)) {
                    propValue = propValue.value[0]
                }
                return { propId, propValue };
            });
            this.postData(fixedProperties)
        });
    }

    // 发送数据
    postData = (fixedProperties) => {
        const { dispatch, hideModal, editData = {}, systemId, nodeType } = this.props;
        const { nodeId } = editData;
        let topoName = `${fixedProperties[0].propValue}|${fixedProperties[1].propValue}`;
        let times = moment().format('YYYY-MM-DD HH:mm:ss');

        let params = {
            nodeId, times,
            topoName,
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

        dispatch(action(params, result => {
            this.setState(() => ({ loading: false }));
            message.success(nodeId ? '服务SLI编辑成功' : '服务SLI新增成功');
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


    render() {

        const { loading } = this.state;
        const {
            form: { getFieldDecorator },
            editData = {},
            systemId,
        } = this.props;

        const {
            nodeId,
            serviceId,
            service,
            indicatorType,
            promiseValue = '',
            clusteredTPSExpandRatio = '',
        } = editData;

        let initService = { data: [], value: [] };
        if (serviceId) {
            initService = {
                data: [{ text: service, value: serviceId }],
                value: [serviceId]
            }
        }

        return (
            <Modal
                title={nodeId ? '编辑服务SLI' : '新增服务SLI'}
                visible={true}
                onOk={this.handleOk}
                onCancel={this.handleCancel}
                width={620}
                maskClosable={false}
            >
                <Spin spinning={loading}>
                    <Form>
                        <FormItem label='服务名称' {...formItemLayout}>
                            {getFieldDecorator('serviceId', {
                                rules: [{
                                    required: true,
                                    validator: (rule, value, callback) => {
                                        if (_.isEmpty(value && value.value)) {
                                            callback('请选择服务名称!');
                                        } else {
                                            callback();
                                        }
                                    }
                                }],
                                initialValue: initService
                            })
                                (
                                    <SearchInput
                                        placeholder='请选择服务名称'
                                        method='get'
                                        attachParams={{ systemId, nodeType: 'service' }}
                                        dataUrl={`${ContextPath}/cmdbCommon/getSelectList`}
                                        // forceOuterData={true}
                                        // selectFirstData={!nodeId}
                                        allowClear={false}
                                    />
                                )
                            }
                        </FormItem>


                        <FormItem label='指标类型' {...formItemLayout} >
                            {getFieldDecorator('indicatorType', {
                                rules: [{
                                    required: true,
                                    validator: (rule, value, callback) => {
                                        if (_.isEmpty(value && value.value)) {
                                            callback('请选择线路状态!');
                                        } else {
                                            callback();
                                        }
                                    }
                                }],
                                initialValue: {
                                    data: [],
                                    value: []
                                }
                            })
                                (
                                    <PlainSelector
                                        // forceOuterData={true}
                                        allowClear={false}
                                        placeholder='请选指标类型'
                                        method='get'
                                        params={{ param: 'sliIndicatorType' }}
                                        dataUrl={`${ContextPath}/cmdbCommon/getParameterList`}
                                        selectFirstData={!nodeId}
                                        selectedValue={indicatorType ? [indicatorType] : []}
                                    // disabled={isLook}
                                    />
                                )
                            }
                        </FormItem>

                        <FormItem label='承诺值' {...formItemLayout}>
                            {getFieldDecorator('promiseValue', {
                                rules: [{ required: true, message: '请输入承诺值' }],
                                initialValue: promiseValue
                            })
                                (<InputNumber style={{ width: '100%' }} min={0} />)
                            }
                        </FormItem>

                        <FormItem label='集群TPS扩展系数' {...formItemLayout}>
                            {getFieldDecorator('clusteredTPSExpandRatio', {
                                // rules: [{ required: true, message: '请输入集群TPS扩展系数' }],
                                initialValue: clusteredTPSExpandRatio
                            })
                                (<InputNumber style={{ width: '100%' }} min={0} />)
                            }
                        </FormItem>

                    </Form>
                </Spin>
            </Modal>
        );
    }
}

ServiceSliEdit = Form.create()(ServiceSliEdit)

export default connect()(ServiceSliEdit);