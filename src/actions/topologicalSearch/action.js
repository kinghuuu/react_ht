import _ from 'lodash';
import xFetch from '../../util/xFetch';
import { message } from 'antd';
import { ContextPath } from '../../constants';

const queryRelationShipUrl = `${ContextPath}/relationView/queryRelationShip`;

function queryRelationShip(data, scb, ecb) {
    return dispatch => {
        xFetch(queryRelationShipUrl, {
            method: 'get',
            data: data,
        }).then((result = { rows: [] }) => {
            if (result.hasError) {
                message.error(result.error || '请求错误')
                if (_.isFunction(ecb)) {
                    ecb();
                }
                return;
            }
            if (_.isFunction(scb)) {
                scb(result);
            }
        });
    };
}


// function queryAssetsBySeqId(data, scb, ecb) {
//     return dispatch => {
//         xFetch(queryAssetsBySeqIdUrl, {
//             method: 'get',
//             data:data,
//         }).then((result = { rows: [] }) => {
//             if (result.hasError) {
//                 message.error(result.erro || '请求错误')
//                 if (_.isFunction(ecb)) {
//                     ecb();
//                 }
//                 return;
//             }
//             if (_.isFunction(scb)) {
//                 scb(result);
//             }
//         });
//     };
// }

export {
    queryRelationShip
};