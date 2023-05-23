# Scripts used in Gitlab CI

# Each script is defined by their job name, which is passed in as a positional arg.
#
# Example: To call the script for server unit tests, run `gitlab-ci.sh server-test-unit`
job="$1"

function sshPrepare () {
  serverIp="$1"

  eval $(ssh-agent -s)
  ## See https://stackoverflow.com/a/56163560/9788634
  echo "$GITLAB_CI_PRIVATE_KEY" | tr -d '\r' | ssh-add - > /dev/null
  ## Fix this issue https://codeql.github.com/codeql-query-help/python/py-paramiko-missing-host-key-validation/
  ## https://www.techrepublic.com/article/how-to-easily-add-an-ssh-fingerprint-to-your-knownhosts-file-in-linux/
  mkdir ~/.ssh && ssh-keyscan -H "$serverIp" >> ~/.ssh/known_hosts
}

# Test whether we can connect via ssh to target user@IP using the GITLAB_CI_PRIVATE_KEY
function sshTest () {
  serverIp="$1"
  serverUser="$2"

  sshPrepare "$serverIp"
  ## See https://serverfault.com/q/638628/1021637
  ssh -vT "$serverUser@$serverIp"
}

function envFileGenServerDbUrl () {
  # Load vars from .env ...
  # NOTE: DOES NOT HANDLE SPACE IN .env entries.
  #       See https://stackoverflow.com/a/20909045/9788634
  export $(grep -v '^#' .env | xargs) &>/dev/null
  # ...so we can add SERVER_DB_URL if it's not defined
  if [ -z "$SERVER_DB_URL" ]; then
    # E.g. postgres://user:pwd@postgres:5432/db_name?schema=public
    echo -e "\nSERVER_DB_URL=postgres://${SERVER_DB_USER}:${SERVER_DB_PWD}@postgres:5432/${SERVER_DB_NAME}?schema=public" >> .env
  fi 
}

