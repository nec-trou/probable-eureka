<template>
  <div class="interview-page">
    <!-- Top Info Bar with Seed -->
    <div class="top-info-bar">
      <div class="top-info-left">
        <div class="seed-display">
          <span class="seed-label">SEED:</span>
          <span class="seed-value">{{ store.currentSeed }}</span>
        </div>
        <div class="name-display">
          <span class="name-label">👤</span>
          <input 
            v-if="editingName"
            v-model="editedName"
            class="name-input"
            @blur="saveName"
            @keyup.enter="saveName"
            ref="nameInput"
          />
          <span 
            v-else 
            class="name-value" 
            @click="startEditName"
            title="Кликни чтобы изменить"
          >
            {{ store.candidateName }}
            <span class="edit-icon">✏️</span>
          </span>
        </div>
      </div>
      <div class="top-info-actions">
        <button class="toc-btn" @click="showTOC = !showTOC">
          📋 Оглавление
        </button>
      </div>
    </div>

    <!-- Table of Contents Sidebar -->
    <div v-if="showTOC" class="toc-overlay" @click.self="showTOC = false">
      <div class="toc-sidebar">
        <div class="toc-header">
          <span>📋 ОГЛАВЛЕНИЕ</span>
          <button class="toc-close" @click="showTOC = false">✕</button>
        </div>
        <div class="toc-content">
          <div 
            v-for="(sec, sIdx) in store.allSections" 
            :key="sec.id"
            class="toc-section"
            :class="{ active: sIdx === store.currentSectionIndex }"
          >
            <div class="toc-section-header" @click="jumpToSection(sIdx)">
              <span>{{ sec.icon }} {{ sec.name }}</span>
              <span class="toc-progress">
                {{ getSectionAnswered(sec.id) }}/{{ getSectionTotal(sec.id) }}
              </span>
            </div>
            <div class="toc-questions">
              <div 
                v-for="(q, qIdx) in getQuestionsForSection(sec.id)"
                :key="q.id"
                class="toc-question"
                :class="getQuestionStatus(q.id)"
                @click="jumpToQuestion(sIdx, qIdx)"
              >
                <span class="toc-q-num">{{ qIdx + 1 }}.</span>
                <span class="toc-q-text">
                  {{ q.question.substring(0, 40) }}...
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Section Preamble Modal -->
    <div v-if="showPreamble && section" class="preamble-overlay">
      <div class="preamble-modal pixel-card">
        <div class="preamble-icon">{{ section.icon }}</div>
        <h2 class="preamble-title">{{ section.name }}</h2>
        
        <p class="preamble-text">{{ section.preamble }}</p>
        
        <div class="preamble-stats">
          <span class="stat-value">{{ questionsCount }}</span>
          <span class="stat-label">вопросов в секции</span>
        </div>
        
        <p class="preamble-hint" v-if="section.hint">
          💡 {{ section.hint }}
        </p>
        
        <button class="pixel-btn pixel-btn--green" @click="startSection">
          ▶ НАЧАТЬ
        </button>
      </div>
    </div>

    <!-- Empty section handler -->
    <div v-if="!showPreamble && questionsCount === 0" class="empty-section">
      <div class="page-container text-center">
        <p class="terminal-text mb-lg">
          В этой секции нет вопросов в выбранном пуле
        </p>
        <button 
          v-if="!isLastSection"
          class="pixel-btn pixel-btn--yellow"
          @click="goNextSection"
        >
          {{ nextSectionName }} ▶
        </button>
        <button 
          v-else
          class="pixel-btn pixel-btn--green"
          @click="goToLiveCoding"
        >
          💻 LIVE CODING
        </button>
      </div>
    </div>

    <!-- Main content -->
    <template v-if="!showPreamble && questionsCount > 0 && question">
      <!-- Header -->
      <div class="header-bar">
        <div class="header-bar__section">
          <span class="section-icon">{{ section.icon }}</span>
          <span class="section-name">{{ section.name }}</span>
          <span class="section-counter">
            ({{ store.currentSectionIndex + 1 }}/{{ totalSections }})
          </span>
        </div>
        <div class="question-counter">
          {{ qNum.current }}/{{ qNum.total }}
        </div>
      </div>

      <div class="page-container" style="padding-top: 0;">
        <!-- Question Card -->
        <div class="question-card">
          <!-- Main Question with variants -->
          <div class="question-variants">
            <div class="variant-tabs" v-if="question.altQuestions?.length">
              <button 
                class="variant-tab"
                :class="{ active: questionVariant === 0 }"
                @click="questionVariant = 0"
                title="Основная формулировка"
              >
                Q
              </button>
              <button 
                class="variant-tab"
                :class="{ active: questionVariant === 1 }"
                @click="questionVariant = 1"
                title="Альтернатива 1"
              >
                А1
              </button>
              <button 
                class="variant-tab"
                :class="{ active: questionVariant === 2 }"
                @click="questionVariant = 2"
                title="Альтернатива 2"
                v-if="question.altQuestions?.[1]"
              >
                А2
              </button>
            </div>
            <div class="question-card__main">
              {{ currentQuestionText }}
            </div>
          </div>
          
          <!-- Follow-up with variants -->
          <div v-if="question.followUp" class="question-variants">
            <div class="variant-tabs" v-if="question.altFollowUps?.length">
              <button 
                class="variant-tab variant-tab--small"
                :class="{ active: followUpVariant === 0 }"
                @click="followUpVariant = 0"
                title="Основной follow-up"
              >
                F
              </button>
              <button 
                class="variant-tab variant-tab--small"
                :class="{ active: followUpVariant === 1 }"
                @click="followUpVariant = 1"
                title="Альтернатива 1"
              >
                1
              </button>
              <button 
                class="variant-tab variant-tab--small"
                :class="{ active: followUpVariant === 2 }"
                @click="followUpVariant = 2"
                title="Альтернатива 2"
                v-if="question.altFollowUps?.[1]"
              >
                2
              </button>
            </div>
            <div class="question-card__followup">
              <strong>🔄 Follow-up:</strong> {{ currentFollowUpText }}
            </div>
          </div>
          
          <div class="question-card__expected">
            <strong>👁 Ожидаемый ответ:</strong>
            <div class="expected-text">{{ question.expectedAnswer }}</div>
          </div>

          <!-- Interviewer Notes (collapsible) -->
          <div 
            v-if="question.interviewerNotes" 
            class="interviewer-notes"
            :class="{ expanded: showNotes }"
          >
            <button 
              class="notes-toggle" 
              @click="showNotes = !showNotes"
            >
              📋 {{ showNotes ? 'Скрыть' : 'Показать' }} справку
            </button>
            
            <div v-if="showNotes" class="notes-content">
              <div class="notes-item" v-if="question.interviewerNotes.whyAsking">
                <div class="notes-label">🎯 Зачем спрашиваем:</div>
                <div class="notes-text">
                  {{ question.interviewerNotes.whyAsking }}
                </div>
              </div>
              
              <div class="notes-item" v-if="question.interviewerNotes.idealAnswer">
                <div class="notes-label">⭐ Идеальный ответ:</div>
                <div class="notes-text">
                  {{ question.interviewerNotes.idealAnswer }}
                </div>
              </div>
              
              <div 
                class="notes-item" 
                v-if="question.interviewerNotes.partialAnswer"
              >
                <div class="notes-label">⚠️ Частичный ответ:</div>
                <div class="notes-text">
                  {{ question.interviewerNotes.partialAnswer }}
                </div>
              </div>
              
              <div 
                class="notes-item" 
                v-if="question.interviewerNotes.followUpNotes"
              >
                <div class="notes-label">🔄 По follow-up:</div>
                <div class="notes-text">
                  {{ question.interviewerNotes.followUpNotes }}
                </div>
              </div>
              
              <div 
                class="notes-item" 
                v-if="question.interviewerNotes.realWorldExample"
              >
                <div class="notes-label">💼 Пример из практики:</div>
                <div class="notes-text notes-text--code">
                  {{ question.interviewerNotes.realWorldExample }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Answer Buttons -->
        <div class="answer-section">
          <div class="answer-buttons">
            <button 
              class="answer-btn answer-btn--correct"
              :class="{ active: currentAnswer?.result === 'correct' }"
              @click="setResult('correct')"
            >
              <span class="answer-btn__icon">✅</span>
              <span class="answer-btn__text">Верно</span>
              <kbd>1</kbd>
            </button>
            <button 
              class="answer-btn answer-btn--partial"
              :class="{ active: currentAnswer?.result === 'partial' }"
              @click="setResult('partial')"
            >
              <span class="answer-btn__icon">⚠️</span>
              <span class="answer-btn__text">Частично</span>
              <kbd>2</kbd>
            </button>
            <button 
              class="answer-btn answer-btn--wrong"
              :class="{ active: currentAnswer?.result === 'wrong' }"
              @click="setResult('wrong')"
            >
              <span class="answer-btn__icon">❌</span>
              <span class="answer-btn__text">Не знает</span>
              <kbd>3</kbd>
            </button>
            <button 
              class="answer-btn answer-btn--skip"
              :class="{ active: currentAnswer?.result === 'skipped' }"
              @click="setResult('skipped')"
            >
              <span class="answer-btn__icon">⏭</span>
              <span class="answer-btn__text">Пропуск</span>
              <kbd>4</kbd>
            </button>
          </div>
        </div>

        <!-- Red Flags -->
        <div 
          v-if="question.redFlags?.length > 0" 
          class="redflags-section"
        >
          <span class="section-label">🚩 RED FLAGS:</span>
          <div class="redflags-list">
            <label 
              v-for="(flag, idx) in question.redFlags" 
              :key="idx"
              class="pixel-checkbox"
            >
              <input 
                type="checkbox" 
                :checked="selectedRedFlags.includes(flag)"
                @change="toggleRedFlag(flag)"
              />
              <span class="pixel-checkbox__box"></span>
              <span class="pixel-checkbox__label">{{ flag }}</span>
            </label>
          </div>
        </div>

        <!-- Comment -->
        <div class="comment-section">
          <span class="section-label">💬 ЗАМЕТКА:</span>
          <textarea 
            v-model="comment"
            class="pixel-textarea"
            placeholder="Что сказал, как рассуждал..."
            rows="2"
          ></textarea>
        </div>

        <!-- Progress -->
        <div class="progress-section">
          <div class="pixel-progress">
            <div 
              class="pixel-progress__fill" 
              :style="{ width: sectionProgressPercent + '%' }"
            ></div>
          </div>
        </div>

        <!-- Navigation -->
        <div class="nav-buttons">
          <button 
            class="pixel-btn"
            :disabled="store.currentQuestionIndex === 0"
            @click="prevQuestion"
          >
            ◀ НАЗАД
          </button>
          
          <button 
            v-if="!isLastInSection"
            class="pixel-btn pixel-btn--pink"
            @click="nextQuestion"
          >
            ДАЛЕЕ ▶
          </button>
          
          <button 
            v-else-if="!isLastSection"
            class="pixel-btn pixel-btn--yellow"
            @click="goNextSection"
          >
            {{ nextSectionName }} ▶
          </button>
          
          <button 
            v-else
            class="pixel-btn pixel-btn--green"
            @click="goToLiveCoding"
          >
            💻 LIVE CODING
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useInterviewStore } from '../stores/interview'

