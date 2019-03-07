<template lang="pug" src="./index.pug"></template>

<script lang="ts">
import { Component, Vue, Prop, Emit, Watch, Mixins } from 'vue-property-decorator'
import DateMixin from './date-mixin'

@Component
export default class DayPicker extends Mixins(DateMixin) {
  @Prop(Array) value!: string[] /** 支持传入自己设置的时间 */
  @Prop({ default: () => [] })
  defaultValue!: number[] /** 默认选择时间 */

  days: string[] = this.value
  initDays: string[] = [...this.value] /** 用于存储自己设置的时间，重置事件使用 */

  created() {
    !this.initDays.length && this.defaultValue.length > 0 && this.reset()
    this.$on('reset', this.reset)
  }

  /** 以默认值重置选项 */
  reset() {
    if (this.initDays.length) {
      this.onChange([...this.initDays])
    } else {
      const days = this.defaultValue.map(v => {
        const time = new Date(this.baseTime)
        time.setTime(time.getTime() + 3600 * 1000 * 24 * v)
        return time.format('yyyy-MM-dd')
      })
      this.onChange(days)
    }
  }
  /** 昨日 */
  setYestoday(picker) {
    const now = new Date(this.baseTime)
    now.setTime(now.getTime() - 3600 * 1000 * 24 * 1)
    picker.$emit('pick', [now, now])
  }
  /** 今日 */
  setToday(picker) {
    const end = new Date(this.baseTime)
    const start = new Date(this.baseTime)
    picker.$emit('pick', [start, end])
  }

  /** 本周 */
  setCurrentWeek(picker) {
    const end = new Date(this.baseTime)
    const start = new Date(this.baseTime)
    start.setTime(start.getTime() - 3600 * 1000 * 24 * start.getDay())
    picker.$emit('pick', [start, end])
  }

  /** 上周 */
  setLastWeek(picker) {
    const end = new Date(this.baseTime)
    const start = new Date(this.baseTime)
    start.setTime(start.getTime() - 3600 * 1000 * 24 * (start.getDay() + 7))
    end.setTime(end.getTime() - 3600 * 1000 * 24 * (end.getDay() + 1))
    picker.$emit('pick', [start, end])
  }
  /** 本月 */

  setCurrentMonth(picker) {
    const end = new Date(this.baseTime)
    const start = new Date(this.baseTime)
    start.setTime(start.getTime() - 3600 * 1000 * 24 * (start.getDate() - 1))
    picker.$emit('pick', [start, end])
  }
  /** 上月 */
  setLastMonth(picker) {
    const end = new Date(this.baseTime)
    const start = new Date(this.baseTime)
    let time = start.setMonth(new Date(start).getMonth() - 1)
    start.setTime(new Date(time).setDate(1))
    end.setTime(end.getTime() - 3600 * 1000 * 24 * end.getDate())
    picker.$emit('pick', [start, end])
  }

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
    this.days = value
  }

  @Emit('input')
  onChange(days: string[]) {}
}
</script>
