<!-- Design Inspired by Date/Time Picker at Stellarium Web https://stellarium-web.org/ -->
<template>
  <div
    class="dtp__container"
    :style="cssStyles"
  >
    <div class="dtp__row">
      <div class="dtp__grid-container">
        <!-- 1-1 -->
        <button
          id="dtp__year-up"
          class="dtp__grid-item"
          @click="increment('year')"
        >
          <span class="dtp__button-label">yr</span>
          <v-icon>mdi-menu-up</v-icon>
        </button>
        <!-- 2-1 -->
        <tap-to-input
          id="dtp__year"
          v-model="year"
          :editable="props.editableTime"
          class="dtp__grid-item dtp__time_part"
          :min="limits.year.min"
          :max="limits.year.max"
          aria-label="Year"
        />
        <!-- 3-1 -->
        <button
          id="dtp__year-up"
          class="dtp__grid-item"
          @click="decrement('year')"
        >
          <v-icon>mdi-menu-down</v-icon>
        </button>

        <!-- 1-2 -->
        <span />
        <!-- 2-2 -->
        <span>-</span>
        <!-- 3-2 -->
        <span />

        <!-- 1-3 -->
        <button
          id="dtp__month-up"
          class="dtp__grid-item"
          @click="increment('month')"
        >
          <span class="dtp__button-label">mo</span>
          <v-icon>mdi-menu-up</v-icon>
        </button>
        <!-- 2-3 -->
        <tap-to-input
          id="dtp__month"
          v-model="month"
          :editable="props.editableTime"
          class="dtp__grid-item dtp__time_part"
          :min="limits.month.min"
          :max="limits.month.max"
          pad2
          aria-label="Month"
        />
        <!-- 3-3 -->
        <button
          id="dtp__month-up"
          class="dtp__grid-item"
          @click="decrement('month')"
        >
          <v-icon>mdi-menu-down</v-icon>
        </button>

        <!-- 1-4 -->
        <span />
        <!-- 2-4 -->
        <span>-</span>
        <!-- 3-4 -->
        <slot name="bottom">
          <span />
        </slot>

        <!-- 1-5 -->
        <button
          id="dtp__day-up"
          class="dtp__grid-item"
          @click="increment('day')"
        >
          <span class="dtp__button-label">day</span>
          <v-icon>mdi-menu-up</v-icon>
        </button>
        <!-- 2-5 -->
        <tap-to-input
          id="dtp__day"
          v-model="day"
          :editable="props.editableTime"
          class="dtp__grid-item dtp__time_part"
          :min="limits.day.min"
          :max="limits.day.max"
          pad2
          aria-label="Day"
        />
        <!-- 3-5 -->
        <button
          id="dtp__day-up"
          class="dtp__grid-item"
          @click="decrement('day')"
        >
          <v-icon>mdi-menu-down</v-icon>
        </button>

        <!-- 1-6 -->
        <slot name="top">
          <span />
        </slot>
        <!-- 2-6 -->
        <span class="dtp__middle-slot"><slot name="center" /></span>
        <!-- 3-6 -->
        <span />

        <!-- 1-7 -->
        <button
          id="dtp__hour-up"
          class="dtp__grid-item"
          @click="increment('hour')"
        >
          <span class="dtp__button-label">hr</span>
          <v-icon>mdi-menu-up</v-icon>
        </button>
        <!-- 2-7 -->
        <tap-to-input
          id="dtp__hour"
          v-model="displayHour"
          :editable="props.editableTime"
          class="dtp__grid-item dtp__time_part"
          :min="limits.hour.min"
          :max="limits.hour.max"
          pad2
          aria-label="Hour"
        />
        <!-- 3-7 -->
        <button
          id="dtp__hour-up"
          class="dtp__grid-item"
          @click="decrement('hour')"
        >
          <v-icon>mdi-menu-down</v-icon>
        </button>

        <!-- 1-8 -->
        <span />
        <!-- 2-8 -->
        <span>:</span>
        <!-- 3-8 -->
        <span />

        <!-- 1-9 -->
        <button
          id="dtp__minute-up"
          class="dtp__grid-item"
          @click="increment('minute')"
        >
          <span class="dtp__button-label">min</span>
          <v-icon>mdi-menu-up</v-icon>
        </button>
        <!-- 2-9 -->
        <tap-to-input
          id="dtp__minute"
          v-model="minute"
          :editable="props.editableTime"
          class="dtp__grid-item dtp__time_part"
          :min="limits.minute.min"
          :max="limits.minute.max"
          pad2
          aria-label="Minute"
        />
        <!-- 3-9 -->
        <button
          id="dtp__minute-up"
          class="dtp__grid-item"
          @click="decrement('minute')"
        >
          <v-icon>mdi-menu-down</v-icon>
        </button>

        <!-- 1-10 -->
        <span />
        <!-- 2-10 -->
        <span>:</span>
        <!-- 3-10 -->
        <span />

        <!-- 1-11 -->
        <button
          id="dtp__second-up"
          class="dtp__grid-item"
          @click="increment('second')"
        >
          <span class="dtp__button-label">sec</span>
          <v-icon>mdi-menu-up</v-icon>
        </button>
        <!-- 2-11 -->
        <tap-to-input
          id="dtp__second"
          v-model="second"
          :editable="props.editableTime"
          class="dtp__grid-item dtp__time_part"
          :min="limits.second.min"
          :max="limits.second.max"
          pad2
          aria-label="Second"
        />
        <!-- 3-11 -->
        <button
          id="dtp__second-up"
          class="dtp__grid-item"
          @click="decrement('second')"
        >
          <v-icon>mdi-menu-down</v-icon>
        </button>

        <!-- <div class="dtp__rollers up-rollers"> -->
        <!-- </div> -->

        <!-- <span class="dtp__time-string"> -->
        <!-- <span id="dtp__year" class="dtp__grid-item dtp__time_part">{{ year }}</span> -->

        <!-- <span id="dtp__month" class="dtp__grid-item dtp__time_part">{{ pad2(month) }}</span> -->
        <!-- <span id="dtp__day" class="dtp__grid-item dtp__time_part">{{ pad2(day) }}</span>  -->
        <!-- <span id="dtp__hour" class="dtp__grid-item dtp__time_part">{{ pad2(displayHour) }}</span> -->
        <!-- <span id="dtp__minute" class="dtp__grid-item dtp__time_part">{{ pad2(minute) }}</span> -->
        <!-- <span id="dtp__second" class="dtp__grid-item dtp__time_part">{{ pad2(second) }}</span> -->
        <!-- </span> -->
      </div>
      
      <div
        v-if="props.useAmPm"
        class="dtp__ampm"
      >
        <button 
          name="set-am" 
          :class="['dtp__ampm-button', 'dtp__ampm-am', { 'dtp__ampm-active': isAm }]" 
          aria-label="Set AM" 
          @click="isAm = true"
        >
          AM
        </button>
        <button 
          name="set-pm" 
          :class="['dtp__ampm-button', 'dtp__ampm-pm', { 'dtp__ampm-active': !isAm }]" 
          aria-label="Set PM" 
          @click="isAm = false"
        >
          PM
        </button>
      </div>
    </div>
    
    <div class="dtp__bottom-content">
      <slot />
    </div>
    <div
      v-if="props.debug"
      class="dtp__debug"
    >
      <span>Local: {{ year }}-{{ pad2(month) }}-{{ pad2(day) }} {{ pad2(hour) }}:{{ pad2(minute) }}:{{ pad2(second) }}</span>
      <span>UTC: {{ utcDate(modelValue) }} </span>
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref, watch, computed, type VNode } from 'vue';
import TapToInput from './TapToInput.vue';
import { DateTimePickerProps } from "../types";

