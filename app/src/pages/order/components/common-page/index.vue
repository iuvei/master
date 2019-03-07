<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="tsx">
import { Component, Vue, Prop, Mixins } from 'vue-property-decorator'
import DatetimePicker from '@/components/datetime-picker/index.vue'
import { Form } from 'element-ui'
import api from '@/api'
import _ from 'lodash'
import config from '@/config'
import ExportMixin from '@/mixins/export-mixin.tsx'
import { State, namespace } from 'vuex-class'
const USER = namespace('user')
@Component({
  components: {
    DatetimePicker
  }
})
export default class extends Mixins(ExportMixin) {
  @USER.State btnAuth
  @State timeZone
  // 扩展form数据
  @Prop() formAdd!: object
  // 扩展form模板的数据
  @Prop() formAddList!: object
  // 扩展表格表头内容
  @Prop() tableHeadAdd!: Array<object>
  // 不同游戏的数据，用于接口请求
  @Prop() query!: any
  @Prop() authorizedButtons!: any
  $refs!: {
    form: Form
  }
  baseTimezone: number = -4 /** 系统时间所在时区 */
  timezone: number = -4 /** 用户所选时区 */
  timezoneOffset: number = 0 /** 请求输出时间转换为用户选择时区时所用的时区偏移量 */
  timezones: any[] = [{ label: '美东时间', value: -4 }, { label: '北京时间', value: 8 }, { label: '世界标准时间', value: 0 }]
  date_type = 1
  options: any = [
    {
      value: 1,
      label: '投注时间'
    },
    {
      value: 2,
      label: '结算时间'
    }
  ]
  form: any = {
    hall_id: '',
    member_name: '',
    order_number: '',
    ...this.formAdd
  }
  copyForm = JSON.parse(JSON.stringify(this.formAdd))
  /** 表头定义 */
  tableHead = [
    {
      label: '厅主名称',
      prop: 'company_name',
      width: '100',
      formatter: (row, column, val) => {
        const h = this.$createElement
        return (
          <el-button type="text" onClick={() => this.toHallManage(row)}>
            {val}
          </el-button>
        )
      }
    },
    {
      label: '会员账号',
      prop: 'username',
      width: '100'
    },
    {
      label: '注单号',
      prop: 'order_number',
      minWidth: '120'
    },
    {
      label: '第三方账号',
      prop: 'partner_account',
      width: '120'
    },
    {
      label: '游戏名称',
      prop: 'game_name',
      minWidth: '100'
    },
    {
      label: '投注时间/结算时间',
      prop: 'bet_reckon',
      width: '150',
      formatter: (row, column, val) => {
        const h = this.$createElement
        return <span domPropsInnerHTML={this.timezoneConversion(row)} />
      }
    },
    {
      label: '游戏类型',
      prop: 'partner_name',
      width: '100',
      hidden: !this.query.total
    },
    {
      label: '投注内容',
      prop: 'bet_content',
      minWidth: '240',
      hidden: this.query.type !== 'esports' && this.query.type !== 'live' && this.query.type !== 'lottery' && this.query.type !== 'sport',
      formatter: (row, column, val) => {
        const h = this.$createElement
        return <div class="textLeft" domPropsInnerHTML={row.bet_content} />
      }
    },
    ...this.tableHeadAdd
  ]
  /** 表格数据 */
  tableData: object[] = []
  /** 表格是否正在加载 */
  isLoading: boolean = false
  days: string[] = []
  sizes: number[] = [20, 50, 100, 200]
  page: number = 1
  size: number = 20
  total: number = 0

  // 全部厅主名称的数组
  companys = []

  /** 根据登录时返回的权限信息控制按钮的显示和隐藏 */
  unauthorizedBtnDic = { id_1: false }
  get arraySpan() {
    let length = this.query.total ? this.tableHead.length : this.tableHead.length - 1
    switch (this.query.type) {
      case 'live':
        length = length - 3
        break
      case 'card':
      case 'esports':
      case 'sport':
      case 'lottery':
        length = length - 4
        break
      case 'egame':
        length = length - 5
        break
    }
    return length
  }
  mounted() {
    this.getCompanys()
    const reg = /UTC\/GMT (\S*):00/
    if (this.timeZone.utc && this.timeZone.utc.match(reg)) {
      this.baseTimezone = this.timezone = Number(this.timeZone.utc.match(reg)[1])
    }
    this.requestTable()
    this.$unauthorizedBtns(this.btnAuth, this.$route.path, this.authorizedButtons).then(data => (this.unauthorizedBtnDic = data))
  }

  /** 全部厅主数组 */
  getCompanys() {
    api.getCashHallList().then((res: any) => {
      if (res.code === 0) this.companys = res.data || []
    })
  }
  /**
   * 注单数据查询
   *
   */

