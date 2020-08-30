import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import ApplicationTitle from '../common/applicationTitle'
import { Drawer, Form, Input, Button, Card, Col, Row, Table, Alert, message, Modal, Descriptions, Divider, Upload } from 'antd';
import Standardtable from '../../components/standardtable';
import styles from './index.module.less';
import {
    queryMaintenanceListInfo,
    deleteMaintenanceById
} from '../../actions/maintenance/action'
import { ContextPath } from '../../constants';
import SystemEdit from '../modelConfig/module/systemEdit'

const FormItem = Form.Item;
const Item = Descriptions.Item;
const { confirm } = Modal;
class Maintenance extends Component {
    constructor(props) {
        super(props);
        this.state = {
            detailsVisable: false,
            detailsData: {},

            editVisable: false,
            createVisable: false,
            editData: {},   //存储编辑的数据

            initSearchData: { data: [], value: [] },
            system_name: ''   //供维保视图管理模块编辑传入 systemName,避免与另一个维保编辑冲突
        };

        this.columns = [
            { title: '编号', dataIndex: 'serialNumber', width: 60, fixed: 'left', },
            { title: '维保对象名称', dataIndex: 'systemName', width: '10%' },
            { title: '维保模块名称', dataIndex: 'maintenanceName', width: '10%' },
            { title: '维保采购负责人', dataIndex: 'maintenanceBuyingUser', width: '10%' },
            { title: '采购合同编号', dataIndex: 'buyingContractNum', width: '10%' },
            { title: '维保合同编号', dataIndex: 'maintenanceContractNum', width: '10%' },
            {
                title: '维保周期的起始日期', dataIndex: 'maintenanceCycleStartTime', width: '10%', render: (value = '') => {
                    if (value) {
                        value = value.split(' ')[0]
                    }
                    return value
                }
            },
            {
                title: '维保周期的终止日期', dataIndex: 'maintenanceCycleEndTime', width: '10%', render: (value = '') => {
                    if (value) {
                        value = value.split(' ')[0]
                    }
                    return value
                }
            },
            { title: '维保合同总金额', dataIndex: 'maintenanceTotal', width: '10%' },
            { title: '每年维保金额', dataIndex: 'maintenanceCost', width: '10%' },
            { title: '维保服务内容和形式', dataIndex: 'maintenanceContentName', width: '10%' },
            { title: '供应商', dataIndex: 'supplier', width: '10%' },
            {
                title: '操作', dataIndex: 'operation', width: 160, fixed: 'right', render: (value, record) => {
                    return (<Fragment>
                        <a onClick={this.showModuleDetails.bind(this, record)} style={{ color: 'green' }} >详情</a>
                        <Divider type="vertical" />
                        <a onClick={this.handleUpdate.bind(this, record)}>编辑</a>
                        <Divider type="vertical" />
                        <a
                            onClick={this.showDeleteConfirm.bind(this, { record, moduleKey: 'maintenanceName' })}
                            style={{ color: 'red' }}
                        >删除</a>
                    </Fragment>);
                }
            },
        ]
    }

    componentDidMount() {
        //查询 维保对象信息
        this.queryMaintenanceListInfo()
    }

    //查询维保列表
    queryMaintenanceListInfo = () => {
        const { dispatch, systemId, pagination: { limit } } = this.props;

        let params = {
            isViewModule: 1,
            systemId: systemId,
            pageIndex: 0,
            limit,
            systemName: '',
            maintenanceName: '',
            maintenanceBuyingUser: '',
            buyingContractNum: '',
            maintenanceContractNum: '',
            supplier: ''
        }
        dispatch(queryMaintenanceListInfo(params))
    }

    //新增
    handleCreate = (e) => {
        e.preventDefault();
        this.setState({
            editVisable: false,
            createVisable: true,
            editData: {}
        })
    }

    handleUpdate = (editData, evt) => {
        let { systemName } = editData
        evt.stopPropagation();
        this.setState(() => ({
            editVisable: true,
            createVisable: false,
            editData,
            system_name: systemName
        }));
    }

    //删除提醒
    showDeleteConfirm = (params, evt) => {
        evt.stopPropagation();
        const { record, moduleKey } = params;

        let descriptions = '';
        if (record) {
            descriptions = `你确认删除 ${record[moduleKey]} 这条维保数据吗？`;
        }

        confirm({
            title: '删除提醒',
            content: descriptions,
            okText: '确认',
            okType: 'primary',
            cancelText: '取消',
            onOk: () => {
                this.handleDelete(params);
            },
        });
    }

