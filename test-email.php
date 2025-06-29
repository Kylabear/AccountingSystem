<?php
require_once 'vendor/autoload.php';

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

use Illuminate\Mail\Mailable;
use Illuminate\Mail\Transport\SesTransport;
use Symfony\Component\Mailer\Transport\Smtp\EsmtpTransport;
use Symfony\Component\Mailer\Mailer;
use Symfony\Component\Mime\Email;

try {
    // Create SMTP transport
    $transport = new EsmtpTransport(
        $_ENV['MAIL_HOST'],
        $_ENV['MAIL_PORT'],
        $_ENV['MAIL_SCHEME'] === 'tls' ? true : false
    );
    
    if ($_ENV['MAIL_SCHEME'] === 'tls') {
        $transport->setStreamOptions([
            'ssl' => [
                'verify_peer' => false,
                'verify_peer_name' => false,
                'allow_self_signed' => true
            ]
        ]);
    }
    
    $transport->setUsername($_ENV['MAIL_USERNAME']);
    $transport->setPassword($_ENV['MAIL_PASSWORD']);
    
    // Create mailer
    $mailer = new Mailer($transport);
    
    // Create email
    $email = (new Email())
        ->from($_ENV['MAIL_FROM_ADDRESS'])
        ->to($_ENV['MAIL_USERNAME']) // Send to yourself for testing
        ->subject('DA-CAR Accounting System - Email Test')
        ->text('This is a test email from your DA-CAR Accounting System. If you receive this, your email configuration is working correctly!')
        ->html('<h1>Email Test Successful!</h1><p>This is a test email from your <strong>DA-CAR Accounting System</strong>.</p><p>If you receive this, your email configuration is working correctly!</p>');
    
    // Send email
    $mailer->send($email);
    
    echo "✅ EMAIL SENT SUCCESSFULLY!\n";
    echo "Check your inbox at: " . $_ENV['MAIL_USERNAME'] . "\n";
    
} catch (Exception $e) {
    echo "❌ EMAIL FAILED TO SEND\n";
    echo "Error: " . $e->getMessage() . "\n";
    echo "\nPlease check:\n";
    echo "- Your Gmail address is correct\n";
    echo "- Your app password is correct (16 characters, no spaces)\n";
    echo "- 2-Factor authentication is enabled on your Google account\n";
}
?>
