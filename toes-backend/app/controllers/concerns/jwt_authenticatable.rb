module JwtAuthenticatable
  extend ActiveSupport::Concern

  SECRET = Rails.application.secret_key_base

  module ClassMethods
    def encode_token(payload, exp: 7.days.from_now)
      payload[:exp] = exp.to_i
      JWT.encode(payload, SECRET, "HS256")
    end
  end

  def encode_token(payload, exp: 7.days.from_now)
    self.class.encode_token(payload, exp: exp)
  end

  def decode_token(token)
    JWT.decode(token, SECRET, true, algorithm: "HS256").first
  rescue JWT::DecodeError
    nil
  end

  def authenticate_user!
    token = extract_token
    return render_unauthorized unless token

    decoded = decode_token(token)
    return render_unauthorized unless decoded&.dig("user_id")

    @current_user = User.find_by(id: decoded["user_id"])
    render_unauthorized unless @current_user
  end

  def authenticate_admin!
    token = extract_token
    return render_unauthorized unless token

    decoded = decode_token(token)
    return render_unauthorized unless decoded&.dig("admin_id")

    @current_admin = AdminUser.find_by(id: decoded["admin_id"])
    render_unauthorized unless @current_admin
  end

  private

  def extract_token
    header = request.headers["Authorization"]
    header&.split(" ")&.last
  end

  def render_unauthorized
    render json: { error: "Unauthorized" }, status: :unauthorized
  end
end