    //执行删除并刷新列表
    handleDelete = (params) => {
        const { dispatch } = this.props;
        const { record } = params;
        let param = { id: record.id }
        dispatch(deleteMaintenanceById(param, (result) => {
            message.success(`${record.maintenanceName} 删除成功`);
            this.queryMaintenanceListInfo()
        }, (error = '请求错误') => {
            message.error(error)
        }));
    }

    // 详情
    showModuleDetails = (record, evt) => {
        evt.stopPropagation();
        this.setState(() => ({ detailsVisable: true, detailsData: record }));
    }
    // 关闭详情弹窗
    hideModuleDetails = () => {
        this.setState(() => ({ detailsVisable: false, detailsData: {} }));
    }

    // 查询
    handleSearch = () => {
        const { dispatch, pagination: { limit } } = this.props
        let params = {
            isViewModule: 1,
            pageIndex: 0,
            limit,
            systemName: systemName.value,
            maintenanceName: maintenanceName.value,
            maintenanceBuyingUser: maintenanceBuyingUser.value,
            buyingContractNum: buyingContractNum.value,
            maintenanceContractNum: maintenanceContractNum.value,
            supplier: supplier.value
        }
        dispatch(queryMaintenanceListInfo(params))
    }

    // 重置
    handleReset = () => {
        const { form: { setFieldsValue }, pagination: { limit } } = this.props;
        setFieldsValue({
            systemName: '',
            maintenanceName: '',
            maintenanceBuyingUser: '',
            buyingContractNum: '',
            maintenanceContractNum: '',
            supplier: '',
        })
        setTimeout(() => {
            this.queryMaintenanceListInfo({ isViewModule: 1, limit, pageIndex: 0 });
        }, 100);
    }

    // 翻页
    handlePaginationChange = (pagination) => {
        const { dispatch } = this.props
        if (!_.isEmpty(pagination)) {
            const { current, pageSize } = pagination;
            dispatch(queryMaintenanceListInfo({ isViewModule: 1, limit: pageSize, pageIndex: (current - 1), start: (current - 1) * pageSize }));
        }
    }

    //下载模板
    downloadTemplate = () => {
        let { nodeType, systemId } = this.props
        let params = encodeURI(`configItemType=${nodeType}&systemId=${systemId}`);
        window.open(`${ContextPath}/maintenance/downloadMaintenanceExcel?${params}`);
    };

    // 导入前钩子函数 false||Promise.reject阻止上传
    beforeUpload = (file) => {
        if (_.divide(file.size, 1024 * 1024) >= 20) {
            message.error(`${file.name}上传失败，文件大小不能超过20M！`);
            return false;
        }
        return true;
    }

    //导入
    handleUploadChange = (info = {}) => {
        let fileList = info.fileList || [];
        // 控制大小在20M以内
        fileList = _.filter(fileList, function (file) {
            return file.size === undefined || _.divide(file.size, 1024 * 1024) <= 20;
        });
        if (info.file && info.file.status === 'done') {
            if (info.file.response && !info.file.response.hasError && info.file.uid) {
                message.success(`${info.file.name} 导入成功！`);
                this.queryMaintenanceListInfo();
            } else {
                let failReason = info.file.response ? info.file.response.error : '导入接口出错！';
                message.error(`${failReason}`);
                return;
            }
        } else if (info.file && info.file.status === 'error') {
            message.error(`${info.file.name} 导入失败！`);
        }
    }

    //导出
    downloadToExcel = () => {
        const { systemId = '', form: { getFieldValue } } = this.props
        let systemName = getFieldValue('systemName')
        let maintenanceName = getFieldValue('maintenanceName')
        let maintenanceBuyingUser = getFieldValue('maintenanceBuyingUser')
        let buyingContractNum = getFieldValue('buyingContractNum')
        let maintenanceContractNum = getFieldValue('maintenanceContractNum')
        let supplier = getFieldValue('supplier')
        let params = encodeURI(`systemId=${systemId}&systemName=${systemName}&maintenanceName=${maintenanceName}&maintenanceBuyingUser=${maintenanceBuyingUser}&buyingContractNum=${buyingContractNum}&maintenanceContractNum=${maintenanceContractNum}&supplier=${supplier}`);
        window.open(`${ContextPath}/maintenance/downloadMaintenanceData?${params}`);
    }

