# Mailserver

## Intro

We use Amazon SES + [Nodemailer](https://nodemailer.com/usage/) as the mailserver to send emails.

This is a very good and end-to-end tutorial, although
I wasn't following it at first while writing this.

https://blog.tericcabrel.com/send-email-nodejs-handlebars-amazon-ses/

> Why Amazon SES?
>
> We considered several options:
> 1. Run own mailserver instance
>    - This added the complexity of needing to either deploy multiple compute instance (like EC2)
        or deploy the app using docker-compose.
>
>       But docker-compose is not supported everywhere
        unlike docker images, and then the options are pricier.
>
> 2. Use SaaS solution
>    - Ideally something that's free
>
> Option 1. was causing headache, so I went with option 2.
>
> To be frank, I didn't explore SaaS options of like SendGrid and similar.
>
> One downside of using Amazon SES is that there's no EASY way to forward emails
> (e.g. see https://aws.amazon.com/blogs/messaging-and-targeting/forwarding-emails-automatically-based-on-content-with-amazon-simple-email-service/)

## Setup

### Amazon SES

Region Name: `Europe (Stockholm)`<br/>
Region: `eu-north-1`<br/>
Endpoint: `email-smtp.eu-north-1.amazonaws.com`<br/>
Protocol: `SMTP`

- https://moosend.com/blog/free-smtp-server
- https://docs.aws.amazon.com/ses/latest/dg/send-email-smtp.html
- https://docs.aws.amazon.com/general/latest/gr/ses.html
- https://docs.aws.amazon.com/ses/latest/dg/smtp-connect.html
- https://docs.aws.amazon.com/ses/latest/dg/send-email-smtp-client-command-line.html

### Point to Amazon SES in Netlify DNS (MX record)

- https://answers.netlify.com/t/support-guide-how-can-i-receive-emails-on-my-domain/178

### Domain verification for Amazon SES via Netlify DNS

DKIM

- https://docs.aws.amazon.com/ses/latest/dg/creating-identities.html#verify-domain-procedure
- https://eu-north-1.console.aws.amazon.com/ses/home?region=eu-north-1#/verified-identities/example.com?tabId=authentication

![Domain verification (DKIM) for Amazon SES via Netlify DNS](./mailserver-amazonses-netlify-dns-dkim.png)

SFP (To enable MAIL FROM with my own domain)

- https://docs.aws.amazon.com/ses/latest/dg/mail-from.html
- https://docs.aws.amazon.com/ses/latest/dg/send-email-authentication-dmarc.html

![Domain verification (SPF) for Amazon SES via Netlify DNS](./mailserver-amazonses-netlify-dns-spf.png)

### Amazon SES credentials

- https://eu-north-1.console.aws.amazon.com/ses/home?region=eu-north-1#/smtp

### Amazon SES move out of sandbox

- https://docs.aws.amazon.com/ses/latest/dg/request-production-access.html

## Further reading

If you want to learn more about actually running your own mailserver, see below:

- https://github.com/docker-mailserver/docker-mailserver
- https://docker-mailserver.github.io/docker-mailserver/latest/
- Tutorial
  - https://docker-mailserver.github.io/docker-mailserver/latest/usage/
