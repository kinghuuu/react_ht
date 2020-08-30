import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Row, Col, Button, Tree, Empty, Spin, Icon } from 'antd';
import ApplicationTitle from '../common/applicationTitle';
import { SearchInput } from '../../components/searchinput/searchinput';
import { PlainSelector } from '../../components/selector/selector';
import ModuleDetails from '../modelConfig/module/details';
import { ContextPath } from '../../constants';
import styles from './index.module.less';

import { getTopoList } from '../../actions/topList/action';

const { TreeNode } = Tree;
const topologyConfig = {
    srp: [
        {},
        { key: 'system', keyName: '应用系统', keyIcon: '应', className: 'icon-bule' },
        { key: 'resource', keyName: '主机', keyIcon: '机', className: 'icon-yellow' },
        { key: 'program', keyName: '可执行模块', keyIcon: '模', className: 'icon-purple' }
    ],
    spr: [
        {},
        { key: 'system', keyName: '应用系统', keyIcon: '应', className: 'icon-bule' },
        { key: 'program', keyName: '可执行模块', keyIcon: '模', className: 'icon-purple' },
        { key: 'resource', keyName: '主机', keyIcon: '机', className: 'icon-yellow' },
    ],
    spps: [
        {},
        { key: 'system', keyName: '应用系统', keyIcon: '应', className: 'icon-bule' },
        { key: 'program', keyName: '可执行模块', keyIcon: '模', className: 'icon-purple' },
        { key: 'process', keyName: '进程', keyIcon: '进', className: 'icon-orange' },
        { key: 'service', keyName: '服务', keyIcon: '服', className: 'icon-green' }
    ],
};


