import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Col, message, Modal, Collapse } from 'antd';
import ApplicationTitle from '../common/applicationTitle';
import OperationModule from './module/operation';
import ProcessOperationModule from './module/processOperation';
import ServiceOperationModule from './module/serviceOperation';
import ServiceConsumeOperationModule from './module/serviceConsumeOperation';
import ProgramConsumeOperationModule from './module/programConsumeOperation';
import LineOperationModule from './module/lineOperation';
import ServiceSliOperationModule from './module/serviceSliOperation';
import ProgramOperationModule from './module/programOperation';
import ModuleDetails from './module/details';
import SystemModule from './systemModule';
import ProgramModule from './programModule';
import ResourceModule from './resourceModule';
import ProcessModule from './processModule';
import ServiceModule from './serviceModule';
import ServiceConsumeModule from './serviceConsumeModule';
import ServiceSliModule from './serviceSliModule';
import ProgramConsumeModule from './programConsumeModule';
import LineModule from './lineModule';
import DataBaseModel from './dataBase';
import DataBaseUserModel from './dataBaseUser';
import {
    getModelConfigList,
    getLineInfoList,
    deleteModels,
} from '../../actions/modelConfig/action';
import styles from './index.module.less';
const { confirm } = Modal, { Panel } = Collapse;

class ModuleConfig extends Component {
    constructor(props) {
        super(props);
        this.state = {
            systemInfo: {},
            isShowBack: false,
            thirdBreadcrumb: '',
            nodeType: '',
            moduleList: [],

            propertyValueDtoList: [],   // 查询参数
            lineName: '',  //通讯线路查询参数
            isCreate: false,            // 是否新增

            selectRows: [],

            detailsVisable: false,
            detailsData: {},

            activeKey: []

        };
    }

    componentDidMount() {
        // 设置 moduleList
        let moduleList = [
            {
                title: '基本模块', children: [
                    { title: '应用系统', nodeType: 'system' },
                    { title: '可执行模块', nodeType: 'program' },
                    { title: '主机', nodeType: 'resource' },
                    { title: '进程', nodeType: 'process' },
                    { title: '模块调用', nodeType: 'programConsume' },
                    { title: '通讯线路', nodeType: 'line' },
                ]
            },
            {
                title: '服务模块', children: [
                    { title: '服务', nodeType: 'service' },
                    { title: '服务调用', nodeType: 'serviceConsume' },
                    { title: '服务SLI', nodeType: 'serviceSli' },
                ]
            },
            {
                title: '数据库模块', children: [
                    { title: '数据库', nodeType: 'dataBase' },
                    { title: '数据库用户', nodeType: 'dataBaseUser' },
                ]
            },
        ];
        let activeKey = [];
        moduleList.forEach((item = {}) => {
            const { children, title } = item;
            activeKey.push(title);
            children.forEach(item => {
                item.src = require('../../assets/imgs/' + item.nodeType + '.png');
            });
        });
        this.setState(() => ({ moduleList, activeKey }));
    }

    // 点击图标
    handleModuleClick = (moduleData) => {
        const { src, title, nodeType } = moduleData;
        let propertyValueDtoList = [];
        let lineName = ''
        if (nodeType === 'line') {
            this.setState(() => ({
                isShowBack: true,
                thirdBreadcrumb: title,
                nodeType,
                lineName,
                selectRows: [],
            }), () => {
                this.getLineInfoList({ limit: 50, pageIndex: 0, lineName })
            });
        } else {
            this.setState(() => ({
                isShowBack: true,
                thirdBreadcrumb: title,
                nodeType,
                propertyValueDtoList,
                selectRows: [],
            }), () => {
                if (nodeType !== 'dataBase') {
                    this.getModelConfigList({ limit: 50, pageIndex: 0, propertyValueDtoList })
                }
            });
        }
    }
    // 点击返回
    handleToBack = () => {
        this.setState(() => ({
            isShowBack: false,
            thirdBreadcrumb: '',
            nodeType: '',
            propertyValueDtoList: [],
            lineName: '',
            isCreate: false,
        }));
    }
    // 切换应用系统
    handleSystemSelect = (systemInfo) => {
        const { nodeType } = this.state;
        const { pagination: { limit } } = this.props;
        let propertyValueDtoList = [];
        let lineName = ''
        this.setState(() => ({ systemInfo, propertyValueDtoList, lineName }), () => {
            if (nodeType) {
                if (nodeType === 'line') {
                    this.getLineInfoList({ limit, pageIndex: 0, lineName })
                } else {
                    this.getModelConfigList({ limit, pageIndex: 0, propertyValueDtoList })
                }
                if (this.operationComponent) {
                    this.operationComponent.handleReset();
                }
            }
        });
    }

