import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import _ from 'lodash';
import { Drawer, Tabs, Alert, Descriptions, Collapse } from 'antd';
import Standardtable from '../../../components/standardtable';
import {
    getRelationValue,
    getSelfDefiningValue,
    getChangeList,
    getModelInfoByBodeId,
    getResourceInfoByNodeId
} from '../../../actions/modelConfig/action';
import {
    selectMaintenanceById
} from '../../../actions/maintenance/action'
import styles from '../index.module.less';

const { TabPane } = Tabs;
const Item = Descriptions.Item;
const { Panel } = Collapse;

class ModuleDetails extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,

            detailsData: {},
            relationPropertie: [],
            dynamicPropertieList: [],
            changeList: [],

        };
        this.columns = [
            {
                title: '操作类型', dataIndex: 'changeType', width: '15%',
                render: (changeType = '修改', record) => (
                    <span> {changeType} </span>
                )
            },
            {
                title: '变更人', dataIndex: 'changeOperator', width: '20%',
            },
            {
                title: '变更内容', dataIndex: 'changeDetails', width: '40%',
                render: (changeInfo = [], record) => {
                    return (
                        <div>
                            <span>{record.changeDescription}</span>
                            {changeInfo.length && changeInfo.map((item, index) => {
                                let oldValue = item.oldValue ? item.oldValue : '',
                                    newValue = item.newValue ? item.newValue : '',
                                    propName = item.propName ? item.propName : '',
                                    arrayItems = '';
                                //是字符串数组或 数组里包含着changeDetails时
                                if (_.isArray(item)) {
                                    arrayItems = _.map(item, (oracle, index) => (
                                        (oracle.changeDetails && oracle.changeDetails.length) ?
                                            _.map(oracle.changeDetails, (detail, index) => (
                                                <div key={'oracle' + index}>
                                                    <span style={{ color: 'red' }}>{detail.propName}:</span> &nbsp;
                                                    {detail.oldValue} &nbsp;->&nbsp;{detail.newValue}
                                                </div>
                                            )) :
                                            <div key={'item' + index}>
                                                <span>{oracle}</span> </div>
                                    ));
                                }
                                if (_.isString(item)) {
                                    arrayItems = item;
                                }
                                return (
                                    <div key={'info' + index}>
                                        <div>{item.changeDescription}</div>
                                        <div key={'change' + index}>
                                            {(_.isArray(item) || _.isString(item)) && arrayItems}
                                            {(item.propName || item.oldValue || item.newValue) &&
                                                <span>
                                                    <span style={{ color: 'red' }}>{propName}:</span> &nbsp;
                              {oldValue} &nbsp;->&nbsp;{newValue}
                                                </span>}
                                            {(item.changeDetails && item.changeDetails.length) &&
                                                _.map(item.changeDetails, (detail, index) => (
                                                    <div key={'detail' + index}>
                                                        <span style={{ color: 'red' }}>{detail.propName}:</span> &nbsp;
                                                        {detail.oldValue} &nbsp;->&nbsp;{detail.newValue}
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                )
                            }) || <span>{!record.changeDescription && '无'}</span>
                            }
                        </div>
                    )
                }
            },
            { title: '变更时间', dataIndex: 'changeTime', width: '25%' },
        ];
    }
    // 获取基本信息
    getBasicInfoByBodeId = () => {
        const { dispatch, nodeType, systemId, detailsData = {} } = this.props;
        const { nodeId } = detailsData;
        let action = getModelInfoByBodeId;
        let params = { systemId, configItemType: nodeType, nodeId };
        if (nodeType === 'resource') {
            action = getResourceInfoByNodeId;
            params = { nodeId, systemId };
        }
        dispatch(action(params, res => {
            let detailsData = res.data;
            this.setState(() => ({ detailsData }));
        }));
    }
    // 获取自定义属性
    getSelfDefiningValue = () => {
        const { dispatch, nodeType, systemId, detailsData = {} } = this.props;
        const { nodeId } = detailsData;
        let params = { systemId, nodeType, nodeId, pageIndex: 0, limit: 100, start: 0 };
        dispatch(getSelfDefiningValue(params, res => {
            let dynamicPropertieList = res.data.propertyDetailList;
            this.setState(() => ({ dynamicPropertieList }));
        }));
    }
    // 获取联动属性
    getRelationValue = () => {
        const { dispatch, detailsData = {} } = this.props;
        const { nodeId } = detailsData;
        dispatch(getRelationValue({ parentId: nodeId }, (res = { rows: [] }) => {
            this.setState(() => ({ relationPropertieList: res.rows }));
        }));
    }
    // 获取变更信息
    getChangeList = () => {
        const { dispatch, detailsData = {}, nodeType } = this.props;
        const { nodeId } = detailsData;
        dispatch(getChangeList({ nodeId, nodeType }, res => {
            this.setState(() => ({ changeList: res.rows }));
        }));
    }

    //获取维保信息
    selectMaintenanceById = () => {
        const { dispatch, detailsData } = this.props;
        let params = { id: detailsData.id };
        dispatch(selectMaintenanceById(params, res => {
            this.setState(() => ({ detailsData: res.data }));
        }));
    }

    componentDidMount() {
        const { nodeType } = this.props;
        if (nodeType === 'system') {
            this.selectMaintenanceById()
        } else {
            this.getBasicInfoByBodeId();
        }
        this.getSelfDefiningValue();
        this.getRelationValue();
        this.getChangeList();
    }

    // 渲染基本信息
    renderBasicInfo = () => {
        const { nodeType } = this.props;
        const { detailsData } = this.state;

        let renderSystem = () => {
            const {
                systemName, maintenanceName, maintenanceBuyingUser,
                buyingContractNum, maintenanceContractNum, maintenanceStartTime,
                maintenanceCycleStartTime, maintenanceCycleEndTime,
                renewInsuranceCycleStartTime, renewInsuranceCycleEndTime,
                maintenanceCost, maintenanceTotal, maintenanceContentName,
                supplier, remark,
            } = detailsData;

            let _maintenanceStartTime = '', _maintenanceCycleStartTime = '', _maintenanceCycleEndTime = '',
                _renewInsuranceCycleStartTime = '', _renewInsuranceCycleEndTime = ''
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

            return (<Fragment>
                <Alert message='基本信息' type='info' style={{ margin: '16px 0px' }} />
                <Descriptions
                    className={styles.customDescriptions}
                    bordered
                    column={1}
                    size='middle'
                    style={{ marginTop: '0px' }}
                >
                    <Item label='维保对象名称：'>{systemName}</Item>
                    <Item label='维保模块名称：'>{maintenanceName}</Item>
                    <Item label='维保采购负责人：'>{maintenanceBuyingUser}</Item>
                    <Item label='采购合同编号：'>{buyingContractNum}</Item>
                    <Item label='维保合同编号：'>{maintenanceContractNum}</Item>
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
                    <Item label='供应商：'>{supplier}</Item>
                    <Item label='备注：'>{remark}</Item>
                </Descriptions>
            </Fragment>)
        };

        let renderProgram = () => {
            const {
                moduleName, moduleTypeName, moduleVersion, lastUpTime,
                clusteredTypeName, path, port, deployAccount, description
            } = detailsData;
            return (<Fragment>
                <Alert message='基本信息' type='info' style={{ margin: '16px 0px' }} />
                <Descriptions
                    className={styles.customDescriptions}
                    bordered
                    column={1}
                    size='middle'
                    style={{ marginTop: '0px' }}
                >
                    <Item label='模块名称'>{moduleName}</Item>
                    <Item label='模块类型'>{moduleTypeName}</Item>
                    <Item label='模块版本'>{moduleVersion}</Item>
                    <Item label='最近一次上线时间'>{lastUpTime}</Item>
                    <Item label='集群类型'>{clusteredTypeName}</Item>
                    <Item label='部署路径'>{path}</Item>
                    <Item label='端口'>{port}</Item>
                    <Item label='部署账户'>{deployAccount}</Item>
                    {/* <Item label='业务'>{business}</Item> */}
                    <Item label='描述信息'>{description}</Item>
                </Descriptions>
            </Fragment>)
        };

        let renderResource = () => {
            const {
                outip,
                sequenceid,
                assetTypeName,
                useStatusName,
                addressName,
                operatingSystemName,
                programName,
            } = detailsData;


            return (<Fragment>
                <Alert message='基本信息' type='info' style={{ margin: '16px 0px' }} />
                <Descriptions
                    className={styles.customDescriptions}
                    bordered
                    column={1}
                    size='middle'
                    style={{ marginTop: '0px' }}
                >
                    <Item label='IP'>{outip}</Item>
                    <Item label='类别'>{assetTypeName}</Item>
                    <Item label='流水号'>{sequenceid}</Item>
                    <Item label='状态'>{useStatusName}</Item>
                    <Item label='操作系统'>{operatingSystemName}</Item>
                    <Item label='所属机房'>{addressName}</Item>
                    <Item label='所属模块'>{programName}</Item>
                </Descriptions>
            </Fragment>)
        };

        let renderProcess = () => {
            const {
                processName,
                port,
                program,
                isMonitor,
                monitorProcName,
                monitorProcParam,
                monitorProcPath,
                tagName,
                tagValue,
                monitorAlertReceiverName,
                portTypeName,
                processNum,
                isSms,
                alertCalendarName,
                alertTime = '',
            } = detailsData;
            let alertTimes = alertTime.split(';')
            return (<Fragment>
                <Alert message='基本信息' type='info' style={{ margin: '16px 0px' }} />
                <Descriptions
                    className={styles.customDescriptions}
                    bordered
                    column={1}
                    size='middle'
                    style={{ marginTop: '0px' }}
                >
                    <Item label='进程名称'>{processName}</Item>
                    <Item label='所属模块'>{program}</Item>
                </Descriptions>
                <Alert message='监控属性' type='info' style={{ margin: '16px 0px' }} />
                <Descriptions
                    className={styles.customDescriptions}
                    bordered
                    column={1}
                    size='middle'
                    style={{ marginTop: '0px' }}
                >
                    <Item label='是否监控'>{isMonitor === '01' ? '是' : '否'}</Item>
                    <Item label='监控进程名称'>{monitorProcName}</Item>
                    <Item label='监控进程参数'>{monitorProcParam}</Item>
                    <Item label='监控进程路径'>{monitorProcPath}</Item>
                    <Item label='监控tag标识'>{tagName}</Item>
                    <Item label='监控tag值'>{tagValue}</Item>
                    <Item label='正常进程个数'>{processNum}</Item>
                    <Item label='监控端口类型'>{portTypeName}</Item>
                    <Item label='监控端口'>{port}</Item>
                    <Item label='告警接收人'>{monitorAlertReceiverName}</Item>
                    <Item label='是否短信告警'>{isSms === '01' ? '是' : '否'}</Item>
                    <Item label='告警日历'>{alertCalendarName}</Item>
                    <Item label='告警时间段'>{alertTimes.map(item => (<div key={item}>{item}</div>))}</Item>
                </Descriptions>
            </Fragment>)
        };

        let renderService = () => {
            const {
                serverName,
                serverPath,
                agreementTypeName,
                description,
                process = '',
                statusName,
            } = detailsData;
            let processList = process.split(';');


            return (<Fragment>
                <Alert message='基本信息' type='info' style={{ margin: '16px 0px' }} />
                <Descriptions
                    className={styles.customDescriptions}
                    bordered
                    column={1}
                    size='middle'
                    style={{ marginTop: '0px' }}
                >
                    <Item label='服务名称'>{serverName}</Item>
                    <Item label='服务路径'>{serverPath}</Item>
                    <Item label='协议类型'>{agreementTypeName}</Item>
                    <Item label='服务描述'>{description}</Item>
                    <Item label='所属进程'>{
                        _.map(processList, item => {
                            let [moduleName, process, port] = item.split('|');
                            return (<div key={item}>
                                {moduleName} -> {process}{port ? ` (${port})` : null}
                            </div>)
                        })
                    }</Item>
                    <Item label='状态'>{statusName}</Item>
                </Descriptions>
            </Fragment>)
        };

        //服务调用 详情
        let renderServiceConsume = () => {
            const {
                providerService,
                serviceCallerSystem,
                callerService,
                serviceCallTypeName,
                callerQPS,
                callerNeedResponseTime,
                business,
            } = detailsData;

            return (<Fragment>
                <Alert message='基本信息' type='info' style={{ margin: '16px 0px' }} />
                <Descriptions
                    className={styles.customDescriptions}
                    bordered
                    column={1}
                    size='middle'
                    style={{ marginTop: '0px' }}
                >
                    <Item label='调用方服务名称'>{providerService}</Item>
                    <Item label='提供方应用系统'>{serviceCallerSystem}</Item>
                    <Item label='提供方服务名称'>{callerService}</Item>
                    <Item label='调用方式'>{serviceCallTypeName}</Item>
                    <Item label='调用方QPS'>{callerQPS}</Item>
                    <Item label='调用方要求响应时间'>{callerNeedResponseTime}</Item>
                    <Item label='业务'>{business}</Item>
                </Descriptions>
            </Fragment>)
        };

        let renderServiceSLI = () => {

            const {
                service,
                indicatorTypeName,
                promiseValue,
                clusteredTPSExpandRatio
            } = detailsData;

            return (<Fragment>
                <Alert message='基本信息' type='info' style={{ margin: '16px 0px' }} />
                <Descriptions
                    className={styles.customDescriptions}
                    bordered
                    column={1}
                    size='middle'
                    style={{ marginTop: '0px' }}
                >
                    <Item label='服务名称'>{service}</Item>
                    <Item label='指标类型'>{indicatorTypeName}</Item>
                    <Item label='承诺值'>{promiseValue}</Item>
                    <Item label='集群TPS扩展系数'>{clusteredTPSExpandRatio}</Item>
                </Descriptions>
            </Fragment>)
        };

        //模块调用 详情
        let renderProgramConsume = () => {
            const {
                providerProgram,
                programCallerSystem,
                callerProgram,
                business,
            } = detailsData;

            return (<Fragment>
                <Alert message='基本信息' type='info' style={{ margin: '16px 0px' }} />
                <Descriptions
                    className={styles.customDescriptions}
                    bordered
                    column={1}
                    size='middle'
                    style={{ marginTop: '0px' }}
                >
                    <Item label='调用方模块名称'>{providerProgram}</Item>
                    <Item label='提供方应用系统'>{programCallerSystem}</Item>
                    <Item label='提供方模块名称'>{callerProgram}</Item>
                    <Item label='业务'>{business}</Item>
                </Descriptions>
            </Fragment>)
        };

        //数据库
        let renderDataBase = () => {
            const {
                dataBaseType,
                masterIp,
                masterPort,
                masterServer,
                maxConnectionNum,
                dba,
                disaster = '',
            } = detailsData;

            let disasterArr = disaster.split(';')

            return (<Fragment>
                <Alert message='基本信息' type='info' style={{ margin: '16px 0px' }} />
                <Descriptions
                    className={styles.customDescriptions}
                    bordered
                    column={1}
                    size='middle'
                    style={{ marginTop: '0px' }}
                >
                    <Item label='数据库类型'>{dataBaseType}</Item>
                    <Item label='主库IP'>{masterIp}</Item>
                    <Item label='主库端口'>{masterPort}</Item>
                    <Item label='主库服务名'>{masterServer}</Item>
                    <Item label='最大连接数'>{maxConnectionNum}</Item>
                    <Item label='DBA'>{dba}</Item>
                    <Item label='灾备库'>{disasterArr.map(item => (<div key={item}>{item}</div>))}</Item>
                </Descriptions>
            </Fragment>)
        };

        //数据库用户
        let renderDataBaseUser = () => {
            const {
                dataBase,
                userName,
                userAuthorityName,
                leaderName,
                program,
            } = detailsData;

            // let disasterArr = disaster.split(';')

            return (<Fragment>
                <Alert message='基本信息' type='info' style={{ margin: '16px 0px' }} />
                <Descriptions
                    className={styles.customDescriptions}
                    bordered
                    column={1}
                    size='middle'
                    style={{ marginTop: '0px' }}
                >
                    <Item label='所属数据库'>{dataBase}</Item>
                    <Item label='用户名'>{userName}</Item>
                    <Item label='用户权限'>{userAuthorityName}</Item>
                    <Item label='所属模块'>{program}</Item>
                    <Item label='负责人'>{leaderName}</Item>
                </Descriptions>
            </Fragment>)
        };


        switch (nodeType) {
            case 'system':
                return renderSystem();
            case 'program':
                return renderProgram();
            case 'process':
                return renderProcess();
            case 'resource':
                return renderResource();
            case 'service':
                return renderService();
            case 'serviceConsume':
                return renderServiceConsume();
            case 'serviceSli':
                return renderServiceSLI();
            case 'programConsume':
                return renderProgramConsume();
            case 'dataBase':
                return renderDataBase();
            case 'dataBaseUser':
                return renderDataBaseUser();
            default:
                return null
        }
    }

    renderDescriptions = (list) => {
        return (
            <Descriptions
                className={styles.customDescriptions}
                bordered
                column={1}
                size='middle'
                style={{ marginTop: '0px' }}
            >
                {_.map(list, item => {
                    const { propId = '', propName = '', propValue = '', propType = '' } = item;
                    let isMultiple = propType.includes('|');
                    if (isMultiple && propValue) {
                        let titles = propName.split('|') || [];
                        let groups = propValue.split('|') || [];
                        groups = groups.map(group => {
                            let items = group.split(',') || [];
                            return items.map((item, iIndex) => {
                                let [type, ...value] = item.split(':');
                                return {
                                    title: titles[iIndex],
                                    value: value.join(':')
                                }
                            });
                        })
                        return (<Item label={propName} key={propId}>
                            {_.map(groups, (group, gIndex) => {
                                return (<div key={gIndex}>
                                    {_.map(group, (item, iIndex) => {
                                        return <div key={`${gIndex}-${iIndex}`} >{item.title} : {item.value}</div>
                                    })}
                                </div>)
                            })}
                        </Item>)
                    }
                    return <Item label={propName} key={propId}>{propValue}</Item>
                })}
            </Descriptions>
        );
    }

    // 渲染其他信息
    renderOtherInfo = () => {
        const { relationPropertieList, dynamicPropertieList } = this.state;
        const { nodeType } = this.props;
        let isEmptyDynamic = _.isEmpty(dynamicPropertieList);
        let isEmptyRelation = _.isEmpty(relationPropertieList);

        return (<Fragment>
            {isEmptyDynamic ? null : (
                <Fragment>
                    <Alert message='自定义属性信息' type='info' style={{ margin: '16px 0px' }} />
                    {this.renderDescriptions(dynamicPropertieList)}
                </Fragment>
            )}

            {isEmptyRelation || nodeType !== 'program' ? null : (
                <Fragment>
                    <Alert message='联动属性信息' type='info' style={{ margin: '16px 0px' }} />
                    <Collapse>
                        {_.map(relationPropertieList, item => {
                            const { nodeId, nodeType, propertyDetailList = [] } = item;
                            return (<Panel header={nodeType} key={nodeId}>
                                {this.renderDescriptions(propertyDetailList)}
                            </Panel>)
                        })}
                    </Collapse>
                </Fragment>
            )}
        </Fragment>)
    }

    render() {
        const { hideModal, title, nodeType, detailsData } = this.props;

        const { changeList } = this.state;

        let width = window.document.body.offsetWidth * 0.5;

        return (<Drawer
            title={`${detailsData.maintenanceName ? detailsData.maintenanceName : title}详情`}
            placement='right'
            closable={false}
            onClose={hideModal}
            visible={true}
            width={width}
        >
            <Tabs
                defaultActiveKey='1'
                closable={true}
            >
                <TabPane tab='详情' key='1'>
                    {this.renderBasicInfo()}
                    {this.renderOtherInfo()}
                </TabPane>
                {
                    nodeType === 'system' ?
                        null
                        :
                        <TabPane tab='变更记录' key='2'>
                            <Standardtable
                                style={{ borderTop: '#eee solid 1px' }}
                                rowKey='changeTime'
                                columns={this.columns}
                                data={{
                                    list: changeList,
                                    pagination: false
                                }}
                            />
                        </TabPane>
                }
            </Tabs>
        </Drawer>
        )
    }
}

export default connect()(ModuleDetails);