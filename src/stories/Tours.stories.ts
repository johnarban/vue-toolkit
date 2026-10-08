/* eslint-disable @typescript-eslint/naming-convention */

import { ref } from "vue";
import { Meta, StoryObj } from "@storybook/vue3-vite";
import { addStep, createNextButton, createTour } from "../shepherd_tours";

import "./stories.css";
import "./tours.css";
import "../styles/tours.less";

const meta: Meta = {
  tags: ["autodocs"],
  title: "Vue Toolkit/Utilities/Tours",
};

export default meta;
type Story = StoryObj;

export const Primary: Story = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render: (args: any) => {
    
    document.documentElement.style.setProperty("--cosmicds-shepherd-background-color", "rgb(34, 36, 37)");
    document.documentElement.style.setProperty("--cosmicds-shepherd-accent-color", "crimson");

    const tour = ref(createTour({
      // Skip the modal overlay in the story
      // Storybook puts the story content into an iframe
      // and Shepherd doesn't really know how to handle that
      useModalOverlay: false,
    }));
    const flag = ref(false);

    addStep(tour.value, {
      title: "Step 1",
      attachTo: { element: () => document.getElementById("i1"), on: "top" },
      text: "Here's the first item!",
      buttons: [createNextButton()],
    });

    addStep(tour.value, {
      title: "Step 2",
      attachTo: { element: () => document.getElementById("i2"), on: "left" },
      text: "Here's the second item!",
    });

    addStep(tour.value, {
      title: "Step 3",
      attachTo: { element: () => document.getElementById("i3"), on: "bottom" },
      text: "We created a new item for this step!",
      beforeShowPromise: function() {
        return new Promise<void>(resolve => {
          let i3 = document.getElementById("i3");
          if (!i3) {
            i3 = document.createElement("li");
            i3.id = "i3";
            i3.style.width = "fit-content";
            i3.innerHTML = "Item 3";
            const container = document.getElementById("items");
            container?.appendChild(i3);
          }
          resolve();
        });
      },
    });

    addStep(tour.value, {
      title: "Step 4",
      attachTo: { element: () => document.getElementById("tour-button"), on: "bottom" },
      text: "You need to click the button to advance!",
      allowNext: flag,
      beforeShowPromise: function() {
        return new Promise<void>(resolve => {
          let button = document.getElementById("tour-button");
          if (!button) {
            button = document.createElement("button");
            button.id = "tour-button";
            button.style.width = "fit-content";
            button.style.backgroundColor = "crimson";
            button.style.margin = "5px";
            button.innerHTML = "Click the button!";
            button.onclick = () => { flag.value = true; };
            const container = document.getElementById("root");
            container?.appendChild(button);
          }
          resolve();
        });
      },

    });

    return {
      template: `
        <div id="root">
          <div>
            <button @click="tour.start()">Start the tour!</button>
          </div>
          <ul id="items">
            <li id="i1" style="width: fit-content">Item 1</li>
            <li id="i2" style="width: fit-content">Item 2</li>
          </ul>
        </div>
      `,
      setup() {
        return { args, tour };
      },
    };
  },
  args: {
  },
};
