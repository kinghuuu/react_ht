import _ from 'lodash';
import xFetch from '../../util/xFetch';
import { message } from 'antd';
import { ContextPath } from '../../constants';
import {
    UPDATE_RESOURCE_POOL_LIST,
    UPDATE_RESOURCE_POOL_LIST_LOADING,
    UPDATE_RESOURCE_POOL_LIST_PAGINATION,
} from '../../constants/resource/actionType';

const getResourcePoolListUrl = `${ContextPath}/cmdbResource/queryAssetsByIpAndStatus`;


// 更新
function updateResourcePoolList(data) {
    return {
        type: UPDATE_RESOURCE_POOL_LIST,
        payload: data
    };
}
function updateResourcePoolListLoading(data) {
    return {
        type: UPDATE_RESOURCE_POOL_LIST_LOADING,
        payload: data
    };
}
function updateResourcePoolListPagination(data) {
    return {
        type: UPDATE_RESOURCE_POOL_LIST_PAGINATION,
        payload: data
    };
}

function getResourcePoolList(data, callback) {
    return dispatch => {
        dispatch(updateResourcePoolListLoading({ tableLoading: true, buttonLoading: true }))
        xFetch(getResourcePoolListUrl, {
            method: 'post',
            data: JSON.stringify(data),
        }).then((result = { rows: [] }) => {
            const { limit, pageIndex } = data;
            dispatch(updateResourcePoolListLoading({ tableLoading: false, buttonLoading: false }))
            if (result.hasError) {
                message.error(result.error || '请求错误')
                return;
            }
            dispatch(updateResourcePoolListPagination({ limit, pageIndex }));
            _.forEach(result.rows, (item, index) => {
                item.serialNumber = pageIndex * limit + index + 1
            });
            result.results = result.rows.length;
            dispatch(updateResourcePoolList(result));
            if (_.isFunction(callback)) {
                callback(result);
            }
        });
    };
}

export {
    getResourcePoolList,
    updateResourcePoolListPagination,
};