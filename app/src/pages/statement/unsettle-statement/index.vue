<template lang="pug" src="./index.pug"></template>

<style lang="stylus" scoped src="./index.styl"></style>

<script lang="ts">
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
export default class GameStatement extends Mixins(ExportMixin, SelectGame) {
  @State timeZone
  @namespace('user').State token
  @namespace('user').State btnAuth
  /**
   * 需要授权的按钮
   * export: 导出
   */
  authorizedButtons: { [key: string]: number } = { export: 62 }
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

  exportModuleKeyName: string = 'REPORT_UNSETTLE'

  mounted() {
    const { date_begin, date_end } = this.$route.query

    if (date_begin && date_end) {
      this.days = [date_begin, date_end]
    }
    this.getCompanys()
    this.getGameTypes()
      .then(() => this.onQueryClick())
      .catch(() => this.onQueryClick())
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
  onQueryClick() {
    const form = { ...this.genParams(), page: this.page, page_size: this.size }
    api
      .getStateUnsettle(form)
      .then((res: any) => {
        this.isLoading = false
        if (res.code === 0) {
          this.tableData = res.data.list || []
          if (this.tableData.length && res.data.subTotalSum) {
            this.tableData.push({
              ...res.data.subTotalSum,
              gameType: '小计'
            })
          }
          if (this.tableData.length && res.data.totalSum) {
            this.tableData.push({
              ...res.data.totalSum,
              gameType: '总计'
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
    this.$refs.dayPicker.$emit('reset')
    this.handleCheckAllChange({ type: 0 }, true)
    this.page = 1
    this.$nextTick(() => this.onQueryClick())
  }
  onExportClick() {
    const games = this.gameTypes.filter(v => this.gameTypeActive.indexOf(v.partner_id) !== -1).map(v => ({ partner_id: v.partner_id, game_type: v.game_type }))
    let form = {
      hall_id: this.form.hall_id,
      date_begin: this.days[0],
      date_end: this.days[1],
      games: JSON.stringify(games),
      Authorization: `Bearer ${this.token}`
    }
    let url = `${webConfig.baseURL}/down/state/game`
    _.toPairs(form).map(([key, val], index) => {
      if (val !== '') {
        url += `${/\?/.test(url) ? '&' : '?'}${key}=${val}`
      }
    })
    window.open(url)
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
    if (!row.id && columnIndex < 1) {
      return { rowspan: 1, colspan: 2 }
    } else if (!row.id && columnIndex < 2) {
      // 没有用户名的合并两列
      return { rowspan: 1, colspan: 0 }
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
      hall_id: this.form.hall_id,
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
