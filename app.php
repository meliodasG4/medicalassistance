<?php
header('Content-Type: application/json');
require_once 'db.php';


if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $conn->prepare("SELECT * FROM appointments ORDER BY date, time");
    $stmt->execute();
    $result = $stmt->get_result();
    
    $appointments = [];
    while ($row = $result->fetch_assoc()) {
        $appointments[] = [
            'id' => $row['id'],
            'username' => $row['username'],
            'title' => $row['title'],
            'date' => $row['date'],
            'time' => $row['time'],
            'location' => $row['location'],
            'doctor' => $row['doctor'],
            'notes' => $row['notes']
        ];
    }
    
    echo json_encode($appointments);
    exit;
}


if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
 
    $required = ['username', 'title', 'date', 'time', 'location', 'doctor'];
    foreach ($required as $field) {
        if (empty($input[$field])) {
            http_response_code(400);
            echo json_encode(['error' => "Missing required field: $field"]);
            exit;
        }
    }

    $stmt = $conn->prepare("
        INSERT INTO appointments 
        (username, title, date, time, location, doctor, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->bind_param(
        "sssssss",
        $input['username'],
        $input['title'],
        $input['date'],
        $input['time'],
        $input['location'],
        $input['doctor'],
        $input['notes'] ?? ''
    );

    if ($stmt->execute()) {
        $input['id'] = $conn->insert_id;
        echo json_encode($input);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create appointment']);
    }
    exit;
}


if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    if (!isset($_GET['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing appointment ID']);
        exit;
    }

    $stmt = $conn->prepare("DELETE FROM appointments WHERE id = ?");
    $stmt->bind_param("i", $_GET['id']);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to delete appointment']);
    }
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
?>