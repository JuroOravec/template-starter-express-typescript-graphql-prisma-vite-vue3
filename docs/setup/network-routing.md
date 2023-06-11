# Network routing

We use Nginx for routing incoming HTTP(S) requests.

NOTE: "Incoming" requests may also be coming from the server itself (e.g. a service calling another service).

## Reverse proxy

Reverse proxy routes incoming network requests to specific services. For example, we use it to pass HTTP(S) requests to the Node HTTP server.

## Proxy

### Telemetry proxy

Adblockers prevent sending requests directly from the browser to the ingest URL of the telemetry service provider. To work around it, we use our server as a proxy.

For example, the routes `/_t/e` and `/_t/a` redirect to error tracking ingest ([Sentry](https://sentry.io/)) and analytics ingest ([Mixpanel](https://mixpanel.com/)) respectively.

## Dynamic Nginx configuration

To be able to configure telemetry proxies, we need to pass the Sentry / Mixpanel ingest URLs into the Nginx config.

However, Nginx config is a static file. Hence, we need to "pre-build" the static file config before we can run Nginx in order to dynamically configure the proxies.

We achieve that using the `envsubst` command, which is also used in the `docker-compose.yml`.
That way, we always "pre-build" the nginx config file when we're starting up the services.
