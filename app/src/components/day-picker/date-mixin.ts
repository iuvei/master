import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { State } from 'vuex-class'
const SixMonths = ['/notice', '/transfer-abnormal', '/transfer-record']
const ThreeMonths = [
  '/master-log',
  '/admin-log',
  '/member-log',
  '/agent-log',
  '/order-esports',
  '/order-live',
  '/order-sport',
  '/order-cards',
  '/order-egame',
  '/order-lottery',
  '/general-statement',
  '/game-statement',
  '/receipt-summary',
  '/tips-summary',
  '/api-statement',
  '/order-repair',
  '/unsettle-statement'
]
const TwoMonths: any = []
@Component
export default class DateMixin extends Vue {
  @State timeZone
  @Prop({ type: Number, default: -4 }) timezone!: number
  /** 基础时间，若无则取本地时间 */
  get baseTime() {
    return this.timeZone.value + (this.timezone + 4) * 3600 * 1000 || new Date().getTime()
  }
  get nums(): any {
    let page = this.$route.path
    if (SixMonths.includes(page)) {
      return 6
    } else if (ThreeMonths.includes(page)) {
      return 3
    } else if (TwoMonths.includes(page)) {
      return 2
    } else {
      return false
    }
  }
  disabledDate(time) {
    let curDate = new Date(this.baseTime).getTime()
    let start = new Date(this.baseTime).setDate(1)
    let times = new Date(start).setMonth(new Date(start).getMonth() - this.nums) - 24 * 3600 * 1000
    return time.getTime() > curDate || time.getTime() < times
  }
}