    // 获取列表
    getModelConfigList = (_params = {}) => {
        let { dispatch, pagination } = this.props,
            { nodeType: configItemType, systemInfo, propertyValueDtoList } = this.state,
            systemId = systemInfo.systemId,
            { pageIndex, limit } = pagination;
        let { limit: _limit, pageIndex: _pageIndex, propertyValueDtoList: _propertyValueDtoList, configItemType: _configItemType } = _params;

        if (_limit) {
            limit = _limit;
            pageIndex = _pageIndex;
        }

        if (_propertyValueDtoList) {
            propertyValueDtoList = _propertyValueDtoList;
        }

        if (_configItemType) {
            configItemType = _configItemType
        }

        let params = {
            propertyValueDtoList,
            systemId, configItemType,
            pageIndex, limit, start: pageIndex * limit,
        };
        dispatch(getModelConfigList(params));
        // 查询后重置 selectRows
        this.setState(() => ({ selectRows: [] }));
    }

    // 获取通讯线路line模块的列表
    getLineInfoList = (_params = {}) => {
        let { dispatch, pagination } = this.props,
            { nodeType: configItemType, systemInfo, lineName } = this.state,
            systemId = systemInfo.systemId,
            { pageIndex, limit } = pagination;
        let { limit: _limit, pageIndex: _pageIndex, lineName: _lineName } = _params;

        if (_limit) {
            limit = _limit;
            pageIndex = _pageIndex;
        }

        if (_lineName) {
            lineName = _lineName
        }

        let params = {
            lineName,
            systemId, configItemType,
            pageIndex, limit, start: pageIndex * limit,
        };
        dispatch(getLineInfoList(params));
        // 查询后重置 selectRows
        this.setState(() => ({ selectRows: [] }));
    }

    // 更新查询参数
    updateQueryValue = (propertyValueDtoList) => {
        const { pagination } = this.props;
        propertyValueDtoList = propertyValueDtoList.filter(item => item.propValue);
        this.setState(() => ({ propertyValueDtoList }));

        this.getModelConfigList({
            pageIndex: 0, limit: pagination.limit,
            propertyValueDtoList
        });
    }

    // 更新通讯线路查询参数 
    updateQueryValue_line = (lineName) => {
        const { pagination } = this.props;
        this.setState(() => ({ lineName }), () => {
            this.getLineInfoList({
                pageIndex: 0, limit: pagination.limit,
                lineName: lineName
            });
        })
    }

    // 新增
    updateIsCreate = (isCreate) => {
        this.setState(() => ({ isCreate }));
    }

    // 表格多选
    handleRowChange = (selectRows) => {
        this.setState(() => ({ selectRows }));
    }
    // 表格翻页
    handlePaginationChange = (pagination) => {
        if (!_.isEmpty(pagination)) {
            const { current, pageSize, total } = pagination;
            const { nodeType } = this.state
            if (nodeType === 'line') {
                this.getLineInfoList({
                    limit: pageSize, pageIndex: current - 1
                });
            } else {
                this.getModelConfigList({
                    limit: pageSize, pageIndex: current - 1
                });
            }
        }
    }

