import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import _ from 'lodash';
import { Form, Input, Button, Modal } from 'antd'
import { ContextPath } from '../../constants'
import Standardtable from '../../components/standardtable'
import { SearchInput } from '../../components/searchinput/searchinput'
import {
    queryMaintenanceContractInfo
} from '../../actions/contract/action'

const FormItem = Form.Item;
class MantenanceContract extends Component {
    constructor(props) {
        super(props);
        this.state = {
            queryValue: '',
            initSearchData: { data: [], value: [] },
        }
        this.columns = [
            { title: '序号', dataIndex: 'serialNumber', width: '6%' },
            { title: '合同编号', dataIndex: 'ccod', width: '20%' },
            { title: '经办人', dataIndex: 'userName', width: '10%' },
            { title: '供应商', dataIndex: 'partyName', width: '24%' },
            // { title: '合同金额', dataIndex: 'cMoney', width: '10%' },
            {
                title: '履约开始时间', dataIndex: 'expStart', width: '16%', render: (value = '') => {
                    value = value.split(' ')[0]
                    return value
                }
            },
            {
                title: '履约结束时间', dataIndex: 'endDate', width: '16%', render: (value = '') => {
                    value = value.split(' ')[0]
                    return value
                }
            },
            {
                title: '操作', dataIndex: 'operation', width: '8%', render: (value, record) => {
                    return (
                        <Fragment>
                            <Button
                                type='primary'
                                size='small'
                                className='button-success'
                                onClick={this.ccodChoose.bind(this, record)}
                            >选择</Button>
                        </Fragment>
                    );
                }
            },
        ]
    }

    componentDidMount() {
        this.queryMaintenanceContractInfo()
    }

    //查询维保合同关联信息
    queryMaintenanceContractInfo = () => {
        const { dispatch } = this.props;
        let params = {
            pageIndex: 0,
            limit: 5,
            ccod: '',
            userid: '',
            partyName: '',
        }
        dispatch(queryMaintenanceContractInfo(params))
    }

    // 翻页
    handlePaginationChange = (pagination) => {
        const { dispatch } = this.props
        if (!_.isEmpty(pagination)) {
            const { current, pageSize } = pagination;
            dispatch(queryMaintenanceContractInfo({ limit: pageSize, pageIndex: (current - 1), start: (current - 1) * pageSize }));
        }
    }

    ccodChoose = (record, evt) => {
        const { title, buyingContractNumChoose, maintenanceContractNumChoose } = this.props;
        evt.stopPropagation();
        if (_.isEqual(title, '采购合同编号') && _.isFunction(buyingContractNumChoose) && record) {
            let { ccod } = record
            let obj1 = {
                buyingContractNum: ccod,
            }
            buyingContractNumChoose(obj1);
        }
        if (_.isEqual(title, '维保合同编号') && _.isFunction(maintenanceContractNumChoose) && record) {
            let { ccod, userName, userid,
                partyName, cMoney, expStart, endDate
            } = record
            if (cMoney) {
                cMoney = parseFloat(cMoney).toFixed(2)
            }
            let obj2 = {
                maintenanceContractNum: ccod,
                maintenanceBuyingUser: { data: [{ text: `${userName}(${userid})`, value: userid }], value: [userid] },
                supplier: partyName,
                maintenanceTotal: cMoney,
                maintenanceCycleStartTime: expStart ? moment(expStart) : '',
                maintenanceCycleEndTime: endDate ? moment(endDate) : '',
            }
            maintenanceContractNumChoose(obj2);
        }
    }

    //点击查询
    handleSearch = () => {
        const { dispatch } = this.props
        let temp = ''
        if (this.state.queryValue) {
            temp = this.state.queryValue.split('(')[1].substring(0, 6)
        }

        let params = {
            pageIndex: 0,
            limit: 5,
            ccod: ccod.value,
            userid: temp,
            partyName: partyName.value,
        }
        dispatch(queryMaintenanceContractInfo(params))
    }

    handleCancel = () => {
        const { hideSelectModal } = this.props
        if (_.isFunction(hideSelectModal)) {
            hideSelectModal();
        }
    }

    //选择经办人
    handleSelectUserName = (selectData) => {
        let [selectId = ''] = selectData.value
        let temp = ''
        if (!_.isEmpty(selectData.data)) {
            for (let i = 0; i < selectData.data.length; i++) {
                if (selectId === selectData.data[i].value) {
                    temp = selectData.data[i].text
                }
            }
        }
        this.setState(() => ({ queryValue: temp, initSearchData: selectData }))
    }

    render() {
        const {
            title,
            form: { getFieldDecorator },
            rows, results, tableLoading, pagination,
        } = this.props;

        const {
            initSearchData
        } = this.state

        return (
            <div>
                <Modal
                    title={title}
                    visible={true}
                    onCancel={this.handleCancel}
                    width={1050}
                    maskClosable={false}
                    footer={null}
                >
                    <Form layout="inline" style={{ marginLeft: '10px' }}>
                        <FormItem label='合同编号'>
                            {getFieldDecorator('ccod', {
                                initialValue: ''
                            })
                                (<Input autoComplete='off' />)
                            }
                        </FormItem>
                        <FormItem label='经办人'>
                            <SearchInput
                                style={{ width: '200px' }}
                                placeholder='请选择经办人'
                                method='get'
                                queryName='keyword'
                                dataUrl={`${ContextPath}/cmdbCommon/getUserInfo`}
                                forceOuterData={true}
                                allowClear={false}
                                value={initSearchData}
                                onChange={this.handleSelectUserName}
                            />
                        </FormItem>
                        <FormItem label='供应商'>
                            {getFieldDecorator('partyName', {
                                initialValue: ''
                            })
                                (<Input autoComplete='off' />)
                            }
                        </FormItem>
                        <FormItem>
                            <Button
                                onClick={this.handleSearch}
                                type='primary'
                            >查询</Button>
                        </FormItem>
                    </Form>

                    <Standardtable
                        style={{ borderTop: '#eee solid 1px' }}
                        rowKey='ccod'
                        loading={tableLoading}
                        columns={this.columns}
                        size='middle'
                        data={{
                            list: rows,
                            pagination: {
                                current: pagination.pageIndex + 1,
                                pageSize: pagination.limit,
                                total: results
                            }
                        }}
                        onChange={this.handlePaginationChange.bind(this)}
                    />
                </Modal>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    const { rows, results, tableLoading, pagination } = state.contract;
    return { rows, results, tableLoading, pagination };
}

MantenanceContract = Form.create()(MantenanceContract)

export default connect(mapStateToProps)(MantenanceContract)