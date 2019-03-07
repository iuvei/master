<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="tsx">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { Form } from 'element-ui'
import api from '@/api'
import _ from 'lodash'
import { namespace } from 'vuex-class'
const USER = namespace('user')

@Component({
  components: {}
})
export default class ApiSetting extends Vue {
  @USER.State btnAuth
  @Prop(Object) permissions: any
  /**
   * 4.编辑标签
   * 5.新增标签
   * 6.删除标签
   */
  authorizedButtons = { id_4: 23, id_5: 38, id_6: 39 }
  /** 根据登录时返回的权限信息控制按钮的显示和隐藏 */
  get unauthorizedBtnDic() {
    return _.mapValues(this.authorizedButtons, val => {
      return !!this.permissions[val]
    })
  }
  isLoading: Boolean = false
  tableData: any = []
  allTag: any = []

  sizes: number[] = [20, 50, 100, 200]
  page: number = 1
  size: number = 20
  total: number = 0

  form = {
    game_type: '1'
  }

  dialogform: any = {
    id: '',
    name: '',
    game_type: ''
  }
  isSaveLoading: boolean = false
  isDialogVisible: boolean = false
  dialogadd: any = {
    name: '',
    towlevel: '',
    onelevel: '',
    game_type: ''
  }
  visiblea: boolean = false
  isSaveAdd: boolean = false
  level: string = 'one-level'

  $refs!: {
    dialogForm: Form
    dialogadd: Form
  }
  optionType: Object[] = [
    // { label: '全部', value: '' },
    { label: '电子', value: '1' },
    // { label: '视讯', value: '2' },
    // { label: '体育', value: '3' },
    // { label: '电竞', value: '4' },
    // { label: '彩票', value: '5' },
    { label: '棋牌', value: '6' }
  ]

  get tableHead() {
    return [
      // {
      //   label: '序号',
      //   prop: 'id'
      // },
      {
        label: '一级标签',
        prop: 'label1'
      },
      {
        label: '二级标签',
        prop: 'label2'
      },
      {
        label: '游戏总数',
        prop: 'num'
      }
    ]
  }

  mounted() {
    this.requestTable()
  }

  getAllTag() {
    this.allTag = []
    api
      .getTagList({ game_type: this.dialogadd.game_type })
      .then((response: any) => {
        if (response.code === 0) {
          response.data.map(key => {
            if (!key.is_default) {
              this.allTag.push(key)
            }
          })
        } else {
          this.allTag = []
        }
      })
      .catch(error => {})
  }

  requestTable() {
    this.isLoading = true
    this.tableData = []
    api
      .getTagList({ game_type: this.form.game_type })
      .then((response: any) => {
        this.isLoading = false

        if (response.code === 0) {
          // this.allTag = response.data
          response.data.map(item => {
            this.tableData.push({
              id: item.id,
              label1: item.name,
              num: item.num,
              game_type: item.game_type,
              is_default: item.is_default
            })
            if (item.child && item.child.length > 0) {
              item.child.map(key => {
                this.tableData.push({
                  id: key.id,
                  label2: key.name,
                  num: key.num,
                  game_type: key.game_type,
                  is_default: key.is_default
                })
              })
            }
          })
        } else {
          this.tableData = []
        }
      })
      .catch(error => {
        this.isLoading = false
      })
  }

  change() {
    this.requestTable()
  }

  onDialogSaveClick() {
    this.isSaveLoading = true
    api
      .postTagList(this.dialogform)
      .then((response: any) => {
        if (response.code === 0) {
          this.$message.success('保存成功！')
          this.requestTable()
          this.isSaveLoading = false
          this.isDialogVisible = false
        } else {
          this.isSaveLoading = false
          this.$message.error(response.msg)
        }
      })
      .catch(error => {
        this.isSaveLoading = false
      })
  }

  edit(row) {
    this.dialogform.id = row.id
    this.dialogform.game_type = String(row.game_type)
    this.dialogform.name = row.label1 || row.label2
    this.isDialogVisible = true
  }
  onDialogEdit(formName) {
    this.$refs[formName].validate(valid => {
      if (valid && formName == 'dialogForm') {
        this.onDialogSaveClick()
      }
      if (valid && formName == 'dialogadd') {
        this.onDialogAddClick()
      }
    })
  }

  delect(row) {
    let text: string = ''
    if (typeof row.label1 == 'undefined') {
      text = row.label2
    } else {
      text = row.label1
    }
    this.$confirm('确认删除' + text + '吗？', '提示')
      .then(() => {
        api.delectTagList({ id: row.id }).then((res: any) => {
          if (res.code === 0 && res.data) {
            this.$message.success('删除成功')
            this.requestTable()
          } else {
            this.$message.error(res.msg)
          }
        })
      })
      .catch(_ => {})
  }

  onAddClick() {
    this.level = 'one-level'
    this.dialogadd = {
      name: '',
      towlevel: '',
      onelevel: ''
    }
    this.visiblea = true
  }

  onDialogAddClick() {
    let data: any = {}
    if (this.level == 'one-level') {
      data.name = this.dialogadd.name
      data.pid = 0
    } else if (this.level == 'tow-level') {
      data.pid = this.dialogadd.onelevel
      data.name = this.dialogadd.towlevel
    }
    data.game_type = this.dialogadd.game_type
    api.putTagList(data).then((res: any) => {
      if (res.code === 0 && res.data) {
        this.$message.success('新增标签成功')
        this.requestTable()
        this.visiblea = false
      } else {
        this.$message.error(res.msg)
      }
    })
  }

  changeType() {
    if (this.level == 'tow-level') {
      this.dialogadd.onelevel = ''
      this.getAllTag()
    }
  }

  onResetFields() {
    this.$refs.dialogadd.resetFields()
    this.visiblea = false
  }
}
</script>
