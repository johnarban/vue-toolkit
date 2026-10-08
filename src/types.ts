import type { ExtractPublicPropTypes } from "vue";
import type { FontAwesomeIconProps } from "@fortawesome/vue-fontawesome";
import type { CircleMarkerOptions, TileLayerOptions } from "leaflet";
import type { Folder } from "@wwtelescope/engine";
import type { Thumbnail } from "@wwtelescope/engine-types";
import { engineStore } from "@wwtelescope/engine-pinia";
import { MapBoxFeatureCollection } from "./mapbox";
import type { BaseTourStepContent, Tour } from "./composables/tour";
import { VIcon, VTooltip } from "vuetify/components";

/** The type of the WWT engine Pinia store */
export type WWTEngineStore = ReturnType<typeof engineStore>;


/* Funding acknowledgement */

/** Interface describing props for the funding acknowledgement component */
export interface FundingAcknowledgementProps {
  /** The color of the acknowledgement text */
  color?: string;

  /** The background color of the acknowledgement */
  backgroundColor?: string;
}

/* Credit logos */

/** Interface describing a logo */
export interface CreditLogo {
  /** The URL for the logo image */
  src: string;
  /** The URL to open when the logo is clicked */
  href: string;
  /** Alt text to use for the logo. If none is given, the logo will have no alt text */
  alt?: string;
  /** A name to use for the logo. If provided, the logo is given a class of `logo-${name}` to allow CSS targeting */
  name?: string;
}

/** A union type enumerating the default credit logos */
export type DefaultCreditLogo = "cosmicds" | "wwt" | "sciact" | "nasa";

/** Interface describing props for the credit logos component */
export interface CreditLogosProps {
  /** What size to use for the logos. Should be a valid CSS size. */
  logoSize?: string;
  /** Any extra logos that we want to use */
  extraLogos?: CreditLogo[];
  /** Which default logos to use. If not specified, use them all */
  defaultLogos: DefaultCreditLogo[];
}

/* Gallery */

/** Interface describing props for the gallery component */
export interface GalleryProps {
  /** The URL of a WTML file describing the desired gallery contents. Required */
  wtmlUrl: string;
  /** The number of columns of the gallery.
    * Accepts a number or a valid CSS value to be used in `repeat` for `grid-template-columns`
    * Defaults to 'auto-fit'
    */
  columns?: number | string;
  /** The width of the gallery. Should be a valid CSS value for `width`. Defaults to 300px */
  width?: string;
  /** Maximum height of the gallery. Should be a valid CSS value for `max-height`. Defaults to 500px */
  maxHeight?: string;
  /** The title of the gallery. Default is 'Gallery' */
  title?: string;
  /** The accent color to use for selected images in the gallery. Should be a valid CSS color. Default is 'dodgerblue' */
  selectedColor?: string;
  /** Whether a user can select only one image at a time. Default true */
  singleSelect?: boolean;
  /** Whether only the last selected image is highlighted. Default false */ 
  highlightLastOnly?: boolean;
  /** The index of the preview image in the WTML file. Defaults to 0. */
  previewIndex?: number;
  /** The text to show when the gallery is closed. Default is 'Image Gallery' */
  closedText?: string;
  /** The WWT engine store to use for the HUD. Required */
  store: WWTEngineStore;
}

/* Geolocation button */

/** A union type consisting of the density options for the geolocation button */
export type GeolocationButtonDensity = null | "default" | "comfortable" | "compact";

/** Interface describing props for the geolocation button */
export interface GeolocationButtonProps {
  /** The color of the geolocation button. Defaults to "white" */
  color?: string;
  /** The size of the button */
  size?: string;
  /** The density of the button. This adjusts the vertical height of the button. Defaults to "comfortable" */
  density?: GeolocationButtonDensity;
  /** The elevation of the button. Defaults to "2" */
  elevation?: string;
  /** Whether to hide the button. Defaults to false */
  hideButton?: boolean;
  /** Whether to show the button's text label. Defaults to false */
  showTextLabel?: boolean;
  /** Whether to show the button's geolocation coordinates. Defaults to false */ 
  showCoords?: boolean;
  /** Whether to show text indicating when location fetching is in progress. Defaults to false */
  showTextProgress?: boolean;
  /** Whether to show circle indicator when fetching is in progress. Defaults to true */
  showProgressCircle?: boolean;
  /** Whether to include text on the button. Defaults to false */
  useTextButton?: boolean;
  /** The size of the in-progress circle. Defaults to 12 */
  progressCircleSize?: number;
  /** The button's label. Defaults to "My Location" */
  label?: string;
  /** The ID to use to create the button ID */
  id?: string;
  /** The icon to use when the geolocation has been obtained */
  trueIcon?: string;
  /** The icon to use when there is no value for the geolocation */
  falseIcon?: string;
  /** Whether to show the location and permission status. Useful for debugging, defaults to false */
  showPermissions?: boolean;
}

