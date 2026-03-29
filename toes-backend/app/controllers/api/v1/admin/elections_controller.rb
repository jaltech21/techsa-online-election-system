module Api
  module V1
    module Admin
      class ElectionsController < BaseController
        def index
          elections = Election.order(created_at: :desc)
          vote_counts = Vote.group(:election_id).count
          total_voters = User.count
          render json: elections.map { |e|
            e.as_json.merge(
              votes_cast:   vote_counts[e.id] || 0,
              total_voters: total_voters
            )
          }
        end

        def show
          render json: election
        end

        def create
          e = Election.new(election_params)
          if e.save
            render json: e, status: :created
          else
            render json: { errors: e.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def update
          if election.update(election_params)
            render json: election
          else
            render json: { errors: election.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def toggle_status
          case election.status
          when "draft"   then election.open!
          when "open"    then election.closed!
          when "closed"  then election.draft!
          end
          render json: election
        end

        def analytics
          e = election
          votes = e.votes.includes(:candidate)
          tally = votes.group(:candidate_id).count

          candidates = e.candidates.map do |c|
            { id: c.id, name: c.name, position: c.position, votes: tally[c.id] || 0 }
          end

          render json: {
            election_id: e.id,
            total_voters: User.count,
            votes_cast: votes.count,
            turnout_percent: User.count.zero? ? 0 : (votes.count.to_f / User.count * 100).round(2),
            candidates: candidates
          }
        end

        private

        def election
          @election ||= Election.find(params[:id])
        end

        def election_params
          params.permit(:title, :description, :status, :starts_at, :ends_at)
        end
      end
    end
  end
end
