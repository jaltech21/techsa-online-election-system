module Api
  module V1
    module Admin
      class RegistrationKeysController < BaseController
        def index
          keys = election.registration_keys.order(created_at: :desc)
          render json: keys.map { |k|
            {
              id: k.id,
              token: k.token,
              used: k.used,
              candidate_id: k.candidate_id,
              created_at: k.created_at
            }
          }
        end

        def generate
          count = (params[:count] || 1).to_i.clamp(1, 100)
          keys = count.times.map { election.registration_keys.create! }
          render json: keys.map { |k| { id: k.id, token: k.token } }, status: :created
        end

        private

        def election
          @election ||= Election.find(params[:election_id])
        end
      end
    end
  end
end
