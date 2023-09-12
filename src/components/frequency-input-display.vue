<template>
  <div class="tuner__frequency">Freq: {{ currentFrequency }}</div>
</template>

<script lang="ts">

export default {
  name: 'FrequencyInputDisplay',
  props: {
    currentFrequency: { type: String }
  },
}
</script>

<style lang="scss">
.tuner {
  &__frequency {
    background-color: black;
    color: white;
    padding: 0px 8px;
    margin-bottom: 12px;
  }
}
</style>