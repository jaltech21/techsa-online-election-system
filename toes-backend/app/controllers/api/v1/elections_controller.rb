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
          data[:results] = election.candidates.map do |c|
            { id: c.id, name: c.name, position: c.position, votes: tally[c.id] || 0 }
          end
        end

        render json: data
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Election not found" }, status: :not_found
      end
    end
  end
end
