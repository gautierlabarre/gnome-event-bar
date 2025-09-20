import { gettext as _ } from "resource:///org/gnome/shell/extensions/extension.js";
import {
  notFullDayEvent,
  getEventDuration,
  getTimeToEventAsText,
  getTimeOfEventAsText,
  trim,
} from "./utils.js";

export function getTodaysEvents(calendarSource) {
  const src = calendarSource;
  src._loadEvents(true);

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Get event from today at midnight

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const todaysEvents = src.getEvents(today, tomorrow).filter(notFullDayEvent);

  return todaysEvents;
}

export function getNextEvents(todaysEvents) {
  const now = new Date();
  const N = todaysEvents.length;

  let currentEvent = null; // The calendar event the user is currently in
  let nextEvent = null; // The next calendar event coming up
  let done = false;

  for (let i = 0; i < N; i++) {
    if (done) break;

    const event = todaysEvents[i];
    const eventStart = event.date;
    const eventEnd = event.end;

    if (now < eventStart) {
      nextEvent = event;
      break;
    } else if (now < eventEnd) {
      currentEvent = event;

      // Check whether there's an event after this one
      if (i < N - 1) {
        let someNextEvent;

        for (let j = i + 1; j < N; j++) {
          someNextEvent = todaysEvents[j];

          // Check whether the next event overlaps the current event
          // or whether they start at the same time

          if (!(someNextEvent.date.valueOf() === currentEvent.date.valueOf())) {
            nextEvent = someNextEvent;
            done = true;
            break;
          }
        }
      }
    }
  }

  return {
    currentEvent: currentEvent,
    nextEvent: nextEvent,
  };
}

/**
 * Set the type of content that'll be displayed in the indicator
 * based on the current and next events
 * @param {*} eventStatus
 * @param {*} settings
 * @returns
 */
export function eventToDisplay(eventStatus, settings) {
  const { currentEvent, nextEvent } = eventStatus;
  const showNextEventInAMeeting = settings.get_boolean(
    "show-next-event-during-meeting"
  );

  if (currentEvent != null) {
    if (nextEvent != null && showNextEventInAMeeting) {
      return displayCurrentEventAndNextEvent(currentEvent, nextEvent, settings);
    }
    return displayCurrentEvent(currentEvent, settings);
  }

  if (nextEvent != null) {
    return displayNextEvent(nextEvent, settings);
  }

  return "";
}

/**
 * Handles the actual content displayed based on settings for next event
 * @param {*} event
 * @param {*} settings
 * @returns
 */
function displayNextEvent(event, settings) {
  const timeText = getTimeOfEventAsText(event.date);
  const diffText = getTimeToEventAsText(event.date);
  const duration = getEventDuration(event.date, event.end);

  const showEventName = settings.get_boolean("show-event-name");
  const showDuration = settings.get_boolean("show-duration");
  const showTimeOfEvent = settings.get_boolean("show-time-of-event");
  const showTimeBeforeEvent = settings.get_boolean("show-time-before-event");
  const length = settings.get_int("event-length");

  const summary = showEventName ? trim(event.summary, length) : _("Meeting");

  const displayShowTimeOfEvent = `${showTimeOfEvent ? `(${timeText}) ` : ""}`;
  const displayShowTimeBeforeEvent = `${
    showTimeBeforeEvent ? _("In %s ").format(diffText) : ""
  }`;
  const displayDuration = `${
    showDuration ? _("for %s ").format(duration) : ""
  }`;
  const displayColons = `${
    showTimeOfEvent || showTimeBeforeEvent || showDuration ? ": " : ""
  }`;

  return `${displayShowTimeBeforeEvent}${displayShowTimeOfEvent}${displayDuration}${displayColons}${summary}`;
}

/**
 * Handles the actual content displayed based on settings for current event with a next event
 * @param {*} currentEvent
 * @param {*} nextEvent
 * @param {*} settings
 * @returns
 */
function displayCurrentEventAndNextEvent(currentEvent, nextEvent, settings) {
  const endsInText = getTimeToEventAsText(currentEvent.end);
  const timeText = getTimeOfEventAsText(nextEvent.date);
  const showEventName = settings.get_boolean("show-event-name");
  const length = settings.get_int("event-length");

  const summary = showEventName
    ? trim(nextEvent.summary, length)
    : _("Meeting");
  return _("Ends in %s. Next: %s at %s").format(endsInText, summary, timeText);
}

/**
 * Handles the actual content displayed based on settings for current event
 * @param {*} event
 * @param {*} settings
 * @returns
 */
function displayCurrentEvent(event, settings) {
  const endsInText = getTimeToEventAsText(event.end);
  const showEventName = settings.get_boolean("show-event-name");
  const length = settings.get_int("event-length");

  const summary = showEventName ? trim(event.summary, length) : _("Meeting");

  return _("Ends in %s: %s").format(endsInText, summary);
}
