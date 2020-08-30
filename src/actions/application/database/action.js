import xFetch from '../../../util/xFetch';
import { ContextPath } from '../../../constants';
import _ from 'lodash';
import { message } from 'antd';
import {
    UPDATE_ORACLE_LIST, UPDATE_ORACLE_LIST_LOADING,
    UPDATE_MYSQL_LIST, UPDATE_MYSQL_LIST_LOADING
} from "../../../constants/application/database/actionTypes";

const getListUrl = `${ContextPath}/cmdbCommon/getModelList`; //公共的查询
const createUrl = `${ContextPath}/cmdbCommon/createModel`; //公共的添加 
const updateUrl = `${ContextPath}/cmdbCommon/updateModel`; //公共的修改
const deleteURl = `${ContextPath}/cmdbCommon/deleteModels`;//公共的删除

function getOracleList(data, scb, ecb) {
    return dispatch => {
        dispatch(updateOracleLoading({ tableLoading: true }));
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
            dispatch(updateOracleList(res));
            dispatch(updateOracleLoading({ tableLoading: false }));
        }).fail(() => {
            if (_.isFunction(ecb)) ecb();
        });
    };
}

function updateOracleList(data) {
    return {
        type: UPDATE_ORACLE_LIST,
        payload: data
    };
}

function updateOracleLoading(data) {
    return {
        type: UPDATE_ORACLE_LIST_LOADING,
        payload: data
    };
}

function getMysqlList(data, scb, ecb) {
    return dispatch => {
        dispatch(updateMysqlLoading({ tableLoading: true }));
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
            dispatch(updateMysqlList(res));
            dispatch(updateMysqlLoading({ tableLoading: false }));
        }).fail(() => {
            if (_.isFunction(ecb)) ecb();
        });
    };
}

function updateMysqlList(data) {
    return {
        type: UPDATE_MYSQL_LIST,
        payload: data
    };
}

function updateMysqlLoading(data) {
    return {
        type: UPDATE_MYSQL_LIST_LOADING,
        payload: data
    };
}

function createMysql(data, scb, ecb) {
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

function updateMysql(data, scb, ecb) {
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

//删除
function deleteMysql(data, scb, ecb) {
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


function createOracle(data, scb, ecb) {
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

function updateOracle(data, scb, ecb) {
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

//删除
function deleteOracle(data, scb, ecb) {
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

function changeRecord(record, scb, ecb) {
    let nodeId = record.nodeId;
    let url;
    if (record.type == 'Oracle') {
        url = `${ContextPath}/cmdbForDataBase/oracle/${nodeId}/changeList/`
    } else if (record.type == 'Mysql') {
        url = `${ContextPath}/cmdbForDataBase/mysql/${nodeId}/changeList/`
    }
    return dispatch => {
        xFetch(url, {
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

function getdblinkList(data, scb, ecb) {
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

function createdblink(data, scb, ecb) {
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


function updatedblink(data, scb, ecb) {
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

function deletedblink(data, scb, ecb) {
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

export {
    getOracleList,
    getMysqlList,
    createMysql,
    updateMysql,
    deleteMysql,
    createOracle,
    updateOracle,
    deleteOracle,
    changeRecord,
    getdblinkList,
    createdblink,
    updatedblink,
    deletedblink

};

