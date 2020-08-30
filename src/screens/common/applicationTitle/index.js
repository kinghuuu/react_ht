import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { Row, Col, Breadcrumb, Button, Icon, Menu, Dropdown, Input } from 'antd';
import { getSystemList } from '../../../actions/common/module/action';
import Styles from './index.module.less';

const BreadcrumbItem = Breadcrumb.Item,
    MenuItem = Menu.Item;

class ApplicationTitle extends Component {
    constructor(props) {
        super(props);
        this.state = {
            systemList: [],
            selectSystemTtile: '',
            selectedKeys: [],
            queryValue: '',
        };
    }

    getSystemList = () => {
        const { dispatch, initValue, getSelectSystem, appSelectVisable = true } = this.props;
        if (appSelectVisable) {
            dispatch(getSystemList({ query: '' }, (systemList = []) => {

                let selectSystemTtile = '', selectedKeys = [];
                let firstItem = systemList[0];

                if (_.isObject(firstItem)) {
                    selectSystemTtile = firstItem.systemName;
                    selectedKeys = [firstItem.systemId]
                    if (_.isFunction(getSelectSystem)) {
                        getSelectSystem(systemList[0]);
                    }
                }
                // if (initValue) {
                //     selectSystemTtile = [initValue];
                // }
                this.setState(() => ({ systemList, selectSystemTtile, selectedKeys }));
            }));
        }
    }

    handleModuleChange = (selectValue) => {
        const { getSelectSystem } = this.props;
        const { systemList } = this.state;
        const { key, keyPath } = selectValue;
        let selectSystem = _.find(systemList, item => item.systemId === key);
        this.setState(() => ({
            selectSystemTtile: selectSystem.systemName,
            selectedKeys: keyPath,
            queryValue: '',
        }));
        if (_.isFunction(getSelectSystem)) {
            getSelectSystem(selectSystem);
        }
    }

    componentDidMount() {
        this.getSystemList()
    }

    handleToBack = () => {
        const { toBack } = this.props;
        if (_.isFunction(toBack)) {
            toBack();
        }
    }

    //重新获取监控展示模块的数据
    handleSyncSystemUnMonitor = () => {
        const { handleSyncSystemUnMonitor } = this.props;
        if (_.isFunction(handleSyncSystemUnMonitor)) {
            handleSyncSystemUnMonitor();
        }
    }

    //刷新监控展示模块
    reloadMonitorData = () => {
        const { reloadMonitorData } = this.props;
        if (_.isFunction(reloadMonitorData)) {
            reloadMonitorData();
        }
    }

    render() {
        const {
            firstBreadcrumb = '', secondBreadcrumb = '', thirdBreadcrumb = '', fourthBreadcrumb = '',
            backVisable = false, appSelectVisable = true, syncSystemBtn = false
        } = this.props;

        const { systemList, selectSystemTtile, selectedKeys, queryValue } = this.state;

        let newSystemList = _.filter(systemList, item => item.systemName.includes(queryValue));


        const menu = (<Menu onClick={this.handleModuleChange} selectedKeys={selectedKeys} style={{ maxHeight: '600px', overflow: 'auto' }} >
            <div style={{ padding: '8px 12px' }} >
                <Input
                    value={queryValue}
                    onChange={(evt) => {
                        let queryValue = evt.target.value;
                        this.setState(() => ({ queryValue }))
                    }}
                    style={{ width: '220px' }} placeholder='请输入关键字查询'
                />
                {/* <Button type='primary'>查询</Button> */}
                {/* <Button>重置</Button> */}
            </div>
            {
                newSystemList.map(item => {
                    return (
                        <MenuItem key={item.systemId}>{item.systemName}</MenuItem>
                    )
                })
            }
        </Menu>);

        return (<div className={Styles.flow_block_title}>
            <Row>
                <Col span={12}>
                    <Breadcrumb className={Styles.title}>
                        <BreadcrumbItem>{firstBreadcrumb}</BreadcrumbItem>
                        <BreadcrumbItem>{secondBreadcrumb}</BreadcrumbItem>
                        <BreadcrumbItem>{thirdBreadcrumb}</BreadcrumbItem>
                        <BreadcrumbItem>{fourthBreadcrumb}</BreadcrumbItem>
                    </Breadcrumb>
                </Col>
                <Col span={12}>
                    {backVisable ? (
                        <Button
                            size='small'
                            type="primary"
                            className='button-success'
                            onClick={this.handleToBack}
                            style={{ margin: '12px 0 0 16px', float: 'right' }}
                        ><Icon type="left" /> 返回</Button>
                    ) : null}
                    {
                        syncSystemBtn ? (
                            <Fragment>
                                <Button
                                    size='small'
                                    type="primary"
                                    className='button-success'
                                    onClick={this.reloadMonitorData}
                                    style={{ margin: '12px 0 0 16px', float: 'right' }}
                                >刷新</Button>
                                <Button
                                    size='small'
                                    type="primary"
                                    className='button-success'
                                    onClick={this.handleSyncSystemUnMonitor}
                                    style={{ margin: '12px 0 0 16px', float: 'right' }}
                                >重新获取数据</Button>
                            </Fragment>
                        ) : null
                    }
                    {appSelectVisable ? (
                        // <Fragment>
                        //     <Dropdown overlay={menu} trigger={['click']}>
                        //         <span className={Styles.systemTitle} >
                        //             <Icon type="menu" /> {selectSystemTtile}
                        //         </span>
                        //     </Dropdown>
                        // </Fragment>
                        <div className={Styles.dropdown}>
                            <Dropdown overlay={menu} trigger={['click']}>
                                <Button
                                    size='small'
                                    type="primary"

                                    style={{ margin: '12px 0 0 16px', float: 'right' }}
                                >
                                    {selectSystemTtile} <Icon type="down" />
                                </Button>
                            </Dropdown>
                        </div>

                    ) : null}

                </Col>
            </Row>
        </div>);
    }
}

export default connect()(ApplicationTitle);