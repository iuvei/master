<template lang="pug" src="./index.pug"></template>

<style lang="stylus" scoped src="./index.styl"></style>

<script lang="tsx">
import webConfig from '@/config'
import { Vue, Component, Watch, Mixins } from 'vue-property-decorator'
import { Table } from 'element-ui'
import { State, namespace } from 'vuex-class'
import api from '@/api'
import _ from 'lodash'
import DayPicker from '@/components/day-picker/index.vue'
import { stringify } from 'querystring'
import ExportMixin from '@/mixins/export-mixin.tsx'
import SelectGame from '@/mixins/select-game'

@Component({ components: { DayPicker } })
export default class ApiStatement extends Mixins(ExportMixin, SelectGame) {
  @State timeZone
  @namespace('user').State token
  @namespace('user').State btnAuth
  /**
   * 需要授权的按钮
   * export: 导出
   */
  authorizedButtons: { [key: string]: number } = { export: 57 }
  // 按钮权限集合
  unauthorizedBtnDic = { export: false }
  $refs!: {
    table: Table
    dayPicker: Vue
  }
  days: string[] = []
  form: any = {
    hall_id: '',
    order: 'profit',
    sort: 'descending'
  }
  companys: any[] = []
  tableData: any[] = []
  page: number = 1
  sizes: number[] = [20, 50, 100, 200]
  size: number = 20
  total: number = 0
  isLoading: boolean = false

  exportModuleKeyName: string = 'REPORT_BILL'

  mounted() {
    const { date_begin, date_end } = this.$route.query

    if (date_begin && date_end) {
      this.days = [date_begin, date_end]
    }
    this.getCompanys()
    this.getGameTypes()
      .then(() => this.queryBySort(this.form.order, this.form.sort))
      .catch(() => this.queryBySort(this.form.order, this.form.sort))
    // 获取子页面按钮的权限
    this.$unauthorizedBtns(this.btnAuth, this.$route.path, this.authorizedButtons).then(data => (this.unauthorizedBtnDic = data))
  }
  getCompanys() {
    api.getCashHallList().then((res: any) => {
      if (res.code === 0) this.companys = res.data || []
    })
  }

  querySearch(str, cb) {
    if (str) {
      cb(this.companys.map(v => ({ value: v.label || '' })).filter(v => v.value.toLowerCase().indexOf(str.toLowerCase()) !== -1))
    } else {
      cb([])
    }
  }
  queryBySort(order, sort) {
    this.$refs.table.clearSort()
    this.$nextTick(() => this.$refs.table.sort(order, sort))
  }
  onQueryClick() {
    let form = { ...this.genParams(), page: this.page, page_size: this.size }

    api
      .getStateGame(form)
      .then((res: any) => {
        this.isLoading = false
        if (res.code === 0) {
          this.tableData = res.data.list || []
          if (this.tableData.length && res.data.subTotalSum) {
            this.tableData.push({
              ...res.data.subTotalSum,
              partner_name: '小计'
            })
          }
          if (this.tableData.length && res.data.totalSum) {
            this.tableData.push({
              ...res.data.totalSum,
              partner_name: '总计'
            })
          }
          this.page = res.data.pagination.page
          this.size = res.data.pagination.size
          this.total = res.data.pagination.total
        } else {
          this.$message.error(res.msg)
          this.tableData = []
        }
      })
      .catch(err => {
        this.isLoading = false
      })
  }
  onResetClick() {
    this.form.hall_id = ''
    this.form.order = 'profit'
    this.form.sort = 'descending'
    this.$refs.dayPicker.$emit('reset')
    this.handleCheckAllChange({ type: 0 }, true)
    this.page = 1
    this.$nextTick(() => this.queryBySort(this.form.order, this.form.sort))
  }

  renderHeader(prop: string) {
    let label = '',
      tips = ''
    switch (prop) {
      case 'bet_amount':
        label = '总投注金额'
        tips = '会员投注总金额，包含第三方撤单注单金额'
        break
      case 'validbet':
        label = '总有效投注额'
        tips = '有效投注的总和，有效投注是用于计算优惠的根据'
        break
      case 'bet_number':
        label = '有效注单数'
        tips = '所有有效投注的注单笔数总和'
        break
      case 'bonus_amount':
        label = '彩金'
        tips = '会员玩彩金池游戏的中奖金额总和，该彩金由第三方游戏提供'
        break
      case 'contribute_amount':
        label = '贡献'
        tips = '由会员总投注额中，抽取一部分金额作为彩金池的贡献'
        break
    }
    return (h, { column, $index }, index) => {
      return h('span', {}, [
        h('span', {}, label),
        h(
          'el-popover',
          {
            props: {
              placement: 'top-start',
              width: '200',
              trigger: 'hover',
              content: tips
            }
          },
          [h('i', { slot: 'reference', class: 'el-icon-question' }, '')]
        )
      ])
    }
  }
  sortChange({ prop, order }) {
    this.form.order = prop || ''
    this.form.sort = order || ''
    this.onQueryClick()
  }
  onPageSizeChange(size) {
    this.size = size
    this.page = 1
    this.onQueryClick()
  }
  onCurrentChange(page) {
    this.page = page
    this.onQueryClick()
  }
  /**
   * 合并列
   */
  spanMethod({ row, column, rowIndex, columnIndex }) {
    if (!row.hall_id && columnIndex < 4) {
      if (columnIndex === 2) {
        return { rowspan: 1, colspan: 4 }
      } else {
        return { rowspan: 1, colspan: 0 }
      }
    } else {
      return { rowspan: 1, colspan: 1 }
    }
  }

  onDownloadClick() {
    if (this.isExporting) return

    const exportConfig = {
      api_params: this.genParams(),
      module_id: this.getModuleId(this.exportModuleKeyName)
    }

    this.isExporting = true
    api
      .exportingReport(exportConfig)
      .then(res => {
        this.isExporting = false
        if (res.code === 0) {
          this.onExportSuccess()
        } else {
          this.$message.error(res.msg)
        }
      })
      .catch(() => (this.isExporting = false))
  }

  genParams() {
    const games = this.gameTypes.filter(v => this.gameTypeActive.indexOf(v.index) !== -1).map(v => ({ partner_id: v.partner_id, game_type: v.game_type }))
    let form: any = {
      type: 2,
      hall_id: this.form.hall_id,
      order: this.form.order,
      desc: this.form.sort === 'descending' ? 'desc' : this.form.sort === 'ascending' ? 'asc' : '',
      date_begin: this.days[0],
      date_end: this.days[1],
      games: JSON.stringify(games)
    }

    /** 过滤空值字段 */
    form = _.pickBy(form, val => val !== '')
    return form
  }
}
</script>
