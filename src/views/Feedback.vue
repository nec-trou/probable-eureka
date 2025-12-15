<template>
  <div class="feedback-page">
    <div class="page-container">
      <!-- Header -->
      <div class="feedback-header mb-lg">
        <h1 class="pixel-subtitle">📋 GENERATED FEEDBACK</h1>
        <button 
          class="pixel-btn pixel-btn--small"
          @click="copyToClipboard"
        >
          📋 COPY
        </button>
      </div>

      <!-- Feedback Content -->
      <div class="feedback-box mb-lg" ref="feedbackBox">
        {{ store.generatedFeedback }}
      </div>

      <!-- Trap Explanation for Candidate -->
      <div class="trap-explanation-section mb-lg">
        <div class="section-header" @click="showTrapExplanation = !showTrapExplanation">
          <span>🎣 Объяснение для кандидата (про ловушки в лайвкодинге)</span>
          <button class="toggle-btn">
            {{ showTrapExplanation ? '▼' : '▶' }}
          </button>
        </div>
        <div v-if="showTrapExplanation" class="trap-explanation-content">
          <pre class="explanation-text">{{ trapExplanation }}</pre>
          <button class="pixel-btn pixel-btn--small" @click="copyExplanation">
            📋 Скопировать
          </button>
        </div>
      </div>

      <!-- Actions -->
      <div class="action-buttons">
        <button 
          class="pixel-btn pixel-btn--yellow"
          @click="regenerate"
        >
          🔄 REGENERATE
        </button>
        
        <button 
          class="pixel-btn pixel-btn--pink"
          @click="goToResults"
        >
          ◀ BACK TO RESULTS
        </button>
        
        <button 
          class="pixel-btn pixel-btn--green"
          @click="startNew"
        >
          🆕 NEW INTERVIEW
        </button>
      </div>

      <!-- Toast -->
      <div v-if="showToast" class="toast">
        ✅ Copied to clipboard!
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useInterviewStore } from '../stores/interview'
import { trapExplanation } from '../data/livecoding-tasks'

const router = useRouter()
const store = useInterviewStore()

const feedbackBox = ref(null)
const showToast = ref(false)
const showTrapExplanation = ref(false)

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(store.generatedFeedback)
    showToast.value = true
    setTimeout(() => {
      showToast.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

async function copyExplanation() {
  try {
    await navigator.clipboard.writeText(trapExplanation)
    showToast.value = true
    setTimeout(() => {
      showToast.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

function regenerate() {
  store.generateFeedback()
}

function goToResults() {
  router.push('/results')
}

function startNew() {
  store.resetInterview()
  router.push('/')
}
</script>

<style scoped>
.feedback-page {
  min-height: 100vh;
}

.feedback-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: var(--bg-card);
  border: 4px solid var(--border-color);
}

.feedback-box {
  min-height: 300px;
}

.action-buttons {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.action-buttons .pixel-btn {
  flex: 1;
  min-width: 180px;
}

/* Trap Explanation */
.trap-explanation-section {
  background: var(--bg-card);
  border: 2px solid var(--neon-yellow);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  font-family: var(--font-pixel);
  font-size: 10px;
  color: var(--neon-yellow);
  transition: background 0.2s;
}

.section-header:hover {
  background: rgba(255, 247, 0, 0.1);
}

.toggle-btn {
  background: none;
  border: none;
  color: var(--neon-yellow);
  font-size: 12px;
  cursor: pointer;
}

.trap-explanation-content {
  padding: 16px;
  border-top: 2px solid var(--border-color);
}

.explanation-text {
  font-family: var(--font-terminal);
  font-size: 15px;
  line-height: 1.6;
  color: var(--text-primary);
  white-space: pre-wrap;
  background: rgba(0, 0, 0, 0.3);
  padding: 16px;
  margin-bottom: 12px;
}
</style>


