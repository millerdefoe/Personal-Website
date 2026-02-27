# Steam-Inspired Portfolio

React + TypeScript portfolio with AWS-ready static deployment.

## Features

- Public recruiter-facing portfolio pages (Home, Projects, Contact)
- Steam-inspired visual style with custom typography and glass cards
- Amplify-ready frontend deployment config (`amplify.yml`)
- S3 + CloudFront + ACM + Route 53 deployment tutorial and script

## Local Development

1. `npm ci`
2. `npm run dev`

## AWS Deployment

- Frontend hosting option 1: AWS Amplify
- Frontend hosting option 2: S3 + CloudFront + ACM + Route 53
- Detailed steps: `docs/deploy-static-site-s3-cloudfront-route53.md`

## File Map

- Frontend app: `src/`
- Static deploy docs: `docs/deploy-static-site-s3-cloudfront-route53.md`
- Deploy helper script: `deploy.sh`
