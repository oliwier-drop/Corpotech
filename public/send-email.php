<?php

require __DIR__ . '/../vendor/autoload.php';

// Set headers for proper UTF-8 encoding
header('Content-Type: application/json; charset=utf-8');

// Start session for rate limiting
session_start();

// Rate limiting
$timeFrame = 300; // 5 minutes
$maxAttempts = 2; // maximum 3 emails per 5 minutes

if (!isset($_SESSION['email_attempts'])) {
    $_SESSION['email_attempts'] = array();
}

// Clean old attempts
$_SESSION['email_attempts'] = array_filter($_SESSION['email_attempts'], function($timestamp) use ($timeFrame) {
    return $timestamp > (time() - $timeFrame);
});

// Check if maximum attempts reached
if (count($_SESSION['email_attempts']) >= $maxAttempts) {
    if (ob_get_length()) ob_clean();
    http_response_code(429); // Too Many Requests
    echo json_encode([
        'success' => false,
        'message' => 'Zbyt wiele prób wysłania wiadomości. Spróbuj ponownie za kilka minut.'
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

//Import PHPMailer classes into the global namespace
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;
use Dotenv\Dotenv;

try {
    //Load Composer's autoloader
    

    $dotenv = Dotenv::createImmutable(__DIR__ . '/../');
    $dotenv->load();
    

    // Required environment variables
    $dotenv->required(['SMTP_HOST', 'SMTP_USERNAME', 'SMTP_PASSWORD', 'SMTP_PORT', 'MAIL_FROM', 'MAIL_TO'])->notEmpty();

    // Validate request method
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405); // Method Not Allowed
        echo json_encode([
            'success' => false,
            'message' => '405 Method Not Allowed'
        ]);
        exit;
    }

    // Get form data
    $name = htmlspecialchars($_POST['name'] ?? '');
    $email = filter_var($_POST['email'] ?? '', FILTER_SANITIZE_EMAIL);
    $subject = htmlspecialchars($_POST['subject'] ?? '');
    $message = nl2br(htmlspecialchars($_POST['message'] ?? ''));


    // Validate required fields
    if (empty($name) || empty($email) || empty($subject) || empty($message)) {
        throw new Exception('Wszystkie pola są wymagane');
    }

    // Validate email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Nieprawidłowy format email');
    }

    //Create an instance of PHPMailer
    $mail = new PHPMailer(true);

    //Server settings
    $mail->isSMTP();
    $mail->Host       = $_ENV['SMTP_HOST'];
    $mail->SMTPAuth   = true;
    $mail->Username   = $_ENV['SMTP_USERNAME'];
    $mail->Password   = $_ENV['SMTP_PASSWORD'];
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = intval($_ENV['SMTP_PORT']);
    $mail->CharSet    = 'UTF-8';

    //Recipients
    $mail->setFrom($_ENV['MAIL_FROM'], $name);
    $mail->addAddress($_ENV['MAIL_TO']);

    //Content
    $mail->isHTML(true);
    $mail->Subject = "Nowa wiadomość: " . $subject;
    $mail->Body    = "
        <h2>Nowa wiadomość z formularza kontaktowego</h2>
        <p><strong>Imię i nazwisko:</strong> {$name}</p>
        <p><strong>Email:</strong> {$email}</p>
        <p><strong>Temat:</strong> {$subject}</p>
        <p><strong>Wiadomość:</strong></p>
        <p>{$message}</p>
    ";
    $mail->AltBody = strip_tags($mail->Body);

    // Clear any previous output
    ob_clean();
    
    if (!$mail->send()) {
        throw new Exception('Nie udało się wysłać wiadomości. Błąd: ' . $mail->ErrorInfo);
    }

    // Record this attempt
    $_SESSION['email_attempts'][] = time();

    echo json_encode([
        'success' => true,
        'message' => 'Wiadomość została wysłana pomyślnie'
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

} catch (Exception $e) {
    if (ob_get_length()) ob_clean();
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
} 

?>