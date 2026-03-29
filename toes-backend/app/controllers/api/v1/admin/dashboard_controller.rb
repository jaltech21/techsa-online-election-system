module Api
  module V1
    module Admin
      class DashboardController < BaseController
        def index
          render json: {
            total_voters:      User.count,
            active_elections:  Election.where(status: :open).count,
            keys_sold:         RegistrationKey.where(used: true).count,
            vote_velocity:     Vote.where("created_at > ?", 10.minutes.ago).count,
            pending_questions: Question.where(answered: false).count,
            total_candidates:  Candidate.count,
          }
        end
      end
    end
  end
end
