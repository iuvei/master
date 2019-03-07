<template lang="pug" src="./index.pug"></template> <style scoped lang="stylus" src="./index.styl"></style>

<script lang="tsx">
import { Vue, Component } from 'vue-property-decorator'
import { Form } from 'element-ui'
import api from '@/api'
import _ from 'lodash'
import router from '@/router'
import { State, namespace } from 'vuex-class'
import { StringDecoder } from 'string_decoder'
import DayPicker from '@/components/day-picker/index.vue'
import datetimePicker from '@/components/datetime-picker/index.vue'
import Upload from '@/components/upload/index.vue'
const USER = namespace('user')

@Component({
  components: {
    DayPicker,
    datetimePicker,
    Upload
  }
})
export default class activityManage extends Vue {
  @USER.State btnAuth
  /**
   * 1.新增
   * 2.停用、启用
   * 3.编辑
   * 4.删除
   */
  authorizedButtons = { id_1: 24, id_2: 25, id_3: 26, id_4: 27 }
  unauthorizedBtnDic = { id_1: false, id_2: false, id_3: false, id_4: false }

  @State timeZone
  // 查询条件
  form = {
    status: '',
    title: ''
  }
  allApilist: any = []
  optionType: any = []
  optionAPI: any = []

  // 弹窗配置
  dialogform: any = {
    title: '',
    type: '',
    partner_id: '',
    img_pc: '',
    begin_time: '',
    end_time: '',
    status: '',
    link_pc: '',
    link_h5: '',
    img_h5: '',
    activeTime: [],
    location: ''
  }
  id: any = ''
  fileListH5: any[] = []
  fileListPc: any[] = []
  sizeTextH5: string = ''
  sizeTextPc: string = ''
  maxpic: number = 1
  isDialogVisible: boolean = false
  isSaveLoading: boolean = false
  dialogTitle: string = ''
  days: string[] = []
  // 弹窗表单验证
  rules = {
    title: [{ required: true, message: '必填字段' }, { min: 1, max: 25, message: '长度不超过25个字符', trigger: 'blur' }],
    partner_id: [{ required: true, message: '必填字段' }],
    type: [{ required: true, message: '必填字段' }],
    status: [{ required: true, message: '必填字段' }],
    img_pc: [{ required: true, message: '必填字段' }],
    link_h5: [{ required: false, message: '必填字段' }, { validator: this.valueUrl }],
    link_pc: [{ required: false, message: '必填字段' }, { validator: this.valueUrl }],
    begin_time: [{ required: true, message: '必填字段' }, { validator: this.valueRange }],
    end_time: [{ required: true, message: '必填字段' }, { validator: this.valueRange }],
    activeTime: [{ required: true, message: '必填字段' }, { validator: this.valueTime }]
  }

  $refs!: {
    dialogForm: Form
    dayPicker: any
  }

  // 查询选择列表
  optionStatus: Object[] = [{ label: '全部', value: '' }, { label: '启动', value: '1' }, { label: '停用', value: '0' }]

  onQueryClick() {
    this.page = 1
    this.requestTable()
  }
  onResetClick() {
    this.form = {
      status: '',
      title: ''
    }
    this.$refs.dayPicker.$emit('reset')

    this.page = 1
    this.requestTable()
  }
  sizes: number[] = [20, 50, 100, 200]
  page: number = 1
  size: number = 20
  total: number = 0

  isLoading: boolean = false

  tableData: Object = []

  created() {
    this.getActiveType()
    this.apiList()
  }

