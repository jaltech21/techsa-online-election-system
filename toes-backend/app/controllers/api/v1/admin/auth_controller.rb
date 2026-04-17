module Api
  module V1
    module Admin
      class AuthController < ApplicationController
        def login
          admin = AdminUser.find_by(username: params[:username]&.strip)

          if admin&.authenticate(params[:password]&.strip)
            token = encode_token({ admin_id: admin.id })
            render json: { token: token, admin: { id: admin.id, username: admin.username } }
          else
            render json: { error: "Invalid credentials" }, status: :unauthorized
          end
        end
      end
    end
  end
end