/* Icon button */

/** A type describing the size options for a FontAwesome icon */
export type FontAwesomeIconSize = FontAwesomeIconProps["size"];
/** A type describing the size options for a Vuetify v-icon */
export type VIconSize = ExtractPublicPropTypes<VIcon>["size"];

/** An interface describing props for the icon button */
export interface IconButtonProps {
  /** Whether or not the icon button is active. Only makes sense in cases where one wants the button to have an on/off state */
  modelValue?: boolean;
  /** The name of the FontAwesome or MDI icon to use. MDI icons should be specified with their `mdi-` prefix */
  icon: string;
  /** ARIA label for the button. Can also be passed as a plain `aria-label` attribute instead. */
  ariaLabel?: string;
  /** The primary color of the button. Sets the icon and border colors. Default is white */
  color?: string;
  /** The color of the button when focused. Default is white */
  focusColor?: string;
  /** The color of the button when active. Default is white */
  activeColor?: string;
  /** The background color of the button. Default is #040404 */
  backgroundColor?: string;
  /** The color for the disabled button */
  disabledColor?: string;
  /** Whether the button has a border. Default is true */
  border?: boolean;
  /** The time duration, in ms, to recognize a press event as a long press. Default is 500 */
  longPressTimeMs?: number;
  /** The tooltip text for the button. If not specified, tooltip will not be shown */
  tooltipText?: string;
  /** The location of the tooltip. Default is start */
  tooltipLocation?: ExtractPublicPropTypes<typeof VTooltip>["location"];
  /** Whether to show the tooltip when the button is clicked. Default is false */
  tooltipOnClick?: boolean;
  /** Whether to show the tooltip when the button is focused. Default is false */
  tooltipOnFocus?: boolean;
  /** Whether to show the tooltip when the button is hovered. Default is true */
  tooltipOnHover?: boolean;
  /** The distance away from the button that the tooltip appears. Default is 0 */
  tooltipOffset?: string | number;
  /** Whether to show the tooltip when appropriate. Default is true */
  showTooltip?: boolean;
  /** The size of the icon */
  size?: FontAwesomeIconSize | VIconSize;
  /** Disable the button and prevent actions from running: Default is false */
  disabled?: boolean;
  /** The element to focus when icon value is true */
  focusElement?: string;
  /** When used in a Vuetify activator slot, bind the props here instead of on v-bind */
  activatorProps?: Record<string, unknown>;
}


/* Location selector */

/** An interface describing a latitude/longitude location */
export interface LocationDeg {
  /** The longitude of the location, in degrees */
  longitudeDeg: number;
  /** The latitude of the location, in degrees */
  latitudeDeg: number;
}

/** An interface describing options for the Leaflet map in the location selector */
export interface LeafletMapOptions extends TileLayerOptions {
  /** The template URL to use for the base map layer */
  templateUrl: string;
  /** The initial location to center the map on */
  initialLocation?: LocationDeg;
  /** The initial zoom level of the map */
  initialZoom?: number;
}

/** An interface describing a GeoJSON item, to be used as a prop for the location selector */
export interface GeoJSONProp {
  /** The URL of a remote GeoJSON resource. This and `geojson` and not intended to be used together */
  url?: string;
  /** A GeoJSON object to add to the location selector */
  geojson?: GeoJSON.FeatureCollection | GeoJSON.Feature | GeoJSON.GeometryCollection;
  /** The style options for any circle markers related to this item. Required */
  style: CircleMarkerOptions;
}

