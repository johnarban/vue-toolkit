<template>
  <nav
    v-if="items !== null"
    class="fv-root"
    :style="cssVars"
    aria-role="navigation"
    aria-label="Folder View"
  >
    <div
      class="fv-header-container"
    >
      <slot
        name="header"
        :expanded="expanded"
        :toggle-expanded="toggleExpanded"
      />
    </div>
    <div
      v-show="expanded"
      class="fv-content"
    >
      <div
        v-for="(item, index) of items"
        :key="index"
        class="fv-item"
      >
        <slot
          name="item"
          :item="item"
          :last-selected-item="lastSelectedItem"
          :select-item="selectItem"
        >
          <div
            :key="item.get_name()"
            :class="['fv-item-content', lastSelectedItem === item ? 'selected' : '']"
            :title="item.get_name()"
            tabindex="0"
            role="button"
            :aria-label="item.get_name()"
            :aria-selected="lastSelectedItem === item"
            @click="() => selectItem(item, 'click')"
            @dblclick="() => selectItem(item, 'dblclick')"
            @keydown.enter="() => selectItem(item, 'keyup')"
          >
            <img
              :src="item.get_thumbnailUrl() ?? defaultThumbnail"
              :alt="item.get_name()"
            >
            <label class="fv-item-name">
              {{ item.get_name() }}
            </label>
            <FontAwesomeIcon
              v-if="item instanceof Folder"
              icon="folder-open"
              class="fv-folder-icon"
            />
          </div>
        </slot>
      </div>
    </div>
    <div
      v-if="loading"
      class="fv-loading"
    >
      <v-progress-circular indeterminate />
      <span>Loading folder contents. Please wait...</span>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch, type Ref } from "vue";
import { VProgressCircular } from "vuetify/components";
import { Folder, FolderUp } from "@wwtelescope/engine";
import { Thumbnail } from "@wwtelescope/engine-types";
import { FolderViewProps, ItemSelectionType } from "../types";
import { engineStore } from "@wwtelescope/engine-pinia";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faFolderOpen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

library.add(faFolderOpen);

const items: Ref<Thumbnail[] | null> = ref<Thumbnail[]>([]);
const lastSelectedItem: Ref<Thumbnail | null> = ref(null);


const props = withDefaults(defineProps<FolderViewProps>(), {
  gap: "5px",
  highlightColor: "#1671e0",
  thumbnailColor: "white",
  backgroundColor: "black",
  textColor: "white",
  orientation: "column",
  startExpanded: true,
  selectFirst: true,
  lazy: true,
  defaultThumbnail: "https://web.wwtassets.org/engine/assets/thumb_star.jpg",
});

if (!(props.rootFolder || props.rootUrl)) {
  throw new Error("Either one of rootFolder or rootUrl must be specified!");
}

const store = engineStore();
const folder = ref<Folder | null>(null);
let currentFolder: Folder | null = null;
const loading = ref(false);

if (props.rootFolder != null) {
  folder.value = props.rootFolder; 
} else if (props.rootUrl != null) {
  const url = props.rootUrl;
  store.waitForReady().then(() => {
    loading.value = true;
    store.loadImageCollection({ url, loadChildFolders: !props.lazy })
      .then(loadedFolder => {
        folder.value = loadedFolder;
        loading.value = false;
      });
  });
}

const emit = defineEmits<{
  (event: "select", data: { item: Thumbnail, type: ItemSelectionType }): void;
}>();

const expanded = ref(props.startExpanded);
function toggleExpanded() {
  expanded.value = !expanded.value;
}

function updateFolder(folder: Folder) {
  const children = folder.get_children() ?? [];
  items.value = props.filter ? children.filter(props.filter) : children;
  currentFolder = folder;
  const firstItem = items.value.find((item) => (!(item instanceof Folder) || (item instanceof FolderUp)));
  if (props.selectFirst && firstItem) {
    selectItem(firstItem, "folder");
  }
}

