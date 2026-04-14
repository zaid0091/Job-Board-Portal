import logging
import resend
from django.conf import settings

logger = logging.getLogger(__name__)


class ResendEmailService:
    """
    Email service using Resend API.
    Documentation: https://resend.com/docs/api-reference/emails/send-email
    """

    def __init__(self):
        self.api_key = getattr(settings, "RESEND_API_KEY", None)
        self.from_email = getattr(settings, "RESEND_FROM_EMAIL", "noreply@jobboard.com")
        self.from_name = getattr(settings, "RESEND_FROM_NAME", "JobBoard")

    def send_email(self, to_email, subject, html_content, text_content=None):
        """
        Send an email via Resend API.

        Args:
            to_email: Recipient email address
            subject: Email subject line
            html_content: HTML version of the email body
            text_content: Plain text version (optional)

        Returns:
            bool: True if email was sent successfully, False otherwise
        """
        if not self.api_key:
            logger.error("RESEND_API_KEY not configured")
            return False

        resend.api_key = self.api_key

        from_field = f"{self.from_name} <{self.from_email}>"

        try:
            params = {
                "from": from_field,
                "to": [to_email],
                "subject": subject,
                "html": html_content,
            }

            if text_content:
                params["text"] = text_content

            response = resend.Emails.send(params)

            if response.get("id"):
                logger.info(
                    f"Email sent successfully to {to_email}, ID: {response['id']}"
                )
                return True
            else:
                logger.error(f"Resend API error: {response}")
                return False

        except Exception as e:
            logger.error(f"Failed to send email: {e}")
            return False


def send_password_reset_email(to_email, reset_url):
    """
    Send a password reset email using Resend.

    Args:
        to_email: Recipient email address
        reset_url: Password reset URL with token
    """
    subject = "Password Reset Request - JobBoard"

    html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset</title>
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f4f4f7; }}
        .container {{ max-width: 600px; margin: 0 auto; background: #ffffff; }}
        .header {{ background-color: #2563eb; padding: 30px; text-align: center; }}
        .header h1 {{ color: #ffffff; margin: 0; font-size: 24px; }}
        .content {{ padding: 30px; color: #333333; line-height: 1.6; }}
        .button {{ display: inline-block; background-color: #2563eb; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }}
        .footer {{ background-color: #f4f4f7; padding: 20px; text-align: center; font-size: 12px; color: #999999; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Password Reset</h1>
        </div>
        <div class="content">
            <p>Hello,</p>
            <p>You requested a password reset for your JobBoard account.</p>
            <p>Click the button below to reset your password:</p>
            <a href="{reset_url}" class="button">Reset Password</a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666; font-size: 14px;">{reset_url}</p>
            <p><strong>Important:</strong> This link will expire in 1 hour.</p>
            <p>If you didn't request this, please ignore this email. Your account is safe.</p>
            <p>Best regards,<br>The JobBoard Team</p>
        </div>
        <div class="footer">
            <p>&copy; JobBoard Portal. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
""".strip()

    text_content = f"""
Password Reset - JobBoard

Hello,

You requested a password reset for your JobBoard account.

Click the link below to reset your password:
{reset_url}

This link will expire in 1 hour.

If you didn't request this, please ignore this email.

Best regards,
The JobBoard Team
    """.strip()

    resend_service = ResendEmailService()
    success = resend_service.send_email(to_email, subject, html_content, text_content)

    if not success:
        logger.error(f"Failed to send password reset email to {to_email}")

    return success
