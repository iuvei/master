<template lang="pug">
  el-date-picker(
    v-model="times"
    type="datetimerange"
    :picker-options="shortcutSelection? shortcutSelection:pickerOptions"
    start-placeholder="开始日期"
    end-placeholder="结束日期"
    value-format="yyyy-MM-dd HH:mm:ss"
    align="center"
    :clearable="clearable"
    :disabled="disabled"
    @change="changeHandle"
    :default-time="['00:00:00','23:59:59']"
  )
</template> 

<script lang="ts">
import { Component, Vue, Prop, Watch, Emit, Mixins } from 'vue-property-decorator'
import DateMixin from '../day-picker/date-mixin'

@Component
export default class Picker extends Mixins(DateMixin) {
  @Prop({ default: 'datetimerange' })
  type!: string
  @Prop() disabled!: Boolean
  @Prop() shortcutSelection!: object[] //自定义快捷选择
  /**
   * @value:
   *   数组第一位-[开始时间]：YY-MM-DD hh-mm-ss  例如：2018-08-30 16:20:30  {type: string}
   *   数组第二位-[结束时间]
   */
  @Prop({
    default() {
      return []
    }
  })
  value!: string[]
  @Prop({ default: () => [] })
  defaultValue!: number[] /** 默认选择时间 */

  @Prop({ default: false }) clearable?: Boolean

  times: string[] = !this.value[0] ? [] : this.value
  initDays: string[] = [...this.value] /** 用于存储自己设置的时间，重置事件使用 */
  @Watch('timezone')
  onTimezoneChange() {
    this.reset()
  }
  created() {
    !this.initDays.length && this.defaultValue.length > 0 && this.reset()
    this.$on('reset', this.reset)
  }
  /** 以默认值重置选项 */
  reset() {
    if (this.initDays.length) {
      this.changeHandle([...this.initDays])
    } else {
      const days = this.defaultValue.map(v => {
        const time = new Date(this.baseTime)
        time.setTime(time.getTime() + 3600 * 1000 * 24 * v)
        return time.format('yyyy-MM-dd')
      })
      days[0] = days[0] + ' 00:00:00'
      days[1] = days[1] + ' 23:59:59'
      this.changeHandle(days)
    }
  }
  /** 昨日 */
  setYestoday(picker) {
    const now = new Date(this.baseTime)
    now.setTime(now.getTime() - 3600 * 1000 * 24 * 1)
    const start = now.format('yyyy-MM-dd 00:00:00')
    const end = now.format('yyyy-MM-dd 23:59:59')
    picker.$emit('pick', [start, end])
  }
  /** 今日 */
  setToday(picker) {
    const end = new Date(this.baseTime).format('yyyy-MM-dd 23:59:59')
    const start = new Date(this.baseTime).format('yyyy-MM-dd 00:00:00')
    picker.$emit('pick', [start, end])
  }

  /** 本周 */
  setCurrentWeek(picker) {
    const end = new Date(this.baseTime).format('yyyy-MM-dd 23:59:59')
    let start: any = new Date(this.baseTime)
    start.setTime(start.getTime() - 3600 * 1000 * 24 * start.getDay())
    start = new Date(start).format('yyyy-MM-dd 00:00:00')
    picker.$emit('pick', [start, end])
  }

  /** 上周 */
  setLastWeek(picker) {
    let end: any = new Date(this.baseTime)
    let start: any = new Date(this.baseTime)
    start.setTime(start.getTime() - 3600 * 1000 * 24 * (start.getDay() + 7))
    end.setTime(end.getTime() - 3600 * 1000 * 24 * (end.getDay() + 1))
    start = new Date(start).format('yyyy-MM-dd 00:00:00')
    end = new Date(end).format('yyyy-MM-dd 23:59:59')
    picker.$emit('pick', [start, end])
  }

  /** 本月 */
  setCurrentMonth(picker) {
    let end: any = new Date(this.baseTime).format('yyyy-MM-dd 23:59:59')
    let start: any = new Date(this.baseTime)
    start.setTime(start.getTime() - 3600 * 1000 * 24 * (start.getDate() - 1))
    start = new Date(start).format('yyyy-MM-dd 00:00:00')
    picker.$emit('pick', [start, end])
  }

  /** 上月 */
  setLastMonth(picker) {
    let end: any = new Date(this.baseTime)
    let start: any = new Date(this.baseTime)
    let time = start.setMonth(new Date(start).getMonth() - 1)
    start.setTime(new Date(time).setDate(1))
    end.setTime(end.getTime() - 3600 * 1000 * 24 * end.getDate())
    start = new Date(start).format('yyyy-MM-dd 00:00:00')
    end = new Date(end).format('yyyy-MM-dd 23:59:59')
    picker.$emit('pick', [start, end])
  }
  /** 快速选择时间 */

  get pickerOptions() {
    return {
      shortcuts: [
        {
          text: '昨日',
          onClick: this.setYestoday
        },
        {
          text: '今日',
          onClick: this.setToday
        },
        {
          text: '本周',
          onClick: this.setCurrentWeek
        },
        {
          text: '上周',
          onClick: this.setLastWeek
        },
        {
          text: '本月',
          onClick: this.setCurrentMonth
        },
        {
          text: '上月',
          onClick: this.setLastMonth
        }
      ],
      disabledDate: time => this.nums && this.disabledDate(time)
    }
  }
  @Watch('value')
  onChildChanged(value: string[]) {
    this.times = !this.value[0] ? [] : this.value
    if (!value.length && this.defaultValue.length) {
      this.reset()
    }
  }

  /** 触发变化 */
  changeHandle(arr) {
    if (!arr) {
      arr = ['', '']
    }
    const newArr = arr.slice()
    this.$emit('input', newArr)
    this.$emit('change', newArr)
  }
}
</script>
<style lang="stylus" scoped>
>>>
  .el-date-editor .el-range-separator
    padding 0
</style>
