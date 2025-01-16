# Presentation

This is a gnome extension to display the next events from your gnome calendar.
This extension works for gnome 45 and above.

![screenshot1](screenshots/screenshot.png)
![screenshot2](screenshots/screenshot2.png)
![screenshot3](screenshots/screenshot3.png)

## How to use ?

First, synchronize your calendar with your gnome calendar. Then, you can install the extension from the gnome extensions website and activate it. It's possible that it takes a few moment to load the events at first.

## Features

- Show next event from your gnome calendar
- Show current event
- You can personalize the look in the settings
- You can even hide the event name
- The size of the event is configurable

## Next feature (help is welcome)

- Translation
- Another wording for the event (to gain space)
- ?? Feel free to add an issue

## How to develop ?
To test this application without the need to logout, you can use the following command:

```bash
env MUTTER_DEBUG_DUMMY_MODE_SPECS=1920x1080 \
dbus-run-session -- gnome-shell --nested --wayland
```

To update the schemas with new parameters :

```bash
glib-compile-schemas .
```

## Thanks

- https://github.com/artisticat1/gnome-next-up this project is based on this one
