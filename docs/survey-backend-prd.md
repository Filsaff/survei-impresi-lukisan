# Product Requirements Document

## Survey Impresi Lukisan Budaya Indonesia

### Scope: Database Architecture & Backend

---

## 1. Tujuan

Sistem ini merupakan backend untuk aplikasi survey impresi terhadap lukisan budaya Indonesia.

Responden akan diberikan sejumlah lukisan dan diminta memilih satu atau beberapa impresi yang mereka rasakan terhadap setiap lukisan.

Tujuan utama sistem adalah:

1. Mengumpulkan data impresi manusia terhadap lukisan.
2. Memastikan satu respondent tidak memberikan penilaian yang sama terhadap lukisan yang sama lebih dari satu kali.
3. Menjaga distribusi jumlah respondent antar-lukisan agar relatif merata.
4. Menghindari konsentrasi lukisan yang sama ketika banyak respondent memulai survey secara bersamaan.
5. Memastikan content dewasa (naked painting) tidak keluar untuk respondent usia kurang dari 18 tahun.
6. Mendukung resume survey apabila respondent berpindah device atau menutup browser sebelum selesai.
7. Menjamin jawaban yang sudah diberikan tidak hilang.
8. Menangani concurrent survey sessions secara aman.
9. Membersihkan reservation yang ditinggalkan agar tidak mengganggu distribusi survey.
10. Menyediakan backend yang sederhana dan efisien untuk deployment menggunakan Next.js/Vercel.
11. Menyimpan gambar lukisan di AWS S3 dan tidak menjadikan Vercel sebagai image proxy.

---

# 2. Scope

Backend harus menangani:

- Respondent
- Painting
- Impression
- Survey session
- Allocation painting ke session
- Penyimpanan answer
- Penyimpanan impression yang dipilih
- Resume session
- Session expiration/abandonment
- Painting reservation
- Distribution/load balancing antar painting
- Concurrent requests saat banyak respondent memulai survey bersamaan
- Survey completion
- Filtering painting berdasarkan usia respondent

Backend tidak bertanggung jawab untuk:

- Image processing berat
- Menyimpan file gambar secara langsung
- Menjadi proxy image dari S3
- UI/frontend survey

---

# 3. Konsep Utama

Sistem membedakan tiga keadaan painting dalam konteks sampling:

### 3.1 Available

Painting:

- belum pernah dijawab oleh respondent tertentu
- tidak sedang reserved oleh active session yang relevan

Painting dapat dipilih untuk session baru.

### 3.2 Reserved

Painting sudah dialokasikan ke suatu `survey_session`, tetapi respondent belum memberikan answer terhadap painting tersebut.

Reservation bersifat sementara.

Reservation berlaku selama session masih valid dan belum melewati `expires_at`.

### 3.3 Answered

Painting sudah benar-benar memiliki answer dari respondent.

Painting yang sudah answered oleh respondent tidak boleh diberikan kembali kepada respondent tersebut.

Penting:

`reserved` bukan berarti `answered`.

Reservation yang expired dan belum memiliki answer harus kembali menjadi kandidat allocation.

---

# 4. Target Dataset

Jumlah painting saat ini sekitar:

**500 paintings**

Jumlah dapat berkembang di masa depan.

Sistem tidak boleh dirancang dengan asumsi jumlah painting selalu tepat 500.

Survey session saat ini menargetkan:

**20 paintings per session**

Nilai ini sebaiknya configurable.

---

# 5. Session Expiration Policy

Setiap `IN_PROGRESS` session memiliki masa berlaku **24 jam**.

Contoh:

```text
started_at = 2026-10-06 13:00
expires_at = 2026-10-07 13:00
```

Selama session belum expired:

- respondent dapat melanjutkan session
- painting yang dialokasikan tetap reserved
- respondent dapat melanjutkan dari device lain

Setelah `expires_at` terlewati dan session belum completed:

```text
IN_PROGRESS
     ↓
ABANDONED
```

