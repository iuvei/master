<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>
<script lang="tsx">
import { Vue, Component } from 'vue-property-decorator'
import { Form } from 'element-ui'
import api from '@/api'
import _ from 'lodash'
import router from '@/router'
import { State, namespace } from 'vuex-class'
import { StringDecoder } from 'string_decoder'
import datetimePicker from '@/components/datetime-picker/index.vue'
import Upload from '@/components/upload/index.vue'
const USER = namespace('user')

@Component({
  components: {
    datetimePicker,
    Upload
  }
})
export default class transferAbnormal extends Vue {
  @State timeZone
  @USER.State btnAuth
  /**
   * 需要授权的按钮
   * maintain: 编辑维护开关
   */
  authorizedButtons: { [key: string]: number } = { handle: 45 }
  // 按钮权限集合
  unauthorizedBtnDic = { handle: false }
  // 查询条件
  form = {
    hall_id: '',
    amount_from: '',
    amount_to: '',
    out_id: '',
    in_id: '',
    username: '',
    status: ''
  }
  days = []
  tableData: any = []

  sizes: number[] = [20, 50, 100, 200]
  page: number = 1
  size: number = 20
  total: number = 0

  isLoading: boolean = false
  optionStatus = [{ label: '全部', value: '' }, { label: '成功', value: '1' }, { label: '失败', value: '0' }]
  hallList: any = []
  walletList: any = []

  dialogform: any = {}
  isDialogVisible: boolean = false
  isSaveLoading: boolean = false
  activeName: string = 'thirdParty'
  dialogtableData: any = []

  $refs!: {
    formData: Form
    dialogForm: Form
  }

  get tableHead() {
    return [
      {
        label: '厅主名称',
        prop: 'company_name'
      },
      {
        label: '用户名',
        prop: 'username'
      },
      {
        label: '转出钱包',
        prop: 'out_type'
      },
      {
        label: '转入钱包',
        prop: 'in_type'
      },
      {
        label: '转账金额',
        prop: 'amount'
      },
      {
        label: '转账时间',
        prop: 'created_at',
        minWidth: '140'
      },
      {
        label: '交易订单',
        prop: 'order_number',
        minWidth: '140'
      },
      {
        label: '备注',
        prop: 'remark',
        minWidth: '140'
      }
    ]
  }

  get dialogtableHead() {
    return [
      {
        label: '转账时间',
        prop: 'created_at'
      },
      {
        label: '转账金额',
        prop: 'amount',
        width: 120
      }
    ]
  }

  created() {
    this.getHallList()
    this.getWalletList()
  }

  mounted() {
    // 获取子页面按钮的权限
    this.$unauthorizedBtns(this.btnAuth, this.$route.path, this.authorizedButtons).then(data => (this.unauthorizedBtnDic = data))
    this.requestTable()
  }

  transferHandle() {
    api.transferHandle({ id: this.dialogform.id, status: this.dialogform.status, remark: this.dialogform.remark }).then((res: any) => {
      if (res.code === 0 && res.data) {
        this.dialogform = {}
        this.isSaveLoading = false
        this.isDialogVisible = false
        this.requestTable()
      } else {
        this.$message.error(res.msg)
      }
    })
  }

  getWalletList() {
    api.getWalletList().then((res: any) => {
      if (res.code === 0 && res.data) {
        this.walletList = res.data
      } else {
        this.walletList = []
        this.$message.error(res.msg)
      }
    })
  }

  getHallList() {
    api.getHallList().then((res: any) => {
      if (res.code === 0 && res.data) {
        this.hallList = res.data
      } else {
        this.hallList = []
        this.$message.error(res.msg)
      }
    })
  }

  requestTable() {
    this.isLoading = true
    let params = {
      exception: '1',
      page: this.page,
      page_size: this.size,
      time_begin: this.days[0],
      time_end: this.days[1]
    }
    params = _.assign(params, this.form)
    for (const key in params) {
      if (typeof params[key] == 'undefined') {
        delete params[key]
      }
    }
    api
      .getTransfer(params)
      .then((response: any) => {
        this.isLoading = false
        if (response.code === 0 && response.data) {
          if (response.data.pagination) {
            this.size = response.data.pagination.size
            this.page = response.data.pagination.page
            this.total = response.data.pagination.total
          }
          this.tableData = response.data.list
        } else {
          this.total = 0
          this.tableData = []
        }
      })
      .catch(error => {
        this.isLoading = false
      })
  }

  onQueryClick() {
    this.$refs.formData.validate(valid => {
      if (valid) {
        this.page = 1
        this.requestTable()
      }
    })
  }
  onResetClick() {
    this.form = {
      hall_id: '',
      amount_from: '',
      amount_to: '',
      out_id: '',
      in_id: '',
      username: '',
      status: ''
    }
    this.days = []
    this.page = 1
    this.$nextTick(() => {
      this.requestTable()
    })
  }

  supplement(row) {
    this.dialogform = {}
    this.dialogform = JSON.parse(JSON.stringify(row))
    if (row.handle_type == 1) {
      api.getTransferSupplement({ id: row.id }).then((res: any) => {
        if (res.code === 0 && res.data) {
          for (const key in res.data) {
            this.dialogform[key] = res.data[key]
          }
          if (res.data.result_type == 2) {
            this.dialogform.status = ''
            this.dialogtableData = this.dialogform.api_order_list
          }
          this.isDialogVisible = true
        } else {
          this.$message.error(res.msg)
        }
      })
    } else if (row.handle_type == 2) {
      this.dialogform.status = ''
      this.isDialogVisible = true
    }
  }

  onDialogSaveClick() {
    this.$refs.dialogForm.validate(valid => {
      if (valid) {
        this.transferHandle()
      }
    })
  }

  handleClick() {
    if (this.activeName == 'thirdParty') {
      this.dialogtableData = this.dialogform.api_order_list
    } else if (this.activeName == 'platform') {
      this.dialogtableData = this.dialogform.platform_order_list
    }
  }

  onResetFields() {
    this.$refs.dialogForm.resetFields()
    this.isDialogVisible = false
  }

  onPageSizeChange(size: number) {
    this.size = size
    this.requestTable()
  }

  onCurrentChange(page: number) {
    this.page = page
    this.requestTable()
  }

  validate(rule, value, callback) {
    if (Number(value) > Number(this.form.amount_to)) {
      callback(new Error('请区分大小金额'))
    } else {
      if (value < 0) {
        callback(new Error('查询转账金额不能小于0'))
      }
      callback()
    }
  }
}
</script>