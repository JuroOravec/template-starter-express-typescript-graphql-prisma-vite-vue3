# Amazon Linux 2
# See https://docs.aws.amazon.com/cli/latest/userguide/getting-started-docker.html
FROM amazon/aws-cli:2.11.20

# Install supercronic
# Latest releases available at https://github.com/aptible/supercronic/releases
ENV SUPERCRONIC_URL=https://github.com/aptible/supercronic/releases/download/v0.2.24/supercronic-linux-amd64 \
  SUPERCRONIC=supercronic-linux-amd64 \
  SUPERCRONIC_SHA1SUM=6817299e04457e5d6ec4809c72ee13a43e95ba41

RUN curl -fsSLO "$SUPERCRONIC_URL" \
  && echo "${SUPERCRONIC_SHA1SUM}  ${SUPERCRONIC}" | sha1sum -c - \
  && chmod +x "$SUPERCRONIC" \
  && mv "$SUPERCRONIC" "/usr/local/bin/${SUPERCRONIC}" \
  && ln -s "/usr/local/bin/${SUPERCRONIC}" /usr/local/bin/supercronic \
  # Install pg_dump
  # To find command to install postgres client, see
  # - https://stackoverflow.com/questions/36881350
  # - https://unix.stackexchange.com/questions/249494
  # - https://stackoverflow.com/questions/49573258
  && amazon-linux-extras install postgresql14 -y \
  # Install gzip for compressing dumps before sending them
  && yum install -y gzip.x86_64

# Override entrypoint set by amazon/aws-cli
ENTRYPOINT []
