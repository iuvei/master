<template lang="pug" src="./index.pug"></template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import api from '@/api'
import _ from 'lodash'
import gameLabel from '../game-label/index.vue'
import labelManage from '../label-manage/index.vue'

@Component({
  components: {
    gameLabel,
    labelManage
  }
})
export default class gamesAdministration extends Vue {
  @Prop(Object) permissions: any
  //默认选中状态
  activeName = 'gameLabel'

  //tab切换事件
  handleClick(tab, event) {
    // this.$router.push({ path: '/games-administration', query: { type: tab.name } })
  }

  init() {
    // if (this.$route.query.type) {
    //   this.activeName = this.$route.query.type
    // } else {
    //   this.activeName = 'gameLabel'
    // }
  }

  created() {
    // this.init()
  }
}
</script>
