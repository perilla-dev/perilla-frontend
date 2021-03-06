<template>
  <v-container fluid>
    <v-layout align-center justify-center>
      <v-flex sm12>
        <v-card>
          <v-data-table
            :rows-per-page-items="[5, 10, 15, 25, 50]"
            class="fullwidth"
            :headers="headers"
            :items="files"
            :pagination.sync="pagination"
            :total-items="total"
            :loading="loading"
          >
            <template slot="items" slot-scope="props">
              <tr>
                <td>{{ props.item.id }}</td>
                <td class="text-xs-right">
                  <router-link :to="'/file/show/' + props.item.id">{{ props.item.name }}</router-link>
                </td>
                <td class="text-xs-right">{{ props.item.type }}</td>
                <td class="text-xs-right">
                  <v-chip v-for="(tag, i) in props.item.tags" :key="i">{{ tag }}</v-chip>
                </td>
                <td class="text-xs-right">{{ new Date(props.item.updated).toLocaleString() }}</td>
                <td class="text-xs-right">{{ props.item.creator }}</td>
              </tr>
            </template>
            <template slot="actions-prepend">
              <v-btn icon to="/file/upload" color="primary">
                <v-icon>cloud_upload</v-icon>
              </v-btn>
              <v-btn icon to="/file/new">
                <v-icon>add</v-icon>
              </v-btn>
              <v-btn icon @click="showCondDialog = true">
                <v-icon>search</v-icon>
              </v-btn>
            </template>
          </v-data-table>
        </v-card>
      </v-flex>
    </v-layout>
    <v-dialog v-model="showCondDialog" max-width="500px">
      <v-card>
        <v-card-title class="headline" v-text="$t('condition')" />
        <v-card-text>
          <v-text-field v-model="search" :label="$t('search')" />
          <v-text-field v-model="type" :label="$t('type')" />
          <v-combobox v-model="tags" :label="$t('tags')" hide-selected multiple chips clearable />
          <v-text-field v-model="creator" :label="$t('creator')" />
          <v-text-field v-model="before" :label="$t('before')" mask="####/##/## ##:##" :return-masked-value="true" />
          <v-text-field v-model="after" :label="$t('after')" mask="####/##/## ##:##" :return-masked-value="true" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" v-text="$t('apply')" @click="fetchData()" />
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { request } from '@/helpers/http'
import { getStorage, setStorage } from '@/helpers/storage'
import { showToast } from '@/swal'

export default {
  name: 'FileList',
  data() {
    return {
      headers: [
        { text: this.$t('ID'), align: 'left', sortable: true, value: 'id' },
        { text: this.$t('name'), value: 'name', sortable: true, class: 'text-xs-right' },
        { text: this.$t('type'), value: 'type', sortable: false, class: 'text-xs-right' },
        { text: this.$t('tags'), value: 'tags', sortable: false, class: 'text-xs-right' },
        { text: this.$t('updated'), value: 'updated', sortable: true, class: 'text-xs-right' },
        { text: this.$t('creator'), value: 'creator', sortable: false, class: 'text-xs-right' }
      ],
      files: [],
      pagination: getStorage(localStorage, 'filePagination') || {
        descending: true,
        page: 1,
        rowsPerPage: 15,
        sortBy: 'id',
        totalItems: 0
      },
      total: 0,
      loading: true,
      search: null,
      type: null,
      tags: null,
      before: null,
      after: null,
      creator: null,
      showCondDialog: false
    }
  },
  watch: {
    pagination: {
      handler: function() {
        setStorage(localStorage, 'filePagination', this.pagination)
        this.fetchData()
      },
      deep: true
    }
  },
  methods: {
    fetchData() {
      this.loading = true
      const { sortBy, descending, page, rowsPerPage } = this.pagination
      const params = { sortBy, descending: descending || undefined }
      const condition = this.getCondition()
      Promise.all([
        request({
          url: '/api/file/list',
          params: Object.assign({ entry: this.$store.state.entry }, { noexec: true }, params, condition)
        }),
        request({
          url: '/api/file/list',
          params: Object.assign({ entry: this.$store.state.entry }, { skip: (page - 1) * rowsPerPage, limit: rowsPerPage }, params, condition)
        })
      ])
        .then(([count, items]) => {
          this.total = count
          this.files = items
        })
        .catch(e => {
          showToast('error', 'error', e.message)
        })
        .finally(() => {
          this.loading = false
        })
    },
    getCondition() {
      const condition = {}
      if (this.search && this.search.trim()) {
        condition.search = this.search
      }
      if (this.type && this.type.trim()) {
        condition.type = this.type
      }
      if (this.tags && this.tags.length) {
        condition.tags = this.tags
      }
      if (this.before && this.before.trim()) {
        condition.before = +new Date(this.before)
      }
      if (this.after && this.after.trim()) {
        condition.after = +new Date(this.after)
      }
      if (this.creator && this.creator.trim()) {
        condition.creator = this.creator
      }
      return condition
    }
  },
  mounted() {
    this.fetchData()
  }
}
</script>
