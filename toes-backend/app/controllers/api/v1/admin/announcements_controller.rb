module Api
  module V1
    module Admin
      class AnnouncementsController < BaseController
        def index
          announcements = Announcement.recent.limit(50)
          render json: render_list(announcements)
        end

        def create
          announcement = Announcement.new(announcement_params)
          announcement.admin_user = @current_admin

          if announcement.save
            # Broadcast to all voters via ActionCable
            ActionCable.server.broadcast(
              'announcements',
              serialize(announcement)
            )
            render json: serialize(announcement), status: :created
          else
            render json: { errors: announcement.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def destroy
          announcement = Announcement.find(params[:id])
          announcement.destroy
          head :no_content
        end

        private

        def announcement_params
          params.require(:announcement).permit(:title, :body, :election_id)
        end

        def render_list(list)
          list.map { |a| serialize(a) }
        end

        def serialize(a)
          {
            id:           a.id,
            title:        a.title,
            body:         a.body,
            election_id:  a.election_id,
            posted_by:    a.admin_user&.name || 'TECHSA Admin',
            created_at:   a.created_at
          }
        end
      end
    end
  end
end
