import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import _ from 'lodash';
import { Row, Col, Modal, Form, message, Button, Spin } from 'antd';
import { PlainSelector } from '../../../components/selector/selector';
import { SearchInput } from '../../../components/searchinput/searchinput';
import {
    updateModel, deleteModels, createModel
} from '../../../actions/modelConfig/action';
import { ContextPath } from '../../../constants';
import { STATION_STATUS } from '../../common/commonData';

const FormItem = Form.Item,
    formItemLayout = {
        labelCol: { span: 8 },
        wrapperCol: { span: 16 }
    }

class RelationModule extends Component {
    constructor(props) {
        super(props);

        let { editData = {} } = props,
            keys = [], states = [], programIds = [];
        if (!_.isEmpty(editData)) {
            const { program = '', programName = '' } = editData;
            let programs = program.split('|') || [];
            let programNames = programName.split('|');
            keys = programs.map((item, index) => index);

            programIds = programs.map((pra, index) => {
                let [text] = programNames[index].split(',');
                let [value] = pra.split(',');
                return {
                    data: [{ text, value }],
                    value: [value]
                };
            });
            states = programs.map((pra, index) => {
                let [first, value = '01'] = pra.split(',');
                return [value];
            });
        }

        this.state = {
            loading: false,
            keys,
            programIds,
            states,
        };
    }

    // 确定
    handleOk = (e) => {
        e.preventDefault();
        const { loading } = this.state;
        const { form: { validateFields }, systemId, editData = {}, useStatusName, arrangementStatus } = this.props;
        validateFields((err, values) => {
            if (err) {
                return;
            }
            this.setState(() => ({ loading: true }));
            const { programIds, states, keys } = values;
            const { outip, sequenceid, nodeId, addressName } = editData;
            let times = moment().format('YYYY-MM-DD HH:mm:ss');
            let dependProgram = _.map(keys, key => {
                let programId = programIds[key];
                let state = states[key];
                programId = programId.value[0];
                state = state.value[0];
                return `${programId},${state}`;
            });
            let dependProgramValue = dependProgram.join('|');
            let params = {
                arrangementStatus,
                times,
                topoName: sequenceid,
                systemId,
                configItemType: 'resource',
                nodeId,
                propertyValueDtoList: [
                    { propId: 'ip', propValue: outip },
                    { propId: 'sequenceId', propValue: sequenceid },
                    { propId: 'dependProgram', propValue: dependProgramValue },
                    { propId: 'useStatusName', propValue: useStatusName },
                    { propId: 'addressName', propValue: addressName },
                ]
            }
            this.postData(params, !dependProgramValue);
        });
    }

    // 发送数据
    postData = (params, isEmpty) => {
        const { dispatch, hideModal, nodeType, editData = {} } = this.props;
        const { program } = editData
        if (isEmpty) {
            // 调用删除接口
            let nodeIds = [params.nodeId]
            dispatch(deleteModels({ nodeIds, configItemType: nodeType }, result => {
                this.setState(() => ({ loading: false }));
                message.success('模块关联成功');
                if (_.isFunction(hideModal)) {
                    hideModal(true);
                }
            }, (error = '模块关联失败') => {
                this.setState(() => ({ loading: false }));
                message.error(error);
            }));
        } else {
            let action = createModel
            if (program) {
                action = updateModel;
            }
            dispatch(action(params, result => {
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
        if (lastItem === undefined) {
            lastItem = -1
        }
        keys.push(lastItem + 1);
        setFieldsValue({ keys });
        // this.setState(() => ({ programIds: [], states: [] }));
    }
    delKey = (key) => {
        const { form: { getFieldValue, setFieldsValue } } = this.props;
        const { programIds, states } = this.state;
        let keys = getFieldValue('keys');
        keys = keys.filter(item => item !== key);
        setFieldsValue({ keys });
        if (programIds[key]) {
            programIds[key] = null;
            states[key] = null;
            this.setState(() => ({ programIds, states }));
        }
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

        const { loading, keys, programIds, states } = this.state;
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
                        <Button
                            type='primary'
                            style={{ margin: '0px 32px 16px 24px', background: '#87d068', borderColor: '#87d068', marginTop: '8px' }}
                            onClick={this.addKey}
                        >新增模块</Button>
                        {_.map(_keys, (key, index) => {
                            const initProgramId = programIds[key] || { data: [], value: [] };
                            const initState = states[key] || ['01'];
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
                                            initialValue: initProgramId
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
                                                value: initState,
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
                                    <Button
                                        type='danger'
                                        icon='close'
                                        size='small'
                                        style={{ marginLeft: '16px', marginTop: '8px' }}
                                        onClick={this.delKey.bind(this, key)}
                                    ></Button>
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