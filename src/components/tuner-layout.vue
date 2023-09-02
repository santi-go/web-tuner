<template>
  <div class="container">
    <div class="graph">
      <canvas ref="canvas"></canvas>
    </div>
    <button class="button" @click="toggleMicrophone">
      {{ isMicrophoneOn ? 'Turn off microphone' : 'Turn on microphone' }}
    </button>
  </div>
</template>

<script lang="ts">
import { ref, onUnmounted } from 'vue'

export default {
  name: 'TunerLayout',
  setup() {
    const isMicrophoneOn = ref(false)
    const canvas = ref<HTMLCanvasElement | null>(null)
    let audioContext: AudioContext | null = null
    let mediaStream: MediaStream | null = null
    let analyser: AnalyserNode | null = null
    let animationFrameId: number | null = null

    const toggleMicrophone = async () => {
      if (isMicrophoneOn.value) {
        // Turn off the microphone
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
        // Turn on the microphone
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

    const drawFrequencyGraph = () => {
      if (!analyser || !canvas.value) return
      const canvasContext = canvas.value.getContext('2d')
      if (!canvasContext) return

      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)

      canvasContext.clearRect(0, 0, canvas.value.width, canvas.value.height)

      const draw = () => {
        animationFrameId = requestAnimationFrame(draw)

        analyser.getByteFrequencyData(dataArray)

        canvasContext.fillStyle = 'rgb(0, 0, 0)'
        canvasContext.fillRect(0, 0, canvas.value.width, canvas.value.height)

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

      draw()
    }

    onUnmounted(() => {
      // Make sure to clean up when the component is unmounted
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
      toggleMicrophone,
      canvas
    }
  }
}
</script>

<style lang="scss">
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh; // Full viewport height
  width: 100vw; // Full viewport height
  background-color: lightgreen;
}

/* .graph {
  width: 500px;
  height: 500px;
  background-color: white;
} */

.button {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #42b883; // Green color
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #2c5e5b; // Darker green color
  }
}
</style>