/** Interface describing a place on the location selector */
export interface PlaceDeg extends LocationDeg { 
  /** The color to use for the circle showing the place */
  color?: string;
  /** The fill color to use for the circle showing the place */
  fillColor?: string;
  /** The fill opacity to use for the circle showing the place */
  fillOpacity?: number;
  /** The radius to use for the circle showing the place */
  radius?: number;
  /** The name of the place */
  name?: string;
}

/** Interface describing props for the location selector */
export interface LocationSelectorProps {
  /** The color to use for the activator button */
  activatorColor?: string;
  /** Whether to attempt to detect the user's location when the component is mounted. Default is true */
  detectLocation?: boolean;
  /** The currently selected location. Default is the coordinates for Harvard College Observatory */
  modelValue?: LocationDeg;
  /** Map options for the Leaflet map. If not specified, sensible defaults are used */
  mapOptions?: LeafletMapOptions;
  /** The initial place to be selected on the map */
  initialPlace?: PlaceDeg;
  /** The list of places to show on the map */
  places?: PlaceDeg[];
  /** Options for place circles */
  placeCircleOptions?: CircleMarkerOptions;
  /** Whether places can be selected on the map. Default is true */
  placeSelectable?: boolean;
  /** Whether a location can be selected on the map. Default is true */
  selectable?: boolean;
  /** Options for the circle showing the selected place */
  selectedCircleOptions?: CircleMarkerOptions;
  /** Which event to use to select a location. Default is "click" */
  selectionEvent?: "click" | "dblclick";
  /** Whether to use world radii for circle sizes (as opposed to screen radii). Default is true */
  worldRadii?: boolean;
  /** GeoJSON items to display on the map. The list is empty by default */
  geoJsonFiles?: GeoJSONProp[];
  /** Layers to show on the map. The list is empty by default */
  layers?: L.Layer[];
}

/* WWT HUD */

/** Interface describing the location of the WWT HUD */
export interface HUDLocation {
  /** Distance from the top. Should be a valid CSS value */
  top?: string | number,
  /** Distance from the left. Should be a valid CSS value */
  left?: string | number,
  /** Distance from the bottom. Should be a valid CSS value */
  bottom?: string | number,
  /** Distance from the right. Should be a valid CSS value */
  right?: string | number,
}

/** Interface describing props for the WWT HUD */
export interface WwtHUDProps {
  /** Location of the HUD in the browser window. Default is `{ top: "50%", left: "50%" }` */
  location?: HUDLocation;
  /** Define an offset for the HUD. Default is `{ x: 0.5, y: 0.5 }` */
  offsetCenter?: { x: number; y: number };
  /** Other variables to include in the HUD display. Default is `{}` */
  otherVariables?: object;
  /** The font size of the HUD text. Should be a valid CSS value for `font-size` */
  fontSize?: string;
  /** Background color for the HUD. Should be a valid CSS color. Default is `rgba(0, 0, 0, 0.5)` */
  backgroundColor?: string | null;
  /** Text shadow for the HUD text. Should be a valid CSS value for `text-shadow`. Default is `"0 0 5px black"` */
  textShadow?: string | null;
  /** The WWT engine store to use for the HUD. Required */
  store: WWTEngineStore;
}

export type PlaybackControlAction = "reverse" | "playPause" | "slider";
export type PlaybackControlIcon = "play" | "pause" | "playForward" | "playBackward";

/** Interface describing props for the playback control component */
export interface PlaybackControlProps {
  /** The WWT playback rate */
  modelValue?: number;
  /** The maximum power used for the symmetrical log */
  maxPower?: number;
  /** Whether to have the playback paused */
  paused?: boolean;
  /** The maximum speed */
  max?: number | null;
  /** The minimum speed */
  min?: number | null;
  /** The component color. Should be a valid CSS color */
  color?: string;
  /** Whether to use a more compact layout (intended for smaller screens) */
  small?: boolean;
  /** Whether to display the component inline */
  inline?: boolean;
  /** Whether to display buttons when component is inline */
  inlineButton?: boolean;
  /** Whether to show the close button */
  showCloseButton?: boolean;
  /** Whether to hide the play button */
  hidePlayButton?: boolean;
  /** The icons to use for the control buttons */
  icons?: Record<PlaybackControlIcon, string>;
  /** Whether certain control buttons should be disabled */
  disabled?: Record<PlaybackControlAction, boolean>;
}

