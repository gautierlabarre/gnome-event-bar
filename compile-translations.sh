#!/bin/bash
# Compile translation files

EXTENSION_ID="event-bar@gautierlabarre.github.com"
PO_DIR="./po"
LOCALE_DIR="./locale"

# Create locale directory structure
for po_file in "$PO_DIR"/*.po; do
    if [ -f "$po_file" ]; then
        lang=$(basename "$po_file" .po)
        echo "📦 Compiling $lang translation..."

        # Create locale directory structure
        mkdir -p "$LOCALE_DIR/$lang/LC_MESSAGES"

        # Compile .po to .mo
        msgfmt "$po_file" -o "$LOCALE_DIR/$lang/LC_MESSAGES/$EXTENSION_ID.mo"

        echo "✅ $lang compiled to $LOCALE_DIR/$lang/LC_MESSAGES/$EXTENSION_ID.mo"
    fi
done

echo "🎉 All translations compiled!"
