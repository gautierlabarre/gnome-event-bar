"use strict";

import Adw from "gi://Adw";
import Gdk from "gi://Gdk";
import Gio from "gi://Gio";
import Gtk from "gi://Gtk";

import {
  ExtensionPreferences,
  gettext as _,
} from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";

export default class NextUpExtensionPreferences extends ExtensionPreferences {
  /**
   * Get GNOME's accent color if available, otherwise return the default gray
   * @returns {string} Color in hex format
   */
  _getGnomeAccentColor() {
    try {
      const interfaceSettings = new Gio.Settings({
        schema: "org.gnome.desktop.interface",
      });

      const accentColor = interfaceSettings.get_string("accent-color");
      console.log("pref");
      console.log("accent Color:", accentColor);

      // Map GNOME accent color names to hex values
      const accentColorMap = {
        blue: "#3584e4",
        teal: "#2190a4",
        green: "#57e389",
        yellow: "#f8e45c",
        orange: "#ff7800",
        red: "#ed333b",
        pink: "#e66ba0",
        purple: "#9141ac",
        slate: "#6f8396",
      };

      if (accentColor && accentColorMap[accentColor]) {
        console.log(accentColorMap[accentColor]);
        return accentColorMap[accentColor];
      }
    } catch (e) {
      console.log(
        "Event Bar: Could not retrieve GNOME accent color in prefs, using default"
      );
    }

    // Fallback to default gray
    return "#5f6368";
  }

  fillPreferencesWindow(window) {
    const settings = this.getSettings();

    // Create Global page
    const globalPage = new Adw.PreferencesPage({
      title: _("Global"),
      icon_name: "preferences-system-symbolic",
    });

    this.createGlobalPage(globalPage, settings);
    window.add(globalPage);

    // Create Styling page
    const stylingPage = new Adw.PreferencesPage({
      title: _("Styling"),
      icon_name: "applications-graphics-symbolic",
    });

    this.createStylingPage(stylingPage, settings);
    window.add(stylingPage);
  }

