module Api
  module V1
    class CandidatesController < BaseController
      before_action :authenticate_user!, only: [:register, :me, :update_me]

      def index
        election = Election.find(params[:election_id])
        candidates = election.candidates.includes(:questions, photo_attachment: :blob)
        render json: candidates_json(candidates)
      end

      def show
        render json: candidate_json(candidate)
      end

      def verify_key
        key = RegistrationKey.find_by(token: params[:token])
        return render json: { error: "Invalid registration key" }, status: :not_found unless key
        return render json: { error: "Registration key already used" }, status: :unprocessable_entity if key.used?

        election = key.election
        render json: {
          valid: true,
          election_id: election.id,
          election_title: election.title,
          election_status: election.status
        }
      end

      def register
        return render json: { error: "You are already registered as a candidate" }, status: :unprocessable_entity if @current_user.candidate.present?

        key = RegistrationKey.find_by(token: params[:token])

        return render json: { error: "Invalid registration key" }, status: :unauthorized unless key
        return render json: { error: "Registration key already used" }, status: :unprocessable_entity if key.used?

        election = key.election
        return render json: { error: "Election is not accepting registrations" }, status: :forbidden if election.open? || election.closed?

        candidate = election.candidates.build(candidate_params)
        candidate.registration_key = key
        candidate.user = @current_user

        ActiveRecord::Base.transaction do
          candidate.save!
          key.claim!(candidate)

          attach_photo(candidate) if params[:photo].present?
        end

        render json: candidate_json(candidate), status: :created
      rescue ActiveRecord::RecordInvalid => e
        render json: { errors: e.record.errors.full_messages }, status: :unprocessable_entity
      end

      def me
        c = @current_user.candidate
        return render json: { error: "Not registered as a candidate" }, status: :not_found unless c

        render json: candidate_json(c)
      end

      def update_me
        c = @current_user.candidate
        return render json: { error: "Not registered as a candidate" }, status: :not_found unless c

        ActiveRecord::Base.transaction do
          c.update!(update_candidate_params)
          attach_photo(c) if params[:photo].present?
        end

        render json: candidate_json(c)
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

      def update_candidate_params
        params.permit(:bio, :manifesto, :video_url)
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
          answered_count: c.questions.count(&:answered),
          pending_questions: c.questions.where(answered: false).count
        }
      end
    end
  end
end
