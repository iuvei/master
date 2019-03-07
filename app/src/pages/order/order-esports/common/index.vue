<template lang="pug" src="./index.pug"></template>

<script lang="tsx">
import { Component, Vue, Prop } from 'vue-property-decorator'
import CommonPage from '../../components/common-page/index.vue'
import _ from 'lodash'

@Component({
  components: {
    CommonPage
  }
})
export default class extends Vue {
  @Prop() query!: any
  authorizedButtons = { id_1: 40 }
  /**
   * 请求相关数据,不同报表修改对应的type值。
   *  type可选 ：棋牌-card,视讯-live,体育-sport,电子-egame,电竞-esports
   *  total: 是否是总览,为true则是总览
   */

  queryAdd = {
    type: 'esports',
    total: !this.query.game_id,
    exportModuleKeyName: 'ORDER_ESPORT',
    ...this.query
  }
  /**
   *
   * @form @formList 查询条件除去公共部分的字段名及模板类型和相关数据，目前支持select和普通输入框（不需要定义type和list）
   *  公共部分包含：日期、厅主名称、会员账号、注单号
   */

  form = {
    // result: 0,
    status: 0
  }
  formList = {
    // result: {
    //   type: 'select',
    //   label: '投注结果',
    //   list: [{ label: '全部', value: 0 }, { label: '全赢', value: 1 }, { label: '全输', value: 2 }]
    // },
    status: {
      type: 'select',
      label: '状态',
      list: [
        { label: '全部', value: 0 },
        { label: '已结算', value: 2 },
        { label: '未结算', value: 1 },
        { label: '退款', value: 3 },
        { label: '拒绝', value: 4 },
        { label: '待定', value: 5 },
        { label: '取消', value: 6 }
      ]
    }
  }
  result = [
    { label: '--', value: '51' },
    { label: '--', value: '52' },
    { label: '--', value: '53' },
    { label: '--', value: '54' },
    { label: '--', value: '55' },
    { label: '全赢', value: '56' },
    { label: '--', value: '57' },
    { label: '全输', value: '58' }
  ]
  status = [
    { label: '已结算', value: '56' },
    { label: '已结算', value: '58' },
    { label: '未结算', value: '54' },
    { label: '退款', value: '57' },
    { label: '拒绝', value: '53' },
    { label: '待定', value: '52' },
    { label: '取消', value: '51' },
    { label: '取消', value: '55' }
  ]
  /**
   *
   * @tableHead 表格表头除去公共部分的数据
   *  公共部分包含：厅主名称、会员账号、注单号、投注时间、第三方账号、游戏名称、投注内容、投注结果、状态
   */

  tableHead = [
    // {
    //   label: '投注结果',
    //   prop: 'partner_status',
    //   width: '80',
    //   formatter: (row, column, value: number, index) => {
    //     let t: any = _.find(this.result, { value: value })
    //     return t ? t.label : value
    //   }
    // },
    {
      label: '状态',
      prop: 'partner_status',
      width: '80',
      formatter: (row, column, value: number, index) => {
        let t: any = _.find(this.status, { value: value })
        return t ? t.label : value
      }
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
      label: '中奖金额',
      prop: 'prize',
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
