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

const router = useRouter()
const store = useInterviewStore()

const feedbackBox = ref(null)
const showToast = ref(false)

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
</style>


