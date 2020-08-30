import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { Row, Col, Button, Input, message, Modal, Upload, Select } from 'antd';
import {
    getResourcePoolList,
    updateResourcePoolListPagination,
} from '../../actions/resource/action';
import Standardtable from '../../components/standardtable';
import ApplicationTitle from '../common/applicationTitle';
import RelationModule from './relationModule';
import { ENVIRONMENT_LIST } from '../common/commonData';
import { ContextPath } from '../../constants';
import styles from './index.module.less';
const { confirm } = Modal, Option = Select.Option;

class ResourcePool extends Component {
    constructor(props) {
        super(props);
        this.state = {
            systemId: '',
            // 查询用到的字段
            ip: '',
            ipValue: '',
            useStatus: '3001',
            useStatusValue: '3001',
            relationVisable: false,
            relationData: null,
            selectRows: [],
        };

        this.columns = [
            { title: '编号', dataIndex: 'serialNumber', width: '10%' },
            {
                title: 'IP', dataIndex: 'outip', width: '20%', render: (value = '') => {
                    let arr = value.split(';') || [];
                    return _.map(arr, (item, index) => {
                        return <span key={index} style={{ display: 'block' }} >{item}</span>;
                    });
                }
            },
            { title: '待关联可执行模块', dataIndex: 'dependProgram', render: (value = '无') => value },
            {
                title: '操作', dataIndex: 'operation', width: '10%', render: (value, record) => {
                    return (<a onClick={this.handleRelationModule.bind(this, record)}>关联模块</a>);
                }
            },
        ]
    }

    updateSystemId = (systemInfo) => {
        this.setState(() => ({ systemId: systemInfo.systemId }), () => {
            this.getResourcePoolList();
        });
    }

    // 获取数据
    getResourcePoolList = (_params = {}) => {
        const { dispatch, pagination } = this.props;
        const { ip, useStatus, systemId } = this.state;
        const { pageIndex, limit } = pagination;
        let params = {
            sysId: systemId, ip, useStatus,
            pageIndex, limit, start: pageIndex * limit,
            ..._params
        };
        dispatch(getResourcePoolList(params));
    }

    // 查询属性
    handleSearch = () => {
        const { ipValue, useStatusValue } = this.state;
        const { pagination } = this.props;
        let params = {
            ip: ipValue,
            useStatus: useStatusValue,
            limit: pagination.limit, pageIndex: 0, start: 0
        }
        this.setState(() => ({ ip: ipValue, useStatus: useStatusValue }))
        this.getResourcePoolList(params);
    }

    // 翻页
    handlePaginationChange = (pagination) => {
        const { dispatch } = this.props;
        if (!_.isEmpty(pagination)) {
            const { current, pageSize, total } = pagination;
            dispatch(updateResourcePoolListPagination({ limit: pageSize, pageIndex: current - 1 }))
            this.setState(() => ({ selectRows: [] }));
        }
    }
    // 表格多选
    handleRowChange = (selectRows) => {
        this.setState(() => ({ selectRows }));
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
                this.getResourcePoolList({ limit: pagination.limit, pageIndex: 0, start: 0 });
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
        // let params = encodeURI(`systemId=${systemId}`);
        window.open(`${ContextPath}/cmdbResource/downloadTemplate`);
    };
    // 关联
    handleRelationModule = (relationData, evt) => {
        evt.stopPropagation();
        this.setState(() => ({ relationData, relationVisable: true }))
    }
    // 关闭弹窗
    hideRelationModule = (isRefresh = false) => {
        const { pagination } = this.props;
        this.setState(() => ({ relationVisable: false, relationData: null }));
        if (isRefresh) {
            this.getResourcePoolList({ limit: pagination.limit, pageIndex: 0, start: 0 });
        }
    }

    render() {

        const {
            rows, results, buttonLoading, tableLoading, pagination
        } = this.props;

        const {
            systemId,
            ipValue, useStatusValue,
            relationData, relationVisable,
        } = this.state;

        const uploadProps = {
            name: 'file',
            action: `${ContextPath}/cmdbResource/importResource`,
            data: { sysId: systemId },
            showUploadList: false,
            beforeUpload: this.beforeUpload.bind(this),
            onChange: this.handleUploadChange.bind(this),
        };
        let scrollY = window.document.body.offsetHeight - 242;

        return (
            <div className={styles.block_body}>

                <ApplicationTitle
                    firstBreadcrumb='配置中心'
                    secondBreadcrumb='空闲资源池'
                    getSelectSystem={this.updateSystemId}
                />

                <Row>
                    <Col className={styles.searchInput} >
                        <span className={styles.searchName} >IP：</span>
                        <Input
                            style={{ width: '200px' }}
                            value={ipValue}
                            onChange={e => {
                                let ipValue = e.target.value;
                                this.setState(() => ({ ipValue }));
                            }}
                            placeholder='请输入IP查询'
                        />
                        <span className={styles.searchName} >状态：</span>
                        <Select
                            value={useStatusValue}
                            style={{ width: '180px', float: 'left', marginRight: '16px' }}
                            onSelect={useStatusValue => {
                                this.setState(() => ({ useStatusValue }));
                            }}
                        >
                            {_.map(ENVIRONMENT_LIST, item => (<Option key={item.value}>{item.text}</Option>))}
                        </Select>
                        <Button loading={buttonLoading} onClick={this.handleSearch} type='primary' >查询</Button>
                        {/* <Button onClick={this.downloadTemplate.bind(this)} >模板下载</Button>
                        <Upload {...uploadProps}><Button>批量上传</Button></Upload> */}
                    </Col>
                </Row>

                <Standardtable
                    style={{ borderTop: '#eee solid 1px' }}
                    rowKey='sequenceid'
                    loading={tableLoading}
                    columns={this.columns}
                    size='middle'
                    scroll={{ y: scrollY > 460 ? false : scrollY }}
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
                                systemId={systemId}
                                relationData={relationData}
                                hideModal={this.hideRelationModule}
                            />
                        ) : null
                }

            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const { rows, results, buttonLoading, tableLoading, pagination } = state.resource;
    return { rows, results, buttonLoading, tableLoading, pagination };
}

export default connect(mapStateToProps)(ResourcePool);