#!/bin/bash

# BUOGS Portfolio Restore Script
if [ -z "$1" ]; then
  echo "Usage: ./scripts/restore.sh <path_to_backup_archive.tar.gz>"
  exit 1
fi

ARCHIVE=$1

if [ ! -f "$ARCHIVE" ]; then
  echo "Error: Backup file $ARCHIVE does not exist."
  exit 1
fi

echo "Restoring BUOGS Portfolio data from $ARCHIVE..."

TEMP_RESTORE="./backups/temp_restore"
mkdir -p "$TEMP_RESTORE"

tar -xzf "$ARCHIVE" -C "$TEMP_RESTORE"

RESTORE_FOLDER=$(ls "$TEMP_RESTORE" | head -n 1)

if [ -d "$TEMP_RESTORE/$RESTORE_FOLDER/data" ]; then
  cp -r "$TEMP_RESTORE/$RESTORE_FOLDER/data/"* ./storage/data/
  echo "✓ Restored JSON data."
fi

if [ -d "$TEMP_RESTORE/$RESTORE_FOLDER/media" ]; then
  cp -r "$TEMP_RESTORE/$RESTORE_FOLDER/media/"* ./storage/media/
  echo "✓ Restored media files."
fi

rm -rf "$TEMP_RESTORE"
echo "Restore successfully completed!"
