import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import Standardtable from '../../components/standardtable';
// import ProgramEdit from './module/programEdit'
import ApplicationTitle from '../common/applicationTitle';
import OperationModule from './operation';
import { getDataAuditProcessinglist } from '../../actions/dataAuditProcessing/action'
import styles from './index.module.less';


class DataAuditProcessing extends Component {
    constructor(props) {
        super(props);
        this.state = {
            systemId: '',
        };

        this.columns = [
            { title: '编号', dataIndex: 'serialNumber', width: '8%' },
            {
                title: 'IP', dataIndex: 'ip', width: '15%', render: value => {
                    if (value) {
                        let values = value.split(';') || [];
                        return values.map(ip => (<div key={ip}>{ip}</div>))
                    }
                    return ''
                }
            },
            { title: '进程名称', dataIndex: 'processName', width: '15%' },
            { title: '进程参数', dataIndex: 'processParams' },
            { title: '进程路径', dataIndex: 'processPath', width: '15%' },
            { title: '进程用户', dataIndex: 'processUser', width: '15%' },
            // {
            //     title: '操作', dataIndex: 'operation', width: '15%', render: (value, record) => {
            //         return (<Fragment>
            //             <a onClick={showModuleDetails.bind(this, record)} style={{ color: 'green' }} >详情</a>
            //             {isLeader ? null : (
            //                 <Fragment>
            //                     <Divider type="vertical" />
            //                     <a onClick={this.handleUpdateSelfDefining.bind(this, record)}>编辑</a>
            //                     <Divider type="vertical" />
            //                     <a
            //                         onClick={props.showDeleteConfirm.bind(this, { record, moduleKey: 'moduleName' })}
            //                         style={{ color: 'red' }}
            //                     >删除</a>
            //                 </Fragment>
            //             )}
            //         </Fragment>);
            //     }
            // },
        ]
    }

    // 切换应用系统
    handleSystemSelect = (systemInfo = {}) => {
        const { systemId = '' } = systemInfo;
        this.setState(() => ({ systemId }), () => {
            if (this.searchForm) {
                this.searchForm.handleReset();
            }
        });
    }

    getDataList = (_params = {}) => {
        console.log(_params)
        const { dispatch, pagination: { pageIndex, limit } } = this.props;
        const { systemId } = this.state;
        let params = {
            systemId,
            limit,
            start: limit * pageIndex,
            pageIndex,
            ip: '',
            processName: '',
            processParams: '',
            processPath: '',
            processUser: '',
        }
        params = { ...params, ..._params };
        dispatch(getDataAuditProcessinglist(params))
    }

    saveFormComponent = ref => {
        this.searchForm = ref;
    }

    handlePaginationChange = (pagination) => {
        if (!_.isEmpty(pagination)) {
            const { current, pageSize, } = pagination;
            const { queryValue = {} } = this.state;
            this.getDataList({
                limit: pageSize, pageIndex: current - 1, start: pageSize * (current - 1),
                ...queryValue,
            });
        } 
    }

    updateQueryValue = (queryValue) => {
        this.setState(() => ({ queryValue }));
    }

    render() {

        const { rows, results, tableLoading, pagination, buttonLoading } = this.props;
        let scrollY = window.document.body.offsetHeight - 230;

        return (

            <div className={styles.block_body}>

                <ApplicationTitle
                    firstBreadcrumb='配置中心'
                    secondBreadcrumb='数据稽核处理'
                    getSelectSystem={this.handleSystemSelect}
                />

                <OperationModule
                    wrappedComponentRef={this.saveFormComponent}
                    getDataList={this.getDataList}
                    pagination={pagination}
                    buttonLoading={buttonLoading}
                    updateQueryValue={this.updateQueryValue}
                />

                <Standardtable
                    style={{ borderTop: '#eee solid 1px' }}
                    rowKey='id'
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
                    // rowSelection={{ selectedRowKeys: [], type: 'checkbox' }}
                    // onSelectRow={handleRowChange}
                    onChange={this.handlePaginationChange}
                />



            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const { rows, results, tableLoading, buttonLoading, pagination } = state.dataAuditProcessing;
    return { rows, results, tableLoading, buttonLoading, pagination };
}

export default connect(mapStateToProps)(DataAuditProcessing);