function folderItems(folder: Folder, includeUp=true): Thumbnail[] {
  const items = [] as Thumbnail[];
  if (includeUp) {
    const up = new FolderUp();
    if (currentFolder) {
      up.parent = currentFolder;
    }
    items.push(up);
  }
  const children = (folder.get_children() ?? []).filter((item) => (!(item instanceof FolderUp)));
  return items.concat(children);
}

function selectItem(item: Thumbnail, type: ItemSelectionType) {
  lastSelectedItem.value = item;
  if (item instanceof Folder) {
    if (props.lazy) {
      loading.value = true;
      store.loadImageCollection({
        url: item.get_url(),
        loadChildFolders: !props.lazy,
      }).then(loadedFolder => {
        items.value = folderItems(loadedFolder);
        currentFolder = loadedFolder;
        loading.value = false;
      });
    } else {
      items.value = folderItems(item);
      currentFolder = item;
    }
  } else if (item instanceof FolderUp) {
    currentFolder = item.parent;
    items.value = folderItems(item.parent, item.parent != folder.value);
  }

  emit("select", { item, type });
}

onMounted(() => {
  if (folder.value) {
    updateFolder(folder.value);
  }
});

watch(() => props.rootFolder, (propFolder: Folder | undefined) => {
  if (propFolder != undefined) {
    folder.value = propFolder;
  }
});

watch(() => props.rootUrl, async (url: string | undefined) => {
  if (url != undefined) {
    folder.value = await store.loadImageCollection({ url, loadChildFolders: false });
  }
});

watch(folder, (newFolder: Folder | null) => {
  if (newFolder != null) {
    updateFolder(newFolder);
  }
});

const cssVars = computed(() => ({
  "--flex-direction": props.orientation,
  "--background-color": props.backgroundColor,
  "--thumbnail-color": props.thumbnailColor,
  "--highlight-color": props.highlightColor,
  "--text-color": props.textColor,
  "--gap": props.gap,
}));
</script>

<style scoped lang="less">
.fv-root {
  width: auto;
	height: 100%;
  overflow-x: auto;
  overflow-y: auto;
  background: var(--background-color);
  padding: 5px;

	&::-webkit-scrollbar {
    padding: 1px;
    height: 3px;
		width: 10px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.07);
  }

  &::-webkit-scrollbar-thumb {
    background: var(--highlight-color);
    border-radius: 10px;
  }	
}

.fv-header-container {
  pointer-events: auto;
  user-select: none;
  -ms-user-select: none;
  -moz-user-select: none;
  -khtml-user-select: none;
  -webkit-user-select: none;
}

.fv-content {
  margin: auto;
  display: flex;
  flex-direction: var(--flex-direction);
  align-items: center;
  justify-content: space-around;
  gap: var(--gap);

  &::after {
    content: "";
    height: 0px;
  }
}

.fv-item {
  height: 100%;
  flex-grow: 1;
}

.fv-item-content {
  position: relative;
  padding: 1px;
  margin: 2px;
  border: 2px solid #444;
  background: var(--thumbnail-color);
  border-radius: 2px;
  width: ~"min(115px, 22vw)";
  height: 100%;
  color: var(--text-color);
  cursor: pointer;
  pointer-events: auto;
  font-size: 10pt;

  & img {
    width: 100%;
    height: ~"min(45px, 10.3vw)";
    object-fit: cover;
    border-radius: 2px;
  }
	
	&:hover {
		border: 2px solid var(--highlight-color);
		transition: all 200ms ease-out;
  }

  &.selected {
    border: 2px solid var(--highlight-color);
  }
}

.fv-item-name {
  color: var(--text-color);
  max-width: 100%;
  padding-left: 2px;
  display: inline-block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.fv-folder-icon {
  position: absolute;
  top: 1px;
  right: 1px;
}

.fv-loading {
  position: absolute;
  top: 5px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--background-color);
  color: var(--text-color);
  border: 1px solid var(--text-color);
  border-radius: 5px;
  padding: 5px;
}
</style>
