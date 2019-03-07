import { Component, Vue } from 'vue-property-decorator'

@Component
export default class ExportMixin extends Vue {

  /** 是否正在导出，防止连击 */
  isExporting: boolean = false

  /** 提交导出成功后，显示弹框，跳转下载页面 */
  onExportSuccess() {
    const h = this.$createElement;
    const message = <div>
                      <p>操作成功！</p>
                      <p>请至右上角--【数据下载】中，下载导出的数据。</p>
                    </div>
    
    this.$confirm(message, {
      title: '提示',
      type: 'success',
      confirmButtonText: '确定',
      cancelButtonText: '前往',
      center: true,
      closeOnClickModal:false,
      closeOnPressEscape: false,
      showClose: false
    }).catch(() => this.$router.push('/report-download'))
  }

  /** 获取提交导出请求的Module ID */
  getModuleId(name: string): number | undefined {
    const ids = {
      // 注单管理
      ORDER_LIVE: 1000, // 视讯注单
      ORDER_SPORT: 1100, // 体育注单
      ORDER_ESPORT: 1200, // 电竞注单
      ORDER_EGAME: 1300, // 电游注单
      ORDER_CARD: 1400, // 棋牌注单
      ORDER_LOTTERY: 1600, // 彩票注单
      ORDER_REPAIR_LOG: 1501, //游戏数据补单-补单记录

      // 财务报表
      REPORT_TOTAL: 2000, // 总报表
      REPORT_GAME: 2100, // 游戏报表
      REPORT_MONEYLOG: 2200, // 出入款报表
      REPORT_BILL: 2300, // api对账报表
      REPORT_TIPS: 2401, // 小费报表
      REPORT_REDPACKET: 2402, // 红包报表
      REPORT_UNSETTLE: 2500 // 未结算报表
    }

    return ids[name]
  }
}
