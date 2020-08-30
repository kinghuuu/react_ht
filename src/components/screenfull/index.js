import React, { Component } from 'react'
import PropTypes from 'prop-types'
import screenfull from 'screenfull'
import styles from './index.module.less'

class ScreenFull extends Component {
  constructor(props) {
    super(props)
  }
  click() {
    if (!screenfull.enabled) {
      this.$message({
        message: 'you browser can not work',
        type: 'warning'
      })
      return false
    }
    screenfull.toggle()
  }
  render() {
    return (
      <svg onClick={this.click.bind(this)} className={styles.screenfull} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
        t="1497503607356" viewBox="0 0 1024 1024" version="1.1" p-id="4109" fill={this.props.fill} width={this.props.width} height={this.props.height}>
        <path d="M604.157933 512l204.484208 204.484208 82.942037-82.942037c10.364045-10.952446 26.498514-13.83817 40.309054-8.067746 13.249769 5.742794 22.465664 18.99154 22.465664 33.977859l0 258.042008c0 20.168342-16.695241 36.863582-36.863582 36.863582L659.452283 954.357873c-14.986319 0-28.236088-9.215896-33.977859-23.025413-5.770424-13.249769-2.885723-29.384237 8.067746-39.748283l82.942037-82.942037L512 604.157933 307.515792 808.642141l82.942037 82.942037c10.952446 10.364045 13.83817 26.498514 8.067746 39.748283-5.742794 13.809517-18.99154 23.025413-33.977859 23.025413L106.504686 954.357873c-20.168342 0-36.863582-16.695241-36.863582-36.863582L69.641103 659.452283c0-14.986319 9.215896-28.236088 23.025413-33.977859 13.249769-5.770424 29.384237-2.8847 39.748283 8.067746l82.942037 82.942037 204.484208-204.484208L215.357859 307.515792l-82.942037 82.942037c-6.890944 6.918573-16.10684 10.952446-25.911136 10.952446-4.593622 0-9.804297-1.14815-13.83817-2.8847-13.809517-5.742794-23.025413-18.99154-23.025413-33.977859L69.641103 106.504686c0-20.168342 16.695241-36.863582 36.863582-36.863582L364.546693 69.641103c14.986319 0 28.236088 9.215896 33.977859 23.025413 5.770424 13.249769 2.8847 29.384237-8.067746 39.748283l-82.942037 82.942037 204.484208 204.484208L716.484208 215.357859l-82.942037-82.942037c-10.952446-10.364045-13.83817-26.498514-8.067746-39.748283 5.742794-13.809517 18.99154-23.025413 33.977859-23.025413l258.042008 0c20.168342 0 36.863582 16.695241 36.863582 36.863582l0 258.042008c0 14.986319-9.215896 28.236088-22.465664 33.977859-4.593622 1.736551-9.804297 2.8847-14.397918 2.8847-9.804297 0-19.020192-4.033873-25.911136-10.952446l-82.942037-82.942037L604.157933 512z"
          p-id="4110" />
      </svg>
    )
  }
}

ScreenFull.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  fill: PropTypes.string
}
ScreenFull.defaultProps = {
  width: 22,
  height: 22,
  fill: '#48576a'
}

export default ScreenFull
