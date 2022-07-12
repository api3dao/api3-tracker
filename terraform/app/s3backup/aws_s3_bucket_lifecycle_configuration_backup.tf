resource "aws_s3_bucket_lifecycle_configuration" "backup" {
  bucket = aws_s3_bucket.backup.id

  rule {
    id      = "expiration"
    expiration {
      days = var.expiration
    }

    status  = "Enabled"
  }
}

