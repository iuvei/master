<template lang="pug" src="./index.pug"></template> <style scoped lang="stylus" src="./index.styl"></style>

<script lang="tsx">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { Form } from 'element-ui'
import api from '@/api'
import _ from 'lodash'
import router from '@/router'
import { StringDecoder } from 'string_decoder'
import { namespace, State } from 'vuex-class'
const USER = namespace('user')

@Component({
  components: {}
})
export default class recomGames extends Vue {
  @State timeZone
  @USER.State btnAuth
  /**
   * 1.添加推荐游戏
   * 2.停用/启用
   * 3.编辑
   * 4.删除
   */
  authorizedButtons = { id_1: 16, id_2: 17, id_3: 18, id_4: 19 }
  /** 根据登录时返回的权限信息控制按钮的显示和隐藏 */
  get unauthorizedBtnDic() {
    return _.mapValues(this.authorizedButtons, val => {
      return !!this.permissions[val]
    })
  }
  @Prop(Object) permissions: any
  // 查询条件
  form = {
    game_type: '1',
    partner_id: '1',
    status: ''
  }

  // 弹窗配置
  dialogform: any = {}
  isDialogVisible: boolean = false
  isSaveLoading: boolean = false

  // 弹窗表单验证
  rules = {
    status: [{ required: true, message: '必填字段' }],
    sort: [{ required: true, message: '必填字段' }, { validator: this.valueSort }],
    start_time: [{ required: true, message: '必填字段' }, { validator: this.valueRange }],
    end_time: [{ required: true, message: '必填字段' }, { validator: this.valueRange }]
  }

  $refs!: {
    dialogForm: Form
  }

  // 查询选择列表
  optionStatus: Object[] = [{ label: '全部', value: '' }, { label: '启动', value: '1' }, { label: '停止', value: '0' }]
  dialogStatus: Object[] = [{ label: '启动', value: '1' }, { label: '停止', value: '0' }]
  optionType: Object[] = [
    // { label: '全部', value: '' },
    { label: '电子', value: '1' },
    // { label: '视讯', value: '2' },
    // { label: '体育', value: '3' },
    // { label: '电竞', value: '4' },
    // { label: '彩票', value: '5' },
    { label: '棋牌', value: '6' }
  ]
  // optionAPI: any = [{ label: '全部', value: '' }]
  allApilist: any = []

  onQueryClick() {
    this.page = 1
    this.requestTable()
  }
  onResetClick() {
    this.form = {
      game_type: '',
      partner_id: '1',
      status: ''
    }
    this.page = 1
    this.requestTable()
  }
  sizes: number[] = [20, 50, 100, 200]
  page: number = 1
  size: number = 20
  total: number = 0

  isLoading: boolean = false

  tableData: Object = []

  get tableHead() {
    return [
      {
        label: '游戏类型',
        prop: 'game_type',
        formatter: (row, column, value: string, index): string => {
          let t: any = _.find(this.optionType, { value: String(value) })
          return t ? t.label : value.toString()
        }
      },
      {
        label: '所属API',
        prop: 'show_name'
      },
      {
        label: '游戏名称',
        prop: 'game_name'
      },
      {
        label: '添加时间',
        prop: 'created_at',
        width: '150'
      },
      {
        label: '开始时间',
        prop: 'start_time',
        width: '150'
      },
      {
        label: '结束时间',
        prop: 'end_time',
        width: '150'
      },
      {
        label: '剩余天数',
        prop: 'day_left'
      },
      {
        label: '添加人',
        prop: 'username'
      },
      {
        label: '排序',
        prop: 'sort'
      },
      {
        label: '状态',
        prop: 'status',
        formatter: (row, column, value, index): string => {
          let t: string = ''
          if (value) {
            t = '启动'
          } else {
            t = '停用'
          }
          return t
        }
      }
    ]
  }

  mounted() {
    this.requestTable()
    this.apiList()
  }

