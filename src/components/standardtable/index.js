import React, { PureComponent, Fragment } from 'react';
import { Table, Alert, Button, Tooltip, Row, Col, Modal, Checkbox, Spin } from 'antd';
import { requestFlowUserInfo, requestFlowUserInfoCmdb } from '../../actions/common/flow/action';
import { getTableColumns, getTableColumnsCmdb, saveTableColumns, saveTableColumnsCmdb } from '../../actions/common/module/action';
import _ from 'lodash';
import { connect } from 'react-redux';
import styles from './index.module.less';

function initTotalList(columns) {
	const totalList = [];
	columns.forEach(column => {
		if (column.needTotal) {
			totalList.push({ ...column, total: 0 });
		}
	});
	return totalList;
}

class StandardTable extends PureComponent {
	constructor(props) {
		super(props);
		const { columns } = props;
		const needTotalList = initTotalList(columns);

		this.state = {
			forceState: false,
			selectedRowKeys: props.rowSelection && props.rowSelection.selectedRowKeys || [],
			needTotalList,
			columnModalVisible: false,
			tempStateColumns: props.columns || [],
			stateColumns: props.columns || [],
			maxColNum: props.maxColNum || 0,
			configCheckLoading: false,
			confirmLoading: false
		};
	}

	static getDerivedStateFromProps(nextProps, prevState) {
		// clean state
		if (_.isEmpty(nextProps.rowSelection)) {
			return null;
		} else {
			if (_.isEmpty(nextProps.rowSelection.selectedRowKeys)) {
				if (prevState.forceState === true) {
					return {
						...prevState,
						forceState: false
					};
				} else {
					const needTotalList = initTotalList(nextProps.columns);
					return {
						selectedRowKeys: [],
						needTotalList,
					};
				}
			} else {
				if (prevState.forceState === true) {
					return {
						...prevState,
						forceState: false
					};
				} else {
					return {
						...prevState,
						forceState: false,
						selectedRowKeys: nextProps.rowSelection.selectedRowKeys
					};
				}
			}
		}
		return null;
	}

	selectRow = (record) => {
		if (record.disabled === true) {
			return;
		}
		let { onSelectRow, data: { list }, rowSelection, rowKey = 'key' } = this.props;
		let selectedRowKeys = [...this.state.selectedRowKeys];
		if (rowSelection) {
			if (rowSelection.type === 'radio') {
				selectedRowKeys = [];
				selectedRowKeys.push(record[rowKey]);
			} else {
				if (selectedRowKeys.indexOf(record[rowKey]) >= 0) {
					selectedRowKeys.splice(selectedRowKeys.indexOf(record[rowKey]), 1);
				} else {
					selectedRowKeys.push(record[rowKey]);
				}
			}
		}

		let selectedRows = _.filter(list, (item) => {
			return _.includes(selectedRowKeys, item[rowKey]);
		});
		if (onSelectRow) {
			onSelectRow(selectedRows);
		}

		this.setState({
			selectedRowKeys,
			forceState: true
		});
	}

	handleRowSelectChange = (selectedRowKeys, selectedRows) => {
		let { needTotalList } = this.state;
		needTotalList = needTotalList.map(item => ({
			...item,
			total: selectedRows.reduce((sum, val) => sum + parseFloat(val[item.dataIndex], 10), 0),
		}));
		const { onSelectRow } = this.props;
		if (onSelectRow) {
			onSelectRow(selectedRows);
		}

		this.setState({
			forceState: true,
			selectedRowKeys,
			needTotalList
		});
	};

	handleTableChange = (pagination, filters, sorter) => {
		const { onChange } = this.props;
		if (onChange) {
			onChange(pagination, filters, sorter);
		}
	};

	cleanSelectedKeys = () => {
		this.handleRowSelectChange([], []);
	};

	/** 在弹出框中动态配置表格显示的列名 === Begin */
	openColumnModal = () => {
		let { dispatch, pageId, maxColNum, columns, name, sysId } = this.props;
		maxColNum = maxColNum || this.state.stateColumns.length;
		this.setState({ columnModalVisible: true, configCheckLoading: true });
		let getUserInfo = (name && name === 'CMDB-resource') ? requestFlowUserInfoCmdb : requestFlowUserInfo;
		dispatch(getUserInfo({}, (userData) => {
			let userId = (name && name === 'CMDB-resource') ? userData.id : userData.drafterCode;
			let _getTableColumns = (name && name === 'CMDB-resource') ? getTableColumnsCmdb : getTableColumns;
			let params = (name && name === 'CMDB-resource') ? { userId, pageId, sysId } : { userId, pageId };
			dispatch(_getTableColumns(params, (colData) => {
				let resColumns = JSON.parse(colData.columns);
				let loaclColumns = this.requestColumnsValueToLoaclColumns(resColumns);
				let checkedList = this.getSelectColumns(loaclColumns)
				loaclColumns.map((item, index) => {
					if (checkedList.length >= maxColNum) {
						if (!item.selected) {
							item.disabled = true
						} else {
							item.disabled = false
						}
					} else {
						item.disabled = false
					}
				})
				this.setState({
					stateColumns: _.cloneDeep(loaclColumns),
					tempStateColumns: loaclColumns,
					configCheckLoading: false
				});
			}));
		}));
	}

