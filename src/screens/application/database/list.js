import React, { Component } from 'react';
import { Row, Col, Form, Menu } from 'antd';
import { connect } from 'react-redux';
import Mysql from './mysql';
import Oracle from './oracle';
import { IconFont } from '../../../util/util';
import styles from './index.module.less';

//程序---数据库页
class List extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentData: { type: 'Oracle' },
        };
    }

    handleClick = e => {
        let { systemId, parentId } = this.props;
        let currentType = {};
        if (e.key == 'Oracle') {
            currentType.type = 'Oracle'
        } else {
            currentType.type = 'Mysql';
        }
        this.setState({
            currentData: currentType
        });
    };

    render() {
        const { currentData } = this.state
        const { systemId, parentId } = this.props
        let recordInfo = { ...currentData, systemId, parentId };
        return (
            <div>
                <Row>
                    <Col span={3}>
                        <Menu
                            onClick={this.handleClick.bind(this)}
                            defaultSelectedKeys={['Oracle']}
                            defaultOpenKeys={['sub1']}
                            mode="inline">
                            <Menu.Item key='Oracle' className={styles.menuitem} style={{ height: '80px' }}>
                                <IconFont type='iconfont-oracle' style={{ fontSize: '30px', verticalAlign: 'middle' }} />
                                <div>Oracle数据库</div></Menu.Item>
                            <Menu.Item key='Mysql' className={styles.menuitem} style={{ height: '80px' }}>
                                <IconFont type='iconfont-mysql' style={{ fontSize: '30px', verticalAlign: 'middle' }} />
                                <div >Mysql数据库</div></Menu.Item>
                        </Menu>
                    </Col>
                    <Col span={20} style={{ marginLeft: '5px' }}>
                        {
                            currentData.type == 'Oracle' ?
                                <Oracle databaseInfo={recordInfo} />
                                :
                                <Mysql databaseInfo={recordInfo} />
                        }
                    </Col>
                </Row>
            </div>
        );
    }
}

List = Form.create()(List)

export default connect()(List);