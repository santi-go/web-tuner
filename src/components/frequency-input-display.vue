<template>
  <div class="tuner__frequency">Freq: {{ displayFrequency }}</div>
</template>

<script lang="ts">
import { computed, toRefs } from 'vue';

export default {
  name: 'FrequencyInputDisplay',
  props: {
    baseFrequency: { type: Number, default: 0 }
  },
  setup(props) {
    const { baseFrequency } = toRefs(props);
    const displayFrequency = computed(() => `${baseFrequency.value.toFixed(2)} Hz`)
    return {
      displayFrequency,
    }
  }
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