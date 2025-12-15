<template>
  <div class="start-page">
    <div class="page-container flex-center" style="flex-direction: column;">
      <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; max-width: 600px; margin-bottom: 24px;">
        <h1 class="pixel-title">
          💻 ДАШИНЫ ВОПРОСЫ 💻
        </h1>
        <button class="help-btn" @click="goToHelp" title="Инструкции">❓</button>
      </div>
      
      <p class="terminal-text text-center mb-xl" style="color: var(--text-secondary);">
        Выбери стек кандидата
      </p>
      
      <div class="stack-selection">
        <button 
          class="stack-btn stack-btn--angular" 
          @click="selectStack('angular')"
        >
          <span class="stack-btn__icon">🅰️</span>
          <span>ANGULAR</span>
        </button>
        
        <button 
          class="stack-btn stack-btn--vue" 
          :disabled="true"
          title="Coming soon..."
        >
          <span class="stack-btn__icon">🟢</span>
          <span>VUE</span>
          <small style="font-size: 8px; color: var(--text-secondary);">
            SOON
          </small>
        </button>
      </div>
      
      <!-- Import Section -->
      <div class="import-section mt-xl">
        <button 
          class="pixel-btn pixel-btn--small"
          @click="showImport = !showImport"
        >
          📥 {{ showImport ? 'Скрыть импорт' : 'Импорт сессии' }}
        </button>
        
        <div v-if="showImport" class="import-box">
          <textarea 
            v-model="importCode"
            class="pixel-textarea"
            rows="2"
            placeholder="Вставь код сессии..."
          ></textarea>
          <button 
            class="pixel-btn pixel-btn--green"
            :disabled="!importCode.trim()"
            @click="importData"
          >
            Загрузить
          </button>
          <p v-if="importError" class="import-error">{{ importError }}</p>
        </div>
      </div>
    </div>

    <!-- History Section -->
    <div v-if="history.length > 0" class="history-section">
      <div class="history-header">
        <span>📚 ИСТОРИЯ ИНТЕРВЬЮ</span>
        <button class="clear-btn" @click="confirmClear" title="Очистить историю">
          🗑️
        </button>
      </div>
      
      <div class="history-list">
        <div 
          v-for="entry in history" 
          :key="entry.id"
          class="history-item"
          @click="loadEntry(entry)"
        >
          <div class="history-main">
            <span class="history-name">{{ entry.name }}</span>
            <span class="history-score" :class="getLevelClass(entry.level)">
              {{ entry.score }}%
            </span>
          </div>
          <div class="history-meta">
            <span class="history-pool">{{ poolLabels[entry.pool] }}</span>
            <span class="history-seed">{{ entry.seed }}</span>
            <span class="history-date">{{ formatDate(entry.date) }}</span>
          </div>
          <button 
            class="history-delete" 
            @click.stop="deleteEntry(entry.id)"
            title="Удалить"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useInterviewStore } from '../stores/interview'

const router = useRouter()
const store = useInterviewStore()

const showImport = ref(false)
const importCode = ref('')
const importError = ref('')
const history = ref([])

const poolLabels = store.poolLabels

onMounted(() => {
  history.value = store.getHistory()
})

function selectStack(stack) {
  store.setStack(stack)
  router.push('/candidate')
}

function goToHelp() {
  router.push('/help')
}

function importData() {
  importError.value = ''
  const success = store.importSession(importCode.value.trim())
  
  if (success) {
    router.push('/results')
  } else {
    importError.value = 'Неверный формат кода'
  }
}

function loadEntry(entry) {
  const success = store.loadFromHistory(entry)
  if (success) {
    router.push('/results')
  }
}

function deleteEntry(id) {
  store.deleteFromHistory(id)
  history.value = store.getHistory()
}

function confirmClear() {
  if (confirm('Очистить всю историю?')) {
    store.clearHistory()
    history.value = []
  }
}

function getLevelClass(level) {
  if (level === 'strong-middle') return 'level-strong'
  if (level === 'middle') return 'level-middle'
  if (level === 'weak-middle') return 'level-weak'
  return 'level-junior'
}

function formatDate(isoDate) {
  const date = new Date(isoDate)
  return date.toLocaleDateString('ru-RU', { 
    day: '2-digit', 
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.start-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.stack-selection {
  display: flex;
  gap: 48px;
  justify-content: center;
}

.stack-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.stack-btn:disabled:hover {
  transform: none;
  box-shadow: none;
  background: var(--bg-card);
}

.help-btn {
  font-size: 32px;
  background: none;
  border: none;
  cursor: pointer;
  transition: transform 0.15s;
}

.help-btn:hover {
  transform: scale(1.1);
}

/* Import Section */
.import-section {
  text-align: center;
}

.import-box {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 400px;
}

.import-box textarea {
  width: 100%;
}

.import-error {
  color: var(--neon-pink);
  font-family: var(--font-terminal);
  font-size: 14px;
}

/* History Section */
.history-section {
  margin-top: auto;
  padding: 16px 24px 24px;
  background: var(--bg-card);
  border-top: 3px solid var(--border-color);
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-family: var(--font-pixel);
  font-size: 10px;
  color: var(--neon-cyan);
}

.clear-btn {
  background: none;
  border: none;
  font-size: 14px;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.15s;
}

.clear-btn:hover {
  opacity: 1;
}

.history-list {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.history-item {
  flex-shrink: 0;
  width: 180px;
  padding: 12px;
  background: var(--bg-dark);
  border: 2px solid var(--border-color);
  cursor: pointer;
  transition: all 0.15s;
  position: relative;
}

.history-item:hover {
  border-color: var(--neon-cyan);
  transform: translateY(-2px);
}

.history-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.history-name {
  font-family: var(--font-terminal);
  font-size: 14px;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100px;
}

.history-score {
  font-family: var(--font-pixel);
  font-size: 12px;
}

.level-strong { color: var(--neon-green); }
.level-middle { color: var(--neon-cyan); }
.level-weak { color: var(--neon-yellow); }
.level-junior { color: var(--neon-pink); }

.history-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-family: var(--font-terminal);
  font-size: 11px;
  color: var(--text-secondary);
}

.history-seed {
  color: var(--neon-yellow);
  font-family: var(--font-pixel);
  font-size: 9px;
}

.history-delete {
  position: absolute;
  top: 4px;
  right: 4px;
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 12px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s;
}

.history-item:hover .history-delete {
  opacity: 0.7;
}

.history-delete:hover {
  color: var(--neon-pink);
  opacity: 1;
}
</style>
