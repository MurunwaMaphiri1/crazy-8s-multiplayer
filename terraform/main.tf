provider "aws" {
  region = var.aws_region
  profile = "Murunwa-crazy8s"
}

resource "aws_cloudfront_origin_access_control" "crazy8s" {
  name                              = "crazy8s-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "crazy8s_cdn" {
  origin {
    domain_name = aws_s3_bucket.crazy8s_assets.bucket_regional_domain_name
    origin_id   = "s3-crazy8s"
    origin_access_control_id = aws_cloudfront_origin_access_control.crazy8s.id
  }
  enabled = true
  default_cache_behavior {
    target_origin_id = "s3-crazy8s"
    viewer_protocol_policy = "redirect-to-https"
    cached_methods  = ["GET", "HEAD"]
    allowed_methods = ["GET", "HEAD"]
    forwarded_values {
      query_string = false
      cookies { forward = "none" }
    }
  }
  restrictions {
    geo_restriction { restriction_type = "none" }
  }
  viewer_certificate {
    cloudfront_default_certificate = true
  }
}
