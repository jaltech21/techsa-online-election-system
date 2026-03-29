module Api
  module V1
    class QuestionsController < BaseController
      before_action :authenticate_user!, only: [:create]

      def index
        candidate = Candidate.find(params[:candidate_id])
        questions = candidate.questions.order(created_at: :desc)
        render json: questions.map { |q|
          {
            id: q.id,
            body: q.body,
            answered: q.answered,
            answer: q.answered ? q.answer : nil,
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
    end
  end
end
