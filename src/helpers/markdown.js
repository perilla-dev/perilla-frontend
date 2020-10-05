/* eslint-disable no-var */
import katex from 'katex'
import zmark, { Renderer } from 'zmark'
import highlightjs from 'highlight.js'
import { client } from '@/helpers/http'
import store from '@/store'
import { resolveUrl } from '@/utils'
import 'katex/dist/katex.css'
import '../styles/hljslight.css'
import '../styles/hljsdark.css'
import '../styles/mdlight.css'
import '../styles/mddark.css'

function escape(html, encode) {
  if (encode) {
    if (escape.escapeTest.test(html)) {
      return html.replace(escape.escapeReplace, function(ch) {
        return escape.replacements[ch]
      })
    }
  } else {
    if (escape.escapeTestNoEncode.test(html)) {
      return html.replace(escape.escapeReplaceNoEncode, function(ch) {
        return escape.replacements[ch]
      })
    }
  }

  return html
}

escape.escapeTest = /[&<>"']/
escape.escapeReplace = /[&<>"']/g
escape.replacements = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}

escape.escapeTestNoEncode = /[<>"']|&(?!#?\w+;)/
escape.escapeReplaceNoEncode = /[<>"']|&(?!#?\w+;)/g

const renderer = new Renderer()

renderer.link = function(href, title, text) {
  if (this.options.sanitize) {
    try {
      var prot = decodeURIComponent(unescape(href))
        .replace(/[^\w:]/g, '')
        .toLowerCase()
    } catch (e) {
      return text
    }
    if (prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0 || prot.indexOf('data:') === 0) {
      return text
    }
  }
  if (href.startsWith('$')) {
    const id = href.substr(1)
    href = resolveUrl(client.defaults.baseURL, `/api/file/raw?id=${id}&entry=${store.state.entry}&access_token=${store.state.token}`)
  }
  try {
    href = encodeURI(href).replace(/%25/g, '%')
  } catch (e) {
    return text
  }
  let out = `<a href="${escape(href)}"`
  if (title) out += ` title="${title}"`
  out += `>${text}</a>`
  return out
}

renderer.code = function(code, language) {
  const validLang = !!(language && highlightjs.getLanguage(language))
  const highlighted = validLang ? highlightjs.highlight(language, code).value : code
  return `<pre><code class="hljs ${language}">${highlighted}</code></pre>`
}

renderer.image = function(href, title, text) {
  if (href.startsWith('$')) {
    const id = href.substr(1)
    href = resolveUrl(client.defaults.baseURL, `/api/file/raw?id=${id}&entry=${store.state.entry}&access_token=${store.state.token}`)
  }
  const commands = (title || '').split(' ')
  title = []
  let iframe, width, height
  for (const command of commands) {
    if (command.startsWith('$')) {
      iframe |= command === '$iframe'
      if (command.startsWith('$width=')) width = command.substr(7)
      if (command.startsWith('$height=')) height = command.substr(8)
    } else {
      title.push(command)
    }
  }
  let out = iframe ? '<iframe' : '<img'
  out += ` src="${href}" alt="${text}"`
  if (width) out += ` width="${width}"`
  if (height) out += ` height="${height}"`
  if (title) out += ` title="${title.join(' ')}"`
  out += this.options.xhtml ? '/>' : '>'
  return out
}

zmark.setOptions({
  renderer: renderer,
  math: (text, display) => katex.renderToString(text, { displayMode: display })
})

export default function render(markdown) {
  try {
    const result = zmark(markdown || '# Nothing to shown')
    return result
  } catch (e) {
    return `<pre><code>${e.message}\nSource:\n${markdown}</code></pre>`
  }
}
