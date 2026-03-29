module Api
  module V1
    class VotesController < BaseController
      before_action :authenticate_user!

      def create
        election = Election.find(params[:election_id])

        return render json: { error: "Election is not open" }, status: :forbidden unless election.open?
        return render json: { error: "You have already voted in this election" }, status: :unprocessable_entity if @current_user.has_voted?

        candidate = election.candidates.find(params[:candidate_id])

        ActiveRecord::Base.transaction do
          Vote.create!(voter: @current_user, candidate: candidate, election: election)
          @current_user.update!(has_voted: true)

          # Broadcast live analytics update to admin dashboard
          ActionCable.server.broadcast(
            "analytics_#{election.id}",
            { votes_cast: election.votes.count }
          )
        end

        render json: { message: "Vote recorded successfully" }, status: :created
      rescue ActiveRecord::RecordNotUnique, ActiveRecord::RecordInvalid => e
        render json: { error: "Could not record vote: #{e.message}" }, status: :unprocessable_entity
      end
    end
  end
end
