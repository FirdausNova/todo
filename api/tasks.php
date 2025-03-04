<?php
// Konfigurasi Database
$host = 'localhost';
$db = 'todo';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

// Headers untuk CORS dan JSON
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Tangani permintaan OPTIONS (pre-flight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Inisialisasi koneksi database
try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (PDOException $e) {
    sendResponse(['success' => false, 'message' => 'Koneksi database gagal: ' . $e->getMessage()], 500);
    exit;
}

// Mendapatkan data input
$requestMethod = $_SERVER['REQUEST_METHOD'];
$requestData = [];

// Untuk metode POST, PUT, dan PATCH, ambil data dari request body
if (in_array($requestMethod, ['POST', 'PUT', 'PATCH'])) {
    $input = file_get_contents('php://input');
    $requestData = json_decode($input, true);
    
    // Periksa apakah JSON valid
    if (json_last_error() !== JSON_ERROR_NONE) {
        sendResponse(['success' => false, 'message' => 'Format JSON tidak valid'], 400);
        exit;
    }
}

// Operasi CRUD berdasarkan metode HTTP
switch ($requestMethod) {
    case 'GET':
        // READ: Ambil semua tugas atau tugas spesifik
        handleGetRequest();
        break;
        
    case 'POST':
        // CREATE: Tambah tugas baru
        handlePostRequest($requestData);
        break;
        
    case 'PUT':
        // UPDATE: Perbarui tugas
        handlePutRequest($requestData);
        break;
        
    case 'PATCH':
        // UPDATE: Perbarui status tugas (completed)
        handlePatchRequest($requestData);
        break;
        
    case 'DELETE':
        // DELETE: Hapus tugas
        handleDeleteRequest();
        break;
        
    default:
        sendResponse(['success' => false, 'message' => 'Metode HTTP tidak didukung'], 405);
        break;
}

// Fungsi untuk menangani permintaan GET (Read)
function handleGetRequest() {
    global $pdo;
    
    // Cek apakah ID tugas diberikan
    if (isset($_GET['id'])) {
        $id = $_GET['id'];
        
        try {
            $stmt = $pdo->prepare('SELECT * FROM tasks WHERE id = ?');
            $stmt->execute([$id]);
            $task = $stmt->fetch();
            
            if ($task) {
                sendResponse(['success' => true, 'task' => $task]);
            } else {
                sendResponse(['success' => false, 'message' => 'Tugas tidak ditemukan'], 404);
            }
        } catch (PDOException $e) {
            sendResponse(['success' => false, 'message' => 'Error: ' . $e->getMessage()], 500);
        }
    } else {
        // Ambil semua tugas
        try {
            $stmt = $pdo->query('SELECT * FROM tasks ORDER BY 
                                CASE WHEN completed = 1 THEN 1 ELSE 0 END,
                                CASE priority
                                    WHEN "high" THEN 1
                                    WHEN "medium" THEN 2
                                    WHEN "low" THEN 3
                                END,
                                CASE 
                                    WHEN due_date IS NULL THEN 1
                                    ELSE 0
                                END,
                                due_date ASC,
                                created_at DESC');
            $tasks = $stmt->fetchAll();
            
            sendResponse(['success' => true, 'tasks' => $tasks]);
        } catch (PDOException $e) {
            sendResponse(['success' => false, 'message' => 'Error: ' . $e->getMessage()], 500);
        }
    }
}

// Fungsi untuk menangani permintaan POST (Create)
function handlePostRequest($data) {
    global $pdo;
    
    // Validasi data
    if (empty($data['title'])) {
        sendResponse(['success' => false, 'message' => 'Judul tugas diperlukan'], 400);
        return;
    }
    
    // Set nilai default untuk field opsional
    $description = $data['description'] ?? '';
    $priority = in_array($data['priority'], ['low', 'medium', 'high']) ? $data['priority'] : 'medium';
    $dueDate = (!empty($data['due_date'])) ? $data['due_date'] : null;
    
    try {
        $stmt = $pdo->prepare('INSERT INTO tasks (title, description, priority, due_date, completed, created_at) 
                              VALUES (?, ?, ?, ?, 0, NOW())');
        $stmt->execute([$data['title'], $description, $priority, $dueDate]);
        
        $newTaskId = $pdo->lastInsertId();
        
        sendResponse([
            'success' => true, 
            'message' => 'Tugas berhasil ditambahkan',
            'task_id' => $newTaskId
        ]);
    } catch (PDOException $e) {
        sendResponse(['success' => false, 'message' => 'Error: ' . $e->getMessage()], 500);
    }
}

// Fungsi untuk menangani permintaan PUT (Update)
function handlePutRequest($data) {
    global $pdo;
    
    // Validasi data
    if (empty($data['id']) || empty($data['title'])) {
        sendResponse(['success' => false, 'message' => 'ID dan judul tugas diperlukan'], 400);
        return;
    }
    
    // Set nilai default untuk field opsional
    $description = $data['description'] ?? '';
    $priority = in_array($data['priority'], ['low', 'medium', 'high']) ? $data['priority'] : 'medium';
    $dueDate = (!empty($data['due_date'])) ? $data['due_date'] : null;
    
    try {
        $stmt = $pdo->prepare('UPDATE tasks 
                              SET title = ?, description = ?, priority = ?, due_date = ?, updated_at = NOW()
                              WHERE id = ?');
        $stmt->execute([$data['title'], $description, $priority, $dueDate, $data['id']]);
        
        if ($stmt->rowCount() > 0) {
            sendResponse(['success' => true, 'message' => 'Tugas berhasil diperbarui']);
        } else {
            sendResponse(['success' => false, 'message' => 'Tugas tidak ditemukan'], 404);
        }
    } catch (PDOException $e) {
        sendResponse(['success' => false, 'message' => 'Error: ' . $e->getMessage()], 500);
    }
}

// Fungsi untuk menangani permintaan PATCH (Update Status)
function handlePatchRequest($data) {
    global $pdo;
    
    // Validasi data
    if (empty($data['id']) || !isset($data['completed'])) {
        sendResponse(['success' => false, 'message' => 'ID dan status completed diperlukan'], 400);
        return;
    }
    
    $completed = $data['completed'] ? 1 : 0;
    
    try {
        $stmt = $pdo->prepare('UPDATE tasks SET completed = ?, updated_at = NOW() WHERE id = ?');
        $stmt->execute([$completed, $data['id']]);
        
        if ($stmt->rowCount() > 0) {
            sendResponse(['success' => true, 'message' => 'Status tugas berhasil diperbarui']);
        } else {
            sendResponse(['success' => false, 'message' => 'Tugas tidak ditemukan'], 404);
        }
    } catch (PDOException $e) {
        sendResponse(['success' => false, 'message' => 'Error: ' . $e->getMessage()], 500);
    }
}

// Fungsi untuk menangani permintaan DELETE
function handleDeleteRequest() {
    global $pdo;
    
    // Validasi data
    if (empty($_GET['id'])) {
        sendResponse(['success' => false, 'message' => 'ID tugas diperlukan'], 400);
        return;
    }
    
    $id = $_GET['id'];
    
    try {
        $stmt = $pdo->prepare('DELETE FROM tasks WHERE id = ?');
        $stmt->execute([$id]);
        
        if ($stmt->rowCount() > 0) {
            sendResponse(['success' => true, 'message' => 'Tugas berhasil dihapus']);
        } else {
            sendResponse(['success' => false, 'message' => 'Tugas tidak ditemukan'], 404);
        }
    } catch (PDOException $e) {
        sendResponse(['success' => false, 'message' => 'Error: ' . $e->getMessage()], 500);
    }
}

// Fungsi untuk mengirim respons JSON
function sendResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit;
}
?>