Session **tidak dihapus**.

Tujuannya:

- menjaga histori
- menjaga auditability
- mengetahui session yang pernah dibuat
- membedakan answered dengan reserved
- memungkinkan analisis abandonment

Painting yang sudah dijawab tetap dihitung sebagai `answered`.

Painting yang hanya reserved tetapi belum dijawab kembali menjadi kandidat allocation setelah session dianggap abandoned.

---

# 6. Database Entities

Database minimal harus memiliki entity berikut:

1. `respondents`
2. `paintings`
3. `impressions`
4. `survey_sessions`
5. `survey_session_paintings`
6. `survey_answers`
7. `survey_answer_impressions`

Tidak perlu membuat tabel `surveys` untuk saat ini karena aplikasi hanya memiliki satu jenis survey tetap.

Jika desain agent menemukan alasan kuat untuk menambahkan entity lain, jelaskan alasan dan trade-off-nya terlebih dahulu.

---

# 7. Entity: respondents

Merepresentasikan orang yang mengisi survey.

Minimal:

- `id`
- `email`
- data demografis yang diperlukan oleh survey (nama, jenis kelamin, usia, tingkat pendidikan)
- timestamps

Email harus dapat digunakan untuk mengidentifikasi respondent secara unik jika requirement survey menggunakan email sebagai identifier.

Jangan membuat duplicate respondent berdasarkan email.

Usia respondent digunakan sebagai salah satu parameter eligibility terhadap painting yang memiliki content restriction.

---

# 8. Entity: paintings

Menyimpan metadata lukisan.

Minimal:

- `id`
- `title`
- `image_url` atau image key
- metadata/kategori yang diperlukan
- flag/category untuk content dewasa jika diperlukan
- timestamps

Contoh konsep:

```text
is_adult_content = true / false
```

Painting yang ditandai sebagai adult/naked painting hanya boleh dialokasikan kepada respondent dengan usia ≥18 tahun.

Gambar disimpan di AWS S3.

Database hanya menyimpan referensi terhadap gambar, bukan binary image.

Browser sebaiknya mengambil image secara langsung dari S3/CDN, bukan:

```text
Browser → Vercel → S3 → Vercel → Browser
```

---

# 9. Entity: impressions

Menyimpan daftar pilihan impresi yang dapat dipilih respondent.

Contoh:

- tenang
- sedih
- bahagia
- dramatis
- nostalgia
- dll.

Impression harus berupa entity tersendiri agar dapat:

- dihitung
- dianalisis
- digunakan ulang
- memiliki ID stabil
- menghindari string duplication

---

# 10. Entity: survey_sessions

Mewakili satu kali pengerjaan survey.

Minimal memiliki:

- `id`
- `respondent_id`
- `status`
- `started_at`
- `expires_at`
- `completed_at`

Status minimal:

```text
IN_PROGRESS
COMPLETED
ABANDONED
```

Sistem harus mencegah satu respondent memiliki lebih dari satu active `IN_PROGRESS` session pada saat yang sama.

Database-level constraint/index lebih disukai daripada hanya mengandalkan frontend/backend validation.

Contoh konsep:

```text
one respondent
    ↓
maximum one IN_PROGRESS session
```

Session dengan status `ABANDONED` atau `COMPLETED` tidak dianggap active.

---

# 11. Entity: survey_session_paintings

Tabel ini merupakan allocation/assignment antara session dan painting.

Minimal:

- `id`
- `session_id`
- `painting_id`
- `display_order`
- `assigned_at`

Fungsi tabel:

> Menyimpan lukisan apa saja yang diberikan kepada respondent dalam session tertentu.

Tabel ini TIDAK berarti painting sudah dijawab.

Contoh:

```text
Session S001

P001
P002
P003
...
P020
```

Semua painting tersebut telah dialokasikan, tetapi belum tentu semuanya memiliki answer.

Disarankan memiliki unique constraint:

```text
(session_id, painting_id)
```

---

# 12. Entity: survey_answers

