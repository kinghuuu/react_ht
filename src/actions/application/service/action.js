import xFetch from '../../../util/xFetch';
import { ContextPath } from '../../../constants';
import _ from 'lodash';
import { message } from 'antd';
import { UPDATE_CMDBSERVE_LIST, UPDATE_CMDBSERVE_LIST_LOADING } from "../../../constants/application/service/actionTypes";

const onOffLineUrl = `${ContextPath}/cmdbForService/serviceUpOrDown`;
const getServiceSliListUrl = `${ContextPath}/cmdbForServiceSli/getServiceSliList`; //服务--sli列表
const saveServiceSliUrl = `${ContextPath}/cmdbForServiceSli/saveServiceSli`;// 服务--sli保存
const getParamListForSliUrl = `${ContextPath}/cmdbForServiceSli/getParamList`;// 服务--sli指标类型列表
const getListUrl = `${ContextPath}/cmdbCommon/getModelList`; //公共的查询
const createUrl = `${ContextPath}/cmdbCommon/createModel`; //公共的添加 
const updateUrl = `${ContextPath}/cmdbCommon/updateModel`; //公共的修改
const deleteURl = `${ContextPath}/cmdbCommon/deleteModels`;//公共的删除


function getServeList(data, scb, ecb) {
    return dispatch => {
        dispatch(updateCMDBServeLoading({ tableLoading: true }));
        xFetch(getListUrl, {
            data: JSON.stringify(data),
            method: 'post',
            headers: { 'Content-Type': 'application/json' }
        }).then((res = { rows: [], results: 0 }) => {
            if (res.hasError) {
                message.error(res.error ? res.error : '查询失败');
                return;
            }
            if (_.isFunction(scb)) {
                scb(res);
            }
            dispatch(updateCMDBServeList(res));
            dispatch(updateCMDBServeLoading({ tableLoading: false }));
        }).fail(() => {
            if (_.isFunction(ecb)) ecb();
        });
    };
}

function updateCMDBServeList(data) {
    return {
        type: UPDATE_CMDBSERVE_LIST,
        payload: data
    };
}

function updateCMDBServeLoading(data) {
    return {
        type: UPDATE_CMDBSERVE_LIST_LOADING,
        payload: data
    };
}


function add(data, scb, ecb) {
    return dispatch => {
        xFetch(createUrl, {
            data: JSON.stringify(data),
            method: 'post',
            headers: { 'Content-Type': 'application/json;' }
        }).then((res = { rows: [], results: 0 }) => {
            if (res.hasError) {
                message.error(res.error ? res.error : '添加失败');
                // return;
            }
            if (_.isFunction(scb)) {
                scb(res);
            }
        }).fail(() => {
            if (_.isFunction(ecb)) ecb();
        });
    };
}

function update(data, scb, ecb) {
    return dispatch => {
        xFetch(updateUrl, {
            data: JSON.stringify(data),
            method: 'post',
            headers: { 'Content-Type': 'application/json' }
        }).then((res = { rows: [], results: 0 }) => {
            if (res.hasError) {
                message.error(res.error ? res.error : '编辑失败');
            }
            if (_.isFunction(scb)) {
                scb(res);
            }
        }).fail(() => {
            if (_.isFunction(ecb)) ecb();
        });
    };
}

function onOffLine(data, scb, ecb) {
    return dispatch => {
        xFetch(onOffLineUrl, {
            data: JSON.stringify(data),
            method: 'post',
            headers: { 'Content-Type': 'application/json' }

        }).then((res = { rows: [], results: 0 }) => {
            if (res.hasError) {
                message.error(res.error ? res.error : '上线或下线失败');
                return;
            }
            if (_.isFunction(scb)) {
                scb(res);
            }
        }).fail(() => {
            if (_.isFunction(ecb)) ecb();
        });
    };
}


function changeRecord(record, scb, ecb) {
    let nodeId = record.nodeId;
    return dispatch => {
        xFetch(`${ContextPath}/cmdbForService/service/${nodeId}/changeList/`, {
            method: 'get',
        }).then((res = { rows: [], results: 0 }) => {
            if (res.hasError) {
                message.error(res.error ? res.error : '查询失败');
                return;
            }
            if (_.isFunction(scb)) {
                scb(res);
            }
        }).fail(() => {
            if (_.isFunction(ecb)) ecb();
        });
    };
}

