import React, { Component } from 'react';
import { Menu, Dropdown, Input, Icon } from 'antd';
import { RenderEmpty } from '../../util/util';
import xFetch from '../../util/xFetch';
import _ from 'lodash';

const Item = Menu.Item;

class EditSelect extends Component {
    constructor(props) {
        super(props);
        const value = props.value || '';
        // 组件的state值将作为form的值传递给FormItem
        this.state = {
            data: [],
            value: value.value || '',
            fetching: false
        };
        this.lastFetchId = 0; // 请求时序控制
        this.fetch = _.debounce(this.fetch, 500); // 节流控制
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        // if (prevState.fetching === true) {
        //     return null;
        // }
        // 受控组件才有钩子函数，这里setState目的是把更新后的表单值显示在Select输入框里
        if ('value' in nextProps && !_.isEmpty(nextProps.value)) {
            if (!_.isEqual(nextProps.value, prevState.value)) {
                return {
                    value: nextProps.value || ''
                };
            } else {
                return null;
            }
        }
        return null;
    }

    componentDidMount() {
        this.fetch();
    }

    fetch = (value = '') => {
        const url = this.props.dataUrl;
        const { method = 'post', queryName = 'query', attachParams = {} } = this.props;
        let params = {
            [queryName]: value,
            ...attachParams
        };
        this.lastFetchId += 1;
        let fetchId = this.lastFetchId;

        this.setState({ data: [], fetching: true });
        xFetch(url, {
            data: params,
            method: method,
            headers: {
                'Content-Type': method === 'post' ? 'application/x-www-form-urlencoded' : 'application/json;charset=utf-8'
            }
        }).then(result => {
            if (fetchId !== this.lastFetchId) {
                return;
            }
            let data = [];
            if (_.isArray(result.rows)) {
                data = _.map(result.rows, item => item.value);
            } else {
                data = _.map(result, item => item.value);
            }
            this.setState({
                data,
                fetching: false
            });
        });
    }

    triggerChange = (changedValue) => {
        // 调用getFieldDecorator包装的trigger事件，默认是onChange事件，目的是赋值给外层form
        const onChange = this.props.onChange;
        if (onChange) {
            onChange(changedValue);
        }
    }

    handleSelect = (selecdtData = {}) => {
        const { onChange } = this.props;
        let value = selecdtData.key || '';
        if (_.isFunction(onChange)) {
            onChange(value)
        }
        this.setState(() => ({ value }));
    }

    handleChanged = (evt) => {
        const { onChange, alwaysQuery = false } = this.props;
        let value = evt.target.value;
        if (_.isFunction(onChange)) {
            onChange(value);
        }
        if (alwaysQuery) {
            this.fetch(value);
        }
        this.setState(() => ({ value }));
    }

    handleDeSelect = (value, option) => {
        const { onDeselect } = this.props;
        if (_.isFunction(onDeselect)) {
            onDeselect(value, option)
        }
    }

    renderMenu = () => {
        const { data } = this.state;
        return (
            <Menu onClick={this.handleSelect} >
                {
                    _.isEmpty(data) ? (
                        RenderEmpty()
                    ) : (
                            _.map(data, item => {
                                return <Item key={item}>{item}</Item>
                            })
                        )
                }
            </Menu>
        );
    }

    render() {
        const { value, fetching = false } = this.state;
        const { maxLength, size = 'default', style, disabled = false, allowClear = false, placeholder } = this.props;

        return (
            <Dropdown overlay={this.renderMenu()} trigger={['click']}>
                <Input
                    value={value}
                    onChange={this.handleChanged}
                    suffix={fetching ? <Icon type="loading" /> : null}
                    disabled={disabled}
                    maxLength={maxLength}
                    size={size}
                    allowClear={allowClear}
                    style={style}
                    placeholder={placeholder}
                />
            </Dropdown>
        );
    }
}

export { EditSelect };