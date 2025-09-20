#!/bin/bash
# Generate POT template file for translation

EXTENSION_ID="event-bar@gautierlabarre.github.com"
EXTENSION_DIR="."
PO_DIR="$EXTENSION_DIR/po"

# Create po directory if it doesn't exist
mkdir -p "$PO_DIR"

# Extract translatable strings from JavaScript files
xgettext --from-code=UTF-8 \
         --output="$PO_DIR/$EXTENSION_ID.pot" \
         --language=JavaScript \
         --keyword=_ \
         --keyword=N_ \
         --add-comments=TRANSLATORS \
         --package-name="Event Bar" \
         --package-version="1.0" \
         --msgid-bugs-address="gautierlabarre@github.com" \
         extension.js \
         prefs.js \
         src/*.js

echo "✅ POT file generated at $PO_DIR/$EXTENSION_ID.pot"