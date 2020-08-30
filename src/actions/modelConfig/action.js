import _ from 'lodash';
import xFetch from '../../util/xFetch';
import { message } from 'antd';
import { ContextPath } from '../../constants';
import {
    UPDATE_MODEL_CONFIG_LIST,
    UPDATE_MODEL_CONFIG_LIST_LOADING,
    UPDATE_MODEL_CONFIG_LIST_PAGINATION,
    UPDATE_MODEL_CONFIG_RESOURCE_INFO,
    UPDATE_MODEL_CONFIG_RESOURCE_INFO_LOADING,
    UPDATE_MODEL_CONFIG_RESOURCE_INFO_PAGINATION,
} from '../../constants/modelConfig/actionType';

const queryMainSystemByCodeUrl = `${ContextPath}/cmdb/applications/queryMainSystemByCode`;
const getModelConfigListUrl = `${ContextPath}/cmdbCommon/getModelList`; // 查询
const getLineInfoListUrl = `${ContextPath}/cmdb/getLineInfoList`; // 通讯线路查询
const createModelUrl = `${ContextPath}/cmdbCommon/createModel`;   //保存基本属性
const updateModelUrl = `${ContextPath}/cmdbCommon/updateModel`;   //更新基本属性
const saveSelfDefiningValueUrl = `${ContextPath}/selfDefining/saveSelfDefiningValue`;   //保存自定义属性
const saveRelationValueUrl = `${ContextPath}/cmdbModel/saveRelationValue`;   //保存联动属性
const deleteModelsUrl = `${ContextPath}/cmdbCommon/deleteModels`;   //删除
const getModelInfoByBodeIdUrl = `${ContextPath}/cmdbCommon/getModelInfoByBodeId`;   //删除
const getResourceInfoByNodeIdUrl = `${ContextPath}/cmdbResource/getResourceInfoByNodeId`;


const getSelectListUrl = `${ContextPath}/selfDefining/getSelectList`;
const getRelationValueUrl = `${ContextPath}/cmdbModel/getRelationValue`;
const getSelfDefiningValueUrl = `${ContextPath}/selfDefining/getSelfDefiningValue`;
const getTreeListUrl = `${ContextPath}/cmdbCommon/getTreeList`;


const queryResourceInfoUrl = `${ContextPath}/cmdbResource/queryResourceInfo`;  //(根据流水号/ip查找主机信息)
const getAssetCountInfoUrl = `${ContextPath}/cmdbResource/getAssetCountInfo`;
const getChangeListUrl = `${ContextPath}/cmdbCommon/getChangeList`;

const querySystemFuzzyUrl = `${ContextPath}/cmdb/querySystemFuzzy`; //模块消费 获取系统
const saveAssetByIpAndSysIdUrl = `${ContextPath}/cmdbResource/saveAssetByIpAndSysId`; //关联其他系统的主机

const getProcessInfoByProgramIdUrl = `${ContextPath}/cmdbCommon/getProcessInfoByProgramId`;





