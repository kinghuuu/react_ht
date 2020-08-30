import React, { Component, Fragment } from 'react';
import moment from 'moment';
import _ from 'lodash';
import { Form, Row, Col, InputNumber, Input, Select, DatePicker, Button } from 'antd'
import { PlainSelector } from '../../components/selector/selector';
import { EditSelect } from '../../components/editselect/editselect';
import { ContextPath } from '../../constants';
import { FIXED_PROPERTIES, DYNAMIC_PROPERTIES, RELATION_PROPERTIES } from '../modelConfig/common'
const FormItem = Form.Item,
    spanLeft = 22, spanRight = 2,
    initFormItemLayout = {
        labelCol: { span: 5 },
        wrapperCol: { span: 19 }
    };



const renderFormItems = (fromItemsData = {}) => {

    const {
        systemId,
        prefix, form = {}, list,
        formItemLayout = initFormItemLayout,
    } = fromItemsData;
    const { getFieldDecorator, getFieldValue, setFieldsValue } = form;


    //  循环各模板下多个的文本、下拉框组合时添加删除行
    const addContent = (params, evt) => {
        const { keysName } = params;
        let keys = getFieldValue(keysName);

        let lastKey = keys[keys.length - 1];
        let newKeys = [...keys, lastKey + 1];
        setFieldsValue({
            [keysName]: newKeys
        });
    }
    const delContent = (params, evt) => {
        const { keysName, operationKey } = params;
        let keys = getFieldValue(keysName);
        let newKeys = _.filter(keys, key => key !== operationKey);
        setFieldsValue({
            [keysName]: newKeys
        });
    }

    const showOperationBtns = (params) => {
        const { showAddBtn = false, showDelBtn = false, nodeType } = params;
        if (showAddBtn) {
            return (
                <Col span={spanRight}>
                    <FormItem>
                        <Button
                            type='primary'
                            icon='plus'
                            size='small'
                            style={{ marginLeft: '16px', background: '#87d068', borderColor: '#87d068' }}
                            onClick={addContent.bind(this, params)}
                        ></Button>
                    </FormItem>
                </Col>
            );
        }
        if (showDelBtn) {
            return (
                <Col span={spanRight}>
                    <FormItem>
                        <Button
                            type='danger'
                            icon='close'
                            size='small'
                            style={{ marginLeft: '16px' }}
                            onClick={delContent.bind(this, params)}
                        ></Button>
                    </FormItem>
                </Col>
            );
        }
        return null;
    }

    const renderNumberFormItem = (params) => {
        const { key, propName, initValue, precision, isRequired, showHint = '' } = params;
        return (<Row key={key}>
            <Col span={spanLeft}>
                <FormItem label={propName} {...formItemLayout} >
                    {
                        getFieldDecorator(key, {
                            rules: [{ required: isRequired, message: `${propName}不能为空` }],
                            initialValue: initValue
                        })(
                            <InputNumber
                                precision={precision}
                                style={{ width: '100%' }}
                                autoComplete='off'
                                placeholder={showHint}
                            />
                        )
                    }
                </FormItem>
            </Col>
            {showOperationBtns(params)}
        </Row>);
    }

    const renderStringFormItem = (params) => {
        const { key, propName, initValue, isRequired, showHint = '' } = params;
        return (<Row key={key}>
            <Col span={spanLeft}>
                <FormItem label={propName} {...formItemLayout} >
                    {
                        getFieldDecorator(key, {
                            rules: [{ required: isRequired, message: `${propName}不能为空` }],
                            initialValue: initValue
                        })(
                            <Input
                                autoComplete='off'
                                placeholder={showHint}
                            />
                        )
                    }
                </FormItem>
            </Col>
            {showOperationBtns(params)}
        </Row>);
    }

    const renderConfigFormItem = (params) => {
        const { key, propName, initValue, isRequired, showHint = '', cmdbServerType = '', propId } = params;
        let _params = { param: cmdbServerType };
        let dataUrl = `${ContextPath}/cmdbCommon/getParameterList`;
        if (propId === 'logIndex') {
            dataUrl = `${ContextPath}/cmdbModel/getLogInfoBySysId`;
            _params = { systemId };
        }
        return (<Row key={key}>
            <Col span={spanLeft}>
                <FormItem label={propName} {...formItemLayout}>
                    {
                        getFieldDecorator(key, {
                            rules: [
                                {
                                    required: isRequired,
                                    validator: (rule, value, callback) => {
                                        if (rule.required && value && _.isEmpty(value.value)) {
                                            callback(`${propName}不能为空`);
                                        } else {
                                            callback();
                                        }
                                    }
                                }
                            ],
                            initialValue: {
                                data: [],
                                value: initValue ? [initValue] : []
                            }
                        })
                            (
                                <PlainSelector
                                    allowClear={false}
                                    method='get'
                                    placeholder={showHint}
                                    params={_params}
                                    dataUrl={dataUrl}
                                    selectedValue={initValue ? [initValue] : []} />
                            )
                    }
                </FormItem>
            </Col>
            {showOperationBtns(params)}
        </Row>);
    }

    const renderEditConfigFormItem = (params) => {
        const { key, propName, initValue, isRequired, showHint = '', cmdbServerType = '', propId } = params;
        let _params = { param: cmdbServerType };
        let dataUrl = `${ContextPath}/cmdbCommon/getParameterList`;
        return (<Row key={key}>
            <Col span={spanLeft}>
                <FormItem label={propName} {...formItemLayout}>
                    {
                        getFieldDecorator(key, {
                            rules: [{ required: isRequired, message: `${propName}不能为空` }],
                            initialValue: initValue
                        })
                            (
                                <EditSelect
                                    allowClear={false}
                                    method='get'
                                    placeholder={showHint}
                                    attachParams={_params}
                                    dataUrl={dataUrl}
                                />
                            )
                    }
                </FormItem>
            </Col>
        </Row>);
    }

    const renderDateFormItem = (params) => {
        const { key, propName, initValue, isRequired, showHint = '' } = params;
        return (<Row key={key}>
            <Col span={spanLeft}>
                <FormItem label={propName} {...formItemLayout}>
                    {getFieldDecorator(key, {
                        rules: [{ required: isRequired, message: `${propName}不能为空` }],
                        initialValue: initValue
                    })
                        (<DatePicker
                            allowClear={false}
                            placeholder={showHint}
                            style={{ width: '100%', minWidth: '100px' }}
                        />)
                    }
                </FormItem>
            </Col>
        </Row>);
    }

    const renderMultipleFormItem = (data) => {
        let {
            propId = '', propName = '', propValue = '', propType = '',
            isRequired, defaultValue = null, showHint = ''
        } = data;

        let keys = [0],
            propValues = propValue.split('|'),
            propNames = propName.split('|'),
            showHints = showHint.split('|'),
            propTypes = propType.split('|');
        // keys 赋值
        if (!_.isEmpty(propValues)) {
            keys = _.map(propValues, (item, index) => index);
        }
        let keysName = `${prefix}-${propId}-keys`;
        getFieldDecorator(keysName, { initialValue: keys });

        let currentKeys = getFieldValue(keysName) || [];

        return _.map(currentKeys, (key, keyIndex) => {
            let currentValues = propValues[key] || '';
            currentValues = currentValues.split(',');
            return (<Col key={key}>
                <Row>
                    {_.map(propTypes, (_propType, ptIndex) => {
                        let currentValue = currentValues[ptIndex] || '';
                        let [__key, ...initValue] = currentValue.split(':');
                        let _key = `${prefix}-${propId}-${key}-${ptIndex}`
                        let showHint = showHints[ptIndex]
                        let propName = propNames[ptIndex];
                        let newParams = {
                            keysName,
                            operationKey: key,
                            key: _key,
                            propName,
                            initValue: initValue.join(':'),
                            isRequired,
                            showHint,
                            showAddBtn: ptIndex === 0 && keyIndex === 0,
                            showDelBtn: ptIndex === 0 && keyIndex !== 0
                        };

                        let formType = _propType;
                        if (formType.startsWith('number')) {
                            formType = 'number'
                        } else if (formType.includes('config')) {
                            formType = 'config'
                        }

                        switch (formType) {
                            case 'number':
                                let propTypeArry = propType.match(/\(([^)]*)\)/);
                                if (propTypeArry) {
                                    newParams.precision = propTypeArry[1];
                                    newParams.precision = Number.parseInt(newParams.precision);
                                }
                                return renderNumberFormItem(newParams);
                            case 'string':
                                return renderStringFormItem(newParams);
                            case 'config':
                                newParams.cmdbServerType = _propType.match(/\(([^)]*)\)/)[1];
                                return renderConfigFormItem(newParams);
                            default:
                                return null
                        }
                    })}
                </Row>
            </Col>)
        })
    }

    return _.map(list, (item = {}, index) => {
        const { propType = '', isRequired, propId, propValue, defaultValue = '' } = item;
        let formType = propType;
        if (formType.startsWith('number')) {
            formType = 'number'
        } else if (formType.includes('|')) {
            formType = 'multiple'
        }

        let params = { ...item };
        params.isRequired = isRequired === '1';
        params.initValue = params.hasOwnProperty('propValue') ? propValue : defaultValue
        switch (formType) {
            case 'number':
                let propTypeArry = propType.match(/\(([^)]*)\)/);
                if (propTypeArry) {
                    params.precision = propTypeArry[1];
                    params.precision = Number.parseInt(params.precision);
                }
                params.key = `${prefix}-${propId}`;
                return renderNumberFormItem(params);
            case 'string':
                params.key = `${prefix}-${propId}`;
                return renderStringFormItem(params);
            case 'config':
                params.cmdbServerType = params.propId;
                params.key = `${prefix}-${propId}`;
                return renderConfigFormItem(params);
            case 'editConfig':
                params.cmdbServerType = params.propId;
                params.key = `${prefix}-${propId}`;
                return renderEditConfigFormItem(params);
            case 'date':
                params.key = `${prefix}-${propId}`;
                if (params.initValue) {
                    params.initValue = moment(params.initValue, 'YYYY-MM-DD');
                } else {
                    params.initValue = null;
                }
                return renderDateFormItem(params);
            case 'multiple':
                return renderMultipleFormItem(params);
            default:
                return null
        }
    });
}

