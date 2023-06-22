# Virtual machines

## Intro

## Getting started

### DigitalOcean's droplet

#### Create and configure instance DO droplet

1. Navigate to "Create droplet" flow at <https://cloud.digitalocean.com/droplets/new>

2. Choose Region > Frankfurt data center

3. Choose an image > OS > Ubuntu

4. Choose Size > Droplet Type > SHARED CPU > Basic

5. Choose Size > CPU options > Regular > $4/mo

6. Choose Authentication Method > SSH Key > Select all

7. We recommend these options > Add improved metrics monitoring and alerting (free)

8. We recommend these options > Advanced options > Enable IPv6 (free)

9. We recommend these options > Advanced options > Add Initialization scripts (free)

   - Add all except the last (manual) step from [./server/scripts/setup-container.sh](./server/scripts/setup-container.sh)
     > NOTE: Currently (2023-05-15), it looks like this doesn't work, and we still need to
     > SSH into the server and run the script from within there!

10. Finalize Details > Hostname

    - Prepend with `proj-name--{prod,stg,dev}--`

11. Connect to the vm using the ssh console available via UI. Run the last step of the setup script to get the PRIVATE KEY
    then paste it to Gitlab > CI/CD Settings > Variables > {`SSH_SERVER_PRIVATE_KEY_PROD`, `SSH_SERVER_PRIVATE_KEY_STAGE`}

    ![Gitlab CI variables](./vm-gitlab-variables.png)

12. Open the droplet dashboard URL to get the server's IP. Then, in `gitlab-ci.yml` update {`SERVER_IP_PROD`, `SERVER_IP_STAGE`}.

#### Verify the instance works

1. Note down the IP adress of the created container.

2. On your own machine, load the server's private key (printed in last step of setup script)
   onto the ssh agent.

   ```sh
   echo "-----BEGIN OPENSSH PRIVATE KEY-----
   ...
   -----END OPENSSH PRIVATE KEY-----" | tr -d '\r' | ssh-add - > /dev/null
   ```

3. Try to log in as root

   ```sh
   # ssh -v root@167.99.255.43
   ssh -v root@<CONTAINER IP>
   ```

4. Try to log in as gitlab user

   ```sh
   # ssh -v gitlab@167.99.255.43
   ssh -v gitlab@<CONTAINER IP>
   ```

### AWS Beanstalk

#### Create and configure instance AWS Beanstalk

0. Select "eu-central-1"

1. Select "Create application" in [AWS Beanstalk console](https://eu-central-1.console.aws.amazon.com/elasticbeanstalk/home?region=eu-central-1#/welcome).

2. Select "Web server environment"

   - Why? [See the architecture](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/concepts-webserver.html?icmpid=docs_elasticbeanstalk_console)

3. Configure meaningful App name, env name and domain name, e.g.

   - Application name: `proj-name--prod--v1`
   - Environment name: `proj-name--prod--v1-env`
   - Domain: `proj-name--prod--v1.eu-central-1.elasticbeanstalk.com`

4. Select Platform type `Managed platform`.

5. Application code ??? # TODO

6. Presets ??? # TODO

7. Create EC2 key pair (?)

   - <https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/using-features.managing.security.html#using-features.managing.security.keypair>

8. Don't include Virtual Private Cloud (VPC)

9. Don't include Instance subnets

10. Don't include Database (costs $20-30 / mo)

11. Configure "Security groups" if you need access to other ports than HTTP (80) and HTTPS (443) from outside. [Learn more](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/using-features.managing.ec2.html?icmpid=docs_elasticbeanstalk_console)

12. Auto scaling group - `Single instance` (?)

13. AMI ID - don't change

14. Health reporting - `Enhanced`, but not extra metrics

15. Health event streaming to CloudWatch Logs

    - Log streaming - `Activated`

16. `Managed updates` - OFF

17. Email notifications - your email

## Container registry

Most solutions described above use a docker image to start up services inside virtual machines
on remote servers. These solutions also require that the docker images are hosted somewhere - the hosting place is called image or container registry.

> Why Gitlab container registry?
>
> Gitlab offers whole deployment pipeline for free. Plus the tutorial
> that I was originally following was based on using Gitlab's `gitlab-ci.yml`.
> And Gitlab had container registry included. (at <https://gitlab.com/USERNAME/PROJECT-NAME/container_registry>)

Alternatives:

- [AWS ECR (Elastic Container Registry)](https://aws.amazon.com/ecr/pricing/)
- [Other registries](https://simply-how.com/free-docker-container-registry)

### Cleanup

Sometimes, the server instance might cobble up resources. In such case, follow these instructions.

#### Disk usage

1. Identify the cause of large ([see thread](https://unix.stackexchange.com/questions/113840))

   ```sh
   du -hx --max-depth=1 / | sort -hr
   du -hx --max-depth=1 /var | sort -hr
   ...
   ```

2. [Delete Docker cache](https://forums.docker.com/t/how-to-delete-cache/5753)

   ```sh
   docker system prune -a -f
   docker volume prune -f
   ```

## Recipes

### Connect from your computer to the server

1. Get your computer's public SSH key.

2. Add your public SSH key to the list of allowed hosts on the server:

   1. Log into the server through a different method

   - E.g. if using Digital Ocean, then you can connect as root at
     <https://cloud.digitalocean.com/droplets/DROPLET_ID/access>

   2. Open the file that includes all the allowed keys:

   ```bash
   vi /home/gitlab/.ssh/authorized_keys
   ```

   3. Add (or update if old expired) the public SSH key on a new line and save the file.

3. Try to connect from your computer, e.g. with

   ```bash
   ssh gitlab@api.example.com
   ```
