<template lang="pug" src="./index.pug"></template> <style src="./index.styl"></style>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import api from '@/api'
import _ from 'lodash'
import { Form } from 'element-ui'
import Sortable from 'sortablejs'
@Component({
  components: {}
})
export default class extends Vue {
  $refs!: {
    firstForm: Form
    pcForm: Form
    customForm: Form
  }
  tableData: any = []
  form = {
    id: '',
    name: '',
    sort: ''
  }
  selectList = 1 //游戏大类id
  // 已选游戏
  tags: any = []
  addTags = [] //点击添加才添加到已选列表
  // 下拉列表、六大类
  apiList = [] //所有大类列表
  apiName = '电子'
  apiNameList: any = []
  allGameList: any = []
  secondApiList = [] //电竞竞猜的二级下拉框
  secondSelectList = {}
  gameList: any = [] //该大类的小类列表
  checkAll = false
  checklist: any = []
  isIndeterminate = true
  setGameList = [] //已选游戏id
  addList = {} //各个大类添加后的列表
  addFirst = false //新增一级导航按钮点击状态，（只有PC和PC电子导航栏才有）
  firstNavNumber = 0
  pcEdit = false //PC导航栏编辑按钮状态 （PC导航栏和其他两个编辑页的内容有一定差别）
  pcForm: any = {
    id: '',
    name: '',
    jump_switch: true,
    color: '',
    is_hot: true,
    is_display_icon: true,
    secondList: []
  }
  firstForm: any = {
    firstNavList: []
  }
  firstNavList: any = [] //动态添加二级导航列表
  secondList: any = [] //动态添加二级导航列表
  pcCascader = [] //pc导航栏级联选择器所需的拼接数据
  pcGameSelect: any = [] //级联选择器绑定的值
  games: any = {}
  // 当前厅主
  @Prop() hall!: string
  // 表格数据展示
  @Prop() tableHeadPc!: any
  @Prop() type!: any

  // 对话框状态
  dialogVisible = false
  addPcDialogVisible = false

