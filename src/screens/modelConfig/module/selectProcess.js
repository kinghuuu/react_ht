import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { Row, Col, Upload, Input, Button, Icon, Alert, Form, Modal, message } from 'antd';
import { ContextPath } from '../../../constants';
import { getProcessInfoByProgramId } from '../../../actions/modelConfig/action';

import Standardtable from '../../../components/standardtable'
const columns = [
    { title: 'ip', dataIndex: 'ip', width: '15%' },
    { title: '进程名称', dataIndex: 'processName', width: '15%' },
    { title: '进程参数', dataIndex: 'processParams' },
    { title: '进程路径', dataIndex: 'processPath', width: '15%' },
    { title: '进程用户名', dataIndex: 'processUser', width: '15%' },
]


class SelectProcess extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isShowModal: false,
            loading: false,
            rows: [], // 自定义属性列表
            results: 0,
            pagination: {
                limit: 10, pageIndex: 0
            },
            selectedRowKeys: [],
        };
    }

    handleCancel = () => {
        this.setState(() => ({ isShowModal: false }));
    }

    handleOk = () => {
        const { updateProcess } = this.props;
        const { selectedRowKeys } = this.state;
        if (_.isEmpty(selectedRowKeys)) {
            message.warning('请选择要添加的进程!')
            return
        }
        if (_.isFunction(updateProcess)) {
            updateProcess(selectedRowKeys[0]);
            this.setState(() => ({ isShowModal: false }));
        }
    }

    handleSearch = () => {

    }

    handleShowModal = () => {
        const { programId } = this.props;

        if (!programId) {
            message.warning('请先选择所属模块！')
            return
        }

        this.setState(() => ({ isShowModal: true }));
        this.getList();
    }

    getList = (_params = {}) => {
        const { dispatch, programId = '' } = this.props;
        const { pagination: { limit, pageIndex } } = this.state;
        let params = {
            limit, pageIndex, start: limit * pageIndex, programId,
        };
        params = { ...params, ..._params };
        this.setState(() => ({ loading: true }));
        dispatch(getProcessInfoByProgramId(
            params,
            (result = {}) => {
                const { rows = [], results = 0 } = result;
                this.setState(() => ({
                    rows, results, loading: false,
                    pagination: {
                        limit: params.limit,
                        pageIndex: params.pageIndex
                    }
                }));
            },
            error => {
                message.error(error)
                this.setState(() => ({ loading: false }));
            }
        ))
    }

    handlePaginationChange = (pagination) => {
        if (!_.isEmpty(pagination)) {
            const { current, pageSize, total } = pagination;
            this.getList({
                limit: pageSize, pageIndex: current - 1, start: pageSize * (current - 1)
            });
            this.setState(() => ({ selectedRowKeys: [] }))
        }
    }

    handleRowChange = (selectedRowKeys) => {
        this.setState(() => ({ selectedRowKeys }))
    }


    render() {

        const { isShowModal, loading, rows, pagination, results } = this.state;

        return (<Fragment>
            <Icon
                title='快速添加监控进程'
                type="plus-circle"
                theme='filled'
                style={{ fontSize: '24px', color: '#ff4d4f', float: 'left', margin: '8px 0 0 8px' }}
                onClick={this.handleShowModal}
            />
            {isShowModal ? (
                <Modal
                    width={800}
                    title="选择进程"
                    visible={isShowModal}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                >

                    <Standardtable
                        style={{ borderTop: '#eee solid 1px' }}
                        rowKey='id'
                        loading={loading}
                        columns={columns}
                        size='middle'
                        data={{
                            list: rows,
                            pagination: {
                                current: pagination.pageIndex + 1,
                                pageSize: pagination.limit,
                                total: results
                            }
                        }}
                        rowSelection={{ selectedRowKeys: [], type: 'radio' }}
                        onSelectRow={this.handleRowChange}
                        onChange={this.handlePaginationChange}
                    />

                </Modal>
            ) : null}
        </Fragment>
        )
    }
}

export default connect()(SelectProcess);