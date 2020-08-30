import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { Row, Col, Upload, Input, Button, Icon, Alert, Form } from 'antd';
import { ContextPath } from '../../constants';
import { SearchInput } from '../../components/searchinput/searchinput';
import { getSelfDefiningList } from '../../actions/selfDefining/action';
import { PlainSelector } from '../../components/selector/selector';

const FormItem = Form.Item,
    isMonitorData = [{ text: '是', value: '01' }, { text: '否', value: '02' }];

class OperationModule extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isShowOtherQuery: false,
            isShowOtherQueryBtn: false,
            queryList: [], // 自定义属性列表
            queryValue: [], // 用来判断是否重置表单
        };
    }

    handleSearch = () => {
        const { updateQueryValue, getDataList, form: { getFieldsValue }, pagination: { limit } } = this.props;
        let { ip = '', processName = '', processParams = '', processPath = '', processUser = '' } = getFieldsValue();
        ip = ip.trim()
        processName = processName.trim()
        processParams = processParams.trim()
        processPath = processPath.trim()
        processUser = processUser.trim()

        let queryValue = { ip, processName, processParams, processPath, processUser };

        let params = {
            pageIndex: 0, limit, start: 0,
            ...queryValue
        };
        if (_.isFunction(getDataList)) {
            getDataList(params)
        }
        if (_.isFunction(updateQueryValue)) {
            updateQueryValue(queryValue)
        }
    }

    handleReset = () => {
        const { updateQueryValue, getDataList, form: { resetFields }, pagination: { limit } } = this.props;
        resetFields();
        let params = {
            pageIndex: 0, limit, start: 0,
            ip: '', processName: '', processParams: '', processPath: '', processUser: '',
        };
        if (_.isFunction(getDataList)) {
            getDataList(params)
        }
        if (_.isFunction(updateQueryValue)) {
            updateQueryValue({})
        }
    }

    render() {

        const { form: { getFieldDecorator }, buttonLoading, } = this.props;

        return (
            <Row>
                <Col>
                    <Form layout='inline' >
                        <FormItem label='IP'>
                            {getFieldDecorator('ip', {
                                // initialValue: ''
                            })
                                (
                                    <Input
                                        placeholder='请输入IP'
                                        style={{ width: '180px' }}
                                        autoComplete='off'
                                    />
                                )
                            }
                        </FormItem>
                        {/* <FormItem label='所属模块'>
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
                        </FormItem> */}
                        <FormItem label='进程名称'>
                            {getFieldDecorator('processName', {
                                // initialValue: ''
                            })
                                (
                                    <Input
                                        placeholder='请输入进程名称'
                                        style={{ width: '180px' }}
                                        autoComplete='off'
                                    />
                                )
                            }
                        </FormItem>
                        <FormItem label='进程参数'>
                            {getFieldDecorator('processParams', {
                                // initialValue: ''
                            })
                                (
                                    <Input
                                        placeholder='请输入进程参数'
                                        style={{ width: '180px' }}
                                        autoComplete='off'
                                    />
                                )
                            }
                        </FormItem>
                        <FormItem label='进程路径'>
                            {getFieldDecorator('processPath', {
                                // initialValue: ''
                            })
                                (
                                    <Input
                                        placeholder='请输入进程路径'
                                        style={{ width: '180px' }}
                                        autoComplete='off'
                                    />
                                )
                            }
                        </FormItem>
                        <FormItem label='进程用户'>
                            {getFieldDecorator('processUser', {
                                // initialValue: ''
                            })
                                (
                                    <Input
                                        placeholder='请输入进程用户'
                                        style={{ width: '180px' }}
                                        autoComplete='off'
                                    />
                                )
                            }
                        </FormItem>


                        <FormItem>
                            <Button onClick={this.handleSearch} type='primary' loading={buttonLoading} >查询</Button>
                        </FormItem>
                        <FormItem>
                            <Button onClick={this.handleReset} type='primary' >重置</Button>
                        </FormItem>

                    </Form>
                </Col>

            </Row>
        )
    }
}

OperationModule = Form.create()(OperationModule);

export default OperationModule;