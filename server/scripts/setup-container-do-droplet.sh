## Server container initialisation script
##
## Configure server to allow GitlabCI user (worker running from gitlab-ci)
## to deploy using docker-compose.
##
## See
## - https://medium.com/@vitalypanukhin/docker-compose-and-gitlab-b209d09210f6
## - https://danielwachtel.com/devops/deploying-multiple-dockerized-apps-digitalocean-docker-compose-contexts
##
## This script was written for DigitalOcean's droplet, so some tweaks might be necessary
## on different could providers.
##
## Troubleshooting
## - Error: Permission denied (publickey) - https://docs.github.com/en/authentication/troubleshooting-ssh/error-permission-denied-publickey
## - Make sure that your or gitlab's public keys are among the authorized_keys
## - To connect from your/gitlab's to the server, you:
##   1. Save your/gitlab's PUBLIC KEY in the server's authorized_keys
##   2a. Copy the server's PUBLIC KEY to your/gitlab's machine (untested)
##   2b. Copy the server's PRIVATE KEY to your/gitlab's machine (tested)
## - SSH connection works for root but not user - https://serverfault.com/questions/1083063
##
## Learn more
## - https://commons.wikimedia.org/wiki/File:SSH_diagram.png
## - https://stackoverflow.com/questions/5244129
## - https://docs.digitalocean.com/products/droplets/how-to/add-ssh-keys/to-existing-droplet/
## - https://www.digitalocean.com/community/tutorials/initial-server-setup-with-ubuntu-22-04
##
## Other similar tutorials
## - https://codingfriend.medium.com/continuous-integration-and-deployment-with-gitlab-docker-compose-and-digitalocean-6bd6196b502a
## - https://gist.github.com/pixeline/6d57e68aa6c1357b14c14fe8e3b4b963
## - https://itnext.io/lets-dockerize-a-nodejs-express-api-22700b4105e4
## - https://stackoverflow.com/questions/54875585/how-do-i-really-deploy-docker-compose-yml-to-the-cloud
## - https://everythingdevops.dev/how-to-deploy-a-multi-container-docker-compose-application-on-amazon-ec2/
## - AWS Lightsail
##   - https://lightsail.aws.amazon.com/ls/docs/en_us/articles/getting-started-with-amazon-lightsail
##   - https://aws.amazon.com/getting-started/guides/deploy-webapp-lightsail/module-three/
##   - https://github.com/mikegcoleman/todo#docker-containers-with-docker-compose
## - AWS ElasticBeanstalk (EB)
##   - https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/create_deploy_docker.html
##   - https://aws.amazon.com/about-aws/whats-new/2020/10/aws-elastic-beanstalk-support-running-multi-container-applications-al2-based-docker-platform/

DEPLOY_USER=gitlab
DEPLOY_HOST="10.10.10.2" # prod IP

## 1. Create a user for Gitlab worker
## See https://askubuntu.com/a/667842
## NOTE: Password currently not set
useradd -m -s /bin/bash "$DEPLOY_USER"
# usermod -aG wheel "$DEPLOY_USER"

## 2. Let the GitlabCI worker connect as gitlab user
su - "$DEPLOY_USER"
## See https://stackoverflow.com/a/43235320/9788634
ssh-keygen -q -t rsa -N '' -f ~/.ssh/id_rsa <<<y >/dev/null 2>&1
## Optionally specify known hosts that can log in with ssh
# ssh-copy-id "$DEPLOY_USER@$DEPLOY_HOST"
logout
## In DigitalOcean's droplet, we can specify the authorized ssh (public) keys
## that can be used to connect as root.
## We copy these keys to allow us to connect as gitlab user too.
rsync --archive --chown="$DEPLOY_USER":"$DEPLOY_USER" ~/.ssh/authorized_keys /home/"$DEPLOY_USER"/.ssh/authorized_keys

## 3. setup docker-compose
## 3.1 install docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker "$DEPLOY_USER"
systemctl start docker

## 3.2 install compose
sudo curl -L "https://github.com/docker/compose/releases/download/1.25.5/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

## 4. Allow multiple sessions (while deployment here will be lots of non blocking operations)
## Look for "MaxSessions" and set it to 128
sed -i 's/#\?MaxSessions [0-9]\+/MaxSessions 128/g' /etc/ssh/sshd_config
## See https://raspberrypi.stackexchange.com/a/89195
sudo systemctl enable ssh
sudo systemctl restart sshd

## 5. Set up firewall
ufw allow OpenSSH
## Add HTTP(S) to ufw. We must install nginx for that
## https://www.codingforentrepreneurs.com/blog/hello-linux-nginx-and-ufw-firewall
## Do not show kernel update message - https://askubuntu.com/questions/1349884/how-to-disable-pending-kernel-upgrade-message
sed -i "s/#\$nrconf{kernelhints} = -1;/\$nrconf{kernelhints} = -1;/g" /etc/needrestart/needrestart.conf
sudo apt-get install nginx -y
ufw allow "Nginx Full"
ufw --force enable

## 6. Copy the private key and set it to SSH_PROD_SERVER_PRIVATE_KEY or SSH_STAGE_SERVER_PRIVATE_KEY
##    in Gitlab > CI/CD Settings > Variables.
##    This step gives the worker in Gitlab CI the correct ssh key to connect
## NOTE: THIS IS MANUAL STEP!
su - "$DEPLOY_USER"
cat ~/.ssh/id_rsa
logout

## 7. (Optional) Whitelist Gitlab CI IP in the server.
##    If the DigitalOcean's droplet wasn't configured with Gitlab CI's public key,
##    this will insert it.
## NOTE: THIS IS MANUAL STEP!
echo -e "\n<REPLACE_WITH_PUBLIC_KEY>" >> ~/.ssh/authorized_keys
echo -e "\n<REPLACE_WITH_PUBLIC_KEY>" >> /home/"$DEPLOY_USER"/.ssh/authorized_keys

# 8. Once done and you can deploy the project onto remote server,
#    then give it a domain, and head over to `init-letsencrypt.sh`
#    script to set up SSL cert
