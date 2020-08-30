import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import _ from 'lodash';
import { Row, Col, Modal, Form, message, Button, Spin } from 'antd';
import { PlainSelector } from '../../components/selector/selector';
import { SearchInput } from '../../components/searchinput/searchinput';
import {
    createModel
} from '../../actions/modelConfig/action';
import { ContextPath } from '../../constants';
import { STATION_STATUS } from '../common/commonData';

const FormItem = Form.Item,
    formItemLayout = {
        labelCol: { span: 8 },
        wrapperCol: { span: 16 }
    }

class RelationModule extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            keys: [0],
        };
    }

    // 确定
    handleOk = (e) => {
        e.preventDefault();
        const { loading } = this.state;
        const { form: { validateFields }, systemId, relationData = {} } = this.props;
        validateFields((err, values) => {
            if (err) {
                return;
            }
            this.setState(() => ({ loading: true }));
            const { programIds, states, keys } = values;
            const { outip, sequenceid } = relationData;
            let times = moment().format('YYYY-MM-DD HH:mm:ss');
            let dependProgram = _.map(keys, key => {
                let programId = programIds[key];
                let state = states[key];
                programId = programId.value[0];
                state = state.value[0];
                return `${programId},${state}`;
            });
            let params = {
                times,
                topoName: sequenceid,
                systemId,
                configItemType: 'resource',
                propertyValueDtoList: [
                    { propId: 'ip', propValue: outip },
                    { propId: 'sequenceId', propValue: sequenceid },
                    { propId: 'dependProgram', propValue: dependProgram.join('|') },
                ]
            }
            this.postData(params)
        });
    }

    // 发送数据
    postData = (params) => {
        const { dispatch, hideModal } = this.props;
        dispatch(createModel(params, result => {
            this.setState(() => ({ loading: false }));
            message.success('模块关联成功');
            if (_.isFunction(hideModal)) {
                hideModal(true);
            }
        }, (error = '模块关联失败') => {
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


    addKey = () => {
        const { form: { getFieldValue, setFieldsValue } } = this.props;
        let keys = getFieldValue('keys');
        let lastItem = _.last(keys);
        keys.push(lastItem + 1);
        setFieldsValue({ keys });
    }
    delKey = (key) => {
        const { form: { getFieldValue, setFieldsValue } } = this.props;
        let keys = getFieldValue('keys');
        keys = keys.filter(item => item !== key);
        setFieldsValue({ keys });
    }

    validatorProgram = (rule, value, callback) => {
        const { fullField } = rule;
        const { form: { getFieldsValue } } = this.props;
        let programIds = getFieldsValue() || {};
        programIds = programIds.programIds;

        if (_.isEmpty(value) && _.isEmpty(value.value)) {
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


    render() {

        const { loading, keys } = this.state;
        const {
            form: { getFieldDecorator, getFieldValue },
            systemId,
        } = this.props;

        getFieldDecorator('keys', { initialValue: keys });
        let _keys = getFieldValue('keys');

        return (
            <Modal
                title='关联模块'
                visible={true}
                onOk={this.handleOk}
                onCancel={this.handleCancel}
                width={620}
                maskClosable={false}
            >
                <Spin spinning={loading}>
                    <Form>
                        {_.map(_keys, (key, index) => {
                            return (<Row key={key}>
                                <Col span={12}>
                                    <FormItem label="关联模块" {...formItemLayout}>
                                        {getFieldDecorator(`programIds[${key}]`, {
                                            rules: [
                                                {
                                                    required: true,
                                                    // validator: this.validatorProgram.bind(this, key)
                                                    validator: this.validatorProgram
                                                }
                                            ],
                                            initialValue: ''
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
                                <Col span={8} offset={1} >
                                    <FormItem label="部署状态" {...formItemLayout}>
                                        {getFieldDecorator(`states[${key}]`, {
                                            initialValue: {
                                                data: STATION_STATUS,
                                                value: ['01'],
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
        );
    }
}

RelationModule = Form.create()(RelationModule)

export default connect()(RelationModule);