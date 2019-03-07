<template lang="pug" src="./index.pug"></template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import api from '@/api'
import _ from 'lodash'
import gameAdmin from '../components/games-admin/index.vue'
import recomGames from '../components/recom-games/index.vue'
import apiSetting from '../components/api-setting/index.vue'
import sumGamesLabel from '../components/sum-games-label/index.vue'
import cardEgame from '../components/card-egame/index.vue'
import { namespace } from 'vuex-class'

const USER = namespace('user')

@Component({
  components: {
    gameAdmin,
    apiSetting,
    recomGames,
    sumGamesLabel,
    cardEgame
  }
})
export default class gamesAdministration extends Vue {
  @USER.State btnAuth
  //默认选中状态
  activeName = 'gameAdmin'

  authorizedButtons = { gameAdmin: 46, apiSetting: 47, recomGames: 48, sumGamesLabel: 49, cardEgame: 63 }
  unauthorizedBtnDic = { gameAdmin: false, apiSetting: false, recomGames: false, sumGamesLabel: false, cardEgame: false }

  permission: any = {
    gameAdmin: false,
    apiSetting: false,
    recomGames: false,
    sumGamesLabel: false,
    cardEgame: false
  }

  //tab切换事件
  handleClick(tab, event) {
    this.$router.push({ path: '/games-administration', query: { type: tab.name } })
  }

  init() {
    const tabNames = _.keys(this.permission).filter(key => this.permission[key]),
      { type } = this.$route.query
    if (type && this.permission[type]) {
      this.activeName = type
    } else if (!type && this.permission['gameAdmin']) {
      this.activeName = 'gameAdmin'
    } else {
      this.activeName = tabNames.length ? tabNames[0] : ''
    }
  }

  mounted() {
    this.$unauthorizedBtns(this.btnAuth, this.$route.path, this.authorizedButtons).then(data => {
      this.unauthorizedBtnDic = data
      _.keys(this.permission).map(key => (this.permission[key] = !!this.unauthorizedBtnDic[key]))
      this.init()
    })
  }
}
</script>
