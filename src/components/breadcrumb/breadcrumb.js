import React, { Component, createElement } from 'react';
import { Link, withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Breadcrumb, Tabs } from 'antd';
import { connect } from 'react-redux';
import classNames from 'classnames';
import styles from './breadcrumb.module.less';
const { TabPane } = Tabs;

class BreadCrumb extends Component {
    onChange = (key) => {
        if (this.props.onTabChange) {
            this.props.onTabChange(key);
        }
    };

    render() {
        const {
            title, logo, action, content, extraContent, breadcrumbList, tabList, className,
            match: { url }, menus, rawMenus
        } = this.props;
        const clsString = classNames(styles.pageHeader, className);

        let flatMenus = getFlatMenuData(rawMenus);
        let breadcrumb, realPath = url.replace(/\/home\//, ''), hashRouter = splitPath(realPath);
        if (realPath && (!breadcrumbList)) {
            const pathSnippets = realPath.split('/');
            const pathSnippetsLen = pathSnippets.length;
            const extraBreadcrumbItems = pathSnippets.map((path, index) => {
                let link = null;
                if (index === pathSnippetsLen - 2 || index === pathSnippetsLen - 1) {
                    link = <Link to={hashRouter[pathSnippetsLen - 1]}>{flatMenus[path]}</Link>;
                }
                return flatMenus[path] && !flatMenus.hideInBreadcrumb ? (
                    <Breadcrumb.Item key={path}>
                        {link}
                    </Breadcrumb.Item>
                ) : null;
            });
            const breadcrumbItems = [(
                <Breadcrumb.Item key='home'>
                    <Link to={'/home/dashboard/dashboard'}>首页</Link>
                </Breadcrumb.Item>
            )].concat(extraBreadcrumbItems);
            breadcrumb = (
                <Breadcrumb className={styles.breadcrumb}>
                    {breadcrumbItems}
                </Breadcrumb>
            );
        } else if (breadcrumbList && breadcrumbList.length) {
            breadcrumb = (
                <Breadcrumb className={styles.breadcrumb}>
                    {
                        breadcrumbList.map(item => (
                            <Breadcrumb.Item key={item.title}>
                                {
                                    item.href ?
                                        <Link to={item.href}>{item.title}</Link>
                                        : item.title
                                }
                            </Breadcrumb.Item>)
                        )
                    }
                </Breadcrumb>
            );
        } else {
            breadcrumb = null;
        }

        const tabDefaultValue = tabList && (tabList.filter(item => item.default)[0] || tabList[0]);

        return (
            <div className={clsString}>
                {breadcrumb}
                <div className={styles.detail}>
                    {logo && <div className={styles.logo}>{logo}</div>}
                    <div className={styles.main}>
                        <div className={styles.row}>
                            {title && <h1 className={styles.title}>{title}</h1>}
                            {action && <div className={styles.action}>{action}</div>}
                        </div>
                        <div className={styles.row}>
                            {content && <div className={styles.content}>{content}</div>}
                            {extraContent && <div className={styles.extraContent}>{extraContent}</div>}
                        </div>
                    </div>
                </div>
                {
                    tabList &&
                    tabList.length &&
                    <Tabs
                        className={styles.tabs}
                        defaultActiveKey={(tabDefaultValue && tabDefaultValue.key)}
                        onChange={this.onChange}
                    >
                        {
                            tabList.map(item => <TabPane tab={item.tab} key={item.key} />)
                        }
                    </Tabs>
                }
            </div>
        );
    }
}

function formatter(data, parentPath = '') {
    const list = [];
    data.forEach((item) => {
        if (item.children) {
            list.push({
                ...item,
                path: `${parentPath}${item.path}`,
                children: formatter(item.children, `${parentPath}${item.path}/`)
            });
        } else {
            list.push({
                ...item,
                path: `${parentPath}${item.path}`
            });
        }
    });
    return list;
}

function getFlatMenuData(menus) {
    let keys = {};
    menus.forEach((item) => {
        if (item.children) {
            keys[item.path] = item.name;
            keys = { ...keys, ...getFlatMenuData(item.children) };
        } else {
            keys[item.path] = item.name;
        }
    });
    return keys;
}

function splitPath(path) {
    let result = [], paths = path.split('/');
    _.each(paths, (item, index) => {
        if (index === 0) {
            result[index] = `/home/${item}`;
        } else {
            result[index] = `${result[index - 1]}/${item}`;
        }
    });
    return result;
}

function mapStateToProps(state) {
    return {
        rawMenus: state.menus,
        menus: formatter(state.menus)
    };
}

export default withRouter(connect(mapStateToProps)(BreadCrumb));
