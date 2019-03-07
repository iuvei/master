import Vue from 'vue'
import Component from 'vue-class-component'
import api from '@/api'
@Component
export default class Mixin extends Vue {
  type: number = 0
  activeName = ''
  gamelist: Array<any> = []
  //tab切换事件
  handleClick(tab) {
    this.activeName = tab.name
    let query = `?tab=${this.activeName}`
    history.replaceState(null, '', query)
  }
  // 请求第三方列表
  requestPartnerList() {
    api
      .partnerList()
      .then((response: any) => {
        if (response.code === 0 && response.data) {
          this.gamelist = response.data[this.type] || []
          this.gamelist.push({ game_name: '总栏' })
          if (this.$route.query.tab) {
            this.activeName = this.$route.query.tab
          } else {
            this.activeName = this.gamelist && this.gamelist[0].game_name
          }
        }
      })
      .catch(error => {})
  }
  // 格式化菜单显示名字
  formatLabel(val, type) {
    let text = ''
    switch (type) {
      case 'live':
        text = val + '视讯'
        break
      case 'egame':
        text = val + '电子'
        break
      case 'sport':
        text = val + '体育'
        break
      case 'esport':
        text = val + '电竞'
        break
      case 'card':
        text = val + '棋牌'
        break
      case 'lottery':
        text = val + '彩票'
        break
      default:
        text = val
        break
    }
    return text
  }
}