	getSelectColumns = (loaclColumns) => {
		let checkedArry = []
		loaclColumns.map((item, index) => {
			if (item.selected) {
				checkedArry.push(item)
			}
		})
		return checkedArry
	}

	closeColumnModal = () => {
		let stateColumns = [...this.state.stateColumns];
		this.setState({
			columnModalVisible: false,
			tempStateColumns: stateColumns
		}, () => {
			document.body.style.overflow = 'auto';
		});
	}

	// 将 requestColumns 的值，传给 loaclColumns ，
	// 修改原因：本地新增 column，但是这里的逻辑是如果 requestColumns 有值，则以 requestColumns 替换 loaclColumns，所以新加的colums 不起作用,
	requestColumnsValueToLoaclColumns = (requestColumns) => {
		let { columns, maxColNum } = this.props;
		maxColNum = maxColNum || this.state.stateColumns.length;
		let loaclColumns = _.cloneDeep(columns);
		let selectCount = 0;
		_.forEach(loaclColumns, column => {
			let sameItem = requestColumns.find(item => item.dataIndex === column.dataIndex);
			if (sameItem) {
				column.selected = sameItem.selected;
				if (column.selected) {
					selectCount++
				}
			}
		});
		if (selectCount === maxColNum) {
			_.forEach(loaclColumns, column => {
				if (!column.selected) {
					column.disabled = true;
				}
			});
		}
		return loaclColumns
	}

	saveColumns = () => {
		let { dispatch, pageId, name, sysId } = this.props;
		let { tempStateColumns, confirmLoading } = this.state;
		if (confirmLoading) {
			return;
		}

		this.setState({
			confirmLoading: true
		});

		let colNum = _.filter(tempStateColumns, (col) => {
			return col.selected === true;
		}).length;

		_.each(tempStateColumns, (tempCol) => {
			tempCol.width = `${_.divide(100, colNum)}%`;
		});
		let getUserInfo = (name && name === 'CMDB-resource') ? requestFlowUserInfoCmdb : requestFlowUserInfo;

		dispatch(getUserInfo({}, (userData) => {
			let userId = (name && name === 'CMDB-resource') ? userData.id : userData.drafterCode;
			let params = (name && name === 'CMDB-resource') ? { userId, pageId, sysId, columns: JSON.stringify(tempStateColumns) } : { pageId, userId, columns: JSON.stringify(tempStateColumns) };
			let _saveTableColumns = (name && name === 'CMDB-resource') ? saveTableColumnsCmdb : saveTableColumns;
			dispatch(_saveTableColumns(params, () => {
				this.setState({
					columnModalVisible: false,
					stateColumns: tempStateColumns,
					confirmLoading: false
				}, () => {
					document.body.style.overflow = 'auto';
				});
			}));
		}))
	}

	onColumnsCheck = (checkedValues) => {
		let { showSetting, maxColNum } = this.props;
		maxColNum = maxColNum || this.state.stateColumns.length;
		if (showSetting) {
			let stateColumns = _.cloneDeep(this.state.stateColumns);
			_.each(stateColumns, (col) => {
				if (_.includes(checkedValues, col.dataIndex || col.key)) {
					col.selected = true;
				} else {
					col.selected = false;
				}
			});

			if (checkedValues.length >= maxColNum) {
				_.each(stateColumns, (col) => {
					if (!col.selected) {
						col.disabled = true;
					} else {
						col.disabled = false;
					}
				});
			} else {
				_.each(stateColumns, (col) => {
					col.disabled = false;
				});
			}
			this.setState({
				tempStateColumns: stateColumns
			});
		}
	}
	/** 在弹出框中动态配置表格显示的列名 === End */

	componentDidMount() {
		let { dispatch, pageId, showSetting, columns, name, sysId } = this.props;
		if (!!showSetting) {
			let getUserInfo = (name && name === 'CMDB-resource') ? requestFlowUserInfoCmdb : requestFlowUserInfo;
			dispatch(getUserInfo({}, (userData) => {
				let userId = (name && name === 'CMDB-resource') ? userData.id : userData.drafterCode;
				let _getTableColumns = (name && name === 'CMDB-resource') ? getTableColumnsCmdb : getTableColumns;
				let params = (name && name === 'CMDB-resource') ? { userId, pageId, sysId } : { userId, pageId };
				dispatch(_getTableColumns(params, (colData) => {
					let resColumns = JSON.parse(colData.columns);
					let loaclColumns = [];
					if (name && name === 'CMDB-resource') {
						loaclColumns = resColumns;
					} else {
						loaclColumns = this.requestColumnsValueToLoaclColumns(resColumns);
					}
					this.setState({
						stateColumns: _.cloneDeep(loaclColumns),
						tempStateColumns: loaclColumns,
					});
				}));
			}));
		}
	}

