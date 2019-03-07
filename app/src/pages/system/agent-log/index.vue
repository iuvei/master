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
export default class TotalLog extends Vue {
  /** 筛选框 */
  filterForm = {
    hall_id: '', //厅主名称
    agent_type: '', //1:代理账号，0：股东账号
    agent_name: '', //代理账号
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
  /** 筛选框 操作类型 */
  resultOptionsArr: OptionsStatus[] = []

  agentTypeArr: OptionsStatus[] = []
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
          prop: 'agent_type',
          type: 'select',
          options: this.agentTypeArr,
          width: '120px'
        },
        {
          prop: 'agent_name',
          placeholder: '请输入账号',
          type: 'input',
          class: 'no-margin-left'
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
            this.$set(this.filterForm, 'agent_type', this.agentTypeArr[0].value)
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
        prop: 'agent_name',
        align: 'center',
        label: '代理账号',
        minWidth: '100',
        type: 'text'
      },
      {
        prop: 'domain',
        align: 'center',
        label: '登录域名',
        minWidth: '100',
        type: 'text'
      },
      {
        prop: 'type_name',
        align: 'center',
        label: '操作类型',
        width: '80',
        type: 'text'
      },
      {
        prop: 'remark',
        align: 'center',
        label: '操作详细',
        minWidth: '80',
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
        width: '80',
        type: 'text'
      }
    ]
  }

  /** 生命周期 */
  mounted() {
    this.domainHallNameList()
    this.requestSelectList()
  }
  /** 方法 */
  // 请求列表
  requestTable() {
    const { hall_id, agent_type, agent_name, ip, type, status, date } = this.filterForm
    const { size, page } = this.paginationObj
    this.isLoading = true
    api
      .logAgent({
        page,
        page_size: size,
        date_begin: date&&date[0] || '',
        date_end: date&&date[1] || '',
        hall_id,
        agent_type,
        agent_name,
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
        }
        this.$set(
          this.tableHead[2],
          'label',
          this.filterForm.agent_type == this.agentTypeArr[0].value ? this.agentTypeArr[0].label : this.agentTypeArr[1].label
        )
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
    api
      .logSelectList({ type: 4 })
      .then((res: any) => {
        const { code, data } = res
        if (code === 0) {
          const { type, status, agent_type } = data
          this.resultOptionsArr = [this.all, ...status]
          this.agentTypeArr = agent_type
          this.operateOptionsArr = [this.all, ...type]
          this.$set(this.filterForm, 'agent_type', agent_type[0].value)
        }
        this.requestTable()
      })
      .catch(err => {
        this.requestTable()
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

<style>
.nwwest-roll {
  height: 30px;
  overflow: hidden;
}

.roll-ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nwwest-roll li {
  height: 35px;
  line-height: 35px;
}

.anim {
  transition: all 0.02s;
}
</style>
