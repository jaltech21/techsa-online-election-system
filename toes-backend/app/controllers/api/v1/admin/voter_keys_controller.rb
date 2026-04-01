module Api
  module V1
    module Admin
      class VoterKeysController < BaseController
        def index
          keys = VoterKey.order(created_at: :desc)
          render json: keys.map { |k|
            {
              id: k.id,
              token: k.token,
              used: k.used,
              user_id: k.user_id,
              membership_ref: k.membership_ref,
              created_at: k.created_at
            }
          }
        end

        def generate
          count = (params[:count] || 1).to_i.clamp(1, 200)
          membership_refs = Array(params[:membership_refs])

          keys = count.times.map.with_index do |_, i|
            VoterKey.create!(membership_ref: membership_refs[i].presence)
          end

          render json: keys.map { |k| { id: k.id, token: k.token, membership_ref: k.membership_ref } },
                 status: :created
        end
      end
    end
  end
end
