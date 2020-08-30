import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Form, Input, Modal, message, Row, Col, Button } from 'antd';
import { ContextPath } from '../../../constants';
import { PlainSelector } from '../../../components/selector/selector';
import { updatedblink, createdblink } from '../../../actions/application/database/action'

const formItemLayout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 12 }
};
const FormItem = Form.Item;

//添加dblink弹框
class DBLinkModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            uuid: 1,
            dblinkTabList: [
                { table: '', permission: '', key: 0 },
            ]
        }
    }

    componentDidMount() {
        const { dblinkRecord: { dbInfo = '' } } = this.props;
        let newdbInfo = dbInfo.split(';');
        let tempList = [];

        if (newdbInfo.length) {
            newdbInfo.forEach((item, index) => {
                let reg = /(.+)\((.+)\)/g, reg2 = /[^(]+(?=\))/g;
                tempList.push({
                    table: item.replace(reg, '$1') ? item.replace(reg, '$1') : '',
                    permission: item.match(reg2) ? item.match(reg2)[0] : '',
                    key: index
                });
            });
            this.setState({
                dblinkTabList: tempList
            });
        }
    }

    closeModal = () => {
        let { onClose, form: { resetFields } } = this.props;
        resetFields();
        onClose(false);
    }

    handleSubmit = () => {
        let { form: { validateFields }, dblinkRecord, parentRecord, dispatch } = this.props;
        validateFields((error, fieldsValue) => {
            if (error) {
                return;
            }
            let authValue = '', tabArray = [];
            if (fieldsValue.table) {
                fieldsValue.table.forEach((item, index) => {
                    if (fieldsValue.permission[index] && fieldsValue.permission[index].data) {
                        authValue = _.join(fieldsValue.permission[index].value, ',');
                    } else {
                        authValue = fieldsValue.permission[index];
                    }
                    let info = authValue ? `${item}(${authValue})` : `${item}`;
                    tabArray.push(info);
                });
            }
            let propertyValueDtoList = [{
                'propId': 'userName',
                'propValue': fieldsValue.userNamedblink || ''
            }, {
                'propId': 'dblinkName',
                'propValue': fieldsValue.dblinkName || ''
            }, {
                'propId': 'dblinkSystem',
                'propValue': fieldsValue.dblinkSystem || ''
            }, {
                'propId': 'dbInfo',
                'propValue': tabArray.join(';')
            }];
            let params = {
                'configItemType': 'oracleInnerType',
                'systemId': parentRecord.systemId,
                'parentId': parentRecord.nodeId,
                'propertyValueDtoList': propertyValueDtoList
            };
            if (dblinkRecord.nodeId) {
                params.nodeId = dblinkRecord.nodeId
                dispatch(updatedblink(params, (res) => {
                    if (!res.hasError) {
                        message.success('编辑成功');
                        let { onClose } = this.props;
                        onClose(false, 'update');
                    }

                }));
            } else {
                dispatch(createdblink(params, (res) => {
                    if (!res.hasError) {
                        message.success('保存成功');
                        let { onClose } = this.props;
                        onClose(false, 'update');
                    }
                }));
            }
        });
    }

    addIP = (key) => {
        const { form: { setFieldsValue, getFieldValue } } = this.props;
        const { dblinkTabList } = this.state;
        let tablist = _.cloneDeep(dblinkTabList);
        let newIp = { table: '', permission: '', nodeId: '', key: tablist.length + 1 };
        tablist.push(newIp);
        const tabKeys = _.isEmpty(getFieldValue('table')) ? [] : [...getFieldValue('table')];
        tabKeys.push('');
        const authKeysList = _.isEmpty(getFieldValue('permission')) ? [] : [...getFieldValue('permission')];
        let authKeys = [];
        authKeysList.forEach(item => {
            let value = '';
            if (item && item.data) {
                value = _.join(item.value, ',');
            } else {
                value = item;
            }
            authKeys.push(value);
        });
        authKeys.push('');
        this.setState(() => ({ dblinkTabList: tablist }), () => {
            setFieldsValue({
                table: tabKeys,
                permission: authKeys
            });
        });
    }

    delIP = (key) => {
        const { dblinkTabList } = this.state;
        const { form: { setFieldsValue, getFieldValue } } = this.props;
        let tablist = _.cloneDeep(dblinkTabList);
        tablist.splice(key, 1);
        tablist.forEach((item, index) => {
            item.key = index;
        });
        const curtabKeys = _.isEmpty(getFieldValue('table')) ? [] : [...getFieldValue('table')];
        curtabKeys.splice(key, 1);
        const authKeysList = _.isEmpty(getFieldValue('permission')) ? [] : [...getFieldValue('permission')];
        let authKeys = [];
        authKeysList.forEach(item => {
            let value = '';
            if (item && item.data) {
                value = _.join(item.value, ',');
            } else {
                value = item;
            }
            authKeys.push(value);
        });
        authKeys.splice(key, 1);
        this.setState(() => ({ dblinkTabList: tablist }), () => {
            setFieldsValue({
                table: curtabKeys,
                permission: authKeys,
            });
        });
    }

    render() {
        const { form: { getFieldDecorator }, dblinkRecord, isLook, visible } = this.props;
        const { userName = '', dblinkName, dblinkSystem } = dblinkRecord;
        let { dblinkTabList } = this.state;

        const formItemLayout2 = {
            labelCol: { span: 8 },
            wrapperCol: { span: 15 }
        };
        const IPListInfo = _.map(dblinkTabList, (item, index) => (
            <Row style={{ marginTop: 5, lineHeight: '38px' }} key={'ip' + index}>
                <Col offset={3} span={9}>
                    <FormItem label='开放表名' {...formItemLayout2}>
                        {
                            getFieldDecorator(`table[${item.key}]`, {
                                initialValue: item.table
                            })(
                                <Input placeholder='请输入开放表名' readOnly={isLook} autoComplete='off' />
                            )
                        }
                    </FormItem>
                </Col>
                <Col span={9}>
                    <FormItem label='权限' {...formItemLayout2}>
                        {
                            getFieldDecorator(`permission[${item.key}]`, {
                                initialValue: {
                                    data: [],
                                    value: []
                                }
                            })(
                                <PlainSelector
                                    allowClear={false}
                                    method='get'
                                    mode='multiple'
                                    placeholder='请选择权限'
                                    params={{ cmdbServerType: 'dblinkAuthType' }}
                                    dataUrl={`${ContextPath}/cmdbForService/getServiceType`}
                                    selectedValue={item.permission ? item.permission.split(',') : []} />
                            )
                        }
                    </FormItem>
                </Col>
                <Col span={2}>
                    {
                        (index == 0) ? <Button
                            type='primary'
                            icon='plus'
                            size='small'
                            style={{ background: '#87d068', borderColor: '#87d068' }}
                            onClick={this.addIP.bind(this, item.key)}></Button>
                            :
                            <Button
                                type='danger'
                                icon='close'
                                size='small'
                                onClick={this.delIP.bind(this, item.key)}></Button>
                    }
                </Col>
            </Row>
        ));

        return (
            <Modal
                title={dblinkRecord.nodeId ? '修改dblink' : '新增dblink'}
                visible={visible}
                okText='保存'
                maskClosable={false}
                destroyOnClose={true}
                onOk={this.handleSubmit.bind(this)}
                onCancel={this.closeModal.bind(this)}>
                <Form>
                    <FormItem {...formItemLayout} label='用户名'>
                        {
                            getFieldDecorator('userNamedblink', {
                                rules: [{ required: true, message: '用户名不能为空' }],
                                initialValue: userName
                            })
                                (<Input autoComplete='off' placeholder='请输入用户名' />)}

                    </FormItem>
                    <FormItem {...formItemLayout} label='dblink名称'>
                        {
                            getFieldDecorator('dblinkName', {
                                rules: [{ required: true, message: 'dblink名称不能为空' }],
                                initialValue: dblinkName
                            })
                                (<Input autoComplete='off' placeholder='请输入dblink名称' />)
                        }
                    </FormItem>

                    <FormItem  {...formItemLayout} label='使用系统'>
                        {getFieldDecorator('dblinkSystem', {
                            initialValue: dblinkSystem
                        })(<Input autoComplete='off' placeholder={isLook ? '' : '请输入使用系统'} />)}
                    </FormItem>
                    {IPListInfo}

                </Form>
            </Modal>
        )
    }
}

DBLinkModal = Form.create()(DBLinkModal);

export default connect()(DBLinkModal);