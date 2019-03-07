<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class TableCommon extends Vue {
  /** 数据源 */
  @Prop(Array) tableData!: any

  /** 表格的配置项 */
  @Prop(Array) tableHead!: any

  /** 分页控制器对象*/
  @Prop(Object) paginationObj!: any
  onPageSizeChange(size) {
    this.$emit('changeSizeAndPage', { size })
  }
  onCurrentChange(page) {
    this.$emit('changeSizeAndPage', { page })
  }
  // 隐藏按钮
  hiddenBtn(btn, obj) {
    const { hiddenProp, hiddenValue, isShow } = btn
    if (hiddenProp) {
      let show = true
      hiddenValue.map((i: number) => {
        if (obj[hiddenProp] === i) {
          show = false
        }
      })
      return show && isShow
    }
    return isShow
  }
}
</script>