Menyimpan bahwa respondent benar-benar telah memberikan jawaban terhadap painting tertentu.

Disarankan answer mengacu ke:

```text
survey_session_paintings.id
```

bukan hanya:

```text
session_id + painting_id
```

Dengan demikian database dapat menjamin answer hanya diberikan terhadap painting yang memang dialokasikan ke session tersebut.

Minimal:

- `id`
- `session_painting_id`
- `answered_at`

Satu `survey_session_painting` maksimal memiliki satu answer.

---

# 13. Entity: survey_answer_impressions

Junction table antara answer dan impression.

Karena satu painting dapat memiliki lebih dari satu impression.

Contoh:

```text
Answer A
 ├── Tenang
 ├── Sedih
 └── Nostalgia
```

Maka:

```text
survey_answer_impressions

answer_id | impression_id
----------|-------------
A         | calm
A         | sad
A         | nostalgia
```

Harus ada unique constraint:

```text
(answer_id, impression_id)
```

untuk mencegah duplicate impression dalam satu answer.

---

# 14. Allocation Logic

Ketika respondent menekan:

**Start Survey**

backend harus membuat atau melanjutkan session.

Jika respondent sudah memiliki:

```text
IN_PROGRESS session
```

dan session belum expired:

> Backend harus mengembalikan session tersebut daripada membuat session baru.

Jika session `IN_PROGRESS` sudah melewati `expires_at`:

```text
IN_PROGRESS
     ↓
ABANDONED
```

Kemudian backend dapat membuat session baru.

Jika tidak ada active session:

1. Buat session.
2. Tentukan eligibility respondent.
3. Cari painting kandidat.
4. Hitung coverage/load score.
5. Exclude painting yang sudah pernah dijawab oleh respondent.
6. Exclude painting yang sedang reserved oleh active session lain jika reservation global diperlukan untuk menjaga distribusi.
7. Prioritaskan painting dengan score paling rendah.
8. Pilih sejumlah painting sesuai session size, default 20.
9. Insert allocation ke `survey_session_paintings`.
10. Return session dan painting allocation.

---

# 15. Painting Eligibility

Sebelum painting masuk ke candidate pool, backend harus mengecek eligibility.

Untuk respondent:

```text
age < 18
```

painting dengan:

```text
is_adult_content = true
```

harus di-exclude.

Untuk respondent:

```text
age >= 18
```

painting adult dapat menjadi candidate normal.

Filtering ini harus dilakukan di backend/database, bukan hanya frontend.

Frontend tidak boleh menerima painting yang tidak eligible hanya untuk kemudian menyembunyikannya.

---

# 16. Coverage Score

Sistem menggunakan konsep weighted coverage untuk membantu pemerataan respondent antar-painting.

Formula:

```text
score = answered_count + (reserved_count × 0.5)
```

Weight:

```text
answered = 1.0
reserved = 0.5
```

Makna:

- `answered` sudah menghasilkan data nyata.
- `reserved` baru berupa allocation sementara dan belum tentu menghasilkan data.
- Karena itu reservation memiliki bobot lebih rendah.

Contoh:

```text
Painting A
answered = 5
reserved = 0

score = 5
```

```text
Painting B
answered = 4
reserved = 2

score = 4 + (2 × 0.5)
      = 5
```

Painting dengan score lebih rendah diprioritaskan.

---

# 17. Score Tidak Perlu Disimpan Permanen

`score` merupakan derived value.

Database sebaiknya menyimpan fakta:

- answers
- sessions
- session paintings

Backend/query menghitung:

```text
answered_count
reserved_count
score
```

saat melakukan allocation.

Jangan membuat `coverage_score` sebagai source of truth kecuali terdapat alasan performa yang kuat.

Untuk dataset sekitar 500 paintings, aggregation query masih diharapkan ringan.

---

# 18. Reservation

Reservation direpresentasikan melalui:

```text
survey_session_paintings
+
survey_sessions.status
+
survey_sessions.expires_at
```

