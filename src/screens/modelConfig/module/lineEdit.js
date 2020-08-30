import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import _ from 'lodash';
import { Row, Col, Modal, Form, message, Spin, Alert } from 'antd';
import { SearchInput } from '../../../components/searchinput/searchinput';
import { ContextPath } from '../../../constants';
import {
    createModel,
    updateModel
} from '../../../actions/modelConfig/action';
import styles from '../index.module.less';
import { getFormItemsValue } from '../../common/renderFormItems';

const FormItem = Form.Item,
    spanLeft = 22,
    formItemLayout = {
        labelCol: { span: 4 },
        wrapperCol: { span: 20 }
    },
    initFixedPropertieList = [
        { propId: 'lineId', propName: '通讯线路名称', propValue: 'lineName', text: '' },
    ];

class LineEdit extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            fixedPropertieList: initFixedPropertieList,
            dynamicPropertieList: [],
        };
    }

    // 确定
    handleOk = (e) => {
        e.preventDefault();
        const { loading, dynamicPropertieList } = this.state;
        const { form: { validateFields } } = this.props;
        validateFields((err, values) => {
            // console.log('values', values)
            if (err) {
                return;
            }
            if (loading) {
                message.warning('请勿重复提交');
            }
            this.setState(() => ({ loading: true }));

            let fixedProperties = _.map(initFixedPropertieList, item => {
                // console.log('item', item)
                const { propId } = item;
                let propValueList = values[propId];
                let text = '';
                let propValue = '';
                // console.log('propValueList', propValueList)
                // 选择框
                if (_.isObject(propValueList)) {
                    propValue = propValueList.value[0]
                }
                for (let i = 0; i < propValueList.data.length; i++) {
                    if (propValue === propValueList.data[i].value) {
                        text = propValueList.data[i].text
                    }
                }
                // console.log('propId', propId)
                // console.log('propValue', propValue)
                return { propId, propValue, text };
            });
            let { dynamicProperties } = getFormItemsValue(values, dynamicPropertieList);
            let properties = { dynamicProperties, fixedProperties };
            this.postData(properties);
        });
    }

    // 发送数据
    postData = (params) => {
        // console.log('param:', params)

        const { dispatch, hideModal, editData = {}, systemId, nodeType } = this.props;
        let { fixedProperties } = params;
        const { nodeId } = editData;
        let times = moment().format('YYYY-MM-DD HH:mm:ss');

        const topoName = fixedProperties[0].text;

        let newParams = {
            nodeId, times,
            topoName: `${topoName}`,
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

        dispatch(action(newParams, result => {
            this.setState(() => ({ loading: false }));
            message.success(nodeId ? '通讯线路编辑成功' : '通讯线路新增成功');
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
        const {
            loading
        } = this.state;

        const {
            form: { getFieldDecorator },
            editData = {},
            systemId,
        } = this.props;

        const { nodeId, lineId, lineName } = editData;

        //初始化 通讯线路名称
        let initLineName = { data: [], value: [] }
        if (lineId) {
            initLineName = {
                data: [{ text: lineName, value: lineId }],
                value: [lineId]
            }
        }

        let height = window.document.body.offsetHeight * 0.66;
        if (height < 500) {
            height = 500;
        }

        return (
            <Modal
                title={nodeId ? '编辑通讯线路' : '新增通讯线路'}
                visible={true}
                onOk={this.handleOk}
                onCancel={this.handleCancel}
                width={800}
                className={styles.customModal}
                maskClosable={false}
            >
                <Spin spinning={loading}>
                    <div className={styles.customModalBody} style={{ maxHeight: `${height}px`, height: 'auto' }} >
                        <Form>
                            <Row>
                                {/* <Col style={{ marginBottom: '16px' }}><Alert message='基本属性' type='info' /></Col> */}
                                <Col span={spanLeft}>
                                    <FormItem label="通讯线路名称" {...formItemLayout}>
                                        {getFieldDecorator('lineId', {
                                            rules: [{
                                                required: true,
                                                validator: (rule, value, callback) => {
                                                    if (_.isEmpty(value && value.value)) {
                                                        callback('请选择通讯线路名称!');
                                                    } else {
                                                        callback();
                                                    }
                                                }
                                            }],
                                            initialValue: initLineName
                                        })
                                            (
                                                <SearchInput
                                                    placeholder='请选择通讯线路名称'
                                                    method='get'
                                                    queryName='lineName'
                                                    // attachParams={{ nodeType: 'line' }}
                                                    dataUrl={`${ContextPath}/cmdb/getLineIdByName`}
                                                    forceOuterData={true}
                                                    allowClear={false}
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

LineEdit = Form.create()(LineEdit)

export default connect()(LineEdit);