<template lang="pug" src="./index.pug"></template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import SelectAll from '../select-all/index.vue'
import api from '@/api'
@Component({
  components: {
    SelectAll
  }
})
export default class Games extends Vue {
  @Prop() hall_id!: any
  dialogVisible: boolean = false
  gameObject: any = {}
  games = {}
  mounted() {
    this.requestGamesList()
  }
  /** 获取游戏列表 */

  requestGamesList() {
    api.gamesList().then((res: any) => {
      if (res.code === 0 && res.data) {
        this.gameObject = res.data
      } else {
        this.$message.error(res.msg)
      }
    })
  }
  /**[get] 游戏开关List */
  requestGameOffList() {
    let params = {
      hall_id: this.hall_id
    }
    api.getGameOffList(params).then((res: any) => {
      if (res.code === 0) {
        let data = res.data
        this.games = {}
        for (let k in data) {
          let arr: string[] = []
          data[k] &&
            data[k].map((v: any) => {
              arr.push(`${v.game_type}_${v.partner_id}`)
            })
          this.$set(this.games, k, arr)
        }
        this.dialogVisible = true
      }
    })
  }
  /**[set] 游戏开关 */
  requestGameOff(params) {
    api.setGameOff(params).then((res: any) => {
      if (res.code === 0) {
        this.$message.success('游戏设置成功')
        this.dialogVisible = false
        const parent: any = this.$parent
        parent && parent.requestTable()
      } else {
        this.$message.error(res.msg)
      }
    })
  }
  submit() {
    let params = {
      game: [],
      hall_id: this.hall_id
    }
    // 所有选中数据的id集合
    for (let k in this.games) {
      let arr: any = []
      this.games[k].map((v: any) => {
        let item = this.gameObject[k].filter((game: any) => `${game.game_type}_${game.partner_id}` === v)
        item.length > 0 && arr.push(item[0])
      })
      params.game = params.game.concat(arr)
    }
    if (params.game.length === 0) {
      this.$message.error('游戏授权不能为空')
      return
    }
    this.requestGameOff(params)
  }
  onGameChange(list, index) {
    this.$set(this.games, index, list)
  }
  formatName(index) {
    let name = ''
    switch (String(index)) {
      case '1':
        name = '电子'
        break
      case '2':
        name = '视讯'
        break
      case '4':
        name = '电竞'
        break
      case '3':
        name = '体育'
        break
      case '5':
        name = '彩票'
        break
      case '6':
        name = '棋牌'
        break
      default:
        name = index
        break
    }
    return name
  }
}
</script>
