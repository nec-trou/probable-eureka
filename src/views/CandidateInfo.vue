<template>
  <div class="page-container flex-center" style="flex-direction: column;">
    <div class="pixel-card pixel-card--glow" style="width: 100%; max-width: 550px;">
      <h2 class="pixel-subtitle mb-lg">👤 НОВОЕ ИНТЕРВЬЮ</h2>
      
      <div class="form-group mb-lg">
        <label class="form-label">ИМЯ КАНДИДАТА:</label>
        <input 
          v-model="candidateName"
          type="text" 
          class="pixel-input"
          placeholder="Введите имя..."
          @keyup.enter="startInterview"
        />
      </div>
      
      <div class="form-group mb-lg">
        <label class="form-label">ПУЛ ВОПРОСОВ:</label>
        <div class="pool-selector">
          <button 
            v-for="(label, poolId) in store.poolLabels"
            :key="poolId"
            class="pool-btn"
            :class="{ active: store.selectedPool === poolId }"
            @click="selectPool(poolId)"
          >
            {{ label }}
          </button>
        </div>
        <p class="pool-hint">
          4 разных набора — выбери неиспользованный
        </p>
      </div>

      <div class="form-group mb-lg">
        <label class="form-label">SEED (опционально):</label>
        <div class="seed-row">
          <input 
            v-model="customSeed"
            type="text" 
            class="pixel-input seed-input"
            placeholder="Авто-генерация"
            maxlength="6"
          />
          <button class="seed-btn" @click="generateNewSeed">
            🎲
          </button>
        </div>
        <p class="pool-hint">
          Seed = тот же порядок вопросов. Оставь пустым для нового.
        </p>
      </div>

      <div class="form-group mb-lg">
        <label class="form-label">LIVE CODING ЗАДАЧИ:</label>
        <div class="lc-selector">
          <button 
            class="lc-btn"
            :class="{ active: store.liveCodingCount === 1 }"
            @click="store.setLiveCodingCount(1)"
          >
            1 задача
          </button>
          <button 
            class="lc-btn"
            :class="{ active: store.liveCodingCount === 2 }"
            @click="store.setLiveCodingCount(2)"
          >
            2 задачи
          </button>
        </div>
      </div>

      <div class="form-group mb-lg">
        <label class="pixel-checkbox">
          <input 
            type="checkbox" 
            :checked="store.expandNotesDefault"
            @change="store.setExpandNotesDefault($event.target.checked)"
          />
          <span class="pixel-checkbox__box"></span>
          <span class="pixel-checkbox__label">
            📋 Раскрывать подсказки сразу
          </span>
        </label>
      </div>
      
      <button 
        class="pixel-btn pixel-btn--green pixel-btn--large" 
        style="width: 100%;"
        @click="startInterview"
      >
        ▶ НАЧАТЬ ИНТЕРВЬЮ
      </button>
      <p v-if="!candidateName.trim()" class="pool-hint" style="text-align: center;">
        Имя не указано — будет сгенерировано автоматически
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useInterviewStore } from '../stores/interview'

const router = useRouter()
const store = useInterviewStore()

const candidateName = ref('')
const customSeed = ref('')

function selectPool(poolId) {
  store.setPool(poolId)
}

function generateNewSeed() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  customSeed.value = result
}

function startInterview() {
  // Используем введённое имя или генерируем дженерик
  const name = candidateName.value.trim() || store.generateGenericName()
  store.setCandidateName(name)
  
  // Pass custom seed or null for auto-generation
  const seed = customSeed.value.trim() || null
  store.startInterview(seed)
  
  router.push('/interview')
}
</script>

<style scoped>
.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-family: var(--font-pixel);
  font-size: 10px;
  color: var(--neon-cyan);
  text-transform: uppercase;
}

.pool-selector {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.pool-btn {
  font-family: var(--font-pixel);
  font-size: 12px;
  padding: 14px 24px;
  background: var(--bg-dark);
  color: var(--text-secondary);
  border: 3px solid var(--border-color);
  cursor: pointer;
  transition: all 0.15s;
}

.pool-btn:hover {
  border-color: var(--neon-cyan);
  color: var(--neon-cyan);
}

.pool-btn.active {
  background: var(--neon-pink);
  border-color: var(--neon-pink);
  color: var(--bg-dark);
  box-shadow: 0 0 20px rgba(255, 45, 149, 0.4);
}

.pool-hint {
  font-family: var(--font-terminal);
  font-size: 16px;
  color: var(--text-secondary);
  margin-top: 8px;
}

.seed-row {
  display: flex;
  gap: 8px;
}

.seed-input {
  flex: 1;
  font-family: var(--font-pixel);
  font-size: 16px;
  letter-spacing: 4px;
  text-transform: uppercase;
}

.seed-btn {
  font-size: 24px;
  padding: 8px 16px;
  background: var(--bg-dark);
  border: 3px solid var(--neon-yellow);
  cursor: pointer;
  transition: all 0.15s;
}

.seed-btn:hover {
  background: var(--neon-yellow);
}

.lc-selector {
  display: flex;
  gap: 12px;
}

.lc-btn {
  font-family: var(--font-pixel);
  font-size: 10px;
  padding: 12px 20px;
  background: var(--bg-dark);
  color: var(--text-secondary);
  border: 3px solid var(--border-color);
  cursor: pointer;
  transition: all 0.15s;
}

.lc-btn:hover {
  border-color: var(--neon-yellow);
  color: var(--neon-yellow);
}

.lc-btn.active {
  background: var(--neon-yellow);
  border-color: var(--neon-yellow);
  color: var(--bg-dark);
}

.pixel-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
