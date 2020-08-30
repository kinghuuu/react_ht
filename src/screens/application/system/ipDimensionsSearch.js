import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Tabs, Button, Spin, Form, Descriptions, AutoComplete, Row, Col } from 'antd';
import Standardtable from '../../../components/standardtable';
import {
    querySystemIp,
    getIpDimensionsRelation,
    getIpDimensionsDetails,
    getIpDimensionsDetailsOther,
} from '../../../actions/application/action';
import Styles from './index.module.less'

const FormItem = Form.Item,
    TabPane = Tabs.TabPane,
    DescriptionsItem = Descriptions.Item;
const reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;


class IpDimensionsSearch extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isShowIpDimensions: false,
            ipSearchDataSource: [],
            searchIp: '',
        };
        this.columns = [
            { title: '程序名称', dataIndex: 'name', width: '' },
            { title: '程序类型', dataIndex: 'type', width: '' },
            { title: '部署路径', dataIndex: 'path', width: '' },
            { title: '部署账户', dataIndex: 'account', width: '' },
            { title: '端口', dataIndex: 'port', width: '' },
            { title: '描述信息', dataIndex: 'description', width: '' },
            { title: '备注信息', dataIndex: 'remark', width: '' },
            {
                title: '自定义属性', dataIndex: 'dynamicPropertyList', width: '', render: (list = []) => {
                    return list.map(item => {
                        return <Row key={item}>{item}</Row>
                    });
                }
            },
        ]
    }

    handleSubmit = e => {
        e.preventDefault();
        const { form } = this.props;
        const { dispatch, pagination: { limit }, systemId } = this.props;

        form.validateFields((err, values) => {
            if (!err) {
                let ipAddress = values.query;
                let pageIndex = 0;
                this.setState(() => ({ isShowIpDimensions: true, searchIp: ipAddress }));
                dispatch(getIpDimensionsDetails({ ipAddress }));
                dispatch(getIpDimensionsDetailsOther({ systemId, ipAddress, }))
                dispatch(getIpDimensionsRelation({ systemId, ipAddress, pageIndex, limit, start: pageIndex * limit }));
            }
        });
    };

    paginationChanged = (pagination) => {
        const { current, pageSize } = pagination;
        const { form: { getFieldValue }, dispatch, systemId } = this.props;
        if (current && pageSize) {
            let ipAddress = getFieldValue('query').query
            dispatch(getIpDimensionsRelation({
                systemId,
                ipAddress,
                pageIndex: current - 1,
                limit: pageSize,
                start: (current - 1) * pageSize
            }));
        }
    }

    ipSearch = (ipAddress) => {
        const { dispatch, systemId } = this.props;
        dispatch(querySystemIp({ systemId, ipAddress }, res => {
            this.setState(() => ({ ipSearchDataSource: res.rows }));
        }));
    }

    componentDidUpdate(nextProps) {
        const { resetTag = false } = nextProps;
        const { isShowIpDimensions } = this.state;
        if (resetTag && isShowIpDimensions) {
            this.setState(() => ({ isShowIpDimensions: false }));
            this.props.form.resetFields();
        }
    }

    render() {
        const {
            form: { getFieldDecorator },
            details: {
                resourceType,
                resourceSeqId,
                resourceIp,
                userId,
                useStatus,
                operationSys,
                mainConfig,
                room,
            }, detailsLoading, detailsOther = [],
            rows, pagination: { limit, pageIndex }, results, tableLoading,
        } = this.props;
        const { isShowIpDimensions, ipSearchDataSource, searchIp } = this.state;

        return (
            <div className={Styles.attributeMain}>

                <Form layout='inline' onSubmit={this.handleSubmit.bind(this)}>
                    <FormItem>
                        {
                            getFieldDecorator('query', {
                                rules: [
                                    { required: true, message: '请输入IP地址!' },
                                    { pattern: reg, message: '正确的IP格式为 1.1.1.1' }
                                ],
                                initialValue: '',
                                // validateTrigger: 'onSubmit'
                            })(
                                <AutoComplete
                                    dataSource={ipSearchDataSource}
                                    onSearch={this.ipSearch}
                                    style={{ width: 188 }}
                                    placeholder='请输入 IP 地址查询' />
                            )
                        }
                    </FormItem>
                    <FormItem>
                        <Button type='primary' htmlType='submit'>搜索</Button>
                    </FormItem>
                </Form>

                {
                    isShowIpDimensions ? (<Fragment>
                        <Tabs defaultActiveKey='111'>
                            <TabPane tab='基本信息' key='111'>
                                <Spin spinning={detailsLoading}>
                                    <Descriptions
                                        size='small'
                                        bordered
                                        column={4}
                                    >
                                        <DescriptionsItem label='IP地址'>{searchIp}</DescriptionsItem>
                                        <DescriptionsItem label='状态'>{useStatus}</DescriptionsItem>
                                        <DescriptionsItem label='操作系统'>{operationSys}</DescriptionsItem>
                                        <DescriptionsItem label='所属机房'>{room}</DescriptionsItem>
                                        <DescriptionsItem label='流水号'>{resourceSeqId}</DescriptionsItem>
                                        <DescriptionsItem label='类别'>{resourceType}</DescriptionsItem>
                                        <DescriptionsItem label='使用人'>{userId}</DescriptionsItem>
                                        <DescriptionsItem label='宿主机'>{resourceIp}</DescriptionsItem>
                                        <DescriptionsItem label='主要配置'>{mainConfig}</DescriptionsItem>
                                        {detailsOther.map(item => {
                                            return <DescriptionsItem label={item.propName} key={item.propName}>{item.propValue}</DescriptionsItem>
                                        })}
                                    </Descriptions>
                                </Spin>
                            </TabPane>
                        </Tabs>

                        <Tabs defaultActiveKey='1' style={{ marginTop: '16px' }}>
                            <TabPane tab='关联程序' key='1'>
                                <Standardtable
                                    expandedRowRender={record => {
                                        return (<div style={{ lineHeight: '1.8' }} >
                                            <b>服务列表：</b>
                                            {record.serviceList.map((item, index) => (<Row key={item}>{`${index + 1}. ${item}`}</Row>))}
                                        </div>)
                                    }}
                                    rowKey='programDto.id'
                                    loading={tableLoading}
                                    columns={this.columns}
                                    data={{
                                        list: rows,
                                        pagination: {
                                            current: pageIndex + 1,
                                            pageSize: limit,
                                            total: results,
                                        }
                                    }}
                                    rowSelection={false}
                                    onChange={this.paginationChanged.bind(this)} />
                            </TabPane>
                        </Tabs>
                    </Fragment>) : null
                }

            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const { ipDimensions: {
        details, detailsLoading, detailsOther,
        relation: {
            rows, tableLoading, results, pagination
        }
    } } = state;
    return {
        details, detailsLoading, detailsOther, rows, tableLoading, results, pagination
    }
}

IpDimensionsSearch = Form.create()(IpDimensionsSearch)

export default connect(mapStateToProps)(IpDimensionsSearch);