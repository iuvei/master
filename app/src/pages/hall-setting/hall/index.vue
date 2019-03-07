<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="tsx">
import { Vue, Component } from 'vue-property-decorator'
import { Form } from 'element-ui'
import api from '@/api'
import _ from 'lodash'

@Component
export default class Pay extends Vue {
  form = {
    company_name: '',
    hall_type: '',
    status: ''
  }

  formTime = {
    start_time: ''
  }

  formMtoken = {
    username: '',
    opt_status: 0,
    opt_account: '',
    opt_password: ''
  }

  formStatus = {
    status: 0
  }

  formAccount = {
    username: '',
    new: '',
    new2: ''
  }

  rulesTime = {
    start_time: [
      {
        required: true,
        trigger: 'blur',
        message: '请选择日期时间'
      }
    ]
  }

  rulesMtoken = {
    opt_account: [
      {
        required: true,
        trigger: 'blur',
        message: '请输入M令牌账号'
      }
    ],
    opt_password: [
      {
        required: true,
        trigger: 'blur',
        message: '请输入M令牌密码'
      }
    ]
  }

  rulesAccount = {
    new: [
      {
        required: true,
        trigger: 'blur',
        message: '请输入新密码'
      },
      {
        min: 6,
        max: 16,
        message: '长度在 6 到 16 个字符',
        trigger: 'blur'
      }
    ],
    new2: [
      {
        required: true,
        trigger: 'blur',
        validator: this.validatePassword2
      },
      {
        min: 6,
        max: 16,
        message: '长度在 6 到 16 个字符',
        trigger: 'blur'
      }
    ]
  }

  $refs!: {
    formTime: Form
    formMtoken: Form
    formAccount: Form
  }

  games = []

  checkAllGame: boolean = false
  isGameIndeterminate: boolean = false

  sizes: number[] = [20, 50, 100, 200]
  page: number = 1
  size: number = 20
  total: number = 0

  isLoading: boolean = false
  isSaveLoading: boolean = false
  isDialogVisible: boolean = false

  /** 对话框类型，0 : 游戏开关 | 1 : M令牌设置 | 2 : 基础设置 */
  dialogType: number = 0

  /** 对话框标题 */
  dialogTitle: string = ''

  /** 当前选中的一行数据的 ID */
  currentItemID: string = ''

  dialogSettingTab = 'status'

  optionTypes = [
    {
      label: '全部',
      value: ''
    },
    {
      label: '现金',
      value: '0'
    },
    {
      label: '信用',
      value: '1'
    }
  ]

  optionMStatus = [
    {
      label: '已开启',
      value: '1'
    },
    {
      label: '未开启',
      value: '0'
    }
  ]

  optionStatus = [
    {
      label: '全部',
      value: ''
    },
    {
      label: '正常',
      value: '1'
    },
    {
      label: '关闭',
      value: '0'
    }
  ]

  tableHead = [
    {
      label: 'ID',
      prop: 'id',
      width: '80'
    },
    {
      label: '客户账号',
      prop: 'username',
      minWidth: '140'
    },
    {
      label: '客户名称',
      prop: 'company_name',
      minWidth: '140'
    },
    {
      label: '客户类型',
      prop: 'hall_type',
      width: '150',
      formatter: (row, column, value: number, index): string => {
        let t = _.find(this.optionTypes, { value: value.toString() })
        return t ? t.label : value.toString()
      }
    },
    {
      label: '额度',
      prop: 'base_fee',
      width: '150',
      formatter: (row, column, value: number, index): string => {
        return row.hall_type === 0 ? '--' : value.toString()
      }
    },
    {
      label: '会员数',
      prop: 'user_count',
      width: '100',
      renderHeader: (h, { column, $index }) => {
        return (
          <div>
            <span>会员数</span>
            <el-tooltip placement="top">
              <div slot="content" style="line-height: 18px;">
                会员为该厅主后台所有用户
                <br />
                因为代理也是会员，所以此会员数包括该厅所有代理
              </div>
              <i class="el-icon-question question" />
            </el-tooltip>
          </div>
        )
      }
    },
    {
      label: '开厅时间',
      prop: 'created',
      width: '150'
    },
    {
      label: '正式运营时间',
      prop: 'start_time',
      width: '150'
    },
    {
      label: 'M令牌',
      prop: 'opt_status',
      width: '150',
      formatter: (row, column, value: number, index): string => {
        let t = _.find(this.optionMStatus, { value: value.toString() })
        return t ? t.label : value.toString()
      }
    },
    {
      label: '状态',
      prop: 'status',
      width: '150',
      formatter: (row, column, value: number, index): string => {
        let t = _.find(this.optionStatus, { value: value.toString() })
        return t ? t.label : value.toString()
      },
      renderHeader: (h, { column, $index }) => {
        return (
          <div>
            <span>状态</span>
            <el-tooltip placement="top">
              <div slot="content" style="line-height: 18px;">
                厅状态包括三种：正常、冻结、关闭
                <br />
                正常：该厅的前端和后台都可正常使用
                <br />
                冻结：即该厅的前端和后台是否可进入，可在"操作-基础设置"中设置
                <br />
                关闭：即该厅前后端页面打开为维护页
              </div>
              <i class="el-icon-question question" />
            </el-tooltip>
          </div>
        )
      }
    }
  ]

