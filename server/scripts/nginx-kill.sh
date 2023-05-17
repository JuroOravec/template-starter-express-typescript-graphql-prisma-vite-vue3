#!/bin/bash

# If you're having issue bringing nginx service up
# try this.
# See https://stackoverflow.com/questions/14972792
sudo pkill -f nginx & wait $!
sudo systemctl start nginx