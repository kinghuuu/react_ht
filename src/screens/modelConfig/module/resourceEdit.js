import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import _ from 'lodash';
import { Row, Col, Alert, Modal, Form, Input, Radio, message, Spin, DatePicker, Collapse, TreeSelect } from 'antd';
import { ContextPath } from '../../../constants';
import { PlainSelector } from '../../../components/selector/selector';
import { getSelfDefiningList, } from '../../../actions/selfDefining/action';
import { getParam } from '../../../actions/common/module/action';
import {
    getSelfDefiningValue,
    createModel,
    updateModel,
    saveSelfDefiningValue,
    saveRelationValue,
} from '../../../actions/modelConfig/action';
import { renderFormItems, getFormItemsValue } from '../../common/renderFormItems';
import { FIXED_PROPERTIES, DYNAMIC_PROPERTIES, RELATION_PROPERTIES } from '../common';
import styles from '../index.module.less';

const { Panel } = Collapse,
    { TextArea } = Input,
    FormItem = Form.Item,
    RadioGroup = Radio.Group,
    spanLeft = 22, spanRight = 2,
    formItemLayout = {
        labelCol: { span: 4 },
        wrapperCol: { span: 20 }
    };

class ResourceEdit extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            dynamicPropertieList: [],
        };
    }

    // 确定
    handleOk = (e) => {
        e.preventDefault();
        const { loading, dynamicPropertieList, relationPropertieList } = this.state;
        const { form: { validateFields } } = this.props;
        validateFields((err, values) => {
            if (err) {
                return;
            }
            if (loading) {
                message.warning('请勿重复提交');
            }
            this.setState(() => ({ loading: true }));
            let { dynamicProperties } = getFormItemsValue(values, dynamicPropertieList);
            let properties = { dynamicProperties };
            this.postData(properties);
        });
    }

    // 发送数据
    postData = (_params) => {
        const { dispatch, hideModal, editData = {}, systemId, nodeType } = this.props;
        const { dynamicProperties } = _params;
        const { nodeId } = editData;
        let times = moment().format('YYYY-MM-DD HH:mm:ss');
        let params = {
            systemId, nodeType, nodeId, times,
            propertyDetailList: dynamicProperties
        }

        dispatch(saveSelfDefiningValue(params, res => {
            this.setState(() => ({ loading: false }));
            message.success('自定义属性编辑成功');
            if (_.isFunction(hideModal)) {
                hideModal(true);
            }
        }, (error = '编辑失败') => {
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

    componentDidMount() {
        this.getSelfDefiningList()
    }

    getSelfDefiningList = () => {
        const { dispatch, nodeType, systemId, editData = {} } = this.props;
        const { nodeId } = editData;
        let params = { systemId, nodeType, pageIndex: 0, limit: 100, start: 0 };
        let action = getSelfDefiningList;
        if (nodeId) {
            params.nodeId = nodeId;
            action = getSelfDefiningValue;
        }
        dispatch(action(params, res => {
            let dynamicPropertieList = [];
            if (nodeId) {
                if (res && res.data && res.data.propertyDetailList) {
                    dynamicPropertieList = res.data.propertyDetailList
                }
            } else {
                if (res && res.rows) {
                    dynamicPropertieList = res.rows;
                }
            }
            this.setState(() => ({ dynamicPropertieList }));
        }));
    }

    render() {
        const { loading, dynamicPropertieList, } = this.state;
        const { form } = this.props;

        let height = window.document.body.offsetHeight * 0.6;

        return (
            <Modal
                title='编辑自定义属性'
                visible={true}
                onOk={this.handleOk}
                onCancel={this.handleCancel}
                width={800}
                className={styles.customModal}
                maskClosable={false}
            >
                <Spin spinning={loading}>
                    <div className={styles.customModalBody} style={{ maxHeight: `${height}px`, height: 'auto' }}>
                        <Form>
                            <Row>
                                {/* <Col style={{ marginBottom: '16px' }}><Alert message='自定义属性' type='info' /></Col> */}
                                <Col>
                                    {renderFormItems({
                                        prefix: DYNAMIC_PROPERTIES,
                                        list: dynamicPropertieList,
                                        form, formItemLayout,
                                    })}
                                </Col>
                            </Row>
                        </Form>
                    </div>
                </Spin>
            </Modal>
        );
    }
}

ResourceEdit = Form.create()(ResourceEdit)

export default connect()(ResourceEdit);