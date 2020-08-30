import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { Route } from 'react-router-dom';
import { Layout, Icon, BackTop, Spin, Dropdown, Avatar, Menu, Modal } from 'antd';
import SiderMenu from '../../components/sidermenu/sidermenu';
import WorkPlace from '../../components/workplace/workplace';
import WorkSpace from '../../components/workspace/workspace';
import GlobalHeader from '../../components/header/header';
import GlobalFooter from '../../components/footer/footer';
import ScreenFull from '../../components/screenfull'
import { connect } from 'react-redux';
import { GLOBAL_NAME } from '../../util/util';
import { requestMenusAction, updateSiderCollapsed, updateMenusAction } from '../../actions/home/action';
import { requestUserInfoAction } from '../../actions/user/action';
import { updateLoginStatusAction, postLogoutAction } from '../../actions/login/action';
import _ from 'lodash';
import styles from './home.module.less';

const { Content } = Layout;
const { confirm } = Modal;

const hasBreadCrumb = false;
// const isMiniLayout = hasBreadCrumb || true; // 是否小空间布局(和面包屑会有冲突)
const isMiniLayout = false;
// 系统首页
class Home extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      params: {},
      isAddTab: false,
      isRemoveTab: false,
      newEnter: true
    };
  }

  componentDidMount() {
    let { dispatch } = this.props;
    let loginStatus = sessionStorage.getItem('loginStatus');
    // 如果处于非登录状态，则跳转到登录界面
    // if (loginStatus !== 'ok') {
    //   this.context.router.history.replace('/login');
    // } else {
    //   dispatch(requestMenusAction(currentModule));
    //   dispatch(requestUserInfoAction());
    //   dispatch(requestModulesAction());
    // }
    dispatch(requestMenusAction()); //查询左边导航菜单
    dispatch(requestUserInfoAction());    
  }

  // 在打开的tab页中dispatch action后，进入此方法，将params修正为{}
  // params={}时，workspace中打开的tab还是当前页，避免重复打开之前的tab  
  static getDerivedStateFromProps(nextProps, prevState) {
    if (prevState.isAddTab === true) {
      return {
        ...prevState,
        isAddTab: false,
        newEnter: false
      };
    } else if (prevState.isRemoveTab === true) {
      return {
        ...prevState,
        isRemoveTab: false,
        newEnter: false
      };
    } else {
      return {
        ...prevState,
        params: {}
      };
    }
  }

  // this.setState先触发getDerivedStateFromProps
  addTab(key, title, path, externals, args, nesting) {
    this.setState({
      isAddTab: true,
      params: {
        key,
        title,
        path,
        externals,
        args,
        nesting
      }
    });
  }

  // externals同addTab，如果是api打开的tab，这里设为true
  // key可以指定，可以不指定，如果不指定，则关闭的是当前获得焦点的tab页
  removeTab(externals, key) {
    this.setState({
      isRemoveTab: true,
      params: {
        key,
        externals,
        isRemove: true
      }
    });
  }

  changeTab(realUrlPath) {
    let re = /\/home\//;
    let menuKeyPath = realUrlPath.replace(re, '');
    this.refs.sider.changeMenuOpenKey(menuKeyPath);
  }

  backTop = () => {
    return ReactDOM.findDOMNode(this.refs['content']);
  }

  toggle() {
    const { collapsed, dispatch } = this.props;
    this.setNoRefresh();
    dispatch(updateSiderCollapsed(!collapsed));
  }

  handleMenuClick(e) {
    if (e.key === 'logout') {
      this.confirmLogout();
    }
    if (e.key === 'modify') {
      this.context.router.history.replace('/modify');
    }
  }

  setNoRefresh = () => {
    this.workspaceRef.setOnlyChangeURL(true);
  }

  // 确认是否退出登录
  confirmLogout() {
    const { dispatch, user } = this.props;
    let that = this;
    confirm({
      title: '您是否确认要退出登录？',
      content: '退出登录将无法对系统进一步操作。',
      onOk() {
        dispatch(
          postLogoutAction({
            userId: user.id
          }, () => {
            // sessionStorage清除登录信息
            sessionStorage.setItem('loginStatus', '');
            that.props.dispatch(
              updateLoginStatusAction({
                status: ''
              })
            );
            that.props.dispatch(
              updateSiderCollapsed(false)
            );
            that.props.dispatch(
              updateMenusAction([])
            );
            // 路由跳转至登录页面
            that.context.router.history.replace('/login');
          })
        );
      },
      onCancel() {
        // 啥事都不做
      }
    });
  }

  render() {
    let { rawMenus, menus, transferedMap, collapsed, dispatch, location, user } = this.props;
    let menuProps = { menus, collapsed, dispatch, location };
    let contentWidth = collapsed ? 'calc(100% - 80px)' : 'calc(100% - 254px)';
    const menu = (
      <Menu className={styles.menu} onClick={this.handleMenuClick.bind(this)}>
        <Menu.Item disabled><Icon type='user' />个人中心</Menu.Item>
        <Menu.Item key='modify'><Icon type='key' />修改密码</Menu.Item>
        <Menu.Divider />
        <Menu.Item key='logout'><Icon type='logout' />退出登录</Menu.Item>
      </Menu>
    );
    return (
      <Layout>
        <SiderMenu
          ref='sider'
          title={GLOBAL_NAME}
          tooltip={GLOBAL_NAME}
          {...menuProps}
          addTab={
            (key, title, path, externals, args) => { this.addTab(key, title, path, externals, args).bind(this) }
          }
        />
        <Layout className={isMiniLayout ? styles['mini-layout'] : ''}>
          {!isMiniLayout && <GlobalHeader fixed collapsed={collapsed} dispatch={dispatch} setNoRefresh={this.setNoRefresh.bind(this)} />}
          <Content
            className={styles.mainContent}
            style={{ margin: 0, paddingTop: 52, width: contentWidth }}
            // style={{ margin: 2, overflow: 'auto', top: isMiniLayout ? '0' : '44px' }}
            ref='content'
          >
            <div style={{ padding: isMiniLayout ? '0 6px 6px' : '6px', background: '#FFF', }}>
              <Route path='/home/:id+' render={({ match }) => {
                if (hasBreadCrumb) {
                  return (
                    <WorkPlace {...match} onChange={(realUrlPath) => { this.changeTab(realUrlPath) }} />
                  );
                } else {
                  return (
                    <div style={{ position: 'relative' }}>
                      <WorkSpace {...match} params={this.state.params} newEnter={this.state.newEnter} menus={menus} transferedMap={transferedMap}
                        onRef={(ref) => { this.workSpaceRef = ref }}
                        dispatch={dispatch}
                        addTab={(key, title, path, externals, args, nesting) => this.addTab(key, title, path, externals, args, nesting)}
                        removeTab={(externals, key) => { this.removeTab(externals, key) }}
                        onChange={(realUrlPath) => { this.changeTab(realUrlPath) }}
                      />
                      {isMiniLayout &&
                        <Icon
                          className={styles.trigger}
                          type={collapsed ? 'menu-unfold' : 'menu-fold'}
                          onClick={this.toggle.bind(this)}
                        />}
                      {isMiniLayout && <div className={styles.right}>
                        <ScreenFull />
                        {user.name ? (
                          <Dropdown overlay={menu}>
                            <div className={`${styles.action} ${styles.account}`}>
                              <div style={{ float: 'left', padding: '0 10px 0 0' }}>
                                <Avatar size='default' icon='user' className={styles.avatar} />
                              </div>
                              &nbsp;&nbsp;
                                <div style={{ float: 'left', height: '100%' }}>
                                <div style={{ height: '50%', textAlign: 'center', lineHeight: '20px' }}>
                                  {user.name}
                                </div>
                                <div style={{ height: '50%', textAlign: 'center', lineHeight: '20px' }}>
                                  {user.section}
                                </div>
                              </div>
                            </div>
                          </Dropdown>
                        ) : <Spin size='small' style={{ marginLeft: 10 }} />}
                      </div>}
                    </div>
                  );
                }
              }} />
            </div>
          </Content>
          {/* <GlobalFooter
            links={
              [
                {
                  title: '官网',
                  href: 'http://www.htsc.com.cn/htzq/index/index.jsp',
                  blankTarget: true
                }
              ]
            }
            copyright={
              <div>Copyright <Icon type='copyright' />&nbsp;&nbsp;2018 华泰证券股份有限公司</div>
            }
          /> */}
          <BackTop target={this.backTop.bind(this)} visibilityHeight={10} />
        </Layout>
      </Layout>
    );
  }
}

