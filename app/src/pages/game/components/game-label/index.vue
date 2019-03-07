<template lang="pug" src="./index.pug"></template> <style scoped lang="stylus" src="./index.styl"></style>

<script lang="tsx">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { Form } from 'element-ui'
import api from '@/api'
import _ from 'lodash'
import { namespace, State } from 'vuex-class'
const USER = namespace('user')

@Component({
  components: {}
})
export default class gameLabel extends Vue {
  @State timeZone
  @USER.State btnAuth
  @Prop(Object) permissions: any
  /**
   * 1.编辑标签时间
   * 2.编辑添加热门开关
   * 3.编辑操作
   */
  authorizedButtons = { id_1: 20, id_2: 21, id_3: 22, id_4: 23, id_5: 38, id_6: 39 }
  /** 根据登录时返回的权限信息控制按钮的显示和隐藏 */
  get unauthorizedBtnDic() {
    return _.mapValues(this.authorizedButtons, val => {
      return !!this.permissions[val]
    })
  }
  // 查询条件
  form = {
    game_type: '1',
    partner_id: '',
    game_name: '',
    tag_id: ''
  }

  // 弹窗配置
  dialogform1: any = {}
  dialogform: any = {
    tag_ids: []
  }
  isDialogVisible1: boolean = false
  isSaveLoading1: boolean = false
  isDialogVisible: boolean = false
  isSaveLoading: boolean = false
  dialogTilte: string = ''

  // 弹窗表单验证
  rules = {
    status: [{ required: true, message: '必填字段' }],
    new_end_time: [{ required: true, message: '必填字段' }, { validator: this.valueRange }],
    remark: [{ max: 300, message: '长度不超过300个字符', trigger: 'blur' }],
    hot_end_time: [{ required: true, message: '必填字段' }, { validator: this.valueRange }]
  }

  $refs!: {
    dialogForm: Form
    dialogForm1: Form
  }
  // 查询选择列表
  optionStatus: Object[] = [{ label: '全部', value: '' }]
  optionType: Object[] = [
    // { label: '全部', value: '' },
    { label: '电子', value: '1' },
    // { label: '视讯', value: '2' },
    // { label: '体育', value: '3' },
    // { label: '电竞', value: '4' },
    // { label: '彩票', value: '5' },
    { label: '棋牌', value: '6' }
  ]
  allApilist: any = []
  optionTag: any = [{ value: '', label: '全部' }]
  allTag: any = []
  get optionAPI() {
    let arr: any = [{ label: '全部', value: '' }]
    if (this.form.game_type) {
      this.allApilist.map(item => {
        if (item.game_type == this.form.game_type) {
          arr.push({
            label: item.show_name,
            value: item.partner_id
          })
        }
      })
    }
    return arr
  }

  change() {
    this.form.partner_id = ''
    this.tagList()
  }

  onQueryClick() {
    this.page = 1
    this.requestTable()
  }
  onResetClick() {
    this.form = {
      game_type: '1',
      partner_id: '',
      tag_id: '',
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

  tableData: Object = []

  mounted() {
    this.requestTable()
    this.apiList()
    this.tagList()
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

  tagList() {
    this.optionTag = [{ value: '', label: '全部' }]
    api
      .getTagList({ game_type: this.form.game_type })
      .then((response: any) => {
        if (response.code === 0 && response.data) {
          this.allTag = response.data
          response.data.map(item => {
            this.optionTag.push({
              label: item.name,
              value: item.id
            })
            item.child.map(key => {
              this.optionTag.push({
                label: key.name,
                value: key.id
              })
            })
          })
        } else {
          this.optionTag = []
        }
      })
      .catch(error => {
        this.optionTag = []
      })
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

        if (response.code === 0) {
          this.tableData = response.data.list
          if (response.data.pagination) {
            this.size = response.data.pagination.size
            this.page = response.data.pagination.page
            this.total = response.data.pagination.total
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

  changeBadge(newVal, row) {
    if (this.unauthorizedBtnDic['id_2']) {
      api
        .postGameLabel({ id: row.id, badge: Number(newVal) })
        .then((response: any) => {
          if (response.code === 0) {
            row.badge = newVal
          } else {
            row.badge = !newVal
            this.$message.error(response.msg)
          }
        })
        .catch(error => {})
    } else {
      this.$message.error('该功能暂无权限，无法进行操作')
    }
  }

  changedate(row, type) {
    if (this.unauthorizedBtnDic['id_1']) {
      this.dialogform1 = JSON.parse(JSON.stringify(row))
      this.dialogform1.type = type
      if (type == 'hot') {
        this.dialogTilte = '热门标签结束时间'
      } else if (type == 'new') {
        this.dialogTilte = '最新标签结束时间'
      }
      this.isDialogVisible1 = true
    } else {
      this.$message.error('该功能暂无权限，无法进行操作')
    }
  }

  onDialogTime() {
    this.$refs.dialogForm1.validate(valid => {
      if (valid) {
        this.preservation()
      }
    })
  }

  preservation() {
    this.isSaveLoading1 = true
    let data: any = {
      id: this.dialogform1.id,
      hot_end_time: new Date(this.dialogform1.hot_end_time).format('yyyy-MM-dd hh:mm:ss') || 0,
      new_end_time: new Date(this.dialogform1.new_end_time).format('yyyy-MM-dd hh:mm:ss') || 0
    }
    if (this.dialogform1.type == 'hot') {
      delete data.new_end_time
    } else if (this.dialogform1.type == 'new') {
      delete data.hot_end_time
    }
    api
      .postGameLabel(data)
      .then((response: any) => {
        if (response.code === 0) {
          this.dialogform1 = {}
          this.$message.success('修改成功')
          this.isSaveLoading1 = false
          this.isDialogVisible1 = false
          this.requestTable()
        } else {
          this.isSaveLoading1 = false
          this.$message.error(response.msg)
        }
      })
      .catch(error => {})
  }

  edit(row) {
    this.dialogform = JSON.parse(JSON.stringify(row))
    if (this.dialogform.tag_ids == '') {
      this.dialogform.tag_ids = []
    } else {
      this.dialogform.tag_ids = this.dialogform.tag_ids.split(',')
    }
    this.isDialogVisible = true
  }

  onDialogSaveClick() {
    this.isSaveLoading = true
    let data: any = {
      id: this.dialogform.id,
      tags: this.dialogform.tag_ids
    }
    if (this.dialogform.tag_ids.length > 5 || this.dialogform.tag_ids.length == 0) {
      this.isSaveLoading = false
      this.$message.error('选择标签数最少1个且不超过5个')
    } else {
      api
        .postGametag(data)
        .then((response: any) => {
          if (response.code === 0) {
            this.$message.success('编辑成功')
            this.dialogform = {}
            this.isSaveLoading = false
            this.isDialogVisible = false
            this.requestTable()
          } else {
            this.isSaveLoading = false
            this.$message.error(response.msg)
          }
        })
        .catch(error => {})
    }
  }

  valueRange(rule, value, callback) {
    if (new Date(value).getTime() <= this.timeZone.value) {
      callback(new Error('结束时间不小于当前时间'))
    } else {
      callback()
    }
  }

  gameType(type) {
    let name = ''
    this.optionType.map((item: any) => {
      if (item.value == type) {
        name = item.label
      }
    })
    return name
  }
}
</script>
