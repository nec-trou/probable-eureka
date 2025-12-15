<template>
  <div class="results-page">
    <div class="page-container">
      <h1 class="pixel-title">🏆 ИНТЕРВЬЮ ЗАВЕРШЕНО 🏆</h1>

      <!-- Candidate Info -->
      <div class="candidate-info mb-lg">
        <div class="info-row">
          <span class="info-label">Кандидат:</span>
          <input 
            v-if="editingName"
            v-model="editedName"
            class="name-edit-input"
            @blur="saveName"
            @keyup.enter="saveName"
            ref="nameInput"
          />
          <span 
            v-else 
            class="info-value info-value--editable" 
            @click="startEditName"
          >
            {{ store.candidateName }}
            <span class="edit-hint">✏️</span>
          </span>
        </div>
        <div class="info-row">
          <span class="info-label">Пул:</span>
          <span class="info-value-small">
            {{ store.poolLabels[store.selectedPool] }}
          </span>
          <span class="info-divider">|</span>
          <span class="info-label">Seed:</span>
          <span class="info-value-seed" @click="copySeed">
            {{ store.currentSeed }}
            <span class="copy-hint">📋</span>
          </span>
        </div>
      </div>

      <!-- Section Scores -->
      <div class="scores-section pixel-card mb-lg">
        <div 
          v-for="section in displaySections" 
          :key="section.id"
          class="category-bar"
        >
          <div class="category-bar__label">
            {{ section.icon }} {{ section.name }}
          </div>
          <div class="category-bar__track">
            <div 
              v-for="i in 10" 
              :key="i"
              class="category-bar__block"
              :class="getBlockClass(section.id, i)"
            ></div>
          </div>
          <div class="category-bar__stats">
            <span class="answered">
              {{ sectionProgress[section.id]?.answered || 0 }}/{{ sectionProgress[section.id]?.total || 0 }}
            </span>
            <span class="percent">
              {{ sectionProgress[section.id]?.percent || 0 }}%
            </span>
          </div>
        </div>

        <!-- Overall Score -->
        <div class="overall-section">
          <div class="overall-label">ИТОГО:</div>
          <div class="overall-bar">
            <div 
              v-for="i in 10" 
              :key="i"
              class="category-bar__block"
              :class="{ filled: i <= Math.round(overallScore / 10) }"
            ></div>
          </div>
          <div class="overall-percent">{{ overallScore }}%</div>
        </div>
        
        <div 
          class="result-level"
          :class="'result-level--' + candidateLevel"
        >
          {{ levelLabel }}
        </div>
      </div>

      <!-- Soft Skills -->
      <div class="soft-skills-section pixel-card mb-lg">
        <h3 class="section-title">🗣 КОММУНИКАЦИЯ:</h3>
        
        <div class="soft-options">
          <label class="pixel-checkbox">
            <input 
              type="radio" 
              name="communication"
              :checked="softSkills.communication === 'comfortable'"
              @change="setSoft('communication', 'comfortable')"
            />
            <span class="pixel-checkbox__box"></span>
            <span class="pixel-checkbox__label">Комфортное общение</span>
          </label>
          
          <label class="pixel-checkbox">
            <input 
              type="radio" 
              name="communication"
              :checked="softSkills.communication === 'uncomfortable'"
              @change="setSoft('communication', 'uncomfortable')"
            />
            <span class="pixel-checkbox__box"></span>
            <span class="pixel-checkbox__label">Некомфортное общение</span>
          </label>
          
          <label class="pixel-checkbox">
            <input 
              type="radio" 
              name="communication"
              :checked="softSkills.communication === 'neutral'"
              @change="setSoft('communication', 'neutral')"
            />
            <span class="pixel-checkbox__box"></span>
            <span class="pixel-checkbox__label">Нейтрально</span>
          </label>
        </div>

        <label class="pixel-checkbox mt-md">
          <input 
            type="checkbox" 
            :checked="softSkills.needsClarification"
            @change="toggleClarification"
          />
          <span class="pixel-checkbox__box"></span>
          <span class="pixel-checkbox__label">
            Часто требовались уточняющие вопросы
          </span>
        </label>
      </div>

      <!-- Answers Review -->
      <div class="answers-review-section mb-lg">
        <button 
          class="pixel-btn pixel-btn--small"
          style="width: 100%;"
          @click="showAnswersReview = !showAnswersReview"
        >
          {{ showAnswersReview ? '🙈 Скрыть ответы' : '👁 Просмотр ответов' }}
        </button>
        
        <div v-if="showAnswersReview" class="answers-list">
          <div 
            v-for="section in store.allSections" 
            :key="section.id"
            class="review-section"
          >
            <div class="review-section-header">
              {{ section.icon }} {{ section.name }}
            </div>
            <div 
              v-for="q in getQuestionsForSection(section.id)"
              :key="q.id"
              class="review-question"
              :class="getAnswerClass(q.id)"
            >
              <div class="review-q-text">{{ q.question }}</div>
              <div class="review-q-answer" v-if="store.answers[q.id]">
                <span class="answer-result">
                  {{ getResultLabel(store.answers[q.id].result) }}
                </span>
                <span 
                  v-if="store.answers[q.id].comment" 
                  class="answer-comment"
                >
                  💬 {{ store.answers[q.id].comment }}
                </span>
                <span 
                  v-if="store.answers[q.id].redFlags?.length" 
                  class="answer-flags"
                >
                  🚩 {{ store.answers[q.id].redFlags.join(', ') }}
                </span>
              </div>
              <div v-else class="review-q-answer review-q-skipped">
                — не отвечено —
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Export -->
      <div class="export-section pixel-card mb-lg">
        <h3 class="section-title">💾 ЭКСПОРТ СЕССИИ:</h3>
        <p class="export-desc">
          Сохрани код чтобы вернуться к результатам позже
        </p>
        <button class="pixel-btn pixel-btn--small" @click="exportData">
          📤 Сгенерировать код
        </button>
        <div v-if="exportedCode" class="export-code">
          <textarea 
            readonly 
            :value="exportedCode"
            class="pixel-textarea"
            rows="2"
            @click="copyExport"
          ></textarea>
          <p class="export-hint" :class="{ copied: showCopied }">
            {{ showCopied ? '✓ Скопировано!' : 'Кликни чтобы скопировать' }}
          </p>
        </div>
      </div>

      <!-- Generate Button -->
      <button 
        class="pixel-btn pixel-btn--green pixel-btn--large" 
        style="width: 100%;"
        @click="generateFeedback"
      >
        📝 СГЕНЕРИРОВАТЬ ФИДБЕК
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useInterviewStore } from '../stores/interview'

