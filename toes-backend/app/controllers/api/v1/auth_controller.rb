# Student authentication
module Api
  module V1
    class AuthController < BaseController
      def login
        user = User.find_by(student_id: params[:student_id])

        if user&.authenticate(params[:password])
          token = encode_token({ user_id: user.id })
          render json: {
            token: token,
            user: {
              id: user.id,
              student_id: user.student_id,
              name: user.name,
              has_voted: user.has_voted
            }
          }
        else
          render json: { error: "Invalid student ID or password" }, status: :unauthorized
        end
      end

      def register
        user = User.new(student_params)
        if user.save
          token = encode_token({ user_id: user.id })
          render json: { token: token, user: { id: user.id, student_id: user.student_id, name: user.name } },
                 status: :created
        else
          render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def me
        authenticate_user!
        return if performed?
        render json: {
          id: @current_user.id,
          student_id: @current_user.student_id,
          name: @current_user.name,
          has_voted: @current_user.has_voted
        }
      end

      private

      def student_params
        params.permit(:student_id, :name, :email, :password, :password_confirmation)
      end
    end
  end
end