  createGlobalPage(page, settings) {
    const generalGroup = new Adw.PreferencesGroup({ title: _("General") });

    const row = new Adw.ActionRow({ title: _("Panel to show indicator in") });
    const dropdown = new Gtk.DropDown({
      model: Gtk.StringList.new([_("Left"), _("Center"), _("Right")]),
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
    const rowMeetingNameDisplay = this.addBooleanSwitchRow(
      settings,
      {
        title: _("Display event name"),
        subtitle: _(
          `If disabled will show "Meeting" instead of the event name`
        ),
      },
      "show-event-name"
    );

    const slider = this.addSlider(
      _("Length of the event name displayed"),
      10,
      100,
      0,
      settings
    );

    generalGroup.add(row);
    generalGroup.add(rowMeetingNameDisplay);
    generalGroup.add(slider);
    page.add(generalGroup);

    const groupOfEventsParameters = new Adw.PreferencesGroup({
      title: _("Next events"),
    });

    const rowEventDuration = this.addBooleanSwitchRow(
      settings,
      {
        title: _("Display event duration"),
        subtitle: _('Will add/remove the "for 30 min" in the event name'),
      },
      "show-duration"
    );
    const rowEventTimeBeforeEvent = this.addBooleanSwitchRow(
      settings,
      {
        title: _("Display the time before the event"),
        subtitle: _('Will add/remove the "In 1 h" in the event name'),
      },
      "show-time-before-event"
    );
    const rowEventTime = this.addBooleanSwitchRow(
      settings,
      {
        title: _("Display the time of the event"),
        subtitle: _('Will add/remove the "(15:00)" in the event name'),
      },
      "show-time-of-event"
    );

    groupOfEventsParameters.add(rowEventDuration);
    groupOfEventsParameters.add(rowEventTimeBeforeEvent);
    groupOfEventsParameters.add(rowEventTime);
    page.add(groupOfEventsParameters);

    const groupOfCurrentEventsParameters = new Adw.PreferencesGroup({
      title: _("Current events"),
    });
    const rowDisplayNextEventWhenAlreadyInMeeting = this.addBooleanSwitchRow(
      settings,
      {
        title: _("Display the next event during an event"),
        subtitle: _("When in a meeting, show the next event as well"),
      },
      "show-next-event-during-meeting"
    );
    groupOfCurrentEventsParameters.add(rowDisplayNextEventWhenAlreadyInMeeting);
    page.add(groupOfCurrentEventsParameters);
  }

  createStylingPage(page, settings) {
    // Icon Group
    const iconGroup = new Adw.PreferencesGroup({
      title: _("Icon"),
      description: _("Configure event icon display"),
    });

    const showIconRow = this.addBooleanSwitchRow(
      settings,
      {
        title: _("Show event icon before the event"),
      },
      "show-event-icon"
    );
    iconGroup.add(showIconRow);
    page.add(iconGroup);

    // Color Bar Group
    const colorBarGroup = new Adw.PreferencesGroup({
      title: _("Color Bar"),
      description: _("Display a colored bar before events"),
    });

    // Show color bar switch
    const showColorBarRow = this.addBooleanSwitchRow(
      settings,
      {
        title: _("Show Color Bar"),
        subtitle: _("Display a 3px colored bar before the event text"),
      },
      "show-color-bar"
    );
    colorBarGroup.add(showColorBarRow);

    // Color bar color picker
    const colorBarColorRow = this.addColorRow(
      settings,
      {
        title: _("Bar Color"),
        subtitle: _("Choose the color of the bar"),
      },
      "color-bar-color"
    );
    colorBarGroup.add(colorBarColorRow);

    page.add(colorBarGroup);

    // Text Styling Group
    const textStylingGroup = new Adw.PreferencesGroup({
      title: _("Text Styling"),
      description: _("Customize the appearance of event text"),
    });

    // Font size slider
    const fontSizeRow = this.addFontSizeSlider(
      settings,
      {
        title: _("Font Size"),
        subtitle: _("Adjust the font size of event text"),
      },
      "font-size"
    );
    textStylingGroup.add(fontSizeRow);

    // Text color picker
    const textColorRow = this.addTextColorRow(
      settings,
      {
        title: _("Text Color"),
        subtitle: _("Choose the color of the event text"),
      },
      "text-color"
    );
    textStylingGroup.add(textColorRow);

    page.add(textStylingGroup);
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

  addSlider(labelText, lower, upper, decimalDigits, settings) {
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
    scale.set_size_request(150, 15);

    const row = Adw.ActionRow.new();
    row.set_title(labelText);
    row.add_suffix(scale);

    return row;
  }

  addColorRow(settings, texts, variable) {
    const row = new Adw.ActionRow(texts);

    const colorButton = new Gtk.ColorButton({
      valign: Gtk.Align.CENTER,
      use_alpha: false,
    });

    // Set initial color
    const currentColor = settings.get_string(variable);
    const rgba = new Gdk.RGBA();

    // If the setting is 'auto', show the actual accent color in the button
    if (currentColor === "auto") {
      const accentColor = this._getGnomeAccentColor();
      rgba.parse(accentColor);
    } else {
      rgba.parse(currentColor || "#5f6368"); // Fallback to gray if empty
    }

    colorButton.set_rgba(rgba);

    // Connect color change
    colorButton.connect("color-set", () => {
      const newColor = colorButton.get_rgba().to_string();
      settings.set_string(variable, newColor);
    });

    // Reset button
    const resetButton = new Gtk.Button({
      icon_name: "edit-undo-symbolic",
      valign: Gtk.Align.CENTER,
      tooltip_text: _("Reset to default"),
      css_classes: ["flat"],
    });

    resetButton.connect("clicked", () => {
      const defaultColor = "auto";
      settings.set_string(variable, defaultColor);
      // Show the actual accent color in the color button
      const accentColor = this._getGnomeAccentColor();
      const rgba = new Gdk.RGBA();
      rgba.parse(accentColor);
      colorButton.set_rgba(rgba);
    });

    const buttonBox = new Gtk.Box({
      spacing: 6,
      orientation: Gtk.Orientation.HORIZONTAL,
    });
    buttonBox.append(colorButton);
    buttonBox.append(resetButton);

    row.add_suffix(buttonBox);
    row.activatable_widget = colorButton;

    return row;
  }

  addFontSizeSlider(settings, texts, variable) {
    const row = new Adw.ActionRow(texts);

    const scale = new Gtk.Scale({
      digits: 0,
      adjustment: new Gtk.Adjustment({
        lower: 8,
        upper: 24,
        step_increment: 1,
        page_increment: 2,
      }),
      value_pos: Gtk.PositionType.RIGHT,
      hexpand: true,
      halign: Gtk.Align.END,
    });

    scale.set_draw_value(true);
    scale.set_value(settings.get_int(variable));

    scale.connect("value-changed", (sw) => {
      let newValue = sw.get_value();
      if (newValue != settings.get_int(variable)) {
        settings.set_int(variable, newValue);
      }
    });

    scale.set_size_request(200, 15);

    // Reset button
    const resetButton = new Gtk.Button({
      icon_name: "edit-undo-symbolic",
      valign: Gtk.Align.CENTER,
      tooltip_text: _("Reset to system default"),
      css_classes: ["flat"],
    });

    resetButton.connect("clicked", () => {
      settings.set_int(variable, 12); // 12pt as reasonable default
      scale.set_value(12);
    });

    const controlBox = new Gtk.Box({
      spacing: 6,
      orientation: Gtk.Orientation.HORIZONTAL,
    });
    controlBox.append(scale);
    controlBox.append(resetButton);

    row.add_suffix(controlBox);

    return row;
  }

  addTextColorRow(settings, texts, variable) {
    const row = new Adw.ActionRow(texts);

    const colorButton = new Gtk.ColorButton({
      valign: Gtk.Align.CENTER,
      use_alpha: false,
    });

    // Set initial color or default
    const currentColor = settings.get_string(variable);
    let rgba = new Gdk.RGBA();

    if (currentColor && currentColor !== "") {
      rgba.parse(currentColor);
    } else {
      // Use a neutral color as placeholder when using system default
      rgba.parse("#ffffff");
    }
    colorButton.set_rgba(rgba);

    // Connect color change
    colorButton.connect("color-set", () => {
      const newColor = colorButton.get_rgba().to_string();
      settings.set_string(variable, newColor);
    });

    // Reset button
    const resetButton = new Gtk.Button({
      icon_name: "edit-undo-symbolic",
      valign: Gtk.Align.CENTER,
      tooltip_text: _("Reset to system default"),
      css_classes: ["flat"],
    });

    resetButton.connect("clicked", () => {
      settings.set_string(variable, ""); // Empty = system default
      // Reset to neutral color visually
      const defaultRgba = new Gdk.RGBA();
      defaultRgba.parse("#ffffff");
      colorButton.set_rgba(defaultRgba);
    });

    const buttonBox = new Gtk.Box({
      spacing: 6,
      orientation: Gtk.Orientation.HORIZONTAL,
    });
    buttonBox.append(colorButton);
    buttonBox.append(resetButton);

    row.add_suffix(buttonBox);
    row.activatable_widget = colorButton;

    return row;
  }
}