const router = useRouter()
const store = useInterviewStore()

// Name editing
const editingName = ref(false)
const editedName = ref('')
const nameInput = ref(null)

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

async function copySeed() {
  try {
    await navigator.clipboard.writeText(store.currentSeed)
  } catch (err) {
    console.error('Copy failed:', err)
  }
}

const sectionProgress = computed(() => store.sectionProgress)
const overallScore = computed(() => store.overallScore)
const candidateLevel = computed(() => store.candidateLevel)
const softSkills = computed(() => store.softSkills)
const levelLabel = computed(() => store.levelLabels[candidateLevel.value])

// All sections for display
const displaySections = computed(() => store.allSections)

function getBlockClass(sectionId, index) {
  const percent = sectionProgress.value[sectionId]?.percent || 0
  const filled = index <= Math.round(percent / 10)
  return { filled }
}

function setSoft(key, value) {
  store.setSoftSkills({ [key]: value })
}

function toggleClarification() {
  store.setSoftSkills({ 
    needsClarification: !softSkills.value.needsClarification 
  })
}

// Answers review
const showAnswersReview = ref(false)

function getQuestionsForSection(sectionId) {
  return store.shuffledQuestions.filter(q => q.section === sectionId)
}

function getAnswerClass(questionId) {
  const answer = store.answers[questionId]
  if (!answer) return 'unanswered'
  return answer.result
}

function getResultLabel(result) {
  const labels = {
    correct: '✅ Верно',
    partial: '⚠️ Частично',
    wrong: '❌ Не знает',
    skipped: '⏭ Пропущено'
  }
  return labels[result] || result
}

// Export
const exportedCode = ref('')
const showCopied = ref(false)

function exportData() {
  exportedCode.value = store.exportSession()
}

async function copyExport() {
  try {
    await navigator.clipboard.writeText(exportedCode.value)
    showCopied.value = true
    setTimeout(() => showCopied.value = false, 2000)
  } catch (err) {
    console.error('Copy failed:', err)
  }
}

function generateFeedback() {
  store.generateFeedback()
  router.push('/feedback')
}
</script>

<style scoped>
.results-page {
  min-height: 100vh;
}

.candidate-info {
  text-align: center;
  padding: 16px 24px;
  background: var(--bg-card);
  border: 2px solid var(--border-color);
}

.info-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-label {
  font-family: var(--font-pixel);
  font-size: 10px;
  color: var(--text-secondary);
}

.info-value {
  font-family: var(--font-terminal);
  font-size: 24px;
  color: var(--neon-cyan);
}

.info-value-small {
  font-family: var(--font-pixel);
  font-size: 12px;
  color: var(--neon-pink);
}

.info-divider {
  color: var(--border-color);
  margin: 0 8px;
}

