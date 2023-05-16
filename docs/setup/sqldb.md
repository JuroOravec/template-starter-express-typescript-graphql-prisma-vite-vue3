# SQL Database

## Intro

We use PostgreSQL by [Supabase](https://supabase.com/pricing) as the database.

> Why PostgreSQL?
>
> Using a standard relational DB gives a lot of flexibility for future changes.
> As example, if we needed to handle user sessions or auth, we could use
> existing solutions.
>
> Also using SQL DB gives us option to try the Nuxt stack from
> https://sidebase.io/sidebase/welcome/stacks
> where they use Prisma
>

<br/>

> Why Supabase?
>
> 1. AWS RDS starts at $20-30 per month.
> 2. Running own instance of SQL DB presents 2 challenges:
>     1. We'd have to manually make backups and restore DB in case of a crash.
>     2. We'd increase risk of losing data if we ran it on the same
> compute instance as the server, or buy another one just for the DB.
> 3. Supabase offers 2 projects with 500 MB for free.
>
> Hence, at this stage we want to pay as little as possible, so AWS RDS
> is not an option. And for simplicity's sake, Supabase comes as the winner.

## Setup

