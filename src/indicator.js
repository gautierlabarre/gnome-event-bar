import St from "gi://St";
import Clutter from "gi://Clutter";
import * as Calendar from "resource:///org/gnome/shell/ui/calendar.js";
import * as Main from "resource:///org/gnome/shell/ui/main.js";
import * as PanelMenu from "resource:///org/gnome/shell/ui/panelMenu.js";
import * as PopupMenu from "resource:///org/gnome/shell/ui/popupMenu.js";
import { gettext as _ } from "resource:///org/gnome/shell/extensions/extension.js";

export default class Indicator extends PanelMenu.Button {
  constructor(props) {
    super();
    this._openPrefsCallback = props.openPrefsCallback;
  }

  _init() {
    super._init(0.0, _("EventBar Indicator"));

    this._calendarSource = new Calendar.DBusEventSource();

    this._loadGUI();
    this._initialiseMenu();
  }

  _loadGUI() {
    this._menuLayout = new St.BoxLayout({
      vertical: false,
      clip_to_allocation: true,
      x_align: Clutter.ActorAlign.START,
      y_align: Clutter.ActorAlign.CENTER,
      reactive: true,
      x_expand: true,
      pack_start: false,
    });

    this._calendarIcon = new St.Icon({
      icon_name: "content-loading-symbolic",
      style_class: "system-status-icon",
    });
    this.icon = this._calendarIcon;

    this.text = new St.Label({
      text: _("Loading"),
      y_expand: true,
      style_class: "system-status-label",
      y_align: Clutter.ActorAlign.CENTER,
    });

    this._menuLayout.add_child(this.icon);
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

  setText(text) {
    this.text.set_text(text);
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
