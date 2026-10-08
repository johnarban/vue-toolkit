<template>
  <v-tooltip
    :disabled="!tooltip"
    :text="tooltipText"
  >
    <template #activator="{ props: tooltipProps }: { props: Record<string,any> }">
      <slot 
        name="activator" 
        v-bind="{...tooltipProps, onClick: share, }"
      >
        <v-btn
          :id="id"
          :aria-label="ariaLabel"
          class="share-button"
          icon
          v-bind="tooltipProps"
          :color="buttonColor"
          :elevation="elevation"
          :size="size"
          :rounded="rounded"
          @click="share"
        > 
          <v-icon :color="iconColor">
            mdi-share-variant
          </v-icon>
        </v-btn>
        <v-snackbar 
          v-if="!tooltip || alert"
          class="share-button-snackbar"   
          timeout="3500" 
          location="top" 
          :activator="`#${id}`"
          :text="alertText"
          color="success"
          variant="flat"
          min-height="0px"
          min-width="0px"
          transition="slide-y-transition"
          close-on-content-click
        />
      </slot>
    </template>
  </v-tooltip>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useClipboard } from "@vueuse/core";
import { VTooltip, VBtn, VIcon, VSnackbar } from "vuetify/components";
const { copy } = useClipboard();
import { v4 } from "uuid";
import type { ShareButtonProps } from "../types";

const id = ref(`share-button-${v4()}`);

const props = withDefaults(defineProps<ShareButtonProps>(), {
  source: () => window.location.href,
  buttonColor: "#ffffff66",
  iconColor: "#333",
  elevation: "0",
  size: "small",
  rounded: "1",
  tooltip: true,
  tooltipText: "Share selected view",
  alert: false,
  alertText: "Share link copied to clipboard. Paste to share this view!",
  ariaLabel: "Get link to share selected view",
});

const emit = defineEmits<{
  /** Fired whenever the share button is pressed. */
  (event: "share"): void
}>();

function getURL() {
  if (typeof props.source === "string") {
    return props.source;
  }
  return props.source ? props.source() : window.location.href;
}

function share() {
  copy(getURL());
  emit("share");
}
</script>

<style scoped lang="less">
.share-button {
  z-index: 1000;
  padding-inline: 5px;
  border-radius: 8px !important;
  border: thin solid var(--accent-color-2) !important;

  & .v-snackbar__wrapper > .v-snackbar__content {
    padding: 0.75em 1em;
  }
}

</style>
