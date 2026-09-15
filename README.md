# Student Study

Student Study is a web-based interactive learning and quiz platform built with Next.js, React, TypeScript, and Firebase.

The system supports individual learning, quiz management, and real-time multiplayer quizzes.

---

## Overview

Student Study provides a centralized platform for creating, managing, and playing educational quizzes.

The system consists of two main learning modes:

- Solo learning
- Real-time multiplayer learning

User accounts are managed by an administrator. Public self-registration is disabled to maintain controlled access to the system.

---

## Features

### Authentication

- Login with email and password
- Email verification
- Logout
- Administrator-managed accounts
- Public registration disabled

### Quiz Management

- Create quizzes manually
- Import quizzes using JSON
- Edit quizzes
- Delete quizzes
- Duplicate quizzes
- Search and manage quizzes through Quiz Library

### Learning

- Solo Quiz mode
- Flashcard mode
- Question timer
- Automatic score calculation
- Result summary

### Multiplayer

- Create multiplayer game sessions
- Generate 6-digit Game PIN
- Join games using Game PIN
- Real-time player synchronization
- Host controls game progression
- Real-time score calculation
- Leaderboard
- Final game results
- Automatic cleanup of inactive sessions

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js, React |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Authentication | Firebase Authentication |
| Database | Cloud Firestore |
| Realtime Data | Firebase Realtime Database |
| Deployment | Vercel / Firebase Hosting / Company Hosting |

---

