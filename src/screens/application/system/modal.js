import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Form, Input, Select, Button, Collapse, Row, Col } from 'antd';
import { detailProgramAction, programTypeAction, addApplicationAction, editProgramAction, saveRelationValue, getRelationValue } from '../../../actions/application/action'
import { PlainSelector } from '../../../components/selector/selector';
import { ContextPath } from '../../../constants';
const { Option } = Select;
const { TextArea } = Input;
const { Panel } = Collapse;
const FormItem = Form.Item;

class modal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            typeList: [],
            info: [],
            id: '',
        };
    }

    getPropertyDetail = (programId, nodeType, propertyList) => {
        let { form: { validateFields } } = this.props;
        let propertyDetailList = [];
        validateFields((error, fieldsValue) => {
            if (error) {
                return;
            }
            // 获取该模板下的表单属性值
            for (let keytemp in fieldsValue) {
                if (keytemp.startsWith(`${nodeType}${programId}#`)) {
                    let property = keytemp.split('#')[1],//logType
                        tempVal = '';
                    let arrayValue = fieldsValue[keytemp] || '';
                    if (arrayValue.data && arrayValue.value) {
                        tempVal = arrayValue.value[0];
                    } else if (_.isArray(arrayValue)) {
                        //数组时，下拉框与文本组合多种情况，数据拼接
                        let curPropType = '';//config(logType)|string
                        _.isArray(propertyList) && propertyList.forEach((prop) => {
                            if (prop.propId == property) {
                                curPropType = prop.propType
                            }
                        });

                        let tArr = [];
                        let propTypeArr = curPropType.split('|');//[config(logType),string]
                        let valLen = arrayValue.length;
                        if (valLen > 0 && propTypeArr.length == valLen) {
                            //arrayValue值长度即为类型prop长度；
                            //arrayValue[0]长度为页面输入项 行数
                            arrayValue[0].forEach((val, index) => {
                                let typeVal = '', configVal = '';
                                // 拼接规则 (config)logType:错误日志,(string)logType:/home/logs/errorLog1|
                                for (let i = 0; i < valLen; i++) {
                                    let type = propTypeArr[i];
                                    if (type == 'string') {
                                        typeVal += `(${type})${property}:` + arrayValue[i][index] || '';
                                    } else {
                                        if (arrayValue[i][index] && arrayValue[i][index].data) {
                                            configVal = _.isEmpty(arrayValue[i][index].value[0]) ? '' : arrayValue[i][index].value[0];
                                        } else {
                                            configVal = _.isEmpty(arrayValue[i][index]) ? '' : arrayValue[i][index];
                                        }
                                        typeVal += `(config)${property}:${configVal}`;

                                    }
                                    if (i < (valLen - 1)) {
                                        typeVal += ',';
                                    }
                                }
                                tArr.push(typeVal);
                            });
                        }
                        tempVal = tArr.join('|');
                    } else {
                        tempVal = arrayValue;
                    }
                    propertyDetailList.push({
                        propId: property,
                        propValue: tempVal
                    });
                }
            }
        });
        return propertyDetailList;
    }

    submit = () => {
        let { form } = this.props;
        const { systemId, type, detailProgramList } = this.props;
        if (type == 'add') {
            form.validateFields(['name', 'type', 'port'], (error, values) => {
                if (error) { return; }
            });
        }
        form.validateFieldsAndScroll((err, values) => {
            if ((type == 'edit') && err) { return; }
            this.setState({ disableSubmit: true });
            const propArr = ['account', 'description', 'name', 'path', 'port', 'remark', 'type', 'modifyDesc'];
            let newValues = {};
            let formValues = form.getFieldsValue();
            let newFormValues = [];
            let { info } = this.state;
            let finalInfo = [];
            newFormValues = _.map(formValues, (value, idx) => {
                if (idx.indexOf('custom') !== -1) {
                    return {
                        propName: info[idx.slice(6)].propName,
                        propValue: value
                    }
                };
            });
            for (let key in newFormValues) {
                if (newFormValues[key] !== undefined) {
                    finalInfo.push(newFormValues[key])
                }
            }
            for (let item in values) {
                if (propArr.indexOf(item) !== -1) {
                    newValues[item] = values[item];
                }
            }
            let valuesList = _.map(newValues, (value, index) => {
                return { propId: index, propValue: value }
            });


            if (type === 'add') {
                valuesList.push({ propId: "id", propValue: 0 });
                addApplicationAction(systemId, valuesList, (id) => {
                    this.props.handleCancel()
                    this.props.requestTreeData(id)
                })
            } else if (type === 'edit') {
                // 编辑信息
                let id = detailProgramList.fixedMap.id
                let baseparams = {}
                valuesList.push({ propId: "id", propValue: id });
                baseparams.fixedProperties = valuesList;
                baseparams.dynamicProperties = finalInfo;

                // 联动属性值模板 部分
                const { relationValueList } = this.props
                let saveParams = [];
                relationValueList.forEach(relationItem => {
                    let param = {
                        nodeType: relationItem.nodeType,
                        parentId: id,
                        nodeId: relationItem.nodeId,
                        programName: detailProgramList.fixedMap.name,
                        propertyDetailList: this.getPropertyDetail(id, relationItem.nodeType, relationItem.propertyDetailList)
                    }
                    saveParams.push(param);
                });
                let { itimpParams } = this.props;

                editProgramAction(systemId, id, baseparams, (res) => {
                    // 保存模板接口
                    saveRelationValue(saveParams, (res) => {
                        this.onClose();
                        this.props.dispatch(getRelationValue({ parentId: detailProgramList.fixedMap.id }));
                        // 判断若从 IT工作台的日志配置跳转 则保存成功后返回到日志配置页
                        if (itimpParams) {
                            window.top.postMessage({
                                action: 'refreshTab',
                                src: 'http://eip.htsc.com.cn/itimp/iscs/#/independent/logConfig'
                            }, '*');
                            window.top.postMessage({
                                action: 'addTab',
                                key: 'iscs/72965/72967',
                                title: '日志配置',
                                src: 'http://eip.htsc.com.cn/itimp/iscs/#/independent/logConfig',
                                params: {},
                                fixKey: true
                            }, '*');
                            window.top.postMessage({
                                action: 'removeTab',
                                key: 'cmdb/5218/5220',
                                src: 'http://eip.htsc.com.cn/itimp/cmdb/#/independent/application/index'
                            }, '*');
                        }
                    }, () => {
                        this.setState({ disableSubmit: false });
                    });
                    this.props.dispatch(detailProgramAction(systemId, id))
                });
            }
        });
    }

    onClose = () => {
        this.props.getType('view')
    }

    requestType = () => {
        programTypeAction((res) => {
            this.setState({
                typeList: res
            })
        })
    }

    changeInfo = (key, e) => {
        let { info } = this.state
        let val = e.target.value
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.detailProgramList.fixedMap) {
            const { id } = nextProps.detailProgramList.fixedMap;
            if (id !== prevState) {
                return {
                    info: nextProps.detailProgramList.info
                }
            } else {
                return null;
            }
        } else {
            return null
        }
    }

    componentDidMount() {
        if (this.props.onRef) {
            this.props.onRef(this)
        }
        this.requestType()
    }

    //  循环各模板下多个的文本、下拉框组合时添加删除行
    addContent = (curNodeType, property) => {
        const { form: { setFieldsValue, getFieldValue }, relationValueList } = this.props;
        relationValueList.forEach((item) => {
            if (item.nodeType == curNodeType) {
                const complexKeys = _.isEmpty(getFieldValue(`complexKeys${item.nodeType}#${property.propId}`)) ? [] : [...getFieldValue(`complexKeys${item.nodeType}#${property.propId}`)];
                const nextKeys = _.concat(complexKeys, complexKeys[complexKeys.length - 1] + 1);
                setFieldsValue({
                    [`complexKeys${item.nodeType}#${property.propId}`]: nextKeys
                });
            }
        });
    }

    delContent = (k, curNodeType, property) => {
        const { form: { setFieldsValue, getFieldValue }, relationValueList } = this.props;
        relationValueList.forEach((item) => {
            if (item.nodeType == curNodeType) {
                const curKeys = _.isEmpty(getFieldValue(`complexKeys${item.nodeType}#${property.propId}`)) ? [] : [...getFieldValue(`complexKeys${item.nodeType}#${property.propId}`)];
                setFieldsValue({
                    [`complexKeys${item.nodeType}#${property.propId}`]: _.filter(curKeys, key => key !== k)
                });
            }
        });
    }

    //复杂的文本与下拉框组合时，属性值加以_string 和 _config
    getMultipleContent = (programId, item, property) => {
        const formItemLayout2 = {
            labelCol: { span: 5 },
            wrapperCol: { span: 16 }
        };
        const { getFieldDecorator, getFieldValue } = this.props.form;
        let arrayProperty = property.propValue && property.propValue.split('|') || [0]; // 初始多少行
        let initArr = [...Array(arrayProperty.length).keys()];
        getFieldDecorator(`complexKeys${item.nodeType}#${property.propId}`, { initialValue: initArr });
        const complexKeys = _.isEmpty(getFieldValue(`complexKeys${item.nodeType}#${property.propId}`)) ? [] : getFieldValue(`complexKeys${item.nodeType}#${property.propId}`);
        //  example： (config)logType:错误日志,(string)logType:1|(config)logType:运行日志,(string)logType:2

        const { propId, propName = '', propType = '', showHint = '', } = property;
        return _.map(complexKeys, (k, keyindex) => {
            return (<Row key={`complexKeys${item.nodeType}#${propId}${keyindex}`}>
                {_.map(propType.split('|'), (both, index) => (
                    <Col key={`colKeys#${propId}${keyindex}#${index}`} span={20}>
                        <div>
                            {(both.startsWith('number')) && <FormItem label={propName.includes('|') ? propName.split('|')[index] : propName}  {...formItemLayout2}>
                                {
                                    getFieldDecorator(`${item.nodeType}${programId}#${propId}[${index}][${k}]`, {
                                        rules: [
                                            { validator: this.isNumber.bind(this, propType.split('|')[index]) },
                                            { required: property.isRequired === '1' ? true : false, message: `${propName.includes('|') ? propName.split('|')[index] : propName}不能为空` }
                                        ],
                                        initialValue: arrayProperty[k] && arrayProperty[k].split(',')[index] && arrayProperty[k].split(',')[index].split(':')[1] || ''
                                    })(
                                        <Input type="number" autoComplete='off' placeholder={`${showHint.includes('|') && showHint.split('|')[index] || showHint}`} />
                                    )
                                }
                            </FormItem>
                            }
                        </div>
                        <div>
                            {(both == 'string') && <FormItem label={propName.includes('|') ? propName.split('|')[index] : propName}  {...formItemLayout2}>
                                {
                                    getFieldDecorator(`${item.nodeType}${programId}#${propId}[${index}][${k}]`, {
                                        rules: [{
                                            required: property.isRequired === '1' ? true : false, message: `${propName.includes('|') ? propName.split('|')[index] : propName}不能为空`
                                        }],
                                        initialValue: arrayProperty[k] && arrayProperty[k].split(',')[index] && arrayProperty[k].split(',')[index].split(':')[1] || ''
                                    })(
                                        <Input autoComplete='off' placeholder={`${showHint.includes('|') && showHint.split('|')[index] || showHint}`} />
                                    )
                                }
                            </FormItem>
                            }
                        </div>
                        <div>
                            {(/config.*/.test(both)) && <FormItem label={propName.includes('|') ? propName.split('|')[index] : propName}  {...formItemLayout2}>
                                {
                                    getFieldDecorator(`${item.nodeType}${programId}#${propId}[${index}][${k}]`, {
                                        rules: [{
                                            required: property.isRequired === '1' ? true : false,
                                            validator: (rule, value, callback) => {
                                                if (rule.required && value && _.isEmpty(value.value)) {
                                                    callback(`${propName.includes('|') ? propName.split('|')[index] : propName}不能为空`);
                                                } else {
                                                    callback();
                                                }
                                            }
                                        }],
                                        initialValue: {
                                            data: [],
                                            value: (arrayProperty[k] && arrayProperty[k].split(',')[index] && arrayProperty[k].split(',')[index].split(':')[1]) ? [arrayProperty[k].split(',')[index].split(':')[1]] : []
                                        }
                                    })
                                        (
                                            <PlainSelector
                                                allowClear={false}
                                                method='get'
                                                placeholder={`${showHint.includes('|') && showHint.split('|')[index] || showHint}`}
                                                params={{ cmdbServerType: both.match(/\(([^)]*)\)/)[1] }}
                                                dataUrl={`${ContextPath}/cmdbForService/getServiceType`}
                                                selectedValue={(arrayProperty[k] && arrayProperty[k].split(',')[index] && arrayProperty[k].split(',')[index].split(':')[1]) ? [arrayProperty[k].split(',')[index].split(':')[1]] : []} />
                                        )
                                }
                            </FormItem>
                            }
                        </div>
                    </Col>
                ))
                }
                <Col span={2} style={{ lineHeight: '38px' }}>
                    {
                        (keyindex == 0) ? <Button
                            type='primary'
                            icon='plus'
                            size='small'
                            style={{ background: '#87d068', borderColor: '#87d068' }}
                            onClick={this.addContent.bind(this, item.nodeType, property)}></Button>
                            :
                            <Button
                                type='danger'
                                icon='close'
                                size='small'
                                onClick={this.delContent.bind(this, k, item.nodeType, property)}></Button>
                    }
                </Col>
            </Row>)
        });
    }

    isNumber = (proptype, rule, value, callback) => {
        let num = value && value.split('.')[1] && value.split('.')[1].length || 0;
        let propNum = proptype.match(/\(([^)]*)\)/)[1];
        if (value && propNum && (num != propNum)) {
            return callback(`请保留${propNum}位小数`);
        }
        return callback();
    }

    render() {
        const { typeList, disableSubmit } = this.state;
        const { getFieldDecorator } = this.props.form;
        const { type, detailProgramList, relationValueList } = this.props;
        let programId = detailProgramList && detailProgramList.fixedMap && detailProgramList.fixedMap.id || '';
        let formItemLayout = {};
        if (type === 'edit') {
            formItemLayout = {
                labelCol: {
                    xs: { span: 24 },
                    sm: { span: 4 },
                },
                wrapperCol: {
                    xs: { span: 24 },
                    sm: { span: 18 },
                },
            }
        } else {
            formItemLayout = {
                labelCol: {
                    xs: { span: 24 },
                    sm: { span: 5 },
                },
                wrapperCol: {
                    xs: { span: 24 },
                    sm: { span: 17 },
                },
            }
        }

        const tailFormItemLayout = {
            wrapperCol: {
                xs: {
                    span: 24,
                    offset: 0,
                },
                sm: {
                    span: 16,
                    offset: 8,
                },
            },
        }

        // 联动属性模板展示，文本和下拉框组合情况：以| 分割属性名称，属性值
        const templateList = _.map(relationValueList, (item, index) => (
            <Panel header={item.nodeType} key={`eidttemplate${index}`}>
                {
                    _.map(item.propertyDetailList, (property, index) => (
                        <div key={`template${index}`}>
                            {
                                (property.propType.startsWith('number')) && <FormItem label={property.propName}>
                                    {
                                        getFieldDecorator(`${item.nodeType}${programId}#${property.propId}`, {
                                            rules: [
                                                { required: property.isRequired === '1' ? true : false, message: `${property.propName}不能为空` },
                                                { validator: this.isNumber.bind(this, property.propType) }
                                            ],
                                            initialValue: property.hasOwnProperty('propValue') ? property.propValue : property.defaultValue
                                        })(
                                            <Input type="number" autoComplete='off' placeholder={`${property.showHint || ''}`} />
                                        )
                                    }
                                </FormItem>
                            }
                            {
                                (property.propType == 'string') && <FormItem label={property.propName}>
                                    {
                                        getFieldDecorator(`${item.nodeType}${programId}#${property.propId}`, {
                                            rules: [
                                                { required: property.isRequired === '1' ? true : false, message: `${property.propName}不能为空` }
                                            ],
                                            initialValue: property.hasOwnProperty('propValue') ? property.propValue : property.defaultValue
                                        })(
                                            <Input autoComplete='off' placeholder={`${property.showHint || ''}`} />
                                        )
                                    }
                                </FormItem>
                            }
                            {
                                (property.propType == 'config') && <FormItem label={property.propName}>
                                    {
                                        getFieldDecorator(`${item.nodeType}${programId}#${property.propId}`, {
                                            rules: [
                                                {
                                                    required: property.isRequired === '1' ? true : false,
                                                    validator: (rule, value, callback) => {
                                                        if (rule.required && value && _.isEmpty(value.value)) {
                                                            callback(`${property.propName}不能为空`);
                                                        } else {
                                                            callback();
                                                        }
                                                    }
                                                }
                                            ],
                                            initialValue: {
                                                data: [],
                                                value: (property.hasOwnProperty('propValue') && property.propValue) ? [property.propValue] : (property.defaultValue ? [property.defaultValue] : [])
                                            }
                                        })
                                            (
                                                <PlainSelector
                                                    allowClear={false}
                                                    method='get'
                                                    placeholder={`${property.showHint || ''}`}
                                                    params={{ cmdbServerType: property.propId }}
                                                    dataUrl={`${ContextPath}/cmdbForService/getServiceType`}
                                                    selectedValue={(property.hasOwnProperty('propValue') && property.propValue) ? [property.propValue] : (property.defaultValue ? [property.defaultValue] : [])} />
                                            )
                                    }
                                </FormItem>
                            }
                            {
                                property.propType.includes('|') && this.getMultipleContent(programId, item, property)
                            }
                        </div>
                    ))
                }
            </Panel>
        ));

        return (
            <div>
                <h3 style={{ marginBottom: 15 }}>基本信息</h3>
                <Form {...formItemLayout}>
                    <Form.Item label="程序名称">
                        {getFieldDecorator('name', {
                            rules: [{
                                required: true,
                                message: '请输入程序名称',
                            }],
                            initialValue: type === 'edit' ? detailProgramList.fixedMap.name : ''
                        })
                            (<Input />)
                        }
                    </Form.Item>

                    <Form.Item label="程序类型">
                        {getFieldDecorator('type', {
                            rules: [{
                                required: true,
                                message: '请选择程序类型',
                            }],
                            initialValue: type === 'edit' ? detailProgramList.fixedMap.type : ''
                        })
                            (
                                <Select>
                                    {
                                        typeList.map((item, index) => {
                                            return (
                                                <Option value={item.text} key={item.value}>{item.text}</Option>
                                            )
                                        })
                                    }
                                </Select>
                            )
                        }
                    </Form.Item>

                    <Form.Item label="部署路径">
                        {getFieldDecorator('path', {
                            initialValue: type === 'edit' ? detailProgramList.fixedMap.path : ''
                        })
                            (<Input />)
                        }
                    </Form.Item>
                    <Form.Item label="部署帐户">
                        {getFieldDecorator('account', {
                            initialValue: type === 'edit' ? detailProgramList.fixedMap.account : ''
                        })
                            (<Input />)
                        }
                    </Form.Item>
                    <Form.Item label="端口">
                        {getFieldDecorator('port', {
                            rules: [{
                                validator(rule, value, callback) {
                                    if (value) {
                                        let valueItem = value.split(',');
                                        _.map(valueItem, (item) => {
                                            if (Number(item) < 0 || Number(item) > 65536 || isNaN(Number(item))) {
                                                callback('端口范围值为0 ~ 65536')
                                                return
                                            }
                                        })
                                    }
                                    callback()
                                }
                            }],
                            initialValue: type === 'edit' ? detailProgramList.fixedMap.port : ''
                        })
                            (<Input />)
                        }
                        <div style={{ lineHeight: '12px', color: '#f5222d' }}>多个端口请用英文逗号隔开</div>
                    </Form.Item>
                    <Form.Item label="描述信息">
                        {getFieldDecorator('description', {
                            initialValue: type === 'edit' ? detailProgramList.fixedMap.description : ''
                        })
                            (<TextArea rows={4} />)
                        }
                    </Form.Item>
                    <Form.Item label="备注信息">
                        {getFieldDecorator('remark', {
                            initialValue: type === 'edit' ? detailProgramList.fixedMap.remark : ''
                        })
                            (<TextArea rows={4} />)
                        }
                    </Form.Item>

                    {
                        this.props.type === 'edit' ?
                            <div>
                                <Form.Item label="变更描述">
                                    {getFieldDecorator('modifyDesc', {
                                        rules: [{
                                            required: true,
                                            message: '请填写变更描述',
                                        }],
                                        initialValue: ''
                                    })
                                        (<TextArea rows={4} />)
                                    }
                                </Form.Item>

                                <h3 style={{ marginBottom: 15 }}>自定义信息</h3>
                                {
                                    detailProgramList.info.map((item, index) => {
                                        return (
                                            <Form.Item label={item.propName} key={index}>
                                                {getFieldDecorator(`custom${index}`, {
                                                    initialValue: item.propValue
                                                })
                                                    (<Input onChange={this.changeInfo.bind(this, index)} />)
                                                }
                                            </Form.Item>
                                        )
                                    })
                                }
                                <Collapse bordered={false}>
                                    {templateList}
                                </Collapse>

                                <Form.Item {...tailFormItemLayout}>
                                    {
                                        disableSubmit ?
                                            <Button type="primary" disabled>
                                                保存
                                        </Button> :
                                            <Button type="primary" onClick={this.submit}>
                                                保存
                                        </Button>
                                    }
                                    <Button style={{ marginLeft: 30, }} onClick={this.onClose}>
                                        取消
                                    </Button>
                                </Form.Item>
                            </div> : null
                    }
                </Form>
            </div>

        );
    }
}

const Application = Form.create({ name: 'add' })(modal)
const mapStateToProps = (state, ownProps) => {
    return {
        detailProgramList: state.detailProgramList || [],
        relationValueList: state.relationValueList ? state.relationValueList : []
    }
}

export default connect(mapStateToProps)(Application);