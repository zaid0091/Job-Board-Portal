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
        from_field = f"{self.from_name} <{self.from_email}>"

        if self.api_key:
            resend.api_key = self.api_key

            if self.from_email == "onboarding@resend.dev":
                logger.warning("Using 'onboarding@resend.dev' - Emails will ONLY be delivered to the email address used to create the Resend account.")

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

            except Exception as e:
                logger.error(f"Failed to send email via Resend: {e}")

        # Fallback to Django's standard email system if Resend fails or is not configured
        if not self.api_key:
            logger.warning(f"No RESEND_API_KEY, using Django email fallback for {to_email}")

        from django.core.mail import EmailMultiAlternatives

        logger.info(f"Using Django email fallback for {to_email}")
        try:
            msg = EmailMultiAlternatives(
                subject,
                text_content or "",
                from_field,
                [to_email]
            )
            if html_content:
                msg.attach_alternative(html_content, "text/html")
            msg.send()
            return True
        except Exception as e:
            logger.error(f"Django email fallback failed: {e}")
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


def send_welcome_email(to_email, username):
    """
    Send a welcome email to a new user using Resend.

    Args:
        to_email: Recipient email address
        username: Name of the user to greet
    """
    subject = "Welcome to JobBoard! 🚀"

    html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to JobBoard</title>
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f4f4f7; }}
        .container {{ max-width: 600px; margin: 0 auto; background: #ffffff; }}
        .header {{ background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); padding: 40px; text-align: center; }}
        .header h1 {{ color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; }}
        .content {{ padding: 40px; color: #333333; line-height: 1.6; }}
        .button {{ display: inline-block; background-color: #2563eb; color: #ffffff; padding: 14px 35px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 25px 0; }}
        .footer {{ background-color: #f4f4f7; padding: 30px; text-align: center; font-size: 12px; color: #999999; }}
        .highlight {{ color: #2563eb; font-weight: 600; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to JobBoard!</h1>
        </div>
        <div class="content">
            <p>Hello <span class="highlight">{username}</span>,</p>
            <p>We're thrilled to have you join our community! JobBoard is designed to help you find your dream career or discover top-tier talent for your team.</p>
            <p><strong>Ready to get started?</strong></p>
            <p>Complete your profile to unlock all features:</p>
            <ul>
                <li>Showcase your skills and experience</li>
                <li>Apply for jobs with one click</li>
                <li>Receive personalized job matches</li>
            </ul>
            <a href="{settings.FRONTEND_URL}/profile" class="button">Complete Your Profile</a>
            <p>If you have any questions, our support team is always here to help. Just reply to this email!</p>
            <p>Best regards,<br>The JobBoard Team</p>
        </div>
        <div class="footer">
            <p>&copy; JobBoard Portal. All rights reserved.</p>
            <p>123 Career Blvd, Opportunity City</p>
        </div>
    </div>
</body>
</html>
""".strip()

    text_content = f"""
Welcome to JobBoard!

Hello {username},

We're thrilled to have you join our community! JobBoard is designed to help you find your dream career or discover top-tier talent for your team.

Ready to get started? Complete your profile to unlock all features:
{settings.FRONTEND_URL}/profile

Best regards,
The JobBoard Team
    """.strip()

    resend_service = ResendEmailService()
    success = resend_service.send_email(to_email, subject, html_content, text_content)

    if not success:
        logger.error(f"Failed to send welcome email to {to_email}")

    return success
