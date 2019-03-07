<template lang="pug" src="./index.pug"></template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import api from '@/api'
import FormCommon from './../components/form-common/index.vue'
import TableCommon from './../components/table-common/index.vue'
import { namespace, State } from 'vuex-class'
const USER = namespace('user')

@Component({
  components: {
    FormCommon,
    TableCommon
  }
})
export default class TotalLog extends Vue {
  @USER.State btnAuth
  @USER.State roleId

  // add
  // delete
  // edit
  authorizedButtons: { [key: string]: number } = { add: 33, delete: 34, edit: 35 }
  unauthorizedBtnDic: UBD = {}

  /** 筛选框的配置表达配置项 */
  get filterItem() {
    return {
      btns: [
        {
          type: 'success',
          event: form => {
            this.dialogTitle = '新增管理员角色'
            this.customId = ''
            this.requestRoleAuthList('', true)
          },
          label: '新增管理员角色',
          isShow: true
        }
      ]
    }
  }

  /** isLoading */
  isLoading: boolean = false

  /** 分页控制器的问题 */
  paginationObj: PaginationState = {
    page: 1,
    sizes: [20, 50, 100, 200],
    size: 20,
    total: 0
  }

  /** 表格的数据源 */
  tableData: any = []

  /** 表格的配置项 */
  get tableHead() {
    return [
      {
        prop: 'role',
        align: 'center',
        label: '管理员角色',
        minWidth: '',
        type: 'text'
      },
      {
        prop: 'num',
        align: 'center',
        label: '人数',
        minWidth: '',
        type: 'text'
      },
      {
        prop: 'update_time',
        align: 'center',
        label: '修改时间',
        minWidth: '',
        type: 'text'
      },
      {
        prop: 'operator',
        align: 'center',
        label: '操作者',
        minWidth: '',
        type: 'text'
      },
      {
        prop: '',
        align: 'center',
        label: '操作',
        minWidth: '',
        type: 'button',
        btns: [
          {
            label: '编辑',
            event: obj => {
              this.dialogTitle = '编辑管理员角色'
              const { id } = obj
              this.customId = id
              // this.isNew = false
              this.requestRoleAuthList(id, true)
            },
            isShow: this.unauthorizedBtnDic['edit']
          },
          {
            label: '删除',
            hiddenProp: 'id',
            hiddenValue: [1, this.roleId],
            isShow: this.unauthorizedBtnDic['delete'],
            event: obj => {
              this.$confirm('是否确定将该管理角色删除?', '温馨提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
              })
                .then(() => {
                  const { id } = obj
                  api
                    .deleteRoleAuth({ id })
                    .then((res: any) => {
                      const { code, msg } = res
                      if (code === 0) {
                        this.$message.success('删除管理角色成功')
                        this.requestTable()
                      } else {
                        this.$message.error(msg)
                      }
                    })
                    .catch(err => {})
                })
                .catch(() => {})
            }
          }
        ]
      }
    ]
  }

  /** 弹框 */
  // 标题
  dialogTitle: string = ''
  // 显示或隐藏
  isDialogVisible: boolean = false
  // 表单对象
  dialogForm: any = {
    role: ''
  }

  // 操作（编辑或者删除）的id
  customId: any = ''

  // 标志点击新增还是操作的
  // false: 操作
  // true：新增
  isNew: boolean = true

  // 新增自定义权限
  customPermission: any = []
  customPermissionDefault: any = []

  // 编辑自定义权限
  editCustomPermission: any = []

  // 弹框的配置项
  get dialogItem() {
    let count = 0
    let tempMemberPermission = []
    let tempCustomPermission = []
    if (this.isNew) {
      tempCustomPermission = this.customPermission
    } else {
      tempCustomPermission = this.editCustomPermission
    }
    tempCustomPermission &&
      tempCustomPermission.map((obj: any) => {
        if (obj.model) {
          count++
        }
      })
    let tempLength = tempCustomPermission.length
    // 能否编辑
    const isEdit = this.customId === 1 || this.customId === this.roleId
    return {
      formItems: [
        {
          label: '角色名称',
          prop: 'role',
          placeholder: '请输入角色名称',
          type: 'input',
          disabled: isEdit ? true : false
        },
        {
          label: '自定义权限',
          prop: 'customPermission',
          type: 'fourCheckbox',
          options: tempCustomPermission,
          isAllSelect: count === tempLength,
          isAllIndeterminated: count > 0 && count < tempLength,
          disabled: isEdit ? true : false
        }
      ]
    }
  }
  dialogRules: any = {
    role: [
      {
        required: true,
        message: '请输入角色名称',
        trigger: ['blur']
      },
      {
        validator: this.valueLenth,
        trigger: ['blur', 'change']
      }
    ]
  }
  valueLenth(rule, value, callback) {
    if (!/^.{1,15}$/.test(value)) {
      callback(new Error('请输入1-15个字符'))
    } else {
      callback()
    }
  }
  $refs!: {}
  /** 生命周期 */
  mounted() {
    // 获取权限
    this.$unauthorizedBtns(this.btnAuth, this.$route.path, this.authorizedButtons).then(data => {
      this.unauthorizedBtnDic = data
      this.requestTable()
    })
  }

  /** 方法 */
  /** 请求列表数据 */
  requestTable() {
    this.isLoading = true
    const { size, page } = this.paginationObj
    api
      .roleList({ page_size: size, page })
      .then((res: any) => {
        const { code, data } = res
        if (code === 0) {
          this.isLoading = false
          const { list, pagination } = data
          this.tableData = list
          this.paginationObj = { ...this.paginationObj, ...pagination }
        }
      })
      .catch(err => {})
  }

  // 获取管理员角色的数据
  // role为空时是新建
  // role为有值时是编辑
  requestRoleAuthList(role?: any, isShowDialog?: boolean) {
    let params = {}
    if (role) {
      params['role'] = role
    }
    api
      .roleAuth(params)
      .then((res: any) => {
        const { code, data } = res
        if (code === 0) {
          const { routes, role } = data
          this.isNew = role ? false : true
          if (this.isNew) {
            this.customPermission = routes
            this.customPermissionDefault = [...routes]
          } else {
            this.dialogForm.role = role
            this.editCustomPermission = [...routes]
          }

          if (isShowDialog) {
            this.isDialogVisible = isShowDialog
          }
        }
      })
      .catch(err => {})
  }

  /** 关闭弹框事件 */
  onDialogClosed() {
    this.isDialogVisible = false
    this.$refs['formcommon'].resetFields()
    this.dialogForm.role = ''
    if (this.isNew) {
      this.customPermission = [...this.customPermissionDefault]
    }
  }

  // 新增和编辑角色的保存操作
  onDialogSaveClick() {
    this.$refs['formcommon'].$refs['form'].validate(valid => {
      if (valid) {
        const { dialogForm, customPermission, editCustomPermission, customId } = this
        let params = {}

        if (this.isNew) {
          params = {
            role: dialogForm.role,
            auth: customPermission
          }
        } else {
          params = {
            id: customId,
            role: dialogForm.role,
            auth: editCustomPermission
          }
        }
        this.editRoleAuth(params)
      } else {
        this.$nextTick(() => {
          document.getElementsByClassName('el-dialog__wrapper')[1].scrollTop = document.getElementsByClassName('is-error')[0].scrollTop
        })
      }
    })
  }

  // 编辑或者新增角色的请求
  editRoleAuth(obj) {
    api
      .editRoleAuth(obj)
      .then((res: any) => {
        const { code, msg } = res
        if (code === 0) {
          this.$message.success(`${this.isNew ? '新增' : '编辑'}角色管理`)
          this.requestTable()
          this.onDialogClosed()
        } else {
          this.$message.error(msg)
        }
      })
      .catch(err => {})
  }

  // 分页控制器
  changeSizeAndPage(obj) {
    this.paginationObj = { ...this.paginationObj, ...obj }
    this.requestTable()
  }
}

interface OptionsStatus {
  label: string
  value: string
}

interface PaginationState {
  page: number
  sizes: number[]
  size: number
  total: number
}
interface UBD {
  [key: string]: boolean
}
</script>

<style scoped>
.role .filter {
  justify-content: flex-end;
}
</style>
