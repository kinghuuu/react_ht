import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { Row, Col, Icon, Modal, Form, Input, Radio, message, InputNumber, Spin, AutoComplete, Tooltip } from 'antd';
import {
    createSelfDefiningProperty,
    updateSelfDefiningProperty,
} from '../../actions/selfDefining/action';
import styles from './index.module.less';

const FormItem = Form.Item,
    RadioGroup = Radio.Group,
    formLayout = {
        labelCol: { span: 5 },
        wrapperCol: { span: 16 }
    },
    AutoCompleteList = ['string', 'number', 'number(2)', 'config', 'editConfig',
        // 'multiple'
    ];

class EditSelfDefining extends Component {
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
        const { form: { validateFields }, editData = {}, nodeType = '', systemId } = this.props;
        const { id } = editData;
        validateFields((err, values) => {
            if (err) {
                return;
            }
            if (loading) {
                message.warning('请勿重复提交');
            }
            this.setState(() => ({ loading: true }));
            let params = { ...params, ...values, systemId, nodeType };
            if (id) {
                params = { ...editData, ...params };
            }
            this.postData(params)
        });
    }

    // 发送数据
    postData = (params) => {
        const { dispatch, hideModal } = this.props;
        const { id } = params;
        let action = createSelfDefiningProperty;
        if (id) {
            action = updateSelfDefiningProperty;
        }
        dispatch(action(params, result => {
            this.setState(() => ({ loading: false }));
            message.success(id ? '属性编辑成功' : '属性新增成功');
            if (_.isFunction(hideModal)) {
                hideModal(true, !id);
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
            editData = {},
        } = this.props;

        const {
            id,
            propName, propId, propType,
            isRequired, defaultValue, draworder, showHint,
            isSearchKey='0'
        } = editData;

        return (
            <Modal
                title={id ? '编辑属性' : '新增属性'}
                visible={true}
                onOk={this.handleOk}
                onCancel={this.handleCancel}
                width={620}
                maskClosable={false}
            >
                <Spin spinning={loading}>
                    <Form>
                        <FormItem label='属性名称' {...formLayout}>
                            {getFieldDecorator('propName', {
                                rules: [{
                                    required: true, message: '请输入属性名称'
                                }],
                                initialValue: propName
                            })
                                (<Input autoComplete='off' />)
                            }
                        </FormItem>
                        <FormItem label='属性编码'  {...formLayout}>
                            {getFieldDecorator('propId', {
                                rules: [
                                    { required: true, message: '唯一标识不能为空' },
                                    { pattern: /^([a-zA-Z0-9_]*)$/, message: '下划线/数字/英文字母' }
                                ],
                                initialValue: propId
                            })
                                (<Input placeholder='下划线/数字/英文字母' autoComplete='off' disabled={!_.isEmpty(propId)} />)
                            }
                        </FormItem>

                        <FormItem label='字段类型' {...formLayout}>
                            {getFieldDecorator('propType', {
                                rules: [{
                                    required: true, message: '请输入属性字段类型'
                                }],
                                initialValue: propType
                            })
                                (<AutoComplete dataSource={AutoCompleteList} />)
                            }
                            <Tooltip placement="topRight" title={(<div>
                                <div>string: 文本类型输入框</div>
                                <div>number: 数字类型输入框 </div>
                                <div>number(x): 数字类型输入框，精确到x位小数</div>
                                <div>config: 下拉框</div>
                                <div>editConfig: 选中后还可以编辑的下拉框</div>
                                {/* <div>multiple: 复杂类型</div> */}
                            </div>)}>
                                <Icon type='question-circle' theme='filled' style={{ position: 'absolute', top: '-4px', right: '-40px', fontSize: '24px', color: '#1890ff' }} />
                            </Tooltip>
                        </FormItem>

                        <FormItem label='是否必选' {...formLayout}>
                            {getFieldDecorator('isRequired', {
                                rules: [{
                                    required: true, message: '请选择属性是否为必填项'
                                }],
                                initialValue: isRequired || '0'
                            })
                                (<RadioGroup>
                                    <Radio value='1'>是</Radio>
                                    <Radio value='0'>否</Radio>
                                </RadioGroup>)
                            }
                        </FormItem>

                        <FormItem label='是否做为查询条件' {...formLayout}>
                            {getFieldDecorator('isSearchKey', {
                                rules: [{
                                    required: true, message: '请选择是否做为查询条件'
                                }],
                                initialValue: isSearchKey
                            })
                                (<RadioGroup>
                                    <Radio value='1'>是</Radio>
                                    <Radio value='0'>否</Radio>
                                </RadioGroup>)
                            }
                        </FormItem>

                        <FormItem label='默认值' {...formLayout}>
                            {getFieldDecorator('defaultValue', {
                                initialValue: defaultValue
                            })
                                (<Input autoComplete='off' />)
                            }
                        </FormItem>

                        <FormItem label='显示顺序' {...formLayout}>
                            {getFieldDecorator('draworder', {
                                // rules: [{
                                //     required: true, message: '请输入属性展示顺序号'
                                // }],
                                initialValue: draworder || 1
                            })
                                (<InputNumber style={{ width: '100%' }} min={1} autoComplete='off' />)
                            }
                        </FormItem>


                        <FormItem label='提示信息' {...formLayout}>
                            {getFieldDecorator('showHint', {
                                initialValue: showHint
                            })
                                (<Input autoComplete='off' />)
                            }
                        </FormItem>

                    </Form>
                </Spin>
            </Modal>
        );
    }
}

// const mapStateToProps = (state, ownProps) => {
//     return {
//         // customAttributeList: state.customAttributeList,
//         // customGroupList: state.customGroupList,
//     }
// }

EditSelfDefining = Form.create()(EditSelfDefining)

export default connect()(EditSelfDefining);