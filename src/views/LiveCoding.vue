<template>
  <div class="livecoding-page">
    <!-- Check if tasks exist -->
    <div v-if="!tasks || tasks.length === 0" class="page-container text-center" >
      <h1 class="pixel-title">💻 LIVE CODING</h1>
      <p class="terminal-text">Задачи не загружены</p>
      <button class="pixel-btn pixel-btn--green mt-lg" @click="goToResults">
        🏆 ПЕРЕЙТИ К ИТОГАМ
      </button>
    </div>

    <template v-else>
      <!-- Header -->
      <div class="header-bar">
        <div class="header-bar__section">
          <span class="section-icon">💻</span>
          <span class="section-name">LIVE CODING</span>
          <span class="task-counter">
            Задача {{ currentIndex + 1 }}/{{ tasks.length }}
          </span>
        </div>
        <div class="task-title">{{ currentTask?.title }}</div>
      </div>

      <!-- Main Content -->
      <div class="content-split">
        <!-- Left: Code for candidate -->
        <div class="panel panel--code">
          <div class="panel__header">
            <span>📋 КОД ДЛЯ КАНДИДАТА</span>
            <button class="copy-btn" @click="copyCode">
              {{ copied ? '✓ Скопировано' : '📋 Копировать' }}
            </button>
          </div>
          <div class="panel__description">
            {{ currentTask?.description }}
          </div>
          <pre class="code-block"><code>{{ currentTask?.code }}</code></pre>
        </div>

        <!-- Right: Solution & Hints -->
        <div class="panel panel--solution">
          <!-- Solution (top) -->
          <div class="solution-section">
            <div class="panel__header">
              <span>✅ РЕШЕНИЕ</span>
              <button 
                class="toggle-btn"
                @click="showSolution = !showSolution"
              >
                {{ showSolution ? '🙈 Скрыть' : '👁 Показать' }}
              </button>
            </div>
            <div v-if="showSolution" class="solution-content">
              <!-- Перевод ловушек -->
              <div 
                v-if="currentTask?.trapTranslations?.length" 
                class="trap-translations"
              >
                <div class="trap-header">
                  🎣 ЛОВУШКИ В КОММЕНТАРИЯХ (для тебя):
                </div>
                <div 
                  v-for="(trap, idx) in currentTask.trapTranslations" 
                  :key="idx"
                  class="trap-item"
                >
                  <div class="trap-norwegian">{{ trap.norwegian }}</div>
                  <div class="trap-translation">
                    <strong>Перевод:</strong> {{ trap.translation }}
                  </div>
                  <div class="trap-why-wrong">
                    <strong>❌ Почему это неправильно:</strong> {{ trap.whyWrong }}
                  </div>
                </div>
              </div>
              <pre class="code-block code-block--solution"><code>{{ currentTask?.solution }}</code></pre>
            </div>
          </div>

          <!-- Hints (bottom) -->
          <div class="hints-section">
            <div class="panel__header">
              <span>💡 ПОДСКАЗКИ</span>
            </div>
            <div class="hints-list">
              <div 
                v-for="(hint, idx) in currentTask?.hints || []" 
                :key="idx"
                class="hint-item"
                :class="{ revealed: revealedHints.includes(idx) }"
              >
                <button 
                  class="hint-btn"
                  @click="revealHint(idx)"
                >
                  <span class="hint-level">Уровень {{ hint.level }}</span>
                  <span v-if="!revealedHints.includes(idx)">
                    Нажми чтобы показать
                  </span>
                </button>
                <div v-if="revealedHints.includes(idx)" class="hint-text">
                  {{ hint.text }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom: Evaluation -->
      <div class="evaluation-bar">
        <div class="eval-section">
          <span class="eval-label">✓ Ожидаемое:</span>
          <div class="eval-items">
            <label 
              v-for="(item, idx) in currentTask?.expectedBehavior || []" 
              :key="'exp-' + idx"
              class="pixel-checkbox"
            >
              <input 
                type="checkbox" 
                :checked="checkedExpected.includes(idx)"
                @change="toggleExpected(idx)"
              />
              <span class="pixel-checkbox__box"></span>
              <span class="pixel-checkbox__label">{{ item }}</span>
            </label>
          </div>
        </div>

        <div class="eval-section eval-section--red">
          <span class="eval-label">🚩 Red Flags:</span>
          <div class="eval-items">
            <label 
              v-for="(item, idx) in currentTask?.redFlags || []" 
              :key="'red-' + idx"
              class="pixel-checkbox pixel-checkbox--red"
            >
              <input 
                type="checkbox" 
                :checked="checkedRedFlags.includes(idx)"
                @change="toggleRedFlag(idx)"
              />
              <span class="pixel-checkbox__box"></span>
              <span class="pixel-checkbox__label">{{ item }}</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <div class="nav-bar">
        <button 
          class="pixel-btn"
          :disabled="currentIndex === 0"
          @click="prevTask"
        >
          ◀ ПРЕД.
        </button>
        
        <div class="answer-buttons-mini">
          <button 
            class="answer-btn answer-btn--correct answer-btn--mini"
            :class="{ active: taskResults[currentTask?.id] === 'correct' }"
            @click="setResult('correct')"
          >
            ✅
          </button>
          <button 
            class="answer-btn answer-btn--partial answer-btn--mini"
            :class="{ active: taskResults[currentTask?.id] === 'partial' }"
            @click="setResult('partial')"
          >
            ⚠️
          </button>
          <button 
            class="answer-btn answer-btn--wrong answer-btn--mini"
            :class="{ active: taskResults[currentTask?.id] === 'wrong' }"
            @click="setResult('wrong')"
          >
            ❌
          </button>
        </div>
        
        <button 
          v-if="currentIndex < tasks.length - 1"
          class="pixel-btn pixel-btn--pink"
          @click="nextTask"
        >
          СЛЕД. ▶
        </button>
        <button 
          v-else
          class="pixel-btn pixel-btn--green"
          @click="goToResults"
        >
          🏆 ИТОГИ
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useInterviewStore } from '../stores/interview'
import { livecodingTasks } from '../data/livecoding-tasks'

