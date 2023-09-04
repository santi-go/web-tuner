import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useTunerStore = defineStore('tuner', () => {
  const isMicrophoneOn = ref(false)

  return { isMicrophoneOn }
})