  mounted() {
    this.$unauthorizedBtns(this.btnAuth, this.$route.path, this.authorizedButtons).then(data => (this.unauthorizedBtnDic = data))
    this.requestTable()
  }
  // 获取活动类型
  getActiveType() {
    this.optionType = []
    api.getActiveType().then((res: any) => {
      if (res.code === 0 && res.data) {
        for (let key in res.data) {
          this.optionType.push({
            value: String(key),
            label: res.data[key]
          })
        }
      } else {
        this.optionType = []
        this.$message.error(res.msg)
      }
    })
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

  requestTable() {
    this.isLoading = true
    let params = {
      page: this.page,
      page_size: this.size,
      begin_time: this.days[0],
      end_time: this.days[1]
    }
    params = _.assign(params, this.form)
    api
      .getActive(params)
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

  addClick() {
    this.fileListH5 = []
    this.fileListPc = []
    this.dialogform = {
      title: '',
      type: '3',
      partner_id: '',
      img_pc: '',
      begin_time: '',
      end_time: '',
      status: '',
      link_pc: '',
      link_h5: '',
      img_h5: '',
      activeTime: [],
      location: ''
    }
    this.changeType()
    this.dialogTitle = '新增API活动'
    this.isDialogVisible = true
  }
  disc(row, status) {
    let text: string = ''
    if (status) {
      text = '启动'
    } else {
      text = '停用'
    }
    this.$confirm('确认' + text + row.title + '吗？', '提示')
      .then(() => {
        api.patchActive({ id: row.id, status }).then((res: any) => {
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

  remove(row, status) {
    if (row.status == 0) {
      this.$confirm('确认删除' + row.title + '吗？', '提示')
        .then(() => {
          api.deleteActive({ id: row.id }).then((res: any) => {
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
      this.$message.error('只有停用状态才能进行删除')
    }
  }

  edit(row) {
    if (row.status == 0) {
      this.fileListH5 = []
      this.fileListPc = []
      this.dialogform = {
        title: row.title,
        type: '',
        partner_id: row.partner_id == '' ? '' : String(row.partner_id),
        img_pc: row.img_pc,
        begin_time: row.begin_time,
        end_time: row.end_time,
        status: String(row.status),
        link_pc: row.link_pc,
        link_h5: row.link_h5,
        img_h5: row.img_h5,
        activeTime: [row.begin_time, row.end_time],
        location: String(row.location)
      }
      this.id = row.id
      if (row.img_h5 && row.img_h5 != '') {
        this.fileListH5 = [{ name: '', url: row.img_h5 }]
      }
      if (row.img_pc && row.img_pc != '') {
        this.fileListPc = [{ name: '', url: row.img_pc }]
      }
      this.optionType.map(item => {
        if (item.label == row.type) {
          this.dialogform.type = item.value
        }
      })
      this.changeType()
      this.dialogform.partner_id = row.partner_id == '' ? '' : String(row.partner_id)
      this.dialogTitle = '编辑API活动'
      this.isDialogVisible = true
    } else {
      this.$message.error('只有停用状态才能进行编辑')
    }
  }

  onResetFields() {
    this.$refs.dialogForm.resetFields()
    this.isDialogVisible = false
  }

  onDialogSaveClick() {
    this.$refs.dialogForm.validate(valid => {
      if (valid) {
        if (this.dialogTitle == '新增API活动') {
          this.onAddSave()
        }
        if (this.dialogTitle == '编辑API活动') {
          this.onEditSave()
        }
      }
    })
  }

  onAddSave() {
    let data = JSON.parse(JSON.stringify(this.dialogform))
    for (let key in data) {
      if (data[key] == '') {
        delete data[key]
      }
    }
    data.begin_time = this.dialogform.activeTime[0]
    data.end_time = this.dialogform.activeTime[1]
    data = _.assign(data)
    this.isSaveLoading = true
    api
      .putActive(data)
      .then((res: any) => {
        if (res.code === 0 && res.data) {
          this.$message.success('新增成功')
          this.isSaveLoading = false
          this.isDialogVisible = false
          this.requestTable()
        } else {
          this.$message.error(res.msg)
          this.isSaveLoading = false
        }
      })
      .catch(error => {
        this.isSaveLoading = false
      })
  }

  onEditSave() {
    let data = JSON.parse(JSON.stringify(this.dialogform))
    for (let key in data) {
      if (data[key] == '') {
        delete data[key]
      }
    }
    data.id = this.id
    data.begin_time = new Date(this.dialogform.activeTime[0]).format('yyyy-MM-dd hh:mm:ss')
    data.end_time = new Date(this.dialogform.activeTime[1]).format('yyyy-MM-dd hh:mm:ss')
    this.isSaveLoading = true
    api
      .postActive(data)
      .then((res: any) => {
        if (res.code === 0 && res.data) {
          this.$message.success('修改成功')
          this.isSaveLoading = false
          this.isDialogVisible = false
          this.id = ''
          this.requestTable()
        } else {
          this.$message.error(res.msg)
          this.isSaveLoading = false
        }
      })
      .catch(error => {
        this.isSaveLoading = false
      })
  }

  changeType() {
    this.optionAPI = []
    this.dialogform.partner_id = ''
    if (this.dialogform.type == 3) {
      this.allApilist.map(item => {
        if (item.game_type == 1) {
          this.optionAPI.push({
            value: String(item.partner_id),
            label: item.show_name
          })
        }
      })
    }
    if (this.dialogform.type == 7) {
      this.allApilist.map(item => {
        if (item.game_type == 6) {
          this.optionAPI.push({
            value: String(item.partner_id),
            label: item.show_name
          })
        }
      })
    }
    if (this.dialogform.type == 1) {
      this.sizeTextPc = '256 X 282'
    }
    if (this.dialogform.type == 2 || this.dialogform.type == 6) {
      this.sizeTextPc = '1920 X 500'
      this.sizeTextH5 = '375 X 158'
    }
    if (this.dialogform.type == 4) {
      this.sizeTextPc = '290 X 396'
      this.sizeTextH5 = '375 X 158'
    }
    if (this.dialogform.type == 5) {
      this.sizeTextPc = '1920 X 290'
      this.sizeTextH5 = '375 X 158'
    }
    if (this.dialogform.type == 3 || this.dialogform.type == 7) {
      this.sizeTextPc = '1200 X 230'
      this.sizeTextH5 = '375 X 158'
    }
  }

  valueRange(rule, value, callback) {
    if (new Date(this.dialogform.begin_time).getTime() > new Date(this.dialogform.end_time).getTime()) {
      callback(new Error('开始时间不大于结束时间'))
    } else {
      callback()
    }
  }
  valueTime(rule, value, callback) {
    if (!this.dialogform.activeTime[0] || !this.dialogform.activeTime[1]) {
      callback(new Error('请设置正确的时间'))
    } else if (new Date(this.dialogform.activeTime[0]).getTime() > new Date(this.dialogform.activeTime[1]).getTime()) {
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
  valueUrl(rule, value, callback) {
    let reg = /^([hH][tT]{2}[pP]:\/\/|[hH][tT]{2}[pP][sS]:\/\/)(([A-Za-z0-9-~]+)\.)+([A-Za-z0-9-~\/])+$/
    if (value != '' && !reg.test(value)) {
      callback('请输入正确的网址并以http/https开头')
    } else {
      callback()
    }
  }
}
</script>