const router = useRouter()
const store = useInterviewStore()

// Берём только нужное количество задач
const allTasks = livecodingTasks || []
const tasks = computed(() => allTasks.slice(0, store.liveCodingCount))
const currentIndex = ref(0)
const showSolution = ref(false)
const revealedHints = ref([])
const copied = ref(false)
const checkedExpected = ref([])
const checkedRedFlags = ref([])
const taskResults = ref({})

const currentTask = computed(() => {
  if (!tasks.value || tasks.value.length === 0) return null
  return tasks.value[currentIndex.value]
})

async function copyCode() {
  if (!currentTask.value?.code) return
  try {
    await navigator.clipboard.writeText(currentTask.value.code)
    copied.value = true
    setTimeout(() => copied.value = false, 2000)
  } catch (err) {
    console.error('Copy failed:', err)
  }
}

function revealHint(idx) {
  if (!revealedHints.value.includes(idx)) {
    revealedHints.value.push(idx)
  }
}

function toggleExpected(idx) {
  const i = checkedExpected.value.indexOf(idx)
  if (i >= 0) {
    checkedExpected.value.splice(i, 1)
  } else {
    checkedExpected.value.push(idx)
  }
}

function toggleRedFlag(idx) {
  const i = checkedRedFlags.value.indexOf(idx)
  if (i >= 0) {
    checkedRedFlags.value.splice(i, 1)
  } else {
    checkedRedFlags.value.push(idx)
  }
}

function saveCurrentTask() {
  if (!currentTask.value) return
  
  const result = taskResults.value[currentTask.value.id]
  if (result) {
    const redFlags = checkedRedFlags.value
      .filter(idx => currentTask.value.redFlags?.[idx])
      .map(idx => currentTask.value.redFlags[idx])
    
    store.setAnswer(
      currentTask.value.id,
      result,
      redFlags,
      `Expected: ${checkedExpected.value.length}/${currentTask.value.expectedBehavior?.length || 0}`
    )
  }
}

function setResult(result) {
  if (!currentTask.value) return
  taskResults.value[currentTask.value.id] = result
}

function resetTaskState() {
  showSolution.value = false
  revealedHints.value = []
  checkedExpected.value = []
  checkedRedFlags.value = []
}

function prevTask() {
  saveCurrentTask()
  if (currentIndex.value > 0) {
    currentIndex.value--
    resetTaskState()
  }
}

function nextTask() {
  saveCurrentTask()
  if (currentIndex.value < tasks.value.length - 1) {
    currentIndex.value++
    resetTaskState()
  }
}

function goToResults() {
  saveCurrentTask()
  router.push('/results')
}
</script>

<style scoped>
.livecoding-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-dark);
}

.header-bar {
  padding: 12px 24px;
}

.task-title {
  font-family: var(--font-terminal);
  font-size: 18px;
  color: var(--neon-yellow);
}

.task-counter {
  font-family: var(--font-terminal);
  font-size: 16px;
  color: var(--text-secondary);
  margin-left: 12px;
}

/* Split Layout */
.content-split {
  display: flex;
  flex: 1;
  gap: 4px;
  padding: 0 4px;
  min-height: 0;
  overflow: hidden;
}

.panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--bg-card);
  border: 2px solid var(--border-color);
  overflow: hidden;
  min-width: 0;
}

.panel--code {
  border-color: var(--neon-cyan);
}

.panel--solution {
  display: flex;
  flex-direction: column;
}

.panel__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: var(--bg-dark);
  border-bottom: 2px solid var(--border-color);
  font-family: var(--font-pixel);
  font-size: 9px;
  color: var(--neon-cyan);
  flex-shrink: 0;
}

