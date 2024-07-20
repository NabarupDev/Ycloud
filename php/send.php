<?php
// Configuration
$apiKey = '1de660588b1ed81c65bfde01cd3c4b39';
$senderNumber = $_POST['sender_number'];
$recipientNumbers = $_POST['recipient_numbers'];
$message = $_POST['message'];
$amount = $_POST['amount']; // Adjusted for clarity

// Validate input
if (empty($senderNumber) || empty($recipientNumbers) || empty($amount) || empty($message)) {
    echo 'Please fill in all fields.';
    exit;
}

// Validate recipient numbers format
$recipientNumbersArray = explode(',', $recipientNumbers);
$formattedRecipientNumbers = [];

foreach ($recipientNumbersArray as $number) {
    $number = preg_replace('/\D/', '', $number); // Remove non-numeric characters

    // Ensure number starts with '+'
    if (substr($number, 0, 1) !== '+') {
        $number = '+' . $number; // Prepend '+' if not already present
    }

    // Check if number starts with '+' and is followed by digits
    if (preg_match('/^\+\d{11,}$/', $number)) { // Adjust regex as per your country code and phone number length
        $formattedRecipientNumbers[] = $number;
    } else {
        echo "Invalid phone number format: $number";
        exit;
    }
}

// Initialize curl
$curl = curl_init();

// Set curl options
curl_setopt_array($curl, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_ENCODING => "",
    CURLOPT_MAXREDIRS => 10,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
    CURLOPT_CUSTOMREQUEST => "POST",
    CURLOPT_HTTPHEADER => [
        "Content-Type: application/json",
        "X-API-Key: $apiKey"
    ],
]);

$allSuccess = true;
$creditsDeduction = 0; // Initialize credits deduction

// Send SMS to each recipient
foreach ($formattedRecipientNumbers as $recipientNumber) {
    $postData = json_encode([
        'to' => $recipientNumber,
        'text' => $message,
        'from' => $senderNumber
    ]);



    curl_setopt($curl, CURLOPT_URL, "https://api.ycloud.com/v2/sms");
    curl_setopt($curl, CURLOPT_POSTFIELDS, $postData);

    $response = curl_exec($curl);
    $err = curl_error($curl);

    if ($err) {
        echo "cURL Error #: $err";
        $allSuccess = false;
        break;
    } else {
        $responseDecoded = json_decode($response, true);
        if (isset($responseDecoded['error'])) {
            echo "Error: " . $responseDecoded['error']['message'];
            $allSuccess = false;
            break;
        } else {
            // Calculate credits deduction based on the recipient number
            $countryCode = substr($recipientNumber, 0, 3);
            switch ($countryCode) {
                case '+1':
                    $creditsDeduction += 0.022;
                    break;
                case '+44':
                    $creditsDeduction += 0.048;
                    break;
                case '+91':
                    $creditsDeduction += 0.048;
                    break;
                case '+61':
                    $creditsDeduction += 0.070;
                    break;
                case '+49':
                    $creditsDeduction += 0.12;
                    break;
                case '+33':
                    $creditsDeduction += 0.094;
                    break;
                case '+48':
                    $creditsDeduction += 0.054;
                    break;
                case '+65':
                    $creditsDeduction += 0.047;
                    break;
                default:
                    $creditsDeduction += 0.1; // Default deduction for unspecified country codes
                    break;
            }
        }
    }
}

// Close curl
curl_close($curl);

if ($allSuccess) {
    echo "<script>let status = 'success';</script>";
    echo "SMS successfully sent.";
} else {
    echo "<script>let status = 'failed';</script>";
    echo "Failed to send SMS. Your credits not deducted.";
}
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>SMS Sender</title>
    <script src="https://www.gstatic.com/firebasejs/8.6.8/firebase-app.js"></script>
    <script src="https://www.gstatic.com/firebasejs/8.6.8/firebase-auth.js"></script>
    <script src="https://www.gstatic.com/firebasejs/8.6.8/firebase-database.js"></script>
    <script>
        let req_data = <?= json_encode($postData, true) ?>;
        const firebaseConfig = {
            apiKey: "AIzaSyBKMUT1Mvums9TZYQSvs2mwaRBg5qFuiz4",
            authDomain: "sms-sender-c293c.firebaseapp.com",
            projectId: "sms-sender-c293c",
            storageBucket: "sms-sender-c293c.appspot.com",
            messagingSenderId: "962610219948",
            appId: "1:962610219948:web:fade71761e059af1e68809"
        };

        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);

        document.addEventListener('DOMContentLoaded', function() {
            // Get the current user
            firebase.auth().onAuthStateChanged(function(user) {
                if (user) {
                    const userId = user.uid;
                    const userRef = firebase.database().ref('users').child(userId);

                    // Set user online status
                    setUserOnlineStatus(userId, true);

                    // Sample request data
                    req_data = JSON.parse(req_data);

                    // Splitting the recipient numbers by comma
                    let recipients = <?= json_encode($recipientNumbersArray, true) ?>;

                    // Looping through each recipient
                    recipients.forEach((recipient) => {
                        let date = new Date();
                        date = date.toISOString().replaceAll('-', "").replaceAll(':', "").replaceAll('.', '');

                        const random = Math.floor(Math.random() * 10000) + '' + date;

                        // Storing data for each recipient
                        firebase.database().ref('history/' + userId + '/' + random).set({
                            'date': new Date().toLocaleString(),
                            'recipient': recipient.trim(),
                            'message': req_data.text,
                            'status': status
                        });
                    });

                    // Listen for window unload to update status
                    window.addEventListener('beforeunload', function() {
                        setUserOnlineStatus(userId, false);
                    });

                    // Function to set user online/offline status
                    function setUserOnlineStatus(userId, isOnline) {
                        userRef.update({
                            isOnline: isOnline
                        });
                    }
                } else {
                    console.log('User is not signed in');
                    window.location.href = 'index.html';
                }
            });
        });
    </script>
</head>

<body>
    <!-- Your page content -->
</body>

</html>