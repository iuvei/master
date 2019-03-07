<template lang="pug" src="./index.pug"></template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import Common from './common/index.vue'
import { namespace } from 'vuex-class'
const USER = namespace('user')

@Component({
  components: {
    Common
  }
})
export default class extends Vue {
  @USER.State btnAuth
  activeName: string = 'bonus'
  handleClick() {}

  /**
   * 1.导出按钮权限, 红包和小费共享相同的权限控制
   */
  authorizedButtons = { id_1: 61 }
  /** 根据登录时返回的权限信息控制按钮的显示和隐藏 */
  unauthorizedBtnDic = { id_1: false }

  mounted() {
    this.$unauthorizedBtns(this.btnAuth, this.$route.path, this.authorizedButtons).then(data => (this.unauthorizedBtnDic = data))
  }
}
</script>
