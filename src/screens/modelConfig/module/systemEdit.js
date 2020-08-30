import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import _ from 'lodash';
import { Input, Row, Col, Modal, Form, message, Spin, Alert, DatePicker, Select } from 'antd';
import { SearchInput } from '../../../components/searchinput/searchinput';
import { ContextPath } from '../../../constants';
// import { PlainSelector } from '../../../components/selector/selector';
import {
    addMaintenance,
    updateMaintenance,
    selectMaintenanceContent
} from '../../../actions/maintenance/action'
import MantenanceContract from '../../contract/mantenanceContract'
import styles from '../index.module.less';

const { Search } = Input;
const FormItem = Form.Item,
    spanLeft = 22,
    formItemLayout = {
        labelCol: { span: 4 },
        wrapperCol: { span: 20 }
    },
    formItemLayout_Date1 = {
        labelCol: { span: 5 },
        wrapperCol: { span: 19 }
    },
    formItemLayout_Date2 = {
        labelCol: { span: 6 },
        wrapperCol: { span: 18 }
    },
    initFixedPropertieList = [
        { propId: 'systemName', propName: '维保对象名称', propValue: '' },
        { propId: 'maintenanceName', propName: '维保模块名称', propValue: '' },
        { propId: 'buyingContractNum', propName: '采购合同编号', propValue: '' },
        { propId: 'maintenanceContractNum', propName: '维保合同编号', propValue: '' },
        { propId: 'maintenanceBuyingUser', propName: '维保采购负责人', propValue: '' },
        { propId: 'supplier', propName: '供应商', propValue: '' },
        { propId: 'maintenanceTotal', propName: '维保合同总金额', propValue: '' },
        { propId: 'maintenanceCycleStartTime', propName: '维保周期的起始日期', propValue: '' },
        { propId: 'maintenanceCycleEndTime', propName: '维保周期的终止日期', propValue: '' },
        { propId: 'maintenanceStartTime', propName: '维保收费开始日期', propValue: '' },
        { propId: 'renewInsuranceCycleStartTime', propName: '续保周期的起始日期（预计）', propValue: '' },
        { propId: 'renewInsuranceCycleEndTime', propName: '续保周期的终止日期（预计）', propValue: '' },
        { propId: 'maintenanceCost', propName: '每年维保金额', propValue: '' },
        { propId: 'maintenanceContent', propName: '维保服务内容和形式', propValue: '' },
        { propId: 'remark', propName: '备注', propValue: '' },
    ];

