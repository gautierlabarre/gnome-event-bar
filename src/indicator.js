import St from "gi://St";
import Clutter from "gi://Clutter";
import Gio from "gi://Gio";
import * as Calendar from "resource:///org/gnome/shell/ui/calendar.js";
import * as Main from "resource:///org/gnome/shell/ui/main.js";
import * as PanelMenu from "resource:///org/gnome/shell/ui/panelMenu.js";
import * as PopupMenu from "resource:///org/gnome/shell/ui/popupMenu.js";
import * as Config from "resource:///org/gnome/shell/misc/config.js";
import { gettext as _ } from "resource:///org/gnome/shell/extensions/extension.js";

export default class Indicator extends PanelMenu.Button {
  constructor(props) {
    super();
    this._openPrefsCallback = props.openPrefsCallback;
    this._settings = props.settings;
  }

  /**
   * Get GNOME's accent color if available, otherwise return the default gray
   * @returns {string} Color in hex format
   */
  _getDefaultBarColor() {
    try {
      const interfaceSettings = new Gio.Settings({
        schema: "org.gnome.desktop.interface",
      });

      const accentColor = interfaceSettings.get_string("accent-color");

      // Map GNOME accent color names to hex values
      // These are the standard GNOME accent colors
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
        return accentColorMap[accentColor];
      }
    } catch (e) {
      console.log(
        "Event Bar: Could not retrieve GNOME accent color, using default"
      );
    }

    // Fallback to default gray
    return "#5f6368";
  }

  _init() {
    super._init(0.0, _("EventBar Indicator"));

    this._calendarSource = new Calendar.DBusEventSource();

    this._loadGUI();
    this._initialiseMenu();
    this._connectSettings();
  }

  _loadGUI() {
    const boxLayoutConfig = {
      vertical: false,
      clip_to_allocation: true,
      x_align: Clutter.ActorAlign.START,
      y_align: Clutter.ActorAlign.CENTER,
      reactive: true,
      x_expand: true,
    };

    const shellVersion = parseFloat(Config.PACKAGE_VERSION);
    if (shellVersion < 45) {
      boxLayoutConfig.pack_start = false;
    }

    this._menuLayout = new St.BoxLayout(boxLayoutConfig);

    this._calendarIcon = new St.Icon({
      icon_name: "content-loading-symbolic",
      style_class: "system-status-icon",
    });
    this.icon = this._calendarIcon;

    // Initialize event state
    this._hasEvents = false;

    // Add colored bar between icon and text
    this._colorBar = new St.Widget({
      style_class: "event-color-bar",
      style: "background-color: transparent;",
      visible: false,
      y_align: Clutter.ActorAlign.FILL,
      y_expand: true,
    });

    this.text = new St.Label({
      text: _("Loading"),
      y_expand: true,
      style_class: "system-status-label",
      y_align: Clutter.ActorAlign.CENTER,
    });

    this._menuLayout.add_child(this.icon);
    this._menuLayout.add_child(this._colorBar);
    this._menuLayout.add_child(this.text);

    this.add_child(this._menuLayout);

    return;
  }

  _initialiseMenu() {
    const settingsItem = new PopupMenu.PopupMenuItem(_("Settings"));
    settingsItem.connect("activate", () => {
      this._openPrefsCallback();
    });
    this.menu.addMenuItem(settingsItem);
  }

  setText(text, hasEvents = false) {
    this.text.set_text(text);
    this._hasEvents = hasEvents;

    // Add/remove no-events class based on whether there's text
    if (text === "" || !hasEvents) {
      this.text.add_style_class_name("no-events");
      this.icon.add_style_class_name("no-events");
    } else {
      this.text.remove_style_class_name("no-events");
      this.icon.remove_style_class_name("no-events");
    }

    this._updateColorBar();
    this._updateTextStyle();
  }

  _connectSettings() {
    if (!this._settings) return;

    // Listen for color bar settings changes
    this._settings.connect("changed::show-color-bar", () => {
      this._updateColorBar();
    });

    this._settings.connect("changed::color-bar-color", () => {
      this._updateColorBar();
    });

    // Listen for text styling changes
    this._settings.connect("changed::font-size", () => {
      this._updateTextStyle();
    });

    this._settings.connect("changed::text-color", () => {
      this._updateTextStyle();
    });
  }

  _updateColorBar() {
    if (!this._colorBar || !this._settings) return;

    const showColorBar = this._settings.get_boolean("show-color-bar");
    let colorBarColor = this._settings.get_string("color-bar-color");

    // If the color is 'auto', use GNOME's accent color
    if (colorBarColor === "auto" || !colorBarColor || colorBarColor === "") {
      colorBarColor = this._getDefaultBarColor();
    }

    // Only show color bar if setting is enabled AND there are events
    if (showColorBar && this._hasEvents) {
      this._colorBar.style = `background-color: ${colorBarColor};`;
      this._colorBar.visible = true;
    } else {
      this._colorBar.visible = false;
    }
  }

  _updateTextStyle() {
    if (!this.text || !this._settings) return;

    const fontSize = this._settings.get_int("font-size");
    const textColor = this._settings.get_string("text-color");

    // Simple and direct approach - build style string
    let styleString = "";

    if (fontSize > 0) {
      styleString += `font-size: ${fontSize}pt; `;
    }

    if (textColor && textColor !== "") {
      styleString += `color: ${textColor}; `;
    }

    // Apply style directly
    this.text.style = styleString;
  }

  showNextEventIcon({ showIcon }) {
    this.icon.set_icon_name("org.gnome.Calendar.Devel-symbolic");
    this.icon.visible = showIcon ? true : false;
  }

  showCurrentEventIcon({ showIcon }) {
    this.icon.set_icon_name("clock-alt-symbolic");
    this.icon.visible = showIcon ? true : false;
  }

  hideIcon() {
    this.icon.visible = false;
  }

  showNoEventIcon() {
    this.icon.set_icon_name("x-office-calendar-symbolic");
  }

  vfunc_event(event) {
    if (
      event.type() == Clutter.EventType.TOUCH_END ||
      event.type() == Clutter.EventType.BUTTON_RELEASE
    ) {
      if (event.get_button() === Clutter.BUTTON_PRIMARY) {
        // Show calendar on left click
        if (this.menu.isOpen) {
          this.menu._getTopMenu().close();
        } else {
          Main.panel.toggleCalendar();
        }
      } else {
        // Show settings menu on right click
        this.menu.toggle();
      }
    }

    return Clutter.EVENT_PROPAGATE;
  }
}
