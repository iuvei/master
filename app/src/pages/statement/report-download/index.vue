<template lang="pug" src="./index.pug"></template>
<style lang="stylus" scoped src="./index.styl"></style>

<script lang="tsx">
import { Vue, Component } from 'vue-property-decorator'
import api from '@/api'
import { pickBy } from 'lodash'
import http from '@/utils/http.ts'

@Component
export default class ReportDownload extends Vue {
  /**分页相关数据 */
  sizes: number[] = [20, 50, 100, 200]
  page: number = 1
  size: number = 20
  total: number = 0

  /** 筛选条件默认值 */
  readonly formSchema = {
    menu: '',
    subMenu: ''
  }

  /** 筛选条件的表单 */
  form: any = {}

  /** 表格数据 */
  tableData: any[] = []

  /** 表格头部定义 */
  tableHead = [
    {
      label: '菜单模块',
      prop: 'module_name'
    },
    {
      label: '子模块',
      prop: 'sub_module_name'
    },
    {
      label: '导出文件名称',
      prop: 'filename',
      minWidth: 300
    },
    {
      label: '导出时间',
      prop: 'created_at',
      width: 150
    },
    {
      label: '文件状态',
      prop: 'status',
      width: 100,
      formatter: (row, column) => {
        const h = this.$createElement
        const statusDic = {
          0: { text: '等待导出', className: '' },
          1: { text: '数据统计中', className: '' },
          2: { text: '可下载', className: 'text_success' },
          3: { text: '导出失败', className: 'text_fail' }
        }

        const item = statusDic[row[column.property]]
        return <span class={item.className}>{item.text}</span>
      }
    },
    {
      label: '操作',
      width: 110,
      fixed: 'right',
      formatter: (row, column) => {
        const h = this.$createElement
        return row.status === 2 ? (
          <el-button type="primary" size="small" onClick={() => this.downloadReport(row)}>
            下载
          </el-button>
        ) : null
      }
    }
  ]

  isLoading: boolean = false

  /** 一级筛选条件 */
  module: any[] = []
  /** 二级筛选条件的原始数据 */
  subModule: any[] = []

  /** 是否正在下载文件 */
  isDownloading: boolean = false

  timer: any = null

  get availableSubModules(): any[] {
    return this.subModule.filter(sub => String(sub.pid) === this.form.menu)
  }

  created() {
    this.resetFilter()
  }

  mounted() {
    this.availableExportModule()
    this.requestTable()
    this.rollPolling()
  }

  beforeDestroy() {
    !!this.timer && window.clearInterval(this.timer)
  }

  /** 重置筛选条件 */
  resetFilter() {
    this.form = this.$deepCopy(this.formSchema)
  }

  /** 查询按钮回调 */
  onQueryClick() {
    this.requestTable()
  }

  /**
   * 请求列表数据
   */
  requestTable() {
    let params = { ...this.genParams(), page: this.page, page_size: this.size }
    this.isLoading = true

    api
      .exportHistory(params)
      .then(res => {
        this.isLoading = false
        if (res.code === 0 && res.data) {
          const list = res.data.list || []
          const { pagination } = res.data

          this.size = pagination.size
          this.total = pagination.total
          this.page = pagination.page
          this.tableData = list
        } else {
          this.tableData = []
          this.total = 0
          this.$message.success(res.msg)
        }
      })
      .catch(_ => (this.isLoading = false))
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

  /** 下载报表 */
  downloadReport(row) {
    if (this.isDownloading) return

    this.isDownloading = true
    http
      .download(row.file_path)
      .then(blob => {
        const a = document.createElement('a')
        const url = window.URL.createObjectURL(blob)
        const filename = row.filename
        a.href = url
        a.download = filename
        a.click()
        window.URL.revokeObjectURL(url)
        this.isDownloading = false
        this.backgroundExportingLog(row)
      })
      .catch(() => (this.isDownloading = false))
  }

  /** 获取可导出的模块 */
  availableExportModule() {
    api.availableExportModule().then(res => {
      if (res.code === 0 && res.data) {
        const { module, sub_module } = res.data
        this.module = module
        this.subModule = sub_module
      } else {
        this.$message.error(res.msg)
        this.module = this.subModule = []
      }
    })
  }

  onModuleChange(val) {
    this.form.subMenu = ''
  }

  genParams() {
    const { menu, subMenu } = this.form
    let params: any = {
      module: menu,
      sub_module: subMenu
    }
    params = pickBy(params, val => val !== '')

    return params
  }

  /** 该接口用于生成关于下载操作的后台日志 */
  backgroundExportingLog(row) {
    api.backgroundExportingLog({ id: row.id })
  }

  /** 轮询列表，更新状态 */
  rollPolling() {
    if (this.timer) {
      window.clearInterval(this.timer)
    }

    this.timer = window.setInterval(() => {
      this.requestTable()
    }, 30000)
  }
}
</script>