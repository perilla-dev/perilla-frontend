<template>
  <v-container fluid>
    <v-layout fill-height>
      <v-flex>
        <v-card>
          <v-card-title class="headline primary white--text">
            <div>
              <div class="headline" v-text="entry._id" />
              <div class="subheading">{{ $t(EntryType[entry.type]) }}</div>
            </div>
          </v-card-title>
          <v-card-text>
            <div class="body-1">{{ $t('email') }}:</div>
            <pre style="white-space: pre-wrap; word-wrap: break-word;">{{ entry.email }}</pre>
            <br />
            <div class="body-1">{{ $t('created') }}:</div>
            <pre style="white-space: pre-wrap; word-wrap: break-word;">{{ entry.created }}</pre>
            <br />
            <div class="body-1">{{ $t('description') }}:</div>
            <z-markdown :content="rendered" />
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn v-text="$t('manage')" color="primary" :to="'/entry/manage/' + id" />
            <v-btn v-text="$t('edit')" :to="'/entry/edit/' + id" />
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { request } from '@/helpers/http'
import render from '@/helpers/markdown'
import { EntryType } from '@/helpers/misc'
import { showToast } from '@/swal'
import zMarkdown from '@/components/zmarkdown'

export default {
  name: 'adminMain',
  props: ['id'],
  components: {
    zMarkdown
  },
  data() {
    return {
      entry: {
        _id: null,
        description: '',
        email: null,
        created: null,
        type: null
      },
      EntryType
    }
  },
  watch: {
    id: {
      handler: function() {
        this.load()
      },
      immediate: true
    }
  },
  computed: {
    rendered: function() {
      return render(this.entry.description)
    }
  },
  methods: {
    load() {
      this.$store.commit('toggleLoading', true)
      request({
        url: '/api/entry',
        params: { entry: this.id }
      })
        .then(entry => {
          this.entry = entry
        })
        .catch(e => {
          showToast('error', 'error', e.message)
        })
        .finally(() => {
          this.$store.commit('toggleLoading', false)
        })
    }
  }
}
</script>
