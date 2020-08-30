import { message } from 'antd';
export const FIXED_PROPERTIES = 'fixedProperties';
export const DYNAMIC_PROPERTIES = 'dynamicProperties';
export const RELATION_PROPERTIES = 'relationProperties';

export const DATA_BASE_TYPES = [
    { text: 'mysql', value: 'mysql' },
    { text: 'oracle', value: 'oracle' },
];
export const DISASTE_AREAS = [
    { text: '同城', value: '同城' },
    { text: '异地', value: '异地' },
];


// 上传事件
export const handleUploadChange = (callback, info = {}) => {
    let fileList = info.fileList || [];
    // 控制大小在20M以内
    fileList = _.filter(fileList, function (file) {
        return file.size === undefined || _.divide(file.size, 1024 * 1024) <= 20;
    });
    if (info.file && info.file.status === 'done') {

        if (info.file.response && !info.file.response.hasError && info.file.uid) {
            message.success(`${info.file.name} 上传成功！`);
            if (_.isFunction(callback)) {
                callback([]);
            }
        } else {
            let failReason = info.file.response ? info.file.response.error : '上传接口出错！';
            // message.error(`${info.file.name} 上传失败！原因：${failReason}`);
            message.error(`${failReason}`);
            return;
        }
    } else if (info.file && info.file.status === 'error') {
        message.error(`${info.file.name} 上传失败！`);
    }
}
// 上传前钩子函数 false||Promise.reject阻止上传
export const beforeUpload = (file) => {
    if (_.divide(file.size, 1024 * 1024) >= 20) {
        message.error(`${file.name}上传失败，文件大小不能超过20M！`);
        return false;
    }
    return true;
}