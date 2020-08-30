import React, { Component } from 'react';
import { Drawer, Tabs } from 'antd';
import OracleBaseInfo from './oracle-baseinfo';
import MysqlBaseInfo from './mysql-baseinfo';
import ChangeInfo from './changeinfo';
import DBLink from './dblink';
import OutDBLink from './outdblink';

const WIDTH = `${window.screen.width * 0.5}px`;
const TabPane = Tabs.TabPane;

class DrawerContent extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      newAddRecord: {}
    };
  }

  handleTabs = (key) => {
    this.setState({
      tabkey: key,

    });
  }

  onClose = () => {
    let { onClose } = this.props;
    onClose();
  }

  onAdd = (nodeId) => {
    let { currentRecord, databaseInfo } = this.props;
    let newRecord = {
      nodeId: nodeId,
      systemId: databaseInfo.systemId
    }
    this.setState({
      newAddRecord: newRecord
    });
  }


  render() {
    const { visible, isLook, currentRecord, databaseInfo, onClose } = this.props;
    let { newAddRecord } = this.state;
    let tabMenus = [];
    let dataInfo = { ...currentRecord, ...databaseInfo }
    if (databaseInfo.type == 'Oracle') {
      tabMenus = [
        {
          name: '基本信息',
          key: 'oracle-baseinfo',
          disabled: false,
          child: <OracleBaseInfo isLook={isLook} record={dataInfo} onClose={onClose} onAdd={this.onAdd.bind(this)} />,
        }, {
          name: 'dblink',
          key: 'dblink',
          disabled: !currentRecord.nodeId && !newAddRecord.nodeId,
          child: <DBLink isLook={isLook} record={currentRecord.nodeId ? dataInfo : newAddRecord} onClose={onClose} />,
        }, {
          name: '访问外部dblink',
          key: 'accessoutside-dblink',
          disabled: !currentRecord.nodeId && !newAddRecord.nodeId,
          child: <OutDBLink isLook={isLook} record={currentRecord.nodeId ? dataInfo : newAddRecord} disabled={!currentRecord.nodeId} />,
        }
      ];
    } else {
      tabMenus = [
        {
          name: '基本信息',
          key: 'mysql-baseinfo',
          disabled: false,
          child: <MysqlBaseInfo isLook={isLook} record={dataInfo} onClose={onClose} />,
        }
      ];
    }

    if (isLook) {
      tabMenus.push({
        name: '变更记录',
        key: 'changeinfo',
        child: <ChangeInfo isLook={isLook} record={dataInfo} />,
      });
    }
    let panes = _.map(tabMenus, (item) => {
      return (
        <TabPane tab={item.name} key={item.key} disabled={item.disabled}>
          {item.child}
        </TabPane>
      )
    });

    return (
      <Drawer
        title={`${databaseInfo.type}数据库`}
        width={WIDTH}
        onClose={this.onClose.bind(this)}
        visible={visible}>
        <div>
          <Tabs defaultActiveKey={tabMenus[0].key} onChange={this.handleTabs}>
            {panes}
          </Tabs>
        </div>
      </Drawer>
    );
  }
}

export default DrawerContent;

