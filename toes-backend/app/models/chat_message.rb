class ChatMessage < ApplicationRecord
  belongs_to :election
  belongs_to :user, polymorphic: true

  validates :body, presence: true
  validates :user, :election, presence: true

  # Sanitize message body to prevent XSS when broadcasting
  before_save :sanitize_body

  private

  def sanitize_body
    self.body = ActionController::Base.helpers.strip_tags(body)
  end
end
