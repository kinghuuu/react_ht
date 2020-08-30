import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { Row, Col, Upload, Input, Button, Icon, Alert, Form, TreeSelect } from 'antd';
import { ContextPath } from '../../../constants';
import { SearchInput } from '../../../components/searchinput/searchinput';
import SelfDefineSearch from './selfDefineSearch';
import { getSelfDefiningList } from '../../../actions/selfDefining/action';
import { getTreeList } from '../../../actions/modelConfig/action';

const FormItem = Form.Item;

class ProgramConsumeOperation extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isShowOtherQuery: false,
            isShowOtherQueryBtn: false,
            queryList: [], // 自定义属性列表
            treeData: [],
        };
    }

    getTreeList = (parentId = '-1') => {
        const { dispatch, systemId } = this.props;
        const { treeData } = this.state;
        let treeDataCopy = _.cloneDeep(treeData);
        dispatch(getTreeList({ parentId, nodeType: 'business', systemId }, (res = { rows: [] }) => {
            let newTreeData = res.rows;
            if (parentId !== '-1') {
                this.findItems(treeDataCopy, newTreeData, parentId);
                newTreeData = treeDataCopy;
            }
            this.setState(() => ({ treeData: newTreeData }));
        }));
    }

    handleSearch = (e) => {
        e.preventDefault();
        const { updateQueryValue, form: { getFieldsValue } } = this.props;
        const { isShowOtherQuery } = this.state;
        let selfDefineQuery = [], propertyValue = [];
        let { providerProgramId: { value: [providerProgramId = ''] }, businessId = {} } = getFieldsValue();

        if (isShowOtherQuery) {
            selfDefineQuery = this.searchForm.getValue();
        }
        propertyValue = [
            { propId: 'providerProgramId', propValue: providerProgramId },
            { propId: 'businessId', propValue: businessId.value || '' },
        ]
        let queryValue = [...propertyValue, ...selfDefineQuery];

        if (_.isFunction(updateQueryValue)) {
            updateQueryValue(queryValue);
        }
    }

    handleReset = () => {
        const { updateQueryValue, form: { setFieldsValue } } = this.props;

        setFieldsValue({
            businessId: {},
            providerProgramId: { data: [], value: [] },
        })
        this.setState(
            () => ({
                isShowOtherQuery: false,
            }),
            () => {
                updateQueryValue([]);
            }
        );
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
        const { nodeType, systemInfo, form: { getFieldsValue } } = this.props;
        const { isShowOtherQuery } = this.state;
        const systemId = systemInfo.systemId;
        let selfDefineQuery = [], propertyValue = [];
        let { providerProgramId: { value: [providerProgramId = ''] }, businessId = {} } = getFieldsValue();
        if (isShowOtherQuery) {
            selfDefineQuery = this.searchForm.getValue();
        }
        propertyValue = [
            { propId: 'providerProgramId', propValue: providerProgramId },
            { propId: 'businessId', propValue: businessId.value || '' },
        ]
        let propertyValueList = [...propertyValue, ...selfDefineQuery];

        let params = encodeURI(`configItemType=${nodeType}&systemId=${systemId}&propertyValueList=${JSON.stringify(propertyValueList)}`);
        window.open(`${ContextPath}/cmdbCommon/downloadData?${params}`);

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

    componentDidMount() {
        this.getTreeList()
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

    findItems = (treeList, rows, parentId) => {
        treeList.forEach(item => {
            const { key, children } = item;
            let isSome = Number.parseInt(key) === Number.parseInt(parentId);
            if (isSome) {
                item.children = rows;
            } else {
                if (_.isArray(children)) {
                    this.findItems(children, rows, parentId);
                }
            }
            return isSome;
        });
    };

    handleTreeExpand = (_expandedKeys) => {
        const { expandedKeys = [] } = this.state;
        if (_expandedKeys.length > expandedKeys.length) {
            let parentId = _expandedKeys[_expandedKeys.length - 1];
            this.getTreeList(parentId);
        }
        this.setState(() => ({ expandedKeys: _expandedKeys }));
    }


    render() {

        const { isShowOtherQuery, isShowOtherQueryBtn, queryList, treeData } = this.state;
        const {
            form: { getFieldDecorator },
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

        let isLeader = role === '领导', isAdmin = role === '管理员';

        return (
            <Row>
                <Col>
                    <Form
                        layout='inline'
                        onSubmit={this.handleSearch}
                    >
                        <FormItem label='调用方模块名称'>
                            {getFieldDecorator('providerProgramId', {
                                initialValue: { data: [], value: [] }
                            })
                                (
                                    <SearchInput
                                        style={{ width: '180px' }}
                                        placeholder={`请选择调用方模块名称`}
                                        method='get'
                                        attachParams={{ systemId, nodeType: 'program' }}
                                        dataUrl={`${ContextPath}/cmdbCommon/getSelectList`}
                                        forceOuterData={true}
                                    />
                                )
                            }
                        </FormItem>
                        <FormItem label='所属业务'>
                            {
                                getFieldDecorator('businessId', {
                                    initialValue: {}
                                })
                                    (
                                        <TreeSelect
                                            style={{ width: '180px' }}
                                            showLine={true}
                                            allowClear={true}
                                            onTreeExpand={this.handleTreeExpand}
                                            dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                                            treeData={treeData}
                                            labelInValue={true}
                                            treeCheckable={true}
                                            multiple={false}
                                            treeCheckable={false}
                                        ></TreeSelect>
                                    )
                            }
                        </FormItem>

                        {
                            isShowOtherQueryBtn ? (
                                <FormItem>
                                    <Button
                                        onClick={() => {
                                            this.setState(() => ({ isShowOtherQuery: !isShowOtherQuery }))
                                        }}
                                        title={isShowOtherQuery ? '收起查询条件' : '展开更多查询条件'}
                                    >
                                        {isShowOtherQuery ? (<Icon type="down" />) : (<Icon type="up" />)}
                                    </Button>
                                </FormItem>
                            ) : null
                        }

                        <FormItem>
                            <Button type='primary' htmlType='submit' loading={buttonLoading} >查询</Button>
                        </FormItem>
                        <FormItem>
                            <Button onClick={this.handleReset} type='primary' >重置</Button>
                        </FormItem>

                        {
                            !isLeader || isAdmin ? (
                                <Fragment>
                                    <FormItem>
                                        <Button onClick={this.handleCreate} type='primary' className='button-success' >新增</Button>
                                    </FormItem>
                                    <FormItem>
                                        <Button onClick={showDeleteConfirm.bind(this, { moduleKey: 'processName' })} type='danger' >批量删除</Button>
                                    </FormItem>
                                    <FormItem>
                                        <Button onClick={this.downloadTemplate.bind(this)} >模板下载</Button>
                                    </FormItem>
                                    <FormItem>
                                        <Upload {...uploadProps}><Button>批量上传</Button></Upload>
                                    </FormItem>
                                </Fragment>
                            ) : null
                        }


                        <FormItem>
                            <Button onClick={this.downloadImportExcel.bind(this)}>导出Excel</Button>
                        </FormItem>


                    </Form>
                </Col>

                {isShowOtherQueryBtn && isShowOtherQuery ? (
                    <Col>
                        <Alert style={{ marginBottom: '8px' }} message={<SelfDefineSearch handleSearch={this.handleSearch} wrappedComponentRef={this.saveFormComponent} queryList={queryList} />} />
                    </Col>
                ) : null}

            </Row>
        )
    }
}
const mapStateToProps = (state) => {
    const { buttonLoading, pagination } = state.modelConfig;
    return { buttonLoading, pagination };
}

ProgramConsumeOperation = Form.create()(ProgramConsumeOperation);
export default connect(mapStateToProps)(ProgramConsumeOperation);