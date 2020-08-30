import React, { Component } from 'react';
import { Table, Button, Divider, Modal, Form, Input } from 'antd';
import { connect } from 'react-redux';
import Styles from './index.module.less'
import { updateAttributeAction, addAttributeAction, editAttributeAction, deleteAttributeAction, addGroupAction, editGroupAction, updateGroupAction, deleteGroupAction } from '../../../actions/application/action'
const { confirm } = Modal;

class attribute extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id: 0,
            visible: false,
            propId: '',
            propName: '',
            propValue: '',
            type: 'add',
            showCreateGroupModal: false
         };
    }

    addGroup = (type, id, propId, propName, propValue) => {
        this.setState({ 
            showCreateGroupModal: true,
            id,
            type,
            propId,
            propName,
            propValue
        });
    };

    hideCreateGroupModal = () => {
        this.setState({ showCreateGroupModal: false });
    };

    handleSubmitCreateGroupModal = e => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            const { systemId } = this.props;
            const { id, type } = this.state;
            if (!err) {
                this.hideCreateGroupModal();
                if(type === 'add'){
                    addGroupAction(systemId, values, () => {//调接口函数
                        // this.hideCreateGroupModal();
                        this.updateData();
                    })
                }else if(type === 'edit'){
                    editGroupAction(systemId, id ,values, () => {//调接口函数
                        // this.hideCreateGroupModal();
                        this.updateData();
                    })
                }
            }
        });
    };

    deleteGroup = (id, name) => {
        confirm({
            title: `确定删除${name}?`,
            onOk: () => {
                this.handleDeleteGroup(id)
            },
            onCancel() {
            },
        })
    };

    handleDeleteGroup = (id) => {
        const { systemId } = this.props;
        deleteGroupAction(systemId, id, () => {
            this.updateData();
        })
    };

    addAttr = (type, id, propId, propName ) => {
        this.setState({
            id,
            visible: true,
            type,
            propId,
            propName
        })
    }

    deleteAttr = (id, name) => {
        confirm({
            title: `确定删除${name}?`,
            onOk: () => {
                this.handleDelete(id)

            },
            onCancel() {
            },
          })
    }
    handleDelete = (id) => {
        const { systemId } = this.props
        deleteAttributeAction(systemId, id, () => {
            this.updateData()
        })
    }

    handleCancel = () => {
        this.setState({
            visible: false
        })
    }

    handleSubmit = e => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            const { systemId } = this.props
            const { id, type } = this.state
            if (!err) {
                if(type === 'add'){
                    addAttributeAction(systemId, values, () => {
                        this.handleCancel()
                        this.updateData()
                    })
                }else if(type === 'edit'){
                    editAttributeAction(systemId, id ,values, () => {
                        this.handleCancel()
                        this.updateData()
                    })
                }
            }
        });
    };

    updateData = () => {
        const { systemId } = this.props
        const { name  } = this.props;
        if (name === 'attr'){
            this.props.dispatch(updateAttributeAction(systemId))
        } else if (name === 'group') {
            this.props.dispatch(updateGroupAction(systemId));
        }
    }
    
    componentDidMount(){
        this.updateData()
    }

    render() {
        const { type, propId, propName, propValue } = this.state
        const { customAttributeList, customGroupList, name } = this.props
        const { getFieldDecorator } = this.props.form;
        const formItemLayout = {
            labelCol: {
              xs: { span: 24 },
              sm: { span: 5 },
            },
            wrapperCol: {
              xs: { span: 24 },
              sm: { span: 18 },
            },
        }

        const columns = [
            {
              title: '唯一标识',
              dataIndex: 'propId',
              align: 'center'
            },{
              title: '名称',
              dataIndex: 'propName',
              align: 'center'
            },{
              title: '操作',
              dataIndex: 'action',
              align: 'center',
              render: (text, record) => (
                <span>
                  <a onClick={this.addAttr.bind(this, 'edit', record.key, record.propId, record.propName)}>编辑</a>
                  <Divider type="vertical" />
                  <a onClick={this.deleteAttr.bind(this, record.key, record.propName)}>删除</a>
                </span>
              ),
            },
        ]
        const groupColumns = [
            {
              title: '唯一标识',
              dataIndex: 'propId',
              align: 'center'
            },{
              title: '名称',
              dataIndex: 'propName',
              align: 'center'
            },{
              title: '值',
              dataIndex: 'propValue',
              align: 'center'
            },{
              title: '操作',
              dataIndex: 'action',
              align: 'center',
              render: (text, record) => (
                <span>
                  <a onClick={this.addGroup.bind(this, 'edit', record.key, record.propId, record.propName, record.propValue)}>编辑</a>
                  <Divider type="vertical" />
                  <a onClick={this.deleteGroup.bind(this, record.key, record.propName)}>删除</a>
                </span>
              ),
            },
        ]

        let dataSource = []
        let groupDataSource = [];
        if(customAttributeList.length > 0){
            customAttributeList.map((item, index) => {
                dataSource.push({
                    key: item.id,
                    propId: item.propId,
                    propName: item.propName
                })
                return dataSource
            })
        }
        if(customGroupList.length > 0){
            customGroupList.map((item, index) => {
                groupDataSource.push({
                    key: item.id,
                    propId: item.propId,
                    propName: item.propName,
                    propValue: item.propValue
                })
                return groupDataSource
            })
        }
        return (
            <div className={Styles.attributeMain}>
                <div className={Styles.addBtn}>
                    {
                        name === 'attr' ?
                        <Button type="primary" onClick={this.addAttr.bind(this, 'add')}>新增属性</Button> :
                        <Button type="primary" onClick={this.addGroup.bind(this, 'add')}>新增分组</Button>
                    }
                </div>
                <div>
                    {
                        name === 'attr' ?
                        <Table columns={columns} dataSource={dataSource} /> :
                        <Table columns={groupColumns} dataSource={groupDataSource} pagination={false} />
                    }
                </div>

                <Modal
                    title={type === 'add' ? '新增属性' : '编辑属性'}
                    visible={this.state.visible}
                    onOk={this.handleSubmit}
                    onCancel={this.handleCancel}
                    width={620}
                    destroyOnClose={true}
                    >
                    <Form {...formItemLayout}>
                        <Form.Item label="唯一标识">
                            {getFieldDecorator('propId', {
                                rules: [{
                                    required: true,
                                    message: '请输入唯一标识',
                                },{
                                    validator(rule, value, callback) {
                                        let regex = new RegExp("^[0-9a-zA-Z_]{1,}$");
                                        let res = regex.test(value)
                                        if (value) {
                                            if (!res) {
                                                callback('请输入下划线/数字/英文字母')
                                                return
                                            }
                                        }
                                        callback()
                                    }
                                }],
                                initialValue: type === 'edit' ? propId : ''
                            })
                                (<Input placeholder="下划线/数字/英文字母"/>)
                            }
                        </Form.Item>
                        <Form.Item label="名称">
                            {getFieldDecorator('propName', {
                                rules: [{
                                    required: true,
                                    message: '请输入名称',
                                }],
                                initialValue: type === 'edit' ? propName : ''
                            })
                                (<Input />)
                            }
                        </Form.Item>
                    </Form>
                </Modal>

                <Modal
                    title={type === 'add' ? '新增分组' : '编辑分组'}
                    visible={this.state.showCreateGroupModal}
                    onOk={this.handleSubmitCreateGroupModal}
                    onCancel={this.hideCreateGroupModal}
                    width={620}
                    destroyOnClose={true}
                    >
                    <Form {...formItemLayout}>
                        <Form.Item label="唯一标识">
                            {getFieldDecorator('propId', {
                                rules: [{
                                    required: true,
                                    message: '请输入唯一标识',
                                },{
                                    validator(rule, value, callback) {
                                        let regex = new RegExp("^[0-9a-zA-Z_]{1,}$");
                                        let res = regex.test(value)
                                        if (value) {
                                            if (!res) {
                                                callback('请输入下划线/数字/英文字母')
                                                return
                                            }
                                        }
                                        callback()
                                    }
                                }],
                                initialValue: type === 'edit' ? propId : ''
                            })
                                (<Input placeholder="下划线/数字/英文字母"/>)
                            }
                        </Form.Item>
                        <Form.Item label="名称">
                            {getFieldDecorator('propName', {
                                rules: [{
                                    required: true,
                                    message: '请输入名称',
                                }],
                                initialValue: type === 'edit' ? propName : ''
                            })
                                (<Input />)
                            }
                        </Form.Item>
                        {
                            name === 'group' ?
                            <Form.Item label="值">
                                {getFieldDecorator('propValue', {
                                    // rules: [{
                                    //     required: true,
                                    //     message: '请输入值',
                                    // }],
                                    initialValue: type === 'edit' ? propValue : ''
                                })
                                    (<Input />)
                                }
                            </Form.Item> :
                            null
                        }
                    </Form>
                </Modal>
            </div>
        );
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        customAttributeList: state.customAttributeList,
        customGroupList: state.customGroupList,
    }
}

const AttrIndex = Form.create({ name: 'addAttr' })(attribute)

export default connect(mapStateToProps)(AttrIndex);