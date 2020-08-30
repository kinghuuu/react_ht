import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { Row, Col, Icon, Modal, Form, Input, Radio, message, InputNumber, Spin } from 'antd';
import { PlainSelector } from '../../components/selector/selector';
import { createBusiness, updateBusiness } from '../../actions/business/action';
import styles from './index.module.less';

const FormItem = Form.Item,
    TextArea = Input.TextArea,
    formLayout = {
        labelCol: { span: 5 },
        wrapperCol: { span: 16 }
    }

class EditBusiness extends Component {
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
        const { form: { validateFields }, editData = {}, parentData, isCreate } = this.props;
        const { id } = editData;
        validateFields((err, values) => {
            if (err) {
                return;
            }
            if (loading) {
                message.warning('请勿重复提交');
            }
            // this.setState(() => ({ loading: true }));
            if (isCreate) {
                values.parentId = values.parentId.value[0]
            }

            let params = { ...values };

            this.postData(params)
        });
    }

    // 发送数据
    postData = (params) => {
        const { dispatch, hideModal, isCreate, editData } = this.props;
        let action = updateBusiness;
        if (isCreate) {
            action = createBusiness;
        } else {
            const { id } = editData;
            params.id = id;
        }
        dispatch(action(params, result => {
            this.setState(() => ({ loading: false }));
            message.success(isCreate ? '业务新增成功' : '业务编辑成功');
            if (_.isFunction(hideModal)) {
                hideModal(true, isCreate);
            }
        }, error => {
            this.setState(() => ({ loading: false }));
            message.error(error);
        }));
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
            parentData = {}, editData = {}, isCreate,
        } = this.props;

        const { businessName, description } = editData;

        let initParnetVale = { data: [], value: [] };
        if (isCreate) {
            const { id, businessName } = parentData;
            initParnetVale = {
                data: [{ text: businessName, value: id }],
                value: [id]
            }
        }

        return (
            <Modal
                title={isCreate ? `新增${parentData.businessName ? '子' : '根'}业务` : '编辑业务'}
                visible={true}
                onOk={this.handleOk}
                onCancel={this.handleCancel}
                width={620}
                maskClosable={false}
            >
                <Spin spinning={loading}>

                    <Form>
                        {isCreate ? (
                            <FormItem label='父业务' {...formLayout}>
                                {getFieldDecorator('parentId', {
                                    initialValue: initParnetVale
                                })
                                    (<PlainSelector
                                        forceOuterData={true}
                                        disabled={true}
                                    />)
                                }
                            </FormItem>
                        ) : null}

                        <FormItem label='业务名称'  {...formLayout}>
                            {getFieldDecorator('businessName', {
                                rules: [{ required: true, message: '业务名称不能为空' }],
                                initialValue: businessName
                            })
                                (<Input placeholder='请输入业务名称' autoComplete='off' />)
                            }
                        </FormItem>

                        <FormItem label='业务描述' {...formLayout}>
                            {getFieldDecorator('description', {
                                initialValue: description
                            })
                                (<TextArea rows={4} autoComplete='off' />)
                            }
                        </FormItem>

                    </Form>
                </Spin>
            </Modal>
        );
    }
}

EditBusiness = Form.create()(EditBusiness)

export default connect()(EditBusiness);