import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { questionPools, sections } from '../data/questions-angular'
import { livecodingTasks } from '../data/livecoding-tasks'

export const useInterviewStore = defineStore('interview', () => {
  // State
  const stack = ref('angular')
  const selectedPool = ref('pool1')
  const candidateName = ref('')
  const startTime = ref(null)
  const answers = ref({})
  const currentSectionIndex = ref(0)
  const currentQuestionIndex = ref(0)
  const shuffledQuestions = ref([])
  const selectedLiveCodingTasks = ref([]) // Выбранные задачи live coding
  const currentSeed = ref('')
  const liveCodingCount = ref(2) // Количество live coding задач (1-5)
  const expandNotesDefault = ref(true) // Раскрывать подсказки сразу
  const softSkills = ref({
    communication: 'neutral',
    needsClarification: false
  })
  const generatedFeedback = ref('')
  const showSectionPreamble = ref(true)

  // Getters
  const allSections = computed(() => sections)
  
  const currentSection = computed(() => 
    sections[currentSectionIndex.value]
  )

  const questionsForSection = computed(() => {
    const sectionId = currentSection.value?.id
    if (!sectionId) return []
    
    return shuffledQuestions.value.filter(q => q.section === sectionId)
  })

  const currentQuestion = computed(() => 
    questionsForSection.value[currentQuestionIndex.value]
  )

  const isLastSection = computed(() => 
    currentSectionIndex.value === sections.length - 1
  )

  const isLastQuestionInSection = computed(() => {
    if (questionsForSection.value.length === 0) return true
    return currentQuestionIndex.value === questionsForSection.value.length - 1
  })

  const totalQuestionsInSection = computed(() => 
    questionsForSection.value.length
  )

  const currentQuestionNumber = computed(() => ({
    current: currentQuestionIndex.value + 1,
    total: totalQuestionsInSection.value
  }))

  const sectionProgress = computed(() => {
    const results = {}
    
    sections.forEach(section => {
      const sectionQs = shuffledQuestions.value.filter(
        q => q.section === section.id
      )
      
      let totalWeight = 0
      let earnedWeight = 0
      let answered = 0
      
      sectionQs.forEach(q => {
        const answer = answers.value[q.id]
        totalWeight += q.weight
        
        if (answer) {
          answered++
          if (answer.result === 'correct') {
            earnedWeight += q.weight
          } else if (answer.result === 'partial') {
            earnedWeight += q.weight * 0.5
          }
        }
      })
      
      results[section.id] = {
        total: sectionQs.length,
        answered,
        earnedWeight,
        totalWeight,
        percent: totalWeight > 0 
          ? Math.round((earnedWeight / totalWeight) * 100) 
          : 0
      }
    })
    
    return results
  })

  // Live coding progress
  const liveCodingProgress = computed(() => {
    const tasks = selectedLiveCodingTasks.value
    let correct = 0
    let partial = 0
    let wrong = 0
    
    tasks.forEach(task => {
      const answer = answers.value[task.id]
      if (answer) {
        if (answer.result === 'correct') correct++
        else if (answer.result === 'partial') partial++
        else if (answer.result === 'wrong') wrong++
      }
    })
    
    const total = tasks.length
    const answered = correct + partial + wrong
    const score = total > 0 
      ? Math.round((correct + partial * 0.5) / total * 100) 
      : 0
    
    return { total, answered, correct, partial, wrong, score }
  })

  const overallScore = computed(() => {
    let totalWeight = 0
    let earnedWeight = 0
    
    // Обычные вопросы
    shuffledQuestions.value.forEach(q => {
      const answer = answers.value[q.id]
      totalWeight += q.weight
      
      if (answer) {
        if (answer.result === 'correct') {
          earnedWeight += q.weight
        } else if (answer.result === 'partial') {
          earnedWeight += q.weight * 0.5
        }
      }
    })
    
    // Live coding (вес = 3 за каждую задачу)
    const liveCodingWeight = 3
    selectedLiveCodingTasks.value.forEach(task => {
      const answer = answers.value[task.id]
      totalWeight += liveCodingWeight
      
      if (answer) {
        if (answer.result === 'correct') {
          earnedWeight += liveCodingWeight
        } else if (answer.result === 'partial') {
          earnedWeight += liveCodingWeight * 0.5
        }
      }
    })
    
    return totalWeight > 0 
      ? Math.round((earnedWeight / totalWeight) * 100) 
      : 0
  })

  const candidateLevel = computed(() => {
    const score = overallScore.value
    if (score >= 80) return 'strong-middle'
    if (score >= 65) return 'middle'
    if (score >= 50) return 'weak-middle'
    return 'junior'
  })

  const levelLabels = {
    'strong-middle': 'STRONG MIDDLE',
    'middle': 'MIDDLE',
    'weak-middle': 'WEAK MIDDLE',
    'junior': 'JUNIOR+'
  }

  const poolLabels = {
    pool1: 'Пул A',
    pool2: 'Пул B',
    pool3: 'Пул C',
    pool4: 'Пул D'
  }

  // Seeded random number generator (mulberry32)
  function createSeededRandom(seed) {
    let a = seed
    return function() {
      let t = a += 0x6D2B79F5
      t = Math.imul(t ^ t >>> 15, t | 1)
      t ^= t + Math.imul(t ^ t >>> 7, t | 61)
      return ((t ^ t >>> 14) >>> 0) / 4294967296
    }
  }

  // Convert string seed to number
  function seedToNumber(seedStr) {
    let hash = 0
    for (let i = 0; i < seedStr.length; i++) {
      const char = seedStr.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    return Math.abs(hash)
  }

  // Generate random seed string
  function generateSeed() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let result = ''
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  // Shuffle array with seed
  function shuffleArraySeeded(array, random) {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  function initializeShuffledQuestions(seed) {
    const poolQuestions = questionPools[selectedPool.value]
    if (!poolQuestions || poolQuestions.length === 0) {
      console.error('No questions found for pool:', selectedPool.value)
      shuffledQuestions.value = []
      return
    }

    const random = createSeededRandom(seedToNumber(seed))
    const result = []
    
    // Для каждой секции находим вопросы и перемешиваем
    sections.forEach(section => {
      const sectionQs = poolQuestions.filter(q => q.section === section.id)
      if (sectionQs.length > 0) {
        result.push(...shuffleArraySeeded(sectionQs, random))
      }
    })
    
    shuffledQuestions.value = result
    console.log('Initialized questions:', result.length, 'seed:', seed)
  }

  function setStack(value) {
    stack.value = value
  }

  function setPool(poolId) {
    selectedPool.value = poolId
  }

  function setSeed(seed) {
    currentSeed.value = seed
  }

  function setCandidateName(name) {
    candidateName.value = name
  }

  function initializeLiveCodingTasks(seed) {
    const random = createSeededRandom(seedToNumber(seed) + 1000)
    const shuffled = shuffleArraySeeded(livecodingTasks, random)
    selectedLiveCodingTasks.value = shuffled.slice(0, liveCodingCount.value)
    console.log('Selected live coding tasks:', selectedLiveCodingTasks.value.map(t => t.title))
  }

  function startInterview(customSeed = null) {
    const seed = customSeed || generateSeed()
    currentSeed.value = seed
    startTime.value = Date.now()
    answers.value = {}
    currentSectionIndex.value = 0
    currentQuestionIndex.value = 0
    showSectionPreamble.value = true
    initializeShuffledQuestions(seed)
    initializeLiveCodingTasks(seed)
  }

  function setAnswer(questionId, result, redFlags = [], comment = '') {
    answers.value[questionId] = {
      questionId,
      result,
      redFlags,
      comment
    }
  }

  function dismissPreamble() {
    showSectionPreamble.value = false
  }

  function nextQuestion() {
    if (!isLastQuestionInSection.value) {
      currentQuestionIndex.value++
      return { moved: true, newSection: false }
    }
    return { moved: false, newSection: false }
  }

  function prevQuestion() {
    if (currentQuestionIndex.value > 0) {
      currentQuestionIndex.value--
      return true
    }
    return false
  }

  function nextSection() {
    if (!isLastSection.value) {
      currentSectionIndex.value++
      currentQuestionIndex.value = 0
      showSectionPreamble.value = true
      return true
    }
    return false
  }

  function setSoftSkills(skills) {
    softSkills.value = { ...softSkills.value, ...skills }
  }

  function generateFeedback() {
    const parts = []

    // Header with seed
    parts.push(`📋 Интервью: ${candidateName.value}`)
    parts.push(`🎲 Seed: ${currentSeed.value} | Пул: ${poolLabels[selectedPool.value]}`)

    // Per-section feedback
    sections.forEach(section => {
      const progress = sectionProgress.value[section.id]
      if (!progress || progress.answered === 0) return
      
      const sectionQs = shuffledQuestions.value.filter(
        q => q.section === section.id
      )
      
      let sectionFeedback = `${section.icon} ${section.name}: `
      
      if (progress.percent >= 70) {
        sectionFeedback += 'Хорошо разбирается. '
      } else if (progress.percent >= 40) {
        sectionFeedback += 'Базу понимает, есть пробелы. '
      } else {
        sectionFeedback += 'Слабое понимание. '
      }
      
      const details = []
      sectionQs.forEach(q => {
        const answer = answers.value[q.id]
        if (!answer) return
        
        const shortQ = q.question.length > 50 
          ? q.question.substring(0, 50) + '...' 
          : q.question
        
        if (answer.result === 'correct') {
          details.push(`✓ "${shortQ}"`)
        } else if (answer.result === 'partial') {
          let detail = `◐ "${shortQ}"`
          if (answer.comment) detail += ` — ${answer.comment}`
          details.push(detail)
        } else if (answer.result === 'wrong') {
          let detail = `✗ "${shortQ}"`
          if (answer.redFlags?.length > 0) {
            detail += ` (${answer.redFlags.join('; ')})`
          }
          details.push(detail)
        }
      })
      
      if (details.length > 0) {
        sectionFeedback += '\n' + details.map(d => '  ' + d).join('\n')
      }
      
      parts.push(sectionFeedback)
    })

    // Live Coding feedback
    if (selectedLiveCodingTasks.value.length > 0) {
      const lcProgress = liveCodingProgress.value
      let lcFeedback = `💻 LIVE CODING: ${lcProgress.score}%`
      
      if (lcProgress.score >= 70) {
        lcFeedback += ' — Хорошо решает практические задачи.'
      } else if (lcProgress.score >= 40) {
        lcFeedback += ' — Есть базовые навыки, нужна практика.'
      } else {
        lcFeedback += ' — Слабые практические навыки.'
      }
      
      const lcDetails = []
      selectedLiveCodingTasks.value.forEach(task => {
        const answer = answers.value[task.id]
        if (!answer) return
        
        if (answer.result === 'correct') {
          lcDetails.push(`  ✓ ${task.title}`)
        } else if (answer.result === 'partial') {
          let detail = `  ◐ ${task.title}`
          if (answer.comment) detail += ` — ${answer.comment}`
          lcDetails.push(detail)
        } else if (answer.result === 'wrong') {
          let detail = `  ✗ ${task.title}`
          if (answer.redFlags?.length > 0) {
            detail += ` (${answer.redFlags.slice(0, 2).join('; ')})`
          }
          lcDetails.push(detail)
        }
      })
      
      if (lcDetails.length > 0) {
        lcFeedback += '\n' + lcDetails.join('\n')
      }
      
      parts.push(lcFeedback)
    }

    // Soft skills
    const softParts = []
    if (softSkills.value.communication === 'comfortable') {
      softParts.push('Комфортное общение')
    } else if (softSkills.value.communication === 'uncomfortable') {
      softParts.push('Некомфортное общение')
    }
    if (softSkills.value.needsClarification) {
      softParts.push('Часто требовались уточнения')
    }
    
    if (softParts.length > 0) {
      parts.push(`🗣 Soft: ${softParts.join(', ')}.`)
    }

    // Recommendation
    const level = levelLabels[candidateLevel.value]
    let recommendation = ''
    
    if (overallScore.value >= 65) {
      recommendation = 'Рекомендую на Middle.'
    } else if (overallScore.value >= 50) {
      recommendation = 'Можно рассмотреть как Junior+ / Weak Middle.'
    } else {
      recommendation = 'Не рекомендую.'
    }

    parts.push(
      `\n${'━'.repeat(40)}\n` +
      `📊 ИТОГО: ${overallScore.value}% — ${level}\n` +
      `📝 ${recommendation}`
    )

    generatedFeedback.value = parts.join('\n\n')
    
    // Сохраняем в историю
    saveToHistory()
    
    return generatedFeedback.value
  }

  function setLiveCodingCount(count) {
    liveCodingCount.value = Math.min(5, Math.max(1, count))
  }

  function setExpandNotesDefault(value) {
    expandNotesDefault.value = value
  }

  // Генерация дженерик имени
  function generateGenericName() {
    const adjectives = ['Brave', 'Clever', 'Swift', 'Bright', 'Cool']
    const nouns = ['Coder', 'Dev', 'Ninja', 'Wizard', 'Hero']
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
    const noun = nouns[Math.floor(Math.random() * nouns.length)]
    const num = Math.floor(Math.random() * 100)
    return `${adj}${noun}${num}`
  }

  // Экспорт данных сессии в base64
  function exportSession() {
    const data = {
      v: 1, // версия формата
      n: candidateName.value,
      p: selectedPool.value,
      s: currentSeed.value,
      t: startTime.value,
      lc: liveCodingCount.value,
      a: answers.value,
      sk: softSkills.value
    }
    const json = JSON.stringify(data)
    return btoa(unescape(encodeURIComponent(json)))
  }

  // Импорт данных сессии из base64
  function importSession(encoded) {
    try {
      const json = decodeURIComponent(escape(atob(encoded)))
      const data = JSON.parse(json)
      
      if (data.v !== 1) {
        throw new Error('Unsupported version')
      }
      
      candidateName.value = data.n || ''
      selectedPool.value = data.p || 'pool1'
      currentSeed.value = data.s || ''
      startTime.value = data.t || null
      liveCodingCount.value = data.lc || 2
      answers.value = data.a || {}
      softSkills.value = data.sk || { 
        communication: 'neutral', 
        needsClarification: false 
      }
      
      // Восстанавливаем вопросы по seed
      if (currentSeed.value) {
        initializeShuffledQuestions(currentSeed.value)
      }
      
      return true
    } catch (e) {
      console.error('Import failed:', e)
      return false
    }
  }

  // Получить все вопросы с ответами для просмотра
  function getAllQuestionsWithAnswers() {
    return shuffledQuestions.value.map(q => ({
      ...q,
      answer: answers.value[q.id] || null
    }))
  }

  // ═══════════════════════════════════════════════════════════════
  // ИСТОРИЯ ИНТЕРВЬЮ
  // ═══════════════════════════════════════════════════════════════
  
  const HISTORY_KEY = 'interview_history'
  const MAX_HISTORY = 20

  function getHistory() {
    try {
      const data = localStorage.getItem(HISTORY_KEY)
      return data ? JSON.parse(data) : []
    } catch (e) {
      console.error('Failed to load history:', e)
      return []
    }
  }

  function saveToHistory() {
    if (!candidateName.value || !currentSeed.value) return
    
    const entry = {
      id: Date.now(),
      date: new Date().toISOString(),
      name: candidateName.value,
      pool: selectedPool.value,
      seed: currentSeed.value,
      score: overallScore.value,
      level: candidateLevel.value,
      exportCode: exportSession()
    }
    
    const history = getHistory()
    
    // Проверяем нет ли уже такой записи (по seed + name)
    const existingIdx = history.findIndex(
      h => h.seed === entry.seed && h.name === entry.name
    )
    
    if (existingIdx >= 0) {
      // Обновляем существующую
      history[existingIdx] = entry
    } else {
      // Добавляем новую в начало
      history.unshift(entry)
    }
    
    // Ограничиваем размер
    while (history.length > MAX_HISTORY) {
      history.pop()
    }
    
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
    } catch (e) {
      console.error('Failed to save history:', e)
    }
  }

  function loadFromHistory(entry) {
    if (entry.exportCode) {
      return importSession(entry.exportCode)
    }
    return false
  }

  function deleteFromHistory(id) {
    const history = getHistory().filter(h => h.id !== id)
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
    } catch (e) {
      console.error('Failed to delete from history:', e)
    }
  }

  function clearHistory() {
    try {
      localStorage.removeItem(HISTORY_KEY)
    } catch (e) {
      console.error('Failed to clear history:', e)
    }
  }

  function resetInterview() {
    stack.value = 'angular'
    selectedPool.value = 'pool1'
    candidateName.value = ''
    startTime.value = null
    answers.value = {}
    currentSectionIndex.value = 0
    currentQuestionIndex.value = 0
    shuffledQuestions.value = []
    selectedLiveCodingTasks.value = []
    currentSeed.value = ''
    liveCodingCount.value = 2
    softSkills.value = { communication: 'neutral', needsClarification: false }
    generatedFeedback.value = ''
    showSectionPreamble.value = true
  }

  return {
    // State
    stack,
    selectedPool,
    candidateName,
    startTime,
    answers,
    currentSectionIndex,
    currentQuestionIndex,
    currentSeed,
    liveCodingCount,
    expandNotesDefault,
    softSkills,
    generatedFeedback,
    showSectionPreamble,
    shuffledQuestions,
    selectedLiveCodingTasks,
    
    // Getters
    allSections,
    currentSection,
    questionsForSection,
    currentQuestion,
    isLastSection,
    isLastQuestionInSection,
    totalQuestionsInSection,
    currentQuestionNumber,
    sectionProgress,
    overallScore,
    liveCodingProgress,
    candidateLevel,
    levelLabels,
    poolLabels,
    
    // Actions
    setStack,
    setPool,
    setSeed,
    setCandidateName,
    setLiveCodingCount,
    setExpandNotesDefault,
    generateGenericName,
    startInterview,
    setAnswer,
    dismissPreamble,
    nextQuestion,
    prevQuestion,
    nextSection,
    setSoftSkills,
    generateFeedback,
    resetInterview,
    exportSession,
    importSession,
    getAllQuestionsWithAnswers,
    getHistory,
    saveToHistory,
    loadFromHistory,
    deleteFromHistory,
    clearHistory
  }
})