## NOTE: Using `docker-compose -H "ssh://...` did not work
##       So instead, we manually connect to the remote server and run docker-compose
function serverDeploy () {
  serverIp="$1"
  serverUser="$2"

  ## Load files from secrets to env vars
  ## E.g. Convert file '.secrets/TEST' with content '22' into TEST=22
  loadSecretsScript='
  for file in .secrets/*
  do
    secretName="$(basename "$file")"
    echo Loading "$secretName"
    export "$secretName"="$(cat "$file")"
  done'

  dockerComposeScript="
  docker login -u $CI_DEPLOY_USER -p $CI_DEPLOY_PASSWORD $CI_REGISTRY_IMAGE;
  docker-compose down --remove-orphans;
  docker-compose pull;
  docker-compose up -d;
  docker system prune -a -f;
  docker volume prune -f;"

  ssh "$serverUser@$serverIp" "
  $loadSecretsScript
  $dockerComposeScript"
}

function serverDbMigrate () {
  serverIp="$1"
  serverUser="$2"

  ## 1. Connect to server.
  ## 2. Inside the server, connect to node_server container.
  ## 3. Inside node container, run prisma migrate deploy.
  ssh "$serverUser@$serverIp" "docker exec gitlab_node_server_1 /bin/sh -c \"npx prisma migrate deploy\""
}

# Make a manual backup of the database data, with 30 day expiry
function serverDbBackup () {
  serverIp="$1"
  serverUser="$2"

  ## 1. Connect to server.
  ## 4. Inside the server, connect to cron container.
  ## 5. Inside cron container, run db dump script.
  ssh "$serverUser@$serverIp" "
  docker exec cron /bin/bash -c \"bash /etc/supercronic/scripts/postgres-backup.sh dump 30d\""
}

function serverDbRestore () {
  serverIp="$1"
  serverUser="$2"
  dbDumpFilename="$3"

  ## 1. Connect to server.
  ## 2. Inside the server, connect to node_server container.
  ## 3. Inside node container, run prisma to reset database (data will be lost).
  ## 4. Inside the server, connect to cron container.
  ## 5. Inside cron container, run db restore script.
  ssh "$serverUser@$serverIp" "
  # Dry run
  docker exec cron /bin/bash -c \"bash /etc/supercronic/scripts/postgres-backup.sh restore $dbDumpFilename 1\"
  # Actual
  docker exec gitlab_node_server_1 /bin/sh -c \"npx prisma migrate reset -f --skip-generate\"
  docker exec cron /bin/bash -c \"bash /etc/supercronic/scripts/postgres-backup.sh restore $dbDumpFilename\""
}

################
# Test jobs
################

if [ "$job" == "server-ssh-prod" ]; then
  sshTest "$SERVER_IP_PROD" "$SERVER_USER_PROD"

elif [ "$job" == "server-ssh-stg" ]; then
  sshTest "$SERVER_IP_STAGE" "$SERVER_USER_STAGE"

elif [ "$job" == "server-lint" ]; then
  cd server
  npm ci
  npm run lint

elif [ "$job" == "server-test-unit" ]; then
  cd server
  npm ci
  npm run test:unit

################
# Build jobs
################

elif [ "$job" == "server-build-stg" ]; then
  cd server
  mv .env.dev .env
  echo -e "\nNODE_SERVER_IMAGE_TAG=$SERVER_TAG_COMMIT" >> .env
  echo -e "\nCRON_IMAGE_TAG=$CRON_TAG_COMMIT" >> .env
  docker login -u $CI_DEPLOY_USER -p $CI_DEPLOY_PASSWORD $CI_REGISTRY_IMAGE
  docker-compose build
  docker-compose push
  echo Image $SERVER_TAG_COMMIT added to registry $CI_REGISTRY_IMAGE

elif [ "$job" == "server-build-prod" ]; then
  cd server
  mv .env.prd .env
  echo -e "\nNODE_SERVER_IMAGE_TAG=$SERVER_TAG_LATEST" >> .env
  echo -e "\nCRON_IMAGE_TAG=$CRON_TAG_LATEST" >> .env
  docker login -u $CI_DEPLOY_USER -p $CI_DEPLOY_PASSWORD $CI_REGISTRY_IMAGE
  docker-compose build
  docker-compose push
  echo Image $SERVER_TAG_LATEST added to registry $CI_REGISTRY_IMAGE

################
# Deploy jobs
################

elif [ "$job" == "server-deploy-stg" ]; then
  cd server
  mv .env.dev .env
  echo -e "\nNODE_SERVER_IMAGE_TAG=$SERVER_TAG_COMMIT" >> .env
  echo -e "\nCRON_IMAGE_TAG=$CRON_TAG_COMMIT" >> .env
  echo -e "\nMAIL_RELAY_PASSWORD=$MAIL_RELAY_PASSWORD" >> .env
  echo -e "\nAWS_S3_BACKUP_DB_KEY=$AWS_S3_BACKUP_DB_KEY_STAGE" >> .env
  echo -e "\nAWS_S3_BACKUP_DB_PWD=$AWS_S3_BACKUP_DB_PWD_STAGE" >> .env
  echo -e "\nSERVER_DB_PWD=$SERVER_DB_PWD_STAGE" >> .env
  echo -e "\nSERVER_SESSION_COOKIE_SECRET=$SERVER_SESSION_COOKIE_SECRET" >> .env
  echo -e "\nPAYGATE_PADDLE_VENDOR_ID=$PAYGATE_PADDLE_VENDOR_ID" >> .env
  envFileGenServerDbUrl

  # Following data includes newlines, so we pass them as files
  mkdir .secrets
  echo "$PAYGATE_PADDLE_PUBLIC_KEY_STAGE" >> .secrets/PAYGATE_PADDLE_PUBLIC_KEY

  sshPrepare "$SERVER_IP_STAGE"
  scp -r .env .secrets docker-compose.yaml Dockerfile cron scripts volumes "$SERVER_USER_STAGE@$SERVER_IP_STAGE":~
  serverDeploy "$SERVER_IP_STAGE" "$SERVER_USER_STAGE"

elif [ "$job" == "server-deploy-prod" ]; then
  cd server
  mv .env.prd .env
  echo -e "\nNODE_SERVER_IMAGE_TAG=$SERVER_TAG_LATEST" >> .env
  echo -e "\nCRON_IMAGE_TAG=$CRON_TAG_LATEST" >> .env
  echo -e "\nMAIL_RELAY_PASSWORD=$MAIL_RELAY_PASSWORD" >> .env
  echo -e "\nAWS_S3_BACKUP_DB_KEY=$AWS_S3_BACKUP_DB_KEY_PROD" >> .env
  echo -e "\nAWS_S3_BACKUP_DB_PWD=$AWS_S3_BACKUP_DB_PWD_PROD" >> .env
  echo -e "\nSERVER_DB_PWD=$SERVER_DB_PWD_PROD" >> .env
  echo -e "\nSERVER_SESSION_COOKIE_SECRET=$SERVER_SESSION_COOKIE_SECRET" >> .env
  echo -e "\nPAYGATE_PADDLE_VENDOR_ID=$PAYGATE_PADDLE_VENDOR_ID" >> .env
  envFileGenServerDbUrl

  # Following data includes newlines, so we pass them as files
  mkdir .secrets
  echo "$PAYGATE_PADDLE_PUBLIC_KEY_PROD" >> .secrets/PAYGATE_PADDLE_PUBLIC_KEY

  sshPrepare "$SERVER_IP_PROD"
  scp -r .env .secrets docker-compose.yaml Dockerfile cron scripts volumes $SERVER_USER_PROD@$SERVER_IP_PROD:~
  serverDeploy "$SERVER_IP_PROD" "$SERVER_USER_PROD"

################
# DB migrate jobs
################

elif [ "$job" == "server-db-migrate-stg" ]; then
  cd server
  sshPrepare "$SERVER_IP_STAGE"
  serverDbMigrate "$SERVER_IP_STAGE" "$SERVER_USER_STAGE"

elif [ "$job" == "server-db-migrate-prod" ]; then
  cd server
  sshPrepare "$SERVER_IP_PROD"
  serverDbMigrate "$SERVER_IP_PROD" "$SERVER_USER_PROD"

################
# DB backup jobs
################

elif [ "$job" == "server-db-backup-stg" ]; then
  cd server
  sshPrepare "$SERVER_IP_STAGE"
  serverDbBackup "$SERVER_IP_STAGE" "$SERVER_USER_STAGE"

elif [ "$job" == "server-db-backup-prod" ]; then
  cd server
  sshPrepare "$SERVER_IP_PROD"
  serverDbBackup "$SERVER_IP_PROD" "$SERVER_USER_PROD"

################
# DB restore jobs
################

elif [ "$job" == "server-db-restore-stg" ]; then
  cd server
  sshPrepare "$SERVER_IP_STAGE"
  ## The DB backup (dump) to which the DB will be restored is set via
  ## $SERVER_DB_RESTORE_FILE_STAGE in Gitlab CI/CD variables
  serverDbRestore "$SERVER_IP_STAGE" "$SERVER_USER_STAGE" "$SERVER_DB_RESTORE_FILE_STAGE"

elif [ "$job" == "server-db-restore-prod" ]; then
  cd server
  sshPrepare "$SERVER_IP_PROD"
  ## The DB backup (dump) to which the DB will be restored is set via
  ## $SERVER_DB_RESTORE_FILE_PROD in Gitlab CI/CD variables
  serverDbRestore "$SERVER_IP_PROD" "$SERVER_USER_PROD" "$SERVER_DB_RESTORE_FILE_PROD"

else
    echo "ERROR: Unknown job \"$job\""
    exit 1 # terminate and indicate error
fi