import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { Row, Col, Upload, Input, Button, message, Dropdown, Menu, Icon, Alert } from 'antd';
import { ContextPath } from '../../../constants';
import { SearchInput } from '../../../components/searchinput/searchinput';
import { getTemplates } from '../../../actions/application/action';
import SelfDefineSearch from './selfDefineSearch';
import styles from '../index.module.less';
import { getSelfDefiningList } from '../../../actions/selfDefining/action';

const searchConfig = {
    program: {
        searchTitle: '可执行模块',
        dtoList: { propId: 'moduleName', propValue: '' },
        delTipsKey: 'moduleName',
        isSearchName: true,
    },
    process: {
        searchTitle: '进程',
        dtoList: { propId: 'processName', propValue: '' },
        delTipsKey: 'processName',
        isSearchName: true,
    },
    service: {
        searchTitle: '服务',
        dtoList: { propId: 'serverName', propValue: '' },
        delTipsKey: 'serverName',
        isSearchName: true,
    },
    programConsume: {
        searchTitle: '调用方模块',
        dtoList: { propId: 'providerProgramId', propValue: '' },
        delTipsKey: 'providerProgram',
        isSearchName: false,
        searchNodeType: 'program',
    },
    serviceSli: {
        searchTitle: '服务',
        dtoList: { propId: 'serviceId', propValue: '' },
        delTipsKey: 'service',
        isSearchName: false,
        searchNodeType: 'service',
    },
    serviceConsume: {
        searchTitle: '调用方服务',
        dtoList: { propId: 'providerServiceId', propValue: '' },
        delTipsKey: 'providerService',
        isSearchName: false,
        searchNodeType: 'service',
    },
    line: {
        searchTitle: '通讯线路',
        dtoList: { propId: 'lineId', propValue: '' },
        delTipsKey: 'lineName',
        isSearchName: false,
        searchNodeType: 'service',
    },
}, MenuItem = Menu.Item;

