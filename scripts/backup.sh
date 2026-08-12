#!/bin/bash

# BUOGS Portfolio Backup Script (JSON + Media)
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="./backups/$TIMESTAMP"

mkdir -p "$BACKUP_DIR"

echo "Starting BUOGS Portfolio backup to $BACKUP_DIR..."

if [ -d "./storage/data" ]; then
  cp -r ./storage/data "$BACKUP_DIR/data"
  echo "✓ Saved metadata JSON files."
fi

if [ -d "./storage/media" ]; then
  cp -r ./storage/media "$BACKUP_DIR/media"
  echo "✓ Saved storage media files."
fi

tar -czf "$BACKUP_DIR.tar.gz" -C ./backups "$TIMESTAMP"
rm -rf "$BACKUP_DIR"

echo "Backup complete: $BACKUP_DIR.tar.gz"
