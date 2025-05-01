<?php
header('Content-Type: application/json');
require_once 'db.php';

ini_set('display_errors', 0);
ini_set('log_errors', 1);

session_start();
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Not authenticated']);
    exit;
}
$user_id = $_SESSION['user_id'];

function handleException($e) {
    error_log("ERROR: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Server error', 'details' => $e->getMessage()]);
    exit;
}
set_exception_handler('handleException');

try {

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $stmt = $conn->prepare("SELECT * FROM medications WHERE user_id = ?");
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $medications = [];
        while ($row = $result->fetch_assoc()) {
            $row['times'] = json_decode($row['times'], true);
            $medications[] = $row;
        }
        
        echo json_encode($medications);
        exit;
    }

   
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        
       
        $required = ['name', 'dosage', 'frequency', 'times'];
        foreach ($required as $field) {
            if (empty($input[$field])) {
                http_response_code(400);
                echo json_encode(['error' => "Missing $field"]);
                exit;
            }
        }

        
        $id = $input['id'] ?? null;
        $name = $conn->real_escape_string($input['name']);
        $dosage = $conn->real_escape_string($input['dosage']);
        $frequency = $conn->real_escape_string($input['frequency']);
        $times = json_encode($input['times']);
        $notes = $conn->real_escape_string($input['notes'] ?? '');

        if ($id) {
            
            $stmt = $conn->prepare("UPDATE medications SET 
                name=?, dosage=?, frequency=?, times=?, notes=? 
                WHERE id=? AND user_id=?");
            $stmt->bind_param("sssssii", $name, $dosage, $frequency, $times, $notes, $id, $user_id);
        } else {
            
            $stmt = $conn->prepare("INSERT INTO medications 
                (user_id, name, dosage, frequency, times, notes) 
                VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->bind_param("isssss", $user_id, $name, $dosage, $frequency, $times, $notes);
        }

        if (!$stmt->execute()) {
            throw new Exception("Database error: " . $stmt->error);
        }

        $response = $input;
        if (!$id) $response['id'] = $conn->insert_id;
        
        echo json_encode($response);
        exit;
    }

    
    if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        if (!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing ID']);
            exit;
        }

        $id = (int)$_GET['id'];
        $stmt = $conn->prepare("DELETE FROM medications WHERE id=? AND user_id=?");
        $stmt->bind_param("ii", $id, $user_id);

        if (!$stmt->execute()) {
            throw new Exception("Delete failed: " . $stmt->error);
        }

        echo json_encode(['success' => true]);
        exit;
    }

    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);

} catch (Exception $e) {
    handleException($e);
}
?>