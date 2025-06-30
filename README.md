

# **Sitara Frontend – Cloudscape UI + AWS Deployment**

**Live Site**: [https://d2v1pfi3qzvh02.cloudfront.net/](https://d2v1pfi3qzvh02.cloudfront.net/)

---

## 🧩 **Overview**

Sitara is a modern frontend web application built using **React** and **AWS Cloudscape Design System**, designed to deliver a clean, responsive, and intuitive interface for intelligent support case management.

---

## 🎨 **Cloudscape Design System**

**Cloudscape** is AWS's open-source UI library for building web apps that align with AWS console standards.

### 🔧 Key Cloudscape Packages Used

* `@cloudscape-design/components`: Core UI components (Buttons, Layouts, Alerts)
* `@cloudscape-design/chat-components`: Chat UI for AI interactions
* `@cloudscape-design/design-tokens`: AWS design tokens (color, spacing, etc.)
* `@cloudscape-design/global-styles`: Base styling

### 🧱 Notable Components

* **AppLayout** – Primary app container shell
* **FileUpload + ProgressBar** – Secure upload flow with real-time status
* **Chat Interface** – Integrated with AI backend using Cloudscape's chat UI
* **Alert, Header, SpaceBetween, Container** – Used for layout, feedback, and structure

---

## ☁️ **Deployment on AWS**

### 🔨 **1. Build the App**

```bash
npm run build
```

* Produces optimized static assets in the `build/` directory

---

### 🗂️ **2. Upload to S3**

* Upload all files in `build/` to your S3 bucket
* Enable **Static Website Hosting** in S3 settings
* Set index document to `index.html`
* Optional: add error document as `index.html` for SPA routing

**Example Bucket Policy for Public Read-Only:**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

---

### 🌍 **3. Connect CloudFront**

* Create a CloudFront distribution with:

  * Origin: Your S3 bucket
  * Behaviors: Route all paths to `index.html` (for SPAs)
  * Enable HTTPS (via default CloudFront SSL or custom domain/certificate)
* (Optional) Add a custom domain via Route 53 or external DNS provider

---

## 🔧 **Environment Variables**

Define the following in `.env`:

```env
REACT_APP_API_URL=https://your-api-gateway-url
```

---

## ✅ **Deployment Summary**

| Component | Technology                   |
| --------- | ---------------------------- |
| Frontend  | React + Cloudscape           |
| Hosting   | Amazon S3                    |
| CDN       | CloudFront                   |
| SSL       | Enabled via CloudFront       |
| API Comm  | RESTful APIs via API Gateway |
| Uploads   | Presigned S3 URLs            |

---

## 📦 **Benefits**

* **Enterprise-grade UI** with Cloudscape
* **Highly scalable & global delivery** with CloudFront
* **Secure uploads** using presigned URLs
* **Optimized SPA routing** with S3 + CloudFront error redirects
