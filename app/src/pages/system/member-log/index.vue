<template lang="pug" src="./index.pug"></template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import api from '@/api'
import FormCommon from './../components/form-common/index.vue'
import TableCommon from './../components/table-common/index.vue'

@Component({
  components: {
    FormCommon,
    TableCommon
  }
})
export default class MemberLog extends Vue {
  /** 筛选框表单对象 */
  filterForm = {
    hall_id: '', //厅主名称
    device: '', //用户来源
    username: '', //会员账号
    ip: '', //操作IP
    type: '', //操作类型
    status: '', //结果
    date: [] //日期
  }
  /** 全部的默认值*/
  all: OptionsStatus = {
    label: '全部',
    value: ''
  }
  /** 筛选框 操作类型 */
  operateOptionsArr: OptionsStatus[] = []

  /** 筛选框 结果 */
  resultOptionsArr: OptionsStatus[] = []

  /** 用户来源 结果 */
  deviceOptionsArr: OptionsStatus[] = []
  // 厅主名称列表
  hallList: any = []

  /** 筛选框的配置表达配置项 */
  get filterItem() {
    return {
      formItems: [
        {
          label: '厅主名称',
          prop: 'hall_id',
          placeholder: '请输入厅主名称',
          type: 'select',
          options: this.hallList,
          clearable: true,
          filterable: true,
          width: '215px'
        },
        {
          label: '用户来源',
          prop: 'device',
          placeholder: '请选择用户来源',
          type: 'select',
          options: this.deviceOptionsArr
        },
        {
          label: '会员账号',
          prop: 'username',
          placeholder: '请输入会员账号',
          type: 'input'
        },
        {
          label: '操作IP',
          prop: 'ip',
          placeholder: '请输入操作IP',
          type: 'input'
        },
        {
          label: '操作类型',
          prop: 'type',
          placeholder: '请选择操作类型',
          type: 'select',
          options: this.operateOptionsArr
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

  /** 表格的配置项 */
  get tableHead() {
    return [
      {
        prop: 'id',
        align: 'center',
        label: '记录编号',
        minWidth: '60',
        type: 'text'
      },
      {
        prop: 'hall_name',
        align: 'center',
        label: '厅主名称',
        minWidth: '80',
        type: 'text'
      },
      {
        prop: 'username',
        align: 'center',
        label: '会员账号',
        minWidth: '100',
        type: 'text'
      },
      {
        prop: 'device',
        align: 'center',
        label: '用户来源',
        minWidth: '80',
        type: 'text'
      },
      {
        prop: 'type_name',
        align: 'center',
        label: '操作类型',
        minWidth: '80',
        type: 'text'
      },
      {
        prop: 'remark',
        align: 'center',
        label: '操作详细',
        minWidth: '100',
        type: 'text'
      },
      {
        prop: 'ip',
        align: 'center',
        label: '操作IP',
        minWidth: '80',
        type: 'text'
      },
      {
        prop: 'created_at',
        align: 'center',
        label: '操作时间',
        minWidth: '100',
        type: 'text'
      },
      {
        prop: 'status_name',
        align: 'center',
        label: '操作结果',
        minWidth: '80',
        type: 'text'
      }
    ]
  }

  /** 生命周期 */
  mounted() {
    this.requestSelectList()
    this.domainHallNameList()
    this.requestTable()
  }
  /** 方法 */
  // 列表数据
  requestTable() {
    const { hall_id, device, username, ip, type, status, date } = this.filterForm
    const { size, page } = this.paginationObj
    this.isLoading = true
    api
      .logUser({
        page,
        page_size: size,
        date_begin: date&&date[0] || '',
        date_end: date&&date[1] || '',
        hall_id,
        device,
        username,
        ip,
        type,
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

  // 获取厅主名称的列表
  domainHallNameList() {
    api.domainHallNameList().then(res => {
      const { code, data } = res
      if (code === 0 && data && data.length) {
        const tempArr = data.map(item => ({ value: item.hall_id, label: item.hall_name }))
        this.hallList = [...tempArr]
      } else {
        this.hallList = []
      }
    })
  }

  // 下拉框
  requestSelectList() {
    // 1厅主2总后台3会员4代理
    api.logSelectList({ type: 3 }).then((res: any) => {
      const { code, data } = res
      if (code === 0) {
        const { type, status, device } = data
        this.resultOptionsArr = [this.all, ...status]
        this.operateOptionsArr = [this.all, ...type]
        this.deviceOptionsArr = [this.all, ...device]
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
