import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { Row, Col, Button, Form } from 'antd';
import { ContextPath } from '../../../constants';
import { SearchInput } from '../../../components/searchinput/searchinput';

const FormItem = Form.Item;

class LineOperation extends Component {
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
        let { lineName: { data, value: [key = ''] } } = getFieldsValue();
        let lineName = '';
        if (key) {
            lineName = data.find(item => item.value === key).text || '';
        }

        if (_.isFunction(updateQueryValue)) {
            updateQueryValue(lineName);
        }
    }

    handleReset = () => {
        const { updateQueryValue, form: { setFieldsValue } } = this.props;
        setFieldsValue({ lineName: { data: [], value: [] } })
        if (_.isFunction(updateQueryValue)) {
            updateQueryValue('');
        }
    }

    handleCreate = () => {
        const { updateIsCreate } = this.props;
        if (_.isFunction(updateIsCreate)) {
            updateIsCreate(true);
        }
    }

    componentDidUpdate() {
        const { systemInfo = {}, nodeType } = this.props;
        const { systemId } = this.state;
        let pId = systemInfo.systemId;
        if (pId !== systemId) {
            this.setState(
                () => ({ systemId: pId, nodeType }),
                () => {
                    // this.getSelfDefiningList()
                });
        }
    }

    // 导出 Excel 模板
    downloadImportExcel = (e) => {
        e.preventDefault();
        const { form: { getFieldsValue }, systemInfo } = this.props;
        let systemId = systemInfo.systemId;
        let { lineName: { data, value: [key = ''] } } = getFieldsValue();
        let lineName = '';
        if (key) {
            lineName = data.find(item => item.value === key).text || '';
        }
        let params = encodeURI(`systemId=${systemId}&lineName=${lineName}`);
        window.open(`${ContextPath}/cmdb/downloadLineExcel?${params}`);
    }



    render() {

        const {
            form: { getFieldDecorator },
            buttonLoading,
            systemInfo, nodeType,
            showDeleteConfirm,
        } = this.props;

        const { systemId, role } = systemInfo;

        let isLeader = role === '领导', isAdmin = role === '管理员';

        return (
            <Row>
                <Col>
                    <Form
                        layout='inline'
                        onSubmit={this.handleSearch}
                    >
                        <FormItem label='通信线路名称'>
                            {
                                getFieldDecorator('lineName', {
                                    initialValue: { data: [], value: [] }
                                })
                                    (
                                        <SearchInput
                                            style={{ width: '350px' }}
                                            placeholder={`请选择通信线路名称`}
                                            method='get'
                                            queryName='lineName'
                                            dataUrl={`${ContextPath}/cmdb/getLineIdByName`}
                                            forceOuterData={true}
                                            onChange={this.handleSelect}
                                        />
                                    )
                            }
                        </FormItem>

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
                                </Fragment>
                            ) : null
                        }

                        <FormItem>
                            <Button onClick={this.downloadImportExcel.bind(this)}>导出Excel</Button>
                        </FormItem>


                    </Form>
                </Col>

            </Row>
        )
    }
}
const mapStateToProps = (state) => {
    const { buttonLoading, pagination } = state.modelConfig;
    return { buttonLoading, pagination };
}

LineOperation = Form.create()(LineOperation);

export default connect(mapStateToProps)(LineOperation);