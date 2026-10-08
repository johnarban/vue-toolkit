<template>
  <div
    :style="cssVars"
    :class="['tour-sheet', 'tour-text', 'selected-info', smallSize ? 'selected-info-tall' : '', 'info-box']"
  >
    <!-- outside .selected-info-scroll so it stays in the corner rather than
         scrolling away with the step's text -->
    <v-icon
      v-if="showClose"
      class="tour-sheet-close"
      icon="mdi-close"
      tabindex="0"
      @click="emit('close')"
      @keyup.enter="emit('close')"
    />
    <!-- fill either slot to replace the step's own content, so callers can put
     something else in this box without passing it all in as props -->
    <div class="selected-info-scroll">
      <slot :step="stepContent">
        <div
          v-if="stepContent"
          class="selected-info-tour"
        >
          <h3 v-if="stepContent.title">
            {{ stepContent.title }}
          </h3>
          <p
            v-for="(paragraph, i) in stepContent.text"
            :key="i"
          >
            <!-- eslint-disable-next-line vue/no-v-html -->
            <span v-html="simpleMarkdownParse(paragraph)" />
          </p>
        </div>
      </slot>
    </div>
    <template v-if="showControls">
      <slot 
        name="controls"
        :step="stepContent"
        :props="props"
      >
        <div class="tour-text-controls">
          <v-btn
            :class="{ 
              'tour-back-button-hidden': stepIndex === 0 && !showBackOnFirstStep,
              'px-2': smallSize,
              'mr-1': smallSize,
            }"
            variant="flat"
            :density="smallSize ? 'compact' : 'default'"
            :color="accentColor"
            :disabled="disablePrevious"
            @click="previous"
          >
            {{ backText }}
          </v-btn>

          <v-breadcrumbs
            v-if="showBreadcrumbs"
            class="tour-dots"
            :items="steps"
            divider=""
          >
            <template #item="{index}">
              <button
                :class="['tour-dot', { 'tour-dot-active': index === stepIndex }]"
                @click="() => goToStep(index)"
              >
                ⬤
              </button>
            </template>
          </v-breadcrumbs>
          <v-spacer v-else />
          <v-btn
            v-if="stepIndex < steps.length - (showNextOnLastStep ? 0 : 1)"
            :class="{ 
              'px-2': smallSize,
              'ml-1': smallSize
            }"
            variant="flat"
            :color="accentColor"
            :density="smallSize ? 'compact' : 'default'"
            :disabled="disableNext"
            @click="next"
          >
            {{ nextText }}
          </v-btn>
        </div>
      </slot>
    </template>
  </div>
</template>
<script lang="ts">
import type { BaseTourStepContent } from '../composables/tour';
</script>
<script setup lang="ts" generic="T extends BaseTourStepContent">
import { simpleMarkdownParse } from "../utils";
import { computed } from 'vue';
import { TourSheetProps } from '../types';
import { VIcon } from 'vuetify/components/VIcon';
import { VBtn } from 'vuetify/components/VBtn';
import { VSpacer } from 'vuetify/lib/components/index.mjs';
import { VBreadcrumbs } from 'vuetify/components/VBreadcrumbs';

const props = withDefaults(defineProps<TourSheetProps<T>>(), {
  smallSize: false,
  showBreadcrumbs: true,
  showNextOnLastStep: false,
  showBackOnFirstStep: false,
  nextText: 'Next',
  backText: 'Back',
  disableNext: false,
  disablePrevious: false,
  showClose: false,
  showControls: true,
  accentColor: "white",
  borderColor: "white",
  backgroundColor: "rgba(10, 5, 21, 0.7)",
  textColor: "white",
  fontSize: "1 rem",
});

const { stepIndex, stepContent, steps } = props.tour;

const cssVars = computed(() => ({
  "--accent-color": props.accentColor, 
  "--border-color": props.borderColor,
  "--background-color": props.backgroundColor,
  "--text-color": props.textColor,
  "--font-size": props.fontSize,
}));

