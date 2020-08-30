import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { Form, Input, Button, Modal, Row, Col, Spin, message } from 'antd'
import Standardtable from '../../components/standardtable'
import ApplicationTitle from '../common/applicationTitle'
import { ContextPath } from '../../constants'
import { SearchInput } from '../../components/searchinput/searchinput'
import {
    queryNotifyContractData,
    updateNotifyData,
    sendMsgToNotifyPerson
} from '../../actions/contract/action'
import styles from './index.module.less'


const FormItem = Form.Item,
    spanLeft = 22,
    formItemLayout = {
        labelCol: { span: 4 },
        wrapperCol: { span: 20 }
    }
class Contract extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            editVisable: false,
            editData: {},
            queryValue: '',
            initSearchData: { data: [], value: [] },
            selectRows: []
        };
        this.columns = [
            { title: '序号', dataIndex: 'serialNumber', width: '8%' },

            { title: '合同编号', dataIndex: 'ccod', width: '15%' },
            {
                title: '生成日期', dataIndex: 'dealTime', width: '12%', render: (value = '') => {
                    if (value) {
                        value = value.split(' ')[0]
                    }
                    return value
                }
            },
            { title: '通知人', dataIndex: 'userName', width: '15%' },
            { title: '备注', dataIndex: 'remark', width: '20%' },
            { title: '最近通知时间', dataIndex: 'recentNotifyTime', width: '18%' },
            {
                title: '操作', dataIndex: 'operation', width: '12%', render: (value, record) => {
                    return (
                        <Fragment>
                            <a
                                style={{ color: 'green' }}
                                onClick={this.showEditConfirm.bind(this, record)}
                            >编辑</a>
                        </Fragment>
                    );
                }
            },
        ]
    }

    //编辑确认
    handleOk = (e) => {
        e.preventDefault();
        const { loading, editData } = this.state;
        const { dispatch, form: { validateFields } } = this.props;
        let userName = '', userid = '', remark = ''
        validateFields((err, values) => {
            if (err) {
                return;
            }
            if (loading) {
                message.warning('请勿重复提交');
            }
            this.setState(() => ({ loading: true }));
            remark = values.remark
            userid = values.combineUser.value[0]
            userName = values.combineUser.data.find(temp => temp.value === values.combineUser.value[0]).text.split('(')[0]
        })
        let params = { id: editData.id, userName: userName, userid: userid, remark: remark }

        dispatch(updateNotifyData(params, result => {
            this.setState(() => ({
                loading: false,
                editVisable: false,
            }), () => {
                message.success('维保合同编辑成功');
                this.queryNotifyContractData()
            });
        }))

    }

    showEditConfirm = (record, evt) => {
        evt.stopPropagation();
        this.setState({
            editVisable: true,
            editData: record,
        })
    }

    componentDidMount() {
        this.queryNotifyContractData()
    }

    queryNotifyContractData = () => {
        const { dispatch } = this.props
        let params = {
            pageIndex: 0,
            limit: 50,
            ccod: '',
            userid: '',
        }
        dispatch(queryNotifyContractData(params))
    }

    //选择通知人
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

    //点击查询
    handleSearch = () => {
        const { dispatch } = this.props
        let temp = ''
        if (this.state.queryValue) {
            temp = this.state.queryValue.split('(')[1].substring(0, 6)
        }

        let params = {
            pageIndex: 0,
            limit: 50,
            userid: temp,
            ccod: ccod.value,
        }
        dispatch(queryNotifyContractData(params))
    }

    // 翻页
    handlePaginationChange = (pagination) => {
        const { dispatch } = this.props
        if (!_.isEmpty(pagination)) {
            const { current, pageSize } = pagination;
            dispatch(queryNotifyContractData({ limit: pageSize, pageIndex: (current - 1), start: (current - 1) * pageSize }));
        }
    }

    //点击取消
    handleCancel = () => {
        this.setState({ editVisable: false })
    }

    // 表格多选
    handleRowChange = (selectRows) => {
        this.setState(() => ({ selectRows }));
    }

    //消息发送
    sendMsg = () => {
        const { dispatch } = this.props
        const { selectRows } = this.state;

        let msgBodyList = selectRows.map((item) => {
            return {
                id: item.id,
                receiver: item.userid,
                textType: 'plain',
                subject: `【${item.ccod}】合同维保对象信息录入自动提醒`,
                messageBody: `IT资源管理系统提醒：
        您负责的维保合同“${item.ccod}”已进入正常履行阶段，请到“IT资源管理系统-应用CMDB-配置中心-模型配置-应用系统”菜单下，根据维保合同内容更新维保对象信息。`
            }
        })
        let params = { msgBodyList: msgBodyList }
        if (_.isEmpty(msgBodyList)) {
            message.warning(`请选择要发送信息的对象!`)
            return
        }
        dispatch(sendMsgToNotifyPerson(params, result => {
            message.success('消息发送成功');
            this.queryNotifyContractData()
        }))
    }

    render() {
        const {
            form: { getFieldDecorator },
            rows, results, tableLoading, pagination,
        } = this.props;

        const {
            loading,
            initSearchData,
            editVisable,
            editData,
        } = this.state;

        let {
            userName, userid, remark
        } = editData

        //初始化 发送人
        let combineUser = userName
        let initCombineUser = { data: [], value: [] }
        if (combineUser) {
            let value = userid
            initCombineUser = {
                data: [{ text: combineUser, value: value }],
                value: [value]
            }
        }

        return (
            <div className={styles.block_body} >
                <ApplicationTitle
                    firstBreadcrumb='查询统计'
                    secondBreadcrumb='维保通知管理'
                />
                <Form layout="inline" style={{ marginLeft: '10px' }}>
                    <FormItem label='通知人'>
                        <SearchInput
                            style={{ width: '200px' }}
                            placeholder='请选择通知人'
                            method='get'
                            queryName='keyword'
                            dataUrl={`${ContextPath}/cmdbCommon/getUserInfo`}
                            forceOuterData={true}
                            allowClear={false}
                            value={initSearchData}
                            onChange={this.handleSelectUserName}
                        />
                    </FormItem>
                    <FormItem label='合同编号'>
                        {getFieldDecorator('ccod', {
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
                    <FormItem>
                        <Button
                            onClick={this.sendMsg}
                            type='primary'
                            className='button-success'
                        >批量发送</Button>
                    </FormItem>
                </Form>

                <Standardtable
                    style={{ borderTop: '#eee solid 1px' }}
                    rowKey='id'
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
                    rowSelection={{ selectedRowKeys: [], type: 'checkbox' }}
                    onSelectRow={this.handleRowChange.bind(this)}
                    onChange={this.handlePaginationChange.bind(this)}
                />

                <Modal
                    title='编辑维保通知'
                    visible={editVisable}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                    width={800}
                    className={styles.customModal}
                    maskClosable={false}
                >
                    <Spin spinning={loading}>
                        <div className={styles.contractModalBody}>
                            <Form>
                                <Row>
                                    <Col span={spanLeft}>
                                        <FormItem label="通知人"  {...formItemLayout}>
                                            {getFieldDecorator('combineUser', {
                                                rules: [{
                                                    required: true,
                                                    validator: (rule, value, callback) => {
                                                        if (_.isEmpty(value && value.value)) {
                                                            callback('请选择通知人!');
                                                        } else {
                                                            callback();
                                                        }
                                                    }
                                                }],
                                                initialValue: initCombineUser
                                            })
                                                (
                                                    <SearchInput
                                                        placeholder='请选择通知人'
                                                        method='get'
                                                        queryName='keyword'
                                                        dataUrl={`${ContextPath}/cmdbCommon/getUserInfo`}
                                                        forceOuterData={true}
                                                        allowClear={false}
                                                    />
                                                )
                                            }
                                        </FormItem>
                                    </Col>
                                    <Col span={spanLeft}>
                                        <FormItem label="备注"  {...formItemLayout}>
                                            {getFieldDecorator('remark', {
                                                initialValue: remark
                                            })
                                                (<Input autoComplete='off' placeholder='请输入备注' />)
                                            }
                                        </FormItem>
                                    </Col>
                                </Row>
                            </Form>
                        </div>
                    </Spin>
                </Modal>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const { rows, results, tableLoading, pagination } = state.contract;
    return { rows, results, tableLoading, pagination };
}

Contract = Form.create()(Contract)

export default connect(mapStateToProps)(Contract)
















