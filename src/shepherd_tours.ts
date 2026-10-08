import { watch, type Ref } from "vue";
import type { Step, StepOptions, StepOptionsButton, Tour, TourOptions } from "shepherd.js";
import { useShepherd } from "vue-shepherd";

import "shepherd.js/dist/css/shepherd.css";

interface TourInfo {
  maxStepReached?: number;
  gatedSteps?: Set<number>;
}

const GLOBAL_TOUR_INFO: Record<string, TourInfo> = {};

export interface CosmicDSDirectionalButtonOptions {
  classes?: string;
  text?: string;
  disabled?: boolean | (() => boolean);
}

export type CosmicDSStepOptions = StepOptions & {
  allowNext?: Ref<boolean>;
};

export type CosmicDSTourProgressOption = "dots" | "bar" | "none";
export type CosmicDSTourOptions = TourOptions & {
  progress?: CosmicDSTourProgressOption;
};

export function createBackButton(options?: CosmicDSDirectionalButtonOptions): StepOptionsButton {
  return {
    action() { return this.back(); },
    classes: options?.classes ?? "shepherd-button-back",
    text: options?.text ?? "Back",
    disabled: options?.disabled ?? false,
  };
}

export function createNextButton(options?: CosmicDSDirectionalButtonOptions): StepOptionsButton {
  return {
    action() { return this.next(); },
    classes: options?.classes ?? "shepherd-button-next",
    text: options?.text ?? "Next",
    disabled: options?.disabled ?? false,
  };
}

export function addProgressDots(step: Step) {
  const stepElement = step.getElement();
  const tour: Tour = step.tour;
  if (!stepElement) {
    return;
  }
  const footer = stepElement.querySelector(".shepherd-footer");
  if (!footer) {
    return;
  }
  const dotsContainer = document.createElement("div");
  dotsContainer.classList.add("shepherd-progress-dots");
  const currentIndex = tour.steps.indexOf(step);

  const maxStepReached = getMaxStepReached(tour);
  const hasAnyGated = getGatedSteps(tour).size > 0;
  tour.steps.forEach((_step, index) => {
    const dot = document.createElement("div");
    dot.classList.add("shepherd-progress-dot");
    if (index === currentIndex) {
      dot.classList.add("active");
    }
    dot.setAttribute("role", "button");
    dot.setAttribute("tabindex", "0");
    dot.setAttribute("aria-label", `Go to step ${index + 1}`);
    if (hasAnyGated && index > maxStepReached) {
      dot.classList.add("disabled");
    } else {
      const goToStep = () => tour.show(index);
      dot.addEventListener("click", goToStep);
      dot.addEventListener("keyup", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          goToStep();
        }
      });
    }
    dotsContainer.appendChild(dot);
  });
  footer.appendChild(dotsContainer);
}

export function addProgressBar(step: Step) {
  const stepElement = step.getElement();
  const tour = step.tour;
  if (!stepElement) {
    return;
  }
  const content = stepElement.querySelector(".shepherd-content");
  const footer = stepElement.querySelector(".shepherd-footer");
  const progressContainer = document.createElement("div");
  progressContainer.classList.add("shepherd-progress-container");
  const progress = document.createElement("div");
  progress.classList.add("shepherd-progress-bar");
  const index = tour.steps.indexOf(step);
  progress.setAttribute("aria-label", `On step ${index + 1} of ${tour.steps.length}`);
  const percent = 100 * (index + 1) / tour.steps.length;
  progress.style.width = `${percent}%`;
  progressContainer.appendChild(progress);
  if (footer) {
    content?.insertBefore(progressContainer, footer);
  }
}

export function useMdiCloseIcon(step: Step) {
  const stepElement = step.getElement();
  const cancelIcon = stepElement?.querySelector(".shepherd-cancel-icon");
  if (!cancelIcon) {
    return;
  }
  cancelIcon.replaceChildren();
  const icon = document.createElement("span");
  icon.classList.add("mdi", "mdi-close");
  icon.setAttribute("aria-hidden", "true");
  cancelIcon.appendChild(icon);
}

