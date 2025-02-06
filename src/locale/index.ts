import { createI18n } from 'vue-i18n'

import { en } from './en'
import { zhCN } from './zh-CN'

// 使用 navigator.language 并只保留主语言部分，如 "en-US" -> "en"
const currentLocale = navigator.language.split('-')[0]

type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>
    }
  : T

const i18n = createI18n({
  locale: currentLocale,
  fallbackLocale: 'en',
  legacy: false,
  messages: {
    en,
    zh: zhCN
  } as { [key: string]: DeepPartial<typeof en> }
})

export default i18n
