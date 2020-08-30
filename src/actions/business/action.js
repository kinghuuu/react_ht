import _ from 'lodash';
import xFetch from '../../util/xFetch';
import { message } from 'antd';
import { ContextPath } from '../../constants';
import {
    UPDATE_BUSINESS_ATTRIBUTE_LIST,
    UPDATE_BUSINESS_ATTRIBUTE_LIST_LOADING,
    UPDATE_BUSINESS_ATTRIBUTE_LIST_PAGINATION,
} from '../../constants/business/actionType';

const getBusinessListUrl = `${ContextPath}/cmdbBusiness/getBusinessList`;
const createBusinessUrl = `${ContextPath}/cmdbBusiness/createBusiness`;
const updateBusinessUrl = `${ContextPath}/cmdbBusiness/updateBusiness`;
const deleteBusinessUrl = `${ContextPath}/cmdbBusiness/deleteBusiness`;

// 更新
function updateBusinessList(data) {
    return {
        type: UPDATE_BUSINESS_ATTRIBUTE_LIST,
        payload: data
    };
}
function updateBusinessListLoading(data) {
    return {
        type: UPDATE_BUSINESS_ATTRIBUTE_LIST_LOADING,
        payload: data
    };
}
function updateBusinessListPagination(data) {
    return {
        type: UPDATE_BUSINESS_ATTRIBUTE_LIST_PAGINATION,
        payload: data
    };
}

function getBusinessList(data, callback) {
    return dispatch => {
        dispatch(updateBusinessListLoading({ tableLoading: true, buttonLoading: true }))
        xFetch(getBusinessListUrl, {
            method: 'post',
            data: JSON.stringify(data),
        }).then(result => {
            const { limit, pageIndex, parentId = '-1', editId = false } = data;
            dispatch(updateBusinessListLoading({ tableLoading: false, buttonLoading: false }))
            if (result.hasError) {
                message.error(result.error || '请求错误');
                return;
            }
            dispatch(updateBusinessListPagination({ limit, pageIndex }));
            _.forEach(result.rows, (item, index) => {
                item.serialNumber = pageIndex * limit + index + 1;
                if (_.isArray(item.children)) {
                    if (_.isEmpty(item.children)) {
                        item.children = undefined;
                    } else {
                        item.children.forEach(it => {
                            if (_.isEmpty(it.children)) {
                                it.children = undefined;
                            }
                        });
                    }
                }
            });
            dispatch(updateBusinessList({ ...result, parentId, editId }));
            if (_.isFunction(callback)) {
                callback(result);
            }

        });
    };
}

function createBusiness(data, scb, ecb) {
    return dispatch => {
        xFetch(createBusinessUrl, {
            method: 'post',
            data: JSON.stringify(data),
        }).then((result = {}) => {
            const { hasError, error } = result;
            if (hasError) {
                if (_.isFunction(ecb)) {
                    ecb(error);
                }
                return;
            }
            if (_.isFunction(scb)) {
                scb(result);
            }
        });
    };
}

function updateBusiness(data, scb, ecb) {
    return dispatch => {
        xFetch(updateBusinessUrl, {
            method: 'post',
            data: JSON.stringify(data),
        }).then((result = {}) => {
            const { hasError, error } = result;
            if (hasError) {
                if (_.isFunction(ecb)) {
                    ecb(error);
                }
                return;
            }
            if (_.isFunction(scb)) {
                scb(result);
            }
        });
    };
}

function deleteBusiness(data, scb, ecb) {
    return dispatch => {
        dispatch(updateBusinessListLoading({ tableLoading: true, buttonLoading: false }));
        xFetch(deleteBusinessUrl, {
            method: 'post',
            data: JSON.stringify(data),
        }).then((result = {}) => {
            dispatch(updateBusinessListLoading({ tableLoading: false, buttonLoading: false }));
            const { hasError, error } = result;
            if (hasError) {
                if (_.isFunction(ecb)) {
                    ecb(error);
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
    getBusinessList,
    createBusiness,
    updateBusiness,
    deleteBusiness,
};