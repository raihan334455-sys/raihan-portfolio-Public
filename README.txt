RAIHAN RQR Portfolio — GitHub Pages + Supabase (completely free)

Files: index.html, admin.html, css/style.css, js/config.js, js/app.js, js/admin.js, assets/hero.jpg, supabase-setup.sql

Setup (one time)
1. Create a free account at supabase.com, then New project.
2. In SQL Editor, paste supabase-setup.sql and Run.
3. Authentication > Users > Add user: your email + password (turn on Auto confirm).
4. Authentication > Sign In / Providers: keep Email enabled, but turn OFF "Allow new users to sign up" (important, otherwise anyone can create an account and write).
5. Copy the Project URL and publishable key into js/config.js.
6. Create a GitHub repository, upload all files, then Settings > Pages > Branch: main / root > Save.
7. Log in at https://<username>.github.io/<repo>/admin.html and add your projects.

Notes
- The free Supabase plan has storage and file size limits; compress big videos before uploading.
- The publishable key is meant to be public; only the logged-in admin can write.
- A free Supabase project may pause if unused for a while; restore it from the dashboard.
