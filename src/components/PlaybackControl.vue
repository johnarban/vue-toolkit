<template>
  <div
    id="enclosing-playback-container"
    :style="cssVars"
  >
    <!-- add a close box -->
    <button
      v-if="(inline && inlineButton) || showCloseButton"
      id="playback-close-button"
      @click="emit('closed')"
    >
      <v-icon
        :color="color"
        size="18"
      >
        mdi-close
      </v-icon>
    </button>
    
    <div
      v-if="!inline || inlineButton && !hidePlayButton"
      id="playback-play-pause-button"
    >
      <icon-button
        :icon="isPaused ? (icons?.play ?? 'mdi-play') : (icons?.pause ?? 'mdi-pause')"
        :color="color"
        :focus-color="color"
        :disabled="disabled?.playPause"
        aria-label="Play/Pause"
        tooltip-text="Play/Pause"
        tooltip-location="top"
        tooltip-offset="5px"
        size="18"
        @activate="isPaused = !isPaused"
      />

      <div
        v-if="!inline || inlineButton"
        id="playback-reverse-time"
      >
        <icon-button
          :icon="reverseTime ? (icons?.playForward ?? 'mdi-step-forward-2') : (icons?.playBackward ?? 'mdi-step-backward-2')"
          :color="color"
          :focus-color="color"
          :disabled="disabled?.reverse"
          aria-label="Forward/Reverse"
          tooltip-text="Forward/Reverse"
          tooltip-location="top"
          tooltip-offset="5px"
          size="18"
          @activate="reverseTime = !reverseTime"
        />
        <span id="reverse-button-text">{{ reverseTime ? 'Forward' : 'Reverse' }}</span>
      </div>
    </div>
    
    <div id="playback-slider-container">
      <div id="tick-container">
        <div
          v-for="val in index"
          :key="val"
          v-bind="options(val)"
          class="tick"
        >
          <span class="tick-label"> {{ valueToMark(val) }} </span>
        </div>
      </div>
      
      <v-slider
        ref="slider"
        v-model="value"
        hide-details
        :max="max ?? index[index.length - 1]"
        :min="min ?? index[0]"
        :thumb-size="16"
        :disabled="disabled?.slider"
        color="white"
        track-color="white"
        track-fill-color="white"
        thumb-color="blue"
        track-size="8"
        :step="step"
        show-ticks="always"
        :ticks="marks"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { SymmetricalLogTransform } from "../symmetrical_log";
import { PlaybackControlProps } from "../types";

import { IconButton } from "..";
import { VSlider } from "vuetify/lib/components/index.mjs";

const props = withDefaults(defineProps<PlaybackControlProps>(), {
  modelValue: 1,
  maxPower: 3,
  paused: true,
  max: null,
  min: null,
  color: "white",
  small: false,
  inline: true,
  inlineButton: false,
  showCloseButton: false,
  hidePlayButton: false,
});

const emit = defineEmits<{
  (event: "closed"): void;
  (event: "paused", paused: boolean): void
  (event: "update:modelValue", rate: number): void
}>();

const symLog = new SymmetricalLogTransform(10);
const index = ref(symLog.sequence(props.maxPower).filter(v => v > 0));

onMounted(() => {
  const container = document.getElementById("playback-slider-container");
  if (container) {
    const input = container.querySelector(".v-slider__container");
    if (input) {
      const height = input.clientHeight;
      container.style.setProperty("--v-slider-height", `${height}px`);
    }
  }

  // Create a resize observer for enclosing-playback-container
  // that adjusts its scale relative to a certain width
  const resizeObserver = new ResizeObserver(_entries => {
    const track = document.querySelector(".v-slider-track") as HTMLElement;
    const container = document.getElementById("enclosing-playback-container") as HTMLElement;
    if (container) {
      const input = container.querySelector('.v-slider__container');
      const tickContainer = document.querySelector('#tick-container') as HTMLElement;
      
      const psc = document.querySelector('#playback-slider-container') as HTMLElement;
      if (track && container) {
        const s = track.scrollWidth;
        container.style.setProperty('--track-width', `${s}px`);
      }
      if (tickContainer && input && psc) {
        psc.style.setProperty('--v-slider-height', `${input.clientHeight}px`);
      }
      
      if (props.inline && container) {
        container.classList.add('inset');
      } else {
        container.classList.remove('inset');
      }
    }
  });

  resizeObserver.observe(document.getElementById("enclosing-playback-container")!);
});

const cssVars = computed(() => {
  return {
    color: props.color,
  };
});

const reverseTime = computed({
  get() {
    return props.modelValue < 0;
  },
  set(reverse: boolean) {
    const val = symLog.fromSymLogIndex<number>(value.value);
    emit("update:modelValue", reverse ? -val : val);
  }
});

const value = computed({
  get() {
    return Math.abs(symLog.toSymlogIndex<number>(props.modelValue));
  },
  set(value: number) {
    const abs = symLog.fromSymLogIndex<number>(value);
    const sign = reverseTime.value ? -1 : 1;
    emit("update:modelValue", sign * abs);
  }
});

const isPaused = computed({
  get() {
    return props.paused;
  },
  set(pause: boolean) {
    emit("paused", pause);
  }
});

const step = computed(() => Math.abs(value.value) <= 1 ? 1 : 0.1);

const marks = computed<Record<number, string>>(() => {
  const mks: Record<number, string> = {};
  index.value.forEach((value) => {
    const pre = reverseTime.value ? -1 : 1;
    mks[value] = value === 0 ? '' : (pre * symLog.fromSymLogIndex<number>(value)).toString();
  });
  return mks;
});