.panel__description {
  padding: 8px 12px;
  font-family: var(--font-terminal);
  font-size: 16px;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.copy-btn, .toggle-btn {
  font-family: var(--font-pixel);
  font-size: 8px;
  padding: 6px 12px;
  background: var(--bg-card);
  border: 2px solid var(--neon-green);
  color: var(--neon-green);
  cursor: pointer;
  transition: all 0.15s;
}

.copy-btn:hover, .toggle-btn:hover {
  background: var(--neon-green);
  color: var(--bg-dark);
}

.code-block {
  flex: 1;
  margin: 0;
  padding: 12px;
  overflow: auto;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 12px;
  line-height: 1.4;
  color: var(--text-primary);
  background: #0d0d12;
  white-space: pre;
  tab-size: 2;
}

.code-block--solution {
  background: #0a120a;
  border-left: 3px solid var(--neon-green);
}

/* Trap Translations */
.trap-translations {
  padding: 12px;
  background: rgba(255, 45, 149, 0.1);
  border-bottom: 2px solid var(--neon-pink);
}

.trap-header {
  font-family: var(--font-pixel);
  font-size: 10px;
  color: var(--neon-pink);
  margin-bottom: 8px;
}

.trap-item {
  margin-bottom: 12px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.3);
  border-left: 3px solid var(--neon-pink);
}

.trap-norwegian {
  font-family: monospace;
  font-size: 11px;
  color: var(--text-secondary);
  margin-bottom: 6px;
  font-style: italic;
}

.trap-translation {
  font-family: var(--font-terminal);
  font-size: 13px;
  color: var(--text-primary);
  line-height: 1.4;
  margin-bottom: 6px;
}

.trap-why-wrong {
  font-family: var(--font-terminal);
  font-size: 13px;
  color: var(--neon-green);
  background: rgba(57, 255, 20, 0.1);
  padding: 6px 8px;
  margin-top: 6px;
}

/* Solution Section */
.solution-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-bottom: 2px solid var(--border-color);
  min-height: 0;
  overflow: hidden;
}

.solution-section .panel__header {
  border-color: var(--neon-green);
}

.solution-content {
  flex: 1;
  overflow: auto;
  min-height: 0;
}

/* Hints Section */
.hints-section {
  flex: 0 0 auto;
  max-height: 180px;
  overflow: auto;
}

.hints-section .panel__header {
  border-color: var(--neon-yellow);
  color: var(--neon-yellow);
}

.hints-list {
  padding: 8px;
}

.hint-item {
  margin-bottom: 6px;
}

.hint-btn {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 10px;
  background: var(--bg-dark);
  border: 2px solid var(--border-color);
  color: var(--text-secondary);
  font-family: var(--font-terminal);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
}

.hint-btn:hover {
  border-color: var(--neon-yellow);
}

.hint-level {
  font-family: var(--font-pixel);
  font-size: 8px;
  color: var(--neon-yellow);
}

.hint-item.revealed .hint-btn {
  border-color: var(--neon-yellow);
  background: rgba(255, 247, 0, 0.1);
}

.hint-text {
  padding: 6px 10px;
  font-family: var(--font-terminal);
  font-size: 14px;
  color: var(--text-primary);
  background: rgba(255, 247, 0, 0.05);
  border: 1px solid rgba(255, 247, 0, 0.2);
  border-top: none;
}

/* Evaluation Bar */
.evaluation-bar {
  display: flex;
  gap: 16px;
  padding: 10px 16px;
  background: var(--bg-card);
  border-top: 2px solid var(--border-color);
  max-height: 130px;
  overflow: auto;
  flex-shrink: 0;
}

.eval-section {
  flex: 1;
}

.eval-section--red .pixel-checkbox__box {
  border-color: var(--neon-pink);
}

.eval-section--red .pixel-checkbox input:checked + .pixel-checkbox__box {
  background: var(--neon-pink);
  border-color: var(--neon-pink);
}

.eval-label {
  font-family: var(--font-pixel);
  font-size: 8px;
  color: var(--neon-green);
  display: block;
  margin-bottom: 6px;
}

.eval-section--red .eval-label {
  color: var(--neon-pink);
}

.eval-items {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.eval-items .pixel-checkbox {
  padding: 3px 0;
}

.eval-items .pixel-checkbox__box {
  width: 18px;
  height: 18px;
}

.eval-items .pixel-checkbox__label {
  font-size: 13px;
}

/* Navigation Bar */
.nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background: var(--bg-dark);
  border-top: 2px solid var(--border-color);
  flex-shrink: 0;
}

.answer-buttons-mini {
  display: flex;
  gap: 8px;
}

.answer-btn--mini {
  padding: 6px 14px;
  min-width: auto;
}

.answer-btn--mini .answer-btn__icon {
  font-size: 18px;
}

.pixel-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
</style>
