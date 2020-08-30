import React, { Component } from 'react';
import { Drawer, Tabs } from 'antd';
import BaseInfoForm from './baseinfo-form';
import ChangeInfo from './changeinfo';
import ConsumeInfo from './consumeinfo';
import SLIInfo from './SLIinfo';

const WIDTH = `${window.screen.width * 0.5}px`;
const TabPane = Tabs.TabPane;

class DrawerContent extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      visible: false,
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
    let { currentRecord } = this.props;
    let newRecord = {
      nodeId: nodeId,
      systemId: currentRecord.systemId
    }
    this.setState({
      newAddRecord: newRecord
    });
  }


  render() {
    const { visible, isLook, currentRecord, onClose } = this.props;
    let { newAddRecord } = this.state;
    let tabMenus = [
      {
        name: '基本信息',
        key: 'baseinfo',
        disabled: false,
        child: <BaseInfoForm isLook={isLook} record={currentRecord} onClose={onClose} onAdd={this.onAdd.bind(this)} />,
      }, {
        name: '服务消费',
        key: 'consumeinfo',
        disabled: !currentRecord.nodeId && !newAddRecord.nodeId,
        child: <ConsumeInfo isLook={isLook} record={currentRecord.nodeId ? currentRecord : newAddRecord} onClose={onClose} />,
      }, {
        name: 'SLI',
        key: 'SLIinfo',
        disabled: !currentRecord.nodeId && !newAddRecord.nodeId,
        child: <SLIInfo isLook={isLook} record={currentRecord.nodeId ? currentRecord : newAddRecord} disabled={!currentRecord.nodeId} />,
      }
    ];
    if (isLook) {
      tabMenus.push({
        name: '变更记录',
        key: 'changeinfo',
        child: <ChangeInfo isLook={isLook} record={currentRecord} />,
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
        title={currentRecord.serverName ? `服务-${currentRecord.serverName}` : '添加服务'}
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

