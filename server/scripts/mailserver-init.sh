## Add mailserver users
## See
## - https://docker-mailserver.github.io/docker-mailserver/latest/usage/#get-up-and-running
## - https://docker-mailserver.github.io/docker-mailserver/latest/examples/tutorials/basic-installation/#using-dms-as-a-local-mail-relay-for-containers

CONTAINER_NAME=mailserver
DOMAIN=system-mail.example.com
ADMIN_USER=admin
REDIRECT_EMAIL=name@gmail.com

## At this point, if the SSL is not configured for the mailserver's domain,
## run again the letsencrypt-init.sh.
## See https://docker-mailserver.github.io/docker-mailserver/latest/config/security/ssl/#testing-a-certificate-is-valid

## For the folowing section, connect via ssh as gitlab user, and run following
## code

## Get overview of all commands
docker exec -it $CONTAINER_NAME setup help

## Add users
## We want to forward incoming emails to our personal email
## See last step in https://docker-mailserver.github.io/docker-mailserver/latest/examples/tutorials/basic-installation/#using-dms-as-a-local-mail-relay-for-containers
docker exec -ti $CONTAINER_NAME setup email add $ADMIN_USER@$DOMAIN <MAIL_ADMIN_PWD>
docker exec -it $CONTAINER_NAME setup alias add $ADMIN_USER@$DOMAIN $REDIRECT_EMAIL
## Redirect postmaster@domain to out admin user
docker exec -ti $CONTAINER_NAME setup alias add postmaster@$DOMAIN $ADMIN_USER@$DOMAIN

docker exec -it $CONTAINER_NAME setup email list
docker exec -it $CONTAINER_NAME setup alias list

## Configure DKIM
## See https://docker-mailserver.github.io/docker-mailserver/latest/config/best-practices/dkim_dmarc_spf/
docker exec -it $CONTAINER_NAME setup config dkim help
## If using RSPAMD, copy the output of following command, and into TXT record of your domain
docker exec -it $CONTAINER_NAME setup config dkim
