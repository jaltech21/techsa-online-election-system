module Api
  module V1
    class QuestionsController < BaseController
      before_action :authenticate_user!, only: [:create]

      def index
        candidate = Candidate.find(params[:candidate_id])
        questions = candidate.questions.order(pinned: :desc, created_at: :desc)
        render json: questions.map { |q|
          {
            id: q.id,
            body: q.body,
            answered: q.answered,
            answer: q.answered ? q.answer : nil,
            pinned: q.pinned || false,
            created_at: q.created_at
          }
        }
      end

      def create
        candidate = Candidate.find(params[:candidate_id])
        question = candidate.questions.build(body: params[:body], student: @current_user)

        if question.save
          render json: question, status: :created
        else
          render json: { errors: question.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def answer
        authenticate_admin!
        return if performed?

        question = Question.find(params[:id])
        if question.update(answer: params[:answer], answered: true)
          render json: question
        else
          render json: { errors: question.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def answer_as_candidate
        authenticate_user!
        return if performed?

        question = Question.find(params[:id])
        return render json: { error: "Unauthorized" }, status: :forbidden unless question.candidate.user_id == @current_user.id

        if question.update(answer: params[:answer], answered: true)
          render json: { id: question.id, answered: question.answered, answer: question.answer }
        else
          render json: { errors: question.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def pin
        authenticate_admin!
        return if performed?

        question = Question.find(params[:id])
        question.update!(pinned: !question.pinned?)
        render json: { id: question.id, pinned: question.pinned }
      end
    end
  end
end
