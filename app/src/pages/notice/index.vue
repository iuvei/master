<template lang="pug" src="./index.pug"></template> <style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { Form } from 'element-ui'
import api from '@/api'
import _ from 'lodash'
import datetimePicker from '@/components/datetime-picker/index.vue'
import { namespace } from 'vuex-class'

const USER = namespace('user')
interface UBD {
  [key: string]: boolean
}

@Component({
  components: {
    datetimePicker
  }
})
export default class Notice extends Vue {
  @USER.State btnAuth
  /**
   * 需要授权的按钮
   * send: 发送
   * withdraw: 撤回
   * view: 查看
   */
  authorizedButtons: { [key: string]: number } = { send: 1, withdraw: 2, view: 3 }
  // 按钮权限集合
  unauthorizedBtnDic: UBD = { send: false, withdraw: false, view: false }
  $refs!: {
    dialogForm: Form
  }
  /**[可选项] 消息类型 */
  typeAll: any = [{ label: '第三方游戏消息', value: '1' }, { label: '财务消息', value: '2' }, { label: '平台维护消息', value: '3' }]
  /**[可选项] 厅主名 */
  acceptObjeAll: any = []
  /**[可选项] 发送人 */
  sendUserAll: any = []
  /**[状态可选项] */
  statusAll: any = [{ label: '已发布', value: 1 }, { label: '已撤回', value: 0 }]

  /**[筛选] 表单 */
  filterForm: any = {
    user_id: '',
    hall_id: '',
    type: ''
  }
  days: string[] = []

  /**[表数据] */
  sizes: number[] = [20, 50, 100, 200]
  page: number = 1
  size: number = 20
  total: number = 0
  isLoading: boolean = false
  tableData: object[] = []

  /**[弹框数据] */
  dialogForm: any = {
    dialogType: 'add', //add:新增 edit:'编辑'
    content: '',
    hall_id: [],
    title: '',
    type: '',
    time: ''
  }
  isDialogVisible: boolean = false
  isSaveLoading: boolean = false
  isIndeterminate = true
  checkAll = false

  dialogStatus: any = {
    id: '',
    received: [],
    receivedNumber: 0,
    unreceived: [],
    unreceivedNumber: 0
  }
  visible: boolean = false

  /**[弹框数据验证] */
  rules: any = {
    hall_id: [{ required: true, message: '请选择内容', trigger: ['blur'] }],
    type: [{ required: true, message: '请选择内容', trigger: ['blur', 'change'] }],
    title: [{ required: true, message: '请输入内容', trigger: ['blur', 'change'] },{ min: 1, max: 60, message: '长度不超过60个字符', trigger: ['change','blur' ]}],
    content: [{ required: true, message: '请输入内容', trigger: ['blur', 'change'] },{ min: 1, max: 500, message: '长度不超过500个字符', trigger:[ 'change' ,'blur']}]
  }

  mounted() {
    this.$unauthorizedBtns(this.btnAuth, this.$route.path, this.authorizedButtons).then(data => (this.unauthorizedBtnDic = data))
    this.requestNoticeName()
    this.requestSendUserList()
    this.requestTableList()
  }

  /**[获取] 厅主名称 */
  requestNoticeName() {
    api.getNoticeName().then((res: any) => {
      if (res.code === 0 && res.data && res.data.length > 0) {
        let arr: any[] = []
        res.data.map(v => {
          arr.push({
            label: v.name,
            value: v.id,
            id: v.id
          })
        })
        this.acceptObjeAll = arr
      } else {
        this.acceptObjeAll = []
      }
    })
  }

  /**[获取] 接收对象列表  */
  requestSendUserList() {
    api.noticeAcceptList().then((res: any) => {
      if (res.code === 0) {
        this.sendUserAll = res.data
      } else {
        this.sendUserAll = []
      }
    })
  }

  /**[获取] 表格数据 */
  requestTableList() {
    this.isLoading = true
    let params: any = {
      page: this.page,
      page_size: this.size
    }
    if (this.days.length > 0) {
      params.start_time = this.days[0]
      params.end_time = this.days[1]
    }
    params = _.assign(params, this.filterForm)
    api.getNoticeList(params).then((res: any) => {
      if (res.code === 0) {
        this.tableData = res.data.list
        if (res.data.pagination) {
          this.size = res.data.pagination.size
          this.page = res.data.pagination.page
          this.total = res.data.pagination.total
        }
        this.isLoading = false
      } else {
        this.isLoading = false
        this.tableData = []
        this.total = 0
      }
    })
  }
  // 查询
  onQueryClick() {
    this.page = 1
    this.requestTableList()
  }