class TopList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            systemId: '000449',
            detailsVisable: false,
            detailsData: {},
            ditailsTitle: '',
            nodeType: '',
            topologyData: {
                data: [
                    { text: '应用系统-主机-模块', value: 'srp' },
                    { text: '应用系统-模块-主机', value: 'spr' },
                    { text: '应用系统-模块-进程-服务', value: 'spps' },
                ],
                value: ['srp'],
            },
            treeType: 'srp',

            ipData: {
                data: [],
                value: [],
            },
            queryData: '',

            treeData: [],
            expandedKeys: [],

        };
    }
    // 获取数据
    getTreeList = (_params = {}, callback) => {
        const { dispatch } = this.props;
        const { systemId, treeType, queryData, treeData: _treeData } = this.state;

        let { parentId = systemId, deep = 2 } = _params;
        let nodeType = topologyConfig[treeType][deep].key;
        let params = { parentId, treeType, nodeType, queryData };
        let treeData = _.cloneDeep(_treeData);

        this.setState(() => ({ loading: true }));

        dispatch(getTopoList(params, (res = {}) => {
            const { rows = [] } = res;

            this.setState(() => ({ loading: false }));


            rows.forEach(item => {
                item.keyIcon = topologyConfig[treeType][deep].keyIcon;
                item.className = topologyConfig[treeType][deep].className;
            });

            // 处理叶子
            if (deep === 4 || (deep === 3 && treeType !== 'spps')) {
                rows.forEach(item => {
                    item.isLeaf = true;
                });
            }

            treeData.forEach(item => {
                const { value, children } = item;
                if (value === parentId) {
                    item.children = rows;
                }
                if (_.isArray(children)) {
                    children.forEach(cItem => {
                        const { value: cValue, children } = cItem;
                        if (cValue === parentId) {
                            cItem.children = rows;
                        }
                        if (_.isArray(children)) {
                            children.forEach(cItem => {
                                const { value: cValue } = cItem;
                                if (cValue === parentId) {
                                    cItem.children = rows;
                                }
                            })
                        }
                    })
                }
            });

            this.setState(() => ({ treeData }));

            // if (_.isFunction(callback)) {
            //     callback(rows);
            // }
        }));
    }

    // 切换应用系统
    handleSystemSelect = (systemInfo) => {
        const { systemId, systemName } = systemInfo;
        let treeData = [{ title: systemName, value: systemId, key: systemId, children: [{}], keyIcon: '应', className: 'icon-bule' }];
        let expandedKeys = [systemId];
        this.setState(() => ({
            systemId,
            treeData,
            expandedKeys,
            ipData: {
                data: [],
                value: [],
            },
            queryData: '',
            topologyData: {
                data: [
                    { text: '应用系统-主机-模块', value: 'srp' },
                    { text: '应用系统-模块-主机', value: 'spr' },
                    { text: '应用系统-模块-进程-服务', value: 'spps' },
                ],
                value: ['srp'],
            },
            treeType: 'srp',
        }), () => {
            this.getTreeList();
        });
    }

    // 切换拓扑关系类型
    handleTopologyChanged = (topologyData = {}) => {
        const { value: [treeType] } = topologyData;
        this.setState(() => ({
            topologyData, treeType,
            ipData: {
                data: [],
                value: [],
            },
            queryData: '',
        }), () => {
            this.getTreeList();
        });
    }

    // 切换主机IP
    handleIpChanged = (ipData = {}) => {
        const { value: [queryData] } = ipData;
        this.setState(() => ({ ipData, queryData }));
    }

    // 查询
    handleSearch = () => {
        const { systemId } = this.state;
        this.getTreeList();
        this.setState(() => ({ expandedKeys: [systemId] }));
    }

    // 展开树时加载数据
    handlerTreeExpand = (expandedKeys, nodeData) => {
        this.setState(() => ({ expandedKeys }))
        if (expandedKeys[0]) {
            const { props: { pos, value } } = nodeData.node;
            let deep = pos.split('-').length;
            this.getTreeList({ deep, parentId: value })
        }
    }

    // 查看详情
    handleTreeSelect = (selectKeys, evt) => {
        let [key] = selectKeys;
        const { treeType } = this.state;
        if (key) {
            let { pos, value: nodeId } = evt.node.props;
            pos = pos.split('-').length;
            let { key: nodeType, keyName: ditailsTitle } = topologyConfig[treeType][pos - 1];
            this.setState(() => ({ nodeType, ditailsTitle, detailsData: { nodeId }, detailsVisable: true }));
        }
    }
    // 关闭详情弹窗
    hideModuleDetails = () => {
        this.setState(() => ({ detailsVisable: false, detailsData: {} }));
    }

    // 渲染树
    renderTreeNode = (treeList, parentkey = '') => {
        return _.map(treeList, item => {
            const { title, key, children, isLeaf = false, keyIcon, className } = item;
            return (<TreeNode icon={<span className={className}>{keyIcon}</span>} isLeaf={isLeaf} value={key} title={`${title}`} key={parentkey ? `${parentkey}-${key}` : key} >
                {_.isArray(children) ? this.renderTreeNode(children, key) : null}
            </TreeNode>)
        });
    }



    render() {

        const {
            topologyData, treeData, loading, expandedKeys, ipData, treeType,
            systemId, nodeType, detailsVisable, detailsData, ditailsTitle
        } = this.state;
        const { buttonLoading = false } = this.props;

        return (
            <div className={styles.block_body} >
                <ApplicationTitle
                    firstBreadcrumb='配置中心'
                    secondBreadcrumb='拓扑关系'
                    getSelectSystem={this.handleSystemSelect}
                />

                <Spin spinning={loading}>
                    <Row>
                        <Col className={styles.searchInput}>
                            <span className={styles.searchName} >拓扑关系类型：</span>
                            <PlainSelector
                                onChange={this.handleTopologyChanged}
                                style={{ width: '200px' }}
                                allowClear={false}
                                forceOuterData={true}
                                value={topologyData}
                            />
                            {treeType === 'srp' ? (
                                <Fragment>
                                    <span className={styles.searchName} >主机 IP：</span>
                                    <SearchInput
                                        style={{ width: '200px' }}
                                        placeholder='请选择主机IP'
                                        method='get'
                                        value={ipData}
                                        attachParams={{ systemId, nodeType: 'resource' }}
                                        dataUrl={`${ContextPath}/cmdbCommon/getSelectList`}
                                        forceOuterData={true}
                                        allowClear={true}
                                        onChange={this.handleIpChanged}
                                    />
                                </Fragment>
                            ) : (
                                    <Fragment>
                                        <span className={styles.searchName} >模块名称：</span>
                                        <SearchInput
                                            style={{ width: '200px' }}
                                            placeholder='请选择所属模块'
                                            method='get'
                                            value={ipData}
                                            attachParams={{ systemId, nodeType: 'program' }}
                                            dataUrl={`${ContextPath}/cmdbCommon/getSelectList`}
                                            forceOuterData={true}
                                            allowClear={true}
                                            onChange={this.handleIpChanged}
                                        />
                                    </Fragment>
                                )

                            }
                            <Button onClick={this.handleSearch} type='primary' loading={buttonLoading} >查询</Button>
                        </Col>
                    </Row>

                    {
                        _.isEmpty(treeData) ? (
                            <Empty></Empty>
                        ) : (
                                <Tree
                                    className={styles.customTree}
                                    expandedKeys={expandedKeys}
                                    showLine={true}
                                    showIcon={true}
                                    loadData={() => Promise.resolve()}
                                    onExpand={this.handlerTreeExpand}
                                    onSelect={this.handleTreeSelect}
                                >
                                    {this.renderTreeNode(treeData)}
                                </Tree>
                            )
                    }

                    {
                        detailsVisable ? (
                            <ModuleDetails
                                visable={detailsVisable}
                                detailsData={detailsData}
                                systemId={systemId}
                                nodeType={nodeType}
                                title={ditailsTitle}
                                hideModal={this.hideModuleDetails}
                                showChanged={false}
                            />
                        ) :
                            null
                    }
                </Spin>
            </div>
        );
    }
}

// const mapStateToProps = (state, ownProps) => {
//     return {
//     }
// }

export default connect()(TopList);