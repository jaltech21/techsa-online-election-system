Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  # ActionCable mount
  mount ActionCable.server => "/cable"

  namespace :api do
    namespace :v1 do
      # Student auth
      post  "auth/login",    to: "auth#login"
      post  "auth/register", to: "auth#register"
      get   "auth/me",       to: "auth#me"
      patch "auth/profile",  to: "auth#update_profile"
      patch "auth/password", to: "auth#update_password"

      # Public elections listing
      resources :elections, only: [:index, :show] do
        member do
          get :turnout
        end
        # Voting
        resources :votes, only: [:create]
        # Candidates within an election
        resources :candidates, only: [:index]
        # Chat
        resources :chat_messages, only: [:index, :create]
      end

      # Voter key verification (public)
      get "voter_keys/verify", to: "voter_keys#verify"

      # Candidate self-registration (with key) — must come before /candidates/:id
      get  "candidates/verify_key", to: "candidates#verify_key"
      post "candidates/register",  to: "candidates#register"
      # Candidate portal self-service (authenticated)
      get  "candidates/me",        to: "candidates#me"
      patch "candidates/me",       to: "candidates#update_me"
      # Individual candidate view
      get  "candidates/:id",       to: "candidates#show", as: :candidate

      # Announcements (public read)
      resources :announcements, only: [:index]

      # Q&A
      resources :candidates, only: [] do
        resources :questions, only: [:index, :create]
      end
      patch "questions/:id/answer",        to: "questions#answer",            as: :answer_question
      patch "questions/:id/pin",           to: "questions#pin",               as: :pin_question
      patch "questions/:id/my_answer",     to: "questions#answer_as_candidate", as: :candidate_answer_question

      # Admin namespace
      namespace :admin do
        post "auth/login", to: "auth#login"

        get "dashboard", to: "dashboard#index"

        resources :elections, only: [:index, :show, :create, :update] do
          member do
            patch :toggle_status
            get   :analytics
          end
          resources :registration_keys, only: [:index] do
            collection do
              post :generate
            end
          end
        end

        # Announcements (admin write)
        resources :announcements, only: [:index, :create, :destroy]

        # Voter keys (admin manage)
        resources :voter_keys, only: [:index] do
          collection do
            post :generate
          end
        end
      end
    end
  end
end
