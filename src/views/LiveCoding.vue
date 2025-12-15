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
          <button class="back-btn" @click="goBackToQuestions" title="Вернуться к вопросам">
            ◀
          </button>
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
                  <div class="trap-indonesian">{{ trap.indonesian }}</div>
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

          <!-- Tabs for Hints/Questions -->
          <div class="tabs-section">
            <div class="tabs-header">
              <button 
                class="tab-btn" 
                :class="{ active: rightTab === 'hints' }"
                @click="rightTab = 'hints'"
              >
                💡 Подсказки
              </button>
              <button 
                class="tab-btn" 
                :class="{ active: rightTab === 'questions' }"
                @click="rightTab = 'questions'"
              >
                🤔 Контр-вопросы
              </button>
            </div>
            
            <!-- Hints Tab -->
            <div v-if="rightTab === 'hints'" class="tab-content">
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
                    <span class="hint-level">{{ hint.level }}</span>
                    <span v-if="revealedHints.includes(idx)" class="hint-text-inline">
                      {{ hint.text }}
                    </span>
                    <span v-else class="hint-hidden">👆 клик</span>
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Questions Tab -->
            <div v-if="rightTab === 'questions'" class="tab-content">
              <div class="critical-questions">
                <div 
                  v-for="(item, idx) in currentTask?.criticalQuestions || []" 
                  :key="'q-' + idx"
                  class="critical-question"
                  :class="{ expanded: expandedQuestions.includes(idx) }"
                  @click="toggleQuestion(idx)"
                >
                  <div class="cq-question">{{ item.q }}</div>
                  <div v-if="expandedQuestions.includes(idx)" class="cq-answer">
                    ✅ {{ item.a }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom: Evaluation with Scroll -->
      <div class="evaluation-bar">
        <div class="eval-column">
          <span class="eval-label">✓ Ожидаемое поведение:</span>
          <div class="eval-list">
            <label 
              v-for="(item, idx) in currentTask?.expectedBehavior || []" 
              :key="'exp-' + idx"
              class="eval-checkbox"
            >
              <input 
                type="checkbox" 
                :checked="checkedExpected.includes(idx)"
                @change="toggleExpected(idx)"
              />
              <span class="checkbox-icon">{{ checkedExpected.includes(idx) ? '✓' : '○' }}</span>
              <span class="checkbox-label">{{ item }}</span>
            </label>
          </div>
        </div>

        <div class="eval-column eval-column--red">
          <span class="eval-label">🚩 Red Flags:</span>
          <div class="eval-list">
            <label 
              v-for="(item, idx) in currentTask?.redFlags || []" 
              :key="'red-' + idx"
              class="eval-checkbox eval-checkbox--red"
            >
              <input 
                type="checkbox" 
                :checked="checkedRedFlags.includes(idx)"
                @change="toggleRedFlag(idx)"
              />
              <span class="checkbox-icon">{{ checkedRedFlags.includes(idx) ? '✗' : '○' }}</span>
              <span class="checkbox-label">{{ item }}</span>
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

const router = useRouter()
const store = useInterviewStore()

// Берём задачи из store (уже выбраны при старте интервью)
const tasks = computed(() => store.selectedLiveCodingTasks)
const currentIndex = ref(0)
const showSolution = ref(false)
const rightTab = ref('hints')
const revealedHints = ref([])
const copied = ref(false)
const checkedExpected = ref([])
const checkedRedFlags = ref([])
const expandedQuestions = ref([])
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

function toggleQuestion(idx) {
  const i = expandedQuestions.value.indexOf(idx)
  if (i === -1) {
    expandedQuestions.value.push(idx)
  } else {
    expandedQuestions.value.splice(i, 1)
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
  expandedQuestions.value = []
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

function goBackToQuestions() {
  saveCurrentTask()
  router.push('/interview')
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

.back-btn {
  font-family: var(--font-pixel);
  font-size: 14px;
  padding: 6px 10px;
  background: transparent;
  color: var(--text-secondary);
  border: 2px solid var(--border-color);
  cursor: pointer;
  margin-right: 12px;
  transition: all 0.15s;
}

.back-btn:hover {
  border-color: var(--neon-cyan);
  color: var(--neon-cyan);
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
/* Tabs Section */
.tabs-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-top: 2px solid var(--border-color);
  min-height: 0;
  overflow: hidden;
}

.tabs-header {
  display: flex;
  background: var(--bg-dark);
  border-bottom: 2px solid var(--border-color);
  flex-shrink: 0;
}

.tab-btn {
  flex: 1;
  padding: 8px 12px;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-family: var(--font-pixel);
  font-size: 10px;
  cursor: pointer;
  transition: all 0.15s;
}

.tab-btn:hover {
  background: rgba(255, 255, 255, 0.05);
}

.tab-btn.active {
  background: var(--bg-card);
  color: var(--neon-yellow);
  border-bottom: 2px solid var(--neon-yellow);
  margin-bottom: -2px;
}

.tab-content {
  flex: 1;
  overflow-y: auto;
  padding: 6px;
}

.hints-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.hint-item {
  margin-bottom: 0;
}

.hint-btn {
  width: 100%;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px 10px;
  background: var(--bg-dark);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  font-family: var(--font-terminal);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
}

.hint-btn:hover {
  border-color: var(--neon-yellow);
}

.hint-level {
  font-family: var(--font-pixel);
  font-size: 11px;
  color: var(--neon-yellow);
  background: rgba(255, 247, 0, 0.2);
  padding: 3px 8px;
  flex-shrink: 0;
}

.hint-item.revealed .hint-btn {
  border-color: var(--neon-yellow);
  background: rgba(255, 247, 0, 0.1);
}

.hint-text-inline {
  color: var(--text-primary);
  flex: 1;
  line-height: 1.4;
}

.hint-hidden {
  color: var(--text-muted);
  font-size: 11px;
}

/* Evaluation Bar */
.evaluation-bar {
  display: flex;
  gap: 16px;
  padding: 8px 12px;
  background: var(--bg-card);
  border-top: 2px solid var(--border-color);
  flex-shrink: 0;
  max-height: 140px;
  overflow-y: auto;
}

.eval-column {
  flex: 1;
  min-width: 0;
}

.eval-label {
  font-family: var(--font-pixel);
  font-size: 9px;
  color: var(--neon-green);
  display: block;
  margin-bottom: 6px;
}

.eval-column--red .eval-label {
  color: var(--neon-pink);
}

.eval-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.eval-checkbox {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 4px 8px;
  background: var(--bg-dark);
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.15s;
}

.eval-checkbox:hover {
  border-color: var(--neon-green);
  background: rgba(57, 255, 20, 0.05);
}

.eval-checkbox input {
  display: none;
}

.eval-checkbox .checkbox-icon {
  font-size: 14px;
  color: var(--text-muted);
  flex-shrink: 0;
  width: 18px;
  text-align: center;
}

.eval-checkbox input:checked ~ .checkbox-icon {
  color: var(--neon-green);
}

.eval-checkbox .checkbox-label {
  font-family: var(--font-terminal);
  font-size: 13px;
  color: var(--text-primary);
  line-height: 1.3;
}

.eval-checkbox input:checked ~ .checkbox-label {
  color: var(--neon-green);
}

/* Red variant */
.eval-checkbox--red:hover {
  border-color: var(--neon-pink);
  background: rgba(255, 16, 240, 0.05);
}

.eval-checkbox--red input:checked ~ .checkbox-icon {
  color: var(--neon-pink);
}

.eval-checkbox--red input:checked ~ .checkbox-label {
  color: var(--neon-pink);
}

/* Critical Questions in Tab */
.critical-questions {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.critical-question {
  font-family: var(--font-terminal);
  font-size: 13px;
  padding: 10px 12px;
  background: rgba(0, 255, 255, 0.05);
  border-left: 3px solid var(--neon-cyan);
  cursor: pointer;
  transition: all 0.15s;
}

.critical-question:hover {
  background: rgba(0, 255, 255, 0.1);
}

.critical-question.expanded {
  background: rgba(0, 255, 255, 0.1);
  border-left-width: 5px;
}

.cq-question {
  color: var(--neon-cyan);
  line-height: 1.4;
}

.cq-answer {
  color: var(--neon-green);
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed rgba(0, 255, 255, 0.3);
  line-height: 1.4;
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
