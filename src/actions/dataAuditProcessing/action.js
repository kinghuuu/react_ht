import _ from 'lodash';
import xFetch from '../../util/xFetch';
import { message } from 'antd';
import { ContextPath } from '../../constants';
import {
    UPDATE_DATA_AUDIT_PROCESSING_LIST,
    UPDATE_DATA_AUDIT_PROCESSING_LIST_LOADING,
    UPDATE_DATA_AUDIT_PROCESSING_LIST_PAGINATION,
} from '../../constants/dataAuditProcessing/actionType';

const getDataAuditProcessinglistUrl = `${ContextPath}/cmdbCheck/getProcessList`;

// 更新
function updateDataAuditProcessinglist(data) {
    return {
        type: UPDATE_DATA_AUDIT_PROCESSING_LIST,
        payload: data
    };
}
function updateDataAuditProcessinglistLoading(data) {
    return {
        type: UPDATE_DATA_AUDIT_PROCESSING_LIST_LOADING,
        payload: data
    };
}
function updateDataAuditProcessinglistPagination(data) {
    return {
        type: UPDATE_DATA_AUDIT_PROCESSING_LIST_PAGINATION,
        payload: data
    };
}

function getDataAuditProcessinglist(data, callback) {
    return dispatch => {
        dispatch(updateDataAuditProcessinglistLoading({ tableLoading: true, buttonLoading: true }))
        xFetch(getDataAuditProcessinglistUrl, {
            method: 'post',
            data: JSON.stringify(data),
        }).then((result = { rows: [] }) => {
            const { limit, pageIndex } = data;
            dispatch(updateDataAuditProcessinglistLoading({ tableLoading: false, buttonLoading: false }))
            if (result.hasError) {
                message.error(result.error || '请求错误')
                return;
            }
            dispatch(updateDataAuditProcessinglistPagination({ limit, pageIndex }));
            _.forEach(result.rows, (item, index) => {
                item.serialNumber = pageIndex * limit + index + 1
            });
            dispatch(updateDataAuditProcessinglist(result));
            if (_.isFunction(callback)) {
                callback(result);
            }
        });
    };
}

export {
    getDataAuditProcessinglist
};