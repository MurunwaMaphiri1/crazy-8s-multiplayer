resource "aws_s3_bucket" "crazy8s_assets" {
  bucket = var.bucket_name
}

resource "aws_s3_bucket_public_access_block" "crazy8s_assets" {
  bucket = aws_s3_bucket.crazy8s_assets.bucket
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

data "aws_caller_identity" "current" {}

resource "aws_s3_bucket_policy" "crazy8s_assets" {
  bucket = aws_s3_bucket.crazy8s_assets.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "AllowCloudFrontServicePrincipal"
        Effect    = "Allow"
        Principal = { Service = "cloudfront.amazonaws.com" }
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.crazy8s_assets.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.crazy8s_cdn.arn
          }
        }
      }
    ]
  })

  depends_on = [aws_s3_bucket_public_access_block.crazy8s_assets]
}
