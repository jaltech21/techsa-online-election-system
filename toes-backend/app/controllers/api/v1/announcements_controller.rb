module Api
  module V1
    class AnnouncementsController < BaseController
      # GET /api/v1/announcements
      # Returns latest 30 announcements (global + per election if given)
      def index
        announcements = Announcement.recent.limit(30)
        render json: announcements.map { |a|
          {
            id:          a.id,
            title:       a.title,
            body:        a.body,
            election_id: a.election_id,
            posted_by:   a.admin_user&.name || 'TECHSA Admin',
            created_at:  a.created_at
          }
        }
      end
    end
  end
end
