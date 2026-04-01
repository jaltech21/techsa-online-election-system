module Api
  module V1
    class VoterKeysController < BaseController
      def verify
        key = VoterKey.find_by(token: params[:token])
        return render json: { error: "Invalid voter key" }, status: :not_found unless key
        return render json: { error: "Voter key already used" }, status: :unprocessable_entity if key.used?

        render json: { valid: true }
      end
    end
  end
end
