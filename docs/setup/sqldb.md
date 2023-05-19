# SQL Database

## Intro

We use PostgreSQL docker image as the database.

> Why PostgreSQL?
>
> Using a standard relational DB gives a lot of flexibility for future changes.
> As example, if we needed to handle user sessions or auth, we could use
> existing solutions.
>
> Also using SQL DB gives us option to try the Nuxt stack from
> https://sidebase.io/sidebase/welcome/stacks
> where they use Prisma.

<br/>

> Runner up - [Supabase](https://supabase.com/pricing)?
>
> Before deciding with own instance of PostgreSQL, I was considering Supabase,
> because they offer 2x 500 MB databases for free.
>
> Supabase was an interesting choice, because:
>
> 1. AWS RDS starts at $20-30 per month.
> 2. Supabase offers 2 projects with 500 MB for free.
> 3. Running own instance of SQL DB presents 2 challenges:
>     1. We have to manually make backups and restore DB in case of a crash.
>        - HOWEVER, Supabase offers auto-backups for $25/mo tier only.
>        - AND in the end we implemented backups for own instance anyway.
>     2. We increase risk of losing/exposing data if we ran it on the same compute
>     instance as the server. Or we'd have to buy another instance just for the DB.

## Setup

### Database backup

To run regular backups of the DB, we run this setup:

1. Docker container with [cron](https://en.wikipedia.org/wiki/Cron) capabilities ([supercronic](https://github.com/aptible/supercronic))
2. Every night, cron triggers a script that runs [pg_dump](https://www.postgresql.org/docs/current/app-pgdump.html) against the DB. This creates a db backup file in the runner container.
3. The exported db backup file is subsequently uploaded to cloud storage (see below).

Learn more:
- https://www.vinchin.com/en/blog/how-to-backup-and-restore-postgresql-database-tools-and-steps.html
- https://arctype.com/blog/backup-postgres-database/

### Database backup storage (AWS S3)

Use AWS S3 to store database backups.

Relevant tutorials

- https://www.vinchin.com/en/blog/how-to-backup-and-restore-postgresql-database-tools-and-steps.html
- https://arctype.com/blog/backup-postgres-database/
- https://adamtheautomator.com/upload-file-to-s3/

#### 1. Create new S3 bucket

1. Name it accoding to the domain, e.g. `domain.com`.

#### 2. Create user in IAM that has read/write access ONLY to the given bucket or subdirectory

1. Name it e.g. `domain-db-backup--prod`

   See

   - https://repost.aws/knowledge-center/s3-console-access-certain-bucket

2. Create user group tha the user belongs to

Name it e.g. `domain-db-backup--prod`

3. Create custom policy to scope access ONLY to our S3 bucket. Specifically,
   give access ONLY to the directory with DB backups for specific environment (prd).

This means that, if you want to add a new environment, or make backups for
other services, you should create new users + user groups for those scenarios
only.

Name it e.g. `domain-db-backup--prod`

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowAccessOnlyInDomainPrdDbBackup",
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:GetObjectVersion", "s3:PutObject", "s3:PutObjectTagging"],
      "Resource": ["arn:aws:s3:::domain.com/backup/prd/postgres/*"]
    },
    {
      "Sid": "AllowListBucketOnlyInDomainPrdDbBackup",
      "Effect": "Allow",
      "Action": ["s3:ListBucket", "s3:ListBucketVersions"],
      "Resource": ["arn:aws:s3:::domain.com"],
      "Condition": {
        "StringLike": {
          "s3:prefix": ["backup/prd/postgres/*"]
        }
      }
    }
  ]
}
```

4. Get user's access keys.

   See

   - https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/getting-your-credentials.html
   - https://docs.aws.amazon.com/cli/latest/userguide/cli-authentication-user.html

5. Store the data in your password manager as AWS_S3_BACKUP_DB_KEY_PROD and AWS_S3_BACKUP_DB_PWD_PROD.

   These env vars will be passed from Gitlab's CI to docker-compose to container that does DB backups.

   See

   - https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-envvars.html

#### 3. Check that crontab backs up the DB

```sh
docker-compose up -d
docker exec -it server-cron-1 bash
# In container
aws sts get-caller-identity # Verify we can connect to AWS with credentials
# Run postgres-backup.sh script.
...
```

Then check the S3 bucket.

![sqldb-backup-storage-aws-s3.png](sqldb-backup-storage-aws-s3.png)

### Database backup storage expiry (AWS S3)

The backups should be set up to expire after some time to be smart with resources.

#### 1. Set up expiration tags & their expiration lifecycles on AWS S3

Follow this guide https://stackoverflow.com/a/75059780/9788634

![sqldb-backup-storage-expiry-aws-s3.png](sqldb-backup-storage-expiry-aws-s3.png)

#### 2. Tag uploaded backups with expiration tags

The `postgres-backup.sh` script accepts a positional arg to specify expiration tag.

By assigning these tags, we specify when the given object should expire.

See https://docs.aws.amazon.com/cli/latest/reference/s3api/put-object-tagging.html.
