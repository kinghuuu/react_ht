import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { Row, Col, Form, Input, Button } from 'antd';
import { ContextPath } from '../../../constants';
import { PlainSelector } from '../../../components/selector/selector';

const FormItem = Form.Item;

class SelfDefineSearch extends Component {
    constructor(props) {
        super(props);
        this.state = {
            systemId: '',
            nodeType: '',
        };
    }

    getValue = () => {
        const { form: { getFieldsValue }, queryList } = this.props;
        let values = getFieldsValue();
        let valueList = [];
        queryList.forEach(item => {
            let { propId } = item;
            if (values[propId]) {
                let propValue = values[propId];
                if (_.isObject(propValue)) {
                    propValue = propValue.value[0] || ''
                }
                valueList.push({ propId, propValue });
            }
        })
        return valueList
    }

    resetValue = () => {
        this.props.form.resetFields()
    }

    handleSearch = (e) => {
        e.preventDefault();
        const { handleSearch } = this.props;
        if (_.isFunction(handleSearch)) {
            handleSearch()
        }
    }

    render() {
        const {
            queryList
        } = this.props;

        const {
            form: { getFieldDecorator },
        } = this.props;

        return (
            <Form layout='inline' onSubmit={this.handleSearch} >
                <Row>
                    {
                        queryList.map(item => {
                            const { id, propId, propName, propType } = item;
                            if (propType === 'config') {
                                return (
                                    <FormItem label={propName} key={id}>
                                        {
                                            getFieldDecorator(propId, {
                                                initialValue: { data: [], value: [] }
                                            })
                                                (
                                                    <PlainSelector
                                                        style={{ width: '200px' }}
                                                        allowClear={true}
                                                        method='get'
                                                        params={{ param: propId }}
                                                        dataUrl={`${ContextPath}/cmdbCommon/getParameterList`}
                                                    />
                                                )
                                        }
                                    </FormItem>
                                )
                            }
                            return (
                                <FormItem label={propName} key={id}>
                                    {getFieldDecorator(propId, {
                                        // initialValue: ''
                                    })
                                        (
                                            <Input
                                                style={{ width: '200px' }}
                                                autoComplete='off'
                                            // placeholder='请选择通讯线路名称'
                                            />
                                        )
                                    }
                                </FormItem>
                            )
                        })
                    }
                </Row>
                <Button htmlType='submit' style={{position:'absolute',left:'-1000px'}} ></Button>
            </Form>
        );
    }
}

SelfDefineSearch = Form.create()(SelfDefineSearch)

export default connect()(SelfDefineSearch);