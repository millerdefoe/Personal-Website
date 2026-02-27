# Deploy a Static Website to AWS (S3 + CloudFront + ACM + Route 53)

This tutorial assumes your static build output is in `./dist`.

## 1) Conceptual Overview

Use this stack because it is secure, fast, and production standard:

1. S3 stores your static files (`index.html`, JS/CSS/assets).
2. CloudFront serves files globally with HTTPS, caching, and edge locations.
3. ACM provides the TLS certificate for your custom domain.
4. Route 53 points your domain to CloudFront (DNS + alias records).

Key design choice: keep S3 private and let only CloudFront read it using **Origin Access Control (OAC)**.

## 2) Prerequisites

1. AWS CLI v2 installed.
2. `aws configure` completed (or IAM role in CI).
3. Domain is in Route 53 (recommended for automated cert validation).
4. Build exists at `./dist`.

### Required IAM permissions

You can use AWS managed policies for quick start:

- `AmazonS3FullAccess`
- `CloudFrontFullAccess`
- `AWSCertificateManagerFullAccess`
- `AmazonRoute53FullAccess`
- `IAMReadOnlyAccess` (optional, for inspection)

Least-privilege action set (minimum practical set):

- S3:
  - `s3:CreateBucket`
  - `s3:PutBucketOwnershipControls`
  - `s3:PutBucketPublicAccessBlock`
  - `s3:PutBucketPolicy`
  - `s3:PutBucketVersioning`
  - `s3:ListBucket`
  - `s3:GetBucketLocation`
  - `s3:PutObject`
  - `s3:DeleteObject`
- CloudFront:
  - `cloudfront:CreateOriginAccessControl`
  - `cloudfront:CreateDistribution`
  - `cloudfront:GetDistribution`
  - `cloudfront:GetDistributionConfig`
  - `cloudfront:UpdateDistribution`
  - `cloudfront:CreateInvalidation`
- ACM:
  - `acm:RequestCertificate`
  - `acm:DescribeCertificate`
  - `acm:ListCertificates`
- Route 53:
  - `route53:ListHostedZonesByName`
  - `route53:GetHostedZone`
  - `route53:ChangeResourceRecordSets`
  - `route53:ListResourceRecordSets`
- STS:
  - `sts:GetCallerIdentity`

## 3) Step-by-Step CLI Deployment

Set variables first:

```bash
export AWS_REGION="us-east-1"
export SITE_DOMAIN="<YOUR_DOMAIN>"          # e.g. example.com
export WWW_DOMAIN="www.<YOUR_DOMAIN>"        # e.g. www.example.com
export BUCKET_NAME="$SITE_DOMAIN"            # bucket matches apex domain
export DIST_DIR="./dist"
export CALLER_REF="deploy-$(date +%s)"
```

### 3a) Create private S3 bucket + secure origin setup

```bash
# Create bucket (us-east-1 has no LocationConstraint)
aws s3api create-bucket --bucket "$BUCKET_NAME" --region us-east-1

# Enforce bucket owner for all objects
aws s3api put-bucket-ownership-controls \
  --bucket "$BUCKET_NAME" \
  --ownership-controls 'Rules=[{ObjectOwnership=BucketOwnerEnforced}]'

# Keep bucket private
aws s3api put-public-access-block \
  --bucket "$BUCKET_NAME" \
  --public-access-block-configuration \
  'BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true'

# Optional: versioning for rollback safety
aws s3api put-bucket-versioning \
  --bucket "$BUCKET_NAME" \
  --versioning-configuration Status=Enabled
```

Create OAC:

```bash
cat > oac-config.json <<'JSON'
{
  "Name": "<YOUR_DOMAIN>-oac",
  "Description": "OAC for static site bucket",
  "SigningProtocol": "sigv4",
  "SigningBehavior": "always",
  "OriginAccessControlOriginType": "s3"
}
JSON

sed -i.bak "s/<YOUR_DOMAIN>/$SITE_DOMAIN/g" oac-config.json

OAC_ID=$(aws cloudfront create-origin-access-control \
  --origin-access-control-config file://oac-config.json \
  --query 'OriginAccessControl.Id' \
  --output text)

echo "OAC_ID=$OAC_ID"
```