Tidak perlu menambahkan status global pada `paintings`.

Alasannya:

Satu painting dapat:

```text
User A → answered
User B → belum pernah answered
User C → dapat diberikan di masa depan
```

Status allocation bergantung pada respondent/session, bukan status global painting.

Reservation hanya dianggap aktif jika:

```text
session.status = IN_PROGRESS
AND
session.expires_at > NOW()
```

Session yang sudah:

```text
COMPLETED
```

atau:

```text
ABANDONED
```

tidak lagi menghasilkan active reservation.

---

# 19. Reservation Expiration

Reservation memiliki batas waktu mengikuti session.

Default:

**24 jam sejak session dibuat.**

Contoh:

```text
started_at:
2026-10-06 13:00

expires_at:
2026-10-07 13:00
```

Jika respondent menyelesaikan survey sebelum expiration:

```text
IN_PROGRESS
     ↓
COMPLETED
```

Jika respondent tidak menyelesaikan hingga expiration:

```text
IN_PROGRESS
     ↓
ABANDONED
```

Session tidak dihapus.

Painting yang belum memiliki answer kemudian kembali menjadi kandidat allocation.

Penting:

Painting yang sudah dijawab sebelum session abandoned tetap dihitung sebagai `answered`.

Painting yang hanya reserved tetapi tidak pernah dijawab tidak dihitung sebagai `answered`.

---

# 20. Expiration Handling

Sistem tidak harus membutuhkan background worker khusus hanya untuk mengubah session menjadi `ABANDONED`.

Backend dapat memperlakukan session sebagai expired berdasarkan:

```text
status = IN_PROGRESS
AND expires_at <= NOW()
```

ketika melakukan request.

Namun sistem boleh memiliki mekanisme cleanup terjadwal jika diperlukan.

Yang penting:

> Session yang sudah melewati `expires_at` tidak boleh dianggap sebagai active reservation.

Contoh:

```text
Session A
status = IN_PROGRESS
expires_at = kemarin

```

Walaupun field `status` belum diperbarui menjadi `ABANDONED`, query allocation harus memperlakukannya sebagai expired/non-active.

---

# 21. Concurrent Allocation

Concurrency merupakan requirement penting.

Contoh:

10 respondent memulai survey hampir bersamaan.

Sistem TIDAK diharapkan selalu memberikan:

```text
A → P001-P020
B → P001-P020
C → P001-P020
...
```

karena tujuan sistem adalah memperbaiki distribusi jumlah respondent antar painting.

Allocation harus dilakukan secara atomic.

Konsep yang disarankan:

```text
BEGIN TRANSACTION

create/get session

select candidate paintings
    ordered by coverage score
    with appropriate row locking

reserve selected paintings

insert survey_session_paintings

COMMIT
```

PostgreSQL locking seperti:

```sql
FOR UPDATE SKIP LOCKED
```

dapat dipertimbangkan untuk menghindari race condition.

AI agent harus memilih implementasi concurrency yang paling tepat untuk PostgreSQL dan menjelaskan trade-off-nya.

---

# 22. Important Distinction: Respondent vs Global Distribution

Sistem memiliki dua constraint berbeda.

### Personal history

Painting yang sudah dijawab oleh respondent:

```text
EXCLUDE
```

Respondent tidak boleh mendapatkan painting tersebut lagi.

### Global distribution

Painting yang memiliki coverage score rendah:

```text
PRIORITIZE
```

Painting yang sedang reserved oleh active session lain:

```text
AVOID
```

selama mekanisme reservation diperlukan untuk meningkatkan distribusi.

---

# 23. Answer Persistence

Answer harus disimpan setiap kali respondent menekan:

**Next**

Bukan hanya saat respondent menekan:

**Submit Survey**

Flow:

```text
User clicks Next
        ↓
POST answer
        ↓
backend validates
        ↓
save answer
        ↓
save selected impressions
        ↓
success response
        ↓
frontend moves to next question
```

Tujuan:

1. Mencegah kehilangan data.
2. Mendukung resume.
3. Mendukung perpindahan device.
4. Mengetahui progress session secara real-time.

---

# 24. Resume Survey

Jika respondent menutup browser setelah menjawab 8 dari 20 painting:

```text
8 answers
12 unanswered
```

Kemudian membuka aplikasi pada device lain:

```text
GET current session
```

Backend harus dapat menentukan:

```text
active session
current progress
answered paintings
next unanswered painting
```

Respondent harus melanjutkan session yang sama selama session masih valid dan belum expired.

Jika session sudah expired:

```text
IN_PROGRESS
     ↓
ABANDONED
```

Respondent dapat memulai session baru.

Painting yang belum dijawab dari session lama dapat kembali masuk candidate pool.

---

# 25. Answer Idempotency

Endpoint penyimpanan answer harus aman terhadap duplicate request.

Misalnya user menekan Next dua kali atau network retry menyebabkan request dikirim dua kali.

Database harus mencegah:

```text
same session_painting
+
multiple answer records
```

Gunakan unique constraint pada:

```text
survey_answers.session_painting_id
```

dan gunakan upsert/idempotent behavior bila sesuai.

Untuk impressions juga gunakan:

```text
UNIQUE(answer_id, impression_id)
```

---

# 26. API Requirements

Minimal backend endpoint:

### Start / Resume Survey

```http
POST /api/survey/start
```

Behavior:

- identify respondent
- check existing active session
- treat expired session as inactive
- return existing active session if available
- otherwise create new session
- allocate paintings
- return session information and paintings

---

### Get Current Session

```http
GET /api/survey/session/current
```

Return:

- active session
- allocated paintings
- answered state
- progress
- next unanswered painting

Jika session sudah expired:

- jangan mengembalikannya sebagai active session
- session dapat ditandai `ABANDONED`
- frontend dapat mengarahkan respondent untuk memulai session baru

---

### Save Answer

```http
POST /api/survey/answer
```

Payload concept:

```json
{
  "sessionPaintingId": "...",
  "impressionIds": ["...", "..."]
}
```

Behavior:

- validate respondent/session
- validate session belum expired
- validate session painting
- validate painting memang dialokasikan ke session
- validate impression IDs
- create/update answer
- save impressions
- update activity information jika digunakan
- return success/progress

---

### Complete Survey

```http
POST /api/survey/complete
```

Behavior:

- validate session
- validate session belum expired
- validate required answers sesuai business rules
- change session status menjadi `COMPLETED`
- set `completed_at`

Session yang sudah `COMPLETED` tidak boleh menerima answer baru.

---

# 27. Image Architecture

Painting images disimpan di:

**AWS S3**

Database menyimpan:

```text
image_key
```

atau URL/reference yang sesuai.

Image request sebaiknya:

```text
Browser → S3
```

bukan:

```text
Browser → Vercel → S3 → Vercel → Browser
```

Backend tidak boleh menjadi unnecessary image proxy.

Gunakan optimized/compressed image assets agar bandwidth rendah.

---

# 28. Deployment Target

Backend menggunakan:

**Next.js API / Server Functions pada Vercel**

Target awal:

**Vercel Hobby/Free**

Database:

**PostgreSQL / Supabase**

Image storage:

**AWS S3**

Architecture harus menghindari operasi backend yang unnecessarily expensive pada setiap answer.

---

# 29. Performance Requirements

Sistem harus dirancang agar:

- Save answer merupakan operasi ringan.
- Allocation query dapat menangani sekitar 500 paintings.
- Score tidak dihitung ulang pada setiap Next.
- Coverage calculation dilakukan ketika allocation diperlukan.
- Image tidak melewati Vercel.
- Query memiliki index yang sesuai.
- Tidak menggunakan N+1 query pattern.
- Tidak melakukan full-table expensive aggregation pada setiap answer request tanpa alasan.

Dengan target awal sekitar:

```text
500 paintings
20 paintings/session
```