export type SpeedControlAction = 
  "reverse" |
  "playPause" |
  "slowDown" |
  "speedUp" |
  "reset" |
  "moreControls";

export type SpeedControlIcon = Exclude<SpeedControlAction, "playPause" | "reverse">
  | "play" | "pause" | "playForward" | "playBackward";

/** Interface describing props for the speed control component */
export interface SpeedControlProps {
  /** The WWT engine store to use for the HUD. Required */
  store: WWTEngineStore;
  /** Whether or not time is playing */
  modelValue: boolean;
  /** The primary color used for the component. Should be a valid CSS color */
  color?: string;
  /** The maximum allowed WWT speed */
  maxSpeed?: number;
  /** The default WWT playback rate */
  defaultRate?: number;
  /** Whether or not the speed control should be displayed inline */
  useInline?: boolean; 
  /** Whether or not to show the current playback status */
  showStatus?: boolean;
  /** The factor by which to adjust the WWT speed when speeding up or down */ 
  rateDelta?: number;
  /** Whether or not to display the additional speed controls */
  hideMoreControls?: boolean;
  /** The icons to use for the control buttons */
  icons?: Record<SpeedControlIcon | PlaybackControlIcon, string>;
  /** Whether certain control buttons should be disabled */
  disabled?: Record<SpeedControlAction | PlaybackControlAction, boolean>;
}

/** An async function taking an input string and returning a collection of MapBox Features */
export type SearchProvider = (searchText: string) => Promise<MapBoxFeatureCollection | null>;

/** Interface describing props for the location search component */
export interface LocationSearchProps {
  /** The search provider function to use for finding MapBox features */
  searchProvider?: SearchProvider;
  /** Whether or not the location search is open */
  modelValue?: boolean;
  /** Whether the search box should stay open after a search is completed */
  stayOpen?: boolean;
  /** The accent color used for the search box. Should be a valid CSS color */
  accentColor?: string;
  /** Whether to use the "small-screen" layout */
  small?: boolean;
  /** The size of the activator button's icon. Should be a valid FontAwesome icon size */
  buttonSize?: FontAwesomeIconSize;
  /** The background color of the search box. Should be a valid CSS color */
  bgColor?: string;
}

export interface TapToInputProps {
  /** The current value of the input */
  modelValue: number;
  /** Whether the input should be editable */
  editable?: boolean;
  /** The minimum allowed value */
  min?: string | number;
  /** The maximum allowed value */
  max?: string | number;
  /** The increment between allowed values */
  step?: number;
  /** Whether or not to clamp values between the min and max */
  clamp?: boolean;
  /** What the (minimum) padded length of the value string should be after front-padding with zeros */
  zeroPadLength?: number;
}

export interface DateTimePickerProps {
  /** The current datetime value */
  modelValue: Date;
  /** The accent color for the component. Should be a valid CSS color */
  accentColor?: string;
  /** Whether to show debugging information */
  debug?: boolean;
  /** Whether to use AM/PM (as opposed to 24-hour time) */
  useAmPm?: boolean;
  /** Whether or not the time is editable via text boxes */
  editableTime?: boolean;
}

export interface ShareButtonProps {
  /** A string, or a function producing a string, that gives the text to be copied */
  source?: (() => string) | string;
  /** The color of the button. Should be a valid CSS color */
  buttonColor?: string;
  /** The color of the share icon. Should be a valid CSS color */
  iconColor?: string;
  /** The elevatio of the button */ 
  elevation?: string | number;
  /** The size of the button. Can be a number (in px), a CSS size, or a predefined Vuetify size */
  size?: string;
  /** The border radius of the button. Can be 0, xs, sm, true, lg, xl, pill, circle, shaped. These come from Vuetify */
  rounded?: string | number;
  /** Whether to show a tooltip on hover */
  tooltip?: boolean;
  /** The text of the tooltip */
  tooltipText?: string;
  /** Whether to show a snackbar alert when the button is pressed */
  alert?: boolean;
  /** The text of the snackbar alert */
  alertText?: string;
  /** The ARIA label for the button */
  ariaLabel?: string;
}

