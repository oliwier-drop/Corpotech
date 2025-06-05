# Corpotech Website

This repository contains the source code for a simple company website. The project is built using HTML, CSS and JavaScript with a small PHP script that uses [PHPMailer](https://github.com/PHPMailer/PHPMailer) to send contact form submissions via SMTP.

## Setup

1. **Install PHP and Composer** if they are not already available on your system.
2. Install the project dependencies:

   ```bash
   composer install
   ```
3. Copy `.env.example` to `.env` and provide the SMTP credentials used by the contact form:

   ```bash
   cp .env.example .env
   # then edit .env and fill in the values
   ```

## Running the site

Serve the `public` directory with a web server. For local development you can use PHP's built‑in server:

```bash
php -S localhost:8000 -t public
```

Then open `http://localhost:8000` in your browser.

## Project structure

- `public/` – contains all static assets and the `send-email.php` script handling contact form requests.
- `composer.json` – defines PHP dependencies (`phpmailer/phpmailer` and `vlucas/phpdotenv`).

Feel free to customize the site content and styles under `public/`.
