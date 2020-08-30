import React, { Component } from 'react';
import { Cascader } from 'antd';
import _ from 'lodash';

const filter = (inputValue, path) => {
    return (path.some(option => (option.label).toLowerCase().indexOf(inputValue.toLowerCase()) > -1));
};

// 传入静态的选项值或者根据URL一次性加载完选项值
class PlainCascader extends Component {
    constructor(props) {
        super(props);
        const value = props.value || {};
        // 组件的state值将作为form的值传递给FormItem
        this.state = {
            data: value.data || [],
            value: value.value || []
        };
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        // 受控组件才有钩子函数，这里setState目的是把更新后的表单值显示在Select输入框里
        if ('value' in nextProps) {
            if (!_.isEqual(nextProps.value.value, prevState.value)) {
                return {
                    ...(nextProps.value || {})
                };
            } else {
                return null;
            }
        }
        return null;
    }

    componentDidMount() {
        let { data } = this.props;
        this.setState({
            data: data
        });
    }

    handleChange = (value, selectedOptions) => {
        if (!_.isArray(value)) {
            value = [value];
        }
        if (!('value' in this.props)) {
            this.setState({
                value,
                fetching: false
            });
        }
        this.triggerChange({ value });
    }

    triggerChange = (changedValue) => {
        // 调用getFieldDecorator包装的trigger事件，默认是onChange事件，目的是赋值给外层form
        const onChange = this.props.onChange;
        if (onChange) {
            onChange(Object.assign({}, this.state, changedValue));
        }
    }

    render() {
        const { data, value } = this.state;
        const { placeholder, style, showSearch = filter } = this.props;
        const options = data.map(d => <Option key={d.value} value={d.value}>{d.text}</Option>);
        return (
            <Cascader
                allowClear
                showSearch={showSearch}
                value={value}
                options={options}
                placeholder={placeholder}
                style={style}
                onChange={this.handleChange.bind(this)}
            />
        );
    }
}

export { PlainCascader };