class ChatMessage < ApplicationRecord
  belongs_to :election
  belongs_to :user, polymorphic: true

  validates :body, presence: true, length: { maximum: 500 }
  validates :user, :election, presence: true

  # Sanitize message body to prevent XSS when broadcasting
  before_validation :sanitize_body

  private

  def sanitize_body
    self.body = ActionController::Base.helpers.strip_tags(body.to_s).strip
  end
end