const router = useRouter()
const store = useInterviewStore()

const selectedRedFlags = ref([])
const comment = ref('')
const showNotes = ref(store.expandNotesDefault)
const showTOC = ref(false)
const editingName = ref(false)
const editedName = ref('')
const nameInput = ref(null)
const questionVariant = ref(0)  // 0 = main, 1 = alt1, 2 = alt2
const followUpVariant = ref(0)  // 0 = main, 1 = alt1, 2 = alt2

// Computed
const showPreamble = computed(() => store.showSectionPreamble)
const section = computed(() => store.currentSection)
const question = computed(() => store.currentQuestion)
const qNum = computed(() => store.currentQuestionNumber)
const isLastInSection = computed(() => store.isLastQuestionInSection)
const isLastSection = computed(() => store.isLastSection)
const totalSections = computed(() => store.allSections.length)
const questionsCount = computed(() => store.totalQuestionsInSection)

const currentAnswer = computed(() => 
  question.value ? store.answers[question.value.id] : null
)

// Question/FollowUp variant text
const currentQuestionText = computed(() => {
  if (!question.value) return ''
  if (questionVariant.value === 0) return question.value.question
  if (questionVariant.value === 1) return question.value.altQuestions?.[0] || question.value.question
  if (questionVariant.value === 2) return question.value.altQuestions?.[1] || question.value.question
  return question.value.question
})

