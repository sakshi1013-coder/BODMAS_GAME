<?php
/**
 * BODMAS Battle — API Backend
 * Handles leaderboard score storage and retrieval
 * 
 * Endpoints:
 *   GET  ?action=get_scores         → Get all scores
 *   GET  ?action=get_scores&mode=X  → Get scores filtered by mode
 *   POST { action: "save_score", name, score, mode, level, time } → Save a score
 *   POST { action: "reset_scores" } → Reset all scores
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Score storage file
$SCORES_FILE = __DIR__ . '/leaderboard.json';

// Initialize file if it doesn't exist
if (!file_exists($SCORES_FILE)) {
    file_put_contents($SCORES_FILE, json_encode([]));
}

/**
 * Read all scores from file
 */
function getScores($file) {
    $content = file_get_contents($file);
    $scores = json_decode($content, true);
    return is_array($scores) ? $scores : [];
}

/**
 * Write scores to file
 */
function saveScores($file, $scores) {
    // Keep only top 100 scores per mode
    usort($scores, function($a, $b) {
        return $b['score'] - $a['score'];
    });
    
    // Limit total entries
    if (count($scores) > 300) {
        $scores = array_slice($scores, 0, 300);
    }
    
    file_put_contents($file, json_encode($scores, JSON_PRETTY_PRINT));
    return $scores;
}

/**
 * Sanitize string input
 */
function sanitize($str, $maxLen = 50) {
    $str = trim($str);
    $str = htmlspecialchars($str, ENT_QUOTES, 'UTF-8');
    $str = substr($str, 0, $maxLen);
    return $str;
}

// ==========================================
// HANDLE REQUESTS
// ==========================================

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $action = isset($_GET['action']) ? $_GET['action'] : '';
        
        if ($action === 'get_scores') {
            $scores = getScores($SCORES_FILE);
            
            // Filter by mode if specified
            $mode = isset($_GET['mode']) ? sanitize($_GET['mode']) : '';
            if ($mode && in_array($mode, ['busjam', 'solve', 'arrange'])) {
                $scores = array_values(array_filter($scores, function($s) use ($mode) {
                    return $s['mode'] === $mode;
                }));
            }
            
            // Sort by score descending
            usort($scores, function($a, $b) {
                return $b['score'] - $a['score'];
            });
            
            echo json_encode([
                'success' => true,
                'scores' => $scores,
                'count' => count($scores)
            ]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Invalid action']);
        }
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Read JSON body
        $body = json_decode(file_get_contents('php://input'), true);
        
        if (!$body || !isset($body['action'])) {
            echo json_encode(['success' => false, 'error' => 'Invalid request body']);
            exit();
        }
        
        $action = $body['action'];
        
        if ($action === 'save_score') {
            // Validate required fields
            $required = ['name', 'score', 'mode'];
            foreach ($required as $field) {
                if (!isset($body[$field])) {
                    echo json_encode(['success' => false, 'error' => "Missing field: $field"]);
                    exit();
                }
            }
            
            // Validate mode
            $validModes = ['busjam', 'solve', 'arrange'];
            if (!in_array($body['mode'], $validModes)) {
                echo json_encode(['success' => false, 'error' => 'Invalid game mode']);
                exit();
            }
            
            $scores = getScores($SCORES_FILE);
            
            $entry = [
                'name'  => sanitize($body['name'], 20),
                'score' => intval($body['score']),
                'mode'  => sanitize($body['mode'], 10),
                'level' => isset($body['level']) ? intval($body['level']) : 1,
                'time'  => isset($body['time']) ? intval($body['time']) : 0,
                'date'  => date('Y-m-d H:i:s')
            ];
            
            $scores[] = $entry;
            $scores = saveScores($SCORES_FILE, $scores);
            
            echo json_encode([
                'success' => true,
                'message' => 'Score saved successfully',
                'entry' => $entry,
                'scores' => $scores
            ]);
            
        } elseif ($action === 'reset_scores') {
            file_put_contents($SCORES_FILE, json_encode([]));
            
            echo json_encode([
                'success' => true,
                'message' => 'Leaderboard has been reset'
            ]);
            
        } else {
            echo json_encode(['success' => false, 'error' => 'Unknown action']);
        }
        
    } else {
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Server error: ' . $e->getMessage()
    ]);
}
?>
