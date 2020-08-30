import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { ContextPath } from '../../constants';
import RightContent from './system/content'
import RightNode from './system/applicationNode'
import Program from './system/modal'
import Styles from './index.module.less'
import { Layout, Select, Tree, Modal, Button, Upload, message, Spin, Form, Input, Row, Col } from 'antd';
import {
    selectProgramAction, treeListTypeAction, updateRecordAction, getRelationValue,
    detailApplicationAction, detailProgramAction, updateAttributeAction, getResourceList, cloneApplicationProgram, updateGroupAction, updateSearchGroupValues
} from '../../actions/application/action'
import add from '../../assets/imgs/add.png'
import { getServeList } from '../../actions/application/service/action'
import { getOracleList, getMysqlList } from '../../actions/application/database/action'

const { Content, Sider } = Layout;
const { Option } = Select;
const { TreeNode } = Tree;
let FormItem = Form.Item;

class index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            systemId: '', //父ID
            visible: false,
            node: false,
            type: 'add',
            selectList: [],
            treeList: [],
            activeKey: '', //子ID
            isImporting: false,
            showCloneModal: false,
            disableCloneBtn: true,
            programId: '',
            selectedKeys: [],
            selectSystem: '',
            activeTab: '1'
        };
    }

    showCloneProgramModal = () => {
        this.setState({ showCloneModal: true });
    };

    closeCloneModal = () => {
        this.setState({ showCloneModal: false });
    };

    // 克隆回调
    cloneScb = (res) => {
        this.requestSelect();
    };

    // 克隆程序
    handleClone = () => {
        const { dispatch, form } = this.props;
        let { systemId, programId } = this.state;
        form.validateFieldsAndScroll((err, fieldsValue) => {
            if (err) {
                return;
            }
            this.setState({
                showCloneModal: false,
                isImporting: true
            });
            dispatch(cloneApplicationProgram(systemId, programId, fieldsValue.name, this.cloneScb));
        });
    };

    // 下载模板
    downloadImportExcel = () => {
        const { systemId } = this.state;
        window.open(`${ContextPath}/cmdb/system/${systemId}/import/program/download`);//等后端接口
    };

    handleUploadChange = (info) => {
        let fileList = info.fileList;
        // 控制大小在20M以内
        fileList = _.filter(fileList, function (file) {
            return file.size === undefined || _.divide(file.size, 1024 * 1024) <= 20;
        });
        if (info.file.status === 'done') {
            if (info.file.response && !info.file.response.hasError && info.file.uid) {
                message.success(`${info.file.name} 上传成功！`);
                this.setState({ isImporting: true }, () => {
                    this.requestSelect();
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

    //下拉选择触发事件
    handleChange = (val) => {
        this.setState({
            systemId: val,
            node: false,
            disableCloneBtn: true
        })
        this.requestTreeData(val)
        this.requestDetailApplication(val)
        this.props.dispatch(updateAttributeAction(val))
        this.props.dispatch(updateGroupAction(val));
        this.props.dispatch(updateSearchGroupValues([]));
    }

    addModal = () => {
        this.setState({
            visible: true
        })
    }

    onRef = (ref) => {
        this.child = ref
    }

    handleOk = (e) => {
        e.preventDefault();
        this.child.submit()
    }


    handleCancel = () => {
        this.setState({
            visible: false
        })
    }


    changeNode = () => {
        this.setState({
            node: false
        })
    }

    // 当前的tab的key值
    handleTab = (key) => {
        this.setState({
            activeTab: key
        })
    }

    // 左侧输入分组值
    handleSearchGroupValues = (idx, { target: { value } }) => {
        let { searchCustomGroupList, searchGroupValues, dispatch } = this.props;
        let values = _.map(searchCustomGroupList, (item, index) => {
            return {
                id: item.id,
                systemId: item.systemId,
                propId: item.propId,
                propName: item.propName,
                propValue: ''
            };
        });
        if (searchGroupValues && searchGroupValues[idx]) {
            searchGroupValues[idx]['propValue'] = value;
        } else {
            values[idx]['propValue'] = value;
        }
        values[idx]['propValue'] = value;
        searchCustomGroupList[idx]['propValue'] = value;
        Object.assign(values, searchGroupValues);
        dispatch(updateSearchGroupValues(values));
    };

    getSearchGroupValues = () => {
        const { getFieldValue } = this.props.form;
        const { systemId } = this.state;
        let { searchCustomGroupList, dispatch } = this.props;
        let values = _.map(searchCustomGroupList, (item, index) => {
            let value = getFieldValue(`${item.propId}${index}`);
            return {
                id: item.id,
                systemId,
                propId: item.propId,
                propName: item.propName,
                propValue: value
            }
        });
        // dispatch(updateSearchGroupValues(values));
        return values;
    };

    //点击树形结构
    selectTree = (selectedKeys, info) => {
        const { treeList, systemId, activeTab } = this.state
        const node = info.node.props.dataRef
        let selectedKey = selectedKeys.join(',');
        this.setState({ selectedKeys });
        //点击获取子节点程序详情数据
        if (node.topoNodeDtoList === undefined) {//点的子菜单
            if (selectedKey) {
                this.setState({ programId: selectedKey });
                let valuesArr = this.getSearchGroupValues();
                let { pagination: { limit, pageIndex } } = this.props;
                let pageSize = 10;
                let params = { limit, start: pageIndex * pageSize };
                if (valuesArr && valuesArr.length > 0) {
                    params.customCategoryList = valuesArr;
                }
                this.setState({ disableCloneBtn: false });
                switch (activeTab) {
                    case '1':
                        this.props.dispatch(getRelationValue({ parentId: selectedKey }, () => {
                            this.props.dispatch(detailProgramAction(systemId, selectedKey, () => {
                                this.setState({
                                    node: true
                                })
                            }));
                        }));//程序属性详情页
                        break;
                    case '2':
                        this.props.dispatch(updateRecordAction(systemId, selectedKey, () => {
                            this.setState({
                                node: true
                            })
                        }));//变更记录
                        break;
                    case '3':
                        this.props.dispatch(getResourceList(params, systemId, selectedKey, () => {
                            this.setState({
                                node: true
                            })
                        }));//获取更新后的列表
                        break;
                    case '4':
                        let serveParams = {
                            systemId: systemId,
                            parentId: selectedKey,
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
                        this.props.dispatch(getServeList(serveParams, () => {
                            this.setState({
                                node: true
                            })
                        }));// 获取服务列表
                        break;
                    case '5':
                        let oracleParams = {
                            systemId: systemId,
                            parentId: selectedKey,
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
                        this.props.dispatch(getOracleList(oracleParams, () => {
                            this.setState({
                                node: true
                            })
                        }));
                        let mysqlParams = {
                            systemId: systemId,
                            parentId: selectedKey,
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

                        this.props.dispatch(getMysqlList(mysqlParams, () => {
                            this.setState({
                                node: true
                            })
                        }));
                        break;
                }


            } else {
                this.setState({
                    node: true,
                    disableCloneBtn: false
                });
            }
        } else {//点的父菜单
            this.props.dispatch(updateGroupAction(systemId));
            this.setState({
                node: false,
                disableCloneBtn: true
            });
        }
        //点击切换颜色
        treeList.map((item, k) => {
            if (item.id == selectedKey) {
                item.selected = true
            } else {
                item.selected = false
            }
            item.topoNodeDtoList.map((val) => {
                if (val.id == selectedKey) {
                    val.selected = true
                } else {
                    val.selected = false
                }
            })
        })
        this.setState({
            treeList: this.state.treeList,
        })
    }

    treeTitle = (val) => {
        return (
            <span className={Styles.treeTitle}>
                <span className={Styles.icon} style={{ background: val.selected ? '#498fe0' : '#c3cdd7' }}>{val.icon}</span>
                <span style={{ paddingLeft: 10, }}>{val.name}</span>
                <span style={{ float: 'right' }}>
                    {
                        val.needAddBtn === '1' ? <img src={add} onClick={this.addModal} /> : ''
                    }
                </span>
            </span>
        )

    }

    //渲染树
    renderTreeNodes = data =>
        data.map(item => {
            const id = item.id ? item.id : item.sysId
            if (item.topoNodeDtoList) {
                return (
                    <TreeNode title={this.treeTitle(item)} key={id} dataRef={item}>
                        {this.renderTreeNodes(item.topoNodeDtoList)}
                    </TreeNode>
                );
            }
            return <TreeNode key={id} title={this.treeTitle(item)} dataRef={item} />;
        })

    //页面加载默认展示下拉选择第一条数据树形结构
    requestSelect = () => {
        const { params } = this.props;
        let appId, moduleId;
        if (params) {
            appId = params.appId;
            moduleId = params.moduleId;
        }
        if (params && appId) {
            this.setState({ selectSystem: appId });
        }
        selectProgramAction((res) => {
            if (res.length === 0) {
                message.warning('您不是应用系统主备岗，不能进行应用配置！');
            }
            let { isImporting, systemId } = this.state;
            // let _systemId = (params && appId) ? appId : isImporting ? systemId : res[0].id;
            let _systemId = '';
            if (params && appId) {
                _systemId = appId;
            } else {
                if (isImporting) {
                    _systemId = systemId;
                } else {
                    if (_.isObject(res[0])) {
                        _systemId = res[0].id
                    }
                    // 这里的代码只是调试用的
                    else{
                        _systemId = '000447'
                    }
                }
            }
            this.setState({
                selectList: res,
                systemId: _systemId
            })
            this.requestTreeData(_systemId)
            this.requestDetailApplication(_systemId)
            this.props.dispatch(updateGroupAction(_systemId));
        })
    }

    //获取左侧树菜单
    requestTreeData = (id) => {
        const { dispatch } = this.props;
        const { params } = this.props;
        let appId, moduleId;
        if (params) {
            appId = params.appId;
            moduleId = params.moduleId;
        }
        let _this = this;
        dispatch(treeListTypeAction(id, (res) => {
            let resData = res.data;
            let info = {};
            let data = res.rows
            if (params !== undefined) {
                info.node = {};
                info.node.props = {};
                if (appId && moduleId) {
                    info.node.props.dataRef = _.filter(resData.topoNodeDtoList, item => item.id === moduleId);
                    _this.setState({ treeList: res.rows }, () => {
                        _this.selectTree(['' + moduleId], info);
                    })
                } else if (appId && !moduleId) {
                    info.node.props.dataRef = resData;
                    _this.setState({ treeList: res.rows }, () => {
                        _this.selectTree(['' + moduleId], info);
                    })
                }
            }

            if (data.length > 0) {
                data.map((item) => {
                    item.selected = true
                    item.topoNodeDtoList.map((val) => {
                        val.selected = false
                    })
                })
                let arry = []
                arry.push(String(data[0].id))
                this.setState({
                    treeList: data,
                    activeKey: arry
                })
            }

        }))
    }

    //主应用右侧详情展示
    requestDetailApplication = (id) => {
        this.props.dispatch(detailApplicationAction(id))
    }

    handleExpand = (key) => {
        this.setState({
            activeKey: key
        })
    }

    componentDidMount() {
        this.requestSelect();
    }

    render() {
        const { node, visible, selectList, treeList, activeKey, systemId, programId, disableCloneBtn, showCloneModal, selectSystem } = this.state
        const { treeLoading, searchCustomGroupList } = this.props;
        const { params } = this.props;
        let appId, moduleId;
        if (params) {
            appId = params.appId;
            moduleId = params.moduleId;
        }
        let selectName = (params !== undefined && appId) ? selectSystem : selectList.length > 0 ? selectList[0].system_name : ''
        const uploadProps = {
            name: 'fileData',
            action: `${ContextPath}/cmdb/system/${systemId}/import/program/upload`,
            showUploadList: false,
            onChange: this.handleUploadChange.bind(this),
            beforeUpload: this.beforeUpload.bind(this)
        };
        const { getFieldDecorator } = this.props.form;
        let formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 4 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 18 },
            },
        }
        let formItemLayout1 = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 6 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 18 },
            },
        }
        let searchCustomGroupListDom = null;

        if (searchCustomGroupList.length > 0) {
            searchCustomGroupListDom = searchCustomGroupList.map((item, index) => {
                return (
                    <FormItem label={item.propName} key={index}>
                        {getFieldDecorator(`${item.propId}${index}`, {
                            // rules: [
                            //     {required: true, message: '组件名称不能为空!' },
                            //     {validator:this.validateNames},
                            // ],
                            // initialValue:item.propName,
                        })(
                            <Input
                                size='small'
                                placeholder='请输入自定义分组值'
                                onChange={this.handleSearchGroupValues.bind(this, index)}
                            />
                        )}
                    </FormItem>
                )
            })
        }

        return (
            <Layout className={Styles.applicationMain}>
                <Sider theme='light' width="300" className={Styles.siderLeft}>
                    <div style={{ display: 'flex' }}>
                        {
                            selectList.length > 0 ?
                                <Select
                                    className={Styles.serach}
                                    defaultValue={selectName}
                                    onChange={this.handleChange}
                                >
                                    {
                                        selectList.map((item, index) => {
                                            return (
                                                <Option value={item.id} key={item.id}>{item.system_name}</Option>
                                            )
                                        })
                                    }
                                </Select> : ''
                        }
                    </div>

                    <div className={Styles.btnsWrapper}>
                        <Button
                            style={{ marginRight: '4px' }}
                            type='primary'
                            icon='download'
                            size='small'
                            onClick={this.downloadImportExcel.bind(this)}
                        >下载模板</Button>
                        <Upload {...uploadProps} >
                            <Button type='primary' icon='import' size='small' style={{ backgroundColor: '#f0ad4e', borderColor: '#eea236' }}>导入程序</Button>
                        </Upload>
                        <Button
                            style={{ marginLeft: '4px' }}
                            type='primary'
                            icon='copy'
                            size='small'
                            onClick={this.showCloneProgramModal.bind(this)}
                            disabled={disableCloneBtn}
                        >克隆</Button>
                    </div>

                    <Spin spinning={treeLoading}>
                        {
                            searchCustomGroupList.length > 0 ?
                                <Form {...formItemLayout1} className={Styles.groupInputList}>
                                    {searchCustomGroupListDom}
                                </Form> :
                                null
                        }

                        <div className={Styles.treeList}>
                            {treeList.length > 0 ?
                                // <Spin spinning={treeLoading}>
                                <Tree
                                    expandedKeys={activeKey}
                                    showLine
                                    onExpand={this.handleExpand}
                                    // defaultExpandAll
                                    onSelect={this.selectTree}
                                    selectedKeys={this.state.selectedKeys}
                                >
                                    {this.renderTreeNodes(treeList)}
                                </Tree>
                                // </Spin>
                                :
                                null
                            }
                        </div>
                    </Spin>
                </Sider>
                <Layout>
                    <Content style={{ margin: '0 16px' }}>
                        {
                            node ? <RightNode
                                systemId={systemId}
                                requestTreeData={this.requestTreeData}
                                changeNode={this.changeNode}
                                onHandleTab={this.handleTab}
                                params={params}
                                programId={programId} />
                                :
                                <RightContent
                                    systemId={systemId}
                                    params={params} />
                        }
                    </Content>
                </Layout>

                <Modal
                    title="新增程序"
                    visible={visible}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                    width={620}
                    destroyOnClose={true}>
                    <Program
                        systemId={this.state.systemId}
                        type={this.state.type}
                        onRef={this.onRef}
                        handleCancel={this.handleCancel}
                        requestTreeData={this.requestTreeData}
                        params={params}
                        type='add' />
                </Modal>
                <Modal
                    title='克隆程序'
                    visible={showCloneModal}
                    onOk={this.handleClone}
                    onCancel={this.closeCloneModal}
                    destroyOnClose={true}>
                    <Form {...formItemLayout}>
                        <Form.Item label="程序名称">
                            {getFieldDecorator('name', {
                                rules: [{
                                    required: true,
                                    message: '请输入程序名称',
                                }]
                            })
                                (<Input />)
                            }
                        </Form.Item>
                    </Form>
                </Modal>
            </Layout>
        );
    }
}
const mapStateToProps = (state, ownProps) => {
    const { treeLoading, resource: { rows, tableLoading, results, pagination } } = state.applicationResource;
    return {
        detailApplicationList: state.detailApplicationList,
        searchCustomGroupList: state.searchCustomGroupList,
        searchGroupValues: state.searchGroupValues,
        treeLoading,
        rows,
        tableLoading,
        results,
        pagination
    }
}

index = Form.create()(index);

export default connect(mapStateToProps)(index);