const currentFollowUpText = computed(() => {
  if (!question.value) return ''
  if (followUpVariant.value === 0) return question.value.followUp
  if (followUpVariant.value === 1) return question.value.altFollowUps?.[0] || question.value.followUp
  if (followUpVariant.value === 2) return question.value.altFollowUps?.[1] || question.value.followUp
  return question.value.followUp
})

const sectionProgressPercent = computed(() => {
  if (questionsCount.value === 0) return 0
  return Math.round(
    ((store.currentQuestionIndex + 1) / questionsCount.value) * 100
  )
})

const nextSectionName = computed(() => {
  const nextIdx = store.currentSectionIndex + 1
  if (nextIdx < store.allSections.length) {
    const next = store.allSections[nextIdx]
    return next.icon + ' ' + next.name
  }
  return ''
})

// Watch for question changes
watch(
  () => question.value?.id,
  () => {
    showNotes.value = store.expandNotesDefault
    // Reset variants when question changes
    questionVariant.value = 0
    followUpVariant.value = 0
    if (currentAnswer.value) {
      selectedRedFlags.value = [...(currentAnswer.value.redFlags || [])]
      comment.value = currentAnswer.value.comment || ''
    } else {
      selectedRedFlags.value = []
      comment.value = ''
    }
  },
  { immediate: true }
)

