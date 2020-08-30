import React, { Component } from 'react';
import { Select } from 'antd';
import xFetch from '../../util/xFetch';
import _ from 'lodash';

const Option = Select.Option;
const filter = (input, option) => {
    return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
}

// 传入静态的选项值或者根据URL一次性加载完选项值
class PlainSelector extends Component {
    constructor(props) {
        super(props);

        const value = props.value || {};
        // 组件的state值将作为form的值传递给FormItem
        this.state = {
            data: value.data || [],
            value: value.value || [],
            fetching: false,
            forceState: false
        };
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (prevState.forceState === true) {
            return {
                ...prevState,
                forceState: false
            };
        }

        // 受控组件才有钩子函数，这里setState目的是把更新后的表单值显示在Select输入框里
        if ('value' in nextProps && !_.isEmpty(nextProps.value)) {
            if (!_.isEqual(nextProps.value.value, prevState.value) || !_.isEqual(nextProps.value.data, prevState.data)) {
                return {
                    ...nextProps.value
                };
            } else {
                return null;
            }
        }
        return null;
    }

    componentDidMount() {
        let { forceOuterData, contentType, method = 'get', dataUrl, params = {},
            data = [], selectedValue = [], selectFirstData } = this.props;
        // 例外情况，下拉框的数据源和选中值全部由外界传入静态表单值，进入getDerivedStateFromProps赋值
        if (forceOuterData === true) {
            return;
        }
        if (_.toLower(method) !== 'get' && !contentType) {
            contentType = 'application/x-www-form-urlencoded';
        }
        contentType = contentType || 'application/json;charset=utf-8';

        if (dataUrl) {
            this.setState({ fetching: true });
            xFetch(dataUrl, {
                data: params,
                method: method,
                headers: {
                    'Content-Type': contentType
                }
            }).then((result) => {
                let data = _.map(result, (item) => {
                    return {
                        value: item.value,
                        text: item.text
                    };
                });
                if (selectFirstData === true) {
                    selectedValue = data[0] && data[0].value || selectedValue;
                }
                this.setState({
                    data: data,
                    value: selectedValue,
                    fetching: false,
                    forceState: true
                });
                this.handleChange(selectedValue);
            });
        } else {
            this.setState({
                data: data,
                value: selectedValue,
                forceState: true
            });
            this.handleChange(selectedValue);
        }
    }

    handleChange = (value) => {
        if (_.isUndefined(value) || _.isNull(value)) {
            value = [];
        } else if (!_.isArray(value)) {
            value = [value];
        }
        if (!('value' in this.props)) {
            this.setState({
                value
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

    handleSelect = (value, option) => {
        const { onSelect } = this.props;
        if (_.isFunction(onSelect)) {
            onSelect(value, option)
        }
    }

    handleDeSelect = (value, option) => {
        const { onDeselect } = this.props;
        if (_.isFunction(onDeselect)) {
            onDeselect(value, option)
        }
    }

    render() {
        const { data, value, fetching } = this.state;
        const { mode, placeholder, style, showArrow = true, allowClear = true, showSearch = true,
            disabled = false, filterOption = filter, optionFilterProp, optionLabelProp, ...restProps } = this.props;
        const options = _.map(data, d => <Option key={d.value} value={d.value}>{d.text}</Option>);
        return (
            <Select
                {...restProps}
                allowClear={allowClear}
                disabled={disabled}
                loading={fetching}
                showSearch={showSearch}
                value={value}
                tokenSeparators={[',']}
                mode={mode} // tags || multiple
                placeholder={placeholder}
                style={style}
                optionFilterProp={optionFilterProp || 'children'}
                optionLabelProp={optionLabelProp || 'children'}
                defaultActiveFirstOption={false}
                showArrow={showArrow}
                filterOption={filterOption}
                onChange={this.handleChange.bind(this)}
                onSelect={this.handleSelect.bind(this)}
                onDeselect={this.handleDeSelect.bind(this)}
            >
                {options}
            </Select>
        );
    }
}

export { PlainSelector };