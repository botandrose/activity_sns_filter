# activity_sns_filter
Node.js HTTP microservice proxy to filter Activity SNS messages by user id

## Background
The Desata project is interested in receiving Activity SNS notifications for the users that have signed up for the app, so that their workout minutes can be tracked and used internally. However, all subscribers to the Nike Activity SNS topic must receive notifications for 100% of the activity events created by everyone. This situation has led to two main issues:
1. Privacy and Legal concerns. The Nike Privacy and Legal Departments have expressed concerns that the Desata project is receiving personal information for everyone using the NRC and NTC app, and the majority of those have not signed up for the Desata project, nor accepted the terms and conditions.
2. Higher than necessary traffic. The Desata project is small, and generally only used by people in the Mexico City region. These traffic requirements (and development budget requirements) have led to the choice of Ruby on Rails as the primary web technology for implementing the project. While well-suited for rapid iteration and development in a small team, Rails is not well-suited for handling large quantities of concurrent, short-lived HTTP requests, which is the means by which the Activity SNS topic is currently communicating with it. Moreover, the Desata app is only interested in a fraction of the messages that it is receiving, this fraction being several orders of magnitude less than total the quantity of messages currently received, and Rails is more than capable of handling that level of traffic.

These two issues have led directly to the development of this Activity SNS filtering microservice. It can be deployed internally within Nike to address issue #1, and is written in Node.js to address issue #2. 

## Overview
This filter app acts as a HTTP middleman, sitting between the Activity SNS topic and the downstream subscribing app. It contains a whitelist of user ids that the downstream app is interested in, and only forwards the SNS notifications that pertain to a user in that whitelist, while discarding the rest.

The filter app requires the downstream app to have a single url set up for it, both for retreiving the user id whitelist from the downstream app, and for forwarding matching messages onto the downstream app. At bootup, and every 60 seconds thereafter, it performs a GET request to this url, expecting to receive a JSON array of user ids, which it will keep in memory. Whenever a SNS message is received with a user id that is contained in this whitelist, the filter app will forward the message onto that same url via a POST request.

That's it!

## Requirements

Developed with Node 12 on Ubuntu 18.04 LTS. Other versions may work.

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
$ FORWARD_URL=https://heroes.nike.com/api/users npm start
```

There are also four optional environment variables for further configuration:
* `PORT`: The port that the filter app should bind to. Default: `3000`
* `PATH`: The path that the filter app should accept SNS HTTP messages from. Default: `/`
* `USERNAME`,`PASSWORD`: If present, the HTTP Basic Auth username and password to use for both requests coming from the SNS to the filter app (currently disabled, see bug below), and also the forwarding requests made from the filter app to the subscriber app. Default: none

## Development

1. Make changes
2. Run tests with `npm test`
3. Submit PRs :)

### TODO
* Bugfix: HTTP Basic auth from SNS to microservice is broken, so it is temporarily disabled. Something specific to `express-basic-auth` package? Worked fine in Ruby.
* Chore: Implement pending tests for HTTP Basic Auth and periodic refreshing of the user id whitelist.

### Potential future work:
* Feature: Replace HTTP with SQS for better durability and less coupling:

  ```
  Before: SNS -(HTTP)-> Filter -(HTTP)-> App
  After:  SNS -> SQS <- Filter -> SQS <- App
  ```
* Feature: Multi-tenant service instead of a one-off deployment per subscriber

  Generalize further into a multi-tenant SNS filtering microservice, backed by Redis sets for persistence, with HTTP REST APIs for registering a new filter and periodically updating it with the latest user id whitelist.