  tableData = []

  mounted() {
    this.requestTable()
  }

  requestTable() {
    this.isLoading = true

    let params = {
      page: this.page,
      page_size: this.size
    }

    params = _.assign(params, this.form)

    api
      .hallList(params)
      .then((response: any) => {
        this.isLoading = false

        if (response.code === 0) {
          this.size = response.attributes.size
          this.page = response.attributes.page
          this.total = response.attributes.total
          this.tableData = response.data
        } else {
          this.total = 0
          this.tableData = []
        }
      })
      .catch(error => {
        this.isLoading = false
      })
  }

  requestGames() {
    let params = {
      tid: this.currentItemID
    }

    api
      .hallGames(params)
      .then((response: any) => {
        if (response.code === 0) {
          this.games = response.data
          this.onGameCheckChange()
        } else {
          this.$message.error(response.msg)
        }
      })
      .catch(error => {
        this.$message.error('获取游戏列表失败 ！')
      })
  }

  requestMtoken() {
    let params = {
      tid: this.currentItemID
    }

    api
      .mtoken(params)
      .then((response: any) => {
        if (response.code === 0) {
          _.assign(this.formMtoken, response.data)
        } else {
          this.$message.error(response.msg)
        }
      })
      .catch(error => {
        this.$message.error('获取M令牌设置失败 ！')
      })
  }

  requestEditStartTime() {
    let params = {
      tid: this.currentItemID,
      ...this.formTime
    }

    api
      .editHallStartTime(params)
      .then((response: any) => {
        if (response.code === 0) {
          this.isDialogVisible = false
          this.$message.success('设置正式运营时间成功 ！')
          this.requestTable()
        } else {
          this.$message.error('设置正式运营时间失败 ！')
        }
      })
      .catch(error => {
        this.$message.error('设置正式运营时间失败 ！')
      })
  }

  requestEditGames() {
    this.isSaveLoading = true

    let params = {
      tid: this.currentItemID,
      list: this.games
    }

    api
      .editHallGames(params)
      .then((response: any) => {
        this.isSaveLoading = false

        if (response.code === 0) {
          this.isDialogVisible = false
          this.$message.success('设置游戏开关成功 ！')
          this.requestTable()
        } else {
          this.$message.error('设置游戏开关失败 ！')
        }
      })
      .catch(error => {
        this.isSaveLoading = false
        this.$message.error('设置游戏开关失败 ！')
      })
  }

  requestEditMtoken() {
    this.isSaveLoading = true

    let params = {
      tid: this.currentItemID,
      ...this.formMtoken
    }

    api
      .editMtoken(params)
      .then((response: any) => {
        this.isSaveLoading = false

        if (response.code === 0) {
          this.isDialogVisible = false
          this.$message.success('修改M令牌设置成功 ！')
          this.requestTable()
        } else {
          this.$message.error('修改M令牌设置失败 ！')
        }
      })
      .catch(error => {
        this.isSaveLoading = false
        this.$message.error('修改M令牌设置失败 ！')
      })
  }

