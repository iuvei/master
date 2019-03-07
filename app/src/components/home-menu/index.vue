<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { State } from 'vuex-class'

@Component
export default class HomeMenu extends Vue {
  @State isMeunCollapse

  get list() {
    const router: any = this.$router
    return router.options.routes
  }
}
</script>
