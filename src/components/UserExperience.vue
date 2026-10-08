<template>
  <v-card
    id="cds-user-experience"
    class="rating-root"
    :color="color"
    :style="css"
  >
    <template #title>
      <div class="rating-title">
        <span>{{ question }}</span>
        <v-spacer />
        <v-btn
          density="compact"
          class="close-button"
          icon="mdi-close"
          @click="emit('dismiss', currentRating, comments)"
        />
      </div>
    </template>
    <v-card-text>
      <!-- TODO: contemplate changing this to focus the v-form with tabindex="-1"
       and using left/right arrow keys to select the rating, and enter to submit. 
        -->
      <v-form
        @submit.prevent="emit('finish', currentRating, comments)"
      >
        <div class="rating-icon-row">
          <template
            v-for="rating in ratings"
          >
            <slot
              :rating="rating"
            >
              <v-hover
                :key="rating"
              >
                <template #default="{ isHovering, props: tooltipProps }: { isHovering: boolean | null, props: Record<string, unknown> }">
                  <button
                    v-bind="tooltipProps"
                    class="rating-button"
                    :aria-label="rating"
                    :aria-pressed="rating === currentRating"
                    @click="setRating(rating)"
                  >
                    <FontAwesomeIcon
                      :size="iconSize"
                      :class="['rating', rating, {'hovered': isHovering}, {'selected': rating === currentRating}]"
                      :icon="ratingIcons[rating as UserExperienceRating][0]"
                      :color="(isHovering || rating === currentRating) ? ratingIcons[rating as UserExperienceRating][1]: baseColor"
                    />
                  </button>
                </template>
              </v-hover>
            </slot>
          </template>
        </div>
        <v-expand-transition>
          <VTextarea
            v-if="showComments"
            v-model="comments"
            class="comments-box text-body-2"
            :placeholder="commentPlaceholder"
            auto-grow
            max-rows="4"
            density="compact"
            width="100%"
            @keydown.stop
          />
        </v-expand-transition>
        <v-expand-transition>
          <v-btn
            v-if="currentRating || showComments"
            type="submit"
            width="fit-content"
            color="success"
          >
            Submit 
          </v-btn>
        </v-expand-transition>
      </v-form>
    </v-card-text>
    <template #actions>
      <slot name="footer" />
    </template>
  </v-card>
</template>

<script setup lang="ts">
/* eslint-disable @typescript-eslint/naming-convention */
import { computed, ref, watch, useSlots } from "vue";
import { useTheme } from "vuetify";
import { DEFAULT_RATING_COLORS, type UserExperienceRating } from "../utils";
import { UserExperienceProps } from "../types";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faFaceGrinStars,
  faFaceSmile,
  faFaceMeh,
  faFaceFrownOpen,
  faFaceFrown,
} from "@fortawesome/free-solid-svg-icons";

import { VTextarea, VExpandTransition, VCard, VForm, VSpacer, VCardText, VBtn, VHover } from "vuetify/components";

const { current: currentTheme } = useTheme();

const props = withDefaults(defineProps<UserExperienceProps>(), {
  ratingColors: () => DEFAULT_RATING_COLORS,
  question: "How would you rate your experience?",
  commentPlaceholder: "Please tell us more if you like",
  askForComments: true,
  iconSize: "5x",
  color: "surface",
});

const emit = defineEmits<{
  (event: "rating", rating: UserExperienceRating | null): void;
  (event: "finish", rating: UserExperienceRating | null, comments: string | null): void;
  (event: "dismiss", rating: UserExperienceRating | null, comments: string | null): void;
}>();

const slots = useSlots();
const showFooter = computed(() => !!slots.footer);

const css = computed(() => ({
  "--footer-visible": showFooter.value ? "visible" : "none",
}));

library.add(faFaceGrinStars);
library.add(faFaceSmile);
library.add(faFaceMeh);
library.add(faFaceFrownOpen);
library.add(faFaceFrown);


const ratingIcons: Record<UserExperienceRating, [string, string]> = {
   
  "very_bad": ["fa-face-frown", "red"],
  "poor": ["fa-face-frown-open", "orange"],
  "good": ["fa-face-smile", "lightgreen"],
  "excellent": ["fa-face-grin-stars", "green"],
};

const ratings = Object.keys(ratingIcons) as UserExperienceRating[];

const currentRating = ref<UserExperienceRating | null>(null);
const baseColor = computed(() => props.baseColor ?? (currentTheme.value.dark ? 'white' : 'black'));
const comments = ref<string | null>(null);
const showComments = ref(false);

function setRating(rating: UserExperienceRating | null) {
  currentRating.value = rating;
}

watch(currentRating, (rating: UserExperienceRating | null) => {
  if (rating) {
    if (props.askForComments) {
      showComments.value = true; 
    }
    emit("rating", rating);
  }
});
</script>

<style scoped lang="less">

#cds-user-experience {
  .rating-root {
    display: flex;
    flex-direction: column;
    gap: 10px;
    align-items: center;
    padding: 5px;
  }

  .rating-icon-row {
    display: flex;
    flex-direction: row;
    gap: 10px;
    padding: 20px;
    justify-content: center;
  }

  .rating-button {
    cursor: pointer;
  }

  .rating {
    transition: color 0.1s;
  }

  .selected {
    border-radius: 50%;
    box-shadow: 0 0 0 5px silver;
  }

  .rating-notification {
    border-radius: 5px;
    font-size: calc(1.1 * var(--default-font-size));
    padding: 1em;
    color: white;

    &.success {
      background-color: #9a009a;
    }
    &.error {
      background-color: #b30000;
    }
  }

  .comments-box {
    width: 75%;
  }

  .v-card-actions {
    display: var(--footer-visible);
  }

  .close-button {
    display: inline;
  }

  .rating-title {
    width: 100%;
    text-align: center;
  }

  .close-button {
    position: absolute !important;
    top: 5px;
    right: 5px;
  }

  .rating-title {
    padding: 5px 10px;
  }
}
</style>

