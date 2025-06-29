<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class TestEmail extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:email {email : The email address to send test email to}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send a test email to verify email configuration';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email');
        
        $this->info("Sending test email to: {$email}");
        
        try {
            Mail::raw(
                "This is a test email from DA-CAR Accounting System.\n\n" .
                "If you receive this email, your email configuration is working correctly!\n\n" .
                "Test sent at: " . now()->format('Y-m-d H:i:s') . "\n\n" .
                "DA-CAR Accounting Section Monitoring System",
                function ($message) use ($email) {
                    $message->to($email)
                           ->subject('DA-CAR Accounting System - Email Test')
                           ->from(config('mail.from.address'), config('mail.from.name'));
                }
            );
            
            $this->info("✅ Email sent successfully!");
            $this->info("Check the inbox for: {$email}");
            
        } catch (\Exception $e) {
            $this->error("❌ Failed to send email");
            $this->error("Error: " . $e->getMessage());
            
            $this->info("\nPlease check:");
            $this->info("- MAIL_USERNAME is your actual Gmail address");
            $this->info("- MAIL_PASSWORD is your Gmail app password (16 characters)");
            $this->info("- 2-Factor authentication is enabled on your Gmail account");
            $this->info("- Gmail app password was generated correctly");
            
            Log::error('Test email failed', [
                'email' => $email,
                'error' => $e->getMessage()
            ]);
        }
    }
}
