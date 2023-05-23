#!/bin/bash

cmd="$1"
expiry_tag_or_backup_filename="$2"
restore_in_dry_run_mode="$3"

# Verify we can connect to AWS with credentials
# See https://stackoverflow.com/questions/31836816
aws sts get-caller-identity

# We use the full postgres DB URL (using --dbname option)
# so that we can pass in password without triggering a prompt.
# See https://stackoverflow.com/questions/2893954
# The POSTGRES_DB_URL may have query params like `?schema=public`
# which we need to remove before passing it to pg_dump
DB_URL_NO_QUERY_PARAMS=$(echo "$POSTGRES_DB_URL" | sed -e 's/\?.*$//g')

if [ $cmd == "dump" ]; then
  expiry_tag=$expiry_tag_or_backup_filename

  DUMP_FILE="pgdump--$POSTGRES_DB_NAME--$APP_ENV--$(date +"%Y%m%d%H%M%S").gz"
  DUMP_PATH_LOCAL="/tmp/$DUMP_FILE"
  DUMP_PATH_REMOTE_KEY="backup/$APP_ENV/postgres/$DUMP_FILE"
  DUMP_PATH_REMOTE="s3://$BACKUP_BUCKET_NAME/$DUMP_PATH_REMOTE_KEY"

  # See https://www.postgresql.org/docs/current/app-pgdump.html
  # And https://stackoverflow.com/questions/2857989
  pg_dump -v -b -Fc --data-only --dbname="$DB_URL_NO_QUERY_PARAMS" | gzip > "$DUMP_PATH_LOCAL"

  # Upload to S3 - https://stackoverflow.com/questions/61104141
  aws s3 cp "$DUMP_PATH_LOCAL" "$DUMP_PATH_REMOTE"

  # Add expiration tag if specified
  if [[ -n "$expiry_tag" ]]; then
    aws s3api put-object-tagging --bucket "$BACKUP_BUCKET_NAME" --key "$DUMP_PATH_REMOTE_KEY" --tagging "TagSet=[{Key=expiry-$expiry_tag, Value=''}]"
  fi

  # Clean up
  rm "$DUMP_PATH_LOCAL"

  echo Postgres DB backup uploaded to "$DUMP_PATH_REMOTE"

elif [ $cmd == "restore" ]; then
  DUMP_FILE_GZ="$expiry_tag_or_backup_filename"
  DUMP_DIR_LOCAL="/tmp"
  DUMP_PATH_REMOTE_KEY="backup/$APP_ENV/postgres/$DUMP_FILE_GZ"
  DUMP_PATH_REMOTE="s3://$BACKUP_BUCKET_NAME/$DUMP_PATH_REMOTE_KEY"

  # Download from S3
  aws s3 cp "$DUMP_PATH_REMOTE" "$DUMP_DIR_LOCAL/$DUMP_FILE_GZ"
  gunzip "$DUMP_DIR_LOCAL/$DUMP_FILE_GZ"
  # gunzip strips the .gz suffix
  DUMP_FILE="${DUMP_FILE_GZ%.*}"

  # Skip pg_restore if in dry run
  if [ -z "$restore_in_dry_run_mode" ]; then
    # See https://www.postgresql.org/docs/current/app-pgrestore.html
    # And https://stackoverflow.com/questions/2732474
    pg_restore -v --data-only --dbname="$DB_URL_NO_QUERY_PARAMS" "$DUMP_DIR_LOCAL/$DUMP_FILE"
    echo Postgres DB restored from "$DUMP_PATH_REMOTE"
  else
    echo Dry run of Postgres DB restore successful
  fi

  # Clean up
  rm "$DUMP_DIR_LOCAL/$DUMP_FILE"

else
  echo Unknown command \""$cmd"\"
fi
