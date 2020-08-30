import _ from 'lodash';
import xFetch from '../../util/xFetch';
import { message } from 'antd';
import { ContextPath } from '../../constants';
import {
    UPDATE_CONTRACT_LIST,
    UPDATE_CONTRACT_LIST_LOADING,
    UPDATE_CONTRACT_LIST_PAGINATION
} from '../../constants/contract/actionType';

//查询 合同信息
const queryMaintenanceContractInfoUrl = `${ContextPath}/maintenanceContract/queryMaintenanceContractInfo`;

//查询 待发送消息列表
const queryNotifyContractDataUrl = `${ContextPath}/maintenanceContract/queryNotifyContractData`;
//编辑 待发送消息
const updateNotifyDataUrl = `${ContextPath}/maintenanceContract/updateNotifyData`
//发送消息给通知人
const sendMsgToNotifyPersonUrl = `${ContextPath}/maintenanceContract/sendMsgToNotifyPerson`

// 公用接口 =================================================================================================
function updateContractList(data) {
    return {
        type: UPDATE_CONTRACT_LIST,
        payload: data
    };
}
function updateContractListLoading(data) {
    return {
        type: UPDATE_CONTRACT_LIST_LOADING,
        payload: data
    };
}
function updateContractListPagination(data) {
    return {
        type: UPDATE_CONTRACT_LIST_PAGINATION,
        payload: data
    };
}

//查询 合同信息
function queryMaintenanceContractInfo(data, callback) {
    return dispatch => {
        dispatch(updateContractListLoading({ tableLoading: true, buttonLoading: true }))
        xFetch(queryMaintenanceContractInfoUrl, {
            method: 'post',
            data: JSON.stringify(data)
        }).then(result => {
            const { limit, pageIndex } = data;
            dispatch(updateContractListLoading({ tableLoading: false, buttonLoading: false }))
            if (result.hasError) {
                message.error(result.error || '请求错误');
                return;
            }
            dispatch(updateContractListPagination({ limit, pageIndex }));
            _.forEach(result.rows, (item, index) => {
                item.serialNumber = pageIndex * limit + index + 1
            });
            dispatch(updateContractList(result));
            if (_.isFunction(callback)) {
                callback(result);
            }
        })
    }
}

//查询 待发送消息列表
function queryNotifyContractData(data, callback) {
    return dispatch => {
        dispatch(updateContractListLoading({ tableLoading: true, buttonLoading: true }))
        xFetch(queryNotifyContractDataUrl, {
            method: 'post',
            data: JSON.stringify(data)
        }).then(result => {
            const { limit, pageIndex } = data;
            dispatch(updateContractListLoading({ tableLoading: false, buttonLoading: false }))
            if (result.hasError) {
                message.error(result.error || '请求错误');
                return;
            }
            dispatch(updateContractListPagination({ limit, pageIndex }));
            _.forEach(result.rows, (item, index) => {
                item.serialNumber = pageIndex * limit + index + 1
            });
            dispatch(updateContractList(result));
            if (_.isFunction(callback)) {
                callback(result);
            }
        })
    }
}

function updateNotifyData(data, scb, ecb) {
    return dispatch => {
        xFetch(updateNotifyDataUrl, {
            method: 'post',
            data: JSON.stringify(data),
        }).then(result => {
            if (result.hasError) {
                if (_.isFunction(ecb)) {
                    ecb(result.error)
                }
                return;
            }
            if (_.isFunction(scb)) {
                scb(result);
            }
        });
    };
}

function sendMsgToNotifyPerson(data, scb, ecb) {
    console.log('sendMsgToNotifyPerson data:', data)
    return dispatch => {
        xFetch(sendMsgToNotifyPersonUrl, {
            method: 'post',
            data: JSON.stringify(data),
        }).then(result => {
            if (result.hasError) {
                if (_.isFunction(ecb)) {
                    ecb(result.error)
                }
                return;
            }
            if (_.isFunction(scb)) {
                scb(result);
            }
        });
    };
}

export {
    queryMaintenanceContractInfo,
    queryNotifyContractData,
    updateNotifyData,
    sendMsgToNotifyPerson
}