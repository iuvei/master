<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import HomeHeader from '@/components/home-header/index.vue'
import HomeMenu from '@/components/home-menu/index.vue'
import { State } from 'vuex-class'
import { values } from 'lodash'

@Component({
  components: {
    HomeHeader,
    HomeMenu
  }
})
export default class Home extends Vue {
  @State subscription
  /** 全部订阅完成后开始渲染 */
  get subscriptionAllRight() {
    return values(this.subscription).every(v => v)
  }
}
</script>
