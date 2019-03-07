/**
 * rootState 根节点数据
 *
 * @author zhenda.li
 */

const state = {
  /** 本地语言 */
  locale: sessionStorage.getItem('locale') || 'zh-CN',

  // UI 相关
  /** 左侧菜单栏是否收起 */
  isMeunCollapse: eval(sessionStorage.getItem('isMeunCollapse') || 'false'),

  /** 服务器所在时区和时间 */
  timeZone: {
    name: '', // 时区名字
    utc: '', // utc时间
    value: 0, // 时间戳
    startUp: false // 是否开启计时
  },
  /** 订阅数据，页面开始渲染前的数据请求 */
  subscription: {
    getTimeZone: false // 获取服务器时间
  }
}

export default state
