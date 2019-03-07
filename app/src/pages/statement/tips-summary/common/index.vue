<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component, Prop, Mixins } from 'vue-property-decorator'
import api from '@/api'
import _ from 'lodash'
import DayPicker from '@/components/day-picker/index.vue'
import { State } from 'vuex-class'
import ExportMixin from '@/mixins/export-mixin.tsx'
import SelectGame from '@/mixins/select-game'

@Component({
  components: {
    DayPicker
  }
})
export default class Tips extends Mixins(ExportMixin, SelectGame) {
  @State timeZone
  @Prop(String)
  type!: 'bonus'
  @Prop(String) exportModuleKeyName!: string
  @Prop() unauthorizedBtnDic!: Object

  $refs!: {
    dayPicker: Vue
  }
  get hallname() {
    let name: any = _.find(this.hallList, { hall_id: this.formData.hall_id })
    return name.hall_name
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
    total: 0
  }
  date: string[] = []
  hallList: any = []
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

  tableData: any[] = []
  loading: boolean = false

  mounted() {
    this.dateChange()
    this.getHallList()
    this.getGameTypes().then(() => this.doQuery())
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
    const { page, page_size } = this.formData
    const params = { ...this.genParams(), page, page_size }
    api
      .tipsList(params)
      .then((res: any) => {
        if (res.code === 0) {
          this.tableData = res.data.list || []
          this.pageInfo.page = res.data.pagination.page
          this.pageInfo.size = res.data.pagination.size
          this.pageInfo.total = res.data.pagination.total
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
      .getUsernameList()
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
    this.handleCheckAllChange({ type: 0 }, true)
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

  onDownloadClick() {
    if (this.isExporting) return
    if (this.formData.name && !this.formData.hall_id) {
      this.$message.error('请输入厅主名称')
      return false
    }

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
    let ids: string[] = []
    const games = this.gameTypes.filter(v => this.gameTypeActive.indexOf(v.index) !== -1).map(v => ({ partner_id: v.partner_id, game_type: v.game_type }))

    let params: any = {
      games: JSON.stringify(games)
    }
    params = _.assign(params, this.formData)

    const keys = ['page', 'page_size']
    params = this.$deleteKeys(params, keys)

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
}
interface SelectOption {
  label?: string
  value?: string
}
interface gameItem {
  list?: Array<string>
  name?: string
  type?: string | number
}
</script>