    hideEditModal = () => {
        const { dispatch, form: { getFieldValue } } = this.props;

        let systemName = getFieldValue('systemName')
        let maintenanceName = getFieldValue('maintenanceName')
        let maintenanceBuyingUser = getFieldValue('maintenanceBuyingUser')
        let buyingContractNum = getFieldValue('buyingContractNum')
        let maintenanceContractNum = getFieldValue('maintenanceContractNum')
        let supplier = getFieldValue('supplier')

        this.setState(() => ({
            editVisable: false,
            createVisable: false,
        }));

        let params = {
            isViewModule: 1,
            pageIndex: 0,
            limit: 50,
            systemName: systemName,
            maintenanceName: maintenanceName,
            maintenanceBuyingUser: maintenanceBuyingUser,
            buyingContractNum: buyingContractNum,
            maintenanceContractNum: maintenanceContractNum,
            supplier: supplier
        }
        dispatch(queryMaintenanceListInfo(params))

        // this.setState(() => ({
        //     editVisable: false,
        //     createVisable: false,
        // }), this.queryMaintenanceListInfo());
    }


    render() {
        const {
            form: { getFieldDecorator },
            rows, results, tableLoading, pagination,
            nodeType, systemId
        } = this.props;

        const {
            detailsVisable, detailsData,
            editData, editVisable, createVisable,
            system_name
        } = this.state

        const {
            id,
            systemName, maintenanceName, maintenanceBuyingUser,
            buyingContractNum, maintenanceContractNum,
            maintenanceStartTime,
            maintenanceCycleStartTime, maintenanceCycleEndTime,
            renewInsuranceCycleStartTime, renewInsuranceCycleEndTime,
            maintenanceCost, maintenanceTotal, maintenanceContentName,
            supplier, remark
        } = detailsData

        let _maintenanceStartTime = '', _maintenanceCycleStartTime = '', _maintenanceCycleEndTime = '',
            _renewInsuranceCycleStartTime = '', _renewInsuranceCycleEndTime = '';
        if (maintenanceStartTime) {
            _maintenanceStartTime = maintenanceStartTime.substring(0, 10)
        }
        if (maintenanceCycleStartTime) {
            _maintenanceCycleStartTime = maintenanceCycleStartTime.substring(0, 10)
        }
        if (maintenanceCycleEndTime) {
            _maintenanceCycleEndTime = maintenanceCycleEndTime.substring(0, 10)
        }
        if (renewInsuranceCycleStartTime) {
            _renewInsuranceCycleStartTime = renewInsuranceCycleStartTime.substring(0, 10)
        }
        if (renewInsuranceCycleEndTime) {
            _renewInsuranceCycleEndTime = renewInsuranceCycleEndTime.substring(0, 10)
        }

        let scrollX = window.document.body.offsetWidth + 200;
        let scrollY = window.document.body.offsetHeight - 270;
        let width = window.document.body.offsetWidth * 0.5;

        const uploadProps = {
            name: 'file',
            action: `${ContextPath}/maintenance/importMaintenance`,
            data: { systemId, configItemType: nodeType },
            showUploadList: false,
            beforeUpload: this.beforeUpload,
            onChange: this.handleUploadChange,
        };

        return (
            <div className={styles.block_body} >
                <ApplicationTitle
                    firstBreadcrumb='配置中心'
                    secondBreadcrumb='维保视图管理'
                    appSelectVisable={false}
                />
                <Form layout="inline" style={{ marginLeft: '10px' }}>
                    <FormItem label='维保对象名称'>
                        {getFieldDecorator('systemName', {
                            initialValue: ''
                        })
                            (<Input autoComplete='off' />)
                        }
                    </FormItem>
                    <FormItem label='维保模块名称'>
                        {getFieldDecorator('maintenanceName', {
                            initialValue: ''
                        })
                            (<Input autoComplete='off' />)
                        }
                    </FormItem>
                    <FormItem label='维保采购负责人'>
                        {getFieldDecorator('maintenanceBuyingUser', {
                            initialValue: ''
                        })
                            (<Input autoComplete='off' />)
                        }
                    </FormItem>
                    <FormItem label='采购合同编号'>
                        {getFieldDecorator('buyingContractNum', {
                            initialValue: ''
                        })
                            (<Input autoComplete='off' />)
                        }
                    </FormItem>
                </Form>
                <Form layout="inline" style={{ marginLeft: '10px' }}>
                    <FormItem label='维保合同编号'>
                        {getFieldDecorator('maintenanceContractNum', {
                            initialValue: ''
                        })
                            (<Input autoComplete='off' />)
                        }
                    </FormItem>
                    <FormItem label='供应商'>
                        {getFieldDecorator('supplier', {
                            initialValue: ''
                        })
                            (<Input autoComplete='off' />)
                        }
                    </FormItem>
                    <FormItem>
                        <Button
                            onClick={this.handleSearch}
                            type='primary'
                        >查询</Button>
                    </FormItem>
                    <FormItem>
                        <Button onClick={this.handleReset} type='primary' >重置</Button>
                    </FormItem>
                    <FormItem>
                        <Button onClick={this.handleCreate} type='primary' >新增</Button>
                    </FormItem>
                    <FormItem>
                        <Button onClick={this.downloadTemplate} type='primary' >模板下载</Button>
                    </FormItem>
                    <FormItem>
                        <Upload {...uploadProps}><Button type='primary'>导入</Button></Upload>
                    </FormItem>
                    <FormItem>
                        <Button onClick={this.downloadToExcel} type='primary' >导出</Button>
                    </FormItem>
                </Form>

                <Standardtable
                    style={{ borderTop: '#eee solid 1px' }}
                    rowKey='id'
                    loading={tableLoading}
                    columns={this.columns}
                    size='middle'
                    scroll={{ x: scrollX, y: scrollY >= 460 ? false : scrollY }}
                    data={{
                        list: rows,
                        pagination: {
                            current: pagination.pageIndex + 1,
                            pageSize: pagination.limit,
                            total: results
                        }
                    }}
                    onChange={this.handlePaginationChange.bind(this)}
                />

                {
                    detailsVisable ? (
                        <Drawer
                            title={`${maintenanceName}详情`}
                            placement='right'
                            closable={false}
                            onClose={this.hideModuleDetails}
                            visible={true}
                            width={width}
                        >
                            <Fragment>
                                <Alert message='基本信息' type='info' style={{ margin: '16px 0px' }} />
                                <Descriptions
                                    className={styles.customDescriptions}
                                    bordered
                                    column={1}
                                    size='middle'
                                    style={{ marginTop: '0px' }}
                                >
                                    <Item label='维保对象名称'>{systemName}</Item>
                                    <Item label='维保模块名称'>{maintenanceName}</Item>
                                    <Item label='维保采购负责人'>{maintenanceBuyingUser}</Item>
                                    <Item label='采购合同编号'>{buyingContractNum}</Item>
                                    <Item label='维保合同编号'>{maintenanceContractNum}</Item>
                                    <Item label='维保收费开始日期：'>{_maintenanceStartTime}</Item>
                                    <Item label='维保周期的起止日期: '>{_maintenanceCycleStartTime} ~ {_maintenanceCycleEndTime}</Item>
                                    {
                                        _renewInsuranceCycleStartTime ?
                                            <Item label='续保周期的起止日期（预计）：'>{_renewInsuranceCycleStartTime} ~ {_renewInsuranceCycleEndTime}</Item>
                                            :
                                            <Item label='续保周期的起止日期（预计）：'>{_renewInsuranceCycleStartTime}  {_renewInsuranceCycleEndTime}</Item>
                                    }
                                    <Item label='维保合同总金额：'>{maintenanceTotal}</Item>
                                    <Item label='每年维保金额：'>{maintenanceCost}</Item>
                                    <Item label='维保服务内容和形式：'>{maintenanceContentName}</Item>
                                    <Item label='供应商:'>{supplier}</Item>
                                    <Item label='备注：'>{remark}</Item>
                                </Descriptions>
                            </Fragment>
                        </Drawer>
                    )
                        :
                        null
                }

                {
                    editVisable || createVisable ? (
                        <SystemEdit
                            isViewModule={true}
                            editData={editData}
                            hideModal={this.hideEditModal}
                            system_name={system_name}
                        />
                    ) : null
                }
            </div>
        );
    }
}
const mapStateToProps = (state) => {
    const { rows, results, tableLoading, pagination } = state.maintenance;
    return { rows, results, tableLoading, pagination };
}

Maintenance = Form.create()(Maintenance)

export default connect(mapStateToProps)(Maintenance);