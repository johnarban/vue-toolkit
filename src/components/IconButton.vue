<template>
  <v-tooltip
    v-model="tooltip"
    :location="tooltipLocation"
    :open-on-click="tooltipOnClick"
    :open-on-focus="tooltipOnFocus"
    :open-on-hover="tooltipOnHover"
    :offset="tooltipOffset"
    :disabled="!tooltipText || !showTooltip"
    :class="['icon-button-v-tooltip', disabled ? 'disabled-tooltip' : '']"
  >
    <template #activator="{ props: tooltipProps }: { props: Record<string,any> }">
      <button
        v-bind="mergeProps(activatorProps ?? {}, tooltipProps)"
        :id="buttonID"
        :class="['icon-wrapper', {'active': modelValue}, attrs.class, {'disabled': disabled}]"
        :style="cssVars"
        :aria-disabled="disabled"
        :aria-label="props.ariaLabel ?? (attrs['aria-label'] as string | undefined) ?? tooltipText"
        :aria-pressed="modelValue != null ? (modelValue ? 'true' : 'false') : undefined"
        :disabled="disabled"
        tabindex="0"
        @click="handleAction"
        @touchstart="handleTouchStart"
        @touchend="handleTouchEnd"
      >
        <slot name="button">
          <!-- nest the font-awesome-icon so that icon always is the same size -->
          <v-icon
            :size="cssSize"
            :class="[`${iconType === 'mdi' ? 'md' : 'fa'}-icon`, icon]"
          >
            <font-awesome-icon
              v-if="iconType === 'fa'"
              :icon="icon"
              :class="['fa-icon', icon]"
              :style="{'width': '1em', 'height': '1em', 'font-size': '1em'}"
            />
            <template v-else>
              {{ icon }}
            </template>
          </v-icon>
        </slot>
      </button>
    </template>
    <span>{{ tooltipText }}</span>
  </v-tooltip>
</template>


<script setup lang="ts">
import { computed, ref, useAttrs, nextTick, mergeProps, type VNode } from "vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { VIcon } from "vuetify/components/VIcon";
import { VTooltip } from "vuetify/components/VTooltip";
import { v4 } from "uuid";

import { FontAwesomeIconSize, IconButtonProps, VIconSize } from "../types";


const props = withDefaults(defineProps<IconButtonProps>(), {
  color: "#ffffff",
  focusColor: "#ffffff",
  activeColor: "#ffffff",
  disabledColor: "rgba(255, 255, 255, 0.38)",
  backgroundColor: "#040404",
  border: true,
  longPressTimeMs: 500,
  tooltipLocation: "start",
  tooltipOnClick: false,
  tooltipOnFocus: false,
  tooltipOnHover: true,
  tooltipOffset: 0,
  showTooltip: true,
  disabled: false,
});

const emit = defineEmits<{
  /** Fired whenever the modelValue of the button changes. If no modelValue is assigned, this will not fire */
  (event: "update:modelValue", active: boolean): void
  /** Fired whenever the button is pressed. This allows receiving events even when a modelValue is not assigned. */
  (event: "activate"): void
}>();

defineSlots<{
  /** Allows configuration of the button content, which by default is simply the button icon */
  button(): VNode[];
}>();

const iconType = computed(() => props.icon.startsWith("mdi-") ? "mdi" : "fa");


type TimeoutType = ReturnType<typeof setTimeout>;
const tooltip = ref(false);
const longPressTimeout = ref<null | TimeoutType>(null);

// Since our colors are used in compound values like e.g. box-shadows,
// we need to directly bind to CSS variables
const cssVars = computed(() => {
  return {
    "--color": props.color,
    "--background-color": props.backgroundColor,
    "--focus-color": props.focusColor,
    "--active-color": props.activeColor,
    "--disabled-color": props.disabledColor,
    "--border": props.border ? "1px solid var(--color)" : "none",
  };
});
const attrs = useAttrs();

const buttonID = computed(() => {
  const id = attrs['id'] as string | undefined;
  return id ?? `${v4()}-icon-button`;
});

function isNumber(value: string | number | undefined): value is number {
  return typeof value === "number" || !isNaN(Number(value));
}

// https://docs.fontawesome.com/web/style/size
const FONT_AWESOME_SIZE_MAP = new Map<FontAwesomeIconSize, string>([
  // relative sizing
  ["2xs", "0.625em"], ["xs", "0.75em"], ["sm", "0.875em"],
  ["lg", "1.25em"]  , ["xl", "1.5em"] , ["2xl", "2em"],
  // absolute sizing
  ["1x", "1em"], ["2x", "2em"], ["3x", "3em"],
  ["4x", "4em"], ["5x", "5em"], ["6x", "6em"],
  ["7x", "7em"], ["8x", "8em"], ["9x", "9em"],
  ["10x", "10em"],
]);

function fa2css(size: FontAwesomeIconSize | string | number): VIconSize {
  // is it one of font-awesome's built in ones.
  if (FONT_AWESOME_SIZE_MAP.has(size as FontAwesomeIconSize)) {
    return FONT_AWESOME_SIZE_MAP.get(size as FontAwesomeIconSize) as VIconSize;
  }
  
  if (isNumber(size)) {
    return `${size}px`;
  }
  return size;
}

const cssSize = computed<VIconSize>(() => {
  return fa2css(props.size);
});

function updateValue() {
  emit("update:modelValue", !props.modelValue);
}

function focusElement() {
  if (props.focusElement) {
    const element = document.querySelector(props.focusElement) as HTMLElement | null;
    if (element) {
      element.focus();
    } else {
      console.warn(`IconButton: focus-element selector "${props.focusElement}" did not match any elements. Make sure the element exists in the DOM and that the selector is correct. For complex layouts managing focus from the @activate event may be more reliable`);
    }
  }
}

function handleAction() {
  if (props.disabled) {
    return;
  }
  updateValue();
  emit('activate');
  nextTick(focusElement);
}

function handleTouchStart() {
  longPressTimeout.value = setTimeout(() => {
    tooltip.value = true;
  }, props.longPressTimeMs);
}

function handleTouchEnd() {
  if (longPressTimeout.value) {
    clearTimeout(longPressTimeout.value);
    longPressTimeout.value = null;
  }
  tooltip.value = false;
}
</script>

<style scoped lang="less">
.icon-wrapper {
  color: var(--color);
  border-color: var(--color);
  background: var(--background-color);
  padding: 6px 8px;
  border: var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
  border-radius: 20px;
  width: min-content;

  &:hover {
    cursor: pointer;
  }

  &:focus {
    color: var(--focus-color);
    border-color: var(--focus-color);
  }

  &.active {
    color: var(--active-color);
    border-color: var(--active-color);
  }
  
  &[disabled] {
    color: var(--disabled-color);
    border: none;
    cursor: not-allowed;
  }
}

.icon-button-v-tooltip {
  
  &.disabled-tooltip .v-overlay__content {
    color: rgb(156, 156, 156); // fallback grey color for disabled state
    color: color-mix(in hsl, currentColor, rgb(var(--v-theme-on-surface-variant)) 80%);
  }
}

// make the md-icon have the same size as the font-awesome-icon
// v-icon applies it's styles to the i.v-icon element style tag
// this is targeting the ::before and making the icon 20% larger than it would be
// it's not perfect but it is closer so that mixed icon types have similarish sizes
:deep(.v-icon.md-icon::before),
:slotted(.v-icon.md-icon::before) {
  font-size: 1.25em;
}

</style>