// Keyboard shortcuts
function handleKeydown(e) {
  // Ignore if typing in textarea
  if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') {
    return
  }
  
  if (showPreamble.value) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      startSection()
    }
    return
  }
  
  if (e.key === '1') setResult('correct')
  if (e.key === '2') setResult('partial')
  if (e.key === '3') setResult('wrong')
  if (e.key === '4') setResult('skipped')
  
  if (e.key === 'ArrowRight' || e.key === 'Enter') {
    e.preventDefault()
    if (isLastInSection.value) {
      if (!isLastSection.value) goNextSection()
      else goToResults()
    } else {
      nextQuestion()
    }
  }
  if (e.key === 'ArrowLeft') {
    e.preventDefault()
    prevQuestion()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

// Actions
function startSection() {
  store.dismissPreamble()
}

function setResult(result) {
  if (!question.value) return
  store.setAnswer(
    question.value.id, 
    result, 
    selectedRedFlags.value, 
    comment.value
  )
}

function toggleRedFlag(flag) {
  const idx = selectedRedFlags.value.indexOf(flag)
  if (idx >= 0) {
    selectedRedFlags.value.splice(idx, 1)
  } else {
    selectedRedFlags.value.push(flag)
  }
  if (currentAnswer.value && question.value) {
    store.setAnswer(
      question.value.id,
      currentAnswer.value.result,
      selectedRedFlags.value,
      comment.value
    )
  }
}

function saveCurrentAnswer() {
  if (currentAnswer.value && question.value) {
    store.setAnswer(
      question.value.id,
      currentAnswer.value.result,
      selectedRedFlags.value,
      comment.value
    )
  }
}

function prevQuestion() {
  saveCurrentAnswer()
  store.prevQuestion()
}

function nextQuestion() {
  saveCurrentAnswer()
  store.nextQuestion()
}

function goNextSection() {
  saveCurrentAnswer()
  store.nextSection()
}

function goToLiveCoding() {
  saveCurrentAnswer()
  router.push('/livecoding')
}

// TOC helpers
function getQuestionsForSection(sectionId) {
  return store.shuffledQuestions.filter(q => q.section === sectionId)
}

function getSectionTotal(sectionId) {
  return getQuestionsForSection(sectionId).length
}

function getSectionAnswered(sectionId) {
  return getQuestionsForSection(sectionId)
    .filter(q => store.answers[q.id]).length
}

function getQuestionStatus(questionId) {
  const answer = store.answers[questionId]
  if (!answer) return ''
  return answer.result
}

function jumpToSection(sectionIndex) {
  saveCurrentAnswer()
  store.currentSectionIndex = sectionIndex
  store.currentQuestionIndex = 0
  store.showSectionPreamble = false
  showTOC.value = false
}

function jumpToQuestion(sectionIndex, questionIndex) {
  saveCurrentAnswer()
  store.currentSectionIndex = sectionIndex
  store.currentQuestionIndex = questionIndex
  store.showSectionPreamble = false
  showTOC.value = false
}

// Name editing
function startEditName() {
  editedName.value = store.candidateName
  editingName.value = true
  nextTick(() => {
    nameInput.value?.focus()
    nameInput.value?.select()
  })
}

function saveName() {
  const name = editedName.value.trim()
  if (name) {
    store.setCandidateName(name)
  }
  editingName.value = false
}
</script>

<style scoped>
.interview-page {
  min-height: 100vh;
  position: relative;
}

/* Top Info Bar */
.top-info-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 16px;
  background: var(--bg-dark);
  border-bottom: 2px solid var(--border-color);
  z-index: 50;
}

