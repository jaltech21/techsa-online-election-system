class Rack::Attack
  ### Throttle login attempts: 5 per minute per IP
  throttle("auth/login", limit: 5, period: 60) do |req|
    req.ip if req.path.end_with?("/auth/login") && req.post?
  end

  ### Throttle voting: 10 per minute per IP (extra safety)
  throttle("votes", limit: 10, period: 60) do |req|
    req.ip if req.path.include?("/votes") && req.post?
  end

  ### Throttle candidate registration
  throttle("candidates/register", limit: 10, period: 60) do |req|
    req.ip if req.path.end_with?("/candidates/register") && req.post?
  end

  # Return 429 JSON response
  self.throttled_responder = lambda do |env|
    [429, { "Content-Type" => "application/json" }, ['{"error":"Too many requests. Please slow down."}']]
  end
end
