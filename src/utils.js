import { gettext as _ } from "resource:///org/gnome/shell/extensions/extension.js";

/**
 * Will trim the text to the specified length
 * Is used on the event name
 * @param {string} text
 * @param {number} length
 * @returns
 */
export function trim(text, length) {
  if (text.length > length) {
    return text.substring(0, length) + "...";
  }

  return text;
}

/**
 * Returns events that are not full day events
 * @param {*} event
 * @returns
 */
export function notFullDayEvent(event) {
  return !(
    event.date.getHours() === 0 &&
    event.date.getMinutes() === 0 &&
    event.end.getHours() === 0 &&
    event.end.getMinutes() === 0
  );
}

/**
 * Returns time in format HH:MM
 *
 * @param {*} eventDate
 * @returns
 */
export function getTimeOfEventAsText(eventDate) {
  const hrs = eventDate.getHours();
  const mins = eventDate.getMinutes().toString().padEnd(2, "0");
  const time = `${hrs}:${mins}`;

  return time;
}

/**
 * Returns the time to the event in format HHh MMm
 * If minutes are 0, it will not display them
 *
 * @param {*} eventDate
 * @returns
 */
export function getTimeToEventAsText(eventDate) {
  const now = new Date();
  const diff = Math.abs(eventDate - now);
  const diffInMins = Math.ceil(diff / (1000 * 60));

  const hrDiff = Math.floor(diffInMins / 60);
  const minDiff = diffInMins % 60;

  if (hrDiff > 0) {
    return minDiff > 0
      ? _("%dh %dm").format(hrDiff, minDiff)
      : _("%dh").format(hrDiff);
  } else {
    return _("%dm").format(minDiff);
  }
}
/**
 * returns the duration of an event in format HHh MMm
 *
 * @param {*} beginDate
 * @param {*} endDate
 * @returns
 */
export function getEventDuration(beginDate, endDate) {
  const diff = Math.abs(endDate - beginDate);
  const diffInMins = Math.ceil(diff / (1000 * 60));

  const hrDiff = Math.floor(diffInMins / 60);
  const minDiff = diffInMins % 60;

  if (hrDiff > 0) {
    return minDiff > 0
      ? _("%dh %dm").format(hrDiff, minDiff)
      : _("%dh").format(hrDiff);
  } else {
    return _("%dm").format(minDiff);
  }
}