class OperationModule extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isShowOtherQuery: false,
            isShowOtherQueryBtn: false,
            queryList: [],
            queryValue: '',
            query: '',
            initSearchData: { data: [], value: [] },
            templateList: []
        };
    }

    componentDidMount() {
        getTemplates((res) => {
            this.setState({
                templateList: res || []
            });
        });
    }

    handleSearch = () => {
        const { nodeType, updateQueryValue } = this.props;
        const { queryValue, isShowOtherQuery } = this.state;

        let selfDefineQuery = [];
        if (isShowOtherQuery) {
            selfDefineQuery = this.searchForm.getValue();
        }

        let propertyValue = _.cloneDeep(searchConfig[nodeType].dtoList);
        propertyValue.propValue = queryValue;

        if (_.isFunction(updateQueryValue)) {
            if (nodeType === 'line') {
                updateQueryValue(queryValue);
            } else {

                updateQueryValue([propertyValue, ...selfDefineQuery]);
            }
            this.setState(() => ({ query: queryValue }));
        }

    }
    handleSelect = (selectData) => {
        const { nodeType } = this.props;
        let [selectId = ''] = selectData.value
        let lineNameTemp = '';

        if (!_.isEmpty(selectData.data)) {
            // lineNameTemp = selectData.data.find(item => (item.value === selectId)).text
            for (let i = 0; i < selectData.data.length; i++) {
                if (selectId === selectData.data[i].value) {
                    lineNameTemp = selectData.data[i].text
                }
            }
        }
        if (nodeType === 'line') {
            this.setState(() => ({ queryValue: lineNameTemp, initSearchData: selectData }))
        } else {
            this.setState(() => ({ queryValue: selectId, initSearchData: selectData }))
        }

    }

    handleReset = () => {
        const { nodeType, updateQueryValue } = this.props;

        if (this.state.isShowOtherQuery) {
            this.searchForm.resetValue();
        }
        this.setState(() => ({ isShowOtherQuery: false }));
        this.setState(
            () => ({ query: '', queryValue: '', initSearchData: { data: [], value: [] } }),
            () => {
                if (nodeType === 'line') {
                    updateQueryValue('');
                } else {
                    updateQueryValue([]);
                }
            })
    }

    handleCreate = () => {
        const { updateIsCreate } = this.props;
        if (_.isFunction(updateIsCreate)) {
            updateIsCreate(true);
        }
    }

    // 下载模板
    downloadTemplate = () => {
        let { nodeType, systemInfo } = this.props,
            systemId = systemInfo.systemId;
        let params = encodeURI(`configItemType=${nodeType}&systemId=${systemId}`);
        window.open(`${ContextPath}/cmdbCommon/downloadTemp?${params}`);
    };

    // 导出 Excel 模板
    downloadImportExcel = () => {
        const { nodeType, systemInfo } = this.props,
            systemId = systemInfo.systemId;
        const { query } = this.state;
        let propertyValue = _.cloneDeep(searchConfig[nodeType].dtoList);
        let propertyValueList = [];
        if (query) {
            propertyValue.propValue = query;
            propertyValueList.push(propertyValue);
        }
        // propertyValueList = encodeURI(JSON.stringify(propertyValueList));
        if (nodeType === 'line') {
            let params = encodeURI(`systemId=${systemId}&lineName=${query}`);
            window.open(`${ContextPath}/cmdb/downloadLineExcel?${params}`);
        } else {
            let params = encodeURI(`configItemType=${nodeType}&systemId=${systemId}&propertyValueList=${JSON.stringify(propertyValueList)}`);
            window.open(`${ContextPath}/cmdbCommon/downloadData?${params}`);
        }
    }
    handleMenuClick = (e) => {
        let params = encodeURI(`nodeType=${e.key}`);
        window.open(`${ContextPath}/cmdbModel/downloadExcelModel?${params}`);
    }

    saveFormComponent = ref => {
        this.searchForm = ref;
    }

    componentDidUpdate() {
        const { systemInfo = {}, nodeType } = this.props;
        const { systemId } = this.state;
        let pId = systemInfo.systemId;
        if (pId !== systemId) {
            this.setState(
                () => ({ systemId: pId, nodeType }),
                () => {
                    this.getSelfDefiningList()
                });
        }
    }

    getSelfDefiningList = () => {
        const { dispatch } = this.props;
        const { systemId, nodeType } = this.state;
        dispatch(getSelfDefiningList(
            { systemId, nodeType, pageIndex: 0, limit: 100, start: 0 },
            (res = {}) => {
                let queryList = res.rows || [];
                queryList = queryList.filter(item => item.isSearchKey === '1');
                this.setState(() => ({ queryList, isShowOtherQueryBtn: !_.isEmpty(queryList) }));
            }
        ))
    }

    render() {
        const {
            queryValue,
            initSearchData,
            templateList,
            isShowOtherQuery, isShowOtherQueryBtn, queryList,
        } = this.state;
        const {
            buttonLoading,
            systemInfo, nodeType,
            showDeleteConfirm,
            handleUploadChange,
            beforeUpload,
        } = this.props;

        const { systemId, role } = systemInfo;

        const uploadProps = {
            name: 'file',
            action: `${ContextPath}/cmdbCommon/import`,
            data: { systemId, configItemType: nodeType },
            showUploadList: false,
            beforeUpload: beforeUpload.bind(this),
            onChange: handleUploadChange.bind(this),
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
        const uploadPropertys = {
            data: { systemId },
            name: 'file',
            action: `${ContextPath}/cmdbModel/import`,
            showUploadList: false,
            onChange: handleUploadChange.bind(this),
            beforeUpload: beforeUpload.bind(this)
        };

        const { searchTitle, isSearchName, searchNodeType, delTipsKey } = searchConfig[nodeType] || {};

        let isLeader = role === '领导', isAdmin = role === '管理员';

        return (<Row>
            <Col className={styles.searchInput} >
                <span className={styles.searchName} >{searchTitle}名称：</span>

                {isSearchName ? (
                    <Input
                        style={{ width: '200px' }}
                        value={queryValue}
                        onChange={e => {
                            let queryValue = e.target.value;
                            this.setState(() => ({ queryValue }));
                        }}
                        placeholder={`请${isSearchName ? '输入' : '选择'}${searchTitle}查询`}
                    />
                ) : (
                        nodeType === 'line' ?
                            <SearchInput
                                style={{ width: '350px' }}
                                placeholder={`请选择${searchTitle}名称`}
                                method='get'
                                queryName='lineName'
                                value={initSearchData}
                                // attachParams={{ systemId, nodeType: searchNodeType }}
                                dataUrl={`${ContextPath}/cmdb/getLineIdByName`}
                                forceOuterData={true}
                                onChange={this.handleSelect}
                            />
                            :
                            <SearchInput
                                style={{ width: '200px' }}
                                placeholder={`请选择${searchTitle}名称`}
                                method='get'
                                value={initSearchData}
                                attachParams={{ systemId, nodeType: searchNodeType }}
                                dataUrl={`${ContextPath}/cmdbCommon/getSelectList`}
                                forceOuterData={true}
                                onChange={this.handleSelect}
                            />
                    )
                }

                {
                    isShowOtherQueryBtn ? (
                        <Button
                            onClick={() => {
                                this.setState(() => ({ isShowOtherQuery: !isShowOtherQuery }))
                            }}
                            title={isShowOtherQuery ? '收起查询条件' : '展开更多查询条件'}
                        >
                            {isShowOtherQuery ? (<Icon type="down" />) : (<Icon type="up" />)}
                        </Button>
                    ) : null
                }


                <Button  type='primary'
                    loading={buttonLoading}
                >查询</Button>
                <Button onClick={this.handleReset} type='primary' >重置</Button>

                {
                    !isLeader || isAdmin ? (
                        <Fragment>
                            <Button onClick={this.handleCreate} type='primary' className='button-success' >新增</Button>
                            <Button onClick={showDeleteConfirm.bind(this, { moduleKey: delTipsKey })} type='danger' >批量删除</Button>
                            {
                                nodeType === 'line' ?
                                    null
                                    :
                                    <Fragment>
                                        <Button onClick={this.downloadTemplate.bind(this)} >模板下载</Button>
                                        <Upload {...uploadProps}><Button>批量上传</Button></Upload>
                                    </Fragment>
                            }
                            {
                                nodeType === 'program' ?
                                    (
                                        <Fragment>
                                            <Dropdown overlay={templateMenu} trigger={['click']}><Button>下载联动属性模板</Button></Dropdown>
                                            <Upload {...uploadPropertys}><Button>导入联动属性模板</Button></Upload>
                                        </Fragment>
                                    ) : null
                            }
                        </Fragment>
                    ) : null
                }

                {
                    isLeader || isAdmin ? (
                        <Button onClick={this.downloadImportExcel.bind(this)}>导出Excel</Button>
                    ) : null
                }


            </Col>

            {isShowOtherQueryBtn && isShowOtherQuery ? (
                <Col>
                    <Alert style={{ marginBottom: '8px' }} message={<SelfDefineSearch wrappedComponentRef={this.saveFormComponent} queryList={queryList} />} />
                </Col>
            ) : null}

        </Row>);
    }
}
const mapStateToProps = (state) => {
    const { buttonLoading, pagination } = state.modelConfig;
    return { buttonLoading, pagination };
}

export default connect(mapStateToProps)(OperationModule);