#!/usr/bin/env bash
# exit immediately on error
set -o errexit

bundle install
bundle exec rails db:migrate
bundle exec rails db:seed
