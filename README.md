# activity_sns_filter

[![Build Status](https://travis-ci.org/botandrose/activity_sns_filter.svg)](https://travis-ci.org/botandrose/activity_sns_filter)

Node.js HTTP microservice to filter Activity SNS messages by user id

## Background
The Desata project is interested in receiving Activity SNS notifications for the users that have signed up for the app, so that their workout minutes can be tracked and used internally. However, all subscribers to the Nike Activity SNS topic must receive notifications for 100% of the activity events created by everyone. This situation has led to two main issues:
1. Privacy and Legal concerns. The Nike Privacy and Legal departments have expressed concerns that the Desata project is receiving personal information for everyone using the NRC and NTC apps, and the vast majority of those have not signed up for the Desata project, nor accepted the terms and conditions.
2. Higher than necessary traffic. The Desata project is small, and generally only used by people in the Mexico City region. These traffic requirements (and development budget requirements) have led to the choice of Ruby on Rails as the primary web technology for implementing the project. While well-suited for rapid iteration and development in a small team, Rails is not well-suited for handling large quantities of concurrent, short-lived HTTP requests, which is the means by which the Activity SNS topic is currently communicating with it. Moreover, the Desata app is only interested in a fraction of the messages that it is receiving, this fraction being several orders of magnitude less than the total quantity of messages currently received, a level that Rails is more than capable of handling.

These two issues have led directly to the development of this Activity SNS filtering microservice. It can be deployed internally within Nike to address issue #1, and is written in Node.js to address issue #2. 

## Overview
The microservice acts as a HTTP middleman, sitting between the Activity SNS topic and the downstream subscribing app. It contains a whitelist of user ids that the downstream app is interested in, and only forwards the SNS notifications that pertain to a user in that whitelist, while discarding the rest.

The microservice requires the downstream app to have a single url set up for it, both for retrieving the user id whitelist from the downstream app, and for forwarding matching messages onto the downstream app. At bootup - and every 60 seconds thereafter - it performs a GET request to this url, expecting to receive a JSON array of user ids, which it will keep in memory. Whenever a SNS message is received with a user id that is contained in this whitelist, the microservice will forward the message onto that same url via a POST request.

That's it!

## Requirements

Developed with Node.js 12 on Ubuntu 18.04 LTS. Other versions and platforms may also work.

## Installation

Download a copy of the repo and install its dependencies
```bash
git clone https://github.com/botandrose/activity_sns_filter
cd activity_sns_filter
npm install
```
## Deployment

Start the server with `npm start` along with a required environment variable declaring a URL for the subscriber app:
```bash
FORWARD_URL=https://heroes.nike.com/api/users npm start
```

There are also four optional environment variables for further configuration:
* `PORT`: The port that the microservice should bind to. Default: `3000`
* `PATH`: The path that the microservice should accept SNS HTTP messages on. Default: `/`
* `USERNAME`,`PASSWORD`: If present, the HTTP Basic Auth username and password to use for both requests coming from the SNS to the microservice (currently disabled, see bug below), and also the forwarding requests made from the microservice to the subscriber app. Default: none

## Development

1. Make changes
2. Run tests with `npm test`
3. Submit PRs :)

### TODO
* Bugfix: HTTP Basic auth from SNS to microservice is broken, so it is temporarily disabled. Maybe something specific to the `express-basic-auth` package? It worked fine with Rails' basic auth implementation.
* Chore: Implement pending tests for HTTP Basic Auth
* Chore: Implement pending tests for the periodic refreshing of the user id whitelist

### Potential future work:
* Feature: Act as a true HTTP proxy by setting the proper headers
* Feature: Replace HTTP with SQS for better durability and less coupling:

  ```
  Before: SNS -(HTTP)-> Filter -(HTTP)-> App
  After:  SNS -> SQS <- Filter -> SQS <- App
  ```
* Feature: Multi-tenant service instead of a one-off deployment per downstream subscriber app
  
  Generalize further into a multi-tenant SNS filtering service, backed by e.g. Redis sets for persistence, with HTTP REST APIs for registering a new filter and periodically updating it with the latest user id whitelist.
* Feature: Generalize even further by allowing clients to specify arbitrary filtering logic, not just user id set inclusion. Maybe by using something akin to PostgreSQL's JSON query language, or MongoDB's, etc.
* EOL: Could this usecase be adequately handled by a modern HTTP proxy? Maybe this could be implemented in Varnish's VCL, or nginx's configuration language?
