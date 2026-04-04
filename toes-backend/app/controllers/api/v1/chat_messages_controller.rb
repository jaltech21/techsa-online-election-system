module Api
  module V1
    class ChatMessagesController < BaseController
      before_action :authenticate_user!, only: [:create]

      def index
        election = Election.find(params[:election_id])
        messages = election.chat_messages.order(created_at: :asc).last(100)
        render json: messages.map { |m|
          {
            id: m.id,
            body: m.body,
            sender: m.user_type == "AdminUser" ? "Admin" : m.user&.name,
            created_at: m.created_at
          }
        }
      end

      def create
        election = Election.find(params[:election_id])
        raw_body = params[:body].to_s.strip

        if raw_body.blank?
          return render json: { error: 'Message cannot be blank.' }, status: :unprocessable_entity
        end

        if raw_body.length > 500
          return render json: { error: 'Message is too long (max 500 characters).' }, status: :unprocessable_entity
        end

        msg = election.chat_messages.build(
          body: raw_body,
          user: @current_user
        )

        if msg.save
          ActionCable.server.broadcast(
            "chat_#{election.id}",
            {
              id: msg.id,
              body: msg.body,
              sender: @current_user.name,
              created_at: msg.created_at
            }
          )
          render json: msg, status: :created
        else
          render json: { errors: msg.errors.full_messages }, status: :unprocessable_entity
        end
      end
    end
  end
end