.info-value-seed {
  font-family: var(--font-pixel);
  font-size: 12px;
  color: var(--neon-yellow);
  cursor: pointer;
  padding: 4px 8px;
  border: 2px solid transparent;
  transition: all 0.15s;
}

.info-value-seed:hover {
  border-color: var(--neon-yellow);
  background: rgba(255, 247, 0, 0.1);
}

.copy-hint {
  margin-left: 4px;
  opacity: 0.6;
}

.scores-section {
  padding: 24px;
}

.category-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.category-bar__label {
  font-family: var(--font-pixel);
  font-size: 8px;
  width: 150px;
  color: var(--neon-cyan);
  white-space: nowrap;
}

.category-bar__track {
  flex: 1;
  height: 16px;
  display: flex;
  gap: 3px;
}

.category-bar__block {
  flex: 1;
  background: var(--border-color);
  transition: background 0.2s;
}

.category-bar__block.filled {
  background: var(--neon-green);
  box-shadow: 0 0 8px rgba(57, 255, 20, 0.4);
}

.category-bar__stats {
  display: flex;
  gap: 12px;
  min-width: 80px;
  justify-content: flex-end;
}

.category-bar__stats .answered {
  font-family: var(--font-terminal);
  font-size: 14px;
  color: var(--text-secondary);
}

.category-bar__stats .percent {
  font-family: var(--font-pixel);
  font-size: 10px;
  color: var(--text-primary);
  min-width: 35px;
  text-align: right;
}

.overall-section {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 4px solid var(--border-color);
}

.overall-label {
  font-family: var(--font-pixel);
  font-size: 12px;
  color: var(--neon-pink);
  width: 150px;
}

.overall-bar {
  flex: 1;
  height: 20px;
  display: flex;
  gap: 3px;
}

.overall-percent {
  font-family: var(--font-pixel);
  font-size: 14px;
  min-width: 50px;
  text-align: right;
  color: var(--neon-green);
}

.result-level {
  text-align: center;
  margin-top: 20px;
}

.section-title {
  font-family: var(--font-pixel);
  font-size: 12px;
  color: var(--neon-cyan);
  margin-bottom: 16px;
}

.soft-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Name editing */
.info-value--editable {
  cursor: pointer;
  border: 1px dashed transparent;
  padding: 4px 8px;
  transition: all 0.15s;
}

.info-value--editable:hover {
  border-color: var(--neon-cyan);
  background: rgba(102, 217, 255, 0.1);
}

.edit-hint {
  font-size: 12px;
  opacity: 0;
  margin-left: 8px;
  transition: opacity 0.15s;
}

.info-value--editable:hover .edit-hint {
  opacity: 0.7;
}

.name-edit-input {
  font-family: var(--font-terminal);
  font-size: 24px;
  color: var(--neon-cyan);
  background: var(--bg-dark);
  border: 2px solid var(--neon-cyan);
  padding: 4px 8px;
  text-align: center;
  width: 200px;
}

/* Answers Review */
.answers-review-section {
  background: var(--bg-card);
  border: 2px solid var(--border-color);
  padding: 16px;
}

.answers-list {
  margin-top: 16px;
  max-height: 400px;
  overflow-y: auto;
}

.review-section {
  margin-bottom: 16px;
}

.review-section-header {
  font-family: var(--font-pixel);
  font-size: 10px;
  color: var(--neon-cyan);
  padding: 8px;
  background: var(--bg-dark);
  margin-bottom: 4px;
}

.review-question {
  padding: 8px 12px;
  border-left: 3px solid var(--border-color);
  margin-bottom: 4px;
  background: rgba(0, 0, 0, 0.2);
}

.review-question.correct {
  border-left-color: var(--neon-green);
}

.review-question.partial {
  border-left-color: var(--neon-yellow);
}

.review-question.wrong {
  border-left-color: var(--neon-pink);
}

.review-q-text {
  font-family: var(--font-terminal);
  font-size: 14px;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.review-q-answer {
  font-family: var(--font-terminal);
  font-size: 13px;
  color: var(--text-secondary);
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.review-q-skipped {
  font-style: italic;
  opacity: 0.5;
}

.answer-result {
  font-weight: bold;
}

.answer-comment {
  color: var(--neon-yellow);
}

.answer-flags {
  color: var(--neon-pink);
}

/* Export */
.export-section {
  padding: 16px;
}

.export-desc {
  font-family: var(--font-terminal);
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.export-code {
  margin-top: 12px;
}

.export-code textarea {
  width: 100%;
  cursor: pointer;
}

.export-hint {
  font-family: var(--font-terminal);
  font-size: 12px;
  color: var(--text-secondary);
  text-align: center;
  margin-top: 4px;
  transition: color 0.2s;
}

.export-hint.copied {
  color: var(--neon-green);
}
</style>
