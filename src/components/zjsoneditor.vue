<template>
  <z-monaco-editor class="z-json-editor" v-model="content" language="json" :readonly="readonly" :theme="$store.state.darkTheme ? 'vs-dark' : 'vs'" />
</template>

<script>
import zMonacoEditor from '@/components/zmonacoeditor'
import { isEqual } from 'lodash'

export default {
  name: 'zJsonEditor',
  components: {
    zMonacoEditor
  },
  props: ['value', 'readonly', 'valid'],
  model: {
    prop: 'value',
    event: 'updateValue'
  },
  data() {
    return {
      content: ''
    }
  },
  mounted() {
    this.content = JSON.stringify(this.value, null, '\t') || ''
  },
  watch: {
    content: function() {
      try {
        this.$emit('updateValue', JSON.parse(this.content))
        this.$emit('update:valid', true)
      } catch (e) {
        this.$emit('update:valid', false)
      }
    },
    value: {
      handler: function() {
        try {
          if (!isEqual(this.value, JSON.parse(this.content))) {
            this.content = JSON.stringify(this.value, null, '\t') || ''
          }
        } catch (e) {
          this.content = JSON.stringify(this.value, null, '\t') || ''
        }
      },
      deep: true
    }
  }
}
</script>

<style scoped>
.z-json-editor {
  height: 500px;
}
</style>
