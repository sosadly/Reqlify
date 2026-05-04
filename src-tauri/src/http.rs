use std::time::Instant;

use reqwest::Method;
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
pub struct HttpRequestInput {
    pub method: String,
    pub url: String,
    #[serde(default)]
    pub headers: Vec<(String, String)>,
    #[serde(default)]
    pub query: Vec<(String, String)>,
    pub body: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct HttpResponseOutput {
    pub status: u16,
    pub status_text: String,
    pub headers: Vec<(String, String)>,
    pub body: String,
    /// Total time in milliseconds, including connect + transfer.
    pub time_ms: u128,
    /// Size of the response body in bytes.
    pub size_bytes: usize,
}

/// Performs a single HTTP request and returns the full response.
///
/// We do this from Rust rather than the webview's `fetch` so that requests
/// aren't subject to CORS — that's the whole reason a desktop API client
/// exists in the first place.
#[tauri::command]
pub async fn send_http_request(input: HttpRequestInput) -> Result<HttpResponseOutput, String> {
    let method = Method::from_bytes(input.method.to_uppercase().as_bytes())
        .map_err(|e| format!("invalid HTTP method: {e}"))?;

    let client = reqwest::Client::builder()
        .user_agent(concat!("Reqlify/", env!("CARGO_PKG_VERSION")))
        .build()
        .map_err(|e| format!("failed to build HTTP client: {e}"))?;

    let mut req = client.request(method, &input.url);

    if !input.query.is_empty() {
        req = req.query(&input.query);
    }

    for (name, value) in &input.headers {
        if name.trim().is_empty() {
            continue;
        }
        req = req.header(name, value);
    }

    if let Some(body) = input.body {
        if !body.is_empty() {
            req = req.body(body);
        }
    }

    let started = Instant::now();
    let resp = req.send().await.map_err(|e| e.to_string())?;

    let status = resp.status();
    let status_text = status
        .canonical_reason()
        .unwrap_or("")
        .to_string();

    let headers = resp
        .headers()
        .iter()
        .map(|(k, v)| {
            (
                k.as_str().to_string(),
                v.to_str().unwrap_or("").to_string(),
            )
        })
        .collect();

    let bytes = resp.bytes().await.map_err(|e| e.to_string())?;
    let elapsed = started.elapsed().as_millis();
    let size = bytes.len();
    let body = String::from_utf8_lossy(&bytes).into_owned();

    Ok(HttpResponseOutput {
        status: status.as_u16(),
        status_text,
        headers,
        body,
        time_ms: elapsed,
        size_bytes: size,
    })
}
