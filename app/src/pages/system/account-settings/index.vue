<template lang="pug" src="./index.pug"></template> <style lang="stylus" scoped src="./index.styl"></style>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { State, namespace } from 'vuex-class'
import api from '@/api'
import _ from 'lodash'

const USER = namespace('user')
interface UBD {
  [key: string]: boolean
}

@Component
export default class AccountSettings extends Vue {
  @State timeZone
  @USER.State btnAuth
  /**
   * 需要授权的按钮
   * add: 新增管理员
   * reversal: 启用/停用
   * edit: 修改
   * delete: 删除
   */
  authorizedButtons: { [key: string]: number } = { add: 29, reversal: 30, edit: 31, delete: 32 }
  // 按钮权限集合
  unauthorizedBtnDic: UBD = {}
  $refs!: {
    editForm: any
  }
  form: any = {
    username: ''
  }
  roles: any[] = []
  columns: any[] = [
    { prop: 'username', name: '管理员账号' },
    { prop: 'truename', name: '姓名' },
    { prop: 'part', name: '部门' },
    { prop: 'job', name: '职位' },
    { prop: 'rolename', name: '管理员角色' },
    { name: '登录限制', click: this.showWhiteList, processor: row => (row.white_list === '' ? '无限制' : '<div class="blue pointer">白名单IP</div>') },
    { prop: 'expire_time', name: '账号有效期至' },
    { prop: 'loginip', name: '最近登录IP' },
    { prop: 'logintime', name: '最近登录时间' },
    { prop: 'status', name: '状态', processor: row => (row.status === 1 ? '<span class="green">启用</span>' : '<span class="red">停用</span>') }
  ]
  tableData: any[] = []
  page: number = 1
  sizes: number[] = [20, 50, 100, 200]
  size: number = 20
  total: number = 0
  dialog: any = {
    title: '新增管理员',
    visible: false,
    isEdit: false,
    isUpdatePwd: false,
    passwordIsChange: false,
    form: {
      admin_id: '',
      username: '',
      truename: '',
      password: '',
      password_confirmation: '',
      role: '',
      part: '',
      job: '',
      login_limit: 0,
      white_list: '',
      expire_time: '',
      status: 1
    },
    rules: {
      username: [
        { required: true, message: '请输入账号', trigger: ['blur', 'change'] },
        {
          validator: this.getStringRegExp(4),
          trigger: ['blur', 'change']
        }
      ],
      password: [
        { required: true, message: '请输入密码', trigger: ['blur', 'change'] },
        {
          validator: this.getStringRegExp(6),
          trigger: ['blur', 'change']
        }
      ],
      password_confirmation: [
        { required: true, message: '请再次输入密码', trigger: ['blur', 'change'] },
        {
          validator: (rule, value, callback) => (this.isPasswordConsistent ? callback() : callback(new Error('两次输入密码不一致'))),
          trigger: ['blur', 'change']
        },
        {
          validator: this.getStringRegExp(6),
          trigger: ['blur', 'change']
        }
      ],
      truename: [{ validator: this.getLenRegExp(20), trigger: ['blur', 'change'] }],
      part: [{ validator: this.getLenRegExp(20), trigger: ['blur', 'change'] }],
      job: [{ validator: this.getLenRegExp(20), trigger: ['blur', 'change'] }],
      login_limit: [{ required: true, message: '请选择！', trigger: 'blur' }],
      white_list: [{ validator: this.validWhiteList, trigger: ['blur', 'change'] }],
      expire_time: [{ required: true, message: '请选择账号有效期', trigger: 'blur' }, { validator: this.dateValidator, trigger: 'blur' }],
      role: [{ required: true, message: '请选择角色', trigger: ['blur', 'change'] }]
    }
  }
  isLoading: boolean = false
  mounted() {
    // 获取子页面按钮的权限
    this.$unauthorizedBtns(this.btnAuth, this.$route.path, this.authorizedButtons).then(data => this.unauthorizedBtnDic = data)
    this.getRoles()
    this.onQueryClick()
  }
  getRoles() {
    api.roleList({ page: 1, page_size: 100 }).then((res: any) => {
      if (res.code === 0) this.roles = res.data.list || []
    })
  }
  onQueryClick() {
    if (this.isLoading) return false
    this.isLoading = true
    api
      .getAdminList({
        ...this.form,
        page: this.page,
        page_size: this.size
      })
      .then((res: any) => {
        if (res.code === 0) {
          this.tableData = res.data.list || []
          this.page = res.data.pagination.page
          this.size = res.data.pagination.size
          this.total = res.data.pagination.total
        } else {
          this.tableData = []
          this.$message.error(res.msg)
        }
        this.isLoading = false
      })
      .catch(err => {
        this.isLoading = false
      })
  }
  onResetClick() {
    this.form.username = ''
    this.onQueryClick()
  }
  onAddClick() {
    this.dialog.title = '新增管理员'
    this.dialog.isEdit = false
    this.dialog.isUpdatePwd = false
    this.dialog.passwordIsChange = true
    this.dialog.form = {
      username: '',
      truename: '',
      password: '',
      password_confirmation: '',
      role: '',
      part: '',
      job: '',
      login_limit: 0,
      white_list: '',
      expire_time: ''
    }
    this.dialog.visible = true
  }
  onEditClick(row, isUpdatePwd = false) {
    this.dialog.title = isUpdatePwd ? '修改密码' : '编辑管理员'
    this.dialog.isEdit = true
    this.dialog.isUpdatePwd = isUpdatePwd
    this.dialog.passwordIsChange = false
    this.dialog.form = {
      type: isUpdatePwd ? 'password' : 'info',
      admin_id: row.id,
      status: row.status,
      username: row.username || '',
      truename: row.truename || '',
      password: isUpdatePwd ? '' : '666666',
      password_confirmation: isUpdatePwd ? '' : '666666',
      role: row.role || '',
      part: row.part || '',
      job: row.job || '',
      login_limit: row.white_list ? 1 : 0,
      white_list: row.white_list || '',
      expire_time: row.expire_time || ''
    }
    this.dialog.visible = true
  }
  onDeleteClick(row) {
    this.$confirm('是否确认删除？', '', { type: 'warning' }).then(() => {
      this.isLoading = true
      api
        .deleteAdmin({ admin_id: row.id })
        .then((res: any) => {
          this.isLoading = false
          if (res.code === 0) {
            this.onQueryClick()
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          this.isLoading = false
        })
    })
  }
  getStringRegExp(len) {
    return (rule, value, callback) => {
      return new RegExp(`^[\\da-zA-Z]{${len},16}$`).test(value) ? callback() : callback(new Error(`请输入${len}-16位数字和字母组合`))
    }
  }
  getLenRegExp(len) {
    return (rule, value, callback) => {
      return value.trim().length <= len ? callback() : callback(new Error(`不能超过${len}个字符`))
    }
  }
  validWhiteList(rule, value, callback) {
    const ip =
        '([1-9]|[1-9][0-9]|1\\d\\d|2[0-4]\\d|25[0-5])\\.' +
        '([1-9]|[1-9][0-9]|1\\d\\d|2[0-4]\\d|25[0-5])\\.' +
        '([1-9]|[1-9][0-9]|1\\d\\d|2[0-4]\\d|25[0-5])\\.' +
        '([1-9]|[1-9][0-9]|1\\d\\d|2[0-4]\\d|25[0-5])',
      reg = new RegExp(`^${ip}$`),
      ipList = this.dialog.form.white_list
        .split(',')
        .map(v => v.trim())
        .filter(v => v !== ''),
      legitimateIpList = ipList.filter(v => reg.test(v)), // 合法ip
      illegalIpList = ipList.filter(v => !reg.test(v)) // 非法ip
    if (!legitimateIpList.length && !illegalIpList.length) {
      callback(new Error('请输入白名单ip'))
    } else if (illegalIpList.length) {
      callback(new Error(`输入了非法ip: [ ${illegalIpList.join(' , ')} ]`))
    } else {
      callback()
    }
  }
  dateValidator(rule, value, callback) {
    if (new Date(value) < new Date(this.timeZone.value)) {
      callback(new Error('有效时间不可小于当前系统时间'))
    } else if (new Date(value) > new Date('2037-12-31 23:59:59')) {
      callback(new Error('有效时间需小于2038年01月01日'))
    } else {
      callback()
    }
  }
  passwordFocus() {
    if (!this.dialog.passwordIsChange) {
      this.dialog.form.password = ''
      this.dialog.form.password_confirmation = ''
      this.$nextTick(() => this.$refs.editForm.clearValidate(['password', 'password_confirmation']))
    }
  }
  passwordBlur() {
    if (this.dialog.form.password) {
      this.dialog.passwordIsChange = true
      if (this.dialog.form.password_confirmation) {
        this.$refs.editForm.validateField('password_confirmation')
      }
    } else if (!this.dialog.passwordIsChange) {
      this.dialog.form.password = this.dialog.isUpdatePwd ? '' : '666666'
      this.dialog.form.password_confirmation = this.dialog.isUpdatePwd ? '' : '666666'
      this.$nextTick(() => this.$refs.editForm.clearValidate(['password', 'password_confirmation']))
    }
  }
  passwordConfirmFocus() {
    if (!this.dialog.passwordIsChange) {
      this.dialog.form.password = ''
      this.dialog.form.password_confirmation = ''
    }
  }
  passwordConfirmBlur() {
    if (this.dialog.form.password_confirmation) {
      this.dialog.passwordIsChange = true
    } else if (!this.dialog.passwordIsChange) {
      this.dialog.form.password = this.dialog.isUpdatePwd ? '' : '666666'
      this.dialog.form.password_confirmation = this.dialog.isUpdatePwd ? '' : '666666'
      this.$nextTick(() => this.$refs.editForm.clearValidate(['password', 'password_confirmation']))
    }
  }
  @Watch('dialog.visible')
  resetEditForm() {
    if (this.dialog.visible) {
      this.$nextTick(() => {
        this.$refs.editForm.clearValidate()
      })
    }
  }
  onSaveClick() {
    const form = { ...this.dialog.form }
    this.$refs.editForm.validate(vaild => {
      if (vaild) {
        this.isLoading = true
        if (!this.dialog.passwordIsChange) {
          delete form.password
          delete form.password_confirmation
        }
        if (this.dialog.form.login_limit === 0) {
          form.white_list = ''
        } else {
          form.white_list = form.white_list
            .split(',')
            .map(v => v.trim())
            .filter(v => v !== '')
            .join(',')
        }
        delete form.login_limit
        ;(this.dialog.isEdit ? api.patchAdmin : api.putAdmin)(form)
          .then((res: any) => {
            this.isLoading = false
            if (res.code === 0) {
              this.dialog.visible = false
              this.onQueryClick()
            } else {
              this.$message.error(res.msg)
            }
          })
          .catch(err => {
            this.isLoading = false
          })
      }
    })
  }
  onStartClick(row) {
    if (new Date(row.expire_time) > new Date()) {
      this.$confirm('是否确认启用？', '', { type: 'warning' }).then(() => this.onEditStatus(row, 1))
    } else {
      this.$alert('该账号已到期，请修改有效期后再启用。', { type: 'warning' })
    }
  }
  onStopClick(row) {
    this.$confirm('是否确认停用？', '', { type: 'warning' }).then(() => this.onEditStatus(row, 0))
  }
  onEditStatus(row, status) {
    this.isLoading = true
    api
      .patchAdmin({
        type: 'status',
        admin_id: row.id,
        status
      })
      .then((res: any) => {
        this.isLoading = false
        if (res.code === 0) {
          this.onQueryClick()
        } else {
          this.$message.error(res.msg)
        }
      })
      .catch(err => {
        this.isLoading = false
      })
  }
  get isPasswordConsistent() {
    return this.dialog.form.password === this.dialog.form.password_confirmation
  }
  onPageSizeChange(size) {
    this.size = size
    this.page = 1
    this.onQueryClick()
  }
  onCurrentChange(page) {
    this.page = page
    this.onQueryClick()
  }
  showWhiteList(row) {
    row.white_list && this.$alert(`<div style="word-break: break-word;">${row.white_list}</div>`, { dangerouslyUseHTMLString: true })
  }
}
</script>
