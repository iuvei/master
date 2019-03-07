<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component, Mixins } from 'vue-property-decorator'
import { VNode } from 'vue'
import api from '@/api'
import _ from 'lodash'
import DayPicker from '@/components/day-picker/index.vue'
import { State, namespace } from 'vuex-class'
import ExportMixin from '@/mixins/export-mixin.tsx'
const USER = namespace('user')

@Component({ components: { DayPicker } })
export default class ReceiptSummary extends Mixins(ExportMixin) {
  @USER.State btnAuth
  @State timeZone
  $refs!: {
    dayPicker: Vue
  }
  get hallname() {
    let name: any = _.find(this.hallList, { key: this.formData.hall_id })
    return name.label
  }
  formData: FormData = {
    date_begin: '',
    date_end: '',
    hall_id: '',
    user_type: 'user',
    name: '',
    page: 1,
    page_size: 20
  }
  pageInfo: PageInfo = {
    page: 1,
    size: 20,
    sizes: [20, 50, 100, 200],
    total: 0,
    send_balance: 0,
    transfer_diff_balance: 0
  }
  date: string[] = []
  hallList: SelectOption[] = []
  typeList: SelectOption[] = [
    {
      label: '会员',
      value: 'user'
    },
    {
      label: '代理',
      value: 'agent'
    },
    {
      label: '股东',
      value: 'shareholder'
    }
  ]
  headerContent = {
    deposit_total_amount: '公司入款、线上支付、人工存提中-手动存款金额总和',
    withdraw_online_amount: '会员出款、不包含人工存提中的手动提款',
    withdraw_manual_amount: '人工存提中的手动提款金额总和及人数总和',
    withdraw_fee_amount: '会员发起出款被扣手续费及行政费总额及人数',
    coupon_total_amount: '所有渠道赠送优惠金额总额及人数',
    rebet_amount: '发放返水金额总和及人数',
    withdraw_refuse_amount: '会员发起和后台手动发起的出款申请被决绝订单金额总额及人数'
  }
  tableData: any[] = []
  loading: boolean = false
  timer: any

  exportModuleKeyName: string = 'REPORT_MONEYLOG'

  /**
   * 1.导出按钮权限
   */
  authorizedButtons = { id_1: 60 }
  /** 根据登录时返回的权限信息控制按钮的显示和隐藏 */
  unauthorizedBtnDic = { id_1: false }

  mounted() {
    this.dateChange()
    this.getHallList()
    this.doQuery()
    this.timer = setInterval(() => {
      this.doQuery()
    }, 600000)
    this.$unauthorizedBtns(this.btnAuth, this.$route.path, this.authorizedButtons).then(data => (this.unauthorizedBtnDic = data))
  }
  /**
   * 表头的问号
   */
  renderTableHeader(h, { column, $index }) {
    return h('span', {}, [
      h('span', {}, column.label),
      h(
        'el-popover',
        {
          props: {
            placement: 'top-start',
            width: '220',
            trigger: 'hover'
          }
        },
        [h('i', { slot: 'reference', class: 'el-icon-question' }, ''), h('span', this.headerContent[column.property])]
      )
    ])
  }
  dateChange() {
    const [date_begin, date_end] = this.date
    this.formData = { ...this.formData, date_begin, date_end }
  }
  doQuery() {
    if (this.loading) return false
    if (this.formData.name && !this.formData.hall_id) {
      this.$message.error('请输入厅主名称')
      return false
    }
    this.loading = true
    api
      .cashTradeBalance2(this.formData)
      .then((res: any) => {
        if (res.code === 0) {
          this.tableData = res.data.list || []
          this.pageInfo.page = res.data.pagination.page
          this.pageInfo.size = res.data.pagination.size
          this.pageInfo.total = res.data.pagination.total
          this.pageInfo.transfer_diff_balance = res.data.pagination.transfer_diff_balance
          this.pageInfo.send_balance = res.data.pagination.send_balance
          this.loading = false
        } else {
          this.$message.error(res.msg)
          this.tableData = []
          this.loading = false
        }
      })
      .catch(err => {
        this.loading = false
      })
  }
  getHallList() {
    api
      .getHallList()
      .then((res: any) => {
        if (res.code === 0) {
          this.hallList = res.data
        } else {
          this.$message.error(res.msg)
        }
      })
      .catch(err => {})
  }
  doReset() {
    this.$refs.dayPicker.$emit('reset')
    this.formData = {
      ...this.formData,
      date_begin: this.date[0],
      date_end: this.date[1],
      hall_id: '',
      user_type: 'user',
      name: ''
    }
    this.doQuery()
  }
  onPageSizeChange(size) {
    this.formData.page = 1
    this.formData.page_size = size
    this.doQuery()
  }
  onCurrentChange(page) {
    this.formData.page = page
    this.doQuery()
  }

  beforeDestroy() {
    if (this.timer) window.clearInterval(this.timer)
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
    const keys = ['page', 'page_size']
    let params: any = this.$deleteKeys(this.formData, keys)

    /** 过滤空值字段 */
    params = _.pickBy(params, val => val !== '')
    return params
  }
}
interface FormData {
  date_begin: string
  date_end: string
  hall_id: string | number
  user_type: string
  name: string
  page: number
  page_size: number
}
interface PageInfo {
  page: number
  size: number
  sizes: number[]
  total: number
  transfer_diff_balance: number
  send_balance: number
}
interface SelectOption {
  label?: string
  value?: string
  key?: string | number
}
</script>