.top-info-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.seed-display {
  display: flex;
  align-items: center;
  gap: 8px;
}

.name-display {
  display: flex;
  align-items: center;
  gap: 6px;
}

.name-label {
  font-size: 14px;
}

.name-value {
  font-family: var(--font-terminal);
  font-size: 14px;
  color: var(--text-primary);
  cursor: pointer;
  padding: 2px 6px;
  border: 1px dashed transparent;
  transition: all 0.15s;
}

.name-value:hover {
  border-color: var(--neon-cyan);
  background: rgba(102, 217, 255, 0.1);
}

.edit-icon {
  font-size: 10px;
  opacity: 0;
  transition: opacity 0.15s;
}

.name-value:hover .edit-icon {
  opacity: 0.7;
}

.name-input {
  font-family: var(--font-terminal);
  font-size: 14px;
  color: var(--neon-cyan);
  background: var(--bg-dark);
  border: 2px solid var(--neon-cyan);
  padding: 2px 6px;
  width: 150px;
}

.seed-label {
  font-family: var(--font-pixel);
  font-size: 8px;
  color: var(--text-secondary);
}

.seed-value {
  font-family: var(--font-pixel);
  font-size: 12px;
  color: var(--neon-cyan);
  letter-spacing: 2px;
}

.toc-btn {
  font-family: var(--font-pixel);
  font-size: 9px;
  padding: 6px 12px;
  background: var(--bg-card);
  border: 2px solid var(--neon-pink);
  color: var(--neon-pink);
  cursor: pointer;
  transition: all 0.15s;
}

.toc-btn:hover {
  background: var(--neon-pink);
  color: var(--bg-dark);
}

/* TOC Sidebar */
.toc-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 200;
}

