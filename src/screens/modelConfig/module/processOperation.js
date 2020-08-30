import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { Row, Col, Upload, Input, Button, Icon, Alert, Form } from 'antd';
import { ContextPath } from '../../../constants';
import { SearchInput } from '../../../components/searchinput/searchinput';
import SelfDefineSearch from './selfDefineSearch';
import { getSelfDefiningList } from '../../../actions/selfDefining/action';
import { PlainSelector } from '../../../components/selector/selector';

const FormItem = Form.Item,
    isMonitorData = [{ text: '是', value: '01' }, { text: '否', value: '02' }];

class ProcessOperation extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isShowOtherQuery: false,
            isShowOtherQueryBtn: false,
            queryList: [], // 自定义属性列表
        };
    }

    handleSearch = (e) => {
        e.preventDefault();
        const { updateQueryValue, form: { getFieldsValue } } = this.props;
        const { isShowOtherQuery } = this.state;
        let selfDefineQuery = [], propertyValue = [];
        let { processName = '', programId: { value: [programId = ''] }, isMonitor: { value: [isMonitor = ''] } } = getFieldsValue();
        if (isShowOtherQuery) {
            selfDefineQuery = this.searchForm.getValue();
        }
        propertyValue = [
            { propId: 'processName', propValue: processName },
            { propId: 'programId', propValue: programId },
            { propId: 'isMonitor', propValue: isMonitor },
        ]
        let queryValue = [...propertyValue, ...selfDefineQuery];

        if (_.isFunction(updateQueryValue)) {
            updateQueryValue(queryValue);
        }
    }

    handleReset = () => {
        const { updateQueryValue, form: { setFieldsValue } } = this.props;

        setFieldsValue({
            programId: { data: [], value: [] },
            isMonitor: { data: isMonitorData, value: [] },
            processName: undefined,
        })
        this.setState(
            () => ({
                isShowOtherQuery: false,
            }),
            () => {
                if (_.isFunction(updateQueryValue)) {
                    updateQueryValue([]);
                }
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
        let { processName = '', programId: { value: [programId = ''] }, isMonitor: { value: [isMonitor = ''] } } = getFieldsValue();
        if (isShowOtherQuery) {
            selfDefineQuery = this.searchForm.getValue();
        }
        propertyValue = [
            { propId: 'processName', propValue: processName },
            { propId: 'programId', propValue: programId },
            { propId: 'isMonitor', propValue: isMonitor },
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

        const { isShowOtherQuery, isShowOtherQueryBtn, queryList, } = this.state;
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
                        <FormItem label='进程名称' >
                            {getFieldDecorator('processName', {
                                // initialValue: ''
                            })
                                (
                                    <Input
                                        style={{ width: '200px' }}
                                        autoComplete='off'
                                        placeholder='请输入进程名称'
                                    />
                                )
                            }
                        </FormItem>
                        <FormItem label='所属模块'>
                            {
                                getFieldDecorator('programId', {
                                    initialValue: { data: [], value: [] }
                                })
                                    (
                                        <SearchInput
                                            style={{ width: '180px' }}
                                            placeholder={`请选择所属模块`}
                                            method='get'
                                            attachParams={{ systemId, nodeType: 'program' }}
                                            dataUrl={`${ContextPath}/cmdbCommon/getSelectList`}
                                            forceOuterData={true}
                                        />
                                    )
                            }
                        </FormItem>
                        <FormItem label='是否监控'>
                            {
                                getFieldDecorator('isMonitor', {
                                    initialValue: { data: isMonitorData, value: [] }
                                })
                                    (
                                        <PlainSelector
                                            style={{ width: '180px' }}
                                            allowClear={true}
                                            method='get'
                                            forceOuterData={true}
                                        />
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

ProcessOperation = Form.create()(ProcessOperation);

export default connect(mapStateToProps)(ProcessOperation);