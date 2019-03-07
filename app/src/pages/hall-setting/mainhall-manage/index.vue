<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="tsx">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { Form } from 'element-ui'
import api from '@/api'
import config from '@/config'
import 'font-awesome/css/font-awesome.min.css'
import { namespace } from 'vuex-class'
import Games from './components/games/index.vue'
import Baseinfo from './components/baseinfo/index.vue'
import BaseSetting from './components/base-setting/index.vue'

const USER = namespace('user')
interface UBD {
  [key: string]: boolean
}

@Component({
  components: {
    Games,
    Baseinfo,
    BaseSetting
  }
})
export default class hallManage extends Vue {
  @USER.State btnAuth
  /**
   * 需要授权的按钮
   * google: 编辑谷歌开关
   * game: 编辑游戏开关
   * data: 编辑资料
   * status: 编辑厅状态
   * free: 费用设置
   * nav: 导航栏设置
   */
  authorizedButtons: { [key: string]: number } = { google: 4, game: 5, data: 6, status: 7, free: 8, nav: 9 }
  // 按钮权限集合
  unauthorizedBtnDic: UBD = { google: false, game: false, data: false, status: false, free: false, nav: false }

  $refs!: {
    filterFormRef
    dialogForm
    games
    baseinfo
    baseSetting
  }

  /**[状态可选项] */
  statusAll: any[] = [{ label: '正常', value: 1 }, { label: '冻结', value: 2 }, { label: '停用', value: 0 }]

  /**[厅主名称] 可选项 */
  hallNameList: any[] = []

  /**[厅主帐号] */
  usernameAll = [{ label: '全部', value: '' }, { label: '正常', value: 1 }]

  /**[可选] 绑定谷歌账号 */
  googleStatus = [{ label: '已绑定', value: true, message: 'success' }, { label: '未绑定', value: false, message: 'error' }]
  isLoading: boolean = false
  /**[筛选] 表单 */
  filterForm: any = {
    hall_id: '',
    status: ''
  }
  nowHall: any = ''
  nowRow: any = {}
  /**  运营时间及费用设置弹框表单 */

  dialogForm: any = {
    start_time: '',
    company_name: '',
    fee_monthly_amount: '',
    type: '1'
  }
  /** 包底费校验规则 */
  rules = [{ required: true, message: '请输入包底值', trigger: ['blur', 'change'] }, { validator: this.validatorNumber, trigger: ['blur', 'change'] }]

  tableHead = [
    { label: 'ID', prop: 'id', width: '80' },
    { label: '厅主名称', prop: 'company_name', width: '200' },
    {
      label: '代理数/会员数',
      prop: '',
      width: '200',
      formatter: (row, column, val) => {
        return row['agent_count'] + '/' + row['user_count']
      }
    },
    { label: '开厅时间', prop: 'created_at', width: '180' },
    {
      label: '正式运营时间',
      prop: 'start_time',
      width: '180',
      formatter: (row, column, val) => {
        let s = '编辑'
        if (val) s = val
        const h = this.$createElement
        return (
          <el-button type="text" onClick={() => this.editTime(row)}>
            {s}
          </el-button>
        )
      }
    },
    {
      label: '状态',
      prop: 'status',
      width: '120',
      formatter: (row, column, val) => {
        const h = this.$createElement
        const item: any = this.statusAll.find(i => i.value == val)
        return <span style={{ color: val === 1 ? 'green' : 'red' }}>{item ? item.label : ''}</span>
      }
    },
    {
      label: '谷歌验证开关',
      prop: 'is_use_googlekey',
      width: '160',
      formatter: (row, column, val) => {
        const h = this.$createElement
        return (
          <el-switch
            value={row[column.property]}
            active-value={1}
            inactive-value={0}
            onChange={val => {
              this.googleChange(val, row, column.property)
            }}
          />
        )
      }
    },
    {
      label: '进入后台',
      prop: 'enter_back',
      width: '160',
      formatter: (row, column, val) => {
        const h = this.$createElement
        return <span class="fa fa-share-square-o fa-lg" onClick={() => this.enterBack(row)} />
      }
    }
  ]
  /**[表格] 数据 */
  tableData: object[] = []
  sizes: number[] = [20, 50, 100, 200]
  page: number = 1
  size: number = 20
  total: number = 0

