<template>
  <div class="legal-documents">
    <article class="document">
      <h3 v-if="!hideTitle">{{ doc.title }}</h3>

      <p v-for="(line, i) in doc.meta" :key="`meta-${i}`" class="meta">{{ line }}</p>

      <template v-for="(section, i) in doc.sections" :key="`section-${i}`">
        <h4>{{ section.heading }}</h4>

        <template v-for="(block, j) in section.blocks" :key="`block-${i}-${j}`">
          <ul v-if="block.type === 'list'">
            <li v-for="(item, k) in block.items" :key="k">
              <template v-for="(part, m) in segments(item)" :key="m">
                <mark v-if="part.pending" class="pending">{{ part.text }}</mark>
                <template v-else>{{ part.text }}</template>
              </template>
            </li>
          </ul>
          <p v-else>
            <template v-for="(part, m) in segments(block.text)" :key="m">
              <mark v-if="part.pending" class="pending">{{ part.text }}</mark>
              <template v-else>{{ part.text }}</template>
            </template>
          </p>
        </template>
      </template>
    </article>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import privacyRaw from '../legal/aviso-privacidad-v1.md?raw'
import termsRaw from '../legal/terminos-v1.md?raw'

type Block = { type: 'p'; text: string } | { type: 'list'; items: string[] }

interface Section {
  heading: string
  blocks: Block[]
}

interface ParsedDoc {
  title: string
  meta: string[]
  sections: Section[]
}

const props = defineProps<{
  type: 'privacy' | 'terms'
  hideTitle?: boolean
}>()

function parseLegal(raw: string): ParsedDoc {
  const doc: ParsedDoc = { title: '', meta: [], sections: [] }
  let paragraph: string[] = []
  let list: string[] = []

  const currentSection = () => doc.sections[doc.sections.length - 1]

  const flushParagraph = () => {
    if (!paragraph.length) return
    const text = paragraph.join(' ')
    const section = currentSection()
    if (section) section.blocks.push({ type: 'p', text })
    else doc.meta.push(text)
    paragraph = []
  }

  const flushList = () => {
    if (!list.length) return
    const section = currentSection()
    if (section) section.blocks.push({ type: 'list', items: list })
    list = []
  }

  for (const line of raw.replace(/\r/g, '').split('\n')) {
    const text = line.trim()

    if (text.startsWith('## ')) {
      flushParagraph()
      flushList()
      doc.sections.push({ heading: text.slice(3), blocks: [] })
    } else if (text.startsWith('# ')) {
      doc.title = text.slice(2)
    } else if (text.startsWith('- ')) {
      flushParagraph()
      list.push(text.slice(2))
    } else if (!text) {
      flushParagraph()
      flushList()
    } else {
      flushList()
      paragraph.push(text)
    }
  }

  flushParagraph()
  flushList()
  return doc
}

const PRIVACY_DOC = parseLegal(privacyRaw)
const TERMS_DOC = parseLegal(termsRaw)

const doc = computed(() => (props.type === 'privacy' ? PRIVACY_DOC : TERMS_DOC))

const PENDING = /(\[PENDIENTE[^\]]*\])/g

const segments = (text: string) =>
  text
    .split(PENDING)
    .filter(Boolean)
    .map((part) => ({ text: part, pending: part.startsWith('[PENDIENTE') }))
</script>

<style scoped>
.legal-documents {
  font-family: var(--font-body);
  line-height: 1.6;
  color: var(--rm-text);
}

h3 {
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: 26px;
  margin-bottom: 8px;
  color: var(--rm-text);
}

h4 {
  font-size: 16px;
  margin-top: 24px;
  margin-bottom: 12px;
  color: var(--rm-accent-dark);
  font-weight: 600;
}

p {
  margin-bottom: 12px;
  font-size: 14px;
  color: var(--rm-text-body);
}

.meta {
  margin-bottom: 4px;
  font-size: 13px;
  color: var(--rm-text-muted);
}

ul {
  margin: 12px 0;
  padding-left: 20px;
}

li {
  margin-bottom: 8px;
  font-size: 14px;
  color: var(--rm-text-body);
}

.pending {
  padding: 0 4px;
  border-radius: 4px;
  background: var(--rm-btn-secondary);
  color: var(--rm-accent-dark);
}
</style>