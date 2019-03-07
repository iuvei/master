<template lang="pug" src="./index.pug"></template> <style scoped lang="stylus" src="./index.styl"></style>

<script lang="tsx">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { Form } from 'element-ui'
import api from '@/api'
import _ from 'lodash'
import router from '@/router'
import { namespace, State } from 'vuex-class'
import Upload from '@/components/upload/index.vue'
import { setTimeout } from 'timers'
const USER = namespace('user')

@Component({
  components: {
    Upload
  }
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
  authorizedButtons = { id_1: 64, id_2: 65, id_3: 66 }
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
    partner_id: '',
    game_id: '',
    game_name: ''
  }

  // 弹窗配置
  dialogform: any = {
    game_type: '',
    partner_id: '',
    name: '',
    game_id: '',
    game_url: '',
    img_h5_url: '',
    img_url: '',
    device: ''
  }
  dialogType: boolean = true //true:新增。false:编辑
  isDialogVisible: boolean = false
  isSaveLoading: boolean = false
  fileListH5: any[] = []
  fileListPc: any[] = []
  sizeTextH5: string = '246*246'
  sizeTextPc: string = '208*170'
  maxpic: number = 1

  allPcSize: any = []
  allH5Size: any = []

  // 弹窗表单验证
  rules = {
    game_type: [{ required: true, message: '请选择' }],
    partner_id: [{ required: true, message: '请选择' }],
    name: [{ required: true, message: '必填字段' }, { min: 2, max: 20, message: '2-20个字段' }],
    game_id: [{ required: true, message: '必填字段' }],
    device: [{ required: true, message: '请选择' }]
  }

  $refs!: {
    dialogForm: Form
  }

  // 查询选择列表
  deviceList: Object[] = [{ label: '不限制', value: '0' }, { label: 'PC', value: '1' }, { label: 'H5', value: '2' }]
  optionStatus: Object[] = [{ label: '全部', value: '' }, { label: '启动', value: '1' }, { label: '停止', value: '0' }]
  dialogStatus: Object[] = [{ label: '启动', value: '1' }, { label: '停止', value: '0' }]
  optionType: Object[] = [{ label: '电子', value: '1' }, { label: '棋牌', value: '6' }]
  allApilist: any = []
  modifiableApilist: any = []

  onQueryClick() {
    this.page = 1
    this.requestTable()
  }
  onResetClick() {
    this.form = {
      game_type: '1',
      partner_id: '',
      game_id: '',
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

  tableData: Object[] = []

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
        label: '游戏API',
        prop: 'partner_id',
        formatter: (row, column, value: string, index): string => {
          let t: any = _.find(this.allApilist, { id: Number(value) })
          return t ? t.partner_name : value.toString()
        }
      },
      {
        label: '游戏ID',
        prop: 'game_id'
      },
      {
        label: '游戏名称',
        prop: 'name'
      },
      {
        label: '游戏地址',
        prop: 'game_url'
      },
      {
        label: 'H5游戏入口图',
        width: 140,
        prop: 'img_h5_url',
        formatter: (row, column, value: any, index): string => {
          const h = this.$createElement
          return (
            <el-popover placement="right" width="200" trigger="click">
              <img class="img" src={value} />
              <div slot="reference">
                <img class="h5img" src={value} />
                <div class="size">{this.allH5Size[index]}</div>
              </div>
            </el-popover>
          )
        }
      },
      {
        label: 'PC游戏入口图',
        width: 140,
        prop: 'img_url',
        formatter: (row, column, value: any, index): string => {
          const h = this.$createElement
          return (
            <el-popover placement="right" width="200" trigger="click">
              <img class="img" src={value} />
              <div slot="reference">
                <img class="pcimg" src={value} />
                <div class="size">{this.allPcSize[index]}</div>
              </div>
            </el-popover>
          )
        }
      },
      {
        label: '游戏支持设备',
        prop: 'device',
        formatter: (row, column, value: string, index): string => {
          let t: any = _.find(this.deviceList, { value: String(value) })
          return t ? t.label : value.toString()
        }
      },
      {
        label: '操作人',
        prop: 'creator'
      },
      {
        label: '操作时间',
        prop: 'updated_at'
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
      .chessGameList(params)
      .then((response: any) => {
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
        this.$nextTick(() => {
          this.allPcSize = []
          this.allH5Size = []
          this.tableData.map((v, i) => {
            this.imgNaturalDimensions(i)
          })
        })
        this.isLoading = false
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
      .gameApi({ game_type: [1, 6] })
      .then((response: any) => {
        if (response.code === 0 && response.data) {
          this.allApilist = response.data
          response.data.map(item => {
            if (item.add_status) {
              this.modifiableApilist.push(item)
            }
          })
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
            label: item.partner_name,
            value: String(item.id)
          })
        }
      })
    }
    return arr
  }

  get addAPI() {
    let arr: any = []
    if (this.dialogform && this.dialogform.game_type) {
      this.modifiableApilist.map(item => {
        if (item.game_type == this.dialogform.game_type) {
          arr.push({
            label: item.partner_name,
            value: String(item.id)
          })
        }
      })
    }
    return arr
  }

  change() {
    this.form.partner_id = ''
  }
  changeType() {
    this.dialogform.partner_id = ''
  }

  addClick() {
    this.fileListH5 = []
    this.fileListPc = []
    this.dialogform = {
      game_type: '',
      partner_id: '',
      name: '',
      game_id: '',
      game_url: '',
      img_h5_url: '',
      img_url: '',
      device: ''
    }
    this.dialogType = true
    this.$nextTick(() => {
      this.isDialogVisible = true
    })
  }

  edit(row) {
    this.fileListH5 = []
    this.fileListPc = []
    this.dialogform = {
      game_type: String(row.game_type),
      partner_id: row.partner_name,
      name: row.name,
      game_id: row.game_id,
      game_url: row.game_url,
      img_h5_url: row.img_h5_url,
      img_url: row.img_url,
      device: row.device,
      id: row.id
    }
    if (row.img_h5_url && row.img_h5_url != '') {
      this.fileListH5 = [{ name: '', url: row.img_h5_url }]
    }
    if (row.img_url && row.img_url != '') {
      this.fileListPc = [{ name: '', url: row.img_url }]
    }
    this.dialogType = false
    this.isDialogVisible = true
  }

  onDialogSaveClick() {
    this.$refs.dialogForm.validate(valid => {
      if (valid) {
        if (this.dialogType) {
          this.addPreservation()
        } else {
          this.editPreservation()
        }
      }
    })
  }
  // 新增请求
  addPreservation() {
    this.isSaveLoading = true
    // 去除空字段
    let filter = _.pickBy(this.dialogform, value => {
      return value !== ''
    })
    api
      .addGame(filter)
      .then((res: any) => {
        if (res.code === 0 && res.data) {
          this.isSaveLoading = false
          this.isDialogVisible = false
          let title = this.dialogType ? '新增成功' : '编辑成功'
          this.$message.success(title)
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
  // 修改请求
  editPreservation() {
    this.isSaveLoading = true
    let params = {
      id: this.dialogform.id,
      name: this.dialogform.name,
      game_url: this.dialogform.game_url,
      img_h5_url: this.dialogform.img_h5_url,
      img_url: this.dialogform.img_url
    }
    // 去除空字段
    let filter = _.pickBy(params, value => {
      return value !== ''
    })
    api
      .editGame(filter)
      .then((res: any) => {
        if (res.code === 0 && res.data) {
          this.isSaveLoading = false
          this.isDialogVisible = false
          let title = this.dialogType ? '新增成功' : '编辑成功'
          this.$message.success(title)
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
    this.$confirm('删除后，本系统里将无此游戏，确定删除吗？', '提示')
      .then(() => {
        api.deleteGame({ id: row.id }).then((res: any) => {
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

  // 计算图片原始大小
  imgNaturalDimensions(index?) {
    setTimeout(() => {
      let nWidth, nHeight
      let pcimg: any = document.querySelectorAll('.pcimg')[index]
      let h5img: any = document.querySelectorAll('.h5img')[index]
      if (pcimg && pcimg.naturalWidth) {
        nWidth = pcimg.naturalWidth
        nHeight = pcimg.naturalHeight
        this.allPcSize.push(nWidth + '*' + nHeight)
      } else {
        this.allPcSize.push('')
      }
      if (h5img && h5img.naturalWidth) {
        this.allH5Size.push(h5img.naturalWidth + '*' + h5img.naturalHeight)
      } else {
        this.allH5Size.push('')
      }
    }, 1000)
  }

  onResetFields() {
    this.dialogform = {
      game_type: '',
      partner_id: '',
      name: '',
      game_id: '',
      game_url: '',
      img_h5_url: '',
      img_url: '',
      device: ''
    }
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
