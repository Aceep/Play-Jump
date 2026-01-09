use axum::{
    routing::{get, post},
    Router, Json,
    http::StatusCode,
    extract::{Request, State},
};
use tower_http::cors::{CorsLayer, Any};
use serde::{Deserialize, Serialize};
use std::{collections::HashMap, net::SocketAddr, sync::Arc};
use tokio::sync::RwLock;
use uuid::Uuid;
use chrono::{Utc, Duration};
use jsonwebtoken::{encode, decode, Header, Validation, EncodingKey, DecodingKey};
use bcrypt::{hash, verify, DEFAULT_COST};

// JWT secret (in production, use env var)
const JWT_SECRET: &[u8] = b"super-secret-jwt-key-change-in-production";

// In-memory user storage (in production, use database)
type UserStore = Arc<RwLock<HashMap<String, StoredUser>>>;

#[derive(Debug, Clone)]
struct StoredUser {
    id: String,
    email: String,
    password_hash: String,
    created_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct User {
    id: String,
    email: Option<String>,
    is_guest: bool,
    created_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    sub: String,
    email: Option<String>,
    exp: usize,
    is_guest: bool,
}

#[derive(Serialize)]
struct AuthResponse {
    token: String,
    user: User,
}

#[derive(Deserialize)]
struct RegisterRequest {
    email: String,
    password: String,
}

#[derive(Deserialize)]
struct LoginRequest {
    email: String,
    password: String,
}

#[derive(Serialize)]
struct ErrorResponse {
    error: String,
}

#[derive(Serialize)]
struct Health {
    status: &'static str,
    message: &'static str,
}

#[tokio::main]
async fn main() {
    println!("Starting Gane Backend...");

    // In-memory user store
    let users: UserStore = Arc::new(RwLock::new(HashMap::new()));

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/health", get(health_check))
        .route("/api/status", get(api_status))
        .route("/api/auth/register", post(register))
        .route("/api/auth/login", post(login))
        .route("/api/auth/guest", post(login_as_guest))
        .route("/api/auth/me", get(get_current_user))
        .route("/api/auth/logout", post(logout))
        .layer(cors)
        .with_state(users);

    let addr = SocketAddr::from(([0, 0, 0, 0], 8080));
    println!("Server listening on http://{}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn health_check() -> &'static str {
    "OK"
}

async fn api_status() -> Json<Health> {
    Json(Health {
        status: "ok",
        message: "Gane backend is running",
    })
}

// Register new user
async fn register(
    State(users): State<UserStore>,
    Json(req): Json<RegisterRequest>,
) -> Result<Json<AuthResponse>, (StatusCode, Json<ErrorResponse>)> {
    // Validate input
    if req.email.is_empty() || !req.email.contains('@') {
        return Err((StatusCode::BAD_REQUEST, Json(ErrorResponse {
            error: "Invalid email address".to_string(),
        })));
    }
    if req.password.len() < 6 {
        return Err((StatusCode::BAD_REQUEST, Json(ErrorResponse {
            error: "Password must be at least 6 characters".to_string(),
        })));
    }

    // Check if email exists
    {
        let store = users.read().await;
        if store.values().any(|u| u.email == req.email) {
            return Err((StatusCode::CONFLICT, Json(ErrorResponse {
                error: "Email already registered".to_string(),
            })));
        }
    }

    // Hash password with bcrypt
    let password_hash = hash(req.password.as_bytes(), DEFAULT_COST)
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, Json(ErrorResponse {
            error: "Failed to hash password".to_string(),
        })))?;

    // Create user
    let user_id = Uuid::new_v4().to_string();
    let now = Utc::now();
    
    let stored_user = StoredUser {
        id: user_id.clone(),
        email: req.email.clone(),
        password_hash,
        created_at: now.to_rfc3339(),
    };

    // Store user
    {
        let mut store = users.write().await;
        store.insert(user_id.clone(), stored_user);
    }

    let user = User {
        id: user_id.clone(),
        email: Some(req.email.clone()),
        is_guest: false,
        created_at: now.to_rfc3339(),
    };

    // Create token (7 days for registered users)
    let token = create_token(&user_id, Some(&req.email), false, 24 * 7)?;

    println!("User registered: {}", req.email);

    Ok(Json(AuthResponse { token, user }))
}

// Login existing user
async fn login(
    State(users): State<UserStore>,
    Json(req): Json<LoginRequest>,
) -> Result<Json<AuthResponse>, (StatusCode, Json<ErrorResponse>)> {
    let store = users.read().await;
    
    // Find user by email
    let stored_user = store
        .values()
        .find(|u| u.email == req.email)
        .ok_or_else(|| (StatusCode::UNAUTHORIZED, Json(ErrorResponse {
            error: "Invalid email or password".to_string(),
        })))?;

    // Verify password with bcrypt
    let valid = verify(&req.password, &stored_user.password_hash)
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, Json(ErrorResponse {
            error: "Internal error".to_string(),
        })))?;

    if !valid {
        return Err((StatusCode::UNAUTHORIZED, Json(ErrorResponse {
            error: "Invalid email or password".to_string(),
        })));
    }

    let user = User {
        id: stored_user.id.clone(),
        email: Some(stored_user.email.clone()),
        is_guest: false,
        created_at: stored_user.created_at.clone(),
    };

    // Create token
    let token = create_token(&stored_user.id, Some(&stored_user.email), false, 24 * 7)?;

    println!("User logged in: {}", req.email);

    Ok(Json(AuthResponse { token, user }))
}

// Create guest session
async fn login_as_guest() -> Result<Json<AuthResponse>, (StatusCode, Json<ErrorResponse>)> {
    let user_id = Uuid::new_v4().to_string();
    let now = Utc::now();
    
    let user = User {
        id: user_id.clone(),
        email: None,
        is_guest: true,
        created_at: now.to_rfc3339(),
    };

    let token = create_token(&user_id, None, true, 24)?;

    println!("Guest user created: {}", user.id);

    Ok(Json(AuthResponse { token, user }))
}

// Get current user from token
async fn get_current_user(request: Request) -> Result<Json<User>, StatusCode> {
    let claims = extract_claims(&request)?;

    let user = User {
        id: claims.sub,
        email: claims.email,
        is_guest: claims.is_guest,
        created_at: Utc::now().to_rfc3339(),
    };

    Ok(Json(user))
}

// Logout
async fn logout() -> StatusCode {
    StatusCode::OK
}

// Helper: Create JWT token
fn create_token(
    user_id: &str,
    email: Option<&str>,
    is_guest: bool,
    hours: i64,
) -> Result<String, (StatusCode, Json<ErrorResponse>)> {
    let expiration = Utc::now() + Duration::hours(hours);
    let claims = Claims {
        sub: user_id.to_string(),
        email: email.map(|s| s.to_string()),
        exp: expiration.timestamp() as usize,
        is_guest,
    };

    encode(&Header::default(), &claims, &EncodingKey::from_secret(JWT_SECRET))
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, Json(ErrorResponse {
            error: "Failed to create token".to_string(),
        })))
}

// Helper: Extract claims from request
fn extract_claims(request: &Request) -> Result<Claims, StatusCode> {
    let auth_header = request
        .headers()
        .get("Authorization")
        .and_then(|v| v.to_str().ok())
        .ok_or(StatusCode::UNAUTHORIZED)?;

    let token = auth_header
        .strip_prefix("Bearer ")
        .ok_or(StatusCode::UNAUTHORIZED)?;

    let token_data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(JWT_SECRET),
        &Validation::default(),
    ).map_err(|_| StatusCode::UNAUTHORIZED)?;

    Ok(token_data.claims)
}
