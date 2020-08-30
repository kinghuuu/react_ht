import xFetch from '../../../util/xFetch';
import { ContextPath, DownloadFileUrl } from '../../../constants';
import {
    UPDATE_FLOW_USER_INFO,
    UPDATE_FLOW_BASIC_INFO,
    UPDATE_APP_SYS_4_PAGE,
    UPDATE_ALL_APP_SYS_4_PAGE,
    UPDATE_ATTACHMENT_LIST,
    UPDATE_APPROVE_HISTORY,
    UPDATE_REGULAR_OPINION,
    UPDATE_ALLOCATION_IP_IP_CONFIG_LIST,
    UPDATE_ALLOCATION_IP_ROUTE_CONFIG_LIST,
    UPDATE_ALLOCATION_IP_ROUTE_AND_IP_CONFIG_LOADING,
    UPDATE_ALLOCATION_IP_SEGMENT_LIST,
    UPDATE_ALLOCATION_IP_GENERATE_FROM_IP,
    UPDATE_ALLOCATION_IP_LIST_IP_POOL,
    UPDATE_ALLOCATION_IP_QUERY_IP_CONFIGS_LOADING,
    UPDATE_ALLOCATION_IP_QUERY_IP_CONFIGS_LIST,
    UPDATE_ALLOCATION_IP_QUERY_IP_CONFIGS_PAGINATION,
    UPDATE_ALLOCATION_IP_FETCH_AVAILABLE_IP,
    UPDATE_ALLOCATION_IP_FETCH_AVAILABLE_ROUTES,
    UPDATE_ALLOCATION_IP_FETCH_AVAILABLE_IP_LOADING,
    UPDATE_UP_DUTY_PERSION,
    UPDATE_INTERNAL_APPROVER,
    UPDATE_USERS_FOR_PAGE,
    UPDATE_INTERNAL_APPROVER_INFO,
} from '../../../constants/common/flow/actionType';
import _ from 'lodash';

const flowUserInfoUrl = `${ContextPath}/user/getUser`;// 获取流程用户信息
const flowUserInfoUrlCmdb = `${ContextPath}/user/getLoginUser`;// CMDB获取用户信息
const flowBasciInfoUrl = `${ContextPath}/act/getInfo`;// 获取流程信息
const allAppSystem4PageUrl = `${ContextPath}/select/getAllAppSystems4Page`;// 获取所有的应用系统分页
const appSystem4PageUrl = `${ContextPath}/select/getAppSystems4Page`;// 获取当前人应用系统分页
const attachListUrl = `${ContextPath}/act/getAttachList`;// 获取流程附件列表
const delAttachUrl = `${ContextPath}/deleteFile`;// 根据id删除附件
const approveHisUrl = `${ContextPath}/act/getHistory`;// 获取流程审批历史步骤
const regularOpinionUrl = `${ContextPath}/aucommondes/getUsedDes`;// 获取常用审批意见
// const getIpConfigsUrl = `${ContextPath}/act/vm-apply/getIpConfigs`; // 根据 appId、sequenceId 获取IP的路由配置、ip配置信息
const getListSegmentUrl = `${ContextPath}/ip-res/listSegment`;  // 根据 输入的IP地址，获取网段列表
const generateFromIpUrl = `${ContextPath}/ip-res/generateFromIp`;  // 根据 IP地址，网段id 生成 ip配置信息
const getListIpPoolUrl = `${ContextPath}/ip-res/listIpPool`; // 根据 输入的IP地址，获取地址池列表信息
const getQueryUrl = `${ContextPath}/subnet/query`; // 根据输入的ip地址 自动生成对应的 ip配置信息
const fetchAvailableIpUrl = `${ContextPath}/ip-res/generateAvailableIps`; // 根据 getQueryUrl 获取的ip配置信息，用 netInfoId、ipPoolId、ipNum获取ip
const isIpAvailableUrl = `${ContextPath}/ip-res/isIpAvailable`; // 校验IP是否可用
// const saveIpConfigsUrl = `${ContextPath}/act/vm-apply/saveIpConfigs`; // 保存IP
const deleteIpUrl = `${ContextPath}/ip-res/delete`; // 删除IP
const deleteAllIpUrl = `${ContextPath}/ip-res/deleteAll`; // 删除IP
const deleteIpByAppIdAndIpAddressUrl = `${ContextPath}/ip-res/deleteIpByAppIdAndIpAddress`; // 删除IP
const getVmIpMatchDistributedPortUrl = `${ContextPath}/getVmIpMatchDistributedPort`; // 检验IP的端口是否可用
const approveSaveUrl = `${ContextPath}/act/vm-apply/approve`; // 保存审批流程
const addConcernUrl = `${ContextPath}/focus/add`; // 添加关注
const removeConcernsUrl = `${ContextPath}/focus/delete`; // 取消关注
const checkConcernsUrl = `${ContextPath}/focus/check`; // 检测是否关注

