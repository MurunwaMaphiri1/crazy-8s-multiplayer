output "s3_bucket_name" {
  value = aws_s3_bucket.crazy8s_assets.bucket
}

output "cloudfront_domain_name" {
  value = aws_cloudfront_distribution.crazy8s_cdn.domain_name
}
