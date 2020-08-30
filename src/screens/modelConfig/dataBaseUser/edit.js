import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import _ from 'lodash';
import { Row, Col, Modal, Form, Input, message, Spin } from 'antd';
import { ContextPath } from '../../../constants';
import { PlainSelector } from '../../../components/selector/selector';
import { SearchInput } from '../../../components/searchinput/searchinput';
import {
    createModel,
    updateModel,
} from '../../../actions/modelConfig/action';
import styles from '../index.module.less';

const FormItem = Form.Item,
    formItemLayout = {
        labelCol: { span: 4 },
        wrapperCol: { span: 16 }
    };

class DataBaseUserEdit extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
        };
    }

    // static getDerivedStateFromProps(props,state){


    //     return null
    // }

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

            let { dataBaseId, userName, userAuthority, programId, leader } = values;

            dataBaseId = dataBaseId.value[0];
            userAuthority = userAuthority.value[0];
            programId = programId.value.join(',');
            leader = leader.value.join(',');

            let propertyValueDtoList = [
                { propId: 'dataBaseId', propValue: dataBaseId },
                { propId: 'userName', propValue: userName },
                { propId: 'userAuthority', propValue: userAuthority },
                { propId: 'programId', propValue: programId },
                { propId: 'leader', propValue: leader },
            ];
            this.postData(propertyValueDtoList, { dataBaseId, userName })
        });
    }

    // 发送数据
    postData = (propertyValueDtoList, { dataBaseId, userName }) => {
        const { dispatch, hideEditModal, editData = {}, systemId, nodeType } = this.props;
        const { nodeId = '' } = editData;
        let times = moment().format('YYYY-MM-DD HH:mm:ss');
        const close = () => {
            this.setState(() => ({ loading: false }));
            message.success(nodeId ? '数据库用户编辑成功' : '数据库用户新增成功');
            if (_.isFunction(hideEditModal)) {
                hideEditModal(true, !nodeId);
            }
        }
        let topoName = `${dataBaseId}|${userName}`;

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


    render() {
        let { loading } = this.state;
        const { form: { getFieldDecorator,getFieldValue }, editData = {}, systemId } = this.props;

        let height = window.document.body.offsetHeight * 0.6;

        const {
            nodeId,
            dataBaseId, dataBase,
            userName = '',
            userAuthority = '',
            programId, program,
            leader, leaderName,
        } = editData;

        let initDataBaseId = { data: [], value: [] };
        if (dataBaseId) {
            let value = dataBaseId.split(',');
            let arr = dataBase.split(',');
            let data = arr.map((text, index) => {
                return { text, value: value[index] }
            })
            initDataBaseId = { data, value };
        }

        let initProgramId = { data: [], value: [] };
        if (leader) {
            let value = programId.split(',');
            let arr = program.split(';');
            let data = arr.map((text, index) => {
                return { text, value: value[index] }
            })
            initProgramId = { data, value };
        }

        let initLeader = { data: [], value: [] };
        if (leader) {
            let value = leader.split(',');
            let arr = leaderName.split(',');
            let data = arr.map((text, index) => {
                return { text, value: value[index] }
            })
            initLeader = { data, value };
        }

        return (
            <Modal
                title={nodeId ? '编辑数据库用户' : '新增数据库用户'}
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
                                    <FormItem label='所属数据库' {...formItemLayout}>
                                        {getFieldDecorator('dataBaseId', {
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
                                            initialValue: initDataBaseId
                                        })
                                            (
                                                <SearchInput
                                                    method='get'
                                                    placeholder='请选择所属数据库'
                                                    attachParams={{ systemId, nodeType: 'dataBase' }}
                                                    dataUrl={`${ContextPath}/cmdbCommon/getSelectList`}
                                                    // forceOuterData={true}
                                                    allowClear={false}
                                                />
                                            )
                                        }
                                    </FormItem>
                                </Col>

                                <Col >
                                    <FormItem label='用户名' {...formItemLayout}>
                                        {getFieldDecorator('userName', {
                                            rules: [{ required: true, message: '请输入用户名!' }],
                                            initialValue: userName
                                        })
                                            (<Input placeholder='请输入用户名' autoComplete='off' />)
                                        }
                                    </FormItem>
                                </Col>

                                <Col>
                                    <FormItem label='用户权限' {...formItemLayout}>
                                        {getFieldDecorator('userAuthority', {
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
                                            initialValue: { data: [], value: [] }
                                        })
                                            (
                                                <PlainSelector
                                                    allowClear={false}
                                                    placeholder='请选择用户权限'
                                                    method='get'
                                                    params={{ param: 'db_privilege' }}
                                                    dataUrl={`${ContextPath}/cmdbCommon/getParameterList`}
                                                    // selectFirstData={!nodeId}
                                                    selectedValue={userAuthority ? [userAuthority] : []}
                                                />
                                            )
                                        }
                                    </FormItem>
                                </Col>


                                <Col>
                                    <FormItem label='所属模块'  {...formItemLayout}>
                                        {getFieldDecorator('programId', {
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
                                            initialValue: initProgramId
                                        })
                                            (
                                                <SearchInput
                                                    placeholder='请选择所属模块'
                                                    method='get'
                                                    attachParams={{ systemId, nodeType: 'program' }}
                                                    // queryName='keyword'
                                                    dataUrl={`${ContextPath}/cmdbCommon/getSelectList`}
                                                    forceOuterData={true}
                                                    allowClear={false}
                                                    mode='multiple'
                                                />
                                            )
                                        }
                                    </FormItem>
                                </Col>

                                <Col>
                                    <FormItem label='负责人'  {...formItemLayout}>
                                        {getFieldDecorator('leader', {
                                            // rules: [{
                                            //     required: true,
                                            //     validator: (rule, value, callback) => {
                                            //         if (_.isEmpty(value && value.value)) {
                                            //             callback('请选择负责人!');
                                            //         } else {
                                            //             callback();
                                            //         }
                                            //     }
                                            // }],
                                            initialValue: initLeader
                                        })
                                            (
                                                <SearchInput
                                                    placeholder='请选择负责人'
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

                            </Row>
                        </Form>
                    </div>
                </Spin>
            </Modal>
        );
    }
}

DataBaseUserEdit = Form.create()(DataBaseUserEdit)

export default connect()(DataBaseUserEdit);