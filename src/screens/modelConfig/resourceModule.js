import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Row, Col, Button, Input, message, Divider, Modal, Upload, Form, Descriptions, Icon, Alert } from 'antd';
import {
    queryResourceInfo, getAssetCountInfo, deleteModels
} from '../../actions/modelConfig/action';
import { getSelfDefiningList } from '../../actions/selfDefining/action';
import { ContextPath } from '../../constants';
import Standardtable from '../../components/standardtable';
import RelationModule from './module/relationModule';
import ResourceEdit from './module/resourceEdit';
import SelfDefineSearch from './module/selfDefineSearch';
import styles from './index.module.less';
import { ENVIRONMENT_LIST, ARRANGEMENT_STATUS } from '../common/commonData';
import { PlainSelector } from '../../components/selector/selector';
import { SearchInput } from '../../components/searchinput/searchinput';
import OtherSystemRelationModule from './module/otherSystemRelationModule';

const FormItem = Form.Item;
const DescriptionsItem = Descriptions.Item;
const { confirm } = Modal;

class ResourceModule extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isShowOtherQuery: false,
            isShowOtherQueryBtn: false,
            queryList: [],

            useStatusName: '',
            relationVisable: false,
            editVisable: false,
            editData: {},

            selectRows: [],
            systemId: '',

            isShowEdit: false,
            assetCountInfo: {
                arrangedTestCount: 0,
                unArrangeTestCount: 0,
                arrangedProCount: 0,
                unArrangeProCount: 0,
                allProCount: 0,
                allTestCount: 0,
            }
        };

        const { showModuleDetails, role } = props;
        let isLeader = role === '领导';

        this.columns = [
            { title: '编号', dataIndex: 'serialNumber', width: '8%' },
            {
                title: 'IP', dataIndex: 'outip', render: (value = '') => {
                    let arr = value.split(';') || [];
                    return _.map(arr, (item, index) => {
                        return <span key={index} style={{ display: 'block' }} >{item}</span>;
                    });
                }
            },
            { title: '类别', dataIndex: 'assetTypeName', width: '8%' },
            { title: '流水号', dataIndex: 'sequenceid', width: '10%' },
            { title: '操作系统', dataIndex: 'operatingSystemName', width: '10%' },
            { title: '所属机房', dataIndex: 'addressName', width: '13%' },
            {
                title: '所属模块', dataIndex: 'programName', width: '18%', render: (value) => {
                    if (value) {
                        let arr = value.split('|') || [];
                        return _.map(arr, (item, index) => {
                            let [moduleName, gangwei] = item.split(',');
                            return <span key={index} style={{ display: 'block' }} >{`${moduleName}(${gangwei})`}</span>;
                        });
                    } else {
                        return '空闲待部署'
                    }

                }
            },
            {
                title: '操作', dataIndex: 'operation', width: '15%', render: (value, record) => {
                    const { isShowEdit } = this.state;
                    const { nodeId } = record;
                    return (<Fragment>
                        {/* <a onClick={showModuleDetails.bind(this, record)} style={{ color: 'green' }} >详情</a>
                        <Divider type="vertical" /> */}
                        {isShowEdit ? (
                            <Fragment>
                                <a disabled={!nodeId} onClick={this.handleEdit.bind(this, record)}>自定义属性</a>
                                <Divider type="vertical" />
                            </Fragment>
                        ) : null}
                        <a onClick={this.handleRelation.bind(this, record)}>关联模块</a>
                    </Fragment>);
                }
            },
        ];

        if (isLeader) {
            this.columns = this.columns.filter(item => item.dataIndex !== 'operation');
        }
    }

    // 取主机的自定义属性列表，判断当前系统下的主机是否有自定义属性
    // 有自定义属性，则展示编辑按钮
    getSelfDefinings = () => {
        const { dispatch, nodeType, systemId } = this.props;
        let params = { systemId, nodeType, pageIndex: 0, limit: 100, start: 0 };
        dispatch(getSelfDefiningList(params, (res = {}) => {
            let queryList = res.rows || [];
            let queryListFilter = queryList.filter(item => item.isSearchKey === '1');
            this.setState(() => ({
                queryList: queryListFilter,
                isShowOtherQueryBtn: !_.isEmpty(queryListFilter),
                isShowEdit: !_.isEmpty(queryList)
            }));
        }));
    }

    // 获取主机信息
    getResourceInfo = (_params) => {
        const { dispatch, pagination, systemId, form: { getFieldsValue } } = this.props;
        const { pageIndex, limit } = pagination;
        let { ip, useStatusName, arrangementStatus, addressName = '', programId: { value: [programId = ''] } } = getFieldsValue();
        let { data, value: [useStatus] } = useStatusName;
        let propertyValueDtoList = [];
        ip = ip.trim();
        addressName = addressName.trim();
        useStatusName = data.find(item => item.value === useStatus).text;
        arrangementStatus = arrangementStatus.value[0];


        if (ip) {
            propertyValueDtoList.push({ propId: 'ip', propValue: ip })
        }
        if (addressName) {
            propertyValueDtoList.push({ propId: 'addressName', propValue: addressName })
        }
        propertyValueDtoList.push({ propId: 'useStatusName', propValue: useStatusName })

        if (this.state.isShowOtherQuery && arrangementStatus === 1) {
            let arr = this.searchForm.getValue()
            propertyValueDtoList = [...propertyValueDtoList, ...arr];
        }

        let params = {
            propertyValueDtoList,
            ip, useStatusName,
            addressName, programId,
            arrangementStatus,
            sysId: systemId,
            pageIndex, limit, start: pageIndex * limit,
            ..._params
        };
        dispatch(queryResourceInfo(params));

        this.setState(() => ({ useStatusName, arrangementStatus, selectRows: [] }));
    }

    getAssetCountInfo = () => {
        const { dispatch, systemId } = this.props;
        dispatch(getAssetCountInfo({ systemId }, (res = { data: {} }) => {
            this.setState(() => ({ assetCountInfo: res.data }))
            // console.log(res.data)
        }));
    }

    // 查询属性
    handleSearch = (e) => {
        e.preventDefault();
        const { pagination } = this.props;
        this.getResourceInfo({ limit: pagination.limit, pageIndex: 0, start: 0 });
        this.getAssetCountInfo();
    }
    // 翻页
    handlePaginationChange = (pagination) => {
        if (!_.isEmpty(pagination)) {
            const { current, pageSize, total } = pagination;
            this.getResourceInfo({ limit: pageSize, pageIndex: current - 1, start: pageSize * (current - 1) });
            this.setState(() => ({ selectRows: [] }));
        }
    }
    // 表格多选
    handleRowChange = (selectRows) => {
        this.setState(() => ({ selectRows }));
    }
    // 导出 excle
    downloadImportExcel = () => {
        const { systemId, form: { getFieldsValue } } = this.props;
        let { ip, useStatusName, arrangementStatus, addressName = '', programId: { value: [programId = ''] } } = getFieldsValue();
        let { data, value: [useStatus] } = useStatusName;
        let propertyValueList = [];
        ip = ip.trim();
        addressName = addressName.trim();
        useStatusName = data.find(item => item.value === useStatus).text;
        arrangementStatus = arrangementStatus.value[0];


        if (ip) {
            propertyValueList.push({ propId: 'ip', propValue: ip })
        }
        if (addressName) {
            propertyValueList.push({ propId: 'addressName', propValue: addressName })
        }
        propertyValueList.push({ propId: 'useStatusName', propValue: useStatusName })

        if (this.state.isShowOtherQuery && arrangementStatus === 1) {
            let arr = this.searchForm.getValue()
            propertyValueList = [...propertyValueList, ...arr];
        }
        propertyValueList = JSON.stringify(propertyValueList);

        let params = encodeURI(`programId=${programId}&addressName=${addressName}&propertyValueList=${propertyValueList}&systemId=${systemId}&ip=${ip}&useStatusName=${useStatusName}&arrangementStatus=${arrangementStatus}&pageIndex=0&limit=0&start=0`);
        window.open(`${ContextPath}/cmdbResource/downloadResourceExcel?${params}`);
    }

    // 关联
    handleRelation = (editData, evt) => {
        evt.stopPropagation();
        this.setState(() => ({ relationVisable: true, editData }));
    }
    handleRelationHide = (isRefresh) => {
        this.setState(() => ({ relationVisable: false, editData: {} }));
        if (isRefresh) {
            this.getResourceInfo();
            this.getAssetCountInfo();
        }
    }

    // 编辑属性
    handleEdit = (editData, evt) => {
        evt.stopPropagation();
        this.setState(() => ({ editVisable: true, editData }));
    }
    handleEditHide = () => {
        this.setState(() => ({ editVisable: false, editData: {} }));
    }

    // 上传事件
    handleUploadChange = (info) => {
        const { pagination } = this.props;
        let fileList = info.fileList;
        // 控制大小在20M以内
        fileList = _.filter(fileList, function (file) {
            return file.size === undefined || _.divide(file.size, 1024 * 1024) <= 20;
        });
        if (info.file.status === 'done') {
            if (info.file.response && !info.file.response.hasError && info.file.uid) {
                message.success(`${info.file.name} 上传成功！`);
                // 这个区数据
                this.getResourceInfo({ limit: pagination.limit, pageIndex: 0, start: 0 });
                this.getAssetCountInfo();
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
    // 下载模板
    downloadTemplate = () => {
        let { systemId } = this.state;
        let params = encodeURI(`systemId=${systemId}`);
        window.open(`${ContextPath}/cmdbResource/downloadTemplate?${params}`);
    };

    componentDidMount() {
        const { pagination: { limit } } = this.props;
        this.getResourceInfo({ limit, pageIndex: 0 });
        this.getSelfDefinings();
        this.getAssetCountInfo();
    }

    componentDidUpdate() {
        const { systemId: _props, form: { setFieldsValue }, pagination: { limit } } = this.props;
        const { systemId: _state } = this.state;
        if (_props && _props !== _state) {
            setFieldsValue({
                ip: '',
                useStatusName: {
                    data: ENVIRONMENT_LIST,
                    value: ['3001'],
                },
                arrangementStatus: {
                    data: ARRANGEMENT_STATUS,
                    value: [1],
                },
                addressName: undefined,
                programId: { data: [], value: [] },
            });
            this.setState(() => ({ systemId: _props }));
            setTimeout(() => {
                this.getResourceInfo({ limit, pageIndex: 0 });
                this.getSelfDefinings();
                this.getAssetCountInfo();
            }, 100);
        }
    }

    handleReset = () => {
        const { form: { setFieldsValue }, pagination: { limit } } = this.props;
        setFieldsValue({
            ip: '',
            useStatusName: {
                data: ENVIRONMENT_LIST,
                value: ['3001'],
            },
            arrangementStatus: {
                data: ARRANGEMENT_STATUS,
                value: [1],
            },
            addressName: undefined,
            programId: { data: [], value: [] },
        });
        if (this.state.isShowOtherQuery) {
            this.searchForm.resetValue();
        }
        this.setState(() => ({ isShowOtherQuery: false }));
        setTimeout(() => {
            this.getResourceInfo({ limit, pageIndex: 0, });
            this.getAssetCountInfo();
        }, 100);
    }

    saveFormComponent = ref => {
        this.searchForm = ref;
    }

    // 删除提醒
    showDeleteConfirm = evt => {
        evt.stopPropagation();
        const { selectRows } = this.state;
        let descriptions = '';
        if (_.isEmpty(selectRows)) {
            message.warning(`请选择要取消关联的主机!`)
            return
        }
        let [first, second] = selectRows.map(item => item.outip);
        if (second) {
            descriptions = `你确认取消关联 ${first}、${second}... 这些主机？`;
        } else {
            descriptions = `你确认取消关联 ${first} 这台主机？`;
        }


        confirm({
            title: '取消关联提醒',
            content: descriptions,
            okText: '确认',
            okType: 'primary',
            cancelText: '取消',
            onOk: () => {
                console.log(1111)
                this.deleteResource(selectRows);
            },
        });

    }

    deleteResource = (selectRows) => {
        const { dispatch, nodeType } = this.props;
        let nodeIds = selectRows.map(item => item.nodeId);
        dispatch(deleteModels({ nodeIds, configItemType: nodeType }, result => {
            this.setState(() => ({ loading: false }));
            message.success('取消关联成功');
            this.getResourceInfo({ limit: 50, pageIndex: 0 });
        }, (error = '取消关联失败') => {
            this.setState(() => ({ loading: false }));
            message.error(error);
        }));
    }

    render() {

        const {
            form: { getFieldDecorator, getFieldValue },
            nodeType, role,
            rows, results, buttonLoading, tableLoading, pagination,
        } = this.props;

        const {
            systemId,
            useStatusName, arrangementStatus,
            assetCountInfo,
            editData, editVisable, relationVisable,
            isShowOtherQuery, isShowOtherQueryBtn, queryList,
        } = this.state;

        const uploadProps = {
            name: 'file',
            action: `${ContextPath}/cmdbResource/importResource`,
            data: { sysId: systemId },
            showUploadList: false,
            beforeUpload: this.beforeUpload.bind(this),
            onChange: this.handleUploadChange.bind(this),
        };

        const {
            arrangedTestCount,
            unArrangeTestCount,
            arrangedProCount,
            unArrangeProCount,
            allProCount,
            allTestCount,
        } = assetCountInfo;

        let isLeader = role === '领导', isAdmin = role === '管理员';
        let scrollY = window.document.body.offsetHeight - 270;

        let arrangementStatusValue = getFieldValue('arrangementStatus');
        if (arrangementStatusValue) {
            arrangementStatusValue = arrangementStatusValue.value[0]
        }

        return (
            <Fragment>

                <Row className={styles.customDescriptionsOther}>
                    <Col span={3}><span>生产环境全部:</span><em>{allProCount}</em></Col>
                    <Col span={3}><span>生产环境已部署:</span><em className={styles.green}>{arrangedProCount}</em></Col>
                    <Col span={3}><span>生产环境未部署:</span><em className={styles.red}>{unArrangeProCount}</em></Col>
                    <Col span={3}><span>测试环境全部:</span><em>{allTestCount}</em></Col>
                    <Col span={3}><span>测试环境已部署:</span><em className={styles.green}>{arrangedTestCount}</em></Col>
                    <Col span={3}><span>测试环境未部署:</span><em className={styles.red}>{unArrangeTestCount}</em></Col>
                </Row>


                <Form layout="inline" onSubmit={this.handleSearch} >
                    <FormItem label='IP'>
                        {getFieldDecorator('ip', {
                            initialValue: ''
                        })
                            (<Input autoComplete='off' />)
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

                    <FormItem label='所属机房'>
                        {
                            getFieldDecorator('addressName', {
                                // initialValue: ''
                            })
                                (
                                    <Input
                                        style={{ width: '180px' }}
                                        placeholder={`请输入所属机房`}
                                        autoComplete='off'
                                    />
                                )
                        }
                    </FormItem>

                    <FormItem label="主机状态">
                        {getFieldDecorator('useStatusName', {
                            initialValue: {
                                data: ENVIRONMENT_LIST,
                                value: ['3001'],
                            }
                        })
                            (
                                <PlainSelector
                                    allowClear={false}
                                    style={{ width: '100px' }}
                                    // placeholder='请选择主机状态'
                                    forceOuterData={true}
                                />
                            )
                        }
                    </FormItem>

                    <FormItem label="部署状态">
                        {getFieldDecorator('arrangementStatus', {
                            initialValue: {
                                data: ARRANGEMENT_STATUS,
                                value: [1],
                            }
                        })
                            (
                                <PlainSelector
                                    allowClear={false}
                                    style={{ width: '100px' }}
                                    // placeholder='请选择部署状态'
                                    forceOuterData={true}
                                />
                            )
                        }
                    </FormItem>

                    {
                        isShowOtherQueryBtn && arrangementStatusValue === 1 ? (
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
                        <Button
                            loading={buttonLoading}
                            type='primary'
                            htmlType='submit'
                        >查询</Button>
                    </FormItem>
                    <FormItem>
                        <Button onClick={this.handleReset} type='primary' >重置</Button>
                    </FormItem>

                    {isLeader ? null : (
                        <FormItem>
                            <OtherSystemRelationModule
                                systemId={systemId}
                                nodeType={nodeType}
                                getResourceInfo={this.getResourceInfo}
                            />
                        </FormItem>
                    )}

                    {
                        !isLeader || isAdmin ? (
                            <Fragment>
                                {arrangementStatusValue === 1 ? (
                                    <FormItem>
                                        <Button onClick={this.showDeleteConfirm} type='danger' >批量取消关联</Button>
                                    </FormItem>
                                ) : null}
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

                {isShowOtherQueryBtn && isShowOtherQuery && arrangementStatusValue === 1 ? (
                    <Col>
                        <Alert style={{ marginBottom: '8px' }} message={<SelfDefineSearch handleSearch={this.handleSearch} wrappedComponentRef={this.saveFormComponent} queryList={queryList} />} />
                    </Col>
                ) : null}



                <Standardtable
                    style={{ borderTop: '#eee solid 1px' }}
                    rowKey='sequenceid'
                    loading={tableLoading}
                    columns={this.columns}
                    size='middle'
                    scroll={{ y: scrollY >= 460 ? false : scrollY }}
                    data={{
                        list: rows,
                        pagination: {
                            current: pagination.pageIndex + 1,
                            pageSize: pagination.limit,
                            total: results
                        }
                    }}
                    rowSelection={{ selectedRowKeys: [], type: 'checkbox' }}
                    onSelectRow={this.handleRowChange.bind(this)}
                    onChange={this.handlePaginationChange.bind(this)}
                />

                {
                    relationVisable ?
                        (
                            <RelationModule
                                useStatusName={useStatusName}
                                arrangementStatus={arrangementStatus}
                                editData={editData}
                                systemId={systemId}
                                nodeType={nodeType}
                                hideModal={this.handleRelationHide}
                            />
                        ) : null
                }

                {editVisable ?
                    (
                        <ResourceEdit
                            editData={editData}
                            systemId={systemId}
                            nodeType={nodeType}
                            hideModal={this.handleEditHide}
                        />
                    ) : null
                }

            </Fragment>
        );
    }
}

const mapStateToProps = (state) => {
    const { rows, results, buttonLoading, tableLoading, pagination } = state.modelConfig.resource;
    return {
        rows,
        results,
        buttonLoading,
        tableLoading,
        pagination
    }
}

ResourceModule = Form.create()(ResourceModule)

export default connect(mapStateToProps)(ResourceModule);