	render() {
		let { selectedRowKeys, needTotalList, columnModalVisible, stateColumns = [], tempStateColumns = [],
			maxColNum, configCheckLoading, confirmLoading } = this.state;
		let { data = {}, rowKey, rowSelection, showTotal, showSetting, columns = [], ...rest } = this.props;
		let { list = [], pagination } = data;
		maxColNum = maxColNum || stateColumns.length;
		let paginationProps = pagination === false
			? false : {
				showSizeChanger: true,
				showQuickJumper: true,
				pageSizeOptions: ['10', '20', '30', '40', '50', '100'],
				...pagination,
			};

		let rowSelectionProps = !!rowSelection === false
			? null : {
				...rowSelection,
				selectedRowKeys,
				onChange: this.handleRowSelectChange,
				getCheckboxProps: record => ({
					disabled: record.disabled,
				})
			};

		let allColumns = !!showSetting && !_.isEmpty(stateColumns) ? stateColumns : columns,
			finalCheckedColumns = _.filter(allColumns, (col) => {
				return col.selected === true;
			}),
			checkedColumnValues = _.map(tempStateColumns, (col) => {
				if (col.selected === true) {
					return col.dataIndex || col.key;
				}
			});
		checkedColumnValues = _.compact(checkedColumnValues);
		_.each(finalCheckedColumns, (checkedCol) => {
			let i = _.findIndex(columns, (o) => { return o.dataIndex === checkedCol.dataIndex || o.dataIndex === checkedCol.key || (o.key && o.key === checkedCol.key); });
			if (columns[i] && _.isFunction(columns[i].render)) {
				checkedCol.render = columns[i].render;
			}
		});

		return (
			<div className={styles.standardTable}>
				{
					showTotal &&
					<div className={styles.tableAlert}>
						<Alert
							message={
								<Fragment>
									已选择 <a style={{ fontWeight: 600 }}>{selectedRowKeys.length}</a> 项&nbsp;&nbsp;
									{needTotalList.map(item => (
									<span style={{ marginLeft: 8 }} key={item.dataIndex}>
										{item.title}
											总计&nbsp;
										<span style={{ fontWeight: 600 }}>
											{item.render ? item.render(item.total) : item.total}
										</span>
									</span>
								))}
									<a onClick={this.cleanSelectedKeys} style={{ marginLeft: 24 }}>清空</a>
								</Fragment>
							}
							type='info'
							showIcon
						/>
					</div>
				}
				{
					showSetting &&
					<Row>
						<Col span={4} offset={20} className={styles.settingBox}>
							<Tooltip placement='topLeft' title='设置列表字段'>
								<Button
									type='primary'
									shape='circle'
									icon='setting'
									className={styles.setting}
									onClick={this.openColumnModal.bind(this)}
								/>
							</Tooltip>
						</Col>
					</Row>
				}
				<Modal
					title='设置列表字段'
					visible={columnModalVisible}
					onOk={this.saveColumns.bind(this)}
					onCancel={this.closeColumnModal.bind(this)}
					confirmLoading={confirmLoading}
				>
					<Row>
						<Col>
							<Alert
								type='info'
								message={
									[
										<Row key={'选择要显示的colums'} ><Col>选择您想要显示在列表里的信息，最多选择 {maxColNum || 0} 项。</Col></Row>,
										<Row key={'您还可以继续添加  '} ><Col>您还可以继续添加 <span style={{ color: 'red' }}>{maxColNum - checkedColumnValues.length}</span> 项</Col></Row>
									]
								}
							/>
						</Col>
					</Row>
					<Spin spinning={configCheckLoading}>
						<Row>
							{
								<Checkbox.Group value={checkedColumnValues} onChange={this.onColumnsCheck.bind(this)} style={{ width: '100%' }}>
									<Row>
										{
											_.map(tempStateColumns, (item) => {
												return (
													<Col span={6} key={item.dataIndex || item.key} style={{ marginTop: 8 }}>
														<Checkbox
															disabled={item.disabled}
															value={item.dataIndex || item.key}
														>
															{item.title}
														</Checkbox>
													</Col>
												);
											})
										}
									</Row>
								</Checkbox.Group>
							}
						</Row>
					</Spin>
				</Modal>
				<Table
					rowKey={rowKey || 'key'}
					rowSelection={rowSelectionProps}
					columns={showSetting ? finalCheckedColumns : columns}
					dataSource={list}
					pagination={paginationProps}
					onChange={this.handleTableChange}
					onRow={(record) => ({
						onClick: () => {
							this.selectRow(record);
						}
					})}
					{...rest}
				/>
			</div>
		);
	}
}

export default connect((state) => {
	return {

	};
})(StandardTable);