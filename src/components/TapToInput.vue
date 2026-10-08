<!-- Input/Display with up down arrow above and below -->
<template>
  <span 
    v-if="!editing || !props.editable"
    ref="display"
    class="tti__display"
    tabindex="0"
    @click="editing = !editing"
    @keyup.enter="editing = !editing"
  >{{ pad(pseudoValue) }}
  </span>
  <input 
    v-else
    ref="input" 
    type="number"
    :min="minValue"
    :max="maxValue"
    :step="stepValue" 
    :value="pseudoValue"
    class="tti__input"
    @change="setValue"
    @blur="blurred"
  >
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import type { TapToInputProps } from "../types";

const editing = ref(false);
const input = ref();

const props = withDefaults(defineProps<TapToInputProps>(), {
  editable: true,
  min: 0,
  max: 9999,
  step: 1,
  clamp: false,
  zeroPadLength: 0,
});

const emit = defineEmits<{
  (event: "update:modelValue", value: number): void
}>();

const pseudoValue = ref(props.modelValue);

function pad(value: number) {
  if (props.zeroPadLength > 0) {
    return value.toString().padStart(props.zeroPadLength, '0');
  }
  return value;
}

const parseValue = (value: string | number | CallableFunction) => {
  if (typeof value === 'number') {
    return value;
  } 
  if (typeof value === 'function') {
    return value();
  }
  return value.includes('.') ? parseFloat(value) : parseInt(value);
};

const minValue = ref(parseValue(props.min));
const maxValue = ref(parseValue(props.max));
const stepValue = ref(parseValue(props.step));

function setValue(event: Event) {
  if (event.target) {
    pseudoValue.value = parseInt((event.target as HTMLInputElement).value);
  }
}

function blurred() {
  editing.value = false;
}

function round(value: number, toNearest: number): number {
  return Math.round(value / toNearest) * toNearest;
}

const isValid = computed(() => {
  if (pseudoValue.value < minValue.value) {
    return false;
  }
  if (pseudoValue.value > maxValue.value) {
    return false;
  }
  return true;
});

function clampValue(value: number) {
  if (!props.clamp) {
    return value;
  }
  if (value < minValue.value) {
    value = minValue.value;
  } else if (value > maxValue.value) {
    value = maxValue.value;
  }
  if ((value % stepValue.value) !== 0) {
    value = round(value, stepValue.value);
  }
  return value;
}

// Watchers
watch(() => props.min, (newVal) => {
  minValue.value = parseValue(newVal);
  pseudoValue.value = clampValue(pseudoValue.value);
});

watch(() => props.max, (newVal) => {
  maxValue.value = parseValue(newVal);
  pseudoValue.value = clampValue(pseudoValue.value);
});

watch(() => props.step, (newVal) => {
  stepValue.value = parseValue(newVal);
});

watch(() => props.modelValue, (newVal) => {
  pseudoValue.value = clampValue(newVal);
});

watch(input, (value) => {
  if (value) {
    value.focus();
  }    
});

watch(pseudoValue, (newValue, oldValue) => {
  if (isValid.value) {
    emit("update:modelValue", pseudoValue.value);
    return;
  }
  if (props.clamp) {
    pseudoValue.value = clampValue(newValue);
    emit("update:modelValue", pseudoValue.value);
    return;
  }
  pseudoValue.value = oldValue;
});

</script>

<style scoped>
/* Chrome, Safari, Edge, Opera */
input.tti__input::-webkit-outer-spin-button,
input.tti__input::-webkit-inner-spin-button
{
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input.tti__input[type='number']
{
  -moz-appearance: textfield;
  -webkit-appearance: textfield;
  appearance: textfield;
}

input.tti__input[type='number']
{
  text-align: center;
}

input.tti__input[type='number']:invalid
{
  background-color: #fd6969;
}

</style>