  mounted() {
    this.$nextTick(() => {
      for (let i = 1; i <= 6; i++) {
        this.pickGame(i)
      }
      this.getNavigation()
      this.rowDrop()
    })
  }
  // 计算可拖拽行样式名
  tableRowClassName({ row, rowIndex }) {
    if (row.code === 'home' && this.type === 'pc') {
      return ''
    } else {
      return 'rowitem'
    }
  }
  //行拖拽
  rowDrop() {
    const tbody = document.querySelector('.el-table__body-wrapper tbody')
    Sortable.create(tbody, {
      animation: 180,
      delay: 0,
      draggable: '.rowitem',
      onEnd: ({ newIndex, oldIndex }) => {
        let nIndex = newIndex
        let oIndex = oldIndex
        if (this.type === 'pc') {
          nIndex += 1
          oIndex += 1
        }
        const currRow = this.tableData.splice(oIndex, 1)[0]
        this.tableData.splice(nIndex, 0, currRow)
      }
    })
  }
  // 获取表格内容
  getNavigation() {
    let params = { hall_id: this.hall }
    if (this.type == 'pcEle') {
      params = _.assign(params, { type: 3 }) //PC端电子导航栏表格数据
    } else if (this.type == 'pc') {
      params = _.assign(params, { type: 1 }) //PC端电子导航栏表格数据
    }
    api.getNavigation(params).then((res: any) => {
      if (res.data && res.data.length) {
        this.firstNavNumber = res.data.length
        this.tableData = _.sortBy(res.data, ['sort'])
        this.tableData.map((item: any, index: number) => {
          item.sort = index + 1
        })
      }
    })
  }
  /**
   *   编辑按钮事件
   */
  doEdit(row) {
    if (this.type == 'pc') {
      this.changeList()
      this.pcEdit = true
      this.pcForm.id = row.id //编辑的大类的id(接口返回的id为准)
      this.pcForm.name = row.name
      this.pcForm.color = row.color
      this.pcForm.is_hot = row.is_hot
      this.pcForm.is_display_icon = row.is_display_icon
      this.doQuerySecond(row.id)
    } else {
      this.form.id = row.id //编辑的大类的id(接口返回的id为准)
      this.form.name = row.name
      api.setApiInfo({ id: row.id, hall_id: this.hall }).then((res: any) => {
        if (res.code == 0 && res.data) {
          this.tags = []
          res.data.list.map(item => {
            this.tags.push({
              game_name: item.game_name,
              game_type: item.game_type,
              game_id: item.game_id,
              partner_id: item.partner_id,
              id: item.id
            })
          })
        } else {
          this.tags = []
        }
        this.apiNameList = this.allGameList.filter(v => this.tags.some(tag => v.id == tag.game_id && v.game_type == tag.game_type))
        this.getGame(params)
      })
    }
    this.dialogVisible = true
    let params = { hall_id: this.hall }
    //获取对应游戏api大类
  }
  /**
   *   获取游戏大类 接口
   */
  getGame(params) {
    api.gameNavigation(params).then((res: any) => {
      if (res.code == 0 && res.data) {
        if (this.type == 'pc') {
          let list = res.data.category
          list.map((v: any) => {
            v.children = this.games[v.value]
          })
          this.pcCascader = list //数据拼接   pc导航栏使用
        } else {
          this.apiList = res.data.category //全部游戏大类
          this.secondApiList = res.data.childcategory //全部游戏大类
          this.gameList = [] //默认游戏小类列表
          if (res.data.gamelist) {
            res.data.gamelist.map(item => {
              item.typeID = item.game_type + '-' + item.partner_id
              this.gameList.push(item)
            })
          }
          this.checklist = []
          this.tags.map(item => {
            this.gameList.map(key => {
              if (item.partner_id == key.partner_id && item.game_type == key.game_type) {
                this.checklist.push(item.game_type + '-' + item.partner_id)
              }
            })
          })
          this.checkAll = this.gameList.length == this.checklist.length
          this.isIndeterminate = this.checklist.length > 0 && this.checklist.length < this.gameList.length
        }
      }
    })
  }

  /**
   *   数据拼接   pc导航栏使用
   */
  pickGame(type) {
    let params = { hall_id: this.hall, type: type }
    api.gameNavigation(params).then((res: any) => {
      if (res.code == 0 && res.data) {
        let arr = res.data.gamelist //默认游戏小类列表
        this.allGameList.push(...arr)
        arr.map((v: any) => {
          v.value = v.id
          v.label = type === 4 ? v.game_name : v.show_name
        })
        if (type === 4) {
          let data = res.data.childcategory || [] //全部游戏大类
          if (data[0]) {
            data[0].children = res.data.gamelist || '' //默认游戏小类列表
          }
          this.$set(this.games, type, data)
        } else {
          this.$set(this.games, type, arr)
        }
      }
    })
  }

