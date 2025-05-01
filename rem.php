<?php
header('Content-Type: application/json');
require_once 'db.php';


session_start();
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Not authenticated']);
    exit;
}
$user_id = $_SESSION['user_id'];

try {
   
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $stmt = $conn->prepare("
            SELECT r.*, m.name as medication_name, m.dosage, m.times as medication_times 
            FROM reminders r
            JOIN medications m ON r.medication_id = m.id
            WHERE r.user_id = ?
        ");
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $reminders = [];
        while ($row = $result->fetch_assoc()) {
            $row['days'] = json_decode($row['days']);
            $row['medication_times'] = json_decode($row['medication_times']);
            $row['notified_times'] = json_decode($row['notified_times'] ?? '[]');
            $reminders[] = $row;
        }
        
        echo json_encode($reminders);
        exit;
    }

    
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        
      
        if (empty($input['medication_id']) || empty($input['days'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields']);
            exit;
        }

        $medication_id = $input['medication_id'];
        $days = json_encode($input['days']);
        $note = $input['note'] ?? null;
        $notified_times = json_encode($input['notified_times'] ?? []);

      
        $stmt = $conn->prepare("SELECT id FROM medications WHERE id = ? AND user_id = ?");
        $stmt->bind_param("ii", $medication_id, $user_id);
        $stmt->execute();
        if ($stmt->get_result()->num_rows === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Medication not found']);
            exit;
        }

        if (isset($input['id'])) {
            
            $stmt = $conn->prepare("
                UPDATE reminders 
                SET medication_id = ?, days = ?, note = ?, notified_times = ?
                WHERE id = ? AND user_id = ?
            ");
            $stmt->bind_param("isssii", $medication_id, $days, $note, $notified_times, $input['id'], $user_id);
        } else {
            
            $stmt = $conn->prepare("
                INSERT INTO reminders (user_id, medication_id, days, note, notified_times)
                VALUES (?, ?, ?, ?, ?)
            ");
            $stmt->bind_param("iisss", $user_id, $medication_id, $days, $note, $notified_times);
        }

        if (!$stmt->execute()) {
            throw new Exception("Database error: " . $stmt->error);
        }

        $response = $input;
        if (!isset($input['id'])) {
            $response['id'] = $conn->insert_id;
        }
        
        echo json_encode($response);
        exit;
    }

   
    if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        if (!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing reminder ID']);
            exit;
        }

        $id = $_GET['id'];
        $stmt = $conn->prepare("DELETE FROM reminders WHERE id = ? AND user_id = ?");
        $stmt->bind_param("ii", $id, $user_id);

        if (!$stmt->execute()) {
            throw new Exception("Database error: " . $stmt->error);
        }

        echo json_encode(['success' => true]);
        exit;
    }

    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>