/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

import GLib from "gi://GLib";
import GObject from "gi://GObject";

import * as Main from "resource:///org/gnome/shell/ui/main.js";
import {
  Extension,
  gettext as _,
} from "resource:///org/gnome/shell/extensions/extension.js";

import Indicator from "./src/indicator.js";
import {
  getTodaysEvents,
  getNextEvents,
  eventToDisplay,
} from "./src/events.js";

const IndicatorInstance = GObject.registerClass(Indicator);

export default class NextUpExtension extends Extension {
  enable() {
    this._indicator = new IndicatorInstance({
      openPrefsCallback: this.openPreferences.bind(this),
    });
    this.iterations = 1;

    this._settings = this.getSettings();
    this._settingChangedSignal = this._settings.connect(
      "changed::which-panel",
      () => {
        this.unloadIndicator();
        this.loadIndicator();
      }
    );

    [
      "changed::event-length",
      "changed::show-duration",
      "changed::show-time-before-event",
      "changed::show-time-of-event",
      "changed::show-event-icon",
      "changed::show-event-name",
      "changed::show-next-event-during-meeting",
    ].forEach((setting) => {
      this._settingChangedSignal = this._settings.connect(setting, () => {
        this.refreshIndicator();
      });
    });

    // Wait 3 seconds before loading the indicator
    // So that it isn't loaded too early and positioned after other elements in the panel
    this.delaySourceId = GLib.timeout_add_seconds(
      GLib.PRIORITY_DEFAULT,
      5,
      () => {
        this.loadIndicator();
        this._startLoop();

        return false;
      }
    );
  }

  _startLoop() {
    this.sourceId = GLib.timeout_add_seconds(
      GLib.PRIORITY_DEFAULT,
      5, // seconds to wait
      () => {
        this.refreshIndicator();

        return GLib.SOURCE_CONTINUE;
      }
    );
  }

  loadIndicator() {
    const boxes = [
      Main.panel._leftBox,
      Main.panel._centerBox,
      Main.panel._rightBox,
    ];

    const whichPanel = this._settings.get_int("which-panel");

    // If aligned to left, place it after workspaces indicator
    const index = whichPanel === 0 ? 1 : 0;

    boxes[whichPanel].insert_child_at_index(this._indicator.container, index);
  }

  unloadIndicator() {
    this._indicator.container
      .get_parent()
      .remove_child(this._indicator.container);
  }

  // Clean up this code, the conditions are incredibly hard to follow
  refreshIndicator() {
    const todaysEvents = getTodaysEvents(this._indicator._calendarSource);
    const eventStatus = getNextEvents(todaysEvents);
    const text = eventToDisplay(eventStatus, this._settings);
    const shouldShowEventIcon = this._settings.get_boolean("show-event-icon");
    const noEventsToday = todaysEvents.length === 0;
    const noCurrentNorNextEvent =
      eventStatus.currentEvent === null && eventStatus.nextEvent === null;

    if (noCurrentNorNextEvent && noEventsToday) {
      this.iterations++;
    }

    if ((this.iterations >= 8 || !noEventsToday) && noCurrentNorNextEvent) {
      this._indicator.showNoEventIcon();
      this._indicator.setText("");
      return;
    }

    if (eventStatus.currentEvent === null && eventStatus.nextEvent !== null) {
      this._indicator.showNextEventIcon({ showIcon: shouldShowEventIcon });
      this._indicator.setText(text);
      return;
    }

    if (eventStatus.currentEvent !== null && eventStatus.nextEvent === null) {
      this._indicator.showCurrentEventIcon({ showIcon: shouldShowEventIcon });
      this._indicator.setText(text);
      return;
    }

    if (eventStatus.currentEvent !== null && eventStatus.nextEvent !== null) {
      this._indicator.showCurrentEventIcon({ showIcon: shouldShowEventIcon });
      this._indicator.setText(text);
      return;
    }
  }

  disable() {
    Main.panel._centerBox.remove_child(this._indicator.container);

    this._settings.disconnect(this._settingChangedSignal);
    this._settings = null;

    this._indicator.destroy();
    this._indicator = null;

    if (this.sourceId) {
      GLib.Source.remove(this.sourceId);
      this.sourceId = null;
    }

    if (this.delaySourceId) {
      GLib.Source.remove(this.delaySourceId);
      this.delaySourceId = null;
    }
  }
}
