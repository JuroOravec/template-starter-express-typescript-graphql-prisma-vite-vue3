#!/bin/bash

# See https://pentacent.medium.com/nginx-and-lets-encrypt-with-docker-in-less-than-5-minutes-b4b8a60d3a71
# 1. Follow the tutorial to set up `app.conf` and `init-letsencrypt.sh`
# 
# 2. In my case I needed to create a certificate for a subdomain which 
#    points to an IP where the app is deployed.
#
# 3. To be able to use subdomain like `example.com`, I had to create
#    a DNS A record for `example.com` to point to the IP.
#
# 4. Then I deployed the app as is so that I could run the initialisation
#    script on the deployed server that sits under `example.com`.
#
# 5. SSH into the deployed container as gitlab user and run cert init script
#    ```sh
#    ssh gitlab@209.38.245.244
#    # In SSH in ~/
#    chmod +x scripts/init-letsencrypt.sh
#    # Note: there might be some folders missing that require sudo to create
#    # If so, log in as root/sudo, create them, then come back as gitlab user
#    # and continue
#    ./init-letsencrypt.sh
#    ````
#
# Other similar tutorials:
# - https://mindsers.blog/post/https-using-nginx-certbot-docker/
# - https://leangaurav.medium.com/simplest-https-setup-nginx-reverse-proxy-letsencrypt-ssl-certificate-aws-cloud-docker-4b74569b3c61
#
# Troubleshooting:
# - Host is already in use by another container
# - Error starting userland proxy: listen tcp4 0.0.0.0:80: bind: address already in use
#   - Kill Ngnix - https://stackoverflow.com/questions/14972792
#   - Restart Docker - https://bytefreaks.net/applications/docker-warning-host-is-already-in-use-by-another-container
# - Certbot failing acme-challenge (connection refused)
#   - https://stackoverflow.com/questions/68449947
#   - The ssl_certificate and ssl_certificate_key in app.conf (Nginx config) MUST be UNcommented

domains=(example.com) # TODO replace with your domain
rsa_key_size=4096
data_path="./volumes/certbot"
email="alex@example.com" # TODO replace with your email # Adding a valid address is strongly recommended  
staging=0 # Set to 1 if you're testing your setup to avoid hitting request limits


if ! [ -x "$(command -v docker-compose)" ]; then
  echo 'Error: docker-compose is not installed.' >&2
  exit 1
fi

if [ -d "$data_path" ]; then
  read -p "Existing data found for $domains. Continue and replace existing certificate? (y/N) " decision
  if [ "$decision" != "Y" ] && [ "$decision" != "y" ]; then
    exit
  fi
fi


if [ ! -e "$data_path/conf/options-ssl-nginx.conf" ] || [ ! -e "$data_path/conf/ssl-dhparams.pem" ]; then
  echo "### Downloading recommended TLS parameters ..."
  mkdir -p "$data_path/conf"
  curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > "$data_path/conf/options-ssl-nginx.conf"
  curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > "$data_path/conf/ssl-dhparams.pem"
  echo
fi

echo "### Creating dummy certificate for $domains ..."
path="/etc/letsencrypt/live/$domains"
mkdir -p "$data_path/conf/live/$domains"
docker-compose run --rm --entrypoint "\
  openssl req -x509 -nodes -newkey rsa:$rsa_key_size -days 1\
    -keyout '$path/privkey.pem' \
    -out '$path/fullchain.pem' \
    -subj '/CN=localhost'" certbot
echo


echo "### Starting nginx ..."
docker-compose up --force-recreate -d nginx
echo

echo "### Deleting dummy certificate for $domains ..."
docker-compose run --rm --entrypoint "\
  rm -Rf /etc/letsencrypt/live/$domains && \
  rm -Rf /etc/letsencrypt/archive/$domains && \
  rm -Rf /etc/letsencrypt/renewal/$domains.conf" certbot
echo


echo "### Requesting Let's Encrypt certificate for $domains ..."
#Join $domains to -d args
domain_args=""
for domain in "${domains[@]}"; do
  domain_args="$domain_args -d $domain"
done

# Select appropriate email arg
case "$email" in
  "") email_arg="--register-unsafely-without-email" ;;
  *) email_arg="--email $email" ;;
esac

# Enable staging mode if needed
if [ $staging != "0" ]; then staging_arg="--staging"; fi

docker-compose run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    $staging_arg \
    $email_arg \
    $domain_args \
    --rsa-key-size $rsa_key_size \
    --agree-tos \
    --force-renewal" certbot
echo

echo "### Reloading nginx ..."
docker-compose exec nginx nginx -s reload
