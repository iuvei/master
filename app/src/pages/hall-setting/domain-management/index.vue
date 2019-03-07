<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="tsx">
import { Vue, Component } from 'vue-property-decorator'
import api from '@/api'
import { Form } from 'element-ui'
import { namespace } from 'vuex-class'

const USER = namespace('user')

@Component
export default class DomainManagement extends Vue {
  @USER.State btnAuth
  /**
   * 需要授权的按钮
   * add: 新增
   * edit: 编辑
   * reversal: 停用/启用
   */
  authorizedButtons: { [key: string]: number } = { add: 50, edit: 51, reversal: 52 }
  // 按钮权限集合
  unauthorizedBtnDic = { add: false, edit: false, reversal: false }
  /** 筛选条件默认值 */
  readonly formSchema: any = {
    hall_id: '',
    status: ''
  }
  /** 筛选条件的表单 */
  form: any = {}

  /** 对话框是否显示 */
  isDialogVisible: boolean = false
  isEditDialogVisible: boolean = false

  /** 对话框类型，0 : 新增 | 1 : 编辑 */
  dialogType: number = 0

  /** 是否是新增代理模式的弹窗 */
  get isAddNewAgentDialog() {
    return this.dialogType === 0
  }

  /** 新增/编辑域名 表单默认值 */
  readonly editDomainFormSchema = {
    name: '',
    domains: [{ value: '' }]
  }
  /** 新增域名 */
  addDomainForm: any = {}
  /** 编辑域名 */
  editDomainForm: any = {
    domain_id: 0,
    domain: '',
    hall_name: ''
  }