  /**[重置] 筛选 */
  onResetFilter() {
    this.filterForm = {
      user_id: '',
      hall_id: '',
      type: ''
    }
    this.days = []
    this.page = 1
    this.$nextTick(() => {
      this.requestTableList()
    })
  }

  onPageSizeChange(size: number) {
    this.size = size
    this.requestTableList()
  }

  onCurrentChange(page: number) {
    this.page = page
    this.requestTableList()
  }

  onAdd() {
    this.dialogForm = {
      dialogType: 'add', //add:新增 edit:'编辑'
      content: '',
      hall_id: [],
      title: '',
      type: '',
      time: ''
    }
    this.isSaveLoading = false
    this.isDialogVisible = true
  }

  handleCheckAllChange(val) {
    this.dialogForm.hall_id = []
    if (val) {
      this.acceptObjeAll.map(key => {
        this.dialogForm.hall_id.push(key.value)
      })
    } else {
      this.dialogForm.hall_id = []
    }
    this.isIndeterminate = false
  }

  handleCheckedCitiesChange(value) {
    let checkedCount = value.length
    this.checkAll = checkedCount === this.acceptObjeAll.length
    this.isIndeterminate = checkedCount > 0 && checkedCount < this.acceptObjeAll.length
  }

  onResetFields() {
    this.dialogForm = {
      dialogType: 'add', //add:新增 edit:'编辑'
      content: '',
      hall_id: [],
      title: '',
      type: '',
      time: ''
    }
    this.$refs.dialogForm.resetFields()
    this.isDialogVisible = false
  }

  onDialogSaveClick() {
    this.isSaveLoading = true
    this.$refs.dialogForm.validate(valid => {
      if (valid) {
        this.onAddSave()
      } else {
        this.isSaveLoading = false
      }
    })
  }

  /**[新增] 消息 */
  onAddSave() {
    let form: any = JSON.parse(JSON.stringify(this.dialogForm))
    delete form.dialogType
    /**[此处为 接收对象 的id] */
    let hall_id: any[] = []
    this.acceptObjeAll.map(obj => {
      form.hall_id.map(id => {
        if (obj.value === id) {
          hall_id.push({
            id: obj.value,
            name: obj.label
          })
        }
      })
    })
    let params = Object.assign(form, { hall_id })
    api.addNotice(params).then((res: any) => {
      if (res.code === 0) {
        this.$message.success('新增成功！')
        this.isSaveLoading = false
        this.isDialogVisible = false
        this.requestTableList()
      } else {
        this.isSaveLoading = false
        this.$message.error(res.msg)
      }
    })
  }

  onLook(row) {
    this.dialogForm = {
      dialogType: 'edit', //add:新增 edit:'编辑'
      content: row.content,
      hall_id: [],
      title: row.title,
      type: String(row.type),
      time: row.created_at
    }
    this.isDialogVisible = true
  }

  /**[删除] 公告消息 */
  onDelete(row) {
    if(row.status){
    this.$confirm('确认撤回吗？', '警告', {
      type: 'error',
      confirmButtonText: '撤回'
    })
      .then(() => {
        this.requestDeleteNotice({ notice_id: row.id, status: row.status == 0 ? 1 : 0 })
      })
      .catch(() => {})
    }else{
      this.$message.error('该消息已撤回')
    }
  }

  /**[删除] 消息 */
  requestDeleteNotice(params) {
    api.deleteNotice(params).then((res: any) => {
      if (res.code === 0) {
        this.$message.success('撤回成功！')
        this.requestTableList()
      } else {
        this.$message.error(res.msg)
      }
    })
  }

  /**[查看] 消息状态 */
  onMessage(row) {
    this.dialogStatus.id = row.id
    this.requestMessage()
  }

  /**[查看] 消息状态 */
  requestMessage() {
    this.dialogStatus = {
      id: this.dialogStatus.id,
      received: [],
      receivedNumber: 0,
      unreceived: [],
      unreceivedNumber: 0
    }
    api.messageNotice({ notice_id: this.dialogStatus.id }).then((res: any) => {
      if (res.code === 0) {
        res.data.map(v => {
          if (v.status) {
            /**[已读] */
            this.dialogStatus.unreceived.push(v.hall_name)
            this.dialogStatus.unreceivedNumber += 1
          } else {
            /**[未读] */
            this.dialogStatus.received.push(v.hall_name)
            this.dialogStatus.receivedNumber += 1
          }
        })
        this.isSaveLoading = false
        this.visible = true
      } else {
        this.isSaveLoading = false
        this.$message.error(res.msg)
      }
    })
  }

  onReset() {
    this.isSaveLoading = true
    this.requestMessage()
  }

  formatterType(row, column) {
    let type
    this.typeAll.map(key => {
      if (row.type == key.value) {
        type = key.label
      }
    })
    return type
  }
}
</script>
