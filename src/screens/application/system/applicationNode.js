import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Tabs, Collapse, Button, Modal, Row, Col, Upload, Menu, Dropdown, message } from 'antd';
import { deleteProgramAction, updateRecordAction, getRelationValue, detailProgramAction, getTemplates, getResourceList } from '../../../actions/application/action';
import { getServeList } from '../../../actions/application/service/action';
import { getOracleList, getMysqlList } from '../../../actions/application/database/action';
import Program from './modal'
import Record from './record'
import Resource from './resource'
import Styles from './index.module.less'
import Service from '../service/list'
import DataBase from '../database/list'
import { ContextPath } from '../../../constants';
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { confirm } = Modal;

class applicationNode extends Component {
    constructor(props) {
        super(props);
        this.state = {
            type: 'view',
            templateList: []
        };
    }

    editNode = (type) => {
        this.setState({
            type
        })
    }

    deleteNode = () => {
        const { systemId, detailProgramList } = this.props
        const id = detailProgramList.fixedMap.id
        const name = detailProgramList.fixedMap.name
        confirm({
            title: `删除程序（${name}）会删除该程序下的所有数据，确定删除?`,
            // content: '请先移除其下所有主机',
            cancelText: '取消',
            okText: '确定',
            onOk: () => {
                deleteProgramAction(systemId, id, (id) => {
                    this.props.requestTreeData(id)
                    this.props.changeNode()
                })
            },
            onCancel: () => {
            },
        })
    }
    getCloseType = (data) => {
        this.setState({
            type: data
        })
    }

    callBack = (key) => {
        const { systemId, onHandleTab, programId, dispatch } = this.props
        onHandleTab(key);
        switch (key) {
            case '1':
                dispatch(getRelationValue({ parentId: programId }, () => {
                    dispatch(detailProgramAction(systemId, programId));
                }));//程序属性详情页
                break;
            case '2':
                dispatch(updateRecordAction(systemId, programId));//变更记录
                break;
            case '3':
                let params = { limit: 10, start: 0 };
                dispatch(getResourceList(params, systemId, programId));//获取资源列表
                break;
            case '4':
                let serveParams = {
                    systemId: systemId,
                    parentId: programId,
                    configItemType: 'service',
                    propertyValueDtoList: [
                        {
                            propId: 'serverName',
                            propValue: ''
                        },
                        {
                            propId: 'interfaceName',
                            propValue: ''
                        },
                        {
                            propId: 'serverType',
                            propValue: ''
                        },
                        {
                            propId: 'status',
                            propValue: ''
                        }
                    ],
                };
                dispatch(getServeList(serveParams));// 获取服务列表
                break;
            case '5':
                let oracleParams = {
                    systemId: systemId,
                    parentId: programId,
                    configItemType: 'oracleType',
                    propertyValueDtoList: [
                        {
                            propId: "oracleIpDetails",
                            propValue: ''
                        },
                        {
                            propId: "oracleExample",
                            propValue: ''
                        }
                    ],
                };
                dispatch(getOracleList(oracleParams));
                let mysqlParams = {
                    systemId: systemId,
                    parentId: programId,
                    configItemType: 'mysqlType',
                    propertyValueDtoList: [
                        {
                            propId: "mysqlIp",
                            propValue: ''
                        },
                        {
                            propId: "mysqlExample",
                            propValue: ''
                        }
                    ],
                };
                dispatch(getMysqlList(mysqlParams));
                break;
        }
    }

    componentDidMount() {
        // getTemplates((res) => {
        //     this.setState({
        //         templateList: res || []
        //     });
        // });
    }

    handleUploadChange = (info) => {
        let fileList = info.fileList;
        const { detailProgramList } = this.props
        // 控制大小在20M以内
        fileList = _.filter(fileList, function (file) {
            return file.size === undefined || _.divide(file.size, 1024 * 1024) <= 20;
        });
        if (info.file.status === 'done') {
            if (info.file.response && !info.file.response.hasError && info.file.uid) {
                message.success(`${info.file.name} 上传成功！`);
                this.setState({ isImporting: true }, () => {
                    this.props.dispatch(getRelationValue({ parentId: detailProgramList.fixedMap.id }));
                });
            } else {
                let failReason = info.file.response ? info.file.response.error : '上传接口出错！';
                // message.error(`${info.file.name} 上传失败！原因：${failReason}`);
                message.error(`${failReason}`);
                return;
            }
        } else if (info.file.status === 'error') {
            message.error(`${info.file.name} 上传失败！`);
        }
    }

    // 上传前钩子函数 false||Promise.reject阻止上传
    beforeUpload = (file) => {
        if (_.divide(file.size, 1024 * 1024) >= 20) {
            message.error(`${file.name}上传失败，文件大小不能超过20M！`);
            return false;
        }
        return true;
    }
    handleMenuClick = (e) => {
        let params = encodeURI(`nodeType=${e.key}`);
        window.open(`${ContextPath}/cmdbModel/downloadExcelModel?${params}`);
    }