  /**
   *   改变游戏大类function
   */
  changeList() {
    switch (this.selectList) {
      case 1:
        this.apiName = '电子'
        break
      case 2:
        this.apiName = '视讯'
        break
      case 3:
        this.apiName = '体育'
        break
      case 4:
        this.apiName = ''
        break
      case 5:
        this.apiName = '彩票'
        break
      case 6:
        this.apiName = '棋牌'
        break
    }

    this.checklist = []
    let params = { hall_id: this.hall, type: this.selectList }
    this.getGame(params)
    this.checkAll = false
    if (this.pcEdit) {
      this.addApi()
    }
  }
  /**
   *   添加游戏大类，并把已经选择的游戏放到已选列表里
   */
  addApi() {
    // 被选择的值
    let activeTag: any = []
    this.tags = []
    this.checklist.map(key => {
      this.gameList.map(item => {
        if (item.typeID == key) {
          activeTag.push(item)
        }
      })
    })
    // 筛选掉已选择的标签
    this.apiNameList.map(key => {
      activeTag.map((item, index) => {
        if (key.game_type + '-' + key.partner_id == item.typeID) {
          activeTag.splice(index, 1)
        }
      })
    })
    this.apiNameList = this.apiNameList.concat(activeTag)
    this.tags = this.apiNameList
  }
  /**移除已选择的游戏 事件 */
  removeSelect(tag) {
    this.checklist = []
    this.tags = []
    this.apiNameList.map((item, index) => {
      if (item.partner_id == tag.partner_id && item.game_type == tag.game_type) {
        this.apiNameList.splice(index, 1)
      }
    })
    this.tags = this.apiNameList
    this.tags.map((item, index) => {
      this.checklist.push(item.game_type + '-' + item.partner_id)
    })
  }
  /**筛选出选择游戏的对应id */
  filterId(list, tag) {
    let s = []
    for (let x of list) {
      tag.filter((v: any) => {
        if (v == x.partner_name) {
          s = s.concat(x.id) //筛选出选择游戏的对应id,保存的时候传给后台
        }
      })
    }
    return s
  }
  /**筛选出选择游戏的对应id和api名称 */
  filterName(list, tag) {
    let s: any = []
    tag.filter((v: any) => {
      for (let x in list) {
        if (v == list[x].partner_name) {
          s.push({ id: list[x].id, partner_name: list[x].partner_name })
        }
      }
    })
    return s
  }
  /**
   *   全选
   */
  handleCheckAllChange(val) {
    this.checklist = []
    if (val) {
      this.gameList.map(item => {
        this.checklist.push(item.game_type + '-' + item.partner_id)
      })
    }
    this.addTags = this.checklist
    this.isIndeterminate = false
  }
  /**
   *   选择游戏
   */
  handleCheckedGamesChange(val) {
    this.addTags = val
    let checkedCount = val.length
    this.checkAll = checkedCount === this.gameList.length
    this.isIndeterminate = checkedCount > 0 && checkedCount < this.gameList.length
  }
  /**PC端导航栏最后选择的数据需要处理 */
  h5gameFilter(api) {
    let arr = []
    let arr2 = []
    this.tags = []
    arr = arr.concat(
      api.map((v: any) => {
        return v.id
      })
    )
    arr = Array.from(new Set(arr))
    this.allGameList.map((v: any) => {
      arr.map((i: any) => {
        if (v.id == i) {
          arr2 = arr2.concat(v)
          this.tags = this.tags.concat(v.partner_name) //tag标签显示的内容
        }
      })
    })
    if (arr2 && arr2.length) {
      let list = {}
      let a1 = []
      let a2 = []
      let a3 = []
      let a4 = []
      let a5 = []
      let a6 = []
      arr2.map((v: any) => {
        if (v.game_type == 1) {
          a1 = a1.concat(v.id)
          list = _.assign(list, { '1': a1.join(',') })
        }
        if (v.game_type == 2) {
          a2 = a2.concat(v.id)
          list = _.assign(list, { '2': a2.join(',') })
        }
        if (v.game_type == 3) {
          a3 = a3.concat(v.id)
          list = _.assign(list, { '3': a3.join(',') })
        }
        if (v.game_type == 4) {
          a4 = a4.concat(v.id)
          list = _.assign(list, { '4': a4.join(',') })
        }
        if (v.game_type == 5) {
          a5 = a5.concat(v.id)
          list = _.assign(list, { '5': a5.join(',') })
        }
        if (v.game_type == 6) {
          a6 = a6.concat(v.id)
          list = _.assign(list, { '6': a6.join(',') })
        }
      })
      this.addList = list
    }
  }
  /**PC端导航栏最后选择的数据需要处理 */
  pcgameFilter(select) {
    if (select && select.length) {
      let list
      let category = select[0]
      switch (category) {
        case 1:
          list = {
            '1': select.join(',').substr(2)
          }
          break
        case 2:
          list = {
            '2': select.join(',').substr(2)
          }
          break
        case 3:
          list = {
            '3': select.join(',').substr(2)
          }
          break
        case 4:
          list = {
            '4': select.join(',').substr(4)
          }
          break
        case 5:
          list = {
            '5': select.join(',').substr(2)
          }
          break
        case 6:
          list = {
            '6': select.join(',').substr(2)
          }
          break
      }
      return list
    }
  }
  /**
   *   获取编辑一级导航下的二级导航
   */
  doQuerySecond(id) {
    let params = { hall_id: this.hall, id: id }
    api.setApiInfo(params).then((res: any) => {
      if (res.code == 0 && res.data) {
        this.pcForm.jump_switch = res.data.jump_switch
        this.pcGameSelect = []
        this.secondList = []
        if (res.data.list && res.data.list.length) {
          //编辑当前一级导航的对应api      （可以只选大类）
          if (res.data.list[0].game_type == 4) {
            this.pcGameSelect = [res.data.list[0].game_type, 1, res.data.list[0].game_id]
          } else {
            this.pcGameSelect = [res.data.list[0].game_type, res.data.list[0].game_id]
          }
        }
        if (res.data.child_menu && res.data.child_menu.length) {
          res.data.child_menu.map((v: any) => {
            //编辑当前一级导航下对应的二级导航对应api（必须选择小类）
            if (v.game_type == 4) {
              this.secondList.push({ name: v.name, list: [v.game_type, 1, v.game_id] })
              this.pcForm.secondList = this.secondList
            } else {
              this.secondList.push({ name: v.name, list: [v.game_type, v.game_id] })
              this.pcForm.secondList = this.secondList
            }
          })
        }
      }
    })
  }
  /**删除新增的二级导航 */
  deleteSecondList(index) {
    this.pcForm.secondList.splice(index, 1)
  }
  /**
   *   保存最后的选择，最后的选择
   */
  doSave() {
    if (!this.addList && !Object.keys(this.addList).length && !this.pcEdit) {
      this.$message.error('您没有将已选择的游戏添加到已选列表')
      return
    }
    if (this.addFirst) {
      //添加一级导航的保存事件
      this.$refs['customForm'].validate(valid => {
        if (valid) {
          if (this.form.name == '') {
            this.$message.error('游戏大类名称不能为空')
          } else {
            const list = [{}, ...this.apiNameList].reduce((p, c) => {
              if (p[c.game_type]) {
                p[c.game_type] += `,${c.id}`
              } else {
                p[c.game_type] = `${c.id}`
              }
              return p
            })
            if (!Object.keys(list).length) {
              this.$message.error('您没有添加游戏')
            } else {
              this.form.sort = this.tableData.length + 1
              let addParams = _.assign({ hall_id: this.hall }, this.form, { list })
              this.addGame(addParams)
            }
          }
        }
      })
    } else if (this.pcEdit) {
      this.$refs['pcForm'].validate(valid => {
        if (valid) {
          this.addList = this.pcgameFilter(this.pcGameSelect) //一级导航选择的游戏api
          let secondNav: any = []

          if (this.pcForm.secondList && this.pcForm.secondList.length) {
            this.pcForm.secondList.map((v: any) => {
              secondNav = secondNav.concat({ name: v.name, list: this.pcgameFilter(v.list) }) //二级导航选择的游戏api
            })
          }
          let params = _.assign({ hall_id: this.hall }, this.pcForm, { list: this.addList }, { child: secondNav })
          this.editgame(params)
        }
      })
      return
    } else {
      if (!this.apiNameList.length) {
        this.$message.error('您没有将已选择的游戏添加到已选列表')
        return false
      }
      const list = [{}, ...this.apiNameList].reduce((p, c) => {
        if (p[c.game_type]) {
          p[c.game_type] += `,${c.id}`
        } else {
          p[c.game_type] = `${c.id}`
        }
        return p
      })
      let params = {
        hall_id: this.hall,
        id: this.form.id,
        name: this.form.name,
        list
      }
      this.setGame(params)
    }
  }
  /** 预览并保存 事件 */
  doLook() {
    this.$message.error('该功能正在开发中呢！')
  }
  /**保存按钮 新增一级导航的接口 */
  addGame(params) {
    api
      .addNavigation(params)
      .then((res: any) => {
        if (res.code == 0) {
          this.$message.success('保存成功！')
          this.getNavigation()
          this.handleClose()
          this.resetForm()
        } else {
          this.$message.error(res.msg)
        }
      })
      .catch(error => {})
  }
  /**保存按钮 编辑一级导航的接口 */
  editgame(params) {
    if (!params.color) {
      params.color = '#000000'
    }
    api.editNavigation(params).then((res: any) => {
      if (res.code == 0) {
        this.$message.success('保存成功！')
        this.getNavigation()
        this.handleClose()
        this.resetForm()
      } else {
        this.$message.error(res.msg)
      }
    })
  }
  /**保存按钮 请求的接口(H5端) */
  setGame(params) {
    api
      .saveNavigation(params)
      .then((res: any) => {
        if (res.code == 0) {
          this.$message.success('保存成功！')
          this.getNavigation()
          this.handleClose()
          this.resetForm()
        } else {
          this.$message.error(res.msg)
        }
      })
      .catch(error => {})
  }
  /**删除按钮 请求的接口(PC端) */
  deleteNavigation(params) {
    api
      .deleteNavigation(params)
      .then((res: any) => {
        if (res.code == 0) {
          this.$message.success('删除成功！')
          this.getNavigation()
        } else {
          this.$message.error(res.msg)
        }
      })
      .catch(error => {})
  }
  /**H5端保存排序、前端是否显示这些修改 */
  saveChange(type, list?: any) {
    let params = {
      hall_id: this.hall,
      list: list || this.tableData
    }
    // 重新排序
    if (!list) {
      this.tableData.map((item: any, index) => {
        item.sort = index + 1
      })
    }
    if (type === 'pc') {
      let list = this.tableData.filter((v: any) => v.is_display)
      if (list.length > 10) this.$message.error('pc前端显示数量不超过10个')
    }
    api.settingNavigation(params).then((res: any) => {
      if (res.code == 0) {
        this.$message.success('保存成功！')
        this.getNavigation()
      } else {
        this.$message.error(res.msg)
      }
    })
  }
  /**新增一级导航 事件 */
  addNavigation() {
    let num = this.type === 'pc' ? 15 : 10
    if (this.firstNavNumber < num) {
      let params = { hall_id: this.hall }
      this.getGame(params) //获取对应游戏api大类
      if (this.type == 'pc') {
        this.addPcDialogVisible = true
        this.firstNavList = []
        this.firstNavList.push({ name: '', list: [], jump_switch: true, color: '', is_hot: true, sort: '' })
        this.$set(this.firstForm, 'firstNavList', this.firstNavList)
      } else {
        this.addFirst = true
        this.dialogVisible = true
      }
    } else {
      this.$message.error(`一级导航栏最多添加${num}个！`)
    }
  }
  addFirstNav() {
    let leng = this.firstNavList.length + this.firstNavNumber
    if (leng < 15) {
      this.firstNavList.push({ name: '', list: [], jump_switch: true, color: '', is_hot: true, sort: '' })
      this.$set(this.firstForm, 'firstNavList', this.firstNavList)
    } else {
      this.$message.error('一级导航栏最多添加15个！')
    }
  }
  deleteFirstNav(index) {
    this.firstNavList.splice(index, 1)
    this.$set(this.firstForm, 'firstNavList', this.firstNavList)
  }
  /**新增二级导航 事件 */
  addSecondNav() {
    this.pcForm.secondList.push({ name: '', list: [] })
  }
  saveFirstNav() {
    this.$refs['firstForm'].validate(valid => {
      if (valid) {
        const listArray = JSON.parse(JSON.stringify(this.firstNavList))
        if (this.firstNavList && this.firstNavList.length) {
          listArray.map((v: any, index: number) => {
            v.list = this.pcgameFilter(v.list)
            v.sort = this.tableData.length + index + 1
          })
        }
        let params = { hall_id: this.hall, list: listArray }
        api.pcNavigation(params).then((res: any) => {
          if (res.code == 0) {
            this.$message.success('保存成功！')
            this.getNavigation()
            this.addPcDialogVisible = false
          } else {
            this.$message.error(res.msg)
          }
        })
      }
    })
  }
  /**PC端和PC端电子导航栏删除按钮事件 */
  doDelete(n, i) {
    let params = { hall_id: this.hall, ids: i }
    this.$confirm(`确认要删除${n}一级导航内容吗？`, '提示', {
      type: 'warning'
    })
      .then(() => {
        this.deleteNavigation(params)
      })
      .catch(() => {})
  }
  /**[表格] 开关切换 hot标识/前端显示 */
  statusChange(val, row, prop) {
    const oldVal = val ? false : true
    row[prop] = oldVal
    if (val) {
      if (this.type === 'pc' && prop === 'is_display') {
        let list = this.tableData.filter((v: any) => v.is_display)
        if (list.length > 10) {
          this.$message.error('pc前端显示数量不超过10个')
          return
        }
      }
    }
    const message = val ? '开启' : '关闭'
    this.$confirm(`确认${message}？`, '提示', {
      type: 'warning'
    })
      .then(() => {
        row[prop] = val
        let params = {
          hall_id: row.hall_id,
          list: [row]
        }
        api
          .settingNavigation(params)
          .then((res: any) => {
            if (res.code == 0) {
              this.$message.success('保存成功！')
              this.getNavigation()
            } else {
              row[prop] = oldVal
              this.$message.error(res.msg)
            }
          })
          .catch(res => {
            row[prop] = oldVal
            this.$message.error(res.msg)
          })
      })
      .catch(() => {})
  }

