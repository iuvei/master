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
export default class transferRecord extends Vue {
  @State timeZone
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
  optionStatus = [{ name: '全部', status: '' }]
  hallList: any = []
  walletList: any = []

  $refs!: {
    formData: Form
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

  created() {
    this.getHallList()
    this.getWalletList()
    this.getStatus()
  }

  mounted() {
    this.requestTable()
  }

  getStatus() {
    this.optionStatus = [{ name: '全部', status: '' }]
    api.getTransferStatus().then((res: any) => {
      if (res.code === 0 && res.data) {
        this.optionStatus = this.optionStatus.concat(res.data)
      } else {
        this.optionStatus = [{ name: '全部', status: '' }]
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
        this.hallList = this.hallList.concat(res.data)
      } else {
        this.hallList = []
        this.$message.error(res.msg)
      }
    })
  }

  requestTable() {
    this.isLoading = true
    let params = {
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