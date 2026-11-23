RAIHAN RQR Portfolio — GitHub Pages + Supabase (সম্পূর্ণ ফ্রি)

ফাইল: index.html, admin.html, css/style.css, js/config.js, js/app.js, js/admin.js, assets/hero.jpg, supabase-setup.sql

সেটআপ (একবার)
1. supabase.com-এ ফ্রি অ্যাকাউন্ট → New project।
2. SQL Editor-এ supabase-setup.sql পেস্ট করে Run।
3. Authentication → Users → Add user: আপনার ইমেইল + পাসওয়ার্ড (Auto confirm চালু)।
4. Authentication → Sign In / Providers → "Allow new users to sign up" বন্ধ করুন (জরুরি, নইলে অন্য কেউ অ্যাকাউন্ট খুলে লিখতে পারবে)।
5. Project Settings → API থেকে Project URL ও anon key কপি করে js/config.js-এ বসান।
6. GitHub-এ নতুন repository → সব ফাইল আপলোড → Settings → Pages → Branch: main / root → Save।
7. https://<username>.github.io/<repo>/admin.html এ লগইন করে প্রজেক্ট যোগ করুন।

নোট
- Supabase ফ্রি প্ল্যানে ফাইল সাইজ ও স্টোরেজের সীমা আছে; বড় ভিডিও কম্প্রেস করে আপলোড করুন।
- anon key পাবলিক থাকাই স্বাভাবিক; লেখার অধিকার শুধু লগইন করা অ্যাডমিনের।
- কিছুদিন ব্যবহার না হলে ফ্রি Supabase প্রজেক্ট পজ হতে পারে; ড্যাশবোর্ড থেকে Restore করা যায়।
