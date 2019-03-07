<template lang="pug" src="./index.pug"></template>

<script lang="ts">
import { Vue, Component, Prop, Emit, Watch } from 'vue-property-decorator'
import { Upload as ElUpload } from 'element-ui'
import state from '@/store/modules/user/state'
import config from '@/config'

@Component
export default class Upload extends Vue {
  @Prop(String) value?: string
  @Prop(Boolean) drag?: boolean
  @Prop(String) accept?: string
  @Prop(String) listType?: string
  @Prop(Array) fileList?: {}[]
  @Prop(String) pictext?: string
  @Prop(Number) maxpic?: number
  @Prop(String) sizeText?: string
  @Prop({
    default() {
      return false
    }
  })
  disabled?: boolean
  @Prop({
    default: 1
  })
  limit!: number

  /** 是否清理文件列表，应用场景：通过监听 dialog 的显示隐藏来自动清理文件 */
  @Prop(Boolean) clean?: boolean

  action: string = config.uploadURL

  headers = {
    Authorization: state.token
  }

  $refs!: {
    upload: ElUpload
  }

  @Watch('value')
  onValueChange(value: string) {
    if (value === '') {
      this.$refs.upload.clearFiles()
    }
  }

  @Watch('clean')
  onCleanChange(value: boolean) {
    if (value) {
      this.$refs.upload.clearFiles()
    }
  }

  @Emit('success')
  onSuccess(response, file, fileList) {
    this.$emit('input', response.data.url)
    this.$parent.$emit('el.form.change')
  }

  @Emit('error')
  onError(response, file, fileList) {}

  @Emit('progress')
  onProgress(event, file, fileList) {}

  @Emit('change')
  onChange(file, fileList) {}

  @Emit('remove')
  onRemove(file, fileList) {
    this.$emit('input', '')
    this.$parent.$emit('el.form.change')
  }

  @Emit('preview')
  onPreview(file) {}

  exceed(file, fileList) {
    this.$message.error('限制上传一张图片！')
  }
  clearFiles() {
    this.$refs.upload.clearFiles()
  }

  /** 判断是否超过了文件大小 */
  beforeAvatarUpload(file) {
    let isLt2M
    if (this.maxpic) {
      isLt2M = file.size / 1024 / 1024 < Number(this.maxpic)
      if (!isLt2M) {
        this.$message.error(`上传图片大小不能超过 ${this.maxpic}MB!`)
      }
    } else {
      isLt2M = file.size / 1024 / 1024 < 100
      if (!isLt2M) {
        this.$message.error(`上传图片大小不能超过 100MB!`)
      }
    }
    return isLt2M
  }
  created() {}
}
</script>
