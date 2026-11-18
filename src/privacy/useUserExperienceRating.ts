import { ref, toValue, watch, type Ref, MaybeRef } from "vue";
import { 
  API_BASE_URL, 
  type UserExperienceRating, 
  type UserExperienceSubmissionInfo, 
  submitUserExperienceRating 
} from "../utils";


export interface UseUserExperienceRatingOptions {
  responseOptOut?: Ref<boolean | null>;
  timeout?: number;
  questions?: string[];
  debug?: boolean;
  /** defaults to the story prefix */
  storagePrefix?: string;
  mixin?: boolean;
  apiKey: string;
}

export function useUserExperienceRating(storyPrefix: string, uuid: MaybeRef<string>, options: UseUserExperienceRatingOptions) {

  const responseOptOut = options?.responseOptOut ?? ref(null);

  const storagePrefix = options?.storagePrefix ?? storyPrefix;
  const ratingOptOutKey = `${storagePrefix}-rating-optout` as const;
  const storyRatingUrl = (options?.mixin === false) 
    ? `${API_BASE_URL}/stories/user-experience/${storyPrefix}` 
    : `${API_BASE_URL}/${storyPrefix}/user-experience`;

  const storedRatingOptOut = window.localStorage.getItem(ratingOptOutKey);
  const parsedRatingOptOut = typeof storedRatingOptOut === "string" ? storedRatingOptOut === "true" : null;
  const ratingOptOut = ref<boolean | null>(responseOptOut.value || parsedRatingOptOut);


  const showRating = ref(false);
  const showRatingPrivacyPolicy = ref(false);

  function debugLog(...args: unknown[]) {
    if (options?.debug) {
      console.debug("[useUserExperienceRating]", ...args);
    }
  }

  function randomQuestion() {
    const questions = options?.questions ?? [
      "Does this spark your curiosity?",
      "Are you learning something new?",
    ];
    const randIndex = Math.floor(Math.random() * questions.length);
    return questions[randIndex];
  }

  const question = ref(randomQuestion());

  const ratingTimeout = ref<ReturnType<typeof setTimeout> | null>(null);

  function clearRatingTimeout() {
    if (ratingTimeout.value !== null) {
      clearTimeout(ratingTimeout.value);
      ratingTimeout.value = null;
    }
  }

  async function checkForExistingRating() {
    const response = await fetch(`${storyRatingUrl}/${toValue(uuid)}`, {
      method: "GET",
      headers: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Authorization: options.apiKey,
      },
    });

    const content = await response.json();
    return response.status === 200 && (content.ratings?.length > 0);
  }

  async function initializePrompt() {
    if (ratingOptOut.value) {
      return;
    }

    let gaveRating = false;
    try {
      gaveRating = await checkForExistingRating();
    } catch (error) {
      console.error("Error checking if user has given a rating:", error);
    }

    if (!gaveRating) {
      clearRatingTimeout();
      ratingTimeout.value = setTimeout(() => {
        showRating.value = true;
      }, options?.timeout ?? 90_000); // default to 90 seconds
    }
  }

  function dismiss() {
    showRating.value = false;
    clearRatingTimeout();
  }

  function optOut() {
    ratingOptOut.value = true;
    dismiss();
  }


  /** sends the rating/comments without closing the prompt, so a rating given before any comments are typed doesn't get lost */
  async function updateUserExperienceInfo(rating: UserExperienceRating | null, comments: string | null) {
    const info: UserExperienceSubmissionInfo = {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      story_name: storyPrefix,
      uuid: toValue(uuid),
      question: question.value,
    };
    if (rating) {
      info.rating = rating;
    }
    if (comments) {
      info.comments = comments;
    }
    debugLog("Submitting user experience rating with info:", info);
    return submitUserExperienceRating(info, import.meta.env.VITE_CDS_API_KEY ?? "", storyRatingUrl)
      .then((response) => {
        if (!response || !response.ok) {
          throw new Error(`Failed to submit rating: ${response?.statusText ?? "No response"}`);
        }
        debugLog("Successfully submitted user experience rating", response);
      })
      .catch((error) => {
        console.error("Error submitting user experience rating:", error);
      });
  }

  if (responseOptOut) {
    watch(responseOptOut, (optOutValue) => {
      if (optOutValue) {
        showRating.value = false;
        clearRatingTimeout();
      }
    });
  }

  watch(ratingOptOut, (optingOut) => {
    if (optingOut === null) return;
    window.localStorage.setItem(ratingOptOutKey, String(optingOut));
    if (optingOut) {
      clearRatingTimeout();
    }
  });

  return {
    ratingOptOut,
    showRating,
    showRatingPrivacyPolicy,
    question,
    initializePrompt,
    dismiss,
    optOut,
    updateUserExperienceInfo,
  };
}
