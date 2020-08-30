import xFetch from '../../util/xFetch';
import { UPDATE_USER_INFO } from '../../constants/actionTypes';

const url = '/cmp/user/getUser';

// 提交登录表单
function requestUserInfoAction(data, callback) {
    // thunkMiddleware给这里dispatch形参进行赋值
    return dispatch => {
        xFetch(url, {
            data: data
        }).then(result => {
            if (_.isFunction(callback)) {
                callback(result.result.user);
            }
            dispatch(
                updateUserInfoAction(result.result.user)
            );
        });
    };
}

// 更新登录状态
function updateUserInfoAction(data) {
    return {
        type: UPDATE_USER_INFO,
        payload: data
    };
}

export {
    requestUserInfoAction
};