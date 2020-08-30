import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { Tabs, Dropdown, Menu, Button, Icon } from 'antd';
import _ from 'lodash';
import DashBoard from '../../screens/dashboard/dashboard';
const TabPane = Tabs.TabPane;

class WorkPlace extends Component {
    constructor(props) {
        super(props);

        // tab默认包含首页
        this.state = {
            keys: ['tab/dashboard/dashboard'],
            activeKey: 'tab/dashboard/dashboard',
            activeTitle: '',
            panes: [
                {
                    title: <span>DashBoard</span>,
                    content: <DashBoard addTab={(key, title, path) => this.props.addTab(key, title, path)} />,
                    key: 'tab/dashboard/dashboard',
                    closable: false
                }
            ]
        };
    }

    // 第一次渲染之前执行此方法
    componentWillMount() {

    }

    // 渲染完成执行此方法
    componentDidMount() {

    }

    // 路由改变时进入此方法
    componentDidUpdate(nextProps) {
        nextProps.onChange(realPath);
    }

    render() {
        const { match } = this.props;
        let re = /\/home\//,
            realPath = match.url.replace(re, '');
        let defaultPath = 'notfound/notfound';
        let Comp = null;
        try {
            const AsyncAdd = dynamicWrapper(() => { return import(`../../screens/${realPath}`) });
            Comp = <AsyncAdd {...match} />;
        } catch (e) {
            if (_.startsWith(e.toString(), 'Error: Cannot find module')) {
                const AsyncAdd = dynamicWrapper(() => { return import(`../../screens/${defaultPath}`) });
                Comp = <AsyncAdd {...match} />;
            }
        }

        return (
            <div style={{ height: '100%' }}>{Comp}</div>
        );
    }
}

export default withRouter(WorkPlace);