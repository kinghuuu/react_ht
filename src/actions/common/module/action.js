import xFetch from '../../../util/xFetch';
import _ from 'lodash';
import { message } from 'antd';
import { ContextPath } from '../../../constants';
import {
    UPDATE_ASSET_TYPE,
    UPDATE_MY_COLUMNS,
    UPDATE_MODULE_AUTH
} from '../../../constants/common/module/actionTypes';


const getParamUrl = `${ContextPath}/select/getParam`; //获取公用参数
const getUpRoomsUrl = `${ContextPath}/select/getUpRooms`; //获取机房
const useStatusUrl = `${ContextPath}/select/usestatus`; //获取使用状态
const teamUrl = `${ContextPath}/select/team`; //获取所属团队信息
const getAllPeopleUrl = `${ContextPath}/select/getAllPeople`; //获取使用人信息
const brandUrl = `${ContextPath}/select/brand`; //获取品牌列表
const modelUrl = `${ContextPath}/select/model`; //获取模型列表
const authUrl = `${ContextPath}/getFunResAuth`;
const assetTypeUrl = `${ContextPath}/select/getAssetTypes`; //获取资产类别
const getColumns = `${ContextPath}/getColumns`; //获取表格title
const getColumnsCmdb = `${ContextPath}/cmdbColumn/getColumns`; //获取表格title-CMDB
const saveColumns = `${ContextPath}/saveColumns`; //保存表格title
const saveColumnsCmdb = `${ContextPath}/cmdbColumn/saveColumns`; //保存表格title-CMDB
const getAssetAllUrl = `${ContextPath}/asset/getAll`; //获取设备列表
const getSystemListUrl = `${ContextPath}/cmdb/applications/queryMy`; //获取设备列表


function getTableColumns(data, callback) {
    return dispatch => {
        xFetch(getColumns, {
            data: JSON.stringify(data),
            method: 'post'
        }).then(res => {
            if (res.hasError) {
                return;
            }
            dispatch({
                type: UPDATE_MY_COLUMNS,
                payload: JSON.parse(res.columns)
            });
            if (_.isFunction(callback)) {
                callback(res);
            }
        });
    };
}
function getTableColumnsCmdb(data, callback) {
    return dispatch => {
        xFetch(getColumnsCmdb, {
            data: JSON.stringify(data),
            method: 'post'
        }).then(res => {
            if (res.hasError) {
                return;
            }
            dispatch({
                type: UPDATE_MY_COLUMNS,
                payload: JSON.parse(res.columns)
            });
            if (_.isFunction(callback)) {
                callback(res);
            }
        });
    };
}

function saveTableColumns(data, callback) {
    return dispatch => {
        xFetch(saveColumns, {
            data: JSON.stringify(data),
            method: 'post'
        }).then(res => {
            if (res.hasError) {
                return;
            }
            if (_.isFunction(callback)) {
                callback(res);
            }
        });
    };
}
function saveTableColumnsCmdb(data, callback) {
    return dispatch => {
        xFetch(saveColumnsCmdb, {
            data: JSON.stringify(data),
            method: 'post'
        }).then(res => {
            if (res.hasError) {
                return;
            }
            if (_.isFunction(callback)) {
                callback(res);
            }
        });
    };
}

function getParam(data = {}, callback) {
    return dispatch => {
        xFetch(getParamUrl, {
            data: data,
            method: 'post',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then(res => {
            if (res.hasError) {
                return
            }
            if (_.isFunction(callback)) {
                callback(res)
            }
        });
    };
}

function getAssetTypes() {
    return dispatch => {
        xFetch(assetTypeUrl)
            .then((result) => {
                if (result.hasError) {
                    return;
                } else {
                    dispatch({
                        type: UPDATE_ASSET_TYPE,
                        payload: result
                    });
                }
            });
    };
}

function getUpRooms(data, scb, ecb) {
    return dispatch => {
        xFetch(getUpRoomsUrl, {
            data: data,
            method: 'get',
        }).then(result => {
            if (_.isFunction(scb)) {
                scb(result);
            }
        }).fail(() => {
            if (_.isFunction(ecb)) {
                ecb();
            }
        });
    };
}

function useStatus(data, scb, ecb) {
    return dispatch => {
        xFetch(useStatusUrl, {
            data: data,
            method: 'get',
        }).then(result => {
            if (_.isFunction(scb)) {
                scb(result);
            }
        }).fail(() => {
            if (_.isFunction(ecb)) {
                ecb();
            }
        });
    };
}
function team(data, scb, ecb) {
    return dispatch => {
        xFetch(teamUrl, {
            data: data,
            method: 'get',
        }).then(result => {
            if (_.isFunction(scb)) {
                scb(result);
            }
        }).fail(() => {
            if (_.isFunction(ecb)) {
                ecb();
            }
        });
    };
}
function getAllPeople(data, scb, ecb) {
    return dispatch => {
        xFetch(getAllPeopleUrl, {
            data: data,
            method: 'post',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then(result => {
            if (_.isFunction(scb)) {
                scb(result);
            }
        }).fail(() => {
            if (_.isFunction(ecb)) {
                ecb();
            }
        });
    };
}
function getBrandUrl(data, scb, ecb) {
    return dispatch => {
        xFetch(brandUrl, {
            data: data,
            method: 'post',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then(result => {
            if (_.isFunction(scb)) {
                scb(result);
            }
        }).fail(() => {
            if (_.isFunction(ecb)) {
                ecb();
            }
        });
    };
}
function getModelUrl(data, scb, ecb) {
    return dispatch => {
        xFetch(modelUrl, {
            data: data,
            method: 'post',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then(result => {
            if (_.isFunction(scb)) {
                scb(result);
            }
        }).fail(() => {
            if (_.isFunction(ecb)) {
                ecb();
            }
        });
    };
}

const getModuleAuth = (pageId, scb, ecb) => {
    return dispatch => {
        xFetch(authUrl, {
            data: {
                id: pageId
            }
        }).then(result => {
            if (_.isFunction(scb)) {
                scb(result);
            }
            dispatch({
                type: UPDATE_MODULE_AUTH,
                payload: result
            });
        }).fail(() => {
            if (_.isFunction(ecb)) {
                ecb();
            }
        });
    };
}

const getAssetAll = (data, scb, ecb) => {
    return dispatch => {
        xFetch(getAssetAllUrl, {
            data: data,
            method: 'post',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then(result => {
            if (_.isFunction(scb)) {
                scb(result);
            }
        }).fail(() => {
            if (_.isFunction(ecb)) {
                ecb();
            }
        });
    };
}

const getSystemList = (data, scb) => {
    return dispatch => {
        xFetch(getSystemListUrl, {
            method: 'post',
            data: JSON.stringify(data)
        }).then((res = {}) => {
            const { hasError, error = '查询失败', rows = [] } = res;
            if (hasError) {
                message.error(error);
            }
            if (_.isFunction(scb)) {
                scb(rows);
            }
        }).catch(error => {
            console.error(error);
        });
    }
};

export {
    getParam,
    getAssetTypes,
    getUpRooms,
    useStatus,
    team,
    getAllPeople,
    getBrandUrl,
    getModelUrl,
    getTableColumns,
    getTableColumnsCmdb,
    saveTableColumns,
    saveTableColumnsCmdb,
    getModuleAuth,
    getAssetAll,
    getSystemList,
};