### 3b) Upload `./dist` to S3

```bash
aws s3 sync "$DIST_DIR" "s3://$BUCKET_NAME" --delete --acl private
```

Why private? S3 should not be public. CloudFront is the only public entry point.

### 3c) Request ACM cert in **us-east-1** for apex + www

```bash
CERT_ARN=$(aws acm request-certificate \
  --region us-east-1 \
  --domain-name "$SITE_DOMAIN" \
  --subject-alternative-names "$WWW_DOMAIN" \
  --validation-method DNS \
  --query 'CertificateArn' \
  --output text)

echo "CERT_ARN=$CERT_ARN"
```

Get DNS validation CNAMEs:

```bash
aws acm describe-certificate \
  --region us-east-1 \
  --certificate-arn "$CERT_ARN" \
  --query 'Certificate.DomainValidationOptions[].ResourceRecord'
```

### 3d) Create Route 53 validation records

Get hosted zone id for your apex domain:

```bash
HOSTED_ZONE_ID=$(aws route53 list-hosted-zones-by-name \
  --dns-name "$SITE_DOMAIN" \
  --query 'HostedZones[0].Id' \
  --output text | sed 's|/hostedzone/||')

echo "HOSTED_ZONE_ID=$HOSTED_ZONE_ID"
```

If domain is in Route 53, auto-create validation records:

```bash
aws acm describe-certificate \
  --region us-east-1 \
  --certificate-arn "$CERT_ARN" \
  --query 'Certificate.DomainValidationOptions[].ResourceRecord' \
  --output json > validation-records.json

jq -n --argjson records "$(cat validation-records.json)" '{
  Comment: "ACM DNS validation",
  Changes: ($records | map({
    Action: "UPSERT",
    ResourceRecordSet: {
      Name: .Name,
      Type: .Type,
      TTL: 300,
      ResourceRecords: [{Value: .Value}]
    }
  }))
}' > acm-validation-change-batch.json

aws route53 change-resource-record-sets \
  --hosted-zone-id "$HOSTED_ZONE_ID" \
  --change-batch file://acm-validation-change-batch.json
```

Wait until certificate is issued:

```bash
aws acm wait certificate-validated --region us-east-1 --certificate-arn "$CERT_ARN"
```

### 3e) Create CloudFront distribution with OAC + TLS + SPA behavior

Create distribution config:

```bash
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
S3_ORIGIN_DOMAIN="$BUCKET_NAME.s3.$AWS_REGION.amazonaws.com"

cat > cf-distribution-config.json <<JSON
{
  "CallerReference": "$CALLER_REF",
  "Comment": "Static site for $SITE_DOMAIN",
  "Enabled": true,
  "PriceClass": "PriceClass_100",
  "Aliases": {
    "Quantity": 2,
    "Items": ["$SITE_DOMAIN", "$WWW_DOMAIN"]
  },
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "s3-origin-$BUCKET_NAME",
        "DomainName": "$S3_ORIGIN_DOMAIN",
        "S3OriginConfig": {
          "OriginAccessIdentity": ""
        },
        "OriginAccessControlId": "$OAC_ID"
      }
    ]
  },
  "DefaultRootObject": "index.html",
  "DefaultCacheBehavior": {
    "TargetOriginId": "s3-origin-$BUCKET_NAME",
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": {
      "Quantity": 2,
      "Items": ["GET", "HEAD"],
      "CachedMethods": {
        "Quantity": 2,
        "Items": ["GET", "HEAD"]
      }
    },
    "Compress": true,
    "CachePolicyId": "658327ea-f89d-4fab-a63d-7e88639e58f6",
    "ResponseHeadersPolicyId": "67f7725c-6f97-4210-82d7-5512b31e9d03"
  },
  "CustomErrorResponses": {
    "Quantity": 2,
    "Items": [
      {
        "ErrorCode": 403,
        "ResponsePagePath": "/index.html",
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 0
      },
      {
        "ErrorCode": 404,
        "ResponsePagePath": "/index.html",
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 0
      }
    ]
  },
  "ViewerCertificate": {
    "ACMCertificateArn": "$CERT_ARN",
    "SSLSupportMethod": "sni-only",
    "MinimumProtocolVersion": "TLSv1.2_2021",
    "Certificate": "$CERT_ARN",
    "CertificateSource": "acm"
  }
}
JSON

DIST_ID=$(aws cloudfront create-distribution \
  --distribution-config file://cf-distribution-config.json \
  --query 'Distribution.Id' \
  --output text)

CF_DOMAIN=$(aws cloudfront get-distribution --id "$DIST_ID" --query 'Distribution.DomainName' --output text)

echo "DIST_ID=$DIST_ID"
echo "CF_DOMAIN=$CF_DOMAIN"
```

