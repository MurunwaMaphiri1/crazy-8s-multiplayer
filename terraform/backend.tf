terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
  backend "s3" {
    bucket = "crazy8s-terraform-state"
    key    = "crazy8s/terraform.tfstate"
    region = "us-east-1"
  }
}