.toc-sidebar {
  position: fixed;
  top: 0;
  right: 0;
  width: 350px;
  max-width: 90vw;
  height: 100vh;
  background: var(--bg-card);
  border-left: 3px solid var(--neon-pink);
  overflow-y: auto;
  animation: slideIn 0.2s ease;
}

@keyframes slideIn {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

.toc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: var(--bg-dark);
  border-bottom: 2px solid var(--border-color);
  font-family: var(--font-pixel);
  font-size: 11px;
  color: var(--neon-pink);
  position: sticky;
  top: 0;
}

.toc-close {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 18px;
  cursor: pointer;
}

.toc-close:hover {
  color: var(--neon-pink);
}

.toc-content {
  padding: 8px;
}

.toc-section {
  margin-bottom: 8px;
  border: 2px solid var(--border-color);
}

.toc-section.active {
  border-color: var(--neon-cyan);
}

.toc-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: var(--bg-dark);
  font-family: var(--font-pixel);
  font-size: 9px;
  color: var(--text-primary);
  cursor: pointer;
  transition: background 0.15s;
}

.toc-section-header:hover {
  background: rgba(102, 217, 255, 0.1);
}

.toc-progress {
  font-family: var(--font-terminal);
  font-size: 12px;
  color: var(--text-secondary);
}

.toc-questions {
  padding: 4px;
}

.toc-question {
  display: flex;
  gap: 6px;
  padding: 6px 8px;
  font-family: var(--font-terminal);
  font-size: 12px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s;
  border-left: 3px solid transparent;
}

.toc-question:hover {
  background: rgba(255, 255, 255, 0.05);
}

.toc-question.correct {
  border-left-color: var(--neon-green);
  color: var(--neon-green);
}

.toc-question.partial {
  border-left-color: var(--neon-yellow);
  color: var(--neon-yellow);
}

.toc-question.wrong {
  border-left-color: var(--neon-pink);
  color: var(--neon-pink);
}

.toc-question.skipped {
  border-left-color: var(--text-secondary);
}

.toc-q-num {
  flex-shrink: 0;
  width: 20px;
  color: var(--text-secondary);
}

.toc-q-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Adjust for fixed top bar */
.interview-page {
  padding-top: 36px;
}

/* Preamble Modal */
.preamble-overlay {
  position: fixed;
  top: 36px;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(10, 10, 15, 0.95);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  padding: 24px;
}