  /**[弹框类型]*/
  dialogType: string = ''
  dialogTitle: string = ''
  dialogVisible: boolean = false
  mounted() {
    // 获取子页面按钮的权限
    this.$unauthorizedBtns(this.btnAuth, this.$route.path, this.authorizedButtons).then(data => (this.unauthorizedBtnDic = data))
    this.requestGetUsernameList()
    this.$nextTick(() => {
      const { hall_name, hall_id } = this.$route.query
      if (hall_id && hall_name) {
        this.filterForm.hall_id = Number(hall_id)
      }
      this.requestTable()
    })
  }
  /**[重置] 筛选 */
  onResetFilter() {
    this.filterForm = {
      hall_id: '',
      status: ''
    }
    this.size = 20
    this.requestTable()
  }
  /** 运营时间点击事件 */
  editTime(row: any) {
    this.nowHall = row.id
    this.dialogType = 'time'
    this.dialogTitle = '运营时间'
    this.dialogForm.start_time = row.start_time
    this.dialogVisible = true
  }
  /** 游戏授权点击 */
  editGames(row: any) {
    this.nowHall = row.id
    this.$nextTick(() => this.$refs.games.requestGameOffList())
  }
  /** 资料点击 */
  editInfo(row: any) {
    this.nowHall = row.id
    this.$nextTick(() => this.$refs.baseinfo.requestInformationList())
  }
  /** 基础设置点击 */
  editBase(row: any) {
    this.nowRow = row
    this.$nextTick(() => this.$refs.baseSetting.show())
  }
  /** 费用设置点击事件 */
  editMoney(row: any) {
    this.nowHall = row.id
    this.dialogType = 'money'
    this.dialogTitle = '费用设置'
    this.dialogForm.company_name = row.company_name
    this.requestGetConst({ hall_id: row.id })
    this.dialogVisible = true
  }
  /**[get] 费用设置 */
  requestGetConst(params) {
    api.getBaseCost(params).then((res: any) => {
      if (res.code === 0) {
        this.$set(this.dialogForm, 'fee_monthly_amount', res.data || '')
      } else {
        this.$message.error(res.msg)
      }
    })
  }
  /**[set] 费用设置 */
  requestCost() {
    let params = {
      hall_id: this.nowHall,
      fee_monthly_amount: this.dialogForm.fee_monthly_amount
    }
    api.setBaseCost(params).then((res: any) => {
      if (res.code === 0) {
        this.$message.success('保存成功！')
        this.dialogVisible = false
        this.requestTable()
      } else {
        this.$message.error(res.msg)
      }
    })
  }
  /**[click] 导航设置 */
  setMenu(row) {
    this.$router.push({
      path: '/navigation',
      query: {
        hall_id: row.id,
        company_name: row.company_name
      }
    })
  }
  /** 进入后台 */
  enterBack(row) {
    let domain = window.location.protocol + '//' + config.getAdminPrefix + row['domain']
    window.open(domain)
  }
  /**[获取] 表格数据 */
  requestTable() {
    this.isLoading = true
    let params = {
      page: this.page,
      page_size: this.size
    }
    params = Object.assign(params, this.filterForm)
    api
      .getMainhallList(params)
      .then((res: any) => {
        this.isLoading = false
        if (res.code === 0 && res.data.list) {
          this.tableData = res.data.list
          this.size = res.data.pagination.size
          this.page = res.data.pagination.page
          this.total = res.data.pagination.total
        } else {
          this.$message.error(res.msg)
          this.tableData = []
        }
      })
      .catch(error => {
        this.isLoading = false
      })
  }

  /**[get] 厅主帐号列表 */
  requestGetUsernameList() {
    api.getUsernameList().then((res: any) => {
      if (res.code === 0) {
        let arr: any[] = []
        let data = res.data
        data &&
          data.map((v: any) => {
            arr.push({
              name: v.hall_name,
              value: v.hall_name,
              id: v.hall_id
            })
          })
        this.hallNameList = arr
      } else {
        this.$message.error(res.msg)
      }
    })
  }
  /**[表格] google验证 */
  googleChange(newVal, row, prop) {
    /**
     * @val
     *    1: 开启
     *    0：关闭
     */
    const oldVal = newVal ? 0 : 1
    if (!this.unauthorizedBtnDic.google) {
      row[prop] = oldVal
      this.$alert('您没有此权限！')
      return false
    }
    const message = newVal ? '开启' : '关闭'
    this.$confirm(`确认${message}？`, '提示', {
      type: 'warning'
    })
      .then(() => {
        this.requestEditGoogle({
          hall_id: row.id,
          status: newVal
        })
      })
      .catch(() => {
        row[prop] = oldVal
      })
  }
  /**[修改] google验证 */
  requestEditGoogle(params) {
    api.editGoogleValid(params).then((res: any) => {
      if (res.code === 0) {
        this.$message.success('保存成功！')
        this.requestTable()
      } else {
        this.$message.error(res.msg)
      }
    })
  }
  submit() {
    switch (this.dialogType) {
      // 运营时间
      case 'time':
        if (!this.dialogForm.start_time) {
          this.$message.error('请设置运营时间')
          return
        } else {
          let params = {
            hall_id: this.nowHall,
            start_time: this.dialogForm.start_time.format('yyyy-MM-dd hh:mm:ss')
          }
          this.requestEditTime(params)
        }
        break
      // 费用设置
      case 'money':
        let form: any = this.$refs.dialogForm
        form.validate(valid => {
          if (valid) {
            this.requestCost()
          } else {
            return false
          }
        })
        break
    }
  }
  /**[修改] 时间 */
  requestEditTime(params) {
    api.editMainhallTime(params).then((res: any) => {
      if (res.code === 0) {
        this.$message.success('设置正式运营时间成功！')
        this.dialogVisible = false
        this.requestTable()
      } else {
        this.$message.error(res.msg)
      }
    })
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
  /** 数字验证 */
  validatorNumber(rule, value, callback) {
    if (!/^([0-9]|-)+(.[0-9]{1,2})?$/.test(value)) {
      callback(new Error('请输入>=0的数，最多两位小数'))
    } else {
      if (value < 0) {
        callback(new Error('不能小于0'))
      } else if (value > 999999999) {
        callback(new Error('不能大于999999999'))
      } else {
        callback()
      }
    }
  }
}
</script>
