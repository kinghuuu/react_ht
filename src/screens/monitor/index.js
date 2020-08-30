import React, { Component } from 'react'
import { connect } from 'react-redux';
import _ from 'lodash';
import ReactEcharts from "echarts-for-react";
import { Card, Col, Row, Table, Modal, message } from 'antd';
import ApplicationTitle from '../common/applicationTitle';
import {
    getAssetMonitorStatus,
    getLogAcqStatus,
    getProcessMonitorStatus,
    getPortMonitorStatus,
    syncSystemUnMonitor
} from '../../actions/monitor/action'
import styles from './index.module.less';

const paginationProps = {
    defaultPageSize: 5,
}
//未监控主机 目录
const columns_asset = [
    {
        title: '序号',
        dataIndex: 'serialNumber',
        width: '8%'
    },
    {
        title: '主机IP',
        dataIndex: 'outip',
        width: '35%'
    },
    {
        title: 'IT资源序列号',
        dataIndex: 'sequenceid',
        width: '22%'
    },
    {
        title: '机房',
        dataIndex: 'addressName',
        width: '35%'
    },
]
//未监控日志 目录
const columns_log = [
    {
        title: '序号',
        dataIndex: 'serialNumber',
        width: '8%'
    },
    {
        title: '模块',
        dataIndex: 'moduleName',
        width: '17%'
    },
    {
        title: '日志类型及路径',
        dataIndex: 'moduleLogPath',
        width: '35%'
    },
    {
        title: '主机IP',
        dataIndex: 'assetIp',
        width: '25%'
    },
    {
        title: '机房',
        dataIndex: 'assetAddr',
        width: '15%'
    },
]
//未监控进程 目录
const columns_process = [
    {
        title: '序号',
        dataIndex: 'serialNumber',
        width: '8%'
    },
    {
        title: '进程名',
        dataIndex: 'processName',
        width: '20%'
    },
    {
        title: '主机IP',
        dataIndex: 'assetIp',
        width: '37%'
    },
    {
        title: '机房',
        dataIndex: 'assetAddr',
        width: '35%'
    },
]
//未监控端口 目录
const columns_port = [
    {
        title: '序号',
        dataIndex: 'serialNumber',
        width: '8%'
    },
    {
        title: '进程名',
        dataIndex: 'processName',
        width: '15%'
    },
    {
        title: '端口',
        dataIndex: 'port',
        width: '15%'
    },
    {
        title: '主机IP',
        dataIndex: 'assetIp',
        width: '32%'
    },
    {
        title: '机房',
        dataIndex: 'assetAddr',
        width: '30%'
    },
]

