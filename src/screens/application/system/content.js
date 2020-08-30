import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Tabs, Collapse, Spin } from 'antd';
import Attribute from './attribute';
import IpDimensionsSearch from './ipDimensionsSearch';
import DatabaseInstanceSearch from './databaseInstanceSearch';
import Styles from './index.module.less'
const { TabPane } = Tabs;
const { Panel } = Collapse;

class content extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeKey: '1',
            systemId: ''
        };
    }
    changeKey = (key) => {
        this.setState({
            activeKey: key
        })
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        const { systemId } = nextProps
        if (systemId !== prevState.systemId) {
            return {
                systemId,
                activeKey: '1'
            }
        } else {
            return null
        }

    }

    componentDidMount() {
        this.setState({
            systemId: this.props.systemId
        })
    }

    render() {
        const { detailApplicationList, contentLoading, systemId } = this.props
        const { activeKey } = this.state
        return (
            <div className={Styles.rightContent} style={{ height: '100%' }}>
                <Tabs activeKey={activeKey} onChange={this.changeKey}>
                    <TabPane tab="应用属性" key="1">
                        <Spin spinning={contentLoading}>
                            <Collapse defaultActiveKey={['1']} bordered={false}>
                                <Panel header="基本信息" key="1">
                                    <div className={Styles.baseInfo}>
                                        <div className={Styles.info_first}>
                                            <div>应用ID：{detailApplicationList.code}</div>
                                            <div className={Styles.infoRow}>
                                                <div className={Styles.left}>中文全称：{detailApplicationList.nameCn}</div>
                                                <div className={Styles.right}>中文简称：{detailApplicationList.abbrCn}</div>
                                            </div>
                                            <div className={Styles.infoRow}>
                                                <div className={Styles.left}>英文全称：{detailApplicationList.nameEn}</div>
                                                <div className={Styles.right}>英文简称：{detailApplicationList.abbrEn}</div>
                                            </div>
                                            <div>
                                                应用描述：{detailApplicationList.description}
                                            </div>
                                        </div>
                                        <div className={Styles.info_second}>
                                            <div className={Styles.infoRow}>
                                                <div className={Styles.left}>开发模式：{detailApplicationList.devMode}</div>
                                                <div className={Styles.right}>所属阶段：{detailApplicationList.phase}</div>
                                            </div>
                                            <div className={Styles.infoRow}>
                                                <div className={Styles.left}>应用分级：{detailApplicationList.classificationCode}</div>
                                                <div className={Styles.right}>业务扎口部门：{detailApplicationList.dept}</div>
                                            </div>
                                            <div className={Styles.infoRow}>
                                                <div className={Styles.left}>运维主管：{detailApplicationList.primary}</div>
                                                <div className={Styles.right}>运维备岗：{detailApplicationList.secondary}</div>
                                            </div>
                                            <div className={Styles.infoRow}>
                                                <div className={Styles.left}>研发职能团队：{detailApplicationList.devTeam}</div>
                                                <div className={Styles.right}>运维智能团队：{detailApplicationList.opsTeam}</div>
                                            </div>
                                            <div>ITSO：{detailApplicationList.itso}</div>
                                        </div>
                                    </div>
                                </Panel>
                            </Collapse>
                        </Spin>
                    </TabPane>
                    <TabPane tab="程序自定义属性" key="2">
                        <Attribute systemId={systemId} name='attr' />
                    </TabPane>
                    <TabPane tab="自定义分组" key="3">
                        <Attribute systemId={systemId} name='group' />
                    </TabPane>
                    <TabPane tab="IP维度查询" key="4">
                        <IpDimensionsSearch
                            systemId={systemId}
                            resetTag={contentLoading}
                            // systemId='000449'
                            name='ipDimensionsSearch' />
                    </TabPane>
                    <TabPane tab="数据库实例查询" key="5">
                        <DatabaseInstanceSearch
                            systemId={systemId}
                            resetTag={contentLoading}
                            // systemId='000449'
                            name='databaseInstanceSearch' />
                    </TabPane>
                </Tabs>
            </div>
        );
    }
}
const mapStateToProps = (state, ownProps) => {
    const { contentLoading } = state.applicationResource;
    return {
        detailApplicationList: state.detailApplicationList,
        contentLoading
    }
}

export default connect(mapStateToProps)(content);