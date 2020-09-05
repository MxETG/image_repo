# Shopify Project: Image Repo
Project link: http://104.154.66.126:8000/ (domain not set up).

This shopify project is based on the react-photo-gallery template.
Features added:
1. Upload images.
2. Search images based on images' characteristics.

Other features that can be added:
1. Delete exisiting images.
2. Introduce user/login system to do the access control.
3. Multiple images uploading.
4. Search similar images.

# Project outline:
## Data Storage:
1. Image info storage(including image size and tags): IBM cloudant NoSQL
2. Image file storage: Google cloud storage

## Image Classification:
Google Cloud Vision LabelDetect

## Image Search:
IBM Cloudant Query (ES based)

## Deployment:
Google Cloud Compute Engine
