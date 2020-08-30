import _ from 'lodash';
import xFetch from '../../util/xFetch';
import { message } from 'antd';
import { ContextPath } from '../../constants';
import {
    UPDATE_SELF_DEFINING_ATTRIBUTE_LIST,
    UPDATE_SELF_DEFINING_ATTRIBUTE_LIST_LOADING,
    UPDATE_SELF_DEFINING_ATTRIBUTE_LIST_PAGINATION,
} from '../../constants/selfDefining/actionType';

const getSelfDefiningListUrl = `${ContextPath}/selfDefining/getSelfDefiningList`;
const createSelfDefiningPropertyUrl = `${ContextPath}/selfDefining/createSelfDefiningProperty`;
const updateSelfDefiningPropertyUrl = `${ContextPath}/selfDefining/updateSelfDefiningProperty`;
const deleteSelfDefiningUrl = `${ContextPath}/selfDefining/deleteSelfDefining`;



// 更新
function updateSelfDefiningAttributes(data) {
    return {
        type: UPDATE_SELF_DEFINING_ATTRIBUTE_LIST,
        payload: data
    };
}
function updateSelfDefiningAttributesLoading(data) {
    return {
        type: UPDATE_SELF_DEFINING_ATTRIBUTE_LIST_LOADING,
        payload: data
    };
}
function updateSelfDefiningAttributesPagination(data) {
    return {
        type: UPDATE_SELF_DEFINING_ATTRIBUTE_LIST_PAGINATION,
        payload: data
    };
}

function getSelfDefiningList(data, callback) {
    return dispatch => {
        dispatch(updateSelfDefiningAttributesLoading({ tableLoading: true, buttonLoading: true }))
        xFetch(getSelfDefiningListUrl, {
            method: 'post',
            data: JSON.stringify(data),
        }).then(result => {
            const { limit, pageIndex } = data;
            dispatch(updateSelfDefiningAttributesLoading({ tableLoading: false, buttonLoading: false }))
            if (result.error) {
                return;
            }
            dispatch(updateSelfDefiningAttributesPagination({ limit, pageIndex }));
            _.forEach(result.rows, (item, index) => {
                item.serialNumber = pageIndex * limit + index + 1
            });
            dispatch(updateSelfDefiningAttributes(result));
            if (_.isFunction(callback)) {
                // result.rows = []
                callback(result);
            }

        });
    };
}

function createSelfDefiningProperty(data, scb, ecb) {
    return dispatch => {
        xFetch(createSelfDefiningPropertyUrl, {
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

function updateSelfDefiningProperty(data, scb, ecb) {
    return dispatch => {
        xFetch(updateSelfDefiningPropertyUrl, {
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

function deleteSelfDefining(data, scb, ecb) {
    return dispatch => {
        dispatch(updateSelfDefiningAttributesLoading({ tableLoading: true, buttonLoading: false }));
        xFetch(deleteSelfDefiningUrl, {
            method: 'post',
            data: JSON.stringify(data),
        }).then((result = {}) => {
            dispatch(updateSelfDefiningAttributesLoading({ tableLoading: false, buttonLoading: false }));
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
    getSelfDefiningList,
    createSelfDefiningProperty,
    updateSelfDefiningProperty,
    deleteSelfDefining,
};