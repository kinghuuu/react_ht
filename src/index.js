// 整个程序的启动点
import './index.less';
import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter, HashRouter, Route, Switch, Link, Redirect } from 'react-router-dom';
import { Provider } from 'react-redux';
import { LocaleProvider, ConfigProvider } from 'antd';
import DocumentTitle from 'react-document-title';
import { dynamicWrapper, GLOBAL_NAME, RenderEmpty } from './util/util';
import zhCN from 'antd/es/locale/zh_CN';
import moment from 'moment';
import 'moment/locale/zh-cn';
import configureStore from './store/configureStore';
import '@babel/polyfill';
// import NormalLogin from '../screens/login/login';
// import NormalModify from '../screens/modifypassword/modify';
// import Home from '../screens/home/home';
moment.locale('zh-cn');

const store = configureStore();
const supportsHistory = 'pushState' in window.history;

const AsyncLogin = dynamicWrapper(() => { return import(`./screens/login/login`) });
// const AsyncModify = dynamicWrapper(() => { return import(`../screens/modifypassword/modify`) });
const AsyncHome = dynamicWrapper(() => { return import(`./screens/home/home`) });
// const AsyncHome = dynamicWrapper(() => { return import(`./screens/application/index`) });

// 如果作为子页面嵌在Iframe中
if (window !== top) {
    render(
        <Provider store={store}>
            <DocumentTitle title={GLOBAL_NAME}>
                <ConfigProvider locale={zhCN} renderEmpty={RenderEmpty}>
                    <HashRouter forceRefresh={!supportsHistory}>
                        <Switch>
                            <Route path='/login' component={AsyncLogin} />
                            {/* <Route path='/modify' component={AsyncModify} /> */}
                            <Route path='/home' component={AsyncHome} />
                            <Route path='/independent' render={(match) => {
                                let pathName = match.location.pathname,
                                    path = pathName.replace(/\/independent\//, '');
                                const AsyncComp = dynamicWrapper(() => { return import(`./screens/${path}`) });
                                return <AsyncComp addTab={() => { }} removeTab={() => { }} noRefresh={() => { }} />;
                            }} />
                            <Redirect to='/login' />
                        </Switch>
                    </HashRouter>
                </ConfigProvider>
            </DocumentTitle>
        </Provider>, document.getElementById('root')
    );
    window.addEventListener('message', (e) => {
        let params = {};
        let data = e.data;
        if (data.action === 'addTab') {
            params = data.params;
            render(
                <Provider store={store}>
                    <LocaleProvider locale={zhCN}>
                        <DocumentTitle title={GLOBAL_NAME}>
                            <ConfigProvider renderEmpty={RenderEmpty}>
                                <HashRouter forceRefresh={!supportsHistory}>
                                    <Switch>
                                        <Route path='/login' component={AsyncLogin} />
                                        {/* <Route path='/modify' component={AsyncModify} /> */}
                                        <Route path='/home' component={AsyncHome} />
                                        <Route path='/independent' render={(match) => {
                                            let pathName = match.location.pathname,
                                                path = pathName.replace(/\/independent\//, '');
                                            const AsyncComp = dynamicWrapper(() => { return import(`./screens/${path}`) });
                                            return <AsyncComp params={params} addTab={() => { }} removeTab={() => { }} noRefresh={() => { }} />;
                                        }} />
                                        <Redirect to='/login' />
                                    </Switch>
                                </HashRouter>
                            </ConfigProvider>
                        </DocumentTitle>
                    </LocaleProvider>
                </Provider>, document.getElementById('root')
            );
        }
    }, false);
    // 通知父页面加载完成
    window.top.postMessage({
        action: 'load',
        params: 'ready',
        src: window.location.href
    }, '*');
} else {
    render(
        <Provider store={store}>
            <DocumentTitle title={GLOBAL_NAME}>
                <ConfigProvider locale={zhCN} renderEmpty={RenderEmpty}>
                    <HashRouter forceRefresh={!supportsHistory}>
                        <Switch>
                            <Route path='/login' component={AsyncLogin} />
                            {/* <Route path='/modify' component={AsyncModify} /> */}
                            <Route path='/home' component={AsyncHome} />
                            <Route path='/independent' render={(match) => {
                                let pathName = match.location.pathname,
                                    path = pathName.replace(/\/independent\//, '');
                                const AsyncComp = dynamicWrapper(() => { return import(`./screens/${path}`) });
                                return <AsyncComp addTab={() => { }} removeTab={() => { }} noRefresh={() => { }} />;
                            }} />
                            <Redirect to='/login' />
                        </Switch>
                    </HashRouter>
                </ConfigProvider>
            </DocumentTitle>
        </Provider>, document.getElementById('root')
    );
}