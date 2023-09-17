<template>
  <div class="tuner__frequency">Freq: {{ displayFrequency }}</div>
  <div class="tuner__frequency">Closest Tuning: {{ closetTuning }}</div>
</template>

<script lang="ts">
import { computed, ref, toRefs, watch } from 'vue';
import { STANDARD_GUITAR_TUNING } from '../constants'

export default {
  name: 'FrequencyInputDisplay',
  props: {
    baseFrequency: { type: Number, default: 0 }
  },
  setup(props) {
    const { baseFrequency } = toRefs(props);
    const displayFrequency = computed(() => `${baseFrequency.value.toFixed(2)} Hz`)
    const closetTuning = ref('')

    const closestTuningKey = (freq: number, tuning = STANDARD_GUITAR_TUNING): string => {
      let closestKey = '';
      let smallestDifference = Infinity;

      for (let key in tuning) {
        let difference = Math.abs(tuning[key as keyof typeof tuning] - freq);
        if (difference < smallestDifference) {
          smallestDifference = difference;
          closestKey = key;
        }
      }

      return closestKey;
    }

    watch(baseFrequency, (newValue) => {
      closetTuning.value = closestTuningKey(newValue)
    })

    return {
      displayFrequency,
      closetTuning,
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