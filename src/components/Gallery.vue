<template>
  <div
    :class="['gallery-root', {'open': open}]"
  >
    <div
      class="just-holding-events"
      tabindex="0"
      role="button"
      @click="open = true"
      @keyup.enter="open = true"
    >
      <slot
        v-if="!open"
        name="closed"
        :places="places"
        :selected-place="selectedPlace"
        :selected-places="selectedPlaces"
      >
        <div
          class="default-activator blurred"
          role="button"
          tabindex="0"
          @click="open = true"
          @keyup.enter="open = true"
        >
          <span
            class="default-activator-title noselect"
          >
            {{ closedText }}
          </span>
          <img
            class="noselect"
            :src="places[previewIndex] ? (getImageset(places[previewIndex])?.get_thumbnailUrl() ?? '') : ''"
            :alt="places[previewIndex] ? places[previewIndex].get_name() : ''"
          >
        </div>
      </slot>
    </div>
    <div
      v-if="open"
      :style="cssVars"
      class="gallery blurred"
    >
      <div
        class="gallery-header"
      >
        <span class="gallery-title">{{ title }}</span>
        <font-awesome-icon
          class="gallery-close"
          icon="times"
          size="lg"
          tabindex="0"
          @click="open = false"
          @keyup.enter="open = false"
        />
      </div>
      <div
        class="gallery-content"
      >
        <div
          v-for="[index, place] of places.entries()"
          :key="index"
          tabindex="0"
          role="button"
          :class="['gallery-item', {'selected': highlightLastOnly ? selectedPlace === place : selectedPlaces.includes(place)}]"
          @click="selectPlace(place)"
          @keyup.enter="selectPlace(place)"
        >
          <slot
            name="preview"
            :place="place"
            :index="index"
            :imageset="getImageset(place)"
            :thumbnail-url="getImageset(place)?.get_thumbnailUrl() ?? ''"
            :selected="highlightLastOnly ? selectedPlace === place : selectedPlaces.includes(place)"
          >
            <img
              class="noselect"
              :src="getImageset(place)?.get_thumbnailUrl() ?? ''"
              :alt="place.get_name()"
            >
            <span class="place-name noselect">{{ place.get_name() }}</span>
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeMount, toRaw, type VNode } from "vue";
import { Folder, Imageset, Place } from "@wwtelescope/engine";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
library.add(faTimes);

import { filterInPlace } from "../utils";

import { GalleryProps } from "../types";

const props = withDefaults(defineProps<GalleryProps>(), {
  columns: "auto-fit",
  width: "300px",
  maxHeight: "500px",
  title: "Gallery",
  selectedColor: "dodgerblue",
  singleSelect: true,
  highlightLastOnly: false,
  previewIndex: 0,
  closedText: "Image Gallery",
});

const emit = defineEmits<{
  /** Fired whenever an image is selected. The event value is the WWT `Place` associated with the image */
  (event: "select", place: Place): void
  /** Fired whenever an image is deselected. The event value is the WWT `Place` associated with the image */
  (event: "deselect", place: Place): void
  /** Fired whenever an image is selected. The event value is a list of WWT `Place`s associated with all selected images */
  (event: "listAllSelected", places: Place[]): void
}>();

defineSlots<{
  /** A slot allowing customization of what is shown when the gallery is closed. This slot has access to the component's list of places and selected place(s).*/
  closed(props: {
    places: Place[],
    selectedPlace: Place | null,
    selectedPlaces: Place[],
  }): VNode[];
  /** A slot for what to display for a single gallery item */
  preview(props: {
    place: Place,
    index: number,
    imageset: Imageset | null,
    thumbnailUrl: string,
    selected: boolean,
  }): VNode[];
}>();

const open = ref(false);
const places = ref<Place[]>([]);
const selectedPlace = ref<Place | null>(null);
const selectedPlaces = ref<Place[]>([]);