    // 删除提醒
    showDeleteConfirm = (params, evt) => {
        evt.stopPropagation();
        const { thirdBreadcrumb, selectRows } = this.state;
        const { record, moduleKey } = params;
        let descriptions = '';

        if (record) {
            descriptions = `你确认删除 ${record[moduleKey]} 这个${thirdBreadcrumb}？`;
        } else {
            if (_.isEmpty(selectRows)) {
                message.warning(`请选择要删除的${thirdBreadcrumb}!`)
                return
            }
            let [first, second] = selectRows.map(item => item[moduleKey]);
            if (second) {
                descriptions = `你确认删除 ${first}、${second}... 这些${thirdBreadcrumb}？`;
            } else {
                descriptions = `你确认删除 ${first} 这个${thirdBreadcrumb}？`;
            }
        }

        confirm({
            title: '删除提醒',
            content: descriptions,
            okText: '确认',
            okType: 'primary',
            cancelText: '取消',
            onOk: () => {
                this.handleDeleteDefining(params);
            },
        });

    }

    // 删除属性（含批量删除）
    handleDeleteDefining = (params) => {
        const { dispatch, pagination } = this.props;
        const { thirdBreadcrumb, selectRows, nodeType } = this.state;
        const { record, moduleKey } = params;
        let nodeIds = [];
        if (record) {
            nodeIds = [record.nodeId];
        } else {
            nodeIds = _.map(selectRows, item => item.nodeId);
        }
        dispatch(deleteModels({ nodeIds, configItemType: nodeType }, (result) => {
            message.success(`${thirdBreadcrumb}删除成功`);
            if (nodeType === 'line') {
                this.getLineInfoList({ limit: pagination.limit, pageIndex: 0 });
            } else {
                this.getModelConfigList({ limit: pagination.limit, pageIndex: 0 });
            }
        }, (error = '请求错误') => {
            message.error(error);
        }));
    }

    // 查看详情
    showModuleDetails = (record, evt) => {
        evt.stopPropagation();
        console.log(record)
        this.setState(() => ({ detailsVisable: true, detailsData: record }));
    }
    // 关闭详情弹窗
    hideModuleDetails = () => {
        this.setState(() => ({ detailsVisable: false, detailsData: {} }));
    }

    saveOperationComponent = ref => {
        this.operationComponent = ref;
    }

    // 渲染组件
    renderContent = () => {

        const {
            moduleList,
            systemInfo, nodeType,
            isCreate,
            activeKey,
        } = this.state;
        const { systemId, role } = systemInfo;

        let moduleProps = {
            systemId, role,
            nodeType,
            isCreate,
            updateIsCreate: this.updateIsCreate,
            showModuleDetails: this.showModuleDetails,
            getModelConfigList: this.getModelConfigList,
            getLineInfoList: this.getLineInfoList,
            handleRowChange: this.handleRowChange,
            handlePaginationChange: this.handlePaginationChange,
            showDeleteConfirm: this.showDeleteConfirm,
            updateQueryValue: this.updateQueryValue
        };

        let renderDefault = () => {
            return (<div style={{ padding: '20px  40px' }}>
                <Collapse activeKey={activeKey} onChange={activeKey => {
                    this.setState(() => ({ activeKey }));
                }} >
                    {moduleList.map((item = {}) => {
                        const { title, children } = item;
                        return (<Panel header={title} key={title}>
                            <Row style={{ paddingTop: '22px' }} >
                                {children.map((item, index) => {
                                    const { src, title, nodeType } = item;
                                    let firstItem = index % 5 === 0;
                                    return (<Col span={4} key={nodeType} >
                                        <div className={styles.module_item} onClick={this.handleModuleClick.bind(this, item)}>
                                            <img src={src}></img>
                                            <span className={styles.module_txt}>{title}</span>
                                        </div>
                                    </Col>);
                                })}
                            </Row>
                        </Panel>)
                    })}
                </Collapse>
            </div>)
        };

        let renderSystemModule = () => (<SystemModule  {...moduleProps} />);
        let renderProgramModule = () => (<ProgramModule  {...moduleProps} />);
        let renderResourceModule = () => (<ResourceModule  {...moduleProps} />);
        let renderProcessModule = () => (<ProcessModule  {...moduleProps} />);
        let renderServiceModule = () => (<ServiceModule {...moduleProps} />);
        let renderServiceConsumeModule = () => (<ServiceConsumeModule {...moduleProps} />);
        let renderServiceSliModule = () => (<ServiceSliModule {...moduleProps} />);
        let renderProgramConsumeModule = () => (<ProgramConsumeModule {...moduleProps} />);
        let renderLineModule = () => (<LineModule {...moduleProps} />);
        let renderDatabaseModel = () => (<DataBaseModel {...moduleProps} />);
        let renderDataBaseUserModel = () => (<DataBaseUserModel {...moduleProps} />);



        switch (nodeType) {
            case 'system':
                return renderSystemModule();
            case 'program':
                return renderProgramModule();
            case 'resource':
                return renderResourceModule();
            case 'process':
                return renderProcessModule();
            case 'service':
                return renderServiceModule();
            case 'serviceConsume':
                return renderServiceConsumeModule();
            case 'serviceSli':
                return renderServiceSliModule();
            case 'programConsume':
                return renderProgramConsumeModule();
            case 'line':
                return renderLineModule();
            case 'dataBase':
                return renderDatabaseModel();
            case 'dataBaseUser':
                return renderDataBaseUserModel();
            default:
                return renderDefault()
        }
    }

