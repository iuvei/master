<template lang="pug" src="./index.pug"></template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import Common from './common/index.vue'
import MyMixin from '../mixin'

@Component({
  components: {
    Common
  }
})
export default class extends Mixins(MyMixin) {
  mounted() {
    this.type = 2
    this.requestPartnerList()
  }
}
</script>