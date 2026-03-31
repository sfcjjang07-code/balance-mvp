import gelatoCafeVsBingsuHouse from "./entries/gelato-cafe-vs-bingsu-house";
import seaStayVsValleyStay from "./entries/sea-stay-vs-valley-stay";
import woodToneRoomVsWhiteRoom from "./entries/wood-tone-room-vs-white-room";
import dogLifeVsCatLife from "./entries/dog-life-vs-cat-life";
import picnicDateVsMuseumDate from "./entries/picnic-date-vs-museum-date";
import sunriseTripVsStarlightTrip from "./entries/sunrise-trip-vs-starlight-trip";
import sneakersStyleVsLoafersStyle from "./entries/sneakers-style-vs-loafers-style";
import brunchTourVsMarketFoodTour from "./entries/brunch-tour-vs-market-food-tour";
import lateStartVsEarlyFinish from "./entries/late-start-vs-early-finish";
import summerOnlyVsWinterOnly from "./entries/summer-only-vs-winter-only";
import callFirstVsTextFirst from "./entries/call-first-vs-text-first";
import plannedTripVsSpontaneousTrip from "./entries/planned-trip-vs-spontaneous-trip";
import remoteWorkVsOfficeWork from "./entries/remote-work-vs-office-work";
import morningFocusVsNightFocus from "./entries/morning-focus-vs-night-focus";
import readingHourVsWalkingHour from "./entries/reading-hour-vs-walking-hour";
import snsOffVsDeliveryOff from "./entries/sns-off-vs-delivery-off";
import fourDayWeekVsSixHourDay from "./entries/four-day-week-vs-six-hour-day";
import writeItDownVsRememberIt from "./entries/write-it-down-vs-remember-it";
import speakFirstVsListenFirst from "./entries/speak-first-vs-listen-first";
import newHobbyVsMasterOldHobby from "./entries/new-hobby-vs-master-old-hobby";

export type { BalanceGame, BalanceChoice, BalanceGameInput, BalanceChoiceInput, ChoiceId } from "./types";
export { defineBalanceGame } from "./defineBalanceGame";

export const games = [
  gelatoCafeVsBingsuHouse,
  seaStayVsValleyStay,
  woodToneRoomVsWhiteRoom,
  dogLifeVsCatLife,
  picnicDateVsMuseumDate,
  sunriseTripVsStarlightTrip,
  sneakersStyleVsLoafersStyle,
  brunchTourVsMarketFoodTour,
  lateStartVsEarlyFinish,
  summerOnlyVsWinterOnly,
  callFirstVsTextFirst,
  plannedTripVsSpontaneousTrip,
  remoteWorkVsOfficeWork,
  morningFocusVsNightFocus,
  readingHourVsWalkingHour,
  snsOffVsDeliveryOff,
  fourDayWeekVsSixHourDay,
  writeItDownVsRememberIt,
  speakFirstVsListenFirst,
  newHobbyVsMasterOldHobby,
];

export const categories = ["전체", ...new Set(games.map((game) => game.category))];

export function getGameBySlug(slug: string) {
  return games.find((game) => game.slug === slug);
}
