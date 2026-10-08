import { computed, Ref, ref, watch } from "vue";
import { clamp } from "..";

type TourStepSetupFunction = (step: number, oldStep?: number) => Promise<void>;

export interface BaseTourStepContent {
  id: string;
  title: string;
  text: string[];
  instaText?: string;
  setup?: TourStepSetupFunction;
  awaitSetup?: boolean;
}

export interface UseTourOptions<T extends BaseTourStepContent> {
  steps: T[];
  initialStep?: number;
}

export interface Tour<T extends BaseTourStepContent> {
  stepID: Ref<string>;
  stepIndex: Ref<number>;
  steps: T[];
  length: number;
  stepContent: Ref<T>;
  goToStep: (step: number) => Promise<void>;
  next: () => Promise<void>;
  previous: () => Promise<void>;
};

export function useTour<T extends BaseTourStepContent>(options: UseTourOptions<T>): Tour<T> {
  const steps = options.steps;
  const stepNumber = clamp(options.initialStep ?? 0, 0, steps.length - 1);
  const stepIndex = ref(stepNumber);
  const stepContent = computed(() => steps[stepIndex.value]);
  const length = steps.length;

  const stepID = computed({
    get(): string {
      return steps[stepIndex.value].id;
    },
    set(id: string) {
      const index = steps.findIndex(s => s.id === id);
      if (index > -1) {
        stepIndex.value = index;
      } else {
        console.warn(`No step found with ID ${id}`);
      }
    }
  });

  async function goToStep(newStep: number | string, force=false) {
    if (typeof newStep === "number") {
      return updateStep(newStep, stepIndex.value, force);
    } else {
      const index = steps.findIndex(s => s.id === newStep);
      if (index > -1) {
        return updateStep(index, stepIndex.value, force);
      }
      console.warn(`No step found with ID ${newStep}`);
    }
  }

  async function updateStep(newStep: number, oldStep?: number, force=false) {
    const clampedNew = clamp(newStep, 0, steps.length - 1);
    if (clampedNew === oldStep  && !force) {
      return;
    }

    const newStepContent = steps[clampedNew];
    const setup = newStepContent.setup;
    if (setup) {
      if (newStepContent.awaitSetup ?? true) {
        await setup(clampedNew, oldStep);
      } else {
        setup(clampedNew, oldStep);
      }
    }
    stepIndex.value = newStep;
  }

  updateStep(stepIndex.value, stepIndex.value, true);

  watch(stepIndex, (newStep: number, oldStep: number) => {
    updateStep(newStep, oldStep, false);
  });

  async function next() {
    stepIndex.value += 1;
  }

  async function previous() {
    stepIndex.value -= 1;
  }

  return {
    steps,
    stepIndex,
    stepID,
    length,
    stepContent,
    goToStep,
    previous,
    next,
  };

}
