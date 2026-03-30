module Api
  module V1
    class CandidatesController < BaseController
      before_action :authenticate_user!, only: []

      def index
        election = Election.find(params[:election_id])
        candidates = election.candidates.includes(:questions, photo_attachment: :blob)
        render json: candidates_json(candidates)
      end

      def show
        render json: candidate_json(candidate)
      end

      def register
        key = RegistrationKey.find_by(token: params[:token])

        return render json: { error: "Invalid registration key" }, status: :unauthorized unless key
        return render json: { error: "Registration key already used" }, status: :unprocessable_entity if key.used?

        election = key.election
        return render json: { error: "Election is not accepting registrations" }, status: :forbidden if election.open? || election.closed?

        candidate = election.candidates.build(candidate_params)
        candidate.registration_key = key

        ActiveRecord::Base.transaction do
          candidate.save!
          key.claim!(candidate)

          attach_photo(candidate) if params[:photo].present?
        end

        render json: candidate_json(candidate), status: :created
      rescue ActiveRecord::RecordInvalid => e
        render json: { errors: e.record.errors.full_messages }, status: :unprocessable_entity
      end

      private

      def candidate
        @candidate ||= Candidate.find(params[:id])
      end

      def candidate_params
        params.permit(:name, :position, :bio, :manifesto, :video_url)
      end

      def attach_photo(candidate)
        candidate.photo.attach(params[:photo])
      end

      def candidates_json(candidates)
        candidates.map { |c| candidate_json(c) }
      end

      def candidate_json(c)
        {
          id: c.id,
          name: c.name,
          position: c.position,
          bio: c.bio,
          manifesto: c.manifesto,
          video_url: c.video_url,
          election_id: c.election_id,
          photo_url: c.photo.attached? ? url_for(c.photo) : nil,
          answered_count: c.questions.count(&:answered)
        }
      end
    end
  end
end
