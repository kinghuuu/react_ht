import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Col, Button, Input } from 'antd';
import { PlainSelector } from '../../components/selector/selector';
import { queryRelationShip } from '../../actions/topologicalSearch/action';
import styles from './index.module.less';

const nodeTypeList = [
    { text: '可执行模块', value: 'program' },
    { text: '主机', value: 'resource' },
    { text: '进程', value: 'process' },
    { text: '服务', value: 'service' },
];


class SearchModule extends Component {

    constructor(props) {
        super(props);
        this.state = {
            laoding: false,
            systemId: '',
            nodeType: 'program',
            queryData: '',
            queryDataValue: '',
        };
    }

    // 类型选择
    handleNodeTypeChanged = (selectData) => {
        const { value: [nodeType] } = selectData;
        this.setState(() => ({ nodeType }));
    }
    // 输入框
    handleQueryDataChanged = (evt) => {
        let queryDataValue = evt.target.value;
        this.setState(() => ({ queryDataValue }));
    }
    // 查询
    handleSearch = () => {
        const { queryDataValue } = this.state;
        this.setState(() => ({ queryData: queryDataValue }), () => {
            this.queryRelationShip();
        });
    }

    handleReset = () => {
        this.setState(
            () => ({
                nodeType: 'program',
                queryData: '',
                queryDataValue: '',
            }),
            () => {
                this.queryRelationShip();
            });
    }

    componentDidUpdate() {
        const { systemId, systemName } = this.props;
        if (systemId !== this.state.systemId) {
            this.setState(() => ({
                systemId,
                systemName,
                nodeType: 'program',
                queryData: '',
                queryDataValue: '',
            }), () => {
                this.queryRelationShip();
            });
        }
    }

    // 获取数据
    queryRelationShip = () => {
        const { dispatch, updateTopological } = this.props;
        const { systemId, systemName, nodeType, queryData } = this.state;
        let systemNode = { name: systemName, id: systemId, category: 'system', expanded: true, show: true };
        this.setState(() => ({ laoding: true }));
        dispatch(queryRelationShip({ systemId, nodeType, queryData }, res => {
            this.setState(() => ({ laoding: false }));
            let { data: sourceList, links } = res.data;
            sourceList.push(systemNode);
            updateTopological({ sourceList, links });
        }));
    }

    render() {
        const { nodeType, queryDataValue, loading } = this.state;
        let initNodeType = { data: nodeTypeList, value: [nodeType] };
        return (
            <Row>
                <Col className={styles.searchInput}>
                    <span className={styles.searchName} >拓扑关系类型：</span>
                    <PlainSelector
                        onChange={this.handleNodeTypeChanged}
                        style={{ width: '200px' }}
                        allowClear={false}
                        forceOuterData={true}
                        value={initNodeType}
                    />
                    <span className={styles.searchName} >查询关键字：</span>
                    <Input
                        value={queryDataValue}
                        onChange={this.handleQueryDataChanged}
                        style={{ width: '200px' }}
                        placeholder='请输入关键字查询'
                    />
                    <Button onClick={this.handleSearch} type='primary' loading={loading} >查询</Button>
                    <Button onClick={this.handleReset} loading={loading} >重置</Button>
                </Col>
            </Row>
        );
    }
}
export default connect()(SearchModule);