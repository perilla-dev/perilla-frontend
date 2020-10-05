import Vue from 'vue'
import router from '@/router'
import store from '@/store'
import i18n from '@/i18n'
import { client } from '@/helpers/http'
import { getStorage } from '@/helpers/storage'
import App from '@/App.vue'
import vuetify from './plugins/vuetify'
import 'roboto-fontface/css/roboto/roboto-fontface.css'
import '@mdi/font/css/materialdesignicons.css'

Vue.config.productionTip = false

i18n.locale = getStorage(localStorage, 'language') || i18n.locale
client.defaults.baseURL = getStorage(localStorage, 'baseURL') || client.defaults.baseURL

new Vue({
  router,
  store,
  vuetify,
  i18n,
  render: h => h(App)
}).$mount('#app')
