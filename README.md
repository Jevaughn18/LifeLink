
<img width="1440" height="810" alt="Screenshot 2025-08-20 at 11 38 31 PM" src="https://github.com/user-attachments/assets/c2893fad-a454-4991-a7b1-d3a20897a11b" />



📖 Overview

A healthcare patient management application that allows patients to easily register, book, and manage their appointments with doctors, featuring administrative tools for scheduling, confirming, and canceling appointments, along with SMS notifications, all built using Next.js.

⚙️ Tech Stack
Next.js
Appwrite
Typescript
TailwindCSS
ShadCN
Twilio

🔋 Features
👉 Register as a Patient: Users can sign up and create a personal profile as a patient.

👉 Book a New Appointment with Doctor: Patients can schedule appointments with doctors at their convenience and can book multiple appointments.

👉 Manage Appointments on Admin Side: Administrators can efficiently view and handle all scheduled appointments.

👉 Confirm/Schedule Appointment from Admin Side: Admins can confirm and set appointment times to ensure they are properly scheduled.

👉 Cancel Appointment from Admin Side: Administrators have the ability to cancel any appointment as needed.

👉 Send SMS on Appointment Confirmation: Patients receive SMS notifications to confirm their appointment details.

👉 Complete Responsiveness: The application works seamlessly on all device types and screen sizes.

👉 File Upload Using Appwrite Storage: Users can upload and store files securely within the app using Appwrite storage services.

👉 Manage and Track Application Performance Using Sentry: The application uses Sentry to monitor and track its performance and detect any errors.

and many more, including code architecture and reusability

🤸 Quick Start
Follow these steps to set up the project locally on your machine.

Prerequisites

Make sure you have the following installed on your machine:

Git
Node.js
npm (Node Package Manager)
Cloning the Repository

git clone git@github.com:Jevaughn18/LifeLink.git
cd lifelink
Installation

Install the project dependencies using npm:

npm install
Set Up Environment Variables

Create a new file named .env.local in the root of your project and add the following content:

#APPWRITE
NEXT_PUBLIC_ENDPOINT=https://cloud.appwrite.io/v1
PROJECT_ID=
API_KEY=
DATABASE_ID=
PATIENT_COLLECTION_ID=
APPOINTMENT_COLLECTION_ID=
NEXT_PUBLIC_BUCKET_ID=

NEXT_PUBLIC_ADMIN_PASSKEY=111111
Replace the placeholder values with your actual Appwrite credentials. You can obtain these credentials by signing up on the Appwrite website.

Running the Project

npm run dev
Open http://localhost:3000 in your browser to view the project.


👨‍💻 Author

Name: Jevaughn Stewart

Role: Software/API Developer/Student, Computer Networks & Cyber Security (BSc) @ UTech Jamaica

LinkedIn: [https://www.linkedin.com/in/jevaughn-stewart-a71bb8294/]

GitHub: [https://github.com/Jevaughn18]


⚖️ License

This project is for educational and professional development purposes.
