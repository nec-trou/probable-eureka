<template>
  <div class="help-page">
    <div class="page-container">
      <div class="help-header">
        <h1 class="pixel-title">❓ КАК ПОЛЬЗОВАТЬСЯ</h1>
        <button class="close-btn" @click="goBack">✕ НАЗАД</button>
      </div>

      <div class="help-content">
        <!-- Getting Started -->
        <section class="help-section pixel-card">
          <h2 class="section-title">🎯 НАЧАЛО</h2>
          <div class="help-text">
            <p><strong>1.</strong> Выбери стек (Angular)</p>
            <p><strong>2.</strong> Введи имя кандидата (или система генерирует)</p>
            <p><strong>3.</strong> Выбери пул вопросов (1-4)</p>
            <p><strong>4.</strong> Настрой Live Coding (1 или 2 задачи)</p>
            <p><strong>5.</strong> Раскрыватель подсказок (включить/выключить)</p>
            <p><strong>6.</strong> Нажми "НАЧАТЬ ИНТЕРВЬЮ"</p>
          </div>
        </section>

        <!-- Interview -->
        <section class="help-section pixel-card">
          <h2 class="section-title">💬 ИНТЕРВЬЮ</h2>
          <div class="help-text">
            <p><strong>Для каждого вопроса:</strong></p>
            <p class="indent">✅ <strong>Верно</strong> — кандидат ответил корректно</p>
            <p class="indent">⚠️ <strong>Частично</strong> — неполный или с пробелами ответ</p>
            <p class="indent">❌ <strong>Не знает</strong> — неправильный или отсутствует</p>
            <p class="indent">⏭️ <strong>Пропуск</strong> — не успели или пропустил</p>
            
            <p style="margin-top: 12px;"><strong>Дополнительно:</strong></p>
            <p class="indent">🚩 Red Flags — отметь проблемные моменты (галочки)</p>
            <p class="indent">💬 Заметка — напиши как кандидат рассуждал</p>
            
            <p style="margin-top: 12px;"><strong>Подсказка для интервьюера:</strong></p>
            <p class="indent">📋 "Показать справку" — раскроет идеальный ответ и notes</p>
          </div>
        </section>

        <!-- Results -->
        <section class="help-section pixel-card">
          <h2 class="section-title">🏆 РЕЗУЛЬТАТЫ</h2>
          <div class="help-text">
            <p><strong>Оценка:</strong></p>
            <p class="indent">80%+ → STRONG MIDDLE</p>
            <p class="indent">65-79% → MIDDLE</p>
            <p class="indent">50-64% → WEAK MIDDLE</p>
            <p class="indent">&lt;50% → JUNIOR+</p>
            
            <p style="margin-top: 12px;"><strong>На этой странице:</strong></p>
            <p class="indent">1. Отредактируй имя если нужно (кликни на имя)</p>
            <p class="indent">2. Отметь soft skills (коммуникация, уточнения)</p>
            <p class="indent">3. 👁 Просмотр ответов — посмотри что отвечал</p>
            <p class="indent">4. 📤 Экспорт — скопируй код результатов</p>
            <p class="indent">5. 📝 Генерируй фидбек</p>
          </div>
        </section>

        <!-- History -->
        <section class="help-section pixel-card">
          <h2 class="section-title">📚 ИСТОРИЯ</h2>
          <div class="help-text">
            <p>Последние 20 интервью сохраняются автоматически.</p>
            <p style="margin-top: 8px;">На главной странице:</p>
            <p class="indent">📚 <strong>ИСТОРИЯ ИНТЕРВЬЮ</strong> — список всех интервью</p>
            <p class="indent">Кликни → загрузи результаты снова</p>
            <p class="indent">✕ → удали запись</p>
            <p class="indent">🗑️ → очисти всю историю</p>
          </div>
        </section>

        <!-- Export/Import -->
        <section class="help-section pixel-card">
          <h2 class="section-title">💾 ЭКСПОРТ/ИМПОРТ</h2>
          <div class="help-text">
            <p><strong>Экспорт результатов:</strong></p>
            <p class="indent">1. На странице Results нажми "Сгенерировать код"</p>
            <p class="indent">2. Кликни на код → скопируется в буфер</p>
            <p class="indent">3. Поделись кодом с коллегой</p>
            
            <p style="margin-top: 12px;"><strong>Импорт результатов:</strong></p>
            <p class="indent">1. На главной странице: "Импорт сессии"</p>
            <p class="indent">2. Вставь код</p>
            <p class="indent">3. Нажми "Загрузить"</p>
            <p class="indent">4. Откроются результаты</p>
          </div>
        </section>

        <!-- Keyboard Shortcuts -->
        <section class="help-section pixel-card">
          <h2 class="section-title">⌨️ ГОРЯЧИЕ КЛАВИШИ</h2>
          <div class="help-text">
            <p><strong>Во время интервью:</strong></p>
            <p class="indent"><strong>1</strong> → Верно</p>
            <p class="indent"><strong>2</strong> → Частично</p>
            <p class="indent"><strong>3</strong> → Не знает</p>
            <p class="indent"><strong>4</strong> → Пропуск</p>
            <p class="indent"><strong>→</strong> или <strong>Enter</strong> → Следующий вопрос</p>
            <p class="indent"><strong>←</strong> → Предыдущий вопрос</p>
          </div>
        </section>

        <!-- Live Coding -->
        <section class="help-section pixel-card">
          <h2 class="section-title">💻 LIVE CODING</h2>
          <div class="help-text">
            <p>После всех вопросов — Live Coding задачи (1-4 зависит от настроек).</p>
            <p style="margin-top: 8px;"><strong>Каждая задача:</strong></p>
            <p class="indent">📋 КОД ДЛЯ КАНДИДАТА — скопируй и дай</p>
            <p class="indent">✅ РЕШЕНИЕ — правильный ответ + разбор ловушек</p>
            <p class="indent">💡 ПОДСКАЗКИ — 4 уровня помощи</p>
            <p class="indent">✓/⚠️/❌ — отметь результат</p>
          </div>
        </section>

        <!-- Tips -->
        <section class="help-section pixel-card">
          <h2 class="section-title">💡 СОВЕТЫ</h2>
          <div class="help-text">
            <p><strong>✓ Делай так:</strong></p>
            <p class="indent">• Используй разные пулы для разных кандидатов</p>
            <p class="indent">• Если seed одинаков → одинаковые вопросы</p>
            <p class="indent">• Экспортируй результаты сразу после интервью</p>
            <p class="indent">• Читай подсказки в начале интервью (раскрывайся сразу)</p>
            
            <p style="margin-top: 12px;"><strong>✕ Не делай так:</strong></p>
            <p class="indent">• Не чисти историю если нужны старые результаты</p>
            <p class="indent">• Не закрывай браузер без экспорта (история в локали)</p>
          </div>
        </section>

        <!-- FAQ -->
        <section class="help-section pixel-card">
          <h2 class="section-title">❓ ЧАСТЫЕ ВОПРОСЫ</h2>
          <div class="help-text">
            <p><strong>Q: Где хранятся результаты?</strong></p>
            <p class="indent">A: В localStorage браузера. Работает оффлайн.</p>
            
            <p style="margin-top: 8px;"><strong>Q: Как поделиться с коллегой?</strong></p>
            <p class="indent">A: Экспортируй код результатов, дай ему — он импортирует.</p>
            
            <p style="margin-top: 8px;"><strong>Q: Что если закрыл браузер?</strong></p>
            <p class="indent">A: История в localStorage останется. Или используй экспорт.</p>
            
            <p style="margin-top: 8px;"><strong>Q: Может ли кандидат видеть это?</strong></p>
            <p class="indent">A: Нет, это только для интервьюера. Кандидату даёшь только код Live Coding.</p>
            
            <p style="margin-top: 8px;"><strong>Q: Какой пул выбрать?</strong></p>
            <p class="indent">A: Каждый раз новый. pool1 → pool2 → pool3 → pool4 → pool1...</p>
          </div>
        </section>

        <!-- Share -->
        <section class="help-section pixel-card">
          <h2 class="section-title">🔗 ПОДЕЛИТЬСЯ</h2>
          <div class="help-text">
            <p>Поделись этой ссылкой с коллегами:</p>
            <div class="share-box">
              <code>{{ shareUrl }}</code>
              <button class="copy-btn" @click="copyShareUrl">📋 Копировать</button>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
