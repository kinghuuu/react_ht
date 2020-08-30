import React, { Component } from 'react';
import _ from 'lodash';
import ReactEcharts from "echarts-for-react";

class GrahpModule extends Component {
    constructor(props) {
        super(props);

    }

    shouldComponentUpdate(nextProps) {
        if(_.isEqual(nextProps.data,this.props.data)){
            return false
        }
        return true
    }

    getOption() {
        const { data: { links, sourceList }, moduleName } = this.props;
        return {
            legend: {
                itemGap: 16,
                right: 0,
                formatter: name => moduleName[name],
                textStyle: {
                    fontSize: 16
                }
            },

            series: [
                {
                    // id: 'graph_cmdb',
                    // coordinateSystem:'cartesian2d',
                    zoom: 0.5,
                    name: 'CMDB 关系图',
                    type: 'graph',
                    layout: 'force',
                    symbol: 'circle',
                    symbolSize: [90, 90],
                    edgeSymbol: ['', 'arrow'],
                    // edgeSymbolSize: 12,
                    draggable: false,
                    roam: true,  //鼠标缩放、平移
                    focusNodeAdjacency: true,  //突出相关
                    draggable: true,
                    force: {  //斥力因子
                        repulsion: 1600,
                        edgeLength: [100, 400],
                        // layoutAnimation: false,
                        gravity: 0.1,
                        // friction :0.4,
                        // initLayout: 'force',
                    },
                    data: sourceList,
                    links: links,
                    hoverLayerThreshold: 100,
                    categories: [
                        { name: 'system', itemStyle: { color: 'rgb(55, 58, 223)' } },
                        { name: 'program', itemStyle: { color: 'rgb(179, 30, 179)' } },
                        { name: 'resource', itemStyle: { color: 'rgb(149, 165, 4)' } },
                        { name: 'process', itemStyle: { color: 'rgb(211, 144, 19)' } },
                        { name: 'service', itemStyle: { color: 'rgb(19, 192, 19)' } },
                    ],
                    label: {
                        position: 'inside',
                        show: true,
                        fontSize: 12,
                        // formatter:(data1,data2,data3)=>{
                        //     console.log(data1,data2,data3)
                        //     return 12
                        // }
                    },
                    edgeLabel: {
                        show: true,
                        fontSize: 12,
                        position: 'middle',
                        distance: 10,
                        formatter: params => params.data.relation
                    },
                    // itemStyle: {
                    //     borderColor: "#ffffff",
                    //     borderWidth: 1.5,
                    //     shadowBlur: 2,
                    //     shadowColor: 'rgba(0, 0, 0, 0.4)',
                    // },
                    lineStyle: {
                        width: 2, color: '#aaa', curveness: .3
                    },
                    animation: true,
                    // animationDuration: 1000,
                    // animationThreshold: 10,
                    // animationEasing: 'linear'
                }
            ],
            // animationDuration:1000,
        };
    }


    render() {
        const { handleClick } = this.props;
        let scrollY = window.document.body.offsetHeight - 140;
        return (
            <div >
                <ReactEcharts
                    onEvents={{
                        click: handleClick,
                        dblclick: () => false,
                        legendscroll:()=>{
                            console.log(1111)
                        }
                    }}
                    lazyUpdate={true}
                    notMerge={true}
                    option={this.getOption()}
                    style={{ width: '100%', height: `${scrollY}px` }}
                />
            </div>
        );
    }
}
export default GrahpModule;