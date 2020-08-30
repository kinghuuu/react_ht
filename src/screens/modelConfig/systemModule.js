import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Spin, Descriptions, Alert, Breadcrumb, Button, Icon, Input, message, Divider, Modal, Row, Col, Table, Upload } from 'antd';
import { queryMainSystemByCode } from '../../actions/modelConfig/action';
import { queryMaintenanceListInfo, deleteMaintenanceById } from '../../actions/maintenance/action'
import Standardtable from '../../components/standardtable';
import styles from './index.module.less';
import SystemEdit from './module/systemEdit'
import { ContextPath } from '../../constants';

const DescriptionsItem = Descriptions;
const { confirm } = Modal;
class SystemModule extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            systemId: '',
            modelInfo: {},
            isShowDynamic: false,
            dynamicPropertieList: [],

            editVisable: false,
            createVisable: false,
            editData: {},   //存储编辑的数据

            rows: [],
            results: '',
            pagination: {
                pageSize: 5,
                total: 0
            }
        };

        const { showModuleDetails, role } = props;

        let isLeader = role === '领导';
        this.columns = [
            { title: '编号', dataIndex: 'serialNumber', width: 60, fixed: 'left', },
            { title: '维保对象名称', dataIndex: 'systemName', width: '10%' },
            { title: '维保模块名称', dataIndex: 'maintenanceName', width: '10%' },
            { title: '采购合同编号', dataIndex: 'buyingContractNum', width: '10%' },
            { title: '维保合同编号', dataIndex: 'maintenanceContractNum', width: '10%' },
            { title: '维保采购负责人', dataIndex: 'maintenanceBuyingUser', width: '10%' },
            { title: '维保周期的起始日期', dataIndex: 'maintenanceCycleStartTimeToString', width: '10%' },
            { title: '维保周期的终止日期', dataIndex: 'maintenanceCycleEndTimeToString', width: '10%' },
            { title: '维保合同总金额', dataIndex: 'maintenanceTotal', width: '10%' },
            { title: '每年维保金额', dataIndex: 'maintenanceCost', width: '10%' },
            { title: '维保服务内容和形式', dataIndex: 'maintenanceContentName', width: '10%' },
            { title: '供应商', dataIndex: 'supplier', width: '10%' },
            {
                title: '操作', dataIndex: 'operation', width: 200, fixed: 'right', render: (value, record) => {
                    return (<Fragment>
                        <a onClick={showModuleDetails.bind(this, record)} style={{ color: 'green' }} >详情</a>
                        {isLeader ? null : (
                            <Fragment>
                                <Divider type="vertical" />
                                <a onClick={this.handleUpdate.bind(this, record)}>编辑</a>
                                <Divider type="vertical" />
                                <a
                                    onClick={this.showDeleteConfirm.bind(this, { record, moduleKey: 'maintenanceName' })}
                                    style={{ color: 'red' }}
                                >删除</a>
                            </Fragment>
                        )}
                    </Fragment>);
                }
            },
        ]
    }

    componentDidMount() {
        this.queryMainSystemByCodes();

        //查询 维保对象信息
        this.queryMaintenanceListInfo()
    }

    componentDidUpdate() {
        const { systemId: _props } = this.props;
        const { systemId: _state } = this.state;
        if (_props && _props !== _state) {
            this.setState(() => ({ systemId: _props }), () => {
                this.queryMainSystemByCodes();
                this.queryMaintenanceListInfo();
            });
        }
    }

    queryMainSystemByCodes = () => {
        const { dispatch, systemId } = this.props;
        let params = { systemCode: systemId };
        if (systemId) {
            this.setState(() => ({ loading: true }));
            dispatch(queryMainSystemByCode(params, res => {
                this.setState(() => ({ modelInfo: res.data, loading: false }));
            }));
        }
    }

    //查询维保列表
    queryMaintenanceListInfo = () => {
        const { dispatch, systemId } = this.props;
        let params = {
            isViewModule: 0,
            systemId: systemId,
        }
        dispatch(queryMaintenanceListInfo(params, result => {
            if (!_.isEmpty(result)) {
                for (let i = 0; i < result.rows.length; i++) {
                    result.rows[i].serialNumber = i + 1
                }
                this.setState({
                    rows: result.rows,
                    results: result.results,
                    pagination: {
                        pageSize: 5,
                        total: result.rows.length
                    }
                })
            }
        }))
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

    //编辑
    handleUpdate = (editData, evt) => {
        evt.stopPropagation();
        this.setState(() => ({
            editVisable: true,
            createVisable: false,
            editData,
        }));
    }

    hideEditModal = () => {
        this.setState(() => ({
            editVisable: false,
            createVisable: false,
        }), this.queryMaintenanceListInfo());
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
        const { nodeType, systemId } = this.props
        let params = encodeURI(`configItemType=${nodeType}&systemId=${systemId}`);
        window.open(`${ContextPath}/maintenance/downloadMaintenanceData?${params}`);
    }


    render() {
        const { nodeType, systemId } = this.props;
        const {
            loading,
            modelInfo: {
                code = '-',
                nameCn = '-', abbrCn = '-',
                nameEn = '-', abbrEn = '-',
                description = '-',
                devMode = '-', phase = '-',
                classificationCode = '-', dept = '-',
                primary = '-', secondary = '-',
                devTeam = '-', opsTeam = '-',
                itso = '-',
            },
            editData, editVisable, createVisable,
            rows, pagination
        } = this.state;

        const uploadProps = {
            name: 'file',
            action: `${ContextPath}/maintenance/importMaintenance`,
            data: { systemId, configItemType: nodeType },
            showUploadList: false,
            beforeUpload: this.beforeUpload,
            onChange: this.handleUploadChange,
        };

        let scrollX = window.document.body.offsetWidth + 200;
        let scrollY = window.document.body.offsetHeight - 230;

        return (
            <Fragment>
                <Spin spinning={loading}>
                    <Col><Alert message='应用系统信息' type='info' /></Col>
                    <Descriptions
                        className={styles.customDescriptions}
                        size='middle'
                        bordered
                        column={2}
                    >
                        <DescriptionsItem label='应用ID：' span={2}>{code}</DescriptionsItem>

                        <DescriptionsItem label='中文全称：'>{nameCn}</DescriptionsItem>
                        <DescriptionsItem label='中文简称：'>{abbrCn}</DescriptionsItem>

                        <DescriptionsItem label='英文全称：'>{nameEn}</DescriptionsItem>
                        <DescriptionsItem label='英文简称：'>{abbrEn}</DescriptionsItem>

                        <DescriptionsItem label='应用描述：' span={2}>{description}</DescriptionsItem>


                        <DescriptionsItem label='开发模式：'>{devMode}</DescriptionsItem>
                        <DescriptionsItem label='所属阶段：'>{phase}</DescriptionsItem>

                        <DescriptionsItem label='应用分级：'>{classificationCode}</DescriptionsItem>
                        <DescriptionsItem label='业务扎口部门：'>{dept}</DescriptionsItem>

                        <DescriptionsItem label='运维主管：'>{primary}</DescriptionsItem>
                        <DescriptionsItem label='运维备岗：'>{secondary}</DescriptionsItem>

                        <DescriptionsItem label='研发职能团队：'>{devTeam}</DescriptionsItem>
                        <DescriptionsItem label='运维智能团队：'>{opsTeam}</DescriptionsItem>

                        <DescriptionsItem label='ITSO：' span={2}>{itso}</DescriptionsItem>
                    </Descriptions>
                </Spin>
                <Spin spinning={loading}>
                    <Col style={{ marginTop: '10px' }}>
                        <div className='ant-alert ant-alert-info' style={{ height: '39px' }}>
                            <span className='ant-alert-message' style={{ marginLeft: '-20px' }} >维保对象信息维护</span>
                            <Button onClick={this.handleCreate} size='small' type='primary' icon="plus" style={{ marginTop: '-6px', marginLeft: '20px' }}>新增</Button>
                            <Button onClick={this.downloadTemplate} size='small' type='primary' icon="download" style={{ marginTop: '-6px', marginLeft: '20px' }}>模板下载</Button>
                            <Upload {...uploadProps}><Button size='small' type='primary' icon="download" style={{ marginTop: '-6px', marginLeft: '20px' }}>导入</Button></Upload>
                            <Button onClick={this.downloadToExcel} size='small' type='primary' icon="upload" style={{ marginTop: '-6px', marginLeft: '20px' }}>导出</Button>
                        </div>
                    </Col>
                    <Table
                        rowKey='id'
                        columns={this.columns}
                        size='middle'
                        scroll={{ x: scrollX, y: scrollY > 460 ? false : scrollY }}
                        dataSource={rows}
                        pagination={pagination}
                    >
                    </Table>

                    {
                        editVisable || createVisable ? (
                            <SystemEdit
                                editData={editData}
                                systemId={systemId}
                                systemName={nameCn}
                                nodeType={nodeType}
                                hideModal={this.hideEditModal}
                            />
                        ) : null
                    }
                </Spin>
            </Fragment>
        );
    }
}


export default connect()(SystemModule);