    // 渲染查询组件
    renderOperation = () => {
        const { nodeType, propertyValueDtoList, lineName, systemInfo } = this.state;

        let moduleProps = {
            nodeType,
            systemInfo,
            queryValue: propertyValueDtoList,
            updateQueryValue: this.updateQueryValue,
            updateIsCreate: this.updateIsCreate,
            showDeleteConfirm: this.showDeleteConfirm,
            handleUploadChange: this.handleUploadChange,
            beforeUpload: this.beforeUpload,
            wrappedComponentRef: this.saveOperationComponent
        }

        switch (nodeType) {
            case 'line':
                moduleProps.queryValue = lineName
                moduleProps.updateQueryValue = this.updateQueryValue_line
                return <LineOperationModule {...moduleProps} />
            case 'program':
                return <ProgramOperationModule {...moduleProps} />
            case 'programConsume':
                return <ProgramConsumeOperationModule {...moduleProps} />
            case 'serviceConsume':
                return <ServiceConsumeOperationModule {...moduleProps} />
            case 'serviceSli':
                return <ServiceSliOperationModule {...moduleProps} />
            case 'service':
                return <ServiceOperationModule {...moduleProps} />
            case 'process':
                return <ProcessOperationModule {...moduleProps} />
            default:
                return null;
        }
    }

    // 上传事件
    handleUploadChange = (info = {}) => {
        let fileList = info.fileList || [];
        // 控制大小在20M以内
        fileList = _.filter(fileList, function (file) {
            return file.size === undefined || _.divide(file.size, 1024 * 1024) <= 20;
        });
        if (info.file && info.file.status === 'done') {
            if (info.file.response && !info.file.response.hasError && info.file.uid) {
                message.success(`${info.file.name} 上传成功！`);
                if (_.isFunction(this.updateQueryValue)) {
                    this.updateQueryValue([]);
                }
            } else {
                let failReason = info.file.response ? info.file.response.error : '上传接口出错！';
                // message.error(`${info.file.name} 上传失败！原因：${failReason}`);
                message.error(`${failReason}`);
                return;
            }
        } else if (info.file && info.file.status === 'error') {
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

    render() {
        const {
            isShowBack, thirdBreadcrumb,
            nodeType, systemInfo,
            propertyValueDtoList,
            lineName,
            detailsVisable, detailsData,
        } = this.state;

        return (
            <div className={styles.block_body}>

                <ApplicationTitle
                    firstBreadcrumb='配置中心'
                    secondBreadcrumb='模型配置'
                    thirdBreadcrumb={thirdBreadcrumb}
                    backVisable={isShowBack}
                    toBack={this.handleToBack}
                    getSelectSystem={this.handleSystemSelect}
                />

                {this.renderOperation()}

                {this.renderContent()}

                {
                    detailsVisable ? (
                        <ModuleDetails
                            visable={detailsVisable}
                            detailsData={detailsData}
                            systemId={systemInfo.systemId}
                            nodeType={nodeType}
                            title={thirdBreadcrumb}
                            hideModal={this.hideModuleDetails}
                        />
                    ) :
                        null
                }

            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const { rows, results, buttonLoading, tableLoading, pagination } = state.modelConfig;
    return { rows, results, buttonLoading, tableLoading, pagination };
}
export default connect(mapStateToProps)(ModuleConfig);