<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { Form } from 'element-ui'
import api from '@/api'
import _ from 'lodash'
import { namespace } from 'vuex-class'

const USER = namespace('user')
interface UBD {
  [key: string]: boolean
}

@Component
export default class Pay extends Vue {
  @USER.State btnAuth
  /**
   * 需要授权的按钮
   * add: 新增管理员
   * edit: 修改
   */
  authorizedButtons: { [key: string]: number } = { add: 36, edit: 37 }
  // 按钮权限集合
  unauthorizedBtnDic: UBD = {}
  form = {
    name: '',
    id: '',
    status: ''
  }

  formAdd = {
    name: '',
    code: '',
    api_params: [
      {
        key: '',
        label: '',
        type: 'text'
      }
    ],
    description: '',
    status: 0
  }

  rulesAdd = {
    name: [
      {
        required: true,
        trigger: 'blur',
        message: '请输入渠道名称'
      }
    ],
    code: [
      {
        required: true,
        trigger: 'blur',
        message: '请输入支付 Code'
      }
    ],
    api_params: [
      {
        required: true,
        trigger: ['change', 'blur'],
        validator: this.validateConfigData
      }
    ],
    pay_scene_data: [
      {
        required: true,
        trigger: 'change',
        validator: this.validateBankData
      }
    ]
  }

  $refs!: {
    formAdd: Form
  }

  optionTypes = [
    {
      label: '文本框',
      value: 'text'
    },
    {
      label: '文本域',
      value: 'textarea'
    },
    {
      label: '密码框',
      value: 'password'
    }
  ]

  sizes: number[] = [20, 50, 100, 200]
  page: number = 1
  size: number = 20
  total: number = 0

  isLoading: boolean = false
  isSaveLoading: boolean = false
  isDialogVisible: boolean = false

  /** 对话框类型，0 : 新增 | 1 : 编辑 */
  dialogType: number = 0

  /** 对话框标题 */
  dialogTitle: string = ''

  /** 当前选中的一行数据的 ID */
  currentItemID: string = ''

  optionStatus = [
    {
      label: '全部',
      value: ''
    },
    {
      label: '开启',
      value: '1'
    },
    {
      label: '关闭',
      value: '0'
    }
  ]

  tableHead = [
    {
      label: '渠道 ID',
      prop: 'id',
      width: '80'
    },
    {
      label: '渠道名称',
      prop: 'name',
      width: '100'
    },
    {
      label: '支付 Code',
      prop: 'code',
      width: '150'
    },
    {
      label: '支付通道',
      prop: 'pay_scene_data',
      minWidth: '300'
    },
    {
      label: '描述',
      prop: 'description',
      width: '250'
    },
    {
      label: '状态',
      prop: 'status',
      width: '80'
    }
  ]

  tableData: any = []

  /** 所有的支付渠道集合 */
  payChannels: any[] = []

  mounted() {
    // 获取子页面按钮的权限
    this.$unauthorizedBtns(this.btnAuth, this.$route.path, this.authorizedButtons).then(data => this.unauthorizedBtnDic = data)
    this.requestTable()
    this.requestPayChannel()
  }

  requestTable() {
    this.isLoading = true

    let params = {
      page: this.page,
      page_size: this.size
    }

    params = _.assign(params, this.form)

    api
      .payList(params)
      .then((response: any) => {
        this.isLoading = false
        if (response.code === 0) {
          this.size = response.data.pagination.size
          this.page = response.data.pagination.page
          this.total = response.data.pagination.total
          this.tableData = response.data.list || []
          this.getPayScenes()
        } else {
          this.total = 0
          this.tableData = []
        }
      })
      .catch(error => {
        this.isLoading = false
      })
  }

  requestStatus(row: any) {
    let pay_scene_data = {}
    row._pay_scene_data.forEach(v => {
      pay_scene_data[v.key] = v.value
    })

    let params = {
      ...row,
      status: row.status,
      pay_scene_data
    }
    delete params._pay_scene_data

    api
      .putPayInfo(params)
      .then((response: any) => {
        if (response.code === 0) {
          this.$message.success('保存修改成功 ！')
        } else {
          this.$message.error('保存修改失败 ！')
        }
      })
      .catch(error => {
        this.$message.error('保存修改失败 ！')
      })
  }

  requestPayChannel() {
    api
      .payChannel()
      .then((response: any) => {
        if (response.code === 0) {
          _.forEach(response.data, (value, key) => {
            this.payChannels.push({
              key,
              lable: value,
              value: false,
              visible: false
            })
          })
          this.getPayScenes()
        }
      })
      .catch(error => {})
  }

  getPayScenes() {
    this.tableData.map(data => {
      this.$set(
        data,
        '_pay_scene_data',
        _.toPairs(data.pay_scene_data).map(([key, value]) => {
          const pay = this.payChannels.find(v => v.key === key)
          return {
            key,
            name: pay ? pay.lable : key,
            value
          }
        })
      )
    })
  }

