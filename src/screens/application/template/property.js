import React, { Component } from 'react';
import { Button, Divider, Modal, Form, Input, Row, Col, Radio } from 'antd';
import { connect } from 'react-redux';
import StandardTable from '../../../components/standardtable'
import { createModel, updateModel, getModelList, deleteModel } from '../../../actions/application/action'
import styles from './index.module.less';
const FormItem = Form.Item;
const { confirm } = Modal;
const RadioGroup = Radio.Group;

class Property extends Component {
    constructor(props) {
        super(props);
        this.state = {
            templateList: {},
            changesLoading: false,
            visibleModal: false,
            currentRecord: {},
            pagination: { limit: 50, start: 0 },
        };
    }

    update = (record) => {
        let { form: { resetFields } } = this.props;
        resetFields(['nodeType', 'propId', 'propName', 'defaultValue', 'propType', 'draworder', 'showHint', 'isRequired']);
        if (_.isEmpty(record)) {
            this.setState(() => ({ currentRecord: {}, visibleModal: true }));
        } else {
            this.setState(() => ({ currentRecord: record, visibleModal: true }));
        }
    };

    handleCancel = () => {
        this.setState({ visibleModal: false });
    };

    handleOk = e => {
        e.preventDefault();
        const { currentRecord } = this.state;
        this.props.form.validateFields((err, values) => {
            const { propId, propName, propType, nodeType, defaultValue, draworder, showHint, isRequired } = values;
            let params = { propId, propName, propType, nodeType: nodeType.trim(), defaultValue, draworder, showHint, isRequired };
            if (err) { return; }
            if (currentRecord.id) {
                params.id = currentRecord.id;
                updateModel(params, () => {
                    this.setState({ visibleModal: false });
                    this.getDataList();
                });
            } else {
                createModel(params, () => {
                    this.setState({ visibleModal: false });
                    this.getDataList();
                });
            }
        });
    };

    deleteGroup = (record) => {
        confirm({
            title: `确定删除${record.nodeType}?`,
            onOk: () => {
                this.handleDeleteGroup(record.id)
            },
            onCancel() { },
        })
    };

    handleDeleteGroup = (id) => {
        let param = {
            ids: id
        };
        deleteModel(param, () => {
            this.getDataList();
        });
    };

    handleCancel = () => {
        this.setState({ visibleModal: false })
    }

    getDataList() {
        let { form: { validateFields }, record } = this.props;
        validateFields((err, fieldsValue) => {
            let params = {
                nodeType: fieldsValue.queryNodeType,
            }
            const { pagination: { start, limit } } = this.state;
            this.setState({
                changesLoading: true
            })
            let data = { ...params, limit, start: start * limit };
            getModelList(data, (res) => {
                this.setState({
                    templateList: res,
                    changesLoading: false
                })
            });
        });
    }

    query = () => {
        this.getDataList();
    }

    componentDidMount() {
        this.getDataList()
    }
    //分页
    changePage = (pagination) => {
        let page = { start: pagination.current - 1, limit: pagination.pageSize };
        this.setState(() => ({ pagination: page }), () => {
            this.getDataList();
        });
    }

