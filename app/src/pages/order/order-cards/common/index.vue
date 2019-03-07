<template lang="pug" src="./index.pug"></template>

<script lang="tsx">
import { Component, Vue, Prop } from 'vue-property-decorator'
import CommonPage from '../../components/common-page/index.vue'

@Component({
  components: {
    CommonPage
  }
})
export default class extends Vue {
  @Prop() query!: any
  authorizedButtons = { id_1: 43 }
  /**
   * 请求相关数据,不同报表修改对应的type值。
   *  type可选 ：棋牌-card,视讯-live,体育-sport,电子-egame,电竞-esports
   *  total: 是否是总览,为true则是总览
   */

  queryAdd = {
    type: 'card',
    total: !this.query.game_id,
    exportModuleKeyName: 'ORDER_CARD',
    ...this.query
  }
  /**
   *
   * @form @formList 查询条件除去公共部分的字段名及模板类型和相关数据，目前支持select和普通输入框（不需要定义type和list）
   *  公共部分包含：日期、厅主名称、会员账号、注单号
   */

  form = {}
  formList = {}
  /**
   *
   * @tableHead 表格表头除去公共部分的数据
   *  公共部分包含：厅主名称、会员账号、注单号、投注时间、第三方账号、游戏名称、投注内容、投注结果、状态
   */

  tableHead = [
    {
      label: '桌号',
      prop: 'tableID',
      width: '120'
    },
    {
      label: '投注金额',
      prop: 'bet_amount',
      width: '100'
    },
    {
      label: '有效投注金额',
      prop: 'validbet',
      width: '100'
    },
    {
      label: '会员输赢',
      prop: 'profit',
      width: '100',
      formatter: (row, column, val) => {
        const h = this.$createElement
        let textClass = val > 0 ? 'text_success' : val < 0 ? 'text_fail' : ''
        return <div class={textClass} domPropsInnerHTML={val} />
      }
    }
  ]
}
</script>
