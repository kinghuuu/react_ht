import _ from 'lodash';
import xFetch from '../../util/xFetch';
import { message } from 'antd';
import { ContextPath } from '../../constants';
import {
    UPDATE_MAINTENANCE_LIST,
    UPDATE_MAINTENANCE_LIST_LOADING,
    UPDATE_MAINTENANCE_LIST_PAGINATION
} from '../../constants/maintenance/actionType';

//维保 查询
const queryMaintenanceListInfoUrl = `${ContextPath}/maintenance/queryMaintenanceListInfo`;
//维保 新增
const addMaintenanceUrl = `${ContextPath}/maintenance/addMaintenance`;
//维保 修改
const updateMaintenanceUrl = `${ContextPath}/maintenance/updateMaintenance`;
//维保 删除
const deleteMaintenanceByIdUrl = `${ContextPath}/maintenance/deleteMaintenanceById`;
//查询 单条
const selectMaintenanceByIdUrl = `${ContextPath}/maintenance/selectMaintenanceById`;
//查询 维保服务内容和形式
const selectMaintenanceContentUrl = `${ContextPath}/cmdbCommon/getParameterList`;

// 公用接口 =================================================================================================
function updateMaintenanceList(data) {
    return {
        type: UPDATE_MAINTENANCE_LIST,
        payload: data
    };
}
function updateMaintenanceListLoading(data) {
    return {
        type: UPDATE_MAINTENANCE_LIST_LOADING,
        payload: data
    };
}
function updateMaintenanceListPagination(data) {
    return {
        type: UPDATE_MAINTENANCE_LIST_PAGINATION,
        payload: data
    };
}

//维保 查询
function queryMaintenanceListInfo(data, callback) {
    return dispatch => {
        dispatch(updateMaintenanceListLoading({ tableLoading: true, buttonLoading: true }))
        xFetch(queryMaintenanceListInfoUrl, {
            method: 'post',
            data: JSON.stringify(data)
        }).then(result => {
            const { limit, pageIndex } = data;
            dispatch(updateMaintenanceListLoading({ tableLoading: false, buttonLoading: false }))
            if (result.hasError) {
                message.error(result.error || '请求错误');
                return;
            }
            dispatch(updateMaintenanceListPagination({ limit, pageIndex }));
            _.forEach(result.rows, (item, index) => {
                item.serialNumber = pageIndex * limit + index + 1
            });
            dispatch(updateMaintenanceList(result));
            if (_.isFunction(callback)) {
                callback(result);
            }
        })
    }
}

//维保 新增
function addMaintenance(data, scb, ecb) {
    return dispatch => {
        xFetch(addMaintenanceUrl, {
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

//维保 修改
function updateMaintenance(data, scb, ecb) {
    return dispatch => {
        xFetch(updateMaintenanceUrl, {
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

//维保 删除
function deleteMaintenanceById(data, scb, ecb) {
    return dispatch => {
        xFetch(deleteMaintenanceByIdUrl, {
            method: 'get',
            data: data,
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

//查询 单条
function selectMaintenanceById(data, scb, ecb) {
    return dispatch => {
        xFetch(selectMaintenanceByIdUrl, {
            method: 'get',
            data: data,
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

//查询 维保服务内容和形式
function selectMaintenanceContent(data, scb, ecb) {
    return dispatch => {
        xFetch(selectMaintenanceContentUrl, {
            method: 'get',
            data: data,
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
    }
}

export {
    queryMaintenanceListInfo,
    addMaintenance,
    updateMaintenance,
    deleteMaintenanceById,
    selectMaintenanceById,
    selectMaintenanceContent
}