const cssVars = computed(() => {
  return {
    "--column-count": props.columns,
    "--selected-color": props.selectedColor,
    "--gallery-width": props.width,
    "--gallery-max-height": props.maxHeight,
  };
});

onBeforeMount(() => {
  props.store.waitForReady().then(async () => {
    places.value = await placesFromWtml(props.wtmlUrl);
  });
});

function getImageset(place: Place): Imageset | null {
  return place.get_backgroundImageset() ?? place.get_studyImageset();
}

function extractPlaces(folder: Folder): Place[] {
  let places: Place[] = [];
  for (const child of folder.get_children() ?? []) {
    if (child instanceof Place) {
      const iset = getImageset(child);
      if (iset !== null) {
        places.push(child);
      }
    } else if (child instanceof Folder) {
      places = places.concat(extractPlaces(child));
    }
  }
  return places;
}

async function placesFromWtml(wtmlUrl: string): Promise<Place[]> {
  return props.store.loadImageCollection({
    url: wtmlUrl,
    loadChildFolders: true
  }).then((folder: Folder) => extractPlaces(folder));
}

function selectPlace(place: Place) {
  if (props.singleSelect) {
    // if we're already selected, deselect
    if (selectedPlace.value === place) {
      emit("deselect", place);
      selectedPlaces.value.splice(0);
      selectedPlace.value = null;
      return;
    } else {
      selectedPlaces.value.forEach(p => emit("deselect", p));
      selectedPlaces.value = [place];
      selectedPlace.value = place;
      return;
    }
  }

  // for multi-select
  // if we're already selected, deselect
  if (selectedPlaces.value.includes(place)) {
    emit("deselect", place);
    selectedPlace.value = null;
    selectedPlaces.value.splice(selectedPlaces.value.indexOf(place), 1);
  } else {
    selectedPlace.value = place;
    if (props.singleSelect) {
      filterInPlace(selectedPlaces.value, (p) => p === place); 
    } else {
      selectedPlaces.value.push(place);
    }
  }

}

watch(selectedPlace, (place) => {
  if (place === null) { return; }
  emit("select", toRaw(place));
  if (props.singleSelect) {
    emit("listAllSelected", toRaw(selectedPlaces.value));
  }
});
</script>

<style scoped lang="less">
.gallery-root {
  transition-property: height, width;
  transition: 0.5s ease-out;

  .blurred {
    background: transparent;
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(6px);
  }

  .gallery {
    border-radius: 5px;
    border: 1px solid white;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    max-height: var(--gallery-max-height);
    width: 100vw;
    max-width: var(--gallery-width);
  }

  .noselect {
    user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
  }

  .gallery-header {
    position: relative;
    display: flex;
    justify-content: center;
  }

  .gallery-title {
    font-size: 16pt;
  }

  .gallery-close {
    position: absolute;
    right: 3px;
    cursor: pointer;
  }

  .gallery-content {
    display: grid;
    grid-template-columns: repeat(var(--column-count), minmax(100px, 1fr));
    column-gap: 10px;
    row-gap: 5px;
    padding: 5px
  }

  .default-activator {
    border-radius: 3px;
    border: solid 1px white;
    position: relative;
    height: fit-content;
    width: fit-content;
    display: flex;
    flex-direction: column;
    cursor: pointer;

    img {
      padding: 5px;
      border-radius: 3px;
    }
  }

  .default-activator-title {
    margin: auto;
  }

  .gallery-item {
    border-radius: 3px;
    border: 1px solid white;
    display: flex;
    flex-direction: column;
    cursor: pointer;

    img {
      margin-left: auto;
      margin-right: auto;
      border-radius: 3px;
      width: 96px;
      height: 45px;
      object-fit: cover;
    }

    span {
      flex-grow: 1;
      display: inline-grid;
      align-items: center;
      text-align: center;
    }
  }

  .selected {
    border: 1px solid var(--selected-color);

    span {
      color: var(--selected-color);
    }
  }

  .place-name {
    font-size: 10pt;
  }

}
</style>
