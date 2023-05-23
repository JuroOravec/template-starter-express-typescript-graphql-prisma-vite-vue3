# Security

## Access

Head over to [Virtual Machine (server env)](./vm.md) to learn about how SSH
is configured to limit access only to known and permitted users / machines.

## Exposure

Generally, if we don't HAVE to expose something to the world, we SHOULDN'T.
Here's an overview of which services listen on which ports:

- Nginx
  - 80 (HTTP)
  - 443 (HTTPS)
- PostgreSQL
  - 5432
- Node HTTP Server
  - 3000
- Node SMTP Server
  - 25 (SMTP)
- (not used) Mailserver
  - 25 (SMTP)
  - 143 (IMAP4)
  - 465 (ESMTP)
  - 587 (ESMTP)
  - 993 (IMAP4)

#### Updates

To minimize exposure...

- PostgreSQL is accessible only from server instance
- Node HTTP Server is accessible only via nginx

Learn more:

- <https://stackoverflow.com/questions/22100587>
- <https://www.digitalocean.com/community/tutorials/how-to-secure-postgresql-against-automated-attacks>
- <https://serverfault.com/questions/247176>

## Env vars

You can find configuration being set at different levels:

1. Inside the application, like the `config.ts` file in Node server.
2. Upstream of that in `docker-compose.yml` in `environment` field for given service.
3. Upstream of that in `.env` file that's passed to the `docker-compose.yml` file.
4. Upstream of that in `gitlab-ci.yml` scripts.
5. Upstream of that in Gitlab CI/CD env variables section.

So what should be set where?

General rules are:

1. If it's a secret, move it to Gitlab CI/CD env variables.

   By secret, we mean password or token or login name/email - AKA piece of info
   that can contribute to gaining access to some parts of the system.

   NOTE: This is not a foolproof protection, because the deployed instance
   might still expose this info in its `.env` file. The only benefit of this
   approach is to 1) keep the info out of version control, 2) limit
   the number of events where the info is being exposed.

   If we wanted a safer way of handling secrets, we'd probably want to:

   1. Keep the secrets in secrets manager (never copy them to `.env` file).
   2. Request secrets over private network.
   3. Rotate secrets often.
   4. Split out services to own instances to limit privilege spillover - E.g.
      we should move database to own server instance, so that if someone gets
      access to either node server or db instances, they won't be able to affect
      the other instance.

2. Use `gitlab-ci.yml` (+ `gitlab-ci.sh` script) only if you need to:

   1. Capture Gitlab env variables.
   2. Do some additional logic to create the env variables.

      Example of this is the `SERVER_DB_URL` env var, which we put together from
      other env vars. Neither of the downstream steps, `docker-compose.yml` nor `.env`,
      allow for running logic required to put the `SERVER_DB_URL` together, so it's
      done in `gitlab-ci.yml`.

   Otherwise, try to keep `gitlab-ci.yml` clean, as it's main purpose is the definition
   of the deployment steps.

3. Define values in `.env` files only if:

   1. It's not a secret
   2. The values are either shared by multiple services, OR by single service where this
      service doesn't have a dedicated config file, so it has to be set via env vars.

4. Avoid defining env vars in `docker-compose.yml`. This file is about configuring
   the services and their relationships, so we want to keep it clean of additional logic.

   If you feel like a variable should be set here, it should likely go either upstream
   (`.env` file) or downstream (app-level logic).

5. If some options consider only single service, and previous points above are not violated,
   then the values should probably go into the app-level logic.

> Food for thought:
>
> Where should we set variables for the cron service, like the S3 bucket?
>
> - We build the service's image ourselves, so we can include the env vars
>   in the code itself
> - HOWEVER, if we instead define it upstream, e.g. `.env` file, then we can
>   configure the cron service without having to rebuild it.
> - HENCE, in this case we consider the cron service as a black box, and we
>   decide to pass such variables via `.env` file.
