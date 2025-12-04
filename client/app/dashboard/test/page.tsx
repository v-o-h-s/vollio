"use client"
export default function TestPage() {
  return (
    <div>
      <button onClick={() => {
        // Use window.location.href to navigate to the OAuth endpoint.
        // This ensures cookies are sent and the browser handles the redirect to Google.
        window.location.href = "http://localhost:3000/auth/google-classroom";
      }}>
        add classroom
      </button>
    </div>
  );
}
