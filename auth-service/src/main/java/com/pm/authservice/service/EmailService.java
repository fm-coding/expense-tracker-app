package com.pm.authservice.service;

import com.pm.authservice.dto.email.EmailDto;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.concurrent.CompletableFuture;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${app.mail.from}")
    private String fromEmail;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    // UPDATED: Use external port for email links
    @Value("${app.external.port:8084}")
    private String externalPort;

    private String getBackendUrl() {
        return "http://localhost:" + externalPort;
    }

    @Async("emailTaskExecutor")
    public CompletableFuture<Void> sendEmail(EmailDto emailDto) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(emailDto.getTo());
            helper.setSubject(emailDto.getSubject());
            helper.setText(emailDto.getBody(), true);

            mailSender.send(message);
            log.info("✅ Email sent successfully to: {}", emailDto.getTo());

        } catch (MessagingException e) {
            log.error("❌ Failed to send email to: {}", emailDto.getTo(), e);
            throw new RuntimeException("Failed to send email", e);
        }

        return CompletableFuture.completedFuture(null);
    }

    @Async("emailTaskExecutor")
    public CompletableFuture<Void> sendVerificationEmail(String email, String firstName, String verificationToken) {
        try {
            // FIXED: Use external port 8084 for verification URL
            String backendVerificationUrl = getBackendUrl() + "/api/v1/auth/verify-email/" + verificationToken;
            String frontendRedirectUrl = frontendUrl + "/login?verified=true";

            // Create email content with backend verification URL
            String htmlContent = createVerificationEmailTemplate(firstName, verificationToken, backendVerificationUrl);

            EmailDto emailDto = EmailDto.builder()
                    .to(email)
                    .subject("Verify Your Email - PM System")
                    .body(htmlContent)
                    .build();

            sendEmail(emailDto);
            log.info("📧 Verification email sent to: {}", email);
            log.info("🔗 Backend Verification URL: {}", backendVerificationUrl);
            log.info("🔗 Frontend Redirect URL: {}", frontendRedirectUrl);

        } catch (Exception e) {
            log.error("❌ Failed to send verification email to: {}", email, e);
            throw new RuntimeException("Failed to send verification email", e);
        }

        return CompletableFuture.completedFuture(null);
    }

    @Async("emailTaskExecutor")
    public CompletableFuture<Void> sendPasswordResetEmail(String email, String firstName, String resetToken) {
        try {
            // Use frontend URL for password reset (user needs to input new password)
            String frontendResetUrl = frontendUrl + "/reset-password?token=" + resetToken;

            String htmlContent = createPasswordResetEmailTemplate(firstName, resetToken, frontendResetUrl);

            EmailDto emailDto = EmailDto.builder()
                    .to(email)
                    .subject("Reset Your Password - PM System")
                    .body(htmlContent)
                    .build();

            sendEmail(emailDto);
            log.info("🔐 Password reset email sent to: {}", email);
            log.info("🔗 Reset URL: {}", frontendResetUrl);

        } catch (Exception e) {
            log.error("❌ Failed to send password reset email to: {}", email, e);
            throw new RuntimeException("Failed to send password reset email", e);
        }

        return CompletableFuture.completedFuture(null);
    }

    @Async("emailTaskExecutor")
    public CompletableFuture<Void> sendWelcomeEmail(String email, String firstName) {
        try {
            String htmlContent = createWelcomeEmailTemplate(firstName);

            EmailDto emailDto = EmailDto.builder()
                    .to(email)
                    .subject("Welcome to PM System!")
                    .body(htmlContent)
                    .build();

            sendEmail(emailDto);
            log.info("🎉 Welcome email sent to: {}", email);

        } catch (Exception e) {
            log.error("❌ Failed to send welcome email to: {}", email, e);
            throw new RuntimeException("Failed to send welcome email", e);
        }

        return CompletableFuture.completedFuture(null);
    }

    // Email templates remain the same...
    private String createVerificationEmailTemplate(String firstName, String verificationToken, String backendVerificationUrl) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Verify Your Email - PM System</title>
                <style>
                    body { 
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
                        line-height: 1.6; 
                        color: #333; 
                        max-width: 600px; 
                        margin: 0 auto; 
                        padding: 20px; 
                        background: #f5f5f5; 
                    }
                    .container { 
                        background: white; 
                        border-radius: 12px; 
                        overflow: hidden; 
                        box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
                    }
                    .header { 
                        background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); 
                        color: white; 
                        padding: 40px 30px; 
                        text-align: center; 
                    }
                    .header h1 { 
                        margin: 0; 
                        font-size: 28px; 
                        font-weight: 600; 
                    }
                    .header p { 
                        margin: 10px 0 0 0; 
                        opacity: 0.9; 
                        font-size: 16px; 
                    }
                    .content { 
                        padding: 40px 30px; 
                    }
                    .btn { 
                        display: inline-block; 
                        background: #28a745; 
                        color: white !important; 
                        padding: 16px 32px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        font-weight: 600; 
                        margin: 25px 0; 
                        font-size: 16px; 
                        transition: background 0.3s; 
                    }
                    .btn:hover { 
                        background: #218838; 
                    }
                    .security-notice { 
                        background: #f8f9fa; 
                        border-left: 4px solid #ffc107; 
                        padding: 20px; 
                        margin: 25px 0; 
                        border-radius: 0 8px 8px 0; 
                    }
                    .footer { 
                        background: #f8f9fa; 
                        text-align: center; 
                        padding: 30px; 
                        color: #666; 
                        font-size: 14px; 
                    }
                    .token-box { 
                        background: #e9ecef; 
                        padding: 15px; 
                        border-radius: 8px; 
                        word-break: break-all; 
                        font-family: monospace; 
                        margin: 20px 0; 
                        font-size: 12px; 
                    }
                    .features { 
                        display: grid; 
                        grid-template-columns: 1fr 1fr; 
                        gap: 15px; 
                        margin: 25px 0; 
                    }
                    .feature { 
                        background: #f8f9fa; 
                        padding: 15px; 
                        border-radius: 8px; 
                        text-align: center; 
                    }
                    @media (max-width: 600px) {
                        .container { margin: 10px; }
                        .header, .content { padding: 20px; }
                        .features { grid-template-columns: 1fr; }
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🚀 Welcome to PM System</h1>
                        <p>Personal Management Made Simple</p>
                    </div>
                    <div class="content">
                        <h2 style="color: #333; margin-top: 0;">Hello %s! 👋</h2>
                        <p>Thank you for registering with PM System. We're excited to help you manage your personal data and expenses efficiently!</p>
                        
                        <p>To complete your account setup and start using all our features, please verify your email address by clicking the button below:</p>
                        
                        <div style="text-align: center;">
                            <a href="%s" class="btn">✅ Verify Email Address</a>
                        </div>
                        
                        <div class="security-notice">
                            <p style="margin: 0 0 10px 0;"><strong>🔒 Security Notice:</strong></p>
                            <ul style="margin: 0; padding-left: 20px;">
                                <li>This verification link expires in <strong>24 hours</strong></li>
                                <li>Click the button above to verify instantly</li>
                                <li>You'll be redirected to the login page after verification</li>
                                <li>If you didn't create this account, please ignore this email</li>
                            </ul>
                        </div>
                        
                        <p><strong>Can't click the button?</strong><br>
                        Copy and paste this link into your browser:</p>
                        <div class="token-box">%s</div>
                        
                        <p style="margin-top: 30px;">Once verified, you'll have access to:</p>
                        <div class="features">
                            <div class="feature">
                                <strong>📊 Expense Tracking</strong><br>
                                Monitor spending patterns
                            </div>
                            <div class="feature">
                                <strong>📈 Analytics</strong><br>
                                Detailed financial insights
                            </div>
                            <div class="feature">
                                <strong>🎯 Budget Goals</strong><br>
                                Set and track targets
                            </div>
                            <div class="feature">
                                <strong>📱 Mobile Access</strong><br>
                                Use anywhere, anytime
                            </div>
                        </div>
                    </div>
                    <div class="footer">
                        <p><strong>Best regards,</strong><br>The PM System Team</p>
                        <p>© 2025 PM System. All rights reserved.</p>
                        <p>Need help? Contact us at <a href="mailto:%s" style="color: #667eea;">%s</a></p>
                    </div>
                </div>
            </body>
            </html>
            """, firstName, backendVerificationUrl, backendVerificationUrl, fromEmail, fromEmail);
    }

    private String createPasswordResetEmailTemplate(String firstName, String resetToken, String frontendResetUrl) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Reset Your Password - PM System</title>
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5; }
                    .container { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                    .header { background: linear-gradient(135deg, #dc3545 0%%, #c82333 100%%); color: white; padding: 40px 30px; text-align: center; }
                    .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
                    .content { padding: 40px 30px; }
                    .btn { display: inline-block; background: #dc3545; color: white !important; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 25px 0; font-size: 16px; }
                    .btn:hover { background: #c82333; }
                    .security-notice { background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0; }
                    .footer { background: #f8f9fa; text-align: center; padding: 30px; color: #666; font-size: 14px; }
                    .token-box { background: #e9ecef; padding: 15px; border-radius: 8px; word-break: break-all; font-family: monospace; margin: 20px 0; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔐 Password Reset Request</h1>
                        <p>PM System Security</p>
                    </div>
                    <div class="content">
                        <h2 style="color: #333; margin-top: 0;">Hello %s!</h2>
                        <p>We received a request to reset your password for your PM System account. Click the button below to create a new password:</p>
                        
                        <div style="text-align: center;">
                            <a href="%s" class="btn">🔑 Reset Password</a>
                        </div>
                        
                        <div class="security-notice">
                            <p style="margin: 0 0 10px 0;"><strong>⚠️ Security Notice:</strong></p>
                            <ul style="margin: 0; padding-left: 20px;">
                                <li>This reset link expires in <strong>1 hour</strong></li>
                                <li>If you didn't request this reset, please ignore this email</li>
                                <li>Your password will remain unchanged unless you use this link</li>
                                <li>Only the most recent reset link will work</li>
                            </ul>
                        </div>
                        
                        <p><strong>Alternative Method:</strong><br>
                        If the button doesn't work, copy and paste this link into your browser:</p>
                        <div class="token-box">%s</div>
                    </div>
                    <div class="footer">
                        <p><strong>Best regards,</strong><br>The PM System Security Team</p>
                        <p>© 2025 PM System. All rights reserved.</p>
                        <p>Need help? Contact us at <a href="mailto:%s" style="color: #dc3545;">%s</a></p>
                    </div>
                </div>
            </body>
            </html>
            """, firstName, frontendResetUrl, frontendResetUrl, fromEmail, fromEmail);
    }

    private String createWelcomeEmailTemplate(String firstName) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Welcome to PM System</title>
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5; }
                    .container { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                    .header { background: linear-gradient(135deg, #28a745 0%%, #20c997 100%%); color: white; padding: 40px 30px; text-align: center; }
                    .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
                    .content { padding: 40px 30px; }
                    .btn { display: inline-block; background: #28a745; color: white !important; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 25px 0; font-size: 16px; }
                    .feature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0; }
                    .feature { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
                    .footer { background: #f8f9fa; text-align: center; padding: 30px; color: #666; font-size: 14px; }
                    @media (max-width: 600px) { .feature-grid { grid-template-columns: 1fr; } }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 Welcome to PM System!</h1>
                        <p>Your Personal Management Journey Starts Here</p>
                    </div>
                    <div class="content">
                        <h2 style="color: #333; margin-top: 0;">Hello %s! 🎊</h2>
                        <p>Welcome to PM System! Your email has been verified and your account is now active. We're excited to help you take control of your personal management and financial tracking.</p>
                        
                        <div style="text-align: center;">
                            <a href="%s/login" class="btn">🚀 Get Started</a>
                        </div>
                        
                        <div class="feature-grid">
                            <div class="feature">
                                <h3>📊 Expense Tracking</h3>
                                <p>Monitor your spending patterns and categorize expenses</p>
                            </div>
                            <div class="feature">
                                <h3>📈 Analytics</h3>
                                <p>Get insights with detailed reports and charts</p>
                            </div>
                            <div class="feature">
                                <h3>🎯 Budget Goals</h3>
                                <p>Set and track your financial goals</p>
                            </div>
                            <div class="feature">
                                <h3>📱 Mobile Ready</h3>
                                <p>Access your data anywhere, anytime</p>
                            </div>
                        </div>
                        
                        <p><strong>Quick Start Tips:</strong></p>
                        <ul>
                            <li>Complete your profile setup</li>
                            <li>Add your first expense category</li>
                            <li>Set up your monthly budget</li>
                            <li>Explore the analytics dashboard</li>
                        </ul>
                    </div>
                    <div class="footer">
                        <p><strong>Best regards,</strong><br>The PM System Team</p>
                        <p>© 2025 PM System. All rights reserved.</p>
                        <p>Need help? Contact us at <a href="mailto:%s" style="color: #28a745;">%s</a></p>
                    </div>
                </div>
            </body>
            </html>
            """, firstName, frontendUrl, fromEmail, fromEmail);
    }
}