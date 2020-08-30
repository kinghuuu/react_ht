import React from 'react';
import { Button, Col, Form, Input, Modal, Row, message } from 'antd';
import StandardTable from '../../../components/standardtable'
import xFetch from '../../../util/xFetch';
import _ from 'lodash';

const FormItem = Form.Item;
class TransferDialog extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      selectedRows: [],
      selectedLeftRows: [],
      selectedRightRows: [],
      leftData: {},
      rightData: {},
      isFirst: true,
      uniqueKey: 'id',
      leftStatus: false,
      rightStatus: false,
      current: 1,
      inpValu: '',
    };
  }

  componentDidMount() {
    const { initRight } = this.props;
    let initlists = { rows: initRight };
    let selectLef = initRight;
    if (this.state.isFirst) { //第一次进来时初始化右侧已选中列表
      this.setState({
        // rightData: initlists,
        selectedLeftRows: selectLef,
        selectedRightRows: [],
        inpValu: ''
      })
    }
    if (this.props.visible) { //切换按钮重新获取数据
      let param = {
        start: 0,
        pageIndex: 0,
        limit: 50,
      };
      this.handleAjax(param);
    }
  }

  handleSelectLeftRows = rows => {
    let rightStatus = false;
    if (rows && rows.length > 0) {
      rightStatus = true;
    }
    this.setState({ selectedLeftRows: rows, rightStatus });
  };

  handleSelectRightRows = rows => {
    let leftStatus = false;
    if (rows && rows.length > 0) {
      leftStatus = true;
    }
    this.setState({ selectedRightRows: rows, leftStatus });
  };

  // 返回选中的列表值
  onOk = (e) => {
    const { onCreate } = this.props;
    onCreate(this.state.rightData);
    this.reset();
  }

  handelChange(e) {
    this.setState({
      inpValu: e.target.value
    })
  }

  handleQuery = () => {
    let values = this.state.inpValu;
    this.setState({
      isFirst: false,
      current: 1,
    });
    let param = {
      start: 0,
      pageIndex: 0,
      limit: 50,
      query: values
    }
    this.handleAjax(param);
  };

  //重置 查询条件
  handleReset = () => {
    let opts = {
      start: 0,
      pageIndex: 0,
      limit: 50,
    };
    this.setState({
      current: 1,
      inpValu: ''
    });
    this.handleAjax(opts);
  };

  //判断 传不同的url地址
  handleAjax = (params) => {
    const { url } = this.props;
    if (!url) return;

    xFetch(url, {
      data: params,
      method: 'post',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }).then((response) => {
      if (response && response.rows) {
        this.setState({
          leftData: response,
          leftStatus: false,
          rightStatus: false,
        });
      }
    });
  };

  //移至右侧
  handleRight = () => {
    const { selectedLeftRows, rightData, uniqueKey } = this.state;
    if (selectedLeftRows && selectedLeftRows.length === 0) {
      return;
    }
    rightData.rows = rightData.rows || [];
    let rightList = [...rightData.rows];
    let tmpArr = [];
    selectedLeftRows.map((item, index) => {
      let findIndex = _.findIndex(rightList, function (o) {
        return o[uniqueKey] === item[uniqueKey];
      });
      if (findIndex === -1) {
        tmpArr.push(item);
      }
    });
    rightData.rows = _.concat(rightList, tmpArr);
    this.setState({ rightData, selectedRightRows: [] });
  };

  //移至左侧
  handleLeft = () => {
    const { selectedRightRows, rightData, uniqueKey } = this.state;
    if (selectedRightRows && selectedRightRows.length === 0) {
      return;
    }
    let rightList = [...rightData.rows];
    selectedRightRows.map((item, index) => {
      let findIndex = _.findIndex(rightList, function (o) {
        return o[uniqueKey] === item[uniqueKey];
      });
      if (findIndex > -1) {
        rightList.splice(findIndex, 1);
      }
    });
    rightData.rows = rightList;
    this.setState({ rightData, leftStatus: false });
    this.setState({
      selectedLeftRows: rightList
    });
  };

  handleStandardTableChange = (pagination) => {
    let { inpValu } = this.state;
    this.setState({
      current: pagination.current,
      isFirst: false,
    })
    let params = {
      start: (pagination.current - 1) * 50,
      pageIndex: (pagination.current - 1),
      limit: 50,
    }
    if(inpValu){
        params.query = inpValu;
    }
    this.handleAjax(params);
  };

  reset = () => {
    this.setState({
      isFirst: true,
      current: 1,
      rightData: { rows: [] },
      selectedLeftRows: [],
      inpValu: ''
    });
  };

  render() {
    let {
      visible, onCancel, title = '', width = 800, leftCols = [], rightCols = [], height
    } = this.props;
    const {
      selectedLeftRows, selectedRightRows, leftData, rightData,
      leftStatus, rightStatus, current, uniqueKey
    } = this.state;

    const scroll = {
         y: `${window.screen.height * 0.35}px`,
       };

    let lefkeys = (selectedLeftRows || []).map(v => v.name);
    const leftrowSelection = {  selectedRowKeys: lefkeys };
    let rightrowSelection = {
      selectedRowKeys: [...selectedRightRows].map(v => v.name),
    };
    return (
      <Modal
        width={width}
        height={height}
        title={title}
        visible={visible}
        onOk={this.onOk}
        onCancel={onCancel}>
        <Row>
          <Col span={12}>
            <Row >
              <Col span={5} offset={1}>
                <span style={{ lineHeight: '40px' }}>查询资产</span>
              </Col>
              <Col span={10} offset={1}>
                <FormItem>
                  <Input placeholder='请输入流水号或IP地址' onChange={this.handelChange.bind(this)} value={this.state.inpValu} />
                </FormItem>
              </Col>
              <Col span={1}></Col>
              <Col span={3}>
                <FormItem>
                  <Button type="primary" size='small' onClick={this.handleQuery.bind(this)}>
                    查询
                </Button>
                </FormItem>
              </Col>
              <Col span={3}>
                <FormItem>
                  <Button size='small' onClick={this.handleReset.bind(this)}>
                    重置
                </Button>
                </FormItem>
              </Col>
            </Row>
          </Col>
          <Col span={10} offset={2}>
            <span style={{ lineHeight: '40px' }}>已选资产（<span style={{ color: 'red' }}>{(rightData.rows || []).length}</span>）</span>
          </Col>
        </Row>
        <Row gutter={10}>
          <Col span={12}>
            <StandardTable
              onSelectRow={this.handleSelectLeftRows.bind(this)}
              rowSelection={leftrowSelection}
              data={
                {
                  list: leftData.rows,
                  pagination: {
                    pageSize: 50,
                    current: current,
                    total: leftData.results,
                    size: 'small',
                    showSizeChanger: false
                  }
                }}
              columns={leftCols}
              scroll={scroll}
              onChange={this.handleStandardTableChange}
              rowKey={uniqueKey}
            />
          </Col>
          <Col span={1}>
            <div style={{  paddingTop: `${window.screen.height * 0.2}px` }}>
              <Button icon="right"
                type={rightStatus ? 'primary' : 'default'}
                size="small"
                style={{ marginBottom: '5px' }}
                onClick={this.handleRight.bind(this)}>
              </Button>
              <Button icon="left"
                type={leftStatus ? 'primary' : 'default'}
                size="small"
                onClick={this.handleLeft.bind(this)}>
              </Button>
            </div>
          </Col>
          <Col span={11}>
            <StandardTable
              onSelectRow={this.handleSelectRightRows.bind(this)}
              rowSelection={rightrowSelection}
              data={{
                list: rightData.rows,
                pagination: false
              }}
              columns={rightCols}
              scroll={scroll}
              rowKey={uniqueKey}/>
          </Col>
        </Row>
      </Modal>
    );
  }
}

TransferDialog = Form.create()(TransferDialog);

export default TransferDialog;