const getUpDutyPersionUrl = `${ContextPath}/select/getUpDutyPersion`;
const getInternalApproverUrl = `${ContextPath}/select/getInternalApprover`;
const queryUsersForPageUrl = `${ContextPath}/select/queryUsersForPage`;
const getInternalApproveInfoUrl = `${ContextPath}/act/getInternalApproveInfo`;
const internalProcessConfigUrl = `${ContextPath}/internalProcessConfig/getProcessVersion`; //判断新老流程
const getTeamLeaderUrl = `${ContextPath}/select/getTeamLeader`;//团队经理接口


function updateFlowUserInfo(data) {
    return {
        type: UPDATE_FLOW_USER_INFO,
        payload: data
    };
}
// 获取发起流程时的用户基本信息
function requestFlowUserInfo(data, scb, ecb) {
    return dispatch => {
        xFetch(flowUserInfoUrl, {
            data: data,
            method: 'post',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then(result => {
            if (result.hasError === false) {
                if (_.isFunction(scb)) {
                    scb(result.data);
                }
                dispatch(updateFlowUserInfo(result.data));
            } else {
                if (_.isFunction(ecb)) {
                    ecb();
                }
            }
        }).fail(() => {
            if (_.isFunction(ecb)) {
                ecb();
            }
        });
    };
}
// 获取发起流程时的用户基本信息-CMDB
function requestFlowUserInfoCmdb(data, scb, ecb) {
    return dispatch => {
        xFetch(flowUserInfoUrlCmdb, {
            data: data,
            method: 'get',
        }).then(result => {
            if (result) {
                if (_.isFunction(scb)) {
                    scb(result);
                }
                dispatch(updateFlowUserInfo(result));
            } else {
                if (_.isFunction(ecb)) {
                    ecb();
                }
            }
        }).fail(() => {
            if (_.isFunction(ecb)) {
                ecb();
            }
        });
    };
}

// 跟新流程信息
function updateFlowBasicInfo(data) {
    return {
        type: UPDATE_FLOW_BASIC_INFO,
        payload: data
    };
}
// 获取流程信息
function requestFlowBasicInfo(data, scb, ecb) {
    return dispatch => {
        xFetch(flowBasciInfoUrl, {
            data: data,
            method: 'get',
        }).then(result => {
            if (result.hasError === false) {
                if (_.isFunction(scb)) {
                    scb(result.data);
                }
                dispatch(updateFlowBasicInfo(result.data));
            } else {
                if (_.isFunction(ecb)) {
                    ecb();
                }
            }
        }).fail(() => {
            if (_.isFunction(ecb)) {
                ecb();
            }
        });
    };
}

function updateAppSystems4Page(data) {
    return {
        type: UPDATE_APP_SYS_4_PAGE,
        payload: data
    };
}
// 根据当前用户，流程中添加分页的应用系统表格
function requestAppSystems4Page(data, scb, ecb) {
    return dispatch => {
        xFetch(appSystem4PageUrl, {
            data: data,
            method: 'post',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then(result => {
            if (result.hasError === false) {
                if (_.isFunction(scb)) {
                    scb(result);
                }
                dispatch(updateAppSystems4Page(result));
            } else {
                if (_.isFunction(ecb)) {
                    ecb();
                }
            }
        }).fail(() => {
            if (_.isFunction(ecb)) {
                ecb();
            }
        });
    };
}

function updateAllAppSystems4Page(data) {
    return {
        type: UPDATE_ALL_APP_SYS_4_PAGE,
        payload: data
    };
}
// 流程中添加分页的应用系统表格
function requestAllAppSystems4Page(data, scb, ecb) {
    return dispatch => {
        xFetch(allAppSystem4PageUrl, {
            data: data,
            method: 'post',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then(result => {
            if (result.hasError === false) {
                if (_.isFunction(scb)) {
                    scb(result);
                }
                dispatch(updateAllAppSystems4Page(result));
            } else {
                if (_.isFunction(ecb)) {
                    ecb();
                }
            }
        }).fail(() => {
            if (_.isFunction(ecb)) {
                ecb();
            }
        });
    };
}

function updateAttachList(data) {
    return {
        type: UPDATE_ATTACHMENT_LIST,
        payload: data
    };
}
function requestAttachList(data, scb, ecb) {
    return dispatch => {
        xFetch(attachListUrl, {
            data: data,
            method: 'post',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then(result => {
            if (result.hasError === true) {
                if (_.isFunction(ecb)) {
                    ecb();
                }
            } else {
                if (_.isFunction(scb)) {
                    scb(result);
                }
                result = result || [];
                result = _.map(result, (item) => {
                    item.uid = item.id;
                    item.url = `${DownloadFileUrl}?fileId=${item.id}`;
                    return item;
                })
                dispatch(updateAttachList(result));
            }
        }).fail(() => {
            if (_.isFunction(ecb)) {
                ecb();
            }
        });
    };
}

function delAttachmentById(data, scb, ecb) {
    return dispatch => {
        xFetch(delAttachUrl, {
            data: JSON.stringify(data),
            method: 'post',
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

function updateApproveHistoryInfo(data) {
    return {
        type: UPDATE_APPROVE_HISTORY,
        payload: data
    };
}
// 获取流程历史审批步骤
function requestApproveHistoryInfo(data, scb, ecb) {
    return dispatch => {
        xFetch(approveHisUrl, {
            data: data
        }).then(result => {
            if (result.hasError === true) {
                if (_.isFunction(ecb)) {
                    ecb();
                }
            } else {
                dispatch(updateApproveHistoryInfo(result));
                if (_.isFunction(scb)) {
                    scb();
                }
            }
        }).fail(() => {
            if (_.isFunction(ecb)) {
                ecb();
            }
        });
    };
}

function updateRegularOpinionList(data) {
    return {
        type: UPDATE_REGULAR_OPINION,
        payload: data
    };
}
function requestRegularOpinionList(data, scb, ecb) {
    return dispatch => {
        xFetch(regularOpinionUrl, {
            data: data
        }).then(result => {
            if (result.hasError === true) {
                if (_.isFunction(ecb)) {
                    ecb();
                }
            } else {
                if (_.isFunction(scb)) {
                    scb(result.rows);
                }
                dispatch(updateRegularOpinionList(result.rows));
            }
        }).fail(() => {
            if (_.isFunction(ecb)) {
                ecb();
            }
        });
    };
}

// 分配IP组件中，更新ip配置
function updateAllocationIpIpConfigList(data) {
    return {
        type: UPDATE_ALLOCATION_IP_IP_CONFIG_LIST,
        payload: data
    };
}
// 分配IP组件中，更新route配置
function updateAllocationIpRouteConfigList(data) {
    return {
        type: UPDATE_ALLOCATION_IP_ROUTE_CONFIG_LIST,
        payload: data
    };
}
// 分配IP组件中，route配置、ip配置的loading ，这两个配置用的是一个接口
function updateAllocationIpRouteAndIpConfigList(data) {
    return {
        type: UPDATE_ALLOCATION_IP_ROUTE_AND_IP_CONFIG_LOADING,
        payload: data
    };
}
// 分配IP组件中，获取ip,route配置
function getIpConfigs(getIpConfigsUrl, data, scb, ecb) {
    return dispatch => {
        dispatch(updateAllocationIpRouteAndIpConfigList({ tableLoading: true }));
        xFetch(getIpConfigsUrl, {
            data: data,
            method: 'get',
        }).then(res => {
            let { ipConfigs = [], routeConfigs = [] } = res;
            if (_.isFunction(scb)) {
                scb(ipConfigs, routeConfigs);
            }
            dispatch(updateAllocationIpIpConfigList(ipConfigs));
            dispatch(updateAllocationIpRouteConfigList(routeConfigs));
            dispatch(updateAllocationIpRouteAndIpConfigList({ tableLoading: false }));
        }).fail(() => {
            if (_.isFunction(ecb)) {
                ecb();
            }
        });
    };
}

// 更新网段列表
function updateAllocationIpSegmentList(data) {
    return {
        type: UPDATE_ALLOCATION_IP_SEGMENT_LIST,
        payload: data
    };
}
// 根据IP地址，获取网段列表
function getSegmentList(data, scb, ecb) {
    return dispatch => {
        xFetch(getListSegmentUrl, {
            data: data,
            method: 'get',
        }).then((res) => {
            if (_.isFunction(scb)) {
                scb(res);
            }
            dispatch(updateAllocationIpSegmentList(res))
        }).fail(() => {
            if (_.isFunction(ecb)) {
                ecb();
            }
        });
    };
}

// 更新生成ip配置信息
function updateAllocationIpGenerateFromIp(data) {
    return {
        type: UPDATE_ALLOCATION_IP_GENERATE_FROM_IP,
        payload: data
    };
}
// 根据IP地址，网段id生成ip配置信息
function generateFromIp(data, scb, ecb) {
    return dispatch => {
        xFetch(generateFromIpUrl, {
            data: data,
            method: 'get',
        }).then((res = { data: {} }) => {
            if (_.isFunction(scb)) {
                scb(res);
            }
            dispatch(updateAllocationIpGenerateFromIp(res));
        }).fail(() => {
            if (_.isFunction(ecb)) ecb();
        });
    };
}

// 更新地址池列表信息
function updateAllocationIpListIpPool(data) {
    return {
        type: UPDATE_ALLOCATION_IP_LIST_IP_POOL,
        payload: data
    };
}
// 获取地址池列表信息
function getListIpPool(data, scb, ecb) {
    return dispatch => {
        xFetch(getListIpPoolUrl, {
            data: data,
            method: 'get',
        }).then((res = []) => {
            if (_.isFunction(scb)) {
                scb(res);
            }
            dispatch(updateAllocationIpListIpPool(res));
        }).fail(() => {
            if (_.isFunction(ecb)) ecb();
        });
    };
}

// 更新ip配置信息
function updateQueryIpConfogsLoading(data) {
    return {
        type: UPDATE_ALLOCATION_IP_QUERY_IP_CONFIGS_LOADING,
        payload: data
    };
}
function updateQueryIpConfogsList(data) {
    return {
        type: UPDATE_ALLOCATION_IP_QUERY_IP_CONFIGS_LIST,
        payload: data
    };
}
function updateQueryIpConfogsPagintion(data) {
    return {
        type: UPDATE_ALLOCATION_IP_QUERY_IP_CONFIGS_PAGINATION,
        payload: data
    };
}
// 根据输入的ip地址 自动生成对应的 ip配置信息
function getQuery(data, scb, ecb) {
    return dispatch => {
        dispatch(updateQueryIpConfogsLoading({ buttonLoading: true, tableLoading: true }));
        dispatch(updateFetchAvailableIpLoading({ loading: true }));
        xFetch(getQueryUrl, {
            data: data,
            method: 'post',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' }
        }).then((res = { rows: [], results: 0 }) => {
            let rows = res.rows;
            rows.forEach(item => {
                item.key = item.id
            });
            if (_.isFunction(scb)) {
                scb(rows);
            }
            dispatch(updateQueryIpConfogsList({ rows, results: res.results }));
            dispatch(updateQueryIpConfogsLoading({ buttonLoading: false, tableLoading: false }))
        }).fail(() => {
            if (_.isFunction(ecb)) ecb();
        });
    };
}

// 更新ip信息
function updateFetchAvailableIp(data) {
    return {
        type: UPDATE_ALLOCATION_IP_FETCH_AVAILABLE_IP,
        payload: data
    };
}
// 更新ip信息LOADING
function updateFetchAvailableIpLoading(data) {
    return {
        type: UPDATE_ALLOCATION_IP_FETCH_AVAILABLE_IP_LOADING,
        payload: data
    };
}
// 根据 getQuery 获取的ip配置信息，用 netInfoId、ipPoolId、ipNum获取ip配置信息
function getFetchAvailableIp(data, scb, ecb) {
    return dispatch => {
        dispatch(updateFetchAvailableIpLoading({ loading: true }));
        xFetch(fetchAvailableIpUrl, {
            data: data,
            method: 'get',
        }).then((res = { rows: [] }) => {
            let ips = res.rows;
            let ipsArr = ips.map(item => {
                return {
                    ...item,
                    text: item.ipAddress,
                    key: item.ipAddress
                }
            })
            if (_.isFunction(scb)) {
                scb(ipsArr);
            }
            dispatch(updateFetchAvailableIp(ipsArr));
            dispatch({
                type: UPDATE_ALLOCATION_IP_FETCH_AVAILABLE_ROUTES,
                payload: res.routes
            });
            dispatch(updateFetchAvailableIpLoading({ loading: false }));
        }).fail(() => {
            if (_.isFunction(ecb)) ecb();
        });
    };
}

// 校验IP是否可用 保存ip配置的时候
function isIpAvailable(data, scb, ecb) {
    return dispatch => {
        xFetch(isIpAvailableUrl, {
            data: data,
            method: 'get',
        }).then((res) => {
            if (_.isFunction(scb)) {
                scb(res.data);
            }
            // dispatch(updateFetchAvailableIp(ipsArr));
        }).fail(() => {
            if (_.isFunction(ecb)) ecb();
        });
    };
}

// 校验IP是否可用,自动生成的IP
function getVmIpMatchDistributedPort(data, scb, ecb) {
    return dispatch => {
        xFetch(getVmIpMatchDistributedPortUrl, {
            data: JSON.stringify(data),
            method: 'post',
            // headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).then((res) => {
            if (_.isFunction(scb)) {
                scb(res.data);
            }
            // dispatch(updateFetchAvailableIp(ipsArr));
        }).fail(() => {
            if (_.isFunction(ecb)) ecb();
        });
    };
}


// 保存校验通过的的IP信息
function saveIpConfigs(saveIpConfigsUrl, data, scb, ecb) {
    // let dataCopy = JSON.stringify(data);
    return dispatch => {
        xFetch(saveIpConfigsUrl, {
            data: JSON.stringify(data),
            method: 'post',
        }).then((res) => {
            if (_.isFunction(scb)) {
                scb(res);
            }
            // dispatch(updateFetchAvailableIp(ipsArr));
        }).fail(() => {
            if (_.isFunction(ecb)) ecb();
        });
    };
}

function deleteIp(data, scb, ecb) {
    return dispatch => {
        xFetch(deleteIpUrl, {
            data: data,
            method: 'post',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).then((res) => {
            if (_.isFunction(scb)) {
                scb(res.data);
            }
        }).fail(() => {
            if (_.isFunction(ecb)) ecb();
        });
    };
}

function deleteAllIp(data, scb, ecb) {
    return dispatch => {
        xFetch(deleteAllIpUrl, {
            data: JSON.stringify(data),
            method: 'post',
            // headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).then((res) => {
            if (_.isFunction(scb)) {
                scb(res.data);
            }
        }).fail(() => {
            if (_.isFunction(ecb)) ecb();
        });
    };
}

function deleteIpByAppIdAndIpAddress(data, scb, ecb) {
    return dispatch => {
        xFetch(deleteIpByAppIdAndIpAddressUrl, {
            data: JSON.stringify(data),
            method: 'post',
        }).then((res) => {
            if (_.isFunction(scb)) {
                scb(res.data);
            }
        }).fail(() => {
            if (_.isFunction(ecb)) ecb();
        });
    };
}

// 保存审批流程
function approveSave(data = {}, scb, ecb) {
    return dispatch => {
        xFetch(approveSaveUrl, {
            data: JSON.stringify(data),
            method: 'post',
        }).then((res) => {
            if (_.isFunction(scb)) {
                scb(res);
            }
        }).fail(() => {
            if (_.isFunction(ecb)) ecb();
        });
    };
}

// 添加关注
function addConcern(data = {}, scb, ecb) {
    return dispatch => {
        xFetch(addConcernUrl, {
            data: data,
            method: 'post',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).then((res) => {
            if (_.isFunction(scb)) {
                scb(res);
            }
        }).fail(() => {
            if (_.isFunction(ecb)) ecb();
        });
    };
}
// 取消关注
function removeConcerns(data = {}, scb, ecb) {
    return dispatch => {
        xFetch(removeConcernsUrl, {
            data: data,
            method: 'post',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).then((res) => {
            if (_.isFunction(scb)) {
                scb(res);
            }
        }).fail(() => {
            if (_.isFunction(ecb)) ecb();
        });
    };
}
// 检测是否关注
function checkConcerns(data = {}, scb, ecb) {
    return dispatch => {
        xFetch(checkConcernsUrl, {
            data: data,
            method: 'post',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).then((res) => {
            if (_.isFunction(scb)) {
                scb(res);
            }
        }).fail(() => {
            if (_.isFunction(ecb)) ecb();
        });
    };
}

// 内部审核人 ===> start
// 更新上级责任负责人
function updateUpDutyPersion(data) {
    return {
        type: UPDATE_UP_DUTY_PERSION,
        payload: data
    };
}
// 获取上级责任负责人
function getUpDutyPersion(data = {}, scb, ecb) {
    return dispatch => {
        xFetch(getUpDutyPersionUrl, {
            data: data,
            method: 'post',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).then((res = []) => {
            if (_.isFunction(scb)) {
                scb(res);
            }
            dispatch(updateUpDutyPersion(res))
        }).fail(() => {
            if (_.isFunction(ecb)) ecb();
        });
    };
}
// 更新内部审核人
function updateInternalApprover(data) {
    return {
        type: UPDATE_INTERNAL_APPROVER,
        payload: data
    };
}
// 获取内部审核人
function getInternalApprover(data = {}, scb, ecb) {
    return dispatch => {
        xFetch(getInternalApproverUrl, {
            data: data,
            method: 'get',
            // headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).then((res) => {
            if (_.isFunction(scb)) {
                scb(res);
            }
            dispatch(updateInternalApprover(res))
        }).fail(() => {
            if (_.isFunction(ecb)) ecb();
        });
    };
}
// 更新内部审核人列表
function updateUsersForPage(data) {
    return {
        type: UPDATE_USERS_FOR_PAGE,
        payload: data
    };
}
// 获取内部审核人列表
function queryUsersForPage(data = {}, scb, ecb) {
    return dispatch => {
        xFetch(queryUsersForPageUrl, {
            data: data,
            method: 'post',
            // headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).then((res) => {
            if (_.isFunction(scb)) {
                scb(res);
            }
            dispatch(updateUsersForPage(res))
        }).fail(() => {
            if (_.isFunction(ecb)) ecb();
        });
    };
}
// 更新本流程内部审核人信息
function updateInternalApproveInfo(data) {
    return {
        type: UPDATE_INTERNAL_APPROVER_INFO,
        payload: data
    };
}


// 获取本流程内部审核人信息
function getInternalApproveInfo(data = {}, scb, ecb) {
    return dispatch => {
        xFetch(getInternalApproveInfoUrl, {
            data: data,
            method: 'get',
            // headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).then((res) => {
            if (_.isFunction(scb)) {
                scb(res);
            }
            dispatch(updateInternalApproveInfo(res))
        }).fail(() => {
            if (_.isFunction(ecb)) ecb();
        });
    };
}
// 获取团队经理信息
function getTeamLeaderInfo(data = {}, scb, ecb) {
    xFetch(getTeamLeaderUrl, {
        data: data,
        method: 'post',
        // headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).then((res) => {
        if (_.isFunction(scb)) {
            scb(res);
        }

    }).fail(() => {
        if (_.isFunction(ecb)) ecb();
    });

}

//判断是否新老流程
function internalProcessConfig(flowId, scb, ecb) {
    let params = {
        flowId
    }
    xFetch(internalProcessConfigUrl, {
        data: params,
        method: 'GET',
        // headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).then((res) => {
        if (_.isFunction(scb)) {
            scb(res);
        }

    }).fail(() => {
        if (_.isFunction(ecb)) ecb();
    });
}
// 内部审核人 end <===

export {
    requestFlowUserInfo,
    requestFlowUserInfoCmdb,
    requestFlowBasicInfo,
    requestAppSystems4Page,
    requestAllAppSystems4Page,
    requestAttachList,
    delAttachmentById,
    requestApproveHistoryInfo,
    requestRegularOpinionList,
    getIpConfigs,
    updateAllocationIpIpConfigList,
    updateAllocationIpRouteConfigList,
    getSegmentList,
    generateFromIp,
    getListIpPool,
    getQuery,
    updateQueryIpConfogsList,
    updateQueryIpConfogsPagintion,
    getFetchAvailableIp,
    updateFetchAvailableIp,
    updateFetchAvailableIpLoading,
    isIpAvailable,
    getVmIpMatchDistributedPort,
    saveIpConfigs,
    deleteIp,
    deleteAllIp,
    deleteIpByAppIdAndIpAddress,
    approveSave,
    addConcern,
    removeConcerns,
    checkConcerns,
    getUpDutyPersion,
    getInternalApprover,
    queryUsersForPage,
    getInternalApproveInfo,
    getTeamLeaderInfo,
    internalProcessConfig
};