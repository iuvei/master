<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import FourCheckbox from './../four-checkbox/index.vue'

@Component({
  components: {
    FourCheckbox
  }
})
export default class DetailDialog extends Vue {
  /** 数据源 */
  @Prop(Object) dialogConfig!: any

  // fourcheckbox的配置
  @Prop(Object) roleDialog!: any
  isAllIndeterminated: boolean = false
  isAllSelect: boolean = false
  disabled: boolean = false

  @Watch('roleDialog', { deep: true })
  onRoleDialogChanged(val) {
    this.calculateIsAll(val.auth)
  }

  // 编辑时，比较修改前和修改后哪个长度长
  get detailConfig() {
    const { before, after } = this.dialogConfig.content
    return before.length > after.length ? before : after
  }

  calculateIsAll(tempArr) {
    let count = 0
    let bool = false
    tempArr.map((obj: any) => {
      if (obj.model) {
        count++
      }
      if (obj.indeterminate) {
        bool = true
      }
    })
    let tempLength = tempArr.length
    this.isAllSelect = count === tempLength
    this.isAllIndeterminated = (count > 0 && count < tempLength) || bool
  }
}
</script>
