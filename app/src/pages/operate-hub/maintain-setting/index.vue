<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="tsx">
import { Vue, Component } from 'vue-property-decorator'
import api from '@/api'
import { Form, Table } from 'element-ui'
import { I_FiltersObject } from './types'
import pickBy from 'lodash/pickBy'
import assign from 'lodash/assign'
import DateTimePicker from '@/components/datetime-picker/index.vue'
import { namespace, State } from 'vuex-class'
const USER = namespace('user')

@Component({
  components: { DateTimePicker }
})
export default class MaintainSetting extends Vue {
  // ---------------------   Props   --------------------------
  @State timeZone
  @USER.State btnAuth
  // ---------------------   DATA   --------------------------

  /**
   * 需要授权的按钮
   * maintain: 编辑维护开关
   */
  readonly authorizedButtons = { maintain: 10 }

  // 按钮权限集合
  unauthorizedBtnDic: any = {}

  /** 查询条件初始数据 */
  filterFormSchema = { hall_id: '' }

  /**[筛选] 表单 */
  filterForm: any = {}

  /**[厅主帐号可选项] */
  usernameAll: I_FiltersObject[] = []

  /**分页相关数据 */
  sizes: number[] = [20, 50, 100, 200]
  page: number = 1
  size: number = 20
  total: number = 0

  $refs!: {
    filterFormRef: Form
    multipleTable: Table
    maintainForm: Form
  }

  /** 表格数据 */
  tableData: any[] = []

  /** 表格是否正在加载 */
  isLoading: boolean = false

  /** 表格头部定义 */
  tableHead = [
    { label: '厅主名称', prop: 'company_name' },
    { label: '厅主帐号', prop: 'admin_name' },
    { label: '厅主域名', prop: 'domain' },
    {
      label: '维护起止时间',
      prop: '',
      formatter: (row, columns, val, index) => {
        const h = this.$createElement
        const start = row['start_time']
        const end = row['end_time']
        const result = start && end ? `${start} - ${end}` : '设置'
        return (
          <el-button type="text" size="small" onClick={() => this.editTime(row)}>
            {result}
          </el-button>
        )
      }
    },
    {
      label: '状态',
      prop: 'status',
      formatter: (row, columns, val, index) => {
        const h = this.$createElement
        const statusAll = [{ label: '开放中', value: 1, className: 'text_success' }, { label: '维护中', value: 3, className: 'text_fail' }]
        const item: any = statusAll.find(i => i.value == val)
        return item ? <span class={item.className}>{item.label}</span> : ''
      }
    }
  ]

  /** 控制显示维护起始时间对话框 */
  isMaintainTimeVisible: boolean = false
  maintainForm: any = { days: ['', ''], multipleSelection: [] }

  /** 是否允许显示批量操作区按钮 */
  isBundleOperationAllowed: boolean = false

  /** 是否处于二次确认撞他 */
  isInConfirmMode: boolean = false

  /** 表单校验规则 */
  rules = { days: [{ validator: this.validateDays }] }

  timer: any = null

  // ---------------------   LIFE CYCLE   --------------------------
  created() {
    this.resetFilter()
  }

  mounted() {
    this.$unauthorizedBtns(this.btnAuth, this.$route.path, this.authorizedButtons).then(data => {
      this.unauthorizedBtnDic = data
    })
    this.getUsernameList()
    this.requestTable()
    this.resetTimer()
  }

  beforeDestroy() {
    this.resetTimer(true)
  }

  // ---------------------   METHODS   --------------------------
  /** 重置筛选条件 */
  resetFilter() {
    this.filterForm = JSON.parse(JSON.stringify(this.filterFormSchema))
  }

  /** 获取厅主帐号 */
  getUsernameList() {
    api.getUsernameList().then((res: any) => {
      if (res.code === 0) {
        this.usernameAll = normalize(res.data || [])
      }
    })

    function normalize(data) {
      let arr: any = []
      for (let i in data) {
        arr.push({
          label: data[i].hall_name,
          value: data[i].hall_id
        })
      }
      return arr
    }
  }

  /** 查询按钮回调 */
  onQueryClick() {
    this.requestTable()
  }

  /** 请求表格数据 */
  requestTable(isResetBtn?: boolean) {
    this.isLoading = true
    let params = {
      page: isResetBtn ? 1 : this.page,
      page_size: this.size
    }

    // 去除非必要
    let filter = pickBy(this.filterForm, value => value > 0)
    params = assign(params, filter)

    api
      .getMaintainList(params)
      .then((res: any) => {
        this.isLoading = false
        if (res.code === 0 && res.data && res.data.list) {
          const list = res.data.list || []
          const { pagination } = res.data

          this.size = pagination.size
          this.total = pagination.total
          this.page = pagination.page

          this.tableData = list
        } else {
          this.tableData = []
          this.total = 0
          this.$message.error(res.msg)
        }
      })
      .catch(error => {
        this.isLoading = false
      })
  }

  /** 重置按钮回调 */
  onResetClick() {
    this.resetFilter()
    this.$refs.filterFormRef.clearValidate()
    this.requestTable(true)
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

  /**[设置时间] */
  editTime(row) {
    if (!this.unauthorizedBtnDic.maintain) {
      this.$alert('您没有此权限！')
      return
    }

    this.isBundleOperationAllowed = false
    this.$refs.multipleTable.clearSelection()

    this.maintainForm.days = [row.start_time || '', row.end_time || '']
    this.maintainForm.multipleSelection = [row]
    this.isMaintainTimeVisible = true
  }

  /** 生成维护起止时间参数，并发送数据 */
  updateMaintainTime() {
    const { days, multipleSelection } = this.maintainForm
    const params = {
      start_time: days[0],
      end_time: days[1],
      hall_id: multipleSelection.map(item => item.id)
    }

    api.editMaintainTime(params).then(res => {
      if (res.code === 0) {
        this.isMaintainTimeVisible = false
        this.$message.success('设置维护起止时间成功！')
        this.requestTable()
      } else {
        this.$message.error(res.msg)
      }
    })
  }

  /** 表格多选 */
  handleSelectionChange(val) {
    this.maintainForm.multipleSelection = val
    this.isBundleOperationAllowed = true
  }

  /** 维护时间保存 */
  onClickSave(name: string) {
    this.$refs[name].validate(valid => {
      if (valid) {
        this.isInConfirmMode = true
      } else {
        return false
      }
    })
  }

  /** 验证维护时间 */
  validateDays(rule, value, callback) {
    const [startTime, endTime] = value

    // 时间为空表示停止维护
    if (!startTime && !endTime) {
      callback()
      return
    }

    if (new Date(endTime).getTime() <= this.timeZone.value) {
      callback(new Error('结束时间需大于当前时间'))
    } else if (new Date(startTime).getTime() >= new Date(endTime).getTime()) {
      callback(new Error('开始时间需小于结束时间'))
    } else {
      callback()
    }
  }

  /** 重置对话框 */
  resetDialog() {
    this.isInConfirmMode = false
    this.$refs.maintainForm.clearValidate()
    this.maintainForm.days = ['', '']
  }

  /** 重置timer */
  resetTimer(isBeforeDestroy?: boolean) {
    !!this.timer && window.clearInterval(this.timer)
    if (isBeforeDestroy) return
    this.timer = window.setInterval(() => !this.isMaintainTimeVisible && this.requestTable(), 60000)
  }
}
</script>