    render() {
        const { type, templateList } = this.state
        const { detailProgramList, relationValueList, systemId, programId } = this.props;
        const uploadPropertys = {
            data: {
                systemId
            },
            name: 'file',
            action: `${ContextPath}/cmdbModel/import`,
            showUploadList: false,
            onChange: this.handleUploadChange.bind(this),
            beforeUpload: this.beforeUpload.bind(this)
        };

        const templateMenu = (
            <Menu onClick={this.handleMenuClick.bind(this)}>
                {templateList.length && templateList.map((item, index) => {

                    return (
                        <Menu.Item key={item.value || ''}>
                            {item.value || ''}
                        </Menu.Item>
                    )
                })}
            </Menu>
        );
        return (
            <div className={Styles.rightContent}>
                <Tabs defaultActiveKey="1" onChange={this.callBack}>
                    <TabPane tab="程序属性" key="1">
                        {
                            type === 'view' ?
                                <div>
                                    <Collapse defaultActiveKey={['1', '2']} bordered={false}>
                                        <Panel header="基本信息" key="1">
                                            <div className={Styles.node}>
                                                <div>程序名称：<span className={Styles.nodeInfo}>{detailProgramList.fixedMap.name}</span></div>
                                                <div>程序类型：<span className={Styles.nodeInfo}>{detailProgramList.fixedMap.type}</span></div>
                                                <div>部署路径：<span className={Styles.nodeInfo}>{detailProgramList.fixedMap.path}</span></div>
                                                <div>部署账户：<span className={Styles.nodeInfo}>{detailProgramList.fixedMap.account}</span></div>
                                                <div>端口：<span className={Styles.nodeInfo}>{detailProgramList.fixedMap.port}</span></div>
                                                <div>描述信息：<span className={Styles.nodeInfo}>{detailProgramList.fixedMap.description}</span></div>
                                                <div>备注信息：<span className={Styles.nodeInfo}>{detailProgramList.fixedMap.remark}</span></div>
                                            </div>
                                        </Panel>
                                        <Panel header="自定义信息" key="2">
                                            <div className={Styles.node}>
                                                {
                                                    detailProgramList.info.map((item, index) => {
                                                        return (
                                                            <div key={index}>
                                                                {item.propName}：
                                                    <span className={Styles.nodeInfo}>{item.propValue}</span>
                                                            </div>
                                                        )
                                                    })}
                                            </div>
                                        </Panel>
                                        {
                                            relationValueList.map((item, index) => {
                                                return (
                                                    <Panel header={item.nodeType} key={`template${index}`}>
                                                        {item.propertyDetailList.map((property, index) => {
                                                            return (
                                                                <div key={index} className={Styles.blockMargin}>
                                                                    {!property.propName.includes('|') && <div className={Styles.rowMargin}>
                                                                        <span> {property.propName}：</span>
                                                                        <span className={Styles.nodeInfo}>{property.hasOwnProperty('propValue') ? property.propValue : property.defaultValue}</span>
                                                                    </div>
                                                                    }
                                                                    {(property.propName.includes('|') && !property.propValue && property.propType.includes('|')) &&
                                                                        <div className={Styles.rowMargin}>
                                                                            {
                                                                                property.propName.split('|').map((itemName, nameIndex) => {
                                                                                    return (
                                                                                        <span key={`pname${nameIndex}`} style={{ marginRight: 40 }}> {itemName}：</span>
                                                                                    )
                                                                                })
                                                                            }
                                                                        </div>
                                                                    }
                                                                    {
                                                                        (property.propName.includes('|') && property.propValue && property.propType.includes('|')) &&
                                                                        property.propValue.split('|').map((itemValue, valIndex) => {
                                                                            return (<div className={Styles.rowMargin} key={`pro${valIndex}`}>
                                                                                {
                                                                                    property.propName.split('|').map((itemName, nameIndex) => {
                                                                                        return (
                                                                                            <span key={`val${valIndex}${nameIndex}`}>
                                                                                                {
                                                                                                    (nameIndex === 0) ? <span> {itemName}：</span>
                                                                                                        : <span style={{ marginLeft: 30 }}> {itemName}：</span>
                                                                                                }
                                                                                                <span className={Styles.nodeInfo}>{itemValue && itemValue.split(',')[nameIndex] && itemValue.split(',')[nameIndex].split(':')[1] || ''}</span>
                                                                                            </span>
                                                                                        )
                                                                                    })
                                                                                }
                                                                            </div>)
                                                                        })
                                                                    }
                                                                </div>
                                                            )
                                                        })}
                                                    </Panel>
                                                )
                                            })
                                        }
                                    </Collapse>
                                    <div className={Styles.btns}>
                                        <Button type="primary" style={{ marginRight: 20 }} onClick={this.editNode.bind(this, 'edit')}>编辑</Button>
                                        <Button type="danger" style={{ marginRight: 20 }} onClick={this.deleteNode}>删除</Button>
                                        <Dropdown overlay={templateMenu} trigger={['click']}>
                                            <Button type='primary' icon='download' style={{ marginRight: 20 }}>
                                                下载联动属性模板
                                          </Button>
                                        </Dropdown>
                                        <Upload {...uploadPropertys} >
                                            <Button type='primary' icon='import' style={{ backgroundColor: '#f0ad4e', borderColor: '#eea236' }}>导入联动属性模板</Button>
                                        </Upload>
                                    </div>
                                </div>
                                :
                                <div style={{ marginTop: 20 }}>
                                    <Program type={type} getType={this.getCloseType} systemId={this.props.systemId} itimpParams={this.props.params} />
                                </div>
                        }
                    </TabPane>
                    <TabPane tab="资源" key="3">
                        <Resource systemid={this.props.systemId} id={programId} />
                    </TabPane>
                    <TabPane tab="服务" key="4">
                        <Service systemId={this.props.systemId} parentId={programId} />
                    </TabPane>
                    <TabPane tab="数据库" key="5">
                        <DataBase systemId={this.props.systemId} parentId={programId} />
                    </TabPane>
                    <TabPane tab="变更记录" key="2">
                        <Record systemId={this.props.systemId} />
                    </TabPane>
                </Tabs>
            </div>
        );
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        detailProgramList: state.detailProgramList,
        relationValueList: state.relationValueList || []
    }
}

export default connect(mapStateToProps)(applicationNode);
