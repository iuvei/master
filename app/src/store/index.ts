import Vue from 'vue'
import Vuex from 'vuex'
import createLogger from 'vuex/dist/logger'
import state from './state'
import actions from './actions'
import mutations from './mutations'
import user from './modules/user'

Vue.use(Vuex)

const isDebug = process.env.NODE_ENV !== 'production'

const store = new Vuex.Store({
  state,
  mutations,
  actions,
  modules: {
    user
  },
  strict: isDebug,
  plugins: isDebug
    ? [
        createLogger({
          filter: mutation => mutation.type !== 'updateTimeZone' // 时区时间变化不打logger
        })
      ]
    : []
})

export default store