database aggregation terhadap painting coverage diharapkan tetap sederhana.

---

# 30. Suggested Indexing

AI agent harus menentukan index final berdasarkan schema, tetapi minimal pertimbangkan:

```text
survey_sessions(respondent_id)
survey_sessions(status)
survey_sessions(respondent_id, status)
survey_sessions(expires_at)

survey_session_paintings(session_id)
survey_session_paintings(painting_id)

survey_answers(session_painting_id)

survey_answer_impressions(answer_id)
survey_answer_impressions(impression_id)
```

Unique constraints juga harus digunakan pada relationship yang membutuhkan uniqueness.

---

# 31. Data Integrity

Database harus menjadi source of truth.

Frontend tidak boleh dipercaya untuk:

- menentukan painting yang boleh dipilih
- menentukan respondent sudah pernah menjawab atau belum
- menentukan session valid
- menentukan answer valid
- melakukan reservation
- menentukan coverage score
- melakukan filtering adult content

Semua business-critical validation harus berada di backend/database.

---

# 32. Transaction Requirements

Operasi berikut harus atomic:

### Start Survey

```text
create/retrieve session
+
select allocation
+
reserve paintings
+
insert session_paintings
```

Tidak boleh terjadi kondisi:

```text
session created
tetapi paintings gagal di-reserve
```

atau:

```text
paintings sudah dianggap reserved
tetapi session gagal dibuat
```

Gunakan database transaction.

---

# 33. Error Handling

Backend harus menangani:

- duplicate answer
- session expired
- session already completed
- invalid session painting
- invalid impression
- concurrent start
- concurrent answer
- database failure
- network retry
- duplicate request
- respondent tidak eligible untuk painting tertentu

Error response harus konsisten dan mudah ditangani frontend.

---

# 34. Important Non-Goals

Jangan menambahkan kompleksitas berikut tanpa kebutuhan:

- Redis
- message queue
- microservices
- distributed locking service
- materialized coverage table
- persistent score column
- separate survey entity
- image proxy service

Untuk skala awal ±500 paintings dan survey kampus, PostgreSQL transaction + proper indexing sudah menjadi baseline.

Jika agent merasa salah satu komponen diperlukan, agent harus menjelaskan alasan performa/consistency sebelum menambahkannya.

---

# 35. Expected High-Level Flow

```text
RESPONDENT
    │
    │ Start Survey
    ▼
POST /api/survey/start
    │
    ▼
Check active session
    │
    ├── VALID IN_PROGRESS ──────→ Resume
    │
    ├── EXPIRED ────────────────→ Mark/consider ABANDONED
    │
    └── NO ACTIVE SESSION
             │
             ▼
        Create session
             │
             ▼
    Calculate painting coverage
             │
             ├── answered = 1
             └── reserved = 0.5
             │
             ▼
    Filter painting eligibility
             │
             ▼
    Exclude respondent's answered paintings
             │
             ▼
    Avoid active reservations
             │
             ▼
    Select 20 lowest-score paintings
             │
             ▼
    Atomic reservation
             │
             ▼
survey_session_paintings
             │
             ▼
          FRONTEND
             │
             │ Next
             ▼
POST /api/survey/answer
             │
             ▼
survey_answers
             │
             ▼
survey_answer_impressions
             │
             ▼
       Next question
             │
             ▼
          Submit
             │
             ▼
Session = COMPLETED
```

---

# 36. Key Design Principle

Sistem harus memisahkan tiga konsep:

```text
ALLOCATION
"Lukisan ini diberikan kepada respondent."

ANSWER
"Respondent benar-benar memberikan jawaban."

COVERAGE
"Seberapa banyak respondent sudah/akan dialokasikan ke lukisan ini."
```

Ketiganya tidak boleh disamakan.

Selain itu:

```text
RESERVATION
"Lukisan sedang dialokasikan ke session aktif,
tetapi belum menghasilkan data answer."
```

Reservation memiliki lifetime maksimal 24 jam melalui session.

