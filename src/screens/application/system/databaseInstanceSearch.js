import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { Tabs, Button, Spin, Form, AutoComplete, Input, List, Empty } from 'antd';
import {
    querySystemIp,
    getDatabaseInstance,
    getDatabaseInstanceIpList,
} from '../../../actions/application/action';
import Styles from './index.module.less'

const FormItem = Form.Item,
    TabPane = Tabs.TabPane,
    ListItem = List.Item;
const reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;


class DatabaseInstanceSearch extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ipSearchDataSource: [],
            searchIp: '',
            isShowDBInstance: false,
        };

    }

    handleSubmit = e => {
        e.preventDefault();
        const { form } = this.props;
        const { dispatch, systemId } = this.props;
        form.validateFields((err, values) => {
            if (!err) {
                const { instance, ip, port } = values;
                this.setState(() => ({ isShowDBInstance: true }))
                dispatch(getDatabaseInstance({
                    instance, ip, port, systemId
                }, res => {
                    res.forEach(item => {
                        const { id, ipListPagination: { limit, pageIndex } } = item;
                        dispatch(getDatabaseInstanceIpList({
                            programId: id,
                            pageIndex,
                            limit,
                        }));
                    });
                }));
            }
        });
    };

    paginationChanged = (current, pageSize, id) => {
        const { dispatch } = this.props;
        dispatch(getDatabaseInstanceIpList({
            programId: id,
            pageIndex: current - 1,
            limit: pageSize,
        }));
    }

    ipSearch = (ipAddress) => {
        const { dispatch, systemId } = this.props;
        dispatch(querySystemIp({ systemId, ipAddress }, res => {
            this.setState(() => ({ ipSearchDataSource: res.rows }));
        }));
    }

    componentDidUpdate(nextProps) {
        const { resetTag = false } = nextProps;
        const { isShowDBInstance } = this.state;
        if (resetTag && isShowDBInstance) {
            this.setState(() => ({ isShowDBInstance: false }));
            this.props.form.resetFields();
        }
    }

    render() {
        const {
            form: { getFieldDecorator },
            dbInstacceList, dbInstacceLoading,
        } = this.props;

        const { isShowDBInstance, ipSearchDataSource, demo } = this.state;


        return (
            <div className={Styles.attributeMain}>

                <Form layout='inline' onSubmit={this.handleSubmit.bind(this)}>
                    <FormItem label='IP地址'>
                        {
                            getFieldDecorator('ip', {
                                rules: [
                                    { required: true, message: '请输入IP地址!' },
                                    { pattern: reg, message: '正确的IP格式为 1.1.1.1' }
                                ],
                                initialValue: '',
                            })(
                                <AutoComplete
                                    dataSource={ipSearchDataSource}
                                    onSearch={this.ipSearch}
                                    style={{ width: 188 }}
                                    placeholder='请输入 IP 地址查询' />
                            )
                        }
                    </FormItem>
                    <FormItem label='端口'>
                        {
                            getFieldDecorator('port', {
                                rules: [
                                    { required: true, message: '端口不能为空!' },
                                ],
                                initialValue: '',
                            })(
                                <Input placeholder='请输入端口' />
                            )
                        }
                    </FormItem>
                    <FormItem label='实例名'>
                        {
                            getFieldDecorator('instance', {
                                rules: [
                                    { required: true, message: '实例名称不能为空!' },
                                ],
                                initialValue: '',
                            })(
                                <Input placeholder='请输入实例名称' />
                            )
                        }
                    </FormItem>
                    <FormItem>
                        <Button type='primary' htmlType='submit'>查询</Button>
                    </FormItem>
                </Form>

                {
                    isShowDBInstance ? (<Fragment>
                        <Spin spinning={dbInstacceLoading}>
                            <div style={{ minHeight: '100px' }}>
                                {_.isEmpty(dbInstacceList) ?
                                    <Empty description='没有找到对应的数据库实例！' /> :
                                    <Fragment>
                                        {dbInstacceList.map(dbInstacce => {
                                            const { name, id, ipList, ipListLoading, ipListResults, ipListPagination: { limit, pageIndex } } = dbInstacce;
                                            return (
                                                <Tabs defaultActiveKey={id + ''} key={id + name}>
                                                    <TabPane tab={`程序名称：${name}`} key={id + ''}>
                                                        <List
                                                            grid={{ gutter: 8, column: 5 }}
                                                            dataSource={ipList}
                                                            loading={ipListLoading}
                                                            renderItem={item => (<ListItem>{item}</ListItem>)}
                                                            pagination={{
                                                                total: ipListResults,
                                                                pageSize: limit,
                                                                current: pageIndex + 1,
                                                                showSizeChanger: true,
                                                                onChange: (current, pageSize) => {
                                                                    this.paginationChanged(current, pageSize, id);
                                                                },
                                                                onShowSizeChange: (current, pageSize) => {
                                                                    this.paginationChanged(current, pageSize, id);
                                                                }
                                                            }}
                                                        ></List>
                                                    </TabPane>
                                                </Tabs>
                                            );
                                        })}
                                    </Fragment>
                                }
                            </div>
                        </Spin>
                    </Fragment>) : null
                }
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const { databaseInstance: {
        dbInstacceList, dbInstacceLoading,
    } } = state;
    return {
        dbInstacceList, dbInstacceLoading,
    }
}

DatabaseInstanceSearch = Form.create()(DatabaseInstanceSearch)

export default connect(mapStateToProps)(DatabaseInstanceSearch);