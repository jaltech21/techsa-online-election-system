module Api
  module V1
    class ElectionsController < BaseController
      def index
        elections = Election.where.not(status: :draft).order(created_at: :desc)
        render json: elections
      end

      def show
        election = Election.where.not(status: :draft).find(params[:id])
        data = election.as_json

        # Include results only if election is closed
        if election.closed?
          tally = election.votes.group(:candidate_id).count
          data[:results] = election.candidates.includes(:questions).map do |c|
            { id: c.id, name: c.name, position: c.position, votes: tally[c.id] || 0, answered_count: c.questions.count(&:answered) }
          end
        end

        render json: data
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Election not found" }, status: :not_found
      end

      def turnout
        election = Election.find(params[:id])
        votes_cast = election.votes.count
        total_voters = User.count
        render json: {
          votes_cast: votes_cast,
          total_voters: total_voters,
          turnout_percent: total_voters.zero? ? 0 : (votes_cast.to_f / total_voters * 100).round(1)
        }
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Not found" }, status: :not_found
      end
    end
  end
end