  /** 表单校验规则 */
  rules = {
    name: [{ required: true, message: '请输入客户名称', trigger: 'blur' }],
    domains: [
      { required: true, message: '域名不能为空', trigger: 'blur' },
      {
        validator: (rule, value, callback) => {
          const pattern = /^(?=^.{3,255}$)[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})$/
          if (!pattern.test(value)) {
            callback(new Error('请输入正确的域名'))
          } else {
            callback()
          }
        },
        trigger: 'change'
      }
    ]
  }

  /** 厅主名称列表 */
  hallNameList: any[] = []
  filteredNameList: any[] = []

  /** 表格数据 */
  tableData: any[] = []

  /**分页相关数据 */
  sizes: number[] = [20, 50, 100, 200]
  page: number = 1
  size: number = 20
  total: number = 0

  /** 表格是否正在加载 */
  isLoading: boolean = false

  $refs!: {
    addDomainForm: Form
  }

  /** 是否正在保存数据中，防止保存按钮多次误点 */
  isSaveLoading: boolean = false

  tableHead = [
    { label: 'ID', prop: 'id' },
    { label: '厅主名称', prop: 'hall_name' },
    { label: '厅主账号', prop: 'admin_name' },
    { label: '标识域名', prop: 'domain' },
    {
      label: '状态',
      prop: 'status',
      formatter: value => {
        const h = this.$createElement
        return <span class={value.status === 0 ? 'text_fail' : 'text_success'}>{value.status === 0 ? '停用' : '启用'}</span>
      }
    },
    { label: '创建时间', prop: 'created_at' },
    { label: '更新时间', prop: 'updated_at' }
  ]

  instructions = [
    '域名后缀必须以 ".com" 、“.co”、“.cn”、".net、“.org”等格式为结尾',
    '举例：baidu.com',
    '添加新域名后，请联系运维进行部署，否则该域名将无法访问。'
  ]

  created() {
    this.resetFilter()
    this.resetAdd()
    this.domainHallNameList()
    this.requestTable(true)
    // 获取子页面按钮的权限
    this.$unauthorizedBtns(this.btnAuth, this.$route.path, this.authorizedButtons).then(data => (this.unauthorizedBtnDic = data))
  }

  resetFilter() {
    this.form = JSON.parse(JSON.stringify(this.formSchema))
  }

  resetAdd() {
    this.addDomainForm = JSON.parse(JSON.stringify(this.editDomainFormSchema))
  }

  /** 查询 */
  onQueryClick() {
    this.requestTable(true)
  }

  /** 重置 */
  onResetClick() {
    this.resetFilter()
    this.requestTable(true)
  }

  /** 点击新增 */
  onAddClick() {
    this.dialogType = 0
    this.isDialogVisible = true
  }

  /** 删除一行 */
  removeDomain(item) {
    var index = this.addDomainForm.domains.indexOf(item)
    if (index !== -1) {
      this.addDomainForm.domains.splice(index, 1)
    }
  }

  /** 添加一行 */
  addDomain() {
    this.addDomainForm.domains.push({ value: '' })
  }

  /** 获取厅主名称列表 */
  domainHallNameList() {
    api.domainHallNameList().then(res => {
      if (res.code === 0 && res.data) {
        this.hallNameList = res.data.map(item => ({ value: item.hall_id, label: item.hall_name }))
      } else {
        this.$message.error(res.msg)
        this.hallNameList = []
      }
    })
  }

  /** 请求列表 */
  requestTable(isQueryBtn?: boolean) {
    const query = {
      hall_id: this.form.hall_id,
      status: this.form.status
    }

    const params = {
      page: isQueryBtn ? 1 : this.page,
      page_size: this.size
    }

    for (let key in query) {
      if (query[key] !== '') {
        params[key] = query[key]
      }
    }

    this.isLoading = true
    api
      .domainManagementList(params)
      .then(res => {
        this.isLoading = false
        if (res.code === 0 && res.data && res.data.list) {
          const list = res.data.list || []
          const { pagination } = res.data

          this.size = pagination.size
          this.total = pagination.total
          this.page = pagination.page

          this.tableData = list
        } else {
          this.$message.error(res.msg)
          this.total = 0
          this.tableData = []
        }
      })
      .catch(error => {
        this.isLoading = false
      })
  }

  /** 验证通过后提交表单 */
  submitForm(formName) {
    this.$refs[formName].validate(valid => {
      if (valid) {
        this.onDialogSaveClick()
      } else {
        return false
      }
    })
  }

  /** 点击对话框的保存按钮 */
  onDialogSaveClick() {
    this.isSaveLoading = true
    switch (this.dialogType) {
      case 0:
        this.addNewDomain()
        break
      case 1:
        this.editDomain()
        break
    }
  }

  /** 新增域名 */
  addNewDomain() {
    const params = {
      hall_id: this.addDomainForm.name,
      domain: this.addDomainForm.domains.map(item => item.value).join(';')
    }
    api
      .addDomain(params)
      .then(res => {
        this.isSaveLoading = false
        if (res.code === 0) {
          this.$message.success('新增域名成功')
          this.requestTable()
          this.isDialogVisible = false
        } else {
          this.$message.error(res.msg)
        }
      })
      .catch(err => {
        this.isSaveLoading = false
        this.$message.error('新增域名失败')
      })
  }
  /** 编辑域名 */
  editDomain() {
    const params = {
      domain_id: this.editDomainForm.domain_id,
      domain: this.editDomainForm.domain
    }

    api.domainEdit(params).then(res => {
      if (res.code === 0) {
        this.$message.success('修改成功')
        this.requestTable()
        this.isEditDialogVisible = false
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

  // @todo
  onEdit(rowData) {
    this.dialogType = 1
    this.isEditDialogVisible = true
    const { id, domain, hall_name } = rowData

    this.editDomainForm.domain_id = id
    this.editDomainForm.domain = domain
    this.editDomainForm.hall_name = hall_name
  }

  // 启停切换
  statusSwitch(rowData, type) {
    const params = {
      domain_id: rowData.id,
      status: type === 'on' ? 1 : 0
    }

    api.domainStatus(params).then(res => {
      if (res.code === 0) {
        this.requestTable()
      } else {
        this.$message.error(res.msg)
      }
    })
  }
}
</script>