function queryMainSystemByCode(data, scb, ecb) {
    return dispatch => {
        xFetch(queryMainSystemByCodeUrl, {
            method: 'get',
            data: data,
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

// 公用接口 =================================================================================================
function updateModelConfigList(data) {
    return {
        type: UPDATE_MODEL_CONFIG_LIST,
        payload: data
    };
}
function updateModelConfigListLoading(data) {
    return {
        type: UPDATE_MODEL_CONFIG_LIST_LOADING,
        payload: data
    };
}
function updateModelConfigListPagination(data) {
    return {
        type: UPDATE_MODEL_CONFIG_LIST_PAGINATION,
        payload: data
    };
}
function getModelConfigList(data, callback) {
    return dispatch => {
        dispatch(updateModelConfigListLoading({ tableLoading: true, buttonLoading: true }))
        xFetch(getModelConfigListUrl, {
            method: 'post',
            data: JSON.stringify(data),
        }).then(result => {
            const { limit, pageIndex } = data;
            dispatch(updateModelConfigListLoading({ tableLoading: false, buttonLoading: false }))
            if (result.hasError) {
                message.error(result.error || '请求错误');
                return;
            }
            dispatch(updateModelConfigListPagination({ limit, pageIndex }));
            _.forEach(result.rows, (item, index) => {
                item.serialNumber = pageIndex * limit + index + 1
            });
            dispatch(updateModelConfigList(result));
            if (_.isFunction(callback)) {
                callback(result);
            }
        });
    };
}

//通讯线路 查询
function getLineInfoList(data, callback) {
    return dispatch => {
        dispatch(updateModelConfigListLoading({ tableLoading: true, buttonLoading: true }))
        xFetch(getLineInfoListUrl, {
            method: 'post',
            data: JSON.stringify(data),
        }).then(result => {
            for (let i = 0; i < result.results; i++) {
                if (result.rows[i] && result.rows[i].lineGroupIdList && result.rows[i].lineGroupIdList.length > 1) {
                    let pList = result.rows[i].lineGroupIdList.join(',')
                    result.rows[i].lineGroupIdList = [pList]
                }
            }

            const { limit, pageIndex } = data;
            dispatch(updateModelConfigListLoading({ tableLoading: false, buttonLoading: false }))
            if (result.hasError) {
                message.error(result.error || '请求错误');
                return;
            }
            dispatch(updateModelConfigListPagination({ limit, pageIndex }));
            _.forEach(result.rows, (item, index) => {
                item.serialNumber = pageIndex * limit + index + 1
            });
            dispatch(updateModelConfigList(result));
            if (_.isFunction(callback)) {
                callback(result);
            }
        });
    };
}


function createModel(data, scb, ecb) {
    return dispatch => {
        xFetch(createModelUrl, {
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
function updateModel(data, scb, ecb) {
    return dispatch => {
        xFetch(updateModelUrl, {
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
function saveSelfDefiningValue(data, scb, ecb) {
    return dispatch => {
        xFetch(saveSelfDefiningValueUrl, {
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
function saveRelationValue(data, scb, ecb) {
    return dispatch => {
        xFetch(saveRelationValueUrl, {
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
function deleteModels(data, scb, ecb) {
    return dispatch => {
        xFetch(deleteModelsUrl, {
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

function getModelInfoByBodeId(data, scb, ecb) {
    return dispatch => {
        xFetch(getModelInfoByBodeIdUrl, {
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

function getResourceInfoByNodeId(data, scb, ecb) {
    return dispatch => {
        xFetch(getResourceInfoByNodeIdUrl, {
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



//  =================================================================================================

function getRelationValue(data, callback) {
    return dispatch => {
        xFetch(getRelationValueUrl, {
            method: 'post',
            data: JSON.stringify(data),
        }).then(result => {
            if (result.hasError) {
                message.error(result.error || '接口错误');
                return;
            }
            if (_.isFunction(callback)) {
                // result.rows = []
                callback(result);
            }
        });
    };
}

function getSelfDefiningValue(data, callback) {
    return dispatch => {
        xFetch(getSelfDefiningValueUrl, {
            method: 'post',
            data: JSON.stringify(data),
        }).then(result => {
            if (result.hasError) {
                message.error(result.error || '接口错误');
                return;
            }
            if (_.isFunction(callback)) {
                // result.rows = []
                callback(result);
            }
        });
    };
}

function getSelectList(data, callback) {
    return dispatch => {
        xFetch(getModelConfigListUrl, {
            method: 'get',
            data: data,
        }).then(result => {
            if (result.hasError) {
                message.error(result.error || '接口错误');
                return;
            }
            if (_.isFunction(callback)) {
                callback(result);
            }
        });
    };
}

function getTreeList(data, callback) {
    return dispatch => {
        xFetch(getTreeListUrl, {
            method: 'get',
            data: data,
        }).then(result => {
            if (result.hasError) {
                message.error(result.error || '接口错误');
                return;
            }
            if (_.isFunction(callback)) {
                callback(result);
            }
        });
    };
}

//  查询主机用到的接口 =================================================================================================
function updateResourceInfo(data) {
    return {
        type: UPDATE_MODEL_CONFIG_RESOURCE_INFO,
        payload: data
    };
}
function updateResourceInfoLoading(data) {
    return {
        type: UPDATE_MODEL_CONFIG_RESOURCE_INFO_LOADING,
        payload: data
    };
}
function updateResourceInfoPagination(data) {
    return {
        type: UPDATE_MODEL_CONFIG_RESOURCE_INFO_PAGINATION,
        payload: data
    };
}

function queryResourceInfo(data, scb, ecb) {
    return dispatch => {
        dispatch(updateResourceInfoLoading({ tableLoading: true, buttonLoading: true }))
        xFetch(queryResourceInfoUrl, {
            method: 'post',
            data: JSON.stringify(data),
        }).then(result => {
            const { limit, pageIndex } = data;
            dispatch(updateResourceInfoLoading({ tableLoading: false, buttonLoading: false }))
            if (result.hasError) {
                message.error(result.error);
                if (_.isFunction(ecb)) {
                    ecb(result.error);
                }
                return;
            }
            dispatch(updateResourceInfoPagination({ limit, pageIndex }));
            _.forEach(result.rows, (item, index) => {
                item.serialNumber = pageIndex * limit + index + 1
            });
            dispatch(updateResourceInfo(result));
            if (_.isFunction(scb)) {
                scb(result);
            }
        });
    };
}


function getAssetCountInfo(data, scb, ecb) {
    return dispatch => {
        xFetch(getAssetCountInfoUrl, {
            method: 'get',
            data: data,
        }).then(result => {
            if (result.hasError) {
                message.error(result.error);
                return;
            }
            if (_.isFunction(scb)) {
                scb(result);
            }
        });
    };
}




function getChangeList(data, callback) {
    return dispatch => {
        xFetch(getChangeListUrl, {
            method: 'get',
            data: data,
        }).then(result => {
            if (result.error) {
                message.error(result.error || '接口错误');
                return;
            }
            if (_.isFunction(callback)) {
                callback(result);
            }
        });
    };
}

// 模块消费 查询系统
function querySystemFuzzy(data, scb, ecb) {
    return dispatch => {
        xFetch(querySystemFuzzyUrl, {
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

// 关联其他系统的主机
function saveAssetByIpAndSysId(data, scb, ecb) {
    return dispatch => {
        xFetch(saveAssetByIpAndSysIdUrl, {
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


function getProcessInfoByProgramId(data, scb, ecb) {
    return dispatch => {
        xFetch(getProcessInfoByProgramIdUrl, {
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






export {
    queryMainSystemByCode,
    getModelConfigList,
    getLineInfoList,
    createModel,
    updateModel,
    deleteModels,
    saveSelfDefiningValue,
    saveRelationValue,
    getRelationValue,
    getSelfDefiningValue,
    getTreeList,
    queryResourceInfo,
    getChangeList,
    querySystemFuzzy,
    getModelInfoByBodeId,
    getResourceInfoByNodeId,
    getAssetCountInfo,
    saveAssetByIpAndSysId,
    getProcessInfoByProgramId,
};