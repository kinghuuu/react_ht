import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { Spin } from 'antd';
import ApplicationTitle from '../common/applicationTitle';
import styles from './index.module.less';
import SearchModule from './searchModule';
import ModuleDetails from '../modelConfig/module/details';
import GrahpModule from './grahp';

let xAxisData = [
    { value: "服务一" },
    { value: '服务一' },
    { value: '服务二' },
    { value: '服务三' },
    { value: '服务四' },
    { value: '服务五' },
    { value: '服务六' },
];
let yAxisData = [
    { value: "08:00:00" },
    { value: '08:10:00' },
    { value: '08:20:00' },
    { value: '08:30:00' },
    { value: '08:40:00' },
    { value: '08:50:00' },
    { value: '09:00:00' },
    { value: '09:10:00' },
];

const moduleName = {
    system: '应用系统',
    resource: '主机',
    program: '可执行模块',
    process: '进程',
    service: '服务',
};

class TopologicalSearch extends Component {
    constructor(props) {
        super(props);
        this.state = {
            detailsVisable: false,
            currentNode: {},
            loading: false,
            systemId: '',
            systemName: '',

            // 渲染用数据
            sourceList: [],
            links: [],
        };
    }


    componentDidMount() {
        // console.log(this.echartsBox)
        // this.initChart(this.echartsBox)
    }

    // getOption() {

    //     // var data = axisData.map(function (item, i) {
    //     //     return {x:i,y:2};
    //     // });
    //     // var links = data.map(function ({x}, i) {
    //     //     return {
    //     //         source: i,
    //     //         target: i + 1
    //     //     };
    //     // });
    //     // vart newData = data.map((item,index)=>{
    //     //     return {
    //     //         name:item,
    //     //         fixed:true,
    //     //         x:index,
    //     //         y:0,
    //     //     }
    //     // })
    //     // console.log(data,links)

    //     // links.pop();
    //     return {
    //         title: {
    //             text: '服务调用时间线'
    //         },
    //         tooltip: {},
    //         xAxis: {
    //             type: 'category',
    //             boundaryGap: false,
    //             data: xAxisData,
    //             position: 'top',
    //             splitLine: { show: true, },
    //         },
    //         yAxis: {
    //             type: 'value',
    //             inverse: true,
    //             show: false,
    //             boundaryGap: false,
    //             splitLine: { show: false, },
    //         },

    //         series: [
    //             {
    //                 type: 'line',
    //                 // data: [1, 1, 1],
    //                 symbol: 'none',
    //                 markLine: {
    //                     symbolSize: 10,
    //                     data: [
    //                         {
    //                             '0': { coord: [0, 1], value: '222', lineStyle: { color: 'green', type: 'solid', width: 3 }, label: { color: 'black', show: true, position: 'middle' } },
    //                             '1': { coord: [3, 1] },
    //                         },
    //                         {
    //                             '0': { coord: [3, 2], value: '222', lineStyle: { color: 'green', type: 'dotted', width: 3 }, label: { color: 'black', show: true, position: 'middle' } },
    //                             '1': { coord: [1, 2] },
    //                         },
    //                         {
    //                             '0': { coord: [0, 3], value: '222', lineStyle: { color: 'green', type: 'solid', width: 3 }, label: { color: 'black', show: true, position: 'middle' } },
    //                             '1': { coord: [3, 3] },
    //                         },
    //                         {
    //                             '0': { coord: [3, 4], value: '222', lineStyle: { color: 'green', type: 'dotted', width: 3 }, label: { color: 'black', show: true, position: 'middle' } },
    //                             '1': { coord: [1, 4] },
    //                         },
    //                     ]
    //                 },
    //                 symbol: ['arrow', 'arrow'],
    //                 symbolSize: 14,
    //             },
    //             {
    //                 type: 'line',
    //                 symbol: 'none',
    //                 data: [6]
    //             },
    //         ]
    //     };
    // }

    handleClick = (value, params) => {
        const { data: { id, category } } = value;
        if (category === 'system') {
            return false
        }
        this.setState(() => ({
            currentNode: { ...value.data, nodeId: id },
            detailsVisable: true,
        }))
        return false
    }
    // 关闭详情弹窗
    hideModuleDetails = () => {
        this.setState(() => ({ detailsVisable: false, currentNode: {} }));
    }


    // 切换应用系统
    handleSystemSelect = (systemInfo) => {
        const { systemId, systemName } = systemInfo;
        this.setState(() => ({
            systemId, systemName,
        }));
    }
    // 更新数据
    updateTopological = (data) => {
        this.setState(() => data);
    }

    render() {

        const {
            loading,
            systemId, systemName,
            detailsVisable, currentNode,
            sourceList, links
        } = this.state;

        return (
            <div className={styles.block_body} >

                <ApplicationTitle
                    firstBreadcrumb='配置中心'
                    secondBreadcrumb='拓扑关系查询'
                    getSelectSystem={this.handleSystemSelect}
                />

                <Spin spinning={loading}>
                    <SearchModule
                        systemId={systemId}
                        systemName={systemName}
                        updateTopological={this.updateTopological}
                    ></SearchModule>

                    <GrahpModule
                        data={{ sourceList, links }}
                        handleClick={this.handleClick}
                        moduleName={moduleName}
                    />

                </Spin>

                {
                    detailsVisable ? (
                        <ModuleDetails
                            visable={detailsVisable}
                            detailsData={currentNode}
                            systemId={systemId}
                            nodeType={currentNode.category}
                            title={currentNode.name}
                            hideModal={this.hideModuleDetails}
                        />
                    ) : null
                }
            </div>
        );
    }
}
export default connect()(TopologicalSearch);