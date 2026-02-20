import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, data, email, name } = body;

    if (!email || !type || !data) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    let subject = "";
    let htmlContent = "";

    switch (type) {
      case "general":
        subject = `[Support] New Inquiry from ${name || email}`;
        htmlContent = `
          <h1>New General Support Inquiry</h1>
          <p><strong>From:</strong> ${name || "N/A"} (${email})</p>
          <p><strong>Subject:</strong> ${data.subject}</p>
          <p><strong>Message:</strong></p>
          <blockquote style="background: #f9f9f9; padding: 10px; border-left: 4px solid #ccc;">
            ${data.message.replace(/\n/g, "<br>")}
          </blockquote>
        `;
        break;
      case "bug":
        subject = `[Bug Report] ${data.title}`;
        htmlContent = `
          <h1>New Bug Report</h1>
          <p><strong>From:</strong> ${name || "N/A"} (${email})</p>
          <p><strong>Issue Title:</strong> ${data.title}</p>
          <p><strong>Description:</strong></p>
          <blockquote style="background: #f9f9f9; padding: 10px; border-left: 4px solid #e53e3e;">
            ${data.description.replace(/\n/g, "<br>")}
          </blockquote>
        `;
        break;
      case "feature":
        subject = `[Feature Request] ${data.featureName}`;
        htmlContent = `
          <h1>New Feature Suggestion</h1>
          <p><strong>From:</strong> ${name || "N/A"} (${email})</p>
          <p><strong>Feature Name:</strong> ${data.featureName}</p>
          <p><strong>Description:</strong></p>
          <blockquote style="background: #f9f9f9; padding: 10px; border-left: 4px solid #3182ce;">
            ${data.description.replace(/\n/g, "<br>")}
          </blockquote>
        `;
        break;
      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    const { data: emailData, error } = await resend.emails.send({
      from: "support@vollio.xyz", // Or your verified domain
      to: ["dilmiabderrahmane9@gmail.com"], // Replace with actual support email in prod
      subject: subject,
      html: htmlContent,
      replyTo: email,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: emailData?.id });
  } catch (error) {
    console.error("Support API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
