import i18n from '@/i18n'

export default {
  /**
   * 更新语言：zh-CN | zh-TW | en-US | ms-MY
   */
  updateLocale(state: any, locale: string) {
    state.locale = locale
    i18n.locale = locale
    sessionStorage.setItem('locale', locale)
  },

  /**
   * 切换左侧开关栏展开和收起
   */
  switchMeunCollapse(state: any, isMeunCollapse: boolean) {
    state.isMeunCollapse = isMeunCollapse
    sessionStorage.setItem('isMeunCollapse', isMeunCollapse.toString())
  },
  /** 更新时区信息 */
  updateTimeZone(state: any, timeZone: any) {
    state.timeZone = timeZone
  },
  /** 订阅数据，状态更新 */
  updateSubscription(state: any, key: string) {
    state.subscription[key] = true
  }
}
