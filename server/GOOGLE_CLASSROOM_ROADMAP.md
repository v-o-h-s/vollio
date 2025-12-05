# Google Classroom Integration Roadmap

## 1. 🔐 Authentication & Token Management

- [ ] **Fix Repository**: Update `UserGoogleClassroomRepository` to handle `userId` so we store tokens for the correct user.
- [ ] **Token Refresh**: Implement `refreshAccessToken` in `GoogleClassroomService` to handle expired tokens automatically.
- [ ] **Connection Status**: Add `GET /status` endpoint to check if user is connected.
- [ ] **Disconnect**: Add `DELETE /disconnect` endpoint.

## 2. 📚 Core Classroom Features

- [ ] **List Courses**: `GET /courses` - Fetch active courses.
- [ ] **List Course Work**: `GET /courses/:id/work` - Fetch assignments and materials.
- [ ] **File Discovery**: Logic to extract PDF attachments from course work.

## 3. 📂 File Import

- [ ] **File Details**: Fetch metadata from Google Drive API (size, name, mimeType).
- [ ] **Download & Upload**: Stream file from Google Drive -> Server -> Supabase Storage.
- [ ] **Create PDF Record**: Add entry to `pdfs` table.

## 4. 🖥️ Frontend Implementation

- [ ] **Courses List UI**: Page to view and select courses.
- [ ] **Course Details UI**: View assignments/files within a course.
- [ ] **Import Button**: Action to import a selected file.