function valueToMark(value: number): string {
  if (value === 0) {
    return "Pause";
  }
  const pre = reverseTime.value ? -1 : 1;
  return `${(pre * symLog.fromSymLogIndex<number>(value)).toString()}x`;
}

function options(value: number): { style: { left: string } } {
  const min = props.min ?? index.value[0];
  const max = props.max ?? index.value[index.value.length - 1];
  const pos = (value - min) / (max - min) * 100;
  return {
    style: {
      left: `${pos}%`,
    },
  };
}
</script>

<style scoped lang="less">
#enclosing-playback-container {
  // modify the Vuetify slider properties
  contain: layout;
  display: flex;
  flex-grow: 1;
  align-items: center;
  width: 100%;
  padding-left: 0.5rem;
  padding-right: 0.25rem;
  padding-block-start: 0.25rem;
  padding-block-end: 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid white;
  // min-width: 200px;
  max-width: 510px;
  background-color: #272727;
  font-size: 0.7rem;
  --track-width: 0px; // get set by the resize observer to the actual track width
  --min-tick-gap: 0.2rem;
  --tick-color: #ddd;
  --track-color: white;
  --tick-font-size: 1em;
  pointer-events: auto;
  z-index: 9999;
  
  // no close button normally
  #playback-close-button {
    position: absolute;
    right: 0;
    top: 0;
    transform: translate(125%, 0);
    
    border-radius: 50%;
    padding: 2px;

    pointer-events: auto;
    
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--color);
    background-color: black;
    color: var(--color);

    &:hover {
      cursor: pointer;
    }
  }
    
  // #playback-close-button {
  //   display: none;
  // }
  
  &.inset {
    padding: 0;
    padding-inline: 0.25rem;
    padding-block-end: 1em;
    background-color: black;
    
    border: 2px solid var(--color);
    // transform: translateY(25%);
    
    --tick-font-size: clamp(10px, 1.5vw, 1em);
    
    i.v-icon {
      font-size: clamp(1vw, 1.5em, 18px) !important;
      width: 1em !important;
      height: 1em !important;
    }
    
    #playback-play-pause-button {
      i.v-icon {
        font-size: clamp(1vw, 1.5em, 24px) !important;
        width: 1.5em !important;
        height: 1em !important;
      }
    }
    
    #playback-slider-container {
      padding-inline-start: 0.5rem;
    }
    
  }
  
  #playback-play-pause-button {
    display: flex;
    margin-inline-end: 0.5rem;
    flex-direction: row;
    align-items: center;
    gap: 0.75em;
    pointer-events: auto!important;
    
    #playback-reverse-time {
      position: relative;
      #reverse-button-text {
        position: absolute;
        font-size: var(--tick-font-size);
        left: 0%;
      }
      .icon-wrapper {
        border-radius: 2em;
      }
    }

  }
  
    > #playback-play-pause-button.hide {
      display: none; 
    }
    
  #playback-slider-container {
    flex-grow: 1;
  }

  #playback-slider-container {
    display: flex;
    flex-direction: column;
    position: relative;
    padding-left: 0.5rem;
    --v-slider-height: 32px;
    --psc-offset: calc(-1*var(--tick-font-size)/2);

    height: calc(var(--v-slider-height) + var(--tick-font-size));
        
    .v-slider-track__ticks {
      border-radius: calc(var(--v-slider-height) / 2);
    }
    
    .v-slider-track__tick-label {
      display: none;
    }
    
    
    .track-tick-size {
      font-size: var(--v-slider-track-size);
      --avail-space: calc((var(--track-width) - 18 * var(--min-tick-gap)) / 9);
      --v-slider-tick-size: clamp(1em, var(--avail-space), 3em); // scale with track size
      border-radius: 50%;
    }
    
    .pause-color {
      --pause-color: rebeccaPurple !important;
      background-color: var(--pause-color);
      &.v-slider-track__tick--filled {
        background-color: var(--pause-color);
      }
    }
    
    // the zero tick mark
    
    
    // push the track to the back
    .v-slider-track * {
        opacity: 1;
        background-color: var(--track-color);
      }

    // show no progress fill
    .v-slider-track__fill {
      opacity: 0;
    }
    
    .v-slider-track__tick {
      .track-tick-size();
      
      background-color: var(--tick-color);
      
      &.v-slider-track__tick--filled {
        // margin-inline-start: calc(100% - var(--v-slider-tick-size) - 1px); // default
        background-color: var(--tick-color);
      }
      
      &.v-slider-track__tick--first {
        // margin-inline-start: calc(var(--v-slider-tick-size) + 1px); // default
        margin-inline-start: 0px;
      }
      
      &.v-slider-track__tick--last {
        // margin-inline-start: calc(100% - var(--v-slider-tick-size) - 1px); // default
        margin-inline-start: 100%;
      }
    
    }
      
    @media (max-width: 500px){
      
      .v-slider-track__tick {
        --v-slider-tick-size: 2em;
      }
      
    }

  }
  
  .icon-wrapper {
    pointer-events: auto;
  }

  #tick-container {
    --height: 0px;
    --position: calc(var(--v-slider-height) + var(--height));
    margin-inline: 8px;
    position: relative;
    height: var(--height);
    transform: translateY(var(--position));
    
    @media (max-width: 500px) {
      --position: calc(var(--v-slider-height) - 0.5em);
      transform: translateY(--position);
    }

    .tick {
      position: absolute;
      transform: translateX(-50%);
    }
    

    .tick-label {
      font-size: var(--tick-font-size);
      color: white;
    }

  }

}
</style>
