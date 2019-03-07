import api from '@/api'

export default {
  /** 请求服务器所在的时区和时间 */
  getTimeZone({ commit }) {
    api
      .timezone()
      .then((res: any) => {
        if (res.code === 0) {
          commit('updateTimeZone', {
            name: res.data.timezone_name,
            utc: res.data.timezone,
            value: new Date(res.data.timestamp).getTime(),
            startUp: true
          })
        }
        commit('updateSubscription', 'getTimeZone')
      })
      .catch(err => commit('updateSubscription', 'getTimeZone'))
  }
}
