**QR Based Digital ID & Entry Logging System**

**Deployment Links**

a) Appscript Project : [Appscript Project Link](https://script.google.com/d/1vVVsrbU2lI8FMMBk3scURB4bZysDyS0cIVlqhvE4uPRgKiqX7iVwCQsz/edit?usp=sharing)

b) Deployed Web App: [Deployed Web App Link](https://script.google.com/macros/s/AKfycbwKiUx0f4htjIbP6gyXR2g4B1bUr94Om3T5HL_FTu9fnTyfKu_AONhdF-KmrTh6jeCO-Q/exec)
   Access Admin Panel: [Admin Panel](https://script.google.com/macros/s/AKfycbwKiUx0f4htjIbP6gyXR2g4B1bUr94Om3T5HL_FTu9fnTyfKu_AONhdF-KmrTh6jeCO-Q/exec?mode=admin)
   
c) Netlify Scanner: [Netlify Scanner](https://voluble-dragon-f92f7c.netlify.app/)

d) Google Sheet: [Entry Exit Logger](https://docs.google.com/spreadsheets/d/1730OyL_7h_9Ox8vNsLr9rIfUFWmo7mRkoLKGSj-AAE4/edit?usp=sharing)

e) Drive Folder: [QRs](https://drive.google.com/drive/folders/12Bxh_S5LtP0OdxKwNDS16vqgiN0X78YZ?usp=sharing)

f) Github repository: [Netlify frontend](https://github.com/jaspreetjk20/antbox_frontend)
                      [Primary Github Repo With Codes & Access Links](https://github.com/jaspreetjk20/digital-id-system)

**Problem Statement**
Traditional biometric attendance and manual entry systems often face issues like slow processing, hardware dependency, maintenance costs, duplicate entries, and poor real-time visibility. This project is built to solve this by creating a **QR-powered Digital ID & Entry Logging System** where each user receives a unique QR code and every scan is validated and recorded instantly through a web-based scanner. The system replaces outdated attendance methods with a fast, scalable and admin-friendly solution.

**Features**
a) Core Features
- Unique QR Code generated for every registered user
- Web-based QR scanner using camera access
- Instant scan validation
- IN / OUT attendance toggle system
- Duplicate scan prevention using cooldown logic
- Real-time attendance logging into Google Sheets
- Invalid QR detection

b) Admin Features
- Live attendance dashboard
- Total registered users counter
- Currently IN users count
- Recent activity stream
- Register new users directly from dashboard
- Delete users instantly
- Auto QR generation for new users
- Searchable student registry

c) Advanced Features
- Queue-based background processing
- Batch write optimization
- Concurrency-safe scan handling
- Real-time status updates
- Lightweight cloud deployment

**TECH Stack**
a) Frontend
- HTML / CSS / JavaScript

b) Backend
- Google Apps Script

c) Database
- Google Sheets (Users + Logs + Admins)
- Google Drive (QR Storage)

d) Deployment
- Google Apps Script Web App
- Netlify (Scanner Camera Interface)

e) External APIs / Libraries
- QR Code Generation API
- HTML5 Camera Access

**Architecture Diagram**
![System Design](assets/AntBox%20System%20Design.png)

**Workflow**

**Admin Dashboard Features**
a) Live Dashboard
- Currently IN users
- Total users
- System online status
- Recent activity stream
b) User Management
- Add new users
- Delete users
- Search users
- View QR status
c) QR Operations
- Generate missing QR codes
- Drive linked storage
d) Monitoring
- Real-time attendance visibility
- Fast refresh controls

**Folder Structure**
digital-id-system/
│── admin.html
│── scanner.html
│── Router.gs
│── CoreEngine.gs
│── BackWorker.gs
│── AdminCore.gs
│── IdentityGen.gs
│── config.gs
│── README.md

**Purpose of Files**
1. admin.html → Admin dashboard UI
2. scanner.html → User scanner landing page
3. Router.gs → Route control / page rendering
4. CoreEngine.gs → Main scan validation engine
5. BackWorker.gs → Queue processing worker
6. AdminCore.gs → Dashboard backend functions
7. IdentityGen.gs → QR generation logic
8. config.gs → Constants and IDs

**Challenges Faced**
1. Camera Permissions Restriction
2. Concurrent Delays
3. Google Sheets Write Delays
4. Duplicate Scans







