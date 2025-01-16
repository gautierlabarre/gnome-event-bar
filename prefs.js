"use strict";

import Adw from "gi://Adw";
import Gio from "gi://Gio";
import Gtk from "gi://Gtk";

import {
  ExtensionPreferences,
  gettext as _,
} from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";

export default class NextUpExtensionPreferences extends ExtensionPreferences {
  fillPreferencesWindow(window) {
    const settings = this.getSettings();

    // Create a preferences page
    const page = new Adw.PreferencesPage();

    // Create a first group
    const group = new Adw.PreferencesGroup();
    page.add(group);

    // Create a new preferences row
    const row = new Adw.ActionRow({ title: _("Panel to show indicator in") });
    const rowIcon = this.addBooleanSwitchRow(
      settings,
      {
        title: _("Show event icon before the event"),
        subtitle: 'show/hide the "event icon" before the event',
      },
      "show-event-icon"
    );
    group.add(row);
    group.add(rowIcon);

    const dropdown = new Gtk.DropDown({
      model: Gtk.StringList.new([_("Left"), "Center", "Right"]),
      valign: Gtk.Align.CENTER,
    });
    settings.bind(
      "which-panel",
      dropdown,
      "selected",
      Gio.SettingsBindFlags.DEFAULT
    );

    row.add_suffix(dropdown);
    row.activatable_widget = dropdown;

    this.addSlider(
      group,
      "Length of the event name before it is truncated",
      10,
      100,
      0,
      settings
    );

    const groupOfEventsParameters = new Adw.PreferencesGroup();

    const rowMeetingNameDisplay = this.addBooleanSwitchRow(
      settings,
      {
        title: _("Display event name"),
        subtitle: `If disabled will show "Meeting" instead of the event name`,
      },
      "show-event-name"
    );
    const rowEventDuration = this.addBooleanSwitchRow(
      settings,
      {
        title: _("Display event duration"),
        subtitle: 'Will add/remove the "for 30 min" in the event name',
      },
      "show-duration"
    );
    const rowEventTimeBeforeEvent = this.addBooleanSwitchRow(
      settings,
      {
        title: _("Display the time before the event"),
        subtitle: 'Will add/remove the "in 1 h" in the event name',
      },
      "show-time-before-event"
    );
    const rowEventTime = this.addBooleanSwitchRow(
      settings,
      {
        title: _("Display the time of the event"),
        subtitle: 'Will add/remove the "at 15:00" in the event name',
      },
      "show-time-of-event"
    );
    const rowDisplayNextEventWhenAlreadyInMeeting = this.addBooleanSwitchRow(
      settings,
      {
        title: _("Display the next event during an event"),
        subtitle: "When you are in a meeting, show the next event as well",
      },
      "show-next-event-during-meeting"
    );
    groupOfEventsParameters.add(rowMeetingNameDisplay);
    groupOfEventsParameters.add(rowEventDuration);
    groupOfEventsParameters.add(rowEventTimeBeforeEvent);
    groupOfEventsParameters.add(rowEventTime);
    groupOfEventsParameters.add(rowDisplayNextEventWhenAlreadyInMeeting);

    page.add(groupOfEventsParameters);

    // Add our page to the window
    window.add(page);
  }

  /**
   * Responsible to display a row with a text and a switch
   * @param {*} settings the settings object
   * @param {*} texts the texts to display in the row (title and subtitle)
   * @param {*} variable the name of the setting
   * @returns a row
   */
  addBooleanSwitchRow(settings, texts, variable) {
    const row = new Adw.ActionRow(texts);
    const switchWidget = new Gtk.Switch({
      valign: Gtk.Align.CENTER, // Center the switch vertically
    });

    settings.bind(
      variable,
      switchWidget,
      "active",
      Gio.SettingsBindFlags.DEFAULT
    );
    row.add_suffix(switchWidget);
    row.activatable_widget = switchWidget;

    return row;
  }

  addSlider(group, labelText, lower, upper, decimalDigits, settings) {
    const scale = new Gtk.Scale({
      digits: decimalDigits,
      adjustment: new Gtk.Adjustment({ lower: lower, upper: upper }),
      value_pos: Gtk.PositionType.RIGHT,
      hexpand: true,
      halign: Gtk.Align.END,
    });
    scale.set_draw_value(true);
    scale.set_value(settings.get_int("event-length"));
    scale.connect("value-changed", (sw) => {
      let newValue = sw.get_value();
      if (newValue != settings.get_int("event-length")) {
        settings.set_int("event-length", newValue);
      }
    });
    scale.set_size_request(200, 15);

    const row = Adw.ActionRow.new();
    row.set_title(labelText);
    row.add_suffix(scale);
    group.add(row);
  }
}