class SystemEdit extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            fixedPropertieList: initFixedPropertieList,  //固有属性
            selectedItems: [],    //维保服务内容和形式,已选择项
            OPTIONS: [],     //维保服务内容和形式  

            mantenanceContractTitle: '',   //维保合同弹框的标题
            mantenanceContractVisable: false,    //维保合同弹框显示

            system_id: ''    //用于维保视图管理模块编辑,避免空值
        };
    }

    componentDidMount() {
        const { dispatch } = this.props;
        //维保服务内容和形式
        let params = { param: 'maintenanceContentAndTense' }
        dispatch(selectMaintenanceContent(params, result => {
            let data = []
            if (_.isLength(result.length)) {
                _.forEach(result, (item) => {
                    data.push({ value: item.value, text: item.text })
                })
            }
            this.setState({
                OPTIONS: data
            });
        }));
    }

    //点击确定
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
                let propValue = ''
                if (_.isEqual(propId, 'maintenanceContent')) {
                    propValue = values[propId].join(',')
                } else {
                    propValue = values[propId];
                }
                // 日期
                if (moment.isMoment(propValue)) {
                    // propValue = propValue.format('YYYY-MM-DD HH:mm:ss')
                    propValue = propValue.format('YYYY-MM-DD') + ' 00:00:00'
                }
                // 选择框
                if (_.isObject(propValue)) {
                    //通过value找到text值
                    let { value, data } = propValue
                    propValue = data.find(temp => temp.value === value[0]).text
                }

                return { propId, propValue };
            });
            this.postData({ fixedProperties })
        });
    }

    // 发送数据
    postData = (params) => {
        let { dispatch, hideModal, editData = {}, systemId } = this.props;
        let { system_id } = this.state
        if (_.isEmpty(systemId)) {
            systemId = system_id
        }

        let { fixedProperties } = params;
        const { id } = editData;
        let times = moment().format('YYYY-MM-DD HH:mm:ss');
        const systemName = fixedProperties[0].propValue;
        const maintenanceName = fixedProperties[1].propValue;
        const buyingContractNum = fixedProperties[2].propValue;
        const maintenanceContractNum = fixedProperties[3].propValue;
        const maintenanceBuyingUser = fixedProperties[4].propValue;
        const supplier = fixedProperties[5].propValue;
        const maintenanceTotal = fixedProperties[6].propValue;
        let maintenanceCycleStartTime = fixedProperties[7].propValue;
        let maintenanceCycleEndTime = fixedProperties[8].propValue;
        let maintenanceStartTime = fixedProperties[9].propValue;
        let renewInsuranceCycleStartTime = fixedProperties[10].propValue;
        let renewInsuranceCycleEndTime = fixedProperties[11].propValue;
        const maintenanceCost = fixedProperties[12].propValue;
        const maintenanceContent = fixedProperties[13].propValue;
        const remark = fixedProperties[14].propValue;

        let inUse = 1;

        let newParams = {
            times, systemId, id,
            systemName, maintenanceName, maintenanceBuyingUser, buyingContractNum,
            maintenanceStartTime, maintenanceContractNum,
            maintenanceCycleStartTime, maintenanceCycleEndTime,
            renewInsuranceCycleStartTime, renewInsuranceCycleEndTime,
            maintenanceCost, maintenanceTotal, maintenanceContent,
            supplier, remark, inUse
        }

        let isUpdate = !!id;
        let ecb = (error = '请求错误') => {
            this.setState(() => ({ loading: false }));
            message.error(error);
        }

        let action = addMaintenance;
        if (isUpdate) {
            action = updateMaintenance;
        }

        dispatch(action(newParams, result => {
            this.setState(() => ({ loading: false }));
            message.success(id ? '维保编辑成功' : '维保新增成功');
            if (_.isFunction(hideModal)) {
                hideModal(true, !id);
            }
        }, ecb));
    }

    //点击取消
    handleCancel = () => {
        const { hideModal } = this.props;
        if (_.isFunction(hideModal)) {
            hideModal();
        }
    }

    handleChange = selectedItems => {
        this.setState({ selectedItems });
    };

    //采购合同编号 选择
    buyingContractNumSelect = () => {
        this.setState({
            mantenanceContractTitle: '采购合同编号',   //维保合同弹框的标题
            mantenanceContractVisable: true,    //维保合同弹框显示
        })
    }

    //选择采购合同编号并赋值
    buyingContractNumChoose = (obj) => {
        const { form: { setFieldsValue } } = this.props;
        if (obj) {
            this.setState({
                mantenanceContractVisable: false,    //维保合同弹框显示
            })
            setFieldsValue(obj)
        }
    }

    //维保合同编号 选择
    maintenanceContractNumSelect = () => {
        this.setState({
            mantenanceContractTitle: '维保合同编号',   //维保合同弹框的标题
            mantenanceContractVisable: true,    //维保合同弹框显示
        })
    }

    //选择维保合同编号并赋值相关值
    maintenanceContractNumChoose = (obj) => {
        const { form: { setFieldsValue } } = this.props;
        if (obj) {
            this.setState({
                mantenanceContractVisable: false,    //维保合同弹框显示
            })
            setFieldsValue(obj)
        }
    }

    //取消合同编号 选择
    hideSelectModal = () => {
        this.setState({
            mantenanceContractVisable: false,    //维保合同弹框显示
        })
    }

    render() {
        let {
            loading,
            selectedItems,
            OPTIONS,

            mantenanceContractTitle,
            mantenanceContractVisable,
        } = this.state;

        const {
            systemName, system_name,
            form: { getFieldDecorator, setFieldsValue },
            editData = {},
            isViewModule
        } = this.props;

        let {
            id, systemId,
            maintenanceName = '', maintenanceBuyingUser = '',
            buyingContractNum = '', maintenanceContractNum = '',
            maintenanceStartTime = '',
            maintenanceCycleStartTime = '', maintenanceCycleEndTime = '',
            renewInsuranceCycleStartTime = '', renewInsuranceCycleEndTime = '',
            maintenanceCost = '', maintenanceTotal = '', maintenanceContentName = '', maintenanceContent = '',
            supplier = '', remark = '',
        } = editData;

        let selectedItems_edit = []
        if (maintenanceContent) {
            selectedItems_edit = _.cloneDeep(maintenanceContent).split(',')
        }

        const filteredOptions = OPTIONS.filter(o => !selectedItems.includes(o) && !selectedItems_edit.includes(o))

        //初始化 维保采购负责人
        let initMaintenanceBuyingUser = { data: [], value: [] }
        if (maintenanceBuyingUser) {
            let value = maintenanceBuyingUser.split('(')[1].substring(0, 6)
            initMaintenanceBuyingUser = {
                data: [{ text: maintenanceBuyingUser, value: value }],
                value: [value]
            }
        }

        //初始化 维保对象名称(即系统名称)
        let initSystemName = { data: [], value: [] }
        if (systemId) {
            initSystemName = {
                data: [{ text: system_name, value: systemId }],
                value: [systemId]
            }
        }

        return (
            <Fragment>
                <Modal
                    title={id ? '编辑维保对象' : '新增维保对象'}
                    visible={true}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                    width={800}
                    className={styles.customModal}
                    maskClosable={false}
                >
                    <Spin spinning={loading}>
                        <div className={styles.programConsumeModalBody} >
                            <Form>
                                <Row>
                                    <Col span={spanLeft}>
                                        {
                                            isViewModule ? (
                                                <FormItem label="维保对象名称" {...formItemLayout}>
                                                    {getFieldDecorator('systemName', {
                                                        rules: [{
                                                            required: true,
                                                            validator: (rule, value, callback) => {
                                                                if (_.isEmpty(value && value.value)) {
                                                                    callback('请输入维保对象名称!');
                                                                } else {
                                                                    callback();
                                                                }
                                                            }
                                                        }],
                                                        initialValue: initSystemName
                                                    })
                                                        (
                                                            <SearchInput
                                                                dropdownMenuStyle={{ overflow: 'hidden', maxHeight: '320px' }}
                                                                placeholder='请输入维保对象名称'
                                                                method='get'
                                                                queryName='systemName'
                                                                dataUrl={`${ContextPath}/cmdb/querySystemFuzzy`}
                                                                forceOuterData={true}
                                                                allowClear={false}
                                                                onSelect={(value) => {
                                                                    this.setState({
                                                                        system_id: value
                                                                    })
                                                                }}
                                                            />
                                                        )
                                                    }
                                                </FormItem>
                                            )
                                                :
                                                (
                                                    <FormItem label="维保对象名称"  {...formItemLayout}>
                                                        {getFieldDecorator('systemName', {
                                                            rules: [{ required: true, message: '请输入维保对象名称', }],
                                                            initialValue: systemName
                                                        })
                                                            (<Input disabled autoComplete='off' placeholder='请输入维保对象名称' />)
                                                        }
                                                    </FormItem>
                                                )
                                        }
                                    </Col>
                                    <Col span={spanLeft}>
                                        <FormItem label="维保模块名称"  {...formItemLayout}>
                                            {getFieldDecorator('maintenanceName', {
                                                rules: [{ required: true, message: '请输入维保模块名称', }],
                                                initialValue: maintenanceName
                                            })
                                                (<Input autoComplete='off' placeholder='请输入维保模块名称' />)
                                            }
                                        </FormItem>
                                    </Col>
                                    <Col span={spanLeft}>
                                        <FormItem label="采购合同编号"  {...formItemLayout}>
                                            {getFieldDecorator('buyingContractNum', {
                                                rules: [{ required: true, message: '请输入采购合同编号', }],
                                                initialValue: buyingContractNum
                                            })
                                                // (<Input autoComplete='off' placeholder='请输入采购合同编号' />)
                                                (<Search
                                                    placeholder='请选择采购合同编号'
                                                    enterButton="选择"
                                                    onSearch={this.buyingContractNumSelect}
                                                ></Search>)
                                            }
                                        </FormItem>
                                    </Col>
                                    <Col span={spanLeft}>
                                        <FormItem label="维保合同编号"  {...formItemLayout}>
                                            {getFieldDecorator('maintenanceContractNum', {
                                                rules: [{ required: true, message: '请输入维保合同编号', }],
                                                initialValue: maintenanceContractNum
                                            })
                                                // (<Input autoComplete='off' placeholder='请输入维保合同编号' />)
                                                (<Search
                                                    placeholder='请选择维保合同编号'
                                                    enterButton="选择"
                                                    onSearch={this.maintenanceContractNumSelect}
                                                ></Search>)
                                            }
                                        </FormItem>
                                    </Col>
                                    <Col span={spanLeft}>
                                        <FormItem label="维保采购负责人"  {...formItemLayout}>
                                            {getFieldDecorator('maintenanceBuyingUser', {
                                                rules: [{
                                                    required: true,
                                                    validator: (rule, value, callback) => {
                                                        if (_.isEmpty(value && value.value)) {
                                                            callback('请选择维保采购负责人!');
                                                        } else {
                                                            callback();
                                                        }
                                                    }
                                                }],
                                                initialValue: initMaintenanceBuyingUser
                                            })
                                                (
                                                    <SearchInput
                                                        placeholder='请选择维保采购负责人'
                                                        method='get'
                                                        queryName='keyword'
                                                        dataUrl={`${ContextPath}/cmdbCommon/getUserInfo`}
                                                        forceOuterData={true}
                                                        allowClear={false}
                                                    />
                                                )
                                            }
                                        </FormItem>
                                    </Col>
                                    <Col span={spanLeft}>
                                        <FormItem label="供应商"  {...formItemLayout}>
                                            {getFieldDecorator('supplier', {
                                                rules: [{ required: true, message: '请输入供应商', }],
                                                initialValue: supplier
                                            })
                                                (<Input autoComplete='off' placeholder='请输入供应商' />)
                                            }
                                        </FormItem>
                                    </Col>
                                    <Col span={spanLeft}>
                                        <FormItem label="维保合同总金额"  {...formItemLayout}>
                                            {getFieldDecorator('maintenanceTotal', {
                                                rules: [{ required: true, message: '请输入维保合同总金额', }],
                                                initialValue: maintenanceTotal
                                            })
                                                (<Input autoComplete='off' placeholder='请输入维保合同总金额' />)
                                            }
                                        </FormItem>
                                    </Col>
                                    <Col span={spanLeft} className='formItemInside'>
                                        <Form.Item
                                            label={<span><span style={{ color: 'red', fontSize: '16px' }}>* </span>维保周期的起止日期</span>}
                                            {...formItemLayout_Date1}>
                                            <Form.Item style={{ display: 'inline-block', width: 'calc(50% - 12px)' }}>
                                                {getFieldDecorator('maintenanceCycleStartTime', {
                                                    rules: [{ required: true, message: '请输入维保周期的起始日期', }],
                                                    initialValue: maintenanceCycleStartTime ? moment(maintenanceCycleStartTime, 'YYYY-MM-DD') : null
                                                })
                                                    (<DatePicker
                                                        allowClear={true}
                                                        placeholder='请选择维保周期的起始日期'
                                                        style={{ width: '100%', minWidth: '100px' }}
                                                    />)
                                                }
                                            </Form.Item>
                                            <span
                                                style={{ display: 'inline-block', width: '24px', textAlign: 'center', padding: 0, margin: 0 }}
                                            >
                                                -
                                        </span>
                                            <Form.Item style={{ display: 'inline-block', width: 'calc(50% - 12px)' }}>
                                                {getFieldDecorator('maintenanceCycleEndTime', {
                                                    rules: [{ required: true, message: '请输入维保周期的终止日期', }],
                                                    initialValue: maintenanceCycleEndTime ? moment(maintenanceCycleEndTime, 'YYYY-MM-DD') : null
                                                })
                                                    (<DatePicker
                                                        allowClear={true}
                                                        placeholder='请选择维保周期的终止日期'
                                                        style={{ width: '100%', minWidth: '100px' }}
                                                    />)
                                                }
                                            </Form.Item>
                                        </Form.Item>
                                    </Col>
                                    <Col span={spanLeft}>
                                        <FormItem label='维保收费开始日期' {...formItemLayout}>
                                            {getFieldDecorator('maintenanceStartTime', {
                                                initialValue: maintenanceStartTime ? moment(maintenanceStartTime, 'YYYY-MM-DD') : null
                                            })
                                                (<DatePicker
                                                    allowClear={true}
                                                    placeholder='请选择维保收费开始日期'
                                                    style={{ width: '100%', minWidth: '100px' }}
                                                />)
                                            }
                                        </FormItem>
                                    </Col>
                                    <Col span={spanLeft} className='formItemInside'>
                                        <Form.Item label="续保周期的起止日期（预计）" {...formItemLayout_Date2}>
                                            <Form.Item style={{ display: 'inline-block', width: 'calc(50% - 12px)' }}>
                                                {getFieldDecorator('renewInsuranceCycleStartTime', {
                                                    // rules: [{ required: true, message: '续保周期的起始日期（预计）', }],
                                                    initialValue: renewInsuranceCycleStartTime ? moment(renewInsuranceCycleStartTime, 'YYYY-MM-DD') : null
                                                })
                                                    (<DatePicker
                                                        allowClear={true}
                                                        placeholder='续保周期的起始日期（预计）'
                                                        style={{ width: '100%', minWidth: '100px' }}
                                                    />)
                                                }
                                            </Form.Item>
                                            <span
                                                style={{ display: 'inline-block', width: '24px', textAlign: 'center', padding: 0, margin: 0 }}
                                            >
                                                -
                                        </span>
                                            <Form.Item style={{ display: 'inline-block', width: 'calc(50% - 12px)' }}>
                                                {getFieldDecorator('renewInsuranceCycleEndTime', {
                                                    // rules: [{ required: true, message: '续保周期的终止日期（预计）', }],
                                                    initialValue: renewInsuranceCycleEndTime ? moment(renewInsuranceCycleEndTime, 'YYYY-MM-DD') : null
                                                })
                                                    (<DatePicker
                                                        allowClear={true}
                                                        placeholder='续保周期的终止日期（预计）'
                                                        style={{ width: '100%', minWidth: '100px' }}
                                                    />)
                                                }
                                            </Form.Item>
                                        </Form.Item>
                                    </Col>
                                    <Col span={spanLeft}>
                                        <FormItem label="每年维保金额"  {...formItemLayout}>
                                            {getFieldDecorator('maintenanceCost', {
                                                rules: [{ required: true, message: '请输入每年维保金额', }],
                                                initialValue: maintenanceCost
                                            })
                                                (<Input autoComplete='off' placeholder='请输入每年维保金额' />)
                                            }
                                        </FormItem>
                                    </Col>
                                    <Col span={spanLeft}>
                                        <FormItem label="维保服务内容和形式"  {...formItemLayout}>
                                            {getFieldDecorator('maintenanceContent', {
                                                initialValue: selectedItems_edit
                                            })
                                                (<Select
                                                    mode="multiple"
                                                    placeholder="请输入维保服务内容和形式"
                                                    onChange={this.handleChange}
                                                    style={{ width: '100%' }}
                                                >
                                                    {filteredOptions.map(item => (
                                                        <Select.Option key={item.value} value={item.value}>
                                                            {item.text}
                                                        </Select.Option>
                                                    ))}
                                                </Select>)
                                            }
                                        </FormItem>
                                    </Col>
                                    <Col span={spanLeft}>
                                        <FormItem label="备注"  {...formItemLayout}>
                                            {getFieldDecorator('remark', {
                                                initialValue: remark
                                            })
                                                (<Input autoComplete='off' placeholder='请输入备注' />)
                                            }
                                        </FormItem>
                                    </Col>
                                </Row>
                            </Form>
                        </div>
                    </Spin>
                </Modal>

                {
                    mantenanceContractVisable ? (
                        <MantenanceContract
                            title={mantenanceContractTitle}
                            hideSelectModal={this.hideSelectModal}
                            buyingContractNumChoose={this.buyingContractNumChoose}
                            maintenanceContractNumChoose={this.maintenanceContractNumChoose}
                        ></MantenanceContract>
                    ) : null
                }

            </Fragment>

        );
    }
}

SystemEdit = Form.create()(SystemEdit)

export default connect()(SystemEdit);