  requestChangeStatus() {
    this.isSaveLoading = true

    let params = {
      tid: this.currentItemID,
      ...this.formStatus
    }

    api
      .changeHallStatus(params)
      .then((response: any) => {
        this.isSaveLoading = false

        if (response.code === 0) {
          this.isDialogVisible = false
          this.$message.success('厅主状态调整成功 ！')
          this.requestTable()
        } else {
          this.$message.error('厅主状态调整失败 ！')
        }
      })
      .catch(error => {
        this.isSaveLoading = false
        this.$message.error('厅主状态调整失败 ！')
      })
  }

  requestEditPassword() {
    this.isSaveLoading = true

    let params = {
      tid: this.currentItemID,
      ...this.formAccount
    }

    api
      .editHallPassword(params)
      .then((response: any) => {
        this.isSaveLoading = false

        if (response.code === 0) {
          this.isDialogVisible = false
          this.$message.success('修改厅主密码成功 ！')
          this.requestTable()
        } else {
          this.$message.error('修改厅主密码失败 ！')
        }
      })
      .catch(error => {
        this.isSaveLoading = false
        this.$message.error('修改厅主密码失败 ！')
      })
  }

  onQueryClick() {
    this.requestTable()
  }

  onResetClick() {
    this.form = {
      company_name: '',
      hall_type: '',
      status: ''
    }
    this.page = 1
    this.requestTable()
  }

  onEditStartTimeClick(row: any) {
    this.$refs.formTime && this.$refs.formTime.clearValidate()
    this.currentItemID = row.id
    this.dialogType = 0
    this.dialogTitle = '编辑正式运营时间'
    this.isDialogVisible = true
  }

  onGameClick(row: any) {
    this.currentItemID = row.id
    this.dialogType = 1
    this.dialogTitle = '游戏开关'
    this.isDialogVisible = true
    this.requestGames()
  }

  onMAuthClick(row: any) {
    this.$refs.formMtoken && this.$refs.formMtoken.clearValidate()
    this.currentItemID = row.id
    this.formMtoken.username = row.username
    this.formMtoken.opt_status = row.opt_status
    this.dialogType = 2
    this.dialogTitle = 'M令牌设置'
    this.isDialogVisible = true
    this.requestMtoken()
  }

  onSettingClick(row: any) {
    this.$refs.formAccount && this.$refs.formAccount.clearValidate()
    this.currentItemID = row.id
    this.formStatus.status = row.status
    this.formAccount.username = row.username
    this.formAccount.new = ''
    this.formAccount.new2 = ''
    this.dialogType = 3
    this.dialogTitle = '基础设置'
    this.isDialogVisible = true
  }

  onGotoClick(row: any) {
    this.$message.warning('功能开发中，请等待开放 ！')
  }

  onDialogSaveClick() {
    switch (this.dialogType) {
      case 0:
        this.$refs.formTime.validate(valid => {
          if (valid) this.requestEditStartTime()
        })
        break
      case 1:
        this.requestEditGames()
        break
      case 2:
        this.$refs.formMtoken.validate(valid => {
          if (valid) this.requestEditMtoken()
        })
        break
      case 3:
        if (this.dialogSettingTab === 'status') this.requestChangeStatus()
        else {
          this.$refs.formAccount.validate(valid => {
            if (valid) this.requestEditPassword()
          })
        }
        break
    }
  }

  onAllGameCheckChange(isCheckAll) {
    _.forEach(this.games, (v: any) => {
      v.status = isCheckAll ? 1 : 0
    })
    this.isGameIndeterminate = false
  }

  onGameCheckChange() {
    let count = _.filter(this.games, { status: 1 }).length
    if (count === this.games.length) {
      this.isGameIndeterminate = false
      this.checkAllGame = true
    } else if (count === 0) {
      this.isGameIndeterminate = false
      this.checkAllGame = false
    } else {
      this.isGameIndeterminate = true
      this.checkAllGame = false
    }
  }

  onPageSizeChange(size: number) {
    this.size = size
    this.requestTable()
  }

  onCurrentChange(page: number) {
    this.page = page
    this.requestTable()
  }

  /** 验证重复输入密码 */
  validatePassword2(rule, value, callback) {
    if (value === '') {
      callback(new Error('请重复输入新密码'))
    } else if (value !== this.formAccount.new) {
      callback(new Error('两次输入密码不一致!'))
    } else {
      callback()
    }
  }
}
</script>
