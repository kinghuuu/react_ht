import _ from 'lodash';
import xFetch from '../../util/xFetch';
import { message } from 'antd';
import { ContextPath } from '../../constants';

//查询主机监控状态
const getAssetMonitorStatusUrl = `${ContextPath}/cmdbSearch/getAssetMonitorStatus`;
//查询日志采集状态
const getLogAcqStatusUrl = `${ContextPath}/cmdbSearch/getLogAcqStatus`;
//查询进程监控状态
const getProcessMonitorStatusUrl = `${ContextPath}/cmdbSearch/getProcessMonitorStatus`;
//查询端口监控状态
const getPortMonitorStatusUrl = `${ContextPath}/cmdbSearch/getPortMonitorStatus`;

//重新加载数据
const syncSystemUnMonitorUrl = `${ContextPath}/cmdbSearch/syncSystemUnMonitor`;


function getAssetMonitorStatus(data, callback) {
    return dispatch => {
        xFetch(getAssetMonitorStatusUrl, {
            method: 'post',
            data: data,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then(result => {
            if (result.hasError) {
                message.error(result.erro || '请求错误')
                return;
            }
            if (_.isFunction(callback)) {
                callback(result);
            }
        })
    }
}

function getLogAcqStatus(data, callback) {
    return dispatch => {
        xFetch(getLogAcqStatusUrl, {
            method: 'post',
            data: data,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then(result => {
            if (result.hasError) {
                message.error(result.erro || '请求错误')
                return;
            }
            if (_.isFunction(callback)) {
                callback(result);
            }
        })
    }
}

function getProcessMonitorStatus(data, callback) {
    return dispatch => {
        xFetch(getProcessMonitorStatusUrl, {
            method: 'post',
            data: data,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then(result => {
            if (result.hasError) {
                message.error(result.erro || '请求错误')
                return;
            }
            if (_.isFunction(callback)) {
                callback(result);
            }
        })
    }
}

function getPortMonitorStatus(data, callback) {
    return dispatch => {
        xFetch(getPortMonitorStatusUrl, {
            method: 'post',
            data: data,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then(result => {
            if (result.hasError) {
                message.error(result.erro || '请求错误')
                return;
            }
            if (_.isFunction(callback)) {
                callback(result);
            }
        })
    }
}

function syncSystemUnMonitor(data, callback) {
    return dispatch => {
        xFetch(syncSystemUnMonitorUrl, {
            method: 'post',
            data: data,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then(result => {
            if (result.hasError) {
                message.error(result.erro || '请求错误')
                return;
            }
            if (_.isFunction(callback)) {
                callback(result);
            }
        })
    }
}

export {
    getAssetMonitorStatus,
    getLogAcqStatus,
    getProcessMonitorStatus,
    getPortMonitorStatus,
    syncSystemUnMonitor
}