const props = withDefaults(defineProps<DateTimePickerProps>(), {
  debug: false,
  useAmPm: true,
  editableTime: true,
  accentColor: "#f4ba3e",
});

const emit = defineEmits<{
  /** Fired whenever the datetime value is change d*/
  (event: "update:modelValue", datetime: Date): void
}>();

// TODO: Make these descriptions better
defineSlots<{
  /** A slot for adding additional content below the datetime picker. */
  default(): VNode[];
  /** A slot for adding additional content at the top-middle of the picker */
  top(): VNode[];
  /** A slot for adding additional content at the center-middle of the picker */
  center(): VNode[];
  /** A slot for adding additional content at the bottom-middle of the picker */
  bottom(): VNode[];
}>();

const year = ref(props.modelValue.getFullYear());
const month = ref(props.modelValue.getMonth()+1);
const day = ref(props.modelValue.getDate());
const hour = ref(props.modelValue.getHours());
const minute = ref(props.modelValue.getMinutes());
const second = ref(props.modelValue.getSeconds());

const cssStyles = computed(() => {
  return {
    "--accent-color": props.accentColor,
  };
});

const isAm = computed({
  get: () => hour.value < 12,
  set: (value) => {
    if (value) {
      for (let i = 0; i < 12; i++) {
        decrement('hour');
      }
    } else {
      for (let i = 0; i < 12; i++) {
        increment('hour');
      }
    }
  }
});