const shareUrl = window.location.origin

function goBack() {
  router.back()
}

async function copyShareUrl() {
  try {
    await navigator.clipboard.writeText(shareUrl)
  } catch (err) {
    console.error('Copy failed:', err)
  }
}
</script>

<style scoped>
.help-page {
  min-height: 100vh;
  padding-bottom: 40px;
}

.help-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.close-btn {
  font-family: var(--font-pixel);
  font-size: 12px;
  padding: 8px 16px;
  background: var(--bg-card);
  border: 2px solid var(--neon-pink);
  color: var(--neon-pink);
  cursor: pointer;
  transition: all 0.15s;
}

.close-btn:hover {
  background: var(--neon-pink);
  color: var(--bg-dark);
}

.help-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.help-section {
  padding: 24px;
}

.section-title {
  font-family: var(--font-pixel);
  font-size: 14px;
  color: var(--neon-cyan);
  margin-bottom: 16px;
}

.help-text {
  font-family: var(--font-terminal);
  font-size: 15px;
  color: var(--text-primary);
  line-height: 1.6;
}

.help-text p {
  margin-bottom: 8px;
}

.help-text p.indent {
  margin-left: 24px;
  color: var(--text-secondary);
}

.share-box {
  display: flex;
  gap: 12px;
  margin-top: 12px;
  padding: 12px;
  background: var(--bg-dark);
  border: 2px dashed var(--border-color);
}

.share-box code {
  flex: 1;
  font-family: monospace;
  font-size: 13px;
  color: var(--neon-yellow);
  word-break: break-all;
}

.copy-btn {
  flex-shrink: 0;
  font-family: var(--font-pixel);
  font-size: 9px;
  padding: 8px 12px;
  background: var(--bg-card);
  border: 2px solid var(--neon-green);
  color: var(--neon-green);
  cursor: pointer;
  transition: all 0.15s;
}

.copy-btn:hover {
  background: var(--neon-green);
  color: var(--bg-dark);
}
</style>

