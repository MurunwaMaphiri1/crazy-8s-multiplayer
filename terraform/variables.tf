variable "aws_region" {
  type = string
  default = "us-east-1"
}

variable "bucket_name" {
  type = string
  default = "crazy8s-card-assets"
}

variable "environment" {
  type    = string
  default = "dev"
}
