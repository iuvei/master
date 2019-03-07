<template lang="pug" src="./index.pug"></template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import api from '@/api'
import FormCommon from './../components/form-common/index.vue'
import TableCommon from './../components/table-common/index.vue'
import DetailDialog from './../components/detail-dialog/index.vue'

@Component({
  components: {
    FormCommon,
    TableCommon,
    DetailDialog
  }
})
export default class MasterLog extends Vue {
  /** 筛选框 */
  filterForm = {
    operator_name: '', //操作账号
    target_name: '', //被操作账号
    log_ip: '', //操作IP
    module_id: '', //模块名称
    menu_id: '', //子模块
    item_id: '', //操作类型
    status: '', //结果
    date: [] //日期
  }

  /** 全部的默认值*/
  all: OptionsStatus = {
    label: '全部',
    value: ''
  }
  /** 筛选框 操作类型 */
  resultOptionsArr: OptionsStatus[] = []
  /** 模块名称的数组 */
  moduleArr: any = []
  allObj = {
    label: '全部',
    value: '',
    menulist: []
  }
  /** 子模块的数组 */
  get menuArr(): any {
    this.$set(this.filterForm, 'menu_id', '')
    this.$set(this.filterForm, 'item_id', '')
    const tempModule: any = this.moduleArr.find((obj: any) => this.filterForm.module_id == obj.value)
    return (tempModule && [this.allObj, ...tempModule.menulist]) || [this.allObj]
  }
  /** 操作类型的数组 */
  get itemArr() {
    this.$set(this.filterForm, 'item_id', '')
    const tempItem: any = this.menuArr && this.menuArr.find((obj: any) => this.filterForm.menu_id == obj.value)
    let { chidlist } = tempItem
    return chidlist && chidlist.length > 0 ? [{ label: '全部', value: '' }, ...chidlist] : [{ label: '全部', value: '' }]
  }
  /** 筛选框的配置表达配置项 */
  get filterItem() {
    return {
      formItems: [
        {
          label: '操作账号',
          prop: 'operator_name',
          placeholder: '请输入操作账号',
          type: 'input'
        },
        {
          label: '被操作账号',
          prop: 'target_name',
          placeholder: '请输入被操作账号',
          type: 'input'
        },
        {
          label: '操作IP',
          prop: 'log_ip',
          placeholder: '请输入操作IP',
          type: 'input'
        },
        {
          label: '模块名称',
          prop: 'module_id',
          placeholder: '请选择模块名称',
          type: 'select',
          options: this.moduleArr
        },
        {
          label: '子模块',
          prop: 'menu_id',
          placeholder: '请选择子模块',
          type: 'select',
          options: this.menuArr
        },
        {
          label: '操作类型',
          prop: 'item_id',
          placeholder: '请选择操作类型',
          type: 'select',
          options: this.itemArr
        },
        {
          label: '操作结果',
          prop: 'status',
          placeholder: '请选择结果',
          type: 'select',
          options: this.resultOptionsArr
        },
        {
          label: '日期',
          prop: 'date',
          type: 'date',
          default: [0,0]
        }
      ],
      btns: [
        {
          type: 'primary',
          event: form => {
            this.paginationObj.size = 20
            this.paginationObj.page = 1
            this.requestTable()
          },
          label: '查询',
          isShow: true
        },
        {
          type: '',
          way: 'reset',
          event: form => {
            this.paginationObj.size = 20
            this.paginationObj.page = 1

            this.requestTable()
          },
          label: '重置',
          isShow: true
        }
      ]
    }
  }

  /** isLoading */
  isLoading: boolean = true

  /** 分页控制器的问题 */
  paginationObj: PaginationState = {
    page: 1,
    sizes: [20, 50, 100, 200],
    size: 20,
    total: 0
  }

  /** 表格的数据源 */
  tableData: any = []

  /** 详情弹框配置 */
  dialogConfig = {
    title: '',
    show: false,
    type: 1,
    content: {}
  }

  // fourcheckbox的配置
  roleDialog: any = {
    role: '',
    auth: null
  }

