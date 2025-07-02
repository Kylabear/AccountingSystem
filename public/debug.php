<?php
// Turn on error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "=== Laravel Debug Script ===<br><br>";

try {
    echo "1. PHP Version: " . PHP_VERSION . "<br>";
    
    echo "2. Current directory: " . __DIR__ . "<br>";
    
    echo "3. Checking autoloader...<br>";
    if (file_exists(__DIR__ . '/../vendor/autoload.php')) {
        echo "   ✓ Autoloader found<br>";
        require_once __DIR__ . '/../vendor/autoload.php';
        echo "   ✓ Autoloader loaded<br>";
    } else {
        echo "   ✗ Autoloader NOT found<br>";
        exit;
    }
    
    echo "4. Checking .env file...<br>";
    if (file_exists(__DIR__ . '/../.env')) {
        echo "   ✓ .env file found<br>";
    } else {
        echo "   ✗ .env file NOT found<br>";
    }
    
    echo "5. Checking bootstrap file...<br>";
    if (file_exists(__DIR__ . '/../bootstrap/app.php')) {
        echo "   ✓ Bootstrap file found<br>";
        
        echo "6. Loading Laravel application...<br>";
        $app = require_once __DIR__ . '/../bootstrap/app.php';
        echo "   ✓ Laravel application loaded<br>";
        
        echo "7. Testing basic Laravel functionality...<br>";
        $request = Illuminate\Http\Request::capture();
        echo "   ✓ Request captured<br>";
        
        echo "8. Environment: " . $app->environment() . "<br>";
        echo "9. Debug mode: " . ($app->hasDebugModeEnabled() ? 'enabled' : 'disabled') . "<br>";
        
    } else {
        echo "   ✗ Bootstrap file NOT found<br>";
    }
    
    echo "<br>=== Debug completed successfully ===";
    
} catch (Throwable $e) {
    echo "<br><strong style='color: red;'>ERROR CAUGHT:</strong><br>";
    echo "Message: " . $e->getMessage() . "<br>";
    echo "File: " . $e->getFile() . "<br>";
    echo "Line: " . $e->getLine() . "<br>";
    echo "Trace:<br><pre>" . $e->getTraceAsString() . "</pre>";
}
?>
