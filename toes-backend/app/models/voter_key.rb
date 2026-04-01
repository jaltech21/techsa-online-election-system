class VoterKey < ApplicationRecord
  belongs_to :user, optional: true

  validates :token, presence: true, uniqueness: true

  before_validation :generate_token, on: :create

  scope :unused, -> { where(used: false) }
  scope :used,   -> { where(used: true) }

  def claim!(user)
    update!(used: true, user_id: user.id)
  end

  private

  def generate_token
    self.token ||= "VOTER-#{SecureRandom.hex(4).upcase}-#{SecureRandom.hex(4).upcase}"
  end
end