  /** 表格的配置项 */
  get tableHead() {
    return [
      {
        prop: 'id',
        align: 'center',
        label: '记录编号',
        minWidth: '80',
        type: 'text'
      },
      {
        prop: 'operator_name',
        align: 'center',
        label: '操作账号',
        minWidth: '100',
        type: 'text'
      },
      {
        prop: 'target_name',
        align: 'center',
        label: '被操作账号',
        minWidth: '100',
        type: 'text'
      },
      {
        prop: 'module_name',
        align: 'center',
        label: '模块名称',
        minWidth: '80',
        type: 'text'
      },
      {
        prop: 'menu_neme',
        align: 'center',
        label: '子模块',
        minWidth: '80',
        type: 'text'
      },
      {
        prop: 'item_neme',
        align: 'center',
        label: '操作类型',
        minWidth: '100',
        type: 'text'
      },
      {
        prop: 'remark',
        align: 'center',
        label: '操作详细信息',
        minWidth: '200',
        type: 'text-button',
        btnProp: 'log_type',
        btnValueShow: 1,
        btnValueShow2: 2,
        clickFun: (obj, index?: number) => {
          // 角色管理
          // index为1时是修改前
          // index为2时是修改后
          const { id, item_id } = obj
          api
            .logMasterInfo({ master_id: id, item_id })
            .then((res: any) => {
              const { code, data } = res
              if (code === 0) {
                const { title, list, type, old } = data
                this.$set(this.dialogConfig, 'title', title)
                this.$set(this.dialogConfig, 'show', true)
                this.$set(this.dialogConfig, 'type', type)

                // type为4：是显示权限管理的内容的弹框
                if (type === 4) {
                  let tempRole = ''
                  let tempAuth = null
                  // 修改前
                  if (index === 1) {
                    const { role, auth } = old
                    tempRole = role
                    tempAuth = auth
                  } else if (index === 2) {
                    // 修改后
                    const { role, auth } = data.new
                    tempRole = role
                    tempAuth = auth
                  } else {
                    // 新增
                    const { role, auth } = data.new || list
                    tempRole = role
                    tempAuth = auth
                  }
                  this.$set(this.roleDialog, 'role', tempRole)
                  this.$set(this.roleDialog, 'auth', tempAuth)
                } else {
                  this.$set(this.dialogConfig, 'content', type === 3 ? { after: data.new, before: old } : list)
                }
              }
            })
            .catch(error => {})
        }
      },
      {
        prop: 'log_ip',
        align: 'center',
        label: '操作IP',
        minWidth: '80',
        type: 'text'
      },
      {
        prop: 'created_at',
        align: 'center',
        label: '操作时间',
        minWidth: '120',
        type: 'text'
      },
      {
        prop: 'status_name',
        align: 'center',
        label: '操作结果',
        minWidth: '60',
        type: 'text'
      }
    ]
  }

  /** 生命周期 */
  mounted() {
    this.requestSelect()
    this.requestSelectList()
    this.requestTable()
  }
  /** 方法 */
  requestTable() {
    const { operator_name, target_name, log_ip, module_id, menu_id, item_id, status, date } = this.filterForm
    const { size, page } = this.paginationObj

    this.isLoading = true
    api
      .logMaster({
        page,
        page_size: size,
        date_begin: date&&date[0] || '',
        date_end: date&&date[1] || '',
        operator_name,
        target_name,
        log_ip,
        module_id,
        menu_id,
        item_id,
        status
      })
      .then((res: any) => {
        const { code, data } = res
        if (code === 0) {
          const { list, pagination } = data
          this.tableData = list || []
          this.paginationObj.total = pagination.total
        } else {
          this.tableData = []
          this.paginationObj.total = 0
        }
        this.isLoading = false
      })
      .catch(err => {})
  }

  // 三级联动接口
  requestSelect() {
    // 1为厅主日志，2总后台日志
    api.logSelect({ type: 2 }).then((res: any) => {
      const { code, data } = res
      if (code === 0) {
        this.moduleArr = [this.allObj, ...data]
      }
    })
  }

  // 下拉框
  requestSelectList() {
    // 1厅主2总后台3会员4代理
    api.logSelectList({ type: 2 }).then((res: any) => {
      const { code, data } = res
      if (code === 0) {
        this.resultOptionsArr = [this.all, ...data.status]
      }
    })
  }
  // 分页控制器
  changeSizeAndPage(obj) {
    this.paginationObj = { ...this.paginationObj, ...obj }
    this.requestTable()
  }
}

interface OptionsStatus {
  label: string
  value: string
}
interface PaginationState {
  page: number
  sizes: number[]
  size: number
  total: number
}
</script>