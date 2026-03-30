class Announcement < ApplicationRecord
  belongs_to :election, optional: true
  belongs_to :admin_user

  validates :title, presence: true
  validates :body,  presence: true

  scope :recent, -> { order(created_at: :desc) }
  scope :global, -> { where(election_id: nil) }
  scope :for_election, ->(id) { where(election_id: id) }
end
