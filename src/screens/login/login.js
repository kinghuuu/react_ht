import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Form, Icon, Input, Checkbox, Alert } from 'antd';
import { connect } from 'react-redux';
import { GLOBAL_NAME } from '../../util/util';
import { updateLoginStatusAction, postLoginAction } from '../../actions/login/action';
import styles from './login.module.less';

const FormItem = Form.Item;

class Login extends Component {
    constructor(props, context) {
        super(props, context);
    }

    renderAlert = (message) => {
        return (
            <Alert
                style={{ marginBottom: 24 }}
                message={message}
                type='error'
                showIcon
            />
        );
    }

    handleSubmit(e) {
        e.preventDefault();
        this.props.form.validateFields({ force: true },
            (err, values) => {
                if (!err) {
                    this.props.dispatch(
                        updateLoginStatusAction({
                            submitting: true
                        })
                    );
                    this.props.dispatch(
                        // 向后台发送用户名密码信息，核对数据
                        postLoginAction(values, (status) => {
                            if (status === 'ok') {
                                sessionStorage.setItem('loginStatus', 'ok');
                                this.context.router.history.replace('/home');
                            }
                        })
                    );
                }
            }
        );
    }

    componentDidMount() {
        let loginStatus = sessionStorage.getItem('loginStatus');
        // 如果处于已登录状态，则跳转到主界面
        if (loginStatus === 'ok') {
            // this.context.router.history.replace('/home/dashboard/dashboard');            
        }
    }

    render() {
        const { form, login } = this.props;
        const { getFieldDecorator } = form;

        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <a href='#login'>
                        <img className={styles.logo} src={require('../../assets/imgs/logo.png')} />
                        <span className={styles.title}>GLOBAL_NAME</span>
                    </a>
                </div>
                <Form onSubmit={this.handleSubmit.bind(this)} className={styles['login-form']}>
                    {
                        login.success === false &&
                        login.submitting === false &&
                        this.renderAlert(login.message)
                    }
                    <FormItem>
                        {getFieldDecorator('userName', {
                            rules: [{ required: true, whitespace: true, message: '请输入账户名!' }],
                        })(
                            <Input size='large' prefix={<Icon type='user' className={styles['prefix-icon']} />}
                                placeholder='账户名' />
                        )}
                    </FormItem>
                    <FormItem>
                        {getFieldDecorator('password', {
                            rules: [{ required: true, message: '请输入密码!' }],
                        })(
                            <Input size='large' prefix={<Icon type='lock' className={styles['prefix-icon']} />}
                                type='password' placeholder='密码' />
                        )}
                    </FormItem>
                    <FormItem className={styles.additional}>
                        {getFieldDecorator('remember', {
                            valuePropName: 'checked',
                            initialValue: true,
                        })(
                            <Checkbox className={styles.autoLogin}>记住我</Checkbox>
                        )}
                        <a className={styles.modify} href='#modify'>修改密码</a>
                        <Button type='primary' size='large' htmlType='submit' loading={login.submitting}
                            className={styles.submit}>
                            登录
                        </Button>
                    </FormItem>
                </Form>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        login: state.login
    };
}

Login.propTypes = {
    login: PropTypes.object.isRequired
};

// contextTypes必须设置才能使用this.context
Login.contextTypes = {
    router: PropTypes.object.isRequired
};

const NormalLogin = Form.create()(Login);

export default connect(mapStateToProps)(NormalLogin);