---

# 37. Expected Agent Output

AI agent yang mengimplementasikan requirement ini harus menghasilkan:

1. ERD/database schema.
2. SQL migration.
3. Foreign key dan unique constraints.
4. Index strategy.
5. Transaction strategy untuk concurrent allocation.
6. Backend API design.
7. Request/response types.
8. Validation rules.
9. Allocation algorithm.
10. Resume strategy.
11. Answer idempotency strategy.
12. Session expiration strategy dengan TTL 24 jam.
13. Reservation cleanup/expiration strategy.
14. Adult-content eligibility strategy.
15. Test cases untuk concurrency.
16. Explanation mengenai trade-off desain.

Sebelum melakukan implementasi besar, agent harus terlebih dahulu menjelaskan schema dan allocation strategy untuk direview.

---

# 38. Acceptance Criteria

Sistem dianggap memenuhi requirement apabila:

### AC-01
Respondent baru dapat memulai survey dan memperoleh 20 painting yang eligible.

### AC-02
Respondent tidak mendapatkan painting yang sudah pernah dijawab sebelumnya.

### AC-03
Respondent yang memiliki active session dapat melanjutkan session tersebut.

### AC-04
Session memiliki masa berlaku 24 jam.

### AC-05
Session yang melewati `expires_at` tidak lagi dianggap active.

### AC-06
Session expired dapat berubah menjadi `ABANDONED`.

### AC-07
Reservation dari session expired tidak lagi dihitung sebagai active reservation.

### AC-08
Painting yang hanya reserved tetapi tidak dijawab dapat kembali masuk candidate pool.

### AC-09
Painting yang sudah answered tetap dihitung sebagai answered walaupun session kemudian abandoned.

### AC-10
Jawaban tersimpan setiap kali Next dilakukan.

### AC-11
Jawaban tidak hilang ketika browser ditutup setelah berhasil disimpan.

### AC-12
Respondent dapat melanjutkan survey dari device lain selama session belum expired.

### AC-13
Satu `session_painting` tidak dapat memiliki duplicate answer.

### AC-14
Satu answer tidak dapat memiliki duplicate impression.

### AC-15
Reservation yang expired tidak dianggap sebagai answered.

### AC-16
Answered painting memiliki weight 1.0 dalam coverage score.

### AC-17
Active reservation memiliki weight 0.5 dalam coverage score.

### AC-18
Painting dengan coverage score rendah diprioritaskan.

### AC-19
Painting adult/naked tidak diberikan kepada respondent berusia di bawah 18 tahun.

### AC-20
Concurrent survey starts tidak menghasilkan duplicate allocation akibat race condition.

### AC-21
Session yang completed tidak dapat menerima answer baru.

### AC-22
Image painting tidak di-proxy melalui Vercel.

### AC-23
Allocation dan reservation dilakukan secara atomic.

### AC-24
Database dapat menangani minimal 500 paintings tanpa membutuhkan caching/distributed infrastructure khusus.

---

# 39. Prinsip Akhir

Prioritas desain:

```text
1. Data integrity
2. Sampling/distribution quality
3. Concurrency safety
4. Resume reliability
5. Simplicity
6. Performance
7. Cost efficiency
```

Jangan mengoptimalkan biaya atau jumlah API request dengan mengorbankan data survey.

Simpan answer setiap Next karena data persistence dan resume lebih penting daripada menghemat beberapa API request.

Coverage score hanya perlu dihitung ketika melakukan allocation session baru, bukan pada setiap answer.

Reservation hanya bersifat sementara dan memiliki batas maksimal 24 jam.

Untuk deployment awal, gunakan arsitektur sederhana:

```text
Next.js + Vercel
        │
        ▼
PostgreSQL / Supabase
        │
        └── survey data

Browser
   │
   └──────────────→ AWS S3
                    painting images
```

Desain harus tetap sederhana karena target awal adalah aplikasi survey penelitian dengan sekitar 500 paintings, bukan sistem distributed-scale production.