  /**关闭对话框 */
  handleClose() {
    this.addPcDialogVisible = false
    this.dialogVisible = false
    this.addFirst = false
    this.pcEdit = false
    this.resetForm()
  }

  /**重置对话框中的表单 */
  resetForm() {
    this.pcForm = {
      id: '',
      name: '',
      jump_switch: true,
      color: '',
      is_hot: true,
      is_display_icon: true,
      secondList: []
    }
    this.form = {
      id: '',
      name: '',
      sort: ''
    }
    this.secondList = []
    this.selectList = 1
    this.checkAll = false
    this.checklist = []
    this.addTags = []
    this.tags = []
    this.apiNameList = []
    this.firstNavList = []
  }
  // 新增一级导航唯一校验
  validateFirstNav(rule, value, callback) {
    if (value) {
      if (value.length < 2 || value.length > 5) {
        callback(new Error('长度在2到5个字符'))
      } else if (this.tableData.filter((v: any) => v.name === value).length || this.firstNavList.filter((v: any) => v.name === value).length > 1) {
        callback(new Error('名字重复'))
      } else {
        callback()
      }
    }
  }
  // 编辑一级导航唯一校验
  validateEditNav(rule, value, callback, id) {
    const others = this.tableData.filter((v: any) => v.id !== id)
    if (value) {
      if (value.length < 2 || value.length > 5) {
        callback(new Error('长度在2到5个字符'))
      } else if (others.length && _.find(others, ['name', value])) {
        callback(new Error('名字重复'))
      } else {
        callback()
      }
    }
  }
  // 新增游戏种类一级导航唯一校验
  validateTagName(rule, value, callback) {
    if (value) {
      if (value.length < 2 || value.length > 10) {
        callback(new Error('长度在2到10个字符'))
      } else if (this.tableData.filter((v: any) => v.name === value).length) {
        callback(new Error('名字重复'))
      } else {
        callback()
      }
    }
  }
}
</script>