const values = {
  year: year,
  month: month,
  day: day,
  hour: hour,
  minute: minute,
  second: second,
};


const limits = computed(() => ({
  year: { min: 1, max: Infinity },
  month: { min: 1, max: 12 },
  day: { min: 1, max: _daysInMonth(month.value, year.value) },
  hour: { min: 0, max: 23 },
  minute: { min: 0, max: 59 },
  second: { min: 0, max: 59 },
}));

/**
  JC: For reasons that I don't entirely understand, we get a build error
  if we do
  ```
  const units = ["second", "minute", "hour", "day", "month", "year"] as const;
  type Unit = typeof units[number];
  ```
  I'd prefer that as it's less redundant, but oh well
*/
type Unit = "second" | "minute" | "hour" | "day" | "month" | "year";
const units: Unit[] = ['second', 'minute', 'hour', 'day', 'month', 'year'];

function changeValue(unit: Unit, increment: boolean) {
  const limit = limits.value[unit].max;
  const min = limits.value[unit].min;

  if (increment) {
    if (values[unit].value < limit) {
      values[unit].value++;
    } else {
      values[unit].value = min;
      const nextUnit = units[units.indexOf(unit) + 1];
      if (nextUnit) {
        changeValue(nextUnit, increment);
      } else if (unit === 'hour' && props.useAmPm) {
        // Toggle AM/PM when hour goes from 11 to 12
        isAm.value = !isAm.value;
      }
    }
  } else {
    if (values[unit].value > min) {
      values[unit].value--;
    } else {
      values[unit].value = limit;
      const prevUnit = units[units.indexOf(unit) + 1];
      if (prevUnit) {
        changeValue(prevUnit, increment);
      } else if (unit === 'hour' && props.useAmPm) {
        // Toggle AM/PM when hour goes from 12 to 11
        isAm.value = !isAm.value;
      }
    }
  }

  // Ensure hour is always between 0 and 23
  if (unit === 'hour') {
    hour.value = hour.value % 24;
  }
}

const displayHour = computed({
  get() {
    if (props.useAmPm) {
      const h = hour.value % 12;
      return h === 0 ? 12 : h;
    } else {
      return hour.value;
    }
  },
  set(value: number) {
    if (props.useAmPm) {
      if (value === 12) {
        hour.value = isAm.value ? 0 : 12;
      } else {
        hour.value = isAm.value ? value : value + 12;
      }
    } else {
      hour.value = value;
    }
  }
});

function increment(value: Unit) {
  changeValue(value, true);
}

function decrement(value: Unit) {
  changeValue(value, false);
}

function _daysInMonth(month: number, year: number) {
  return new Date(year, month, 0).getDate();
}


function utcDate(date: Date) {
  // utc date string
  return date.toISOString(); 
}

function pad2(n: number) {
  return n.toString().padStart(2, '0');
}

