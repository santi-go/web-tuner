<template>
  <div class="tuner">
    <FrequencyInputDisplay :baseFrequency="normalizeFrequency" />
    <canvas ref="canvas" width="500" height="300"></canvas>
    <MicButton :isMicrophoneOn="isMicrophoneOn" @on:toggle-mic="toggleMicrophone" />
  </div>
</template>

<script lang="ts">
import { ref, onUnmounted, watch } from 'vue'
import MicButton from './mic-button.vue'
import FrequencyInputDisplay from './frequency-input-display.vue'

export default {
  name: 'TunerLayout',
  components: {
    MicButton,
    FrequencyInputDisplay,
  },
  setup() {
    const isMicrophoneOn = ref(false)
    const canvas = ref<HTMLCanvasElement | null>(null)
    let baseFrequency = ref(0)
    let normalizeFrequency = ref(0)
    let audioContext: AudioContext | null = null
    let mediaStream: MediaStream | null = null
    let analyser: AnalyserNode | null = null
    let animationFrameId: number | null = null

    const toggleMicrophone = async (): Promise<void> => {
      if (isMicrophoneOn.value) {
        if (audioContext) {
          audioContext.close()
          audioContext = null
        }
        if (mediaStream) {
          mediaStream.getTracks().forEach((track) => track.stop())
          mediaStream = null
        }
        analyser = null
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId)
          animationFrameId = null
        }
        isMicrophoneOn.value = false
      } else {
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true })
          audioContext = new AudioContext()
          const source = audioContext.createMediaStreamSource(mediaStream)
          analyser = audioContext.createAnalyser()
          source.connect(analyser)
          isMicrophoneOn.value = true
          drawFrequencyGraph()
        } catch (error) {
          console.error('Error accessing the microphone', error)
        }
      }
    }

    const getLowestOctave = (freq: number) => {
      while (freq > 40) {
        freq /= 2;
      }
      if (freq < 20) {
        freq = 20;
      }
      return freq;
    }

    const showFrequency = (bufferLength: number, dataArray: Uint8Array): void => {
      let maxIndex = 0
      for (let i = 0; i < bufferLength; i++) {
        if (dataArray[i] > dataArray[maxIndex]) {
          maxIndex = i
        }
      }
      baseFrequency.value = (maxIndex * (audioContext!.sampleRate / 2)) / bufferLength
    }

    const resetFrequencyGraph = (canvasContext: CanvasRenderingContext2D): void => {
      if (canvas.value) {
        canvasContext.fillStyle = 'rgb(0, 0, 0)'
        canvasContext.fillRect(0, 0, canvas.value.width, canvas.value.height)
      }
    }

    const drawBars = (canvasContext: CanvasRenderingContext2D, bufferLength: number, dataArray: Uint8Array): void => {
      if (canvas.value) {
        const barWidth = (canvas.value.width / bufferLength) * 2.5
        let barHeight
        let x = 0

        for (let i = 0; i < bufferLength; i++) {
          barHeight = dataArray[i]

          canvasContext.fillStyle = 'rgb(' + (barHeight + 100) + ',50,50)'
          canvasContext.fillRect(x, canvas.value.height - barHeight / 2, barWidth, barHeight / 2)

          x += barWidth + 1
        }
      }
    }

    const drawFrequencyGraph = () => {
      if (!analyser || !canvas.value) return
      const canvasContext = canvas.value.getContext('2d')
      if (!canvasContext) return

      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)

      canvasContext.clearRect(0, 0, canvas.value.width, canvas.value.height)

      const draw = () => {
        if (canvas.value && analyser) {
          animationFrameId = requestAnimationFrame(draw)
          analyser.getByteFrequencyData(dataArray)

          showFrequency(bufferLength, dataArray)
          resetFrequencyGraph(canvasContext)
          drawBars(canvasContext, bufferLength, dataArray)

        }
      }

      draw()
    }

    watch(baseFrequency, (newValue) => {
      normalizeFrequency.value = getLowestOctave(newValue)
    })

    onUnmounted(() => {
      if (audioContext) {
        audioContext.close()
      }
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop())
      }
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    })

    return {
      isMicrophoneOn,
      baseFrequency,
      normalizeFrequency,
      toggleMicrophone,
      canvas
    }
  }
}
</script>

<style lang="scss">
.tuner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100vw;
  background-color: lightgreen;
}
</style>
