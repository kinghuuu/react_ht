import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Row, Col, Button, Tree, Empty, Spin, Icon, Descriptions } from 'antd';
import ApplicationTitle from '../common/applicationTitle';
import { SearchInput } from '../../components/searchinput/searchinput';
import { PlainSelector } from '../../components/selector/selector';
import ModuleDetails from '../modelConfig/module/details';
import { ContextPath } from '../../constants';
import styles from './index.module.less';

import { getTopoList, queryAssetsBySeqId } from '../../actions/topList/action';

const { TreeNode } = Tree;
const spps = [
    {},
    { key: 'system', keyName: '应用系统', keyIcon: '应', className: 'icon-bule' },
    { key: 'program', keyName: '可执行模块', keyIcon: '模', className: 'icon-purple' },
    { key: 'process', keyName: '进程', keyIcon: '进', className: 'icon-orange' },
    { key: 'service', keyName: '服务', keyIcon: '服', className: 'icon-green' }
];
const DescriptionsItem = Descriptions;

class IpDimension extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            systemId: '000449',
            detailsVisable: false,
            detailsData: {},
            ditailsTitle: '',
            nodeType: '',

            ipData: {
                data: [],
                value: [],
            },
            queryData: '',
            ipInfo: {},
            treeData: [],
            expandedKeys: [],
        };
    }

    // 获取 IP 信息
    queryAssetsBySeqId = () => {
        const { dispatch } = this.props;
        const { queryData } = this.state;
        dispatch(queryAssetsBySeqId({ seqId: queryData, }, (res = {}) => {
            let ipInfo = res.data || {};
            this.setState(() => ({ ipInfo }));
        }));
    }

    // 获取数据
    getTreeList = (_params = {}) => {
        const { dispatch } = this.props;
        const { systemId, queryData: _queryData, treeData: _treeData } = this.state;
        let { parentId = systemId, deep = 2 } = _params;
        let nodeType = spps[deep].key;
        let queryData = '';
        if (deep === 2) {
            queryData = _queryData;
            nodeType = 'ipDimension';
        }

        let params = { parentId, nodeType, queryData, treeType: 'spps' };
        let treeData = _.cloneDeep(_treeData);

        this.setState(() => ({ loading: true }));

        dispatch(getTopoList(params, (res = {}) => {
            const { rows = [] } = res;
            this.setState(() => ({ loading: false }));

            rows.forEach(item => {
                item.keyIcon = spps[deep].keyIcon;
                item.className = spps[deep].className;
            });

            // 处理叶子
            if (deep === 4) {
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
        }, () => {
            this.setState(() => ({ loading: false }));
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
            ipInfo: {},
        }), () => {
            this.getTreeList();
        });
    }

    // 切换主机IP
    handleIpChanged = (ipData = {}) => {
        const { value: [queryData], data } = ipData;
        // let ip = data.find(item => item.value = queryData).text;
        this.setState(() => ({ ipData, queryData }));
    }

    // 查询
    handleSearch = () => {
        const { systemId } = this.state;
        this.getTreeList();
        this.setState(() => ({ expandedKeys: [systemId] }));
        this.queryAssetsBySeqId();
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
        if (key) {
            let { pos, value: nodeId } = evt.node.props;
            pos = pos.split('-').length;
            let { key: nodeType, keyName: ditailsTitle } = spps[pos - 1];
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
            treeData, loading, expandedKeys, ipData,
            systemId, nodeType, detailsVisable, detailsData, ditailsTitle,
            ipInfo,
        } = this.state;
        const { buttonLoading = false } = this.props;

        return (
            <div className={styles.block_body} >
                <ApplicationTitle
                    firstBreadcrumb='配置中心'
                    secondBreadcrumb='IP维度查询'
                    getSelectSystem={this.handleSystemSelect}
                />

                <Spin spinning={loading}>
                    <Row>
                        <Col className={styles.searchInput}>
                            <span className={styles.searchName} >IP：</span>
                            <SearchInput
                                style={{ width: '200px' }}
                                placeholder='请选择 IP 查询'
                                method='get'
                                value={ipData}
                                attachParams={{ systemId, nodeType: 'resource' }}
                                dataUrl={`${ContextPath}/cmdbCommon/getSelectList`}
                                forceOuterData={true}
                                allowClear={true}
                                onChange={this.handleIpChanged}
                            />
                            <Button onClick={this.handleSearch} type='primary' loading={buttonLoading} >查询</Button>
                        </Col>
                    </Row>

                    {_.isEmpty(ipInfo) ? null : (
                        <Descriptions
                            className={styles.customDescriptions}
                            style={{ marginBottom: '16px' }}
                            size='middle'
                            bordered
                            column={3}
                        >
                            <DescriptionsItem label='IP地址'>{ipInfo.outip}</DescriptionsItem>
                            <DescriptionsItem label='状态'>{ipInfo.useStatusName}</DescriptionsItem>
                            <DescriptionsItem label='操作系统'>{ipInfo.operatingSystemName}</DescriptionsItem>
                            <DescriptionsItem label='所属机房'>{ipInfo.addressName}</DescriptionsItem>
                            <DescriptionsItem label='流水号'>{ipInfo.sequenceid}</DescriptionsItem>
                            <DescriptionsItem label='设备类型'>{ipInfo.assetTypeName}</DescriptionsItem>
                            {/* <DescriptionsItem label='使用人'>{ipInfo.userId}</DescriptionsItem>
                            <DescriptionsItem label='宿主机'>{ipInfo.resourceIp}</DescriptionsItem>
                            <DescriptionsItem label='可执行模块：'>{ipInfo.programName}</DescriptionsItem>
                            <DescriptionsItem label='主要配置'>{ipInfo.mainConfig}</DescriptionsItem> */}
                        </Descriptions>
                    )}

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

export default connect()(IpDimension);