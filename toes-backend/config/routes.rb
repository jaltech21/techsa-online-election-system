Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  # ActionCable mount
  mount ActionCable.server => "/cable"

  namespace :api do
    namespace :v1 do
      # Student auth
      post "auth/login",    to: "auth#login"
      post "auth/register", to: "auth#register"
      get  "auth/me",       to: "auth#me"

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

      # Candidate self-registration (with key)
      post "candidates/register", to: "candidates#register"
      # Individual candidate view
      get  "candidates/:id",      to: "candidates#show", as: :candidate

      # Announcements (public read)
      resources :announcements, only: [:index]

      # Q&A
      resources :candidates, only: [] do
        resources :questions, only: [:index, :create]
      end
      patch "questions/:id/answer", to: "questions#answer", as: :answer_question
      patch "questions/:id/pin",    to: "questions#pin",    as: :pin_question

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
      end
    end
  end
end
