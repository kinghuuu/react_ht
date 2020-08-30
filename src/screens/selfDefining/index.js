import React, { Component } from 'react';
// import { connect } from 'react-redux';
import { Row, Col } from 'antd';
import ApplicationTitle from '../common/applicationTitle';
import AttributeList from './list';
import styles from './index.module.less';

class SelfDefining extends Component {
    constructor(props) {
        super(props);
        this.state = {
            systemId: '',
            isShowEdit: false,
            thirdBreadcrumb: '',
            moduleList: [],
            nodeType: '',
        };
    }

    componentDidMount() {
        // 设置 moduleList
        let moduleList = [
            { title: '应用系统', nodeType: 'system' },
            { title: '可执行模块', nodeType: 'program' },
            // { title: '可执行模块调用', nodeType: 'programConsume' },
            { title: '主机', nodeType: 'resource' },
            { title: '进程', nodeType: 'process' },
            { title: '服务', nodeType: 'service' },
            { title: '服务调用', nodeType: 'serviceConsume' },
            // { title: '服务sli', nodeType: 'serviceSli' },
        ];
        moduleList.forEach(item => {
            item.src = require('../../assets/imgs/' + item.nodeType + '.png');
        });
        this.setState(() => ({ moduleList }));
    }


    handleModuleClick = (moduleData) => {
        const { src, title, nodeType } = moduleData;
        this.setState(() => ({
            isShowEdit: true,
            thirdBreadcrumb: title,
            nodeType,
        }));
    }
    handleToBack = () => {
        this.setState(() => ({
            isShowEdit: false,
            thirdBreadcrumb: '',
        }));
    }

    render() {

        const { moduleList, isShowEdit, thirdBreadcrumb, systemId, nodeType } = this.state;

        return (
            <div className={styles.block_body}>
                <ApplicationTitle
                    firstBreadcrumb='模型管理'
                    secondBreadcrumb='自定义属性管理'
                    thirdBreadcrumb={thirdBreadcrumb}
                    backVisable={isShowEdit}
                    toBack={this.handleToBack}
                    getSelectSystem={(systemInfo) => {
                        let systemId = systemInfo.systemId;
                        this.setState(() => ({ systemId }));
                    }}
                />

                {isShowEdit ? (
                    <Row>
                        <AttributeList
                            systemId={systemId}
                            nodeType={nodeType}
                        />
                    </Row>
                ) : (
                        <Row gutter={10} style={{ paddingTop: '32px' }} >
                            {moduleList.map((item, index) => {
                                const { src, title, nodeType } = item;
                                let firstItem = index % 5 === 0;
                                return (<Col span={4} key={nodeType} offset={firstItem ? 2 : 0} >
                                    <div className={styles.module_item} onClick={this.handleModuleClick.bind(this, item)}>
                                        <img src={src}></img>
                                        <span className={styles.module_txt}>{item.title}</span>
                                    </div>
                                </Col>);
                            })}
                        </Row>
                    )}
            </div>
        );
    }
}
export default SelfDefining;

// const mapStateToProps = (state, ownProps) => {
//     return {
//     }
// }

// export default connect(mapStateToProps)(SelfDefining);