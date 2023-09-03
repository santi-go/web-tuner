<template>
  <button class="mic-button" @click="emit('on:toggle-mic')">
    {{ `Turn ${isMicrophoneOn ? 'on' : 'off'} microphone` }}
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'MicButton',
  props: {
    isMicrophoneOn: { type: Boolean, required: true }
  },
  setup(_, { emit }) {
    return {
      emit
    }
  }
})
</script>

<style lang="scss">
.mic-button {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #42b883;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #2c5e5b;
  }
}
</style>