export interface UserExperienceProps {
  /** Whether or not we want to ask for comments */
  askForComments?: boolean;
  /** The question to ask the user */
  question?: string;
  /** Placeholder text to use for comments */
  commentPlaceholder?: string;
  /** The base color to use for icons. Can be ignored if not using default slot content. */
  baseColor?: string;
  /** The colors to use for hovered/selected rating icons. Can be ignored if not using default slot content. */
  ratingColors?: string[];
  /** The size to use for icons. Can be ignored if not using default slot content. */
  iconSize?: FontAwesomeIconSize;
  /** The color of the component card */
  color?: string;
}

export interface FolderViewProps {
  /** The root folder of the tree to display in the view. One of either this or `rootUrl` must be specified */
  rootFolder?: Folder;
  /** A URL for the root folder of the tree to display in the view. One of either this or `rootFolder` must be specified */
  rootUrl?: string;
  /** Specifies the orientation of the folder view */
  orientation: "row" | "column";
  /** The gap between folder view items. Any CSS flex gap size is valid. */
  gap?: string;
  /** The color of the folder view background. Should be a valid CSS color */
  backgroundColor?: string;
  /** The color of the thumbnail view background. Should be a valid CSS color */
  thumbnailColor?: string;
  /** The color marking the currently highlighted item. Should be a valid CSS color */
  highlightColor?: string;
  /** The color of item name text. Should be a valid CSS color */
  textColor?: string;
  /** Whether the folder view should start expanded or not. */
  startExpanded?: boolean;
  /** Whether to select the first non-folder item automatically on when the component is mounted. */
  selectFirst?: boolean;
  /** The URL of an image to use as a default thumbnail, for items that don't have one. */
  defaultThumbnail?: string;
  /**
  * If true, subfolders are only loaded when they are first visited.
  * If false, the entire folder tree is loaded right away.
  * */
  lazy?: boolean;
  /** A predicate for filtering which folder items are displayed. Items to be displayed should return true. */
  filter?: (item: Thumbnail) => boolean;
}

export interface TourSheetProps<T extends BaseTourStepContent> {
  /** The tour object to use in the component. */
  tour: Tour<T>;
  /** Whether to apply small-size classes to the component. */
  smallSize?: boolean,
  /** Whether to show the tour step dots. */
  showBreadcrumbs?: boolean,
  /** Whether to show the next button on the last tour step. */
  showNextOnLastStep?: boolean,
  /** Whether to show the back button on the first tour step. */
  showBackOnFirstStep?: boolean,
  /** The text to use for the "Next" buttons */
  nextText?: string,
  /** The text to use for the "Back" buttons */
  backText?: string,
  /** If true, the next button is disabled. */
  disableNext?: boolean,
  /** If true, the previous button is disabled. */
  disablePrevious?: boolean,
  /** Whether to show the close icon in the corner*/
  showClose?: boolean,
  /**
   * Whether to show the Back/Next row. 
   * Set to off for callers to only show the box - 
   * `controls` slot won't do it, since a slot rendering nothing falls back to
   * its default content
   */
  showControls?: boolean,
  /** The color to use for the buttons and active dot. Should be a valid CSS color. */
  accentColor?: string;
  /** The color to use for the border. Should be a valid CSS color */
  borderColor?: string;
  /** The color to use for the card background. Should be a valid CSS color. */
  backgroundColor?: string;
  /** The color to use for the text. Should be a valid CSS color. */
  textColor?: string;
  /** The size to use for the font. Should be a valid CSS font size. */
  fontSize?: string;
}

export type ItemSelectionType = "click" | "dblclick" | "keyup" | "folder";

export interface HorizonOptions {
  /** The color of the horizon/sky */
  color?: string;

  /** The opacity of the horizon/sky */
  opacity?: number;
}

export interface SkyOptions {
  /** The color of the horizon/sky */
  color?: string;

  /** The opacity of the horizon/sky */
  opacity?: number;

  /** Options related to the the current eclipse status */
  eclipseInfo?: SkyEclipseInfo;
}

export interface SkyEclipseInfo {
  /** The current fraction of the sun that is eclipsed */
  fractionEclipsed: number;

  /** Whether the current location is in the relevant path of totality */
  inTotality: boolean;

  /** Whether the current location is in an eclipse at the current time */
  inEclipse: boolean;
}