const findValue = (values, data) => {
    const { propId, propName, propType = '', prefix } = data;
    const fromItemName = `${prefix}-${propId}`;
    let propValue = values[fromItemName] || '';

    let isPrecisionNumber = false, isrMultiple = false, precision = 0;
    if (propType.startsWith('number') && propType !== 'number') {
        // 处理保留多少位小数
        isPrecisionNumber = true
        let propTypeArry = propType.match(/\(([^)]*)\)/);
        precision = propTypeArry[1];
        precision = Number.parseInt(precision);
    }
    if (propType.includes('|')) {
        // 处理数组类型的数据
        isrMultiple = true
    }



    if (_.isObject(propValue)) {
        propValue = propValue.value[0];
    }
    if (isPrecisionNumber) {
        let _propValue = propValue + '';
        let precisionStr = '';
        for (let i = 0; i < precision; i++) {
            precisionStr += '0';
        }
        let [first = '', second = ''] = _propValue.split('.');
        second = second.padEnd(2, precisionStr);
        if (first === '') {
            propValue = ''
        } else {
            if (precision === 0) {
                propValue = `${first}`;
            } else {
                propValue = `${first}.${second}`;
            }
        }
    }

    if (isrMultiple) {
        let keysName = `${prefix}-${propId}-keys`;
        let keys = values[keysName];
        let propTypes = propType.split('|');
        propValue = [];
        _.forEach(keys, key => {
            let arr_value = [];
            _.forEach(propTypes, (pt, ptIndex) => {
                let keyName = `${prefix}-${propId}-${key}-${ptIndex}`;
                let value = values[keyName];
                if (pt.includes('number')) {
                    arr_value.push(`(number)${propId}:${value}`);
                }
                if (pt.includes('string')) {
                    arr_value.push(`(string)${propId}:${value}`);
                }
                if (pt.includes('config')) {
                    value = value.value[0] || '';
                    arr_value.push(`(config)${propId}:${value}`);
                }
            });
            propValue.push(arr_value.join(','))
        });
        propValue = propValue.join('|');
    }
    return { propId, propValue, propName };
}

const getFormItemsValue = (values, dynamicPropertieList = [], relationPropertieList = []) => {

    let dynamicProperties = _.map(dynamicPropertieList, item => {
        item.prefix = DYNAMIC_PROPERTIES;
        return findValue(values, item);
    });
    let relationProperties = _.map(relationPropertieList, (rItem, rIndex) => {
        const { nodeId } = rItem;
        let propertyDetailList = _.map(rItem.propertyDetailList, (item, index) => {
            item.prefix = `${RELATION_PROPERTIES}-${nodeId || rIndex}`;
            return findValue(values, item);
        });

        return {
            ...rItem,
            propertyDetailList
        };
    });

    return { dynamicProperties, relationProperties };
}

export { renderFormItems, getFormItemsValue }