const { confirm } = Modal;
class Monitor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            systemId: '',

            prdAllCount_asset: 0,
            prdDeployCount_asset: 0,
            prdMonitorCount_asset: 0,
            data_asset: [],
            monitor_ratio_asset: 0,  //已监控比率
            release_ratio_asset: 0,  //已部署比率

            moduleCount_log: 0,
            toLogSystemCount_log: 0,
            logAcqCount_log: 0,
            data_log: [],
            join_ratio_log: 0,   //接入日志比率
            actual_ratio_log: 0,  //实际采集比率

            processCount_process: 0,
            toMonitorCount_process: 0,
            isMonitorCount_process: 0,
            data_process: [],
            join_ratio_process: 0,   //接入监控比率
            actual_ratio_process: 0,  //实际监控比率

            portCount_port: 0,
            toMonitorCount_port: 0,
            isMonitorCount_port: 0,
            data_port: [],
            join_ratio_port: 0,  //接入监控比率
            actual_ratio_port: 0,  //实际监控比率
        };
    }

    //查询主机监控状态
    callGetAssetMonitorStatus = () => {
        const { dispatch } = this.props
        const { systemId } = this.state

        let params = { systemId: systemId }
        const data_asset_temp = []
        let monitor_ratio_asset_temp = 0, release_ratio_asset_temp = 0

        dispatch(getAssetMonitorStatus(params, result => {
            if (!_.isEmpty(result.data)) {
                result.data.unMonitorResList.forEach((item, index) => {
                    let obj = {}
                    obj.key = index + 1
                    obj.serialNumber = index + 1
                    obj.outip = item.outip
                    obj.sequenceid = item.sequenceid
                    obj.addressName = item.addressName
                    data_asset_temp.push(obj)
                });

                if (result.data.prdAllCount === 0) {
                    monitor_ratio_asset_temp = 0
                    release_ratio_asset_temp = 0
                } else {
                    monitor_ratio_asset_temp = (result.data.prdMonitorCount / result.data.prdAllCount).toFixed(2)
                    release_ratio_asset_temp = (result.data.prdDeployCount / result.data.prdAllCount).toFixed(2)
                }

                this.setState({
                    prdAllCount_asset: result.data.prdAllCount,
                    prdDeployCount_asset: result.data.prdDeployCount,
                    prdMonitorCount_asset: result.data.prdMonitorCount,
                    data_asset: data_asset_temp,
                    monitor_ratio_asset: monitor_ratio_asset_temp,
                    release_ratio_asset: release_ratio_asset_temp
                })
            }
        }))
    }

    //查询日志采集状态
    CallGetLogAcqStatus = () => {
        const { dispatch } = this.props;
        const { systemId } = this.state

        let params = { systemId: systemId }
        const data_log_temp = []
        let join_ratio_log_temp = 0, actual_ratio_log_temp = 0

        dispatch(getLogAcqStatus(params, result => {
            if (!_.isEmpty(result.data)) {
                result.data.logDtoList.forEach((item, index) => {
                    let obj = {}
                    obj.key = index + 1
                    obj.serialNumber = index + 1
                    obj.moduleName = item.moduleName
                    obj.moduleLogPath = item.moduleLogPath
                    obj.assetIp = item.assetIp
                    obj.assetAddr = item.assetAddr
                    data_log_temp.push(obj)
                });

                if (result.data.moduleCount === 0) {
                    join_ratio_log_temp = 0
                } else if (result.data.toLogSystemCount === 0) {
                    actual_ratio_log_temp = 0
                } else {
                    join_ratio_log_temp = (result.data.toLogSystemCount / result.data.moduleCount).toFixed(2)
                    actual_ratio_log_temp = (result.data.logAcqCount / result.data.toLogSystemCount).toFixed(2)
                }

                this.setState({
                    moduleCount_log: result.data.moduleCount,
                    toLogSystemCount_log: result.data.toLogSystemCount,
                    logAcqCount_log: result.data.logAcqCount,
                    data_log: data_log_temp,
                    join_ratio_log: join_ratio_log_temp,
                    actual_ratio_log: actual_ratio_log_temp
                })
            }
        }))
    }

    //查询进程监控状态
    CallGetProcessMonitorStatus = () => {
        const { dispatch } = this.props;
        const { systemId } = this.state

        let params = { systemId: systemId }
        const data_process_temp = []
        let join_ratio_process_temp = 0, actual_ratio_process_temp = 0

        dispatch(getProcessMonitorStatus(params, result => {
            if (!_.isEmpty(result.data)) {
                result.data.processDtoList.forEach((item, index) => {
                    let obj = {}
                    obj.key = index + 1
                    obj.serialNumber = index + 1
                    obj.processName = item.processName
                    obj.assetIp = item.assetIp
                    obj.assetAddr = item.assetAddr
                    data_process_temp.push(obj)
                });

                if (result.data.processCount === 0) {
                    join_ratio_process_temp = 0
                } else if (result.data.toMonitorCount === 0) {
                    actual_ratio_process_temp = 0
                } else {
                    join_ratio_process_temp = (result.data.toMonitorCount / result.data.processCount).toFixed(2)
                    actual_ratio_process_temp = (result.data.isMonitorCount / result.data.toMonitorCount).toFixed(2)
                }

                this.setState({
                    processCount_process: result.data.processCount,
                    toMonitorCount_process: result.data.toMonitorCount,
                    isMonitorCount_process: result.data.isMonitorCount,
                    data_process: data_process_temp,
                    join_ratio_process: join_ratio_process_temp,
                    actual_ratio_process: actual_ratio_process_temp,
                })
            }
        }))
    }

    //查询端口监控状态
    CallGetPortMonitorStatus = () => {
        const { dispatch } = this.props;
        const { systemId } = this.state

        let params = { systemId: systemId }
        const data_port_temp = []
        let join_ratio_port_temp = 0, actual_ratio_port_temp = 0

        dispatch(getPortMonitorStatus(params, result => {
            if (!_.isEmpty(result.data)) {
                result.data.portDtoList.forEach((item, index) => {
                    let obj = {}
                    obj.key = index + 1
                    obj.serialNumber = index + 1
                    obj.processName = item.processName
                    obj.port = item.port
                    obj.assetIp = item.assetIp
                    obj.assetAddr = item.assetAddr
                    data_port_temp.push(obj)
                });

                if (result.data.portCount === 0) {
                    join_ratio_port_temp = 0
                } else if (result.data.toMonitorCount === 0) {
                    actual_ratio_port_temp = 0
                } else {
                    join_ratio_port_temp = (result.data.toMonitorCount / result.data.portCount).toFixed(2)
                    actual_ratio_port_temp = (result.data.isMonitorCount / result.data.toMonitorCount).toFixed(2)
                }

                this.setState({
                    portCount_port: result.data.portCount,
                    toMonitorCount_port: result.data.toMonitorCount,
                    isMonitorCount_port: result.data.isMonitorCount,
                    data_port: data_port_temp,
                    join_ratio_port: join_ratio_port_temp,
                    actual_ratio_port: actual_ratio_port_temp,
                })
            }
        }))
    }

    getMonitorList = () => {
        this.callGetAssetMonitorStatus()   //查询主机监控状态
        this.CallGetLogAcqStatus()         //查询日志采集状态
        this.CallGetProcessMonitorStatus() //查询进程监控状态
        this.CallGetPortMonitorStatus()    //查询端口监控状态
    }

    //改变systemId
    updateSystemId = (systemInfo) => {
        this.setState(() => ({ systemId: systemInfo.systemId }), () => {
            this.getMonitorList();
        });
    }

    //重新拉取数据
    handleSyncSystemUnMonitor = () => {
        const { dispatch } = this.props;
        const { systemId } = this.state;
        let params = { systemId: systemId }
        confirm({
            title: '是否重新获取数据?',
            content: (<p>重新获取数据可能耗时较长,<br></br>点击<span style={{ fontWeight: 700, fontStyle: 'italic' }}> 确定 </span>按钮后请耐心等待.</p>),
            onOk() {
                dispatch(syncSystemUnMonitor(params, result => {
                    console.log('index中 result: ', result)
                }))
            },
            onCancel() {
                console.log('取消重新加载');
            },
        });
    }

    //点击刷新
    reloadMonitorData = () => {
        message.loading('数据加载中...', 1);
        this.getMonitorList()
    }

    getOption(param) {
        return {
            series: [
                {
                    type: 'gauge',
                    radius: '95%',
                    splitNumber: 5,
                    axisLine: {    	// 仪表盘轴线(轮廓线)相关配置。
                        show: true,	   // 是否显示仪表盘轴线(轮廓线),默认 true。
                        lineStyle: {    // 仪表盘轴线样式。
                            opacity: 1,	   //图形透明度。支持从 0 到 1 的数字，为 0 时不绘制该图形。
                            width: 10,		//轴线宽度,默认 30。
                            shadowBlur: 20,		//(发光效果)图形阴影的模糊大小。该属性配合 shadowColor,shadowOffsetX, shadowOffsetY 一起设置图形的阴影效果。 
                            shadowColor: "#fff",	//阴影颜色。支持的格式同color。
                        }
                    },
                    axisLabel: {			// 刻度标签。
                        show: true,				// 是否显示标签,默认 true。
                        distance: 1,			// 标签与刻度线的距离,默认 5。
                        fontSize: 8,			// 文字的字体大小,默认 5。
                    },
                    pointer: {				// 仪表盘指针。
                        show: true,				// 是否显示指针,默认 true。
                        length: "75%",			// 指针长度，可以是绝对数值，也可以是相对于半径的百分比,默认 80%。
                        width: 4,				// 指针宽度,默认 8。
                    },
                    splitLine: {	// 分隔线样式。
                        show: true,	  // 是否显示分隔线,默认 true。
                        length: 10,		// 分隔线线长。支持相对半径的百分比,默认 30。
                        lineStyle: {		// 分隔线样式。
                            color: "#eee",		//线的颜色,默认 #eee。
                            opacity: 1,			//图形透明度。支持从 0 到 1 的数字，为 0 时不绘制该图形。
                            width: 2,			//线度,默认 2。
                            type: "solid",		//线的类型,默认 solid。 此外还有 dashed,dotted
                            shadowBlur: 10,			//(发光效果)图形阴影的模糊大小。该属性配合 shadowColor,shadowOffsetX, shadowOffsetY 一起设置图形的阴影效果。 
                            shadowColor: "#fff",	//阴影颜色。支持的格式同color。
                        }
                    },
                    detail: {
                        formatter: '{value}%',
                        fontSize: 16,
                        offsetCenter: [0, "80%"]
                    },
                    data: [{ value: (param * 100).toFixed(2) }]
                }
            ]
        }
    }

    render() {
        const { prdAllCount_asset, prdDeployCount_asset, prdMonitorCount_asset, data_asset, monitor_ratio_asset, release_ratio_asset,
            moduleCount_log, toLogSystemCount_log, logAcqCount_log, data_log, join_ratio_log, actual_ratio_log,
            processCount_process, toMonitorCount_process, isMonitorCount_process, data_process, join_ratio_process, actual_ratio_process,
            portCount_port, toMonitorCount_port, isMonitorCount_port, data_port, join_ratio_port, actual_ratio_port,
        } = this.state;

        return (
            <div className={styles.block_body}>
                <ApplicationTitle
                    firstBreadcrumb='配置中心'
                    secondBreadcrumb='监控情况展示'
                    syncSystemBtn={true}
                    handleSyncSystemUnMonitor={this.handleSyncSystemUnMonitor}
                    reloadMonitorData={this.reloadMonitorData}
                    getSelectSystem={this.updateSystemId}
                />
                <Row gutter={24}>
                    <Col span={6}>
                        <Card className={styles.top_card}>
                            <div className={styles.top_title}>主机监控覆盖</div>
                            <div className={styles.part_left}>
                                <ReactEcharts
                                    option={this.getOption(release_ratio_asset)}
                                    style={{ width: '100%', height: '100%', minHeight: '80px' }}
                                />
                                <p>已部署比率</p>
                            </div>
                            <div className={styles.part_center}>
                                <p><span className={styles.top_title_1}>主机数:</span> <span className={styles.top_number_1}> {prdAllCount_asset}</span></p>
                                <p><span className={styles.top_title_1}>已部署数:</span> <span className={styles.top_number_2}> {prdDeployCount_asset}</span></p>
                                <p><span className={styles.top_title_1}>已监控数:</span> <span className={styles.top_number_3}> {prdMonitorCount_asset}</span></p>
                            </div>
                            <div className={styles.part_right}>
                                <ReactEcharts
                                    option={this.getOption(monitor_ratio_asset)}
                                    style={{ width: '100%', height: '100%', minHeight: '80px' }}
                                />
                                <p>已监控比率</p>
                            </div>
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card className={styles.top_card}>
                            <div className={styles.top_title}>日志监控覆盖</div>
                            <div className={styles.part_left}>
                                <ReactEcharts
                                    option={this.getOption(join_ratio_log)}
                                    style={{ width: '100%', height: '100%', minHeight: '80px' }}
                                />
                                <p>接入日志比率</p>
                            </div>
                            <div className={styles.part_center}>
                                <p><span className={styles.top_title_1}>模块数:</span> <span className={styles.top_number_1}> {moduleCount_log}</span></p>
                                <p><span className={styles.top_title_1}>接入日志数:</span> <span className={styles.top_number_2}> {toLogSystemCount_log}</span></p>
                                <p><span className={styles.top_title_1}>实际采集数:</span> <span className={styles.top_number_3}> {logAcqCount_log}</span></p>
                            </div>
                            <div className={styles.part_right}>
                                <ReactEcharts
                                    option={this.getOption(actual_ratio_log)}
                                    style={{ width: '100%', height: '100%', minHeight: '80px' }}
                                />
                                <p>实际采集比率</p>
                            </div>
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card className={styles.top_card}>
                            <div className={styles.top_title}>进程监控覆盖</div>
                            <div className={styles.part_left}>
                                <ReactEcharts
                                    option={this.getOption(join_ratio_process)}
                                    style={{ width: '100%', height: '100%', minHeight: '80px' }}
                                />
                                <p>接入监控比率</p>
                            </div>
                            <div className={styles.part_center}>
                                <p><span className={styles.top_title_1}>进程数:</span> <span className={styles.top_number_1}> {processCount_process}</span></p>
                                <p><span className={styles.top_title_1}>接入监控数:</span> <span className={styles.top_number_2}> {toMonitorCount_process}</span></p>
                                <p><span className={styles.top_title_1}>实际监控数:</span> <span className={styles.top_number_3}> {isMonitorCount_process}</span></p>
                            </div>
                            <div className={styles.part_right}>
                                <ReactEcharts
                                    option={this.getOption(actual_ratio_process)}
                                    style={{ width: '100%', height: '100%', minHeight: '80px' }}
                                />
                                <p>实际监控比率</p>
                            </div>
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card className={styles.top_card}>
                            <div className={styles.top_title}>端口监控覆盖</div>
                            <div className={styles.part_left}>
                                <ReactEcharts
                                    option={this.getOption(join_ratio_port)}
                                    style={{ width: '100%', height: '100%', minHeight: '80px' }}
                                />
                                <p>接入监控比率</p>
                            </div>
                            <div className={styles.part_center}>
                                <p><span className={styles.top_title_1}>端口数:</span> <span className={styles.top_number_1}> {portCount_port}</span></p>
                                <p><span className={styles.top_title_1}>接入监控数:</span> <span className={styles.top_number_2}> {toMonitorCount_port}</span></p>
                                <p><span className={styles.top_title_1}>实际监控数:</span> <span className={styles.top_number_3}> {isMonitorCount_port}</span></p>
                            </div>
                            <div className={styles.part_right}>
                                <ReactEcharts
                                    option={this.getOption(actual_ratio_port)}
                                    style={{ width: '100%', height: '100%', minHeight: '80px' }}
                                />
                                <p>实际监控比率</p>
                            </div>
                        </Card>
                    </Col>
                </Row>
                <Row gutter={24} style={{ marginTop: '10px', height: 'auto' }}>
                    <Col span={12}>
                        <Table
                            columns={columns_asset}
                            dataSource={data_asset}
                            bordered={true}
                            title={() => '未监控主机'}
                            size='small'
                            pagination={paginationProps}
                        ></Table>
                    </Col>
                    <Col span={12}>
                        <Table
                            columns={columns_process}
                            dataSource={data_process}
                            bordered={true}
                            title={() => '未监控进程'}
                            size='small'
                            pagination={paginationProps}
                        ></Table>
                    </Col>
                </Row>
                <Row gutter={24} style={{ marginTop: '10px', height: 'auto' }}>
                    <Col span={12}>
                        <Table
                            columns={columns_log}
                            dataSource={data_log}
                            bordered={true}
                            title={() => '未监控日志'}
                            size='small'
                            pagination={paginationProps}
                        ></Table>
                    </Col>
                    <Col span={12}>
                        <Table
                            columns={columns_port}
                            dataSource={data_port}
                            bordered={true}
                            title={() => '未监控端口'}
                            size='small'
                            pagination={paginationProps}
                        ></Table>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default connect()(Monitor);