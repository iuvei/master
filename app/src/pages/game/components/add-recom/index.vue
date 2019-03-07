<template lang="pug" src="./index.pug"></template> <style scoped lang="stylus" src="./index.styl"></style>

<script lang="tsx">
import { Vue, Component } from 'vue-property-decorator'
import { Form } from 'element-ui'
import api from '@/api'
import _ from 'lodash'
import router from '@/router'
import { StringDecoder } from 'string_decoder'
import 'font-awesome/css/font-awesome.min.css'
import { namespace, State } from 'vuex-class'

@Component({
  components: {}
})
export default class recomGames extends Vue {
  @State timeZone
  // 查询条件
  form = {
    game_type: '1',
    partner_id: '1',
    game_name: ''
  }

  // 弹窗配置
  dialogform: any = {
    status: '',
    remark: '',
    start_time: '',
    end_time: '',
    name: [],
    ids: []
  }
  isDialogVisible: boolean = false
  isSaveLoading: boolean = false

  // 弹窗表单验证
  rules = {
    status: [{ required: true, message: '必填字段' }],
    start_time: [{ required: true, message: '必填字段' }, { validator: this.valueRange }],
    remark: [{ max: 300, message: '长度不超过300个字符', trigger: 'blur' }],
    end_time: [{ required: true, message: '必填字段' }, { validator: this.valueRange }]
  }

  $refs!: {
    dialogForm: Form
  }

  // 查询选择列表
  optionStatus: Object[] = [{ label: '启动', value: '1' }, { label: '停止', value: '0' }]
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
      game_type: '1',
      partner_id: '1',
      game_name: ''
    }
    this.page = 1
    this.requestTable()
  }
  sizes: number[] = [20, 50, 100, 200]
  page: number = 1
  size: number = 20
  total: number = 0

  isLoading: boolean = false

  tableData: any = []

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
      .getGameList(params)
      .then((response: any) => {
        this.isLoading = false

        if (response.code === 0 && response.data) {
          this.tableData = []
          if (response.data.pagination) {
            this.size = response.data.pagination.size
            this.page = response.data.pagination.page
            this.total = response.data.pagination.total
          }
          if (response.data.list.length > 0) {
            response.data.list.map(item => {
              item.add = false
              this.tableData.push(item)
            })
          }
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
      ids: this.dialogform.ids,
      start_time: new Date(this.dialogform.start_time).format('yyyy-MM-dd hh:mm:ss'),
      end_time: new Date(this.dialogform.end_time).format('yyyy-MM-dd hh:mm:ss'),
      status: this.dialogform.status,
      remark: this.dialogform.remark
    }
    if (
      (new Date(this.dialogform.start_time).getTime() > this.timeZone.value || new Date(this.dialogform.end_time).getTime() <= this.timeZone.value) &&
      this.dialogform.status == 1
    ) {
      this.isSaveLoading = false
      this.$message.error('开始时间未到或者结束时间已过，请重新编辑时间再启用')
    } else {
      api.putApiList(data).then((res: any) => {
        if (res.code === 0) {
          this.isSaveLoading = false
          this.isDialogVisible = false
          this.$message.success('添加成功')
          this.requestTable()
        } else {
          this.isSaveLoading = false
          this.$message.error(res.msg)
        }
      })
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

  add(row) {
    if (!row.is_recommend) {
      row.add = !row.add
    } else {
      this.$message.error('该游戏已是推荐游戏')
    }
  }
  goout() {
    this.$router.push({ path: '/games-administration', query: { type: 'recomGames' } })
  }

  onAdd() {
    this.dialogform = {
      status: '',
      remark: '',
      start_time: '',
      end_time: '',
      name: [],
      ids: []
    }
    this.tableData.map(item => {
      if (item.add) {
        this.dialogform.name.push(item.name)
        this.dialogform.ids.push(item.id)
      }
    })
    if (this.dialogform.name.length <= 0) {
      this.$message.error('请选择需要添加的游戏')
    } else {
      this.isDialogVisible = true
    }
  }
}
</script>