//删除
function deleteRecord(data, scb, ecb) {
    return dispatch => {
        xFetch(deleteURl, {
            data: JSON.stringify(data),
            method: 'post',
            headers: { 'Content-Type': 'application/json;' }
        }).then((res) => {
            if (res.hasError) {
                message.error(res.error ? res.error : '删除失败');
                return;
            }
            if (_.isFunction(scb)) {
                scb(res);
            }
        }).fail(() => {
            if (_.isFunction(ecb)) ecb();
        });
    };
}

function getServiceSliList(data, scb, ecb) {
    return dispatch => {
        xFetch(getServiceSliListUrl, {
            data: data,
            method: 'post',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' }
        }).then((res = { rows: [], results: 0 }) => {
            if (res.hasError) {
                message.error(res.error ? res.error : '查询失败');
                return;
            }
            if (_.isFunction(scb)) {
                scb(res);
            }
        }).fail(() => {
            if (_.isFunction(ecb)) ecb();
        });
    };
}

function saveServiceSli(data, scb, ecb) {
    return dispatch => {
        xFetch(saveServiceSliUrl, {
            data: JSON.stringify(data),
            method: 'post',
            headers: { 'Content-Type': 'application/json' }
        }).then((res = { rows: [], results: 0 }) => {
            if (res.hasError) {
                message.error(res.error ? res.error : '保存失败');
            }
            if (_.isFunction(scb)) {
                scb(res);
            }
        }).fail(() => {
            if (_.isFunction(ecb)) ecb();
        });
    };
}

function getParamListForSli(data, scb, ecb) {
    return dispatch => {
        xFetch(getParamListForSliUrl, {
            data: data,
            method: 'get',
            headers: { 'Content-Type': 'application/json' }
        }).then((res = { rows: [], results: 0 }) => {
            if (res.hasError) {
                message.error(res.error ? res.error : '获取指标类型列表失败');
                return;
            }
            if (_.isFunction(scb)) {
                scb(res);
            }
        }).fail(() => {
            if (_.isFunction(ecb)) ecb();
        });
    };
}

function getConsumeList(data, scb, ecb) {
    return dispatch => {
        xFetch(getListUrl, {
            data: JSON.stringify(data),
            method: 'post',
            headers: { 'Content-Type': 'application/json' }
        }).then((res = { rows: [], results: 0 }) => {
            if (res.hasError) {
                message.error(res.error ? res.error : '查询失败');
                return;
            }
            if (_.isFunction(scb)) {
                scb(res);
            }
        }).fail(() => {
            if (_.isFunction(ecb)) ecb();
        });
    };
}


function creatServiceConsume(data, scb, ecb) {
    return dispatch => {
        xFetch(createUrl, {
            data: JSON.stringify(data),
            method: 'post',
            headers: { 'Content-Type': 'application/json;' }
        }).then((res = { rows: [], results: 0 }) => {
            if (res.hasError) {
                message.error(res.error ? res.error : '添加失败');
            }
            if (_.isFunction(scb)) {
                scb(res);
            }
        }).fail(() => {
            if (_.isFunction(ecb)) ecb();
        });
    };
}

function deleteServiceConsume(data, scb, ecb) {
    return dispatch => {
        xFetch(deleteURl, {
            data: JSON.stringify(data),
            method: 'post',
            headers: { 'Content-Type': 'application/json;' }
        }).then((res) => {
            if (res.hasError) {
                message.error(res.error ? res.error : '删除失败');
                return;
            }
            if (_.isFunction(scb)) {
                scb(res);
            }
        }).fail(() => {
            if (_.isFunction(ecb)) ecb();
        });
    };
}

function updateServiceConsume(data, scb, ecb) {
    return dispatch => {
        xFetch(updateUrl, {
            data: JSON.stringify(data),
            method: 'post',
            headers: { 'Content-Type': 'application/json' }
        }).then((res = { rows: [], results: 0 }) => {
            if (res.hasError) {
                message.error(res.error ? res.error : '编辑失败');
            }
            if (_.isFunction(scb)) {
                scb(res);
            }
        }).fail(() => {
            if (_.isFunction(ecb)) ecb();
        });
    };
}


export {
    getServeList,
    add,
    update,
    deleteRecord,
    onOffLine,
    changeRecord,
    getServiceSliList,
    saveServiceSli,
    getParamListForSli,
    getConsumeList,
    creatServiceConsume,
    deleteServiceConsume,
    updateServiceConsume,
};

