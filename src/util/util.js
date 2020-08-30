import React, { createElement } from 'react';
import Loadable from 'react-loadable';
import { Spin, Icon, Empty } from 'antd';

export const GLOBAL_NAME = '应用CMDB';
// 动态import组件
export const dynamicWrapper = (component) => {
  const defaultPath = 'notfound/notfound';
  // () => import('module')
  return Loadable({
    loader: () => {
      return component().then(raw => {
        const Component = raw.default || raw;
        return props =>
          createElement(Component, {
            ...props
          });
      }).catch(e => {
        // 路径错误默认import 404
        if (_.startsWith(e.toString(), 'Error: Cannot find module')) {
          const NotFoundComponent = dynamicWrapper(() => { return import(`../screens/${defaultPath}`) });
          return NotFoundComponent;
        }
      });
    },
    loading: () => {
      return <Spin size='large' className='global-spin' />;
    }
  });
};

export const RenderEmpty = () => {
  return (
    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description='暂无数据' />
  );
};

export const IconFont = Icon.createFromIconfontCN({
  scriptUrl: 'iconfont.js'
});

// 解析URL参数, getUrlParam('flowId')
export function getUrlParam(href, name) {
  let args = arguments, newHref;
  if (args.length === 1) {
    newHref = window.location.href;
    name = args[0];
  } else if (args.length > 1) {
    newHref = href;
  } else {
    return '';
  }

  let urlArr = newHref.split('?');
  if (urlArr.length > 1) {
    let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)'),
      url = urlArr[1];
    let r = url.match(reg);
    // 解码
    if (r != null) {
      let value = decodeURI(r[2]);
      if (value == 'undefined') {
        value = '';
      }
      return value;
    }
    return '';
  } else {
    return '';
  }
}

export function CheckIpAndMask(rule, value, callback) {
  let regex = '^(1\\d{2}|2[0-4]\\d|2[5][0-5]|[1-9]\\d?)\\.(1\\d{2}|2[0-4]\\d|2[5][0-5]|[0-9]\\d?)\\.(1\\d{2}|2[0-4]\\d|2[5][0-5]|[0-9]\\d?)\\.(1\\d{2}|2[0-4]\\d|2[5][0-5]|[0-9]\\d?)/([1-2][0-9]|3[0-2]|[1-9])$';

  let reg = new RegExp(regex);
  if (!value) {
    callback();
  } else if (!reg.test(value)) {
    callback(new Error('输入格式不对！参照：192.168.1.1/24'));
  } else {
    callback();
  }
}

export function CheckIp(rule, value, callback) {
  let regex = '^(1\\d{2}|2[0-4]\\d|2[5][0-5]|[1-9]\\d?)\\.(1\\d{2}|2[0-4]\\d|2[5][0-5]|[0-9]\\d?)\\.(1\\d{2}|2[0-4]\\d|2[5][0-5]|[0-9]\\d?)\\.(1\\d{2}|2[0-4]\\d|2[5][0-5]|[0-9]\\d?)$';

  let reg = new RegExp(regex);
  if (!value) {
    callback();
  } else if (!reg.test(value)) {
    callback(new Error('输入格式不对！参照：192.168.1.1'));
  } else {
    callback();
  }
}

export function CheckPosition(rule, value, callback) {
  let regex = '^$|^\\d{2}$|^\\d{4}$|^\\d{6}$';
  let reg = new RegExp(regex);

  if (!value) {
    callback();
  } else if (value == '00' || value == '0000' || value == '000000') {
    callback(new Error('输入位置不能为0'));
  } else if (!reg.test(value)) {
    callback(new Error('输入位置需为两位、四位或六位'));
  } else {
    callback();
  }
}