  requestTable() {
    this.isLoading = true

    let params = {
      page: this.page,
      page_size: this.size
    }

    params = _.assign(params, this.form)

    api
      .getGameLabel(params)
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
  onPageSizeChange(size: number) {
    this.size = size
    this.requestTable()
  }

  onCurrentChange(page: number) {
    this.page = page
    this.requestTable()
  }

  apiList() {
    api
      .getApiList()
      .then((response: any) => {
        if (response.code === 0 && response.data) {
          this.allApilist = response.data
        } else {
          this.allApilist = []
        }
      })
      .catch(error => {
        this.allApilist = []
      })
  }
  get optionAPI() {
    let arr: any = [{ label: '全部', value: '' }]
    if (this.form.game_type) {
      this.allApilist.map(item => {
        if (item.game_type == this.form.game_type) {
          arr.push({
            label: item.show_name,
            value: String(item.partner_id)
          })
        }
      })
    }
    return arr
  }

  change() {
    this.form.partner_id = ''
  }
  // 停用/启用
  disc(row, status) {
    let text: string = ''
    if (status) {
      text = '启动'
    } else {
      text = '停用'
    }
    if ((new Date(row.start_time).getTime() > this.timeZone.value || new Date(row.end_time).getTime() <= this.timeZone.value) && status) {
      this.$message.error('开始时间未到或者结束时间已过，请重新编辑时间再启用')
    } else {
      this.$confirm('确认' + text + row.game_name + '吗？', '提示')
        .then(() => {
          api.postrecommend({ id: row.id, status }).then((res: any) => {
            if (res.code === 0 && res.data) {
              this.$message.success(text + '成功')
              this.requestTable()
            } else {
              this.$message.error(res.msg)
            }
          })
        })
        .catch(_ => {})
    }
  }

  edit(row) {
    if (row.status == 0) {
      this.dialogform = JSON.parse(JSON.stringify(row))
      if (this.dialogform.status) {
        this.dialogform.status = '1'
      } else {
        this.dialogform.status = '0'
      }
      this.dialogform.game_type = String(this.dialogform.game_type)
      this.isDialogVisible = true
    } else {
      this.$message.error('启用状态不能编辑')
    }
  }

  onDialogSaveClick() {
    this.$refs.dialogForm.validate(valid => {
      if (valid) {
        this.preservation()
      }
    })
  }

  preservation() {
    this.isSaveLoading = true
    let data = {
      id: this.dialogform.id,
      start_time: new Date(this.dialogform.start_time).format('yyyy-MM-dd hh:mm:ss'),
      end_time: new Date(this.dialogform.end_time).format('yyyy-MM-dd hh:mm:ss'),
      status: this.dialogform.status,
      sort: this.dialogform.sort
    }
    api
      .postrecommend(data)
      .then((res: any) => {
        if (res.code === 0 && res.data) {
          this.isSaveLoading = false
          this.isDialogVisible = false
          this.$message.success('修改成功')
          this.requestTable()
        } else {
          this.isSaveLoading = false
          this.$message.error(res.msg)
        }
      })
      .catch(_ => {
        this.isSaveLoading = false
      })
  }

  remove(row) {
    if (row.status == 0) {
      this.$confirm('确认删除' + row.game_name + '吗？', '提示')
        .then(() => {
          api.delectGameLabel({ id: row.id }).then((res: any) => {
            if (res.code === 0 && res.data) {
              this.$message.success('删除成功')
              this.requestTable()
            } else {
              this.$message.error(res.msg)
            }
          })
        })
        .catch(_ => {})
    } else {
      this.$message.error('启用状态不能删除')
    }
  }

  valueRange(rule, value, callback) {
    if (new Date(this.dialogform.start_time).getTime() >= new Date(this.dialogform.end_time).getTime()) {
      callback(new Error('开始时间不大于结束时间'))
    } else {
      callback()
    }
  }
  valueSort(rule, value, callback) {
    if (!/^[1-9][0-9]*$/.test(value)) {
      callback('排序号为正整数且首位数字不为0')
    } else {
      callback()
    }
  }
  addClick() {
    this.$router.push({
      path: '/add-recom'
    })
  }

  onResetFields() {
    this.$refs.dialogForm.resetFields()
    this.isDialogVisible = false
  }
}
</script>
<style scoped lang="stylus">
.recom
  >>>
    .el-select
      display block

    .el-date-editor.el-input, .el-date-editor.el-input__inner
      width 100%
</style>