  requestTable() {
    this.isLoading = true
    const params = { ...this.genParams(), page: this.page, page_size: this.size }

    api
      .partnerOrderList(this.query.type, params)
      .then((response: any) => {
        this.isLoading = false

        if (response.code === 0) {
          this.size = response.data.pagination.size
          this.page = response.data.pagination.page
          this.total = response.data.pagination.total
          this.tableData = response.data.list
          if (this.tableData.length > 0) {
            this.tableData.push({
              username: '小计',
              bet_amount: response.data.subTotalSum.bet_amount,
              validbet: response.data.subTotalSum.validbet,
              profit: response.data.subTotalSum.profit,
              prize: response.data.subTotalSum.prize,
              contribute_amount: response.data.subTotalSum.contribute_amount
            })
            this.tableData.push({
              username: '总计',
              bet_amount: response.data.totalSum.bet_amount,
              validbet: response.data.totalSum.validbet,
              profit: response.data.totalSum.profit,
              prize: response.data.totalSum.prize,
              contribute_amount: response.data.totalSum.contribute_amount
            })
          }
        } else {
          this.$message.error(response.msg)
          this.total = 0
          this.tableData = []
        }
      })
      .catch(error => {
        this.isLoading = false
      })
  }
  //表格合并行和列
  arraySpanMethod({ row, column, rowIndex, columnIndex }) {
    const length = this.arraySpan
    if (columnIndex < length && !row.hall_id) {
      if (columnIndex === 1) {
        return [1, length]
      } else {
        return [0, 0]
      }
    }
  }
  toHallManage(row) {
    this.$router.push({ path: '/mainhall-manage', query: { hall_name: row.company_name, hall_id: row.hall_id } })
  }
  changeTimezone(val) {
    this.timezone = val
  }
  /** 查询 */
  onQueryClick() {
    this.requestTable()
  }

  onDownloadClick() {
    const exportConfig = {
      api_params: this.genParams(),
      module_id: this.getModuleId(this.query.exportModuleKeyName)
    }
    api.exportingReport(exportConfig).then(res => {
      if (res.code === 0) {
        this.onExportSuccess()
      } else {
        this.$message.error(res.msg)
      }
    })
  }

  /** 生成查询条件数据(不含分页相关参数) */
  genParams() {
    let _days = [...this.days]
    /** 用户选择时区和系统时区不一致时，设置时区偏移量并转换请求所用的时间，否则时区偏移量置0 */
    if (this.baseTimezone !== this.timezone) {
      this.timezoneOffset = -this.baseTimezone + this.timezone
      _days = _days.map(time => {
        const _time = new Date(time)
        _time.setHours(_time.getHours() - this.timezoneOffset)
        return _time.format('yyyy-MM-dd hh:mm:ss')
      })
    } else {
      this.timezoneOffset = 0
    }
    let params: any = {
      partner_name: this.query.game_name,
      date_type: this.date_type
    }
    let days = {
      time_begin: _days[0],
      time_end: _days[1]
    }
    params = _.assign(params, this.form, days)
    if (!this.query.total) {
      params = _.assign(params, { partner_id: this.query.game_id })
    }

    /** 过滤空值字段 */
    params = _.pickBy(params, val => val !== '')
    return params
  }

  /** 重置 */
  onResetClick() {
    let formAdd = Object.keys(this.copyForm).length > 0 ? this.copyForm : {}
    this.form = {
      hall_id: '',
      member_name: '',
      order_number: '',
      ...formAdd
    }
    this.timezone = -4
    this.date_type = 1
    this.days = []
    this.page = 1
    this.$nextTick(() => this.requestTable())
  }
  /** 分页器每页个数变化回调 */
  onPageSizeChange(size: number) {
    this.size = size
    this.requestTable()
  }

  /** 分页器页码变化回调 */
  onCurrentChange(page: number) {
    this.page = page
    this.requestTable()
  }
  /** 时区转换 */
  timezoneConversion(row) {
    const times: string[] = []
    times.push(row.bet_time)
    if (this.query.type !== 'esports' && this.query.type !== 'sport') {
      /** 非电竞和体育注单，直接显示结算时间 */
      times.push(row.reckon_time)
    } else if (this.query.type === 'esports' && row.partner_status != 52 && row.partner_status != 54) {
      /** 电竞注单，非未结算和待定状态显示结算时间 */
      times.push(row.reckon_time)
    } else if (this.query.type === 'sport' && row.status != 2 && row.status != 5) {
      /** 体育注单，非未结算和待定状态显示结算时间 */
      times.push(row.reckon_time)
    }
    return times
      .map(time => {
        if (time) {
          const _time = new Date(time)
          _time.setHours(_time.getHours() + this.timezoneOffset)
          return _time.format('yyyy-MM-dd hh:mm:ss')
        } else {
          return '--'
        }
      })
      .join('<br/>')
  }
}
</script>
