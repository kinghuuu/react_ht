import _ from 'lodash';
import xFetch from '../../util/xFetch';
import { message } from 'antd';
import { ContextPath } from '../../constants';

const getTopoListUrl = `${ContextPath}/cmdbCommon/getTopoList`;
const queryAssetsBySeqIdUrl = `${ContextPath}/cmdbResource/queryAssetsBySeqId`;

function getTopoList(data, sec, ecb) {
    return dispatch => {
        xFetch(getTopoListUrl, {
            method: 'get',
            data: data,
        }).then((result = { rows: [] }) => {
            if (result.hasError) {
                message.error(result.erro || '请求错误')
                if (_.isFunction(ecb)) {
                    ecb();
                }
                return;
            }
            if (_.isFunction(sec)) {
                sec(result);
            }
        });
    };
}


function queryAssetsBySeqId(data, sec, ecb) {
    return dispatch => {
        xFetch(queryAssetsBySeqIdUrl, {
            method: 'get',
            data:data,
        }).then((result = { rows: [] }) => {
            if (result.hasError) {
                message.error(result.erro || '请求错误')
                if (_.isFunction(ecb)) {
                    ecb();
                }
                return;
            }
            if (_.isFunction(sec)) {
                sec(result);
            }
        });
    };
}

export {
    getTopoList, queryAssetsBySeqId
};