FROM ruby:3.2.4-slim

ENV BUNDLER_VERSION=2.5.17 \
    APP_HOME=/app

RUN apt-get update -y \
  && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    nodejs \
    git \
    curl \
  && rm -rf /var/lib/apt/lists/*

RUN gem install bundler -v "$BUNDLER_VERSION"

WORKDIR $APP_HOME

COPY Gemfile Gemfile.lock ./
RUN bundle install

COPY . .

EXPOSE 3000
CMD ["bash", "-lc", "bundle exec rails server -b 0.0.0.0 -p 3000"]
