class RegistrationKey < ApplicationRecord
  belongs_to :election
  has_one :candidate

  validates :token, presence: true, uniqueness: true
  validates :election, presence: true

  before_validation :generate_token, on: :create

  scope :unused, -> { where(used: false) }
  scope :used, -> { where(used: true) }

  def claim!(candidate)
    update!(used: true, candidate_id: candidate.id)
  end

  private

  def generate_token
    self.token ||= SecureRandom.hex(16)
  end
end