Now allow this CloudFront distribution to read S3 objects:

```bash
cat > bucket-policy.json <<JSON
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontServicePrincipalReadOnly",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::$BUCKET_NAME/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::$ACCOUNT_ID:distribution/$DIST_ID"
        }
      }
    }
  ]
}
JSON

aws s3api put-bucket-policy --bucket "$BUCKET_NAME" --policy file://bucket-policy.json
```

### 3f) Create Route 53 alias to CloudFront

CloudFront hosted zone id is always `Z2FDTNDATAQYW2`.

```bash
cat > alias-records.json <<JSON
{
  "Comment": "Alias apex/www to CloudFront",
  "Changes": [
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "$SITE_DOMAIN",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "Z2FDTNDATAQYW2",
          "DNSName": "$CF_DOMAIN",
          "EvaluateTargetHealth": false
        }
      }
    },
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "$WWW_DOMAIN",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "Z2FDTNDATAQYW2",
          "DNSName": "$CF_DOMAIN",
          "EvaluateTargetHealth": false
        }
      }
    }
  ]
}
JSON

aws route53 change-resource-record-sets \
  --hosted-zone-id "$HOSTED_ZONE_ID" \
  --change-batch file://alias-records.json
```

### 3g) Invalidate CloudFront after deploy

```bash
aws cloudfront create-invalidation --distribution-id "$DIST_ID" --paths "/*"
```

## 4) `deploy.sh` (idempotent, safe)

Create this script in project root:

```bash
cat > deploy.sh <<'BASH'
#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   BUCKET_NAME=example.com CF_DIST_ID=E123ABC ./deploy.sh
# Optional:
#   DIST_DIR=./dist RELEASES_DIR=./releases INVALIDATE_PATHS="/*" ./deploy.sh

DIST_DIR="${DIST_DIR:-./dist}"
RELEASES_DIR="${RELEASES_DIR:-./releases}"
BUCKET_NAME="${BUCKET_NAME:-}"
CF_DIST_ID="${CF_DIST_ID:-}"
INVALIDATE_PATHS="${INVALIDATE_PATHS:-/*}"

if [[ -z "$BUCKET_NAME" || -z "$CF_DIST_ID" ]]; then
  echo "ERROR: BUCKET_NAME and CF_DIST_ID are required."
  echo "Example: BUCKET_NAME=example.com CF_DIST_ID=E123ABC ./deploy.sh"
  exit 1
fi

if [[ ! -d "$DIST_DIR" ]]; then
  echo "ERROR: DIST_DIR not found: $DIST_DIR"
  exit 1
fi

# Timestamped release snapshot for rollback/debug visibility
STAMP="$(date +%Y%m%d-%H%M%S)"
RELEASE_PATH="$RELEASES_DIR/$STAMP"
mkdir -p "$RELEASE_PATH"
cp -R "$DIST_DIR"/. "$RELEASE_PATH"/

echo "[1/3] Syncing static assets to s3://$BUCKET_NAME (private objects)..."
# Keep objects private: CloudFront (via OAC) is the only public access path.
# --delete keeps bucket in sync with current dist output.
aws s3 sync "$DIST_DIR" "s3://$BUCKET_NAME" --delete --acl private

echo "[2/3] Creating CloudFront invalidation..."
aws cloudfront create-invalidation \
  --distribution-id "$CF_DIST_ID" \
  --paths "$INVALIDATE_PATHS" >/dev/null

echo "[3/3] Done. Release snapshot: $RELEASE_PATH"
echo "Tip: for hashed assets, invalidate only /index.html instead of /*"
BASH

chmod +x deploy.sh
```