function formatter(data, parentPath = '') {
  const list = [];
  data.forEach((item) => {
    if (item.children) {
      list.push({
        ...item,
        path: `${parentPath}${item.path}`,
        children: formatter(item.children, `${parentPath}${item.path}/`)
      });
    } else {
      list.push({
        ...item,
        path: `${parentPath}${item.path}`
      });
    }
  });
  return list;
}

let transferedMenusMap = {};
function transferMap(formatterMenus) {
  _.each(formatterMenus, (item, i) => {
    if (_.isEmpty(item.children)) {
      transferedMenusMap[item.path] = {};
      transferedMenusMap[item.path]['title'] = item.name;
      transferedMenusMap[item.path]['link'] = item.link;
    } else {
      transferMap(item.children);
    }
  });

  return transferedMenusMap;
}

function mapStateToProps(state) {
  let formatterMenus = formatter(state.menus, ''),
    transferedMap = transferMap(formatterMenus);

  return {
    login: state.login,
    collapsed: state.collapsed,
    rawMenus: state.menus,
    menus: formatterMenus,
    user: state.user,
    transferedMap: transferedMap
  };
}

Home.propTypes = {
  login: PropTypes.object.isRequired,
  collapsed: PropTypes.bool.isRequired,
  rawMenus: PropTypes.array.isRequired,
  menus: PropTypes.array.isRequired,
  user: PropTypes.object.isRequired
};

Home.contextTypes = {
  router: PropTypes.object.isRequired
};

export default connect(mapStateToProps)(Home);