.preamble-modal {
  max-width: 500px;
  text-align: center;
  animation: modalIn 0.3s ease;
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.preamble-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.preamble-title {
  font-family: var(--font-pixel);
  font-size: 18px;
  color: var(--neon-cyan);
  margin-bottom: 24px;
}

.preamble-text {
  font-family: var(--font-terminal);
  font-size: 22px;
  color: var(--text-secondary);
  margin-bottom: 24px;
  line-height: 1.5;
}

.preamble-stats {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
}

.stat-value {
  font-family: var(--font-pixel);
  font-size: 32px;
  color: var(--neon-pink);
}

.stat-label {
  font-family: var(--font-terminal);
  font-size: 18px;
  color: var(--text-secondary);
}

.preamble-hint {
  font-family: var(--font-terminal);
  font-size: 18px;
  color: var(--neon-green);
  background: rgba(57, 255, 20, 0.1);
  padding: 12px;
  margin-bottom: 24px;
}

/* Empty section */
.empty-section {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Header */
.header-bar__section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-icon {
  font-size: 24px;
}

.section-name {
  font-family: var(--font-pixel);
  font-size: 12px;
  color: var(--neon-pink);
}

.section-counter {
  font-family: var(--font-terminal);
  font-size: 16px;
  color: var(--text-secondary);
}

.question-counter {
  font-family: var(--font-pixel);
  font-size: 14px;
  color: var(--neon-cyan);
}

/* Question Variants */
.question-variants {
  position: relative;
  margin-bottom: 16px;
}

.variant-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 8px;
}

.variant-tab {
  font-family: var(--font-pixel);
  font-size: 10px;
  padding: 4px 10px;
  background: var(--bg-dark);
  border: 2px solid var(--border-color);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s;
}

.variant-tab:hover {
  border-color: var(--neon-cyan);
  color: var(--neon-cyan);
}

.variant-tab.active {
  background: var(--neon-cyan);
  border-color: var(--neon-cyan);
  color: var(--bg-dark);
}

.variant-tab--small {
  font-size: 9px;
  padding: 3px 8px;
}

/* Question Card */
.question-card__main {
  font-family: var(--font-terminal);
  font-size: 24px;
  color: var(--text-primary);
  margin-bottom: 16px;
  line-height: 1.4;
}

.question-card__followup {
  font-family: var(--font-terminal);
  font-size: 18px;
  color: var(--neon-yellow);
  padding: 12px 16px;
  border-left: 4px solid var(--neon-yellow);
  background: rgba(255, 247, 0, 0.05);
  margin-bottom: 16px;
}

.question-card__expected {
  font-family: var(--font-terminal);
  font-size: 16px;
  color: var(--neon-green);
  background: rgba(57, 255, 20, 0.1);
  padding: 12px 16px;
  border-left: 4px solid var(--neon-green);
}

.expected-text {
  margin-top: 8px;
  font-size: 18px;
  line-height: 1.4;
}

/* Interviewer Notes */
.interviewer-notes {
  margin-top: 16px;
  border: 2px dashed rgba(102, 217, 255, 0.3);
  background: rgba(102, 217, 255, 0.05);
}

.notes-toggle {
  width: 100%;
  padding: 12px 16px;
  background: transparent;
  border: none;
  font-family: var(--font-pixel);
  font-size: 10px;
  color: var(--neon-cyan);
  cursor: pointer;
  text-align: left;
  transition: background 0.2s;
}

.notes-toggle:hover {
  background: rgba(102, 217, 255, 0.1);
}

.notes-content {
  padding: 0 16px 16px;
}

.notes-item {
  margin-bottom: 12px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.3);
  border-left: 3px solid var(--neon-cyan);
}

.notes-item:last-child {
  margin-bottom: 0;
}

.notes-label {
  font-family: var(--font-pixel);
  font-size: 9px;
  color: var(--neon-cyan);
  margin-bottom: 6px;
}

.notes-text {
  font-family: var(--font-terminal);
  font-size: 14px;
  color: var(--text-primary);
  line-height: 1.5;
}

.notes-text--code {
  font-family: monospace;
  font-size: 13px;
  background: rgba(0, 0, 0, 0.4);
  padding: 8px;
  white-space: pre-wrap;
}

/* Sections */
.section-label {
  font-family: var(--font-pixel);
  font-size: 10px;
  color: var(--text-secondary);
  text-transform: uppercase;
  margin-bottom: 12px;
  display: block;
}

.answer-section {
  margin: 24px 0;
}

.answer-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.answer-btn {
  flex: 1;
  min-width: 90px;
  position: relative;
}

.answer-btn kbd {
  position: absolute;
  bottom: 4px;
  right: 4px;
  font-family: var(--font-pixel);
  font-size: 8px;
  opacity: 0.5;
}

.answer-btn__text {
  font-size: 10px;
}

.redflags-section {
  background: rgba(255, 45, 149, 0.05);
  padding: 16px;
  border: 2px solid rgba(255, 45, 149, 0.3);
  margin-bottom: 16px;
}

.redflags-section .section-label {
  color: var(--neon-pink);
}

.redflags-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.comment-section {
  margin-bottom: 16px;
}

.progress-section {
  margin-bottom: 16px;
}

.nav-buttons {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.nav-buttons .pixel-btn {
  flex: 1;
  max-width: 250px;
}

.nav-buttons .pixel-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
</style>