When to invalidate only `index.html`:

- If JS/CSS filenames are content-hashed (e.g., `app.abc123.js`), old assets can stay cached.
- Usually only `index.html` needs invalidation because it references new hashed files.

## 5) Security Best Practices

1. Keep S3 Block Public Access fully enabled.
2. Use CloudFront OAC, not public bucket website hosting.
3. Never hardcode AWS keys in scripts or repo.
4. Use `aws configure` locally or IAM roles in CI/CD.
5. Scope IAM permissions to this site resources where possible.
6. Enable CloudTrail and billing alarms.

## 6) Cost + Common Gotchas

1. ACM certificate for CloudFront must be in `us-east-1`.
2. Route 53 hosted zone has monthly cost + query costs.
3. CloudFront invalidations: first 1,000 paths/month free, then charged.
4. Frequent full invalidations (`/*`) can cost money and slow deploy flow.
5. Browser cache can still serve old JS if `index.html` wasn’t refreshed.

## 7) Quick Troubleshooting Q&A

### Q: ACM cert stays `PENDING_VALIDATION`
- Check CNAME validation records exist exactly and at correct hosted zone.
- Verify domain is managed in the same AWS account/Route 53 zone you updated.

### Q: CloudFront returns 403
- Usually bucket policy/OAC mismatch.
- Confirm bucket policy `AWS:SourceArn` points to the correct distribution id.
- Confirm object exists and key path is correct.

### Q: SPA deep route (`/projects/abc`) gives 404
- Ensure CloudFront custom error responses map 403/404 to `/index.html` with `200`.

### Q: Browser still loads old JS
- Invalidate `index.html` (or `/*`), hard refresh, and ensure hashed asset filenames.

## 8) Optional: Minimal CloudFormation Snippet

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Description: Minimal static site (S3 + CloudFront + Route53 alias)
Parameters:
  DomainName:
    Type: String
  CertificateArn:
    Type: String # Must be us-east-1 ACM cert ARN for CloudFront
Resources:
  SiteBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: !Ref DomainName
      PublicAccessBlockConfiguration:
        BlockPublicAcls: true
        BlockPublicPolicy: true
        IgnorePublicAcls: true
        RestrictPublicBuckets: true
  # Add CloudFront Distribution + OAC + bucket policy + Route53 Alias in full template for production.
```

## 9) Official Docs

- S3 static website hosting concepts: https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html
- CloudFront with private S3 origin (OAC): https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html
- ACM DNS validation: https://docs.aws.amazon.com/acm/latest/userguide/dns-validation.html
- Route 53 alias to CloudFront: https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/routing-to-cloudfront-distribution.html
- CloudFront invalidation: https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Invalidation.html

---

## Final Verification Checklist (Live + Secure)

1. `https://<YOUR_DOMAIN>` loads via CloudFront with valid HTTPS cert.
2. `https://www.<YOUR_DOMAIN>` also loads and resolves to same distribution.
3. S3 bucket is private and Block Public Access is ON.
4. CloudFront can read S3 via OAC (site loads, no 403).
5. SPA routes load directly (403/404 rewrite to `index.html` works).
6. New deploy + invalidation shows fresh content.