// update the date v-model
watch([year, month, day, hour, minute, second], () => {
  const newDate = new Date(year.value, month.value-1, day.value, hour.value, minute.value, second.value);
  emit("update:modelValue", newDate);
});

// watcher to fix leap years
watch([year, month, day, hour, minute, second], () => {
  if (month.value === 2 && day.value > _daysInMonth(month.value, year.value)) {
    day.value = _daysInMonth(month.value, year.value);
  }
});
// after we have mounted make the up and down buttons the same width
// keep this up to date with the model value
watch(() => props.modelValue, (date) => {
  year.value = date.getFullYear();
  month.value = date.getMonth()+1;
  day.value = date.getDate();
  hour.value = date.getHours();
  minute.value = date.getMinutes();
  second.value = date.getSeconds();
});

</script>

<style scoped lang="less">
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Mono:wght@500&display=swap');

.dtp__container {
  padding-top: 1.5em;
  padding-bottom: 5px;
  padding-inline: 15px;
}

@media (max-width: 350px) {
  .dtp__container {
    font-size: 5vw;
  }
}

.dtp__grid-container {
  display: grid;
  grid-auto-flow: column;
  grid-template-columns: repeat(11, 0fr);
  grid-template-rows: auto auto auto;
  justify-items: center;
  justify-content: center;
  font-family: 'Noto Sans Mono', monospace;
  gap: 2px;
  margin-bottom: 10px;
}

.dtp__row {
  display: grid;
  grid-template-columns: 0fr 0fr;
  align-items: center;
  gap: 1em;
}

@media (max-width: 350px) {
  .dtp__row {
    display: grid;
    grid-template-columns: 0fr;
    grid-template-rows: 0fr 0fr;
    justify-items: center;
    gap: 2px;
  }
}

.dtp__grid-container > * {
  margin: 0;
  padding: 0;
  width: 100%;
}

.dtp__middle-slot {
  width: 1.5em;
}

.dtp__bottom-content {
  display: flex;
  justify-content: center;
  align-items: center;
}

.dtp__grid-item {
  position: relative;
  // outline: 1px solid red;
  text-align: center;
}

span.dtp__button-label {
  font-size: 0.8em;
  // display: none;
  position:absolute;
  top: -5px;
  left: 50%;
  transform: translate(-50%, -50%);
  // outline: 1px solid red;
}

.dtp__ampm {
  display: grid;
  grid-template-columns: 3em;
  grid-template-rows: 0fr 0fr;
  gap: 1px;
}

.dtp__ampm-button {
  background-color: #444;
  color: #ccc;
  padding: 0;
  align-self: center;
  font-size: .9em;
  width: 4ch;
}

// for dtp__ampm-am/pm add only left right and top/bottom border raidus
.dtp__ampm-am {
  border: 1px solid var(--accent-color);
  border-top-left-radius: .75ch;
  border-top-right-radius: .75ch;
  border-bottom: none
}

.dtp__ampm-pm {
  border: 1px solid var(--accent-color);
  border-bottom-left-radius: .75ch;
  border-bottom-right-radius: .75ch;
  border-top: none
}

@media (max-width: 350px) { 
  .dtp__ampm {
    grid-template-columns: 0fr 0fr;
    grid-template-rows: 0fr;
    margin-bottom: 0.5em;
  }
  
  .dtp__ampm-am {
    border: 1px solid var(--accent-color);
    border-radius: 0;
    border-top-left-radius: .75ch;
    border-bottom-left-radius: .75ch;
    border-right: none;
  }
  
  .dtp__ampm-pm {
    border: 1px solid var(--accent-color);
    border-radius: 0;
    border-top-right-radius: .75ch;
    border-bottom-right-radius: .75ch;
    border-left: none;
  }
  
}

.dtp__ampm-active {
  color: var(--accent-color);
  background-color: #0e0552;
}

/* Chrome, Safari, Edge, Opera */
.dtp__container input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
.dtp__container  input[type=number] {
  -moz-appearance: textfield;
  appearance: textfield;
}

input#dtp__year {
  width: 4ch;
}

input.dtp__time_part {
  width: 2.5ch;
}

</style>
