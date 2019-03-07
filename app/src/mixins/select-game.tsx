import { Component, Vue } from 'vue-property-decorator'
import api from '@/api'
import _ from 'lodash'

@Component
export default class SelectGame extends Vue {
  gameTypeParents: any[] = [
    { type: 0, name: '全部', checked: true, isIndeterminate: false },
    { type: 1, name: '电子', checked: true, isIndeterminate: false },
    { type: 2, name: '视讯', checked: true, isIndeterminate: false },
    { type: 3, name: '体育', checked: true, isIndeterminate: false },
    { type: 4, name: '电竞', checked: true, isIndeterminate: false },
    { type: 5, name: '彩票', checked: true, isIndeterminate: false },
    { type: 6, name: '棋牌', checked: true, isIndeterminate: false }
  ]
  checkAll: boolean = true
  isIndeterminate: boolean = false
  gammeTypeParentActive: any[] = [1, 2, 3, 4, 5, 6]
  gameTypes: any[] = []
  gameTypeActive: any[] = []
  /** 给所有api进行排序 */
  sortGameTypes(data = []) {
    let _data: any[] = []
    this.gameTypeParents.map(({ type, name }) => {
      let types: any[] = _.filter(data, { game_type: type })
      const sort = types.map(v => v.partner_name).sort()
      types.sort((a, b) => sort.indexOf(a.partner_name) - sort.indexOf(b.partner_name))
      types.map(v => {
        _data.push({ ...v, game_name: v.show_name, index: _data.length })
      })
    })
    return _data
  }

  getGameTypes() {
    return api.getHallGameType().then((res: any) => {
      if (res.code === 0 && res.data) {
        this.gameTypes = this.sortGameTypes(res.data || [])
      }
      const { game } = this.$route.query
      if (game && this.gameTypes.some(v => v.partner_name === game)) {
        const gameType = this.gameTypes.find(v => v.partner_name === game),
          gameTypeParent = this.gameTypeParents.find(parent => parent.type === gameType.game_type),
          hasBrother = this.gameTypes.filter(v => v.game_type === gameTypeParent.type && v.partner_name !== game).length > 0
        this.gameTypeParents.map(parent => {
          if (parent.type !== gameTypeParent.type) {
            parent.checked = false
            parent.isIndeterminate = false
          } else {
            parent.checked = true
            parent.isIndeterminate = hasBrother
          }
        })
        this.gammeTypeParentActive = [gameTypeParent.type]
        this.gameTypeActive = [gameType.index]
      } else if (this.gameTypes.length) {
        this.gameTypeActive = this.gameTypes.map(v => v.index)
      }
    })
  }
  handleCheckAllChange(item, val) {
    if (item.type === 0) {
      this.gameTypeParents = this.gameTypeParents.map(v => ({ ...v, checked: val, isIndeterminate: false }))
      this.gameTypeActive = val ? this.gameTypes.map(v => v.index) : []
    } else {
      let gameTypes = this.gameTypes.filter(v => (v.game_type === item.type ? val : this.gameTypeActive.indexOf(v.index) !== -1))
      let gameTypeActive = gameTypes.map(v => v.index)
      this.gameTypeActive = gameTypeActive
      this.$set(item, 'isIndeterminate', false)
      this.setTypeAll()
    }
  }
  checkGameType(value) {
    const parents = this.gameTypeParents.filter(parent => parent.type !== 0) // 六项父类
    parents.map(parent => {
      // 找出该父类下的子类
      const children = this.gameTypes.filter(item => item.game_type === parent.type)
      // 若该父类存在子类，则关联选择的状态
      if (children.length) {
        // 取交集，得出已选择的子类
        const selectLength = _.intersection(value, children.map(c => c.index)).length
        this.$set(parent, 'checked', !!selectLength)
        this.$set(parent, 'isIndeterminate', !!selectLength && selectLength !== children.length)
      }
    })
    this.setTypeAll()
  }
  setTypeAll() {
    const grandparent = this.gameTypeParents.filter(parent => parent.type === 0)[0], // 全部
      parents = this.gameTypeParents.filter(parent => parent.type !== 0) // 六项父类
    // 若存在全部选项
    if (grandparent) {
      this.$set(grandparent, 'checked', parents.every(v => v.checked))
      if (parents.every(v => v.checked) && parents.every(v => !v.isIndeterminate)) {
        this.$set(grandparent, 'isIndeterminate', false)
      } else if (parents.every(v => !v.checked) && parents.every(v => !v.isIndeterminate)) {
        this.$set(grandparent, 'isIndeterminate', false)
      } else {
        this.$set(grandparent, 'isIndeterminate', true)
      }
    }
  }
}
