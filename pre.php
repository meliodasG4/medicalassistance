<?php
header('Content-Type: application/json');
require_once 'db.php';

if (empty($_FILES['photo'])) {
    echo json_encode(['error' => 'No photo uploaded']);
    exit;
}

$file = $_FILES['photo'];


if ($file['size'] > 2000000) {
    echo json_encode(['error' => 'File too large (max 2MB)']);
    exit;
}

if (!str_starts_with($file['type'], 'image/')) {
    echo json_encode(['error' => 'Only images allowed']);
    exit;
}

try {
    $stmt = $conn->prepare("
        INSERT INTO prescription_photos 
        (user_id, photo_name, photo_data) 
        VALUES (?, ?, ?)
    ");
    
    $photoData = file_get_contents($file['tmp_name']);
    $stmt->bind_param("iss", $_SESSION['user_id'], $file['name'], $photoData);
    
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'id' => $conn->insert_id,
            'filename' => $file['name']
        ]);
    } else {
        echo json_encode(['error' => 'Database error']);
    }
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>