const emit = defineEmits<{
  (e: 'previous' | 'next' | 'leave' | 'close'): void;
  (e: 'step', index: number): void;
}>();

function goToStep(index: number) {
  props.tour.goToStep(index);
  emit("step", index);
}

function next() {
  props.tour.next();
  emit("next");
}

function previous() {
  props.tour.previous();
  emit("previous");
}

</script>

<style scoped lang="less">

p {
  margin-top: 0.5rem;
}

.tour-text p {
  line-height: 1.3;
  margin-top: 0.5em;
}

.tour-text h3 {
  line-height: 1.3;
}

// the floating box is capped at ~50vh, so a step with a full paragraph needs
// tighter spacing to fit. A landscape phone gets a full-height drawer instead
// and has no such pressure, hence keying on the overlay rather than landscape.
.tour-text p {
  margin-top: 0.65em;
}

.tour-text {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
}

.info-box {
  font-size: var(--font-size);
  color: var(--text-color);
  background: var(--background-color);
  border: 2px solid;
  border-radius: 5px;
  padding: 0.5rem;
  margin: 0.25rem;
  pointer-events: auto;
  border-color: var(--border-color);
}

// anchors to .selected-info above; sits over the step title's right end,
// which is short enough that they don't collide
.v-icon.tour-sheet-close {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1;
  cursor: pointer;
}

// the close icon is out of flow, so a long title runs straight under it once the
// box is narrow -- reserve its 24px plus a gap. Keyed on the icon being present
// so a caller that supplies its own close control doesn't get the indent.
.selected-info:has(> .tour-sheet-close) h3 {
  padding-right: 2rem;
}


// the scrollable region: grows to fill whatever space tour-text-controls
// doesn't need, and scrolls on its own so the controls stay visible even
// when a step's text doesn't fit (notably in the floating overlay, where the
// box is capped at ~50vh rather than being full height)
.selected-info-scroll {
  width: 100%;
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  // The floating box is sized to its own content, but the responsive font-size
  // makes that a fractional number and the intrinsic height lands a hair under
  // what the text needs -- enough to raise a scrollbar on a step that visibly
  // fits. This absorbs the rounding; text that genuinely overflows still
  // scrolls, since the box stops growing at its max-height.
  padding-bottom: 2px;
}

.tour-text-controls {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  margin-top: 0.5rem;

  // Scoped to .tour-text-controls, so it catches Back/Next without 
  // touching the breadcrumb dots or the buttons a caller puts in 
  // the controls slot.
  .v-btn {
    border: 1px solid var(--accent-color);
  }

  .tour-back-button-hidden {
    visibility: hidden;
    pointer-events: none;
  }

  .tour-dots {
    flex: 1 1 0;
    min-width: 0;
    max-width: 14rem;
    margin: 0 auto;
    justify-content: space-evenly;
    padding: 0;

    .v-breadcrumbs-item {
      padding: 0 1px;
    }

    // divider="" still renders the divider items, and their padding is what
    // made the row too wide to fit
    .v-breadcrumbs-divider {
      padding: 0 2px;
    }

    button.tour-dot {
      padding: 0;
      --tour-dot-size: 0.5rem;
      font-size: var(--tour-dot-size);
      line-height: 1;
      color: white;
      background: none;
      border: none;
      cursor: pointer;
    }
    
    button.tour-dot-active {
      color: var(--accent-color);
      --font-delta: 0.25em;
      font-size: calc(var(--tour-dot-size) + var(--font-delta));
      margin: calc(-1*var(--font-delta));
      z-index: 10;
    }
  }
}

// the floating box is the short one, so its buttons shrink to leave the step's
// text as much of it as possible. The drawer layouts are roomier and keep the
// default button size.
.tour-text-controls .v-btn {
  --v-btn-size: 0.75rem;
  --v-btn-height: 28px;
  font-size: var(--v-btn-size);
  min-width: 50px;
  padding: 0 12px;
}

.selected-info-tour {
  padding: 0.2em;
}
</style>