export function addImage(step: Step, src: URL) {
  const stepElement = step.getElement();
  const textContainer = stepElement?.querySelector(".shepherd-text");
  if (!(stepElement && textContainer)) {
    return;
  }
  const img = document.createElement("img");
  const width = stepElement.getBoundingClientRect().width;
  img.src = src.href;
  img.style.width = `${width - 20}px`;
  img.style.display = "block";
  img.style.marginTop = "12px";
  img.style.marginLeft = "auto";
  img.style.marginRight = "auto";
  img.style.marginBottom = "10px";
  img.style.border = "1px solid rgba(255, 255, 255, 0.35)";
  img.style.borderRadius = "4px";
  textContainer.appendChild(img);
}

function getGatedSteps(tour: Tour): Set<number> {
  const id = tour.id;
  if (id === undefined) { throw new Error("Tour is missing an ID field!"); }
  const info = GLOBAL_TOUR_INFO[id];
  if (info == undefined) {
    const gatedSteps = new Set<number>();
    GLOBAL_TOUR_INFO[id] = { gatedSteps };
    return gatedSteps;
  } else {
    if (info.gatedSteps == undefined) {
      info.gatedSteps = new Set<number>();
    }
    return info.gatedSteps;
  }
}

function setStepGated(tour: Tour, stepIndex: number, gated: boolean) {
  if (tour.id === undefined) { throw new Error("Tour is missing an ID field!"); }
  const steps = getGatedSteps(tour);
  if (gated) {
    steps.add(stepIndex);
  } else {
    steps.delete(stepIndex);
  }
}

function setDisabled(element: HTMLElement, disabled: boolean) {
  if (disabled) {
    element.setAttribute("disabled", "");
  } else {
    element.removeAttribute("disabled");
  }
}

function setNextEnabled(step: Step, enabled: boolean) {
  const element = step?.getElement();
  if (!(step && element)) { return; }

  const nextButton = element.querySelector(".shepherd-button-next") as HTMLElement;
  if (nextButton) {
    setDisabled(nextButton, !enabled);
  }
}

function getMaxStepReached(tour: Tour): number {
  const id = tour.id;
  if (id === undefined) { throw new Error("Tour is missing an ID field!"); }
  return GLOBAL_TOUR_INFO[id]?.maxStepReached ?? 0;
}

function setMaxStepReached(tour: Tour, maxStep: number) {
  const id = tour.id;
  if (id === undefined) { throw new Error("Tour is missing an ID field!"); }
  const info = GLOBAL_TOUR_INFO[id];
  if (info == undefined) {
    GLOBAL_TOUR_INFO[id] = { maxStepReached: maxStep };
  } else {
    info.maxStepReached = maxStep;
  }
}

function onAllowNextChange(tour: Tour, allow: boolean) {
  if (tour.currentStep) {
    setNextEnabled(tour.currentStep, allow);
  }
}

export function addStep(tour: Tour, options: CosmicDSStepOptions) {
  const allowNext = options.allowNext;
  if (allowNext != null) {
    watch(allowNext, (allow: boolean) => onAllowNextChange(tour, allow));

    if (!allowNext.value) {
      setStepGated(tour, tour.steps.length, true);  // The new step will be added at the end
    }

    const buttons = options.buttons;
    if (buttons) {
      const nextButton = buttons.find(button => button.classes?.includes("shepherd-button-next"));
      if (nextButton) {
        nextButton.disabled = !allowNext.value;
      }
    } else {
      options.buttons = [createBackButton(), createNextButton({ disabled: () => !allowNext.value })];
    }
  }

  tour.addStep(options);
}

export function createTour(options?: CosmicDSTourOptions) {

  const progress = options?.progress ?? "dots";
  const progressFunction = (function (progress: CosmicDSTourProgressOption) {
    switch (progress) {
    case "dots":
      return addProgressDots;
    case "bar":
      return addProgressBar;
    case "none":
      return null;
    }
  })(progress);

  const defaultOptions = {
    useModalOverlay: true,
    defaultStepOptions: {
      buttons: [createBackButton(), createNextButton()],
      cancelIcon: {
        enabled: true,
      },
      when: {
        show() {
          if (progressFunction) {
            progressFunction(this as Step);
          }
          useMdiCloseIcon(this as Step);
        },
      }
    },
  };

  const tour: Tour = useShepherd({
    ...defaultOptions,
    ...(options ?? {}),
  });

  tour.on("show", (event: { step: Step }) => {
    const newStep = event.step;
    if (!newStep) { return; }
    const newIndex = tour.steps.indexOf(newStep);
    setMaxStepReached(tour, Math.max(newIndex, getMaxStepReached(tour)));
  });

  return tour;
}