  requestAdd() {
    this.isSaveLoading = true

    let pay_scene_data = {}
    this.payChannels.forEach(v => {
      if (v.visible) pay_scene_data[v.key] = v.value
    })

    let params = {
      pay_scene_data,
      ...this.formAdd
    }

    api
      .postPayInfo(params)
      .then((response: any) => {
        this.isSaveLoading = false

        if (response.code === 0) {
          this.isDialogVisible = false
          this.$message.success('新增支付渠道成功 ！')
          this.requestTable()
        } else {
          this.$message.error('新增支付渠道失败 ！')
        }
      })
      .catch(error => {
        this.isSaveLoading = false
        this.$message.error('新增支付渠道失败 ！')
      })
  }

  requestEdit() {
    this.isSaveLoading = true

    let pay_scene_data = {}
    this.payChannels.forEach(v => {
      if (v.visible) pay_scene_data[v.key] = v.value
    })

    let params = {
      id: this.currentItemID,
      pay_scene_data,
      ...this.formAdd
    }

    api
      .editPay(params)
      .then((response: any) => {
        this.isSaveLoading = false

        if (response.code === 0) {
          this.isDialogVisible = false
          this.$message.success('编辑支付渠道成功 ！')
          this.requestTable()
        } else {
          this.$message.error('编辑支付渠道失败 ！')
        }
      })
      .catch(error => {
        this.isSaveLoading = false
        this.$message.error('编辑支付渠道失败 ！')
      })
  }

  submitForm() {
    this.$refs.formAdd.validate(valid => {
      if (valid) {
        if (this.dialogType === 0) {
          this.requestAdd()
        } else if (this.dialogType === 1) {
          this.requestEdit()
        }
      }
    })
  }

  onQueryClick() {
    this.requestTable()
  }

  onResetClick() {
    this.form = {
      name: '',
      id: '',
      status: ''
    }
    this.page = 1
    this.requestTable()
  }
  updateStatus(row: any) {
    let pay_scene_data = {}
    row._pay_scene_data.forEach(v => {
      pay_scene_data[v.key] = v.value
    })

    let params = {
      ...row,
      status: row.status ? 0 : 1,
      pay_scene_data
    }
    delete params._pay_scene_data
    api
      .putPayInfo(params)
      .then((response: any) => {
        if (response.code !== 0) {
          this.$message.error('状态修改失败 ！')
        } else {
          row.status = params.status
        }
      })
      .catch(error => {
        this.$message.error('状态修改失败 ！')
      })
  }
  onSaveClick(row: any) {
    this.requestStatus(row)
  }

  onEditClick(row: any) {
    this.currentItemID = row.id
    this.$refs.formAdd && this.$refs.formAdd.clearValidate()
    this.formAdd = {
      name: row.name,
      code: row.code,
      api_params: _.cloneDeep(row.api_params),
      description: row.description,
      status: row.status
    }
    _.forEach(this.payChannels, (v: any) => {
      let t = _.find(row._pay_scene_data, { key: v.key }) as any
      if (t) {
        v.visible = true
        v.value = t.value
      } else {
        v.value = false
        v.visible = false
      }
    })
    this.dialogType = 1
    this.dialogTitle = '编辑支付渠道'
    this.isDialogVisible = true
  }

  onAddClick() {
    this.$refs.formAdd && this.$refs.formAdd.clearValidate()
    this.dialogType = 0
    this.dialogTitle = '新增支付渠道'
    this.isDialogVisible = true
  }

  onDialogSaveClick() {
    this.submitForm()
  }

  /** 对话框关闭动画完毕时，清空表单数据 */
  onDialogClosed() {
    this.formAdd = {
      name: '',
      code: '',
      api_params: [
        {
          key: '',
          label: '',
          type: 'text'
        }
      ],
      description: '',
      status: 0
    }
    _.forEach(this.payChannels, (v: any) => {
      v.value = false
      v.visible = false
    })
  }

  addConfigRow() {
    this.formAdd.api_params.push({
      key: '',
      label: '',
      type: 'text'
    })
  }

  removeConfigRow(index) {
    this.formAdd.api_params.splice(index, 1)
  }

  onPayChannelChange(key, checked) {}

  onPageSizeChange(size: number) {
    this.size = size
    this.requestTable()
  }

  onCurrentChange(page: number) {
    this.page = page
    this.requestTable()
  }

  /** 验证是否填写了商户配置参数 */
  validateConfigData(rule, value, callback) {
    if (_.filter(this.formAdd.api_params, { key: '' }).length > 0 || _.filter(this.formAdd.api_params, { label: '' }).length > 0) {
      callback(new Error('请填写商户配置参数'))
    } else {
      callback()
    }
  }

  /** 验证支付通道是否选择 */
  validateBankData(rule, value, callback) {
    if (_.filter(this.payChannels, { visible: true } as any).length === 0) {
      callback(new Error('请至少选择一个支付通道'))
    } else {
      callback()
    }
  }
}
</script>
