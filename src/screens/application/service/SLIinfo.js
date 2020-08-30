import React, { Component, Fragment } from 'react';
import { Row, Col, Button, Upload, Form, Popconfirm, Input, message, Radio, Icon, Select, AutoComplete } from 'antd';
import StandardTable from '../../../components/standardtable';
import { ContextPath } from '../../../constants/index';
import { saveServiceSli, getServiceSliList, getParamListForSli } from '../../../actions/application/service/action'
import _ from 'lodash';
import styles from './index.module.less';
import { connect } from 'react-redux';
const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;

// 服务--SLI页面
class SLIInfo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dropListSource: [],
            dropSource: [],
            savebtn: false,
            ishasSli: true,
            SLIList: [
                { indicatorType: '', indicatorMax: '', indicatorMin: '', indicatorAverage: '', indicatorSla: '', indicatorIsMonitor: '', nodeId: '', key: 0 }
            ]
        };
    }

    queryList() {
        const { dispatch, record } = this.props;
        let params = {
            parentId: record.nodeId
        }
        //编辑时，获取初始化列表数据
        if (record.nodeId) {
            dispatch(getServiceSliList(params, (res) => {
                if (res && res.rows.length) {
                    let indicatorList = res.rows;
                    indicatorList.forEach((item, index) => {
                        item.key = index;
                    });
                    this.setState({
                        SLIList: indicatorList
                    });
                } else {
                    this.setState({
                        ishasSli: false
                    });

                }
            }));
        }
    }

    componentDidMount() {
        const { dispatch } = this.props;
        this.queryList();
        dispatch(getParamListForSli({ paramType: 'sliType' }, (res) => {
            let droplist = res.map(v => v.value);
            this.setState({
                dropListSource: droplist,
                dropSource: droplist
            });
        }));
    }

    handleSave = () => {
        let { form: { validateFields }, record, dispatch } = this.props;
        validateFields((error, fieldsValue) => {
            let allindicatorType = fieldsValue.indicatorType;
            if (allindicatorType && (allindicatorType.length !== _.uniq(allindicatorType).length)) {
                message.warning('当前指标类型存在重复值！');
                return;
            }
            let indicatorList = [], propertyDetailList = [];
            const { SLIList } = this.state;
            if (fieldsValue.indicatorType) {
                fieldsValue.indicatorType.forEach((item, index) => {

                    let isMonitorValue = '';
                    if (fieldsValue.indicatorIsMonitor[index] && fieldsValue.indicatorIsMonitor[index].data) {
                        isMonitorValue = _.join(fieldsValue.indicatorIsMonitor[index].value, ',');
                    } else {
                        isMonitorValue = fieldsValue.indicatorIsMonitor[index];
                    }
                    propertyDetailList = [{
                        'propId': 'indicatorType',
                        'propValue': item || ''
                    }, {
                        'propId': 'indicatorMax',
                        'propValue': fieldsValue.indicatorMax[index] || ''
                    }, {
                        'propId': 'indicatorMin',
                        'propValue': fieldsValue.indicatorMin[index] || ''
                    }, {
                        'propId': 'indicatorAverage',
                        'propValue': fieldsValue.indicatorAverage[index] || ''
                    }, {
                        'propId': 'indicatorSla',
                        'propValue': fieldsValue.indicatorSla[index] || ''
                    }, {
                        'propId': 'indicatorIsMonitor',
                        'propValue': isMonitorValue || ''
                    }];

                    let indicators = { 'nodeName': item, 'systemId': record.systemId, 'propertyDetailList': propertyDetailList };
                    indicators.nodeId = SLIList[index].nodeId ? SLIList[index].nodeId : '';
                    indicatorList.push(indicators);
                });
            }

            let params = {
                'parentId': record.nodeId,
                'hasSli': fieldsValue.hasSli,
                'indicatorList': indicatorList
            };
            this.setState({
                savebtn: true
            });
            dispatch(saveServiceSli(params, (res) => {
                if (!res.hasError) {
                    message.success('保存成功');
                }
                this.setState({
                    savebtn: false
                });
            }));
        });
    }

    addNewRoute = (key) => {
        const { form } = this.props;
        form.validateFieldsAndScroll((errors, values) => {
            // console.log('values', values)
            let allindicatorType = values.indicatorType;
            if (allindicatorType.length !== _.uniq(allindicatorType).length) {
                message.warning('当前指标类型存在重复值！');
                return;
            }
            const { SLIList } = this.state;
            let SLICopy = _.cloneDeep(SLIList);
            let newSLi = { indicatorType: '', indicatorMax: '', indicatorMin: '', indicatorAverage: '', indicatorSla: '', indicatorIsMonitor: '', nodeId: '', key: key + 1 };
            SLICopy.splice(key + 1, 0, newSLi);
            SLICopy.forEach((item, index) => {
                item.key = index;
            });
            const { form: { setFieldsValue, getFieldValue } } = this.props;

            const typeKeys = _.isEmpty(getFieldValue('indicatorType')) ? [] : [...getFieldValue('indicatorType')];
            typeKeys.splice(key + 1, 0, '');
            const maxKeys = _.isEmpty(getFieldValue('indicatorMax')) ? [] : [...getFieldValue('indicatorMax')];
            maxKeys.splice(key + 1, 0, '');
            const minKeys = _.isEmpty(getFieldValue('indicatorMin')) ? [] : [...getFieldValue('indicatorMin')];
            minKeys.splice(key + 1, 0, '');
            const averageKeys = _.isEmpty(getFieldValue('indicatorAverage')) ? [] : [...getFieldValue('indicatorAverage')];
            averageKeys.splice(key + 1, 0, '');
            const slaKeys = _.isEmpty(getFieldValue('indicatorSla')) ? [] : [...getFieldValue('indicatorSla')];
            slaKeys.splice(key + 1, 0, '');
            const isMonitorKeysList = _.isEmpty(getFieldValue('indicatorIsMonitor')) ? [] : [...getFieldValue('indicatorIsMonitor')];
            // console.log('isMonitorKeysList', isMonitorKeysList)
            let isMonitorKeys = [];
            // 循环下拉选择框的值，存在value取值，否则取自己的值,手动重置控件的值
            isMonitorKeysList.forEach(item => {
                let valueMonitor = '';
                if (item && item.data) {
                    valueMonitor = _.join(item.value, ',');
                } else {
                    valueMonitor = item;
                }
                isMonitorKeys.push(valueMonitor);
            });
            isMonitorKeys.splice(key + 1, 0, '');
            // console.log('isMonitorKeys', isMonitorKeys)
            //渲染完成后，form中赋值
            this.setState(() => ({ SLIList: SLICopy }), () => {
                setFieldsValue({
                    indicatorType: typeKeys,
                    indicatorMax: maxKeys,
                    indicatorMin: minKeys,
                    indicatorAverage: averageKeys,
                    indicatorSla: slaKeys,
                    indicatorIsMonitor: isMonitorKeys
                });
            });
        });
    }

    deleteRoute = (key) => {
        const { SLIList } = this.state;
        const { form: { setFieldsValue, getFieldValue } } = this.props;
        let SLICopy = _.cloneDeep(SLIList);
        // 删掉后，再循环列表的key；对应form的各值也重新赋值；
        SLICopy.splice(key, 1);
        SLICopy.forEach((item, index) => {
            item.key = index;
        });
        if (!SLICopy.length) {
            SLICopy = [
                { indicatorType: '', indicatorMax: '', indicatorMin: '', indicatorAverage: '', indicatorSla: '', indicatorIsMonitor: '', nodeId: '', key: 0 }
            ];
        }

        const curTypeKeys = _.isEmpty(getFieldValue('indicatorType')) ? [] : [...getFieldValue('indicatorType')];
        curTypeKeys.splice(key, 1);
        const curMaxKeys = _.isEmpty(getFieldValue('indicatorMax')) ? [] : [...getFieldValue('indicatorMax')];
        curMaxKeys.splice(key, 1);
        const curMinKeys = _.isEmpty(getFieldValue('indicatorMin')) ? [] : [...getFieldValue('indicatorMin')];
        curMinKeys.splice(key, 1);
        const curAverageKeys = _.isEmpty(getFieldValue('indicatorAverage')) ? [] : [...getFieldValue('indicatorAverage')];
        curAverageKeys.splice(key, 1);
        const curSlaKeys = _.isEmpty(getFieldValue('indicatorSla')) ? [] : [...getFieldValue('indicatorSla')];
        curSlaKeys.splice(key, 1);
        const curIsMonitorKeysList = _.isEmpty(getFieldValue('indicatorIsMonitor')) ? [] : [...getFieldValue('indicatorIsMonitor')];
        let curIsMonitorKeys = [];
        curIsMonitorKeysList.forEach(item => {
            let valueMonitor = '';
            if (item && item.data) {
                valueMonitor = _.join(item.value, ',');
            } else {
                valueMonitor = item;
            }
            curIsMonitorKeys.push(valueMonitor);
        });
        curIsMonitorKeys.splice(key, 1);
        this.setState(() => ({ SLIList: SLICopy }), () => {
            if (curTypeKeys.length) {
                setFieldsValue({
                    indicatorType: curTypeKeys,
                    indicatorMax: curMaxKeys,
                    indicatorMin: curMinKeys,
                    indicatorAverage: curAverageKeys,
                    indicatorSla: curSlaKeys,
                    indicatorIsMonitor: curIsMonitorKeys
                });
            } else {
                this.props.form.resetFields();
            }

        });
    }

    // 上传前钩子函数 false||Promise.reject阻止上传
    beforeUpload = (file) => {
        if (_.divide(file.size, 1024 * 1024) >= 20) {
            message.error(`${file.name}上传失败，文件大小不能超过20M！`);
            return false;
        }
        return true;
    }

    handleChange = (info) => {
        let fileList = info.fileList;
        // 控制大小在20M以内
        fileList = _.filter(fileList, function (file) {
            return file.size === undefined || _.divide(file.size, 1024 * 1024) <= 20;
        });
        if (info.file.status === 'done') {
            if (info.file.response && !info.file.response.hasError && info.file.uid) {
                message.success(`${info.file.name} 上传成功！`);
                this.queryList();
            } else {
                let failReason = info.file.response ? info.file.response.error : '上传接口出错！';
                message.error(`${info.file.name} 上传失败！原因：${failReason}`);
                return;
            }
        } else if (info.file.status === 'error') {
            message.error(`${info.file.name} 上传失败！`);
        }
    }

    render() {
        let { isLook, record, form: { getFieldDecorator, getFieldValue } } = this.props;
        const { systemId } = record;
        const formItemLayout2 = {
            labelCol: { span: 6 },
            wrapperCol: { span: 12 }
        };
        const { dropListSource, SLIList, ishasSli } = this.state;
        const uploadProps = {
            data: {
                systemId, parentId: record.nodeId, configItemType: 'serviceSli'
            },
            name: 'file',
            action: `${ContextPath}/cmdbCommon/import`,
            showUploadList: false,
            onChange: this.handleChange.bind(this),
            beforeUpload: this.beforeUpload.bind(this)
        };
        const columns = [
            {
                title: '指标类型', dataIndex: 'indicatorType', width: '15%', editable: true,
                render: (indicatorType, record, index) => {
                    return (
                        <Fragment>
                            <FormItem style={{ margin: 0 }}>
                                {getFieldDecorator(`indicatorType[${record.key}]`, {
                                    initialValue: indicatorType
                                })
                                    (<AutoComplete
                                        dataSource={dropListSource}
                                        disabled={isLook} />)
                                }
                            </FormItem>
                        </Fragment>)
                }
            },
            {
                title: '动态最大值', dataIndex: 'indicatorMax', width: '14%', editable: true,
                render: (indicatorMax, record, index) => {
                    return (
                        <FormItem style={{ margin: 0 }}>
                            {getFieldDecorator(`indicatorMax[${record.key}]`, {
                                initialValue: indicatorMax
                            })(<Input readOnly={isLook} autoComplete='off' />)}
                        </FormItem>
                    )
                }
            },
            {
                title: '动态最小值', dataIndex: 'indicatorMin', width: '14%', editable: true,
                render: (indicatorMin, record, index) => {
                    return (
                        <FormItem style={{ margin: 0 }}>
                            {getFieldDecorator(`indicatorMin[${record.key}]`, {
                                initialValue: indicatorMin
                            })(<Input readOnly={isLook} autoComplete='off' />)}
                        </FormItem>
                    )
                }
            },
            {
                title: '动态均值', dataIndex: 'indicatorAverage', width: '14%', editable: true,
                render: (indicatorAverage, record, index) => {
                    return (
                        <FormItem style={{ margin: 0 }}>
                            {getFieldDecorator(`indicatorAverage[${record.key}]`, {
                                initialValue: indicatorAverage
                            })(<Input readOnly={isLook} autoComplete='off' />)}
                        </FormItem>
                    )
                }
            },
            {
                title: 'SLO', dataIndex: 'indicatorSla', width: '14%', editable: true,
                render: (indicatorSla, record, index) => {
                    return (
                        <FormItem style={{ margin: 0 }}>
                            {getFieldDecorator(`indicatorSla[${record.key}]`, {
                                initialValue: indicatorSla
                            })(<Input readOnly={isLook} autoComplete='off' />)}
                        </FormItem>
                    )
                }
            },
            {
                title: '是否监控', dataIndex: 'indicatorIsMonitor', width: '14%', editable: true,
                render: (indicatorIsMonitor, record, index) => {
                    return (<Fragment>
                        <FormItem style={{ margin: 0 }}>
                            {getFieldDecorator(`indicatorIsMonitor[${record.key}]`, {
                                initialValue: indicatorIsMonitor
                            })(<Select disabled={isLook} >
                                <Option value="1">是</Option>
                                <Option value="0">否</Option>
                            </Select>)
                            }
                        </FormItem>
                    </Fragment>)
                }
            },
        ];
        if (!isLook) {
            columns.push({
                title: '操作', dataIndex: 'operator', width: '12%',
                render: (text, record, index) => {
                    return (<Fragment>
                        <Icon
                            type="plus-circle"
                            title='添加'
                            style={{ marginRight: 8, fontSize: '14px', color: '#1890ff' }}
                            onClick={this.addNewRoute.bind(this, record.key)} />
                        <Popconfirm
                            placement='top'
                            title='确认删除记录?'
                            onConfirm={this.deleteRoute.bind(this, record.key)}
                            okText='确定'
                            cancelText='取消'>
                            <Icon
                                type="close-circle"
                                style={{ fontSize: '14px', color: '#ff4d4f' }}
                                title='删除' />
                        </Popconfirm>
                    </Fragment>)
                }
            });
        }
        return (
            <Form>
                {!isLook && <Button className={styles.baseinfo_save}
                    type='primary' size='small'
                    disabled={this.state.savebtn}
                    onClick={this.handleSave}>保存</Button>
                }
                {!isLook && <Row style={{ marginTop: 2 }}><Col span={10}>
                    <Upload {...uploadProps}>
                        <Button
                            type='primary'
                            size='small'
                            icon='import'
                            style={{ backgroundColor: '#f0ad4e', borderColor: '#eea236' }}>导入SLI</Button>
                    </Upload>
                    <Button
                        type='primary'
                        size='small'
                        icon='download'
                        onClick={() => window.open(`${ContextPath}/cmdbCommon/downloadTemp?configItemType=serviceSli`)}
                        style={{ backgroundColor: '#f0ad4e', borderColor: '#eea236', marginLeft: 8 }}>模板下载</Button>
                </Col></Row>}
                <Row style={{ marginTop: 5 }}>
                    <Col span={10}>
                        <FormItem {...formItemLayout2} label='是否具备SLI'>
                            {
                                getFieldDecorator('hasSli', {
                                    rules: [
                                        { required: true, message: '请选择是否具备SLI！' },
                                    ],
                                    initialValue: ishasSli ? '1' : '0'
                                })(
                                    <RadioGroup disabled={isLook}>
                                        <Radio value='1'>是</Radio>
                                        <Radio value='0'>否</Radio>
                                    </RadioGroup>
                                )
                            }
                        </FormItem>
                    </Col>
                </Row>
                {
                    getFieldValue('hasSli') == '1' ? (<Row>
                        <Col span={24}>
                            <StandardTable
                                rowKey='key'
                                style={{ borderTop: '#e8e8e8 solid 1px' }}
                                data={{
                                    list: SLIList,
                                    pagination: false
                                }}
                                columns={columns} />
                        </Col>
                    </Row>) : null
                }
            </Form>
        );
    }
}

SLIInfo = Form.create()(SLIInfo)
export default connect()(SLIInfo);