    render() {
        const { pagination: { limit, start }, templateList, currentRecord, visibleModal, changesLoading } = this.state;
        const { nodeType, propId, propName, defaultValue, propType, draworder, showHint, isRequired } = currentRecord;
        const { getFieldDecorator } = this.props.form;
        const formItemLayout = {
            labelCol: { xs: { span: 24 }, sm: { span: 5 } },
            wrapperCol: { xs: { span: 24 }, sm: { span: 18 } }
        }

        const groupColumns = [
            { title: '联动属性名称', dataIndex: 'nodeType', align: 'center' },
            { title: '唯一标识', dataIndex: 'propId', align: 'center' },
            { title: '名称', dataIndex: 'propName', align: 'center' },
            { title: '默认值', dataIndex: 'defaultValue', align: 'center' },
            { title: '属性字段类型', dataIndex: 'propType', align: 'center' },
            { title: '属性展示顺序', dataIndex: 'draworder', align: 'center' },
            { title: '属性提示信息', dataIndex: 'showHint', align: 'center' },
            {
                title: '属性是否为必填项', dataIndex: 'isRequired', align: 'center',
                render: (isRequired) => (
                    <span> {(isRequired === '1') ? '是' : '否'}</span>
                )
            },
            {
                title: '操作', dataIndex: 'action', align: 'center',
                render: (text, record) => (
                    <span>
                        <a onClick={this.update.bind(this, record)}>编辑</a>
                        <Divider type="vertical" />
                        <a onClick={this.deleteGroup.bind(this, record)}>删除</a>
                    </span>
                ),
            },
        ];

        const formLayout = {
            labelCol: { xs: { span: 24 }, sm: { span: 11 } },
            wrapperCol: { xs: { span: 24 }, sm: { span: 13 } }
        }
        return (
            <div>

                <Row className={styles.queryCol}>
                    <Col span={7}>
                        <FormItem {...formLayout} label='联动属性名称'>
                            {
                                getFieldDecorator('queryNodeType')
                                    (<Input placeholder='请输入联动属名称' autoComplete='off' />)
                            }
                        </FormItem>
                    </Col>
                    <Col offset={1} span={10}>
                        <Button
                            type='primary'
                            icon='search'
                            onClick={this.query.bind(this)}
                            style={{ margin: '5px 16px 0 0' }}
                        >查询</Button>
                        <Button
                            style={{ margin: '5px 16px 0 0' }}
                            type="primary"
                            onClick={this.update.bind(this)}
                        >新增联动属性</Button>
                    </Col>
                    {/* <Col  span={2}>
                        <Button type="primary" onClick={this.update.bind(this)}>新增联动属性</Button>
                    </Col> */}
                </Row>
                <StandardTable
                    rowKey='id'
                    loading={changesLoading}
                    columns={groupColumns}
                    data={{
                        list: templateList.rows,
                        pagination: {
                            current: start + 1,
                            pageSize: limit,
                            total: templateList.results
                        }
                    }}
                    rowSelection={false}
                    onChange={this.changePage.bind(this)} />
                <Modal
                    title={currentRecord.id ? '编辑联动属性' : '新增联动属性'}
                    visible={visibleModal}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                    width={620}
                    destroyOnClose={true}>
                    <Form {...formItemLayout}>
                        <Form.Item label="联动属性名称">
                            {getFieldDecorator('nodeType', {
                                rules: [{
                                    required: true, message: '请输入联动属性名称'
                                }],
                                initialValue: nodeType
                            })
                                (<Input autoComplete='off' />)
                            }
                        </Form.Item>
                        <Form.Item label="唯一标识">
                            {getFieldDecorator('propId', {
                                rules: [
                                    { required: true, message: '唯一标识不能为空' },
                                    { pattern: /^([a-zA-Z0-9_]*)$/, message: '下划线/数字/英文字母' }
                                ],
                                initialValue: propId
                            })
                                (<Input placeholder="下划线/数字/英文字母" autoComplete='off' disabled={!_.isEmpty(propId)} />)
                            }
                        </Form.Item>
                        <Form.Item label="名称">
                            {getFieldDecorator('propName', {
                                rules: [{
                                    required: true, message: '请输入名称'
                                }],
                                initialValue: propName
                            })
                                (<Input autoComplete='off' />)
                            }
                        </Form.Item>
                        <Form.Item label="默认值">
                            {getFieldDecorator('defaultValue', {
                                initialValue: defaultValue
                            })
                                (<Input autoComplete='off' />)
                            }
                        </Form.Item>
                        <Form.Item label="属性字段类型">
                            {getFieldDecorator('propType', {
                                rules: [{
                                    required: true, message: '请输入属性字段类型'
                                }],
                                initialValue: propType
                            })
                                (<Input autoComplete='off' />)
                            }
                        </Form.Item>
                        <Form.Item label="属性展示顺序">
                            {getFieldDecorator('draworder', {
                                // rules: [{
                                //     required: true, message: '请输入属性展示顺序号'
                                // }],
                                initialValue: draworder
                            })
                                (<Input type='number' autoComplete='off' />)
                            }
                        </Form.Item>
                        <Form.Item label="属性提示信息">
                            {getFieldDecorator('showHint', {
                                initialValue: showHint
                            })
                                (<Input autoComplete='off' />)
                            }
                        </Form.Item>
                        <Form.Item label="属性是否为必填项">
                            {getFieldDecorator('isRequired', {
                                rules: [{
                                    required: true, message: '请选择属性是否为必填项'
                                }],
                                initialValue: isRequired || '0'
                            })
                                (<RadioGroup>
                                    <Radio value='1'>是</Radio>
                                    <Radio value='0'>否</Radio>
                                </RadioGroup>)
                            }
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        );
    }
}


Property = Form.create()(Property)

export default connect()(Property);