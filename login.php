<?php
require_once 'db.php';
session_start();

header('Content-Type: application/json');


if ($_POST['action'] == 'login') {
    $email = $conn->real_escape_string($_POST['email']);
    $result = $conn->query("SELECT * FROM users WHERE email = '$email'");
    
    if ($result->num_rows == 1) {
        $user = $result->fetch_assoc();
        if (password_verify($_POST['password'], $user['password'])) {
           
            $_SESSION['user_email'] = $user['email'];
            $_SESSION['user_name'] = $user['username'];
            $_SESSION['loggedin'] = true;
            
            echo json_encode([
                'success' => true,
                'email' => $user['email'],
                'username' => $user['username']
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Invalid password']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'User not found']);
    }
}


elseif ($_POST['action'] == 'register') {
    $username = $conn->real_escape_string($_POST['username']);
    $email = $conn->real_escape_string($_POST['email']);
    $password = password_hash($_POST['password'], PASSWORD_DEFAULT);
    
   
    if ($conn->query("SELECT email FROM users WHERE email = '$email'")->num_rows > 0) {
        echo json_encode(['success' => false, 'message' => 'Email already exists']);
        exit;
    }
    
    if ($conn->query("INSERT INTO users (username, email, password) VALUES ('$username', '$email', '$password')")) {

        $_SESSION['user_email'] = $email;
        $_SESSION['user_name'] = $username;
        $_SESSION['loggedin'] = true;
        
        echo json_encode([
            'success' => true,
            'email' => $email,
            'username' => $username
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Registration failed